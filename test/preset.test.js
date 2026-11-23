// 模型侧全部由 slides-workbench agent preset 提供：patch 里声明 preset，技能目录完整，工作区规则不再提 slides_* 工具。
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { AGENT_PRESET } from '../client/session.js'
import { packageRoot, templateDir } from '../src/env.js'
import { Workspace } from '../src/workspace.js'

const patch = readFileSync(join(packageRoot(), 'cordis.patch.yml'), 'utf8')
const skillsRoot = join(packageRoot(), 'skills')

test('patch 声明 slides-workbench preset，客户端建会话用的就是它', () => {
  assert.equal(AGENT_PRESET, 'slides-workbench')
  assert.match(patch, /- id: preset-slides-workbench\n\s+name: '@deepseek-ai\/dsh-agent-preset'\n\s+config:\n\s+id: slides-workbench\n/)
})

test('preset 的 skill-filesystem 把本包 skills/ 加进 customSkillDirs，standard 的其余插件都在', () => {
  assert.match(patch, /createRequire\(baseUrl\)\.resolve\('dsh-slides-workbench\/package\.json'\)\), 'skills'\)/)
  for (const name of ['dsh-persona', 'dsh-agent-instructions', 'dsh-tool-fs', 'dsh-tool-fs-search', 'dsh-tool-bash', 'dsh-tool-skill', 'dsh-tool-ask-user', 'dsh-compaction-basic']) {
    assert.ok(patch.includes(`'@deepseek-ai/${name}'`), name)
  }
})

test('5 个 open-slide 技能：frontmatter 的 name 与目录一致，正文不提已删除的 slides_* 工具', () => {
  const dirs = readdirSync(skillsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
  assert.deepEqual(dirs, ['apply-comments', 'create-slide', 'create-theme', 'current-slide', 'slide-authoring'])
  for (const dir of dirs) {
    const text = readFileSync(join(skillsRoot, dir, 'SKILL.md'), 'utf8')
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? ''
    assert.match(front, new RegExp(`^name: ${dir}$`, 'm'), dir)
    assert.match(front, /^description: .{40,}/m, dir)
    assert.doesNotMatch(text, /slides_[a-z]/, dir)
  }
})

test('模板 AGENTS.md 不提 slides_* 工具，指向技能和 current.json', () => {
  const text = readFileSync(join(templateDir(), 'AGENTS.md'), 'utf8')
  assert.doesNotMatch(text, /slides_[a-z]/)
  assert.match(text, /slide-authoring/)
  assert.match(text, /node_modules\/\.open-slide\/current\.json/)
})

test('ensureAgents：只把提 slides_* 工具的旧版 AGENTS.md 换成模板，用户自己写的不动', async () => {
  const root = await mkdtemp(join(tmpdir(), 'slides-wb-agents-'))
  try {
    const workspace = new Workspace(root)
    const wanted = await readFile(join(templateDir(), 'AGENTS.md'), 'utf8')
    const file = join(root, 'AGENTS.md')

    assert.equal(await workspace.ensureAgents(), false, '没有 AGENTS.md 时不创建（scaffold 负责）')

    await writeFile(file, '# 旧规则\n\n优先用插件的 `slides_*` 工具（`slides_status` …）\n')
    assert.equal(await workspace.ensureAgents(), true)
    assert.equal(await readFile(file, 'utf8'), wanted)

    await writeFile(file, '# 我自己的规则\n')
    assert.equal(await workspace.ensureAgents(), false)
    assert.equal(await readFile(file, 'utf8'), '# 我自己的规则\n')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
