// deck 解析与读写的单元测试：不联网、不依赖 open-slide 装没装。
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { Decks, parseDeckSource, slugify, starterSource } from '../src/decks.js'
import { Workspace } from '../src/workspace.js'

const TWO_PAGES = `import type { Page, SlideMeta } from '@open-slide/core';
const A: Page = () => <div style={{ width: '100%', height: '100%' }} />;
const B: Page = () => <div>A, B (逗号在字符串里)</div>;
export const meta: SlideMeta = { title: '两页测试', createdAt: '2026-05-16T12:00:00Z' };
export const notes: (string | undefined)[] = ['第一页', '第二页'];
export default [A, B] satisfies Page[];
`

async function tempWorkspace() {
  const root = await mkdtemp(join(tmpdir(), 'slides-wb-'))
  const workspace = new Workspace(root)
  await workspace.scaffold()
  return { root, workspace, decks: new Decks(workspace) }
}

test('slugify 只留 kebab-case', () => {
  assert.equal(slugify('Q2 Launch Plan'), 'q2-launch-plan')
  assert.equal(slugify('  Hello,   World!  '), 'hello-world')
  assert.equal(slugify('Q2 发布计划'), 'q2')
  assert.equal(slugify('中文'), '')
  assert.equal(slugify("It's fine"), 'its-fine')
})

test('starterSource 是合法 deck（一页 + 讲稿）', () => {
  const parsed = parseDeckSource(starterSource('季度复盘', '2026-05-16T12:00:00.000Z'))
  assert.equal(parsed.error, null)
  assert.equal(parsed.pages, 1)
  assert.equal(parsed.title, '季度复盘')
  assert.equal(parsed.notes, 1)
})

test('parseDeckSource 认得出页数、meta、notes、注释标记', () => {
  const source = TWO_PAGES.replace('const B', '// @slide-comment shrink this\nconst B')
  const parsed = parseDeckSource(source)
  assert.equal(parsed.error, null)
  assert.equal(parsed.pages, 2)
  assert.equal(parsed.title, '两页测试')
  assert.equal(parsed.createdAt, '2026-05-16T12:00:00Z')
  assert.equal(parsed.notes, 2)
  assert.equal(parsed.comments, 1)
  assert.deepEqual(parsed.warnings, [])
})

test('notes 和页数对不上会告警', () => {
  const parsed = parseDeckSource(TWO_PAGES.replace("['第一页', '第二页']", "['只有一条']"))
  assert.equal(parsed.notes, 1)
  assert.equal(parsed.pages, 2)
  assert.match(parsed.warnings.join('\n'), /没有对齐/)
})

test('没有默认导出时给出错误而不是瞎猜', () => {
  assert.match(parseDeckSource('export const meta = { title: "x" };').error, /export default/)
  assert.match(parseDeckSource('export default [] satisfies Page[];').error, /空/)
})

test('decks.create 建出可解析的 deck，重名自动加后缀', async () => {
  const { decks, workspace } = await tempWorkspace()
  try {
    const first = await decks.create('Q2 Launch')
    assert.equal(first.id, 'q2-launch')
    assert.equal(first.pages, 1)
    assert.equal(first.error, null)
    const second = await decks.create('Q2 Launch')
    assert.equal(second.id, 'q2-launch-2')
    const raw = await readFile(join(workspace.slidesDir, 'q2-launch', 'index.tsx'), 'utf8')
    assert.match(raw, /export default \[Cover\] satisfies Page\[\];/)
    assert.ok((await stat(join(workspace.slidesDir, 'q2-launch', 'assets'))).isDirectory())
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('decks.write 校验后覆盖写，坏源码不落盘', async () => {
  const { decks, workspace } = await tempWorkspace()
  try {
    await decks.create('Write Test')
    const result = await decks.write('write-test', TWO_PAGES)
    assert.equal(result.deck.pages, 2)
    assert.deepEqual(result.warnings, [])
    const written = await readFile(join(workspace.slidesDir, 'write-test', 'index.tsx'), 'utf8')
    assert.equal(written, TWO_PAGES)
    await assert.rejects(() => decks.write('write-test', 'export const nope = 1'), /export default/)
    const after = await readFile(join(workspace.slidesDir, 'write-test', 'index.tsx'), 'utf8')
    assert.equal(after, TWO_PAGES, '坏源码不应该覆盖原文件')
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('id 不合法 / 不存在的 deck 走 404，不会读到目录外', async () => {
  const { decks, workspace } = await tempWorkspace()
  try {
    await assert.rejects(() => decks.get('../etc'), err => err.status === 400)
    await assert.rejects(() => decks.get('not-there'), err => err.status === 404)
    assert.equal(decks.isValidId('ok-id-2'), true)
    assert.equal(decks.isValidId('Bad_Id'), false)
    assert.equal(decks.isValidId(''), false)
    assert.equal(decks.isValidId('a'.repeat(60)), false)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('decks.remove 移到 .trash，不真删', async () => {
  const { decks, workspace } = await tempWorkspace()
  try {
    await decks.create('Trash Me')
    const result = await decks.remove('trash-me')
    assert.equal(result.ok, true)
    assert.match(result.trash, /\.trash/)
    assert.equal(await decks.exists('trash-me'), false)
    const trashed = await readFile(join(result.trash, 'index.tsx'), 'utf8')
    assert.match(trashed, /Trash Me/)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('list 按更新时间倒序，跳过非 deck 目录', async () => {
  const { decks, workspace } = await tempWorkspace()
  try {
    await decks.create('Older')
    await new Promise(resolve => setTimeout(resolve, 12))
    await decks.create('Newer')
    await writeFile(join(workspace.slidesDir, 'not-a-deck', 'readme.txt'), 'x', 'utf8').catch(async () => {
      const { mkdir } = await import('node:fs/promises')
      await mkdir(join(workspace.slidesDir, 'not-a-deck'), { recursive: true })
      await writeFile(join(workspace.slidesDir, 'not-a-deck', 'readme.txt'), 'x', 'utf8')
    })
    const rows = await decks.list()
    assert.deepEqual(rows.map(row => row.id), ['newer', 'older'])
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('工作区脚手架幂等：不动用户文件，但配置由工作台维护', async () => {
  const { workspace } = await tempWorkspace()
  try {
    // 用户自己的文件保持原样
    const agentsPath = join(workspace.root, 'AGENTS.md')
    await writeFile(agentsPath, '用户改过的\n', 'utf8')
    // open-slide.config.ts 归工作台管：缺 base 时会被刷新
    const configPath = join(workspace.root, 'open-slide.config.ts')
    await writeFile(configPath, 'export default {};\n', 'utf8')
    const again = await workspace.scaffold()
    assert.deepEqual(again.created, ['open-slide.config.ts（已更新）'])
    assert.equal(await readFile(agentsPath, 'utf8'), '用户改过的\n')
    assert.match(await readFile(configPath, 'utf8'), /base: '\/slides-workbench\/app\/'/)
    const status = await workspace.status()
    assert.equal(status.scaffolded, true)
    assert.equal(status.installed, false)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})