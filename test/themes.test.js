// 官方模板：合并规则（本地为主）+ 插件内置的 themes/。
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { applyOfficialThemes, groupThemeFiles, OfficialThemes } from '../src/themes.js'

const tmp = prefix => mkdtempSync(join(tmpdir(), prefix))
const read = (dir, name) => readFileSync(join(dir, name), 'utf8')
const md = (name, extra = '') => `---\nname: ${name}\ndescription: d\n---\n\n# ${name}\n${extra}`
const official = (version, themes) => ({ version, source: 'bundled', themes })

test('groupThemeFiles 只收顶层 <id>.md 和 <id>.demo.*，没有 .md 的不算', () => {
  assert.deepEqual(groupThemeFiles(['a.md', 'a.demo.tsx', 'b.demo.tsx', 'README', 'Bad.md', 'c.md', '.official.json', 'x.txt']), {
    a: ['a.demo.tsx', 'a.md'],
    c: ['c.md'],
  })
})

test('首次合并写入官方主题；用户没动过的跟着升级，官方下架的一起删掉', async () => {
  const dir = tmp('sw-th-')
  let r = await applyOfficialThemes(dir, official('1.0.0', {
    ink: { 'ink.md': md('Ink'), 'ink.demo.tsx': 'v1' },
    old: { 'old.md': md('Old') },
  }))
  assert.deepEqual(r.added.sort(), ['ink', 'old'])
  assert.equal(read(dir, 'ink.demo.tsx'), 'v1')

  r = await applyOfficialThemes(dir, official('1.1.0', { ink: { 'ink.md': md('Ink', 'new'), 'ink.demo.jsx': 'v2' } }))
  assert.deepEqual(r.updated, ['ink'])
  assert.deepEqual(r.removed, ['old'])
  assert.match(read(dir, 'ink.md'), /new/)
  assert.equal(read(dir, 'ink.demo.jsx'), 'v2')
  assert.equal(existsSync(join(dir, 'ink.demo.tsx')), false, '上个版本有、这个版本没有的文件要删掉')
  assert.equal(existsSync(join(dir, 'old.md')), false)
  assert.equal(JSON.parse(read(dir, '.official.json')).version, '1.1.0')
})

test('本地为主：改过 / 删过的官方主题、本地同名主题都不覆盖，以后也不再碰', async () => {
  const dir = tmp('sw-th-')
  writeFileSync(join(dir, 'mine.md'), md('My own'))
  await applyOfficialThemes(dir, official('1.0.0', {
    edited: { 'edited.md': md('Edited') },
    gone: { 'gone.md': md('Gone') },
    mine: { 'mine.md': md('Official mine') },
  }))
  assert.equal(read(dir, 'mine.md'), md('My own'), '本地同名主题不覆盖')

  writeFileSync(join(dir, 'edited.md'), md('Edited by me'))
  unlinkSync(join(dir, 'gone.md'))
  const r = await applyOfficialThemes(dir, official('1.1.0', {
    edited: { 'edited.md': md('Edited v2') },
    gone: { 'gone.md': md('Gone v2') },
    mine: { 'mine.md': md('Official mine v2') },
  }))
  assert.deepEqual(r.kept.sort(), ['edited', 'gone', 'mine'])
  assert.equal(read(dir, 'edited.md'), md('Edited by me'))
  assert.equal(existsSync(join(dir, 'gone.md')), false, '用户删掉的不再加回来')
  assert.equal(read(dir, 'mine.md'), md('My own'))

  // 官方下架一个被用户改过的主题：文件留着（变成纯本地主题）
  await applyOfficialThemes(dir, official('1.2.0', {}))
  assert.equal(read(dir, 'edited.md'), md('Edited by me'))
})

test('本地同名主题内容和官方完全一样时接管，之后跟着升级', async () => {
  const dir = tmp('sw-th-')
  writeFileSync(join(dir, 'same.md'), md('Same'))
  await applyOfficialThemes(dir, official('1.0.0', { same: { 'same.md': md('Same') } }))
  await applyOfficialThemes(dir, official('1.1.0', { same: { 'same.md': md('Same v2') } }))
  assert.equal(read(dir, 'same.md'), md('Same v2'))
})

// ---- 来源 ----

test('插件内置的 themes/ 都是合法主题，sync 全部合并进工作区', async () => {
  const bundledDir = join(import.meta.dirname, '..', 'themes')
  const groups = groupThemeFiles(readdirSync(bundledDir))
  assert.ok(Object.keys(groups).length >= 10)
  for (const [id, files] of Object.entries(groups)) assert.deepEqual(files, [`${id}.demo.tsx`, `${id}.md`], `${id} 要有 .md 和 .demo.tsx`)
  const dir = tmp('sw-th-')
  const status = await new OfficialThemes({ themesDir: dir, bundledDir, version: '9.9.9' }).sync()
  assert.equal(status.state, 'done')
  assert.deepEqual(status.result.added.sort(), Object.keys(groups).sort())
  assert.equal(read(dir, 'aero.md'), read(bundledDir, 'aero.md'))
  assert.equal(JSON.parse(read(dir, '.official.json')).version, '9.9.9')
  rmSync(dir, { recursive: true, force: true })
})
