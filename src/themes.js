// 官方模板：插件包里的 themes/（open-slide 官方主题的汉化改编版），合并进工作区 themes/。
//
// 合并（本地为主）：官方主题直接写进工作区 themes/（open-slide 会热更新），
// themes/.official.json 记下每个官方主题「我们写进去的文件和哈希」。按主题整体判断：
//   - 工作区里的文件和记录一致（用户没动过）→ 跟着插件升级；插件里删掉了就一起删；
//   - 用户改过 / 删过任一文件，或本地本来就有同名主题 → 归本地，以后不再碰（记录里留个 local 标记）。
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const STATE_FILE = '.official.json'
// 和 open-slide 的 themes 插件认的文件一致：顶层的 <id>.md 和 <id>.demo.{tsx,jsx,ts,js}
const THEME_FILE = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(md|demo\.(?:tsx|jsx|ts|js))$/

const sha256 = text => createHash('sha256').update(text).digest('hex')

/** 主题 id → 它的文件名列表；只收有 .md 的主题。 */
export function groupThemeFiles(names) {
  const groups = {}
  for (const name of names) {
    const match = THEME_FILE.exec(name)
    if (match) (groups[match[1]] ??= []).push(name)
  }
  for (const id of Object.keys(groups)) {
    if (!groups[id].includes(`${id}.md`)) delete groups[id]
    else groups[id].sort()
  }
  return groups
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return null
  }
}

async function readText(file) {
  return readFile(file, 'utf8').catch(() => null)
}

/**
 * 把一份官方主题合并进工作区 themes/。
 * @param {string} themesDir - 工作区 themes/ 目录。
 * @param {{version: string, source: string, themes: Record<string, Record<string, string>>}} official - 主题 id → { 文件名: 内容 }。
 * @returns {Promise<{added: string[], updated: string[], removed: string[], kept: string[]}>} 这次做了什么。
 */
export async function applyOfficialThemes(themesDir, official) {
  await mkdir(themesDir, { recursive: true })
  const stateFile = join(themesDir, STATE_FILE)
  const state = (await readJson(stateFile)) ?? {}
  const tracked = state.themes ?? {}
  const next = {}
  const result = { added: [], updated: [], removed: [], kept: [] }
  const localGroups = groupThemeFiles(await readdir(themesDir).catch(() => []))

  /** 工作区里这个主题是不是还是我们上次写进去的样子。 */
  const pristine = async (record) => {
    for (const [name, hash] of Object.entries(record.files ?? {})) {
      const text = await readText(join(themesDir, name))
      if (text == null || sha256(text) !== hash) return false
    }
    return true
  }

  for (const [id, files] of Object.entries(official.themes)) {
    const record = tracked[id]
    if (record?.local) {
      next[id] = record
      result.kept.push(id)
      continue
    }
    if (!record && localGroups[id]) {
      // 本地本来就有同名主题：本地为准。内容恰好和官方一模一样就接管（以后跟着升级）
      const same = localGroups[id].length === Object.keys(files).length
        && (await Promise.all(Object.entries(files).map(async ([name, text]) => (await readText(join(themesDir, name))) === text))).every(Boolean)
      if (!same) {
        next[id] = { local: true }
        result.kept.push(id)
        continue
      }
    } else if (record && !(await pristine(record))) {
      next[id] = { local: true }
      result.kept.push(id)
      continue
    }
    // 写入：先删掉上个版本有、这个版本没有的文件（比如 demo 从 .jsx 换成 .tsx）
    for (const name of Object.keys(record?.files ?? {})) {
      if (!(name in files)) await unlink(join(themesDir, name)).catch(() => {})
    }
    let changed = !record
    const written = {}
    for (const [name, text] of Object.entries(files)) {
      if (record?.files?.[name] !== sha256(text)) {
        await writeFile(join(themesDir, name), text, 'utf8')
        changed = true
      }
      written[name] = sha256(text)
    }
    next[id] = { files: written }
    if (!record) result.added.push(id)
    else if (changed) result.updated.push(id)
  }

  // 插件里删掉的：用户没动过就一起删；动过的留着，变成本地主题（不再记录）
  for (const [id, record] of Object.entries(tracked)) {
    if (id in official.themes) continue
    if (record.local) continue
    if (await pristine(record)) {
      for (const name of Object.keys(record.files ?? {})) await unlink(join(themesDir, name)).catch(() => {})
      result.removed.push(id)
    }
  }

  await writeFile(stateFile, `${JSON.stringify({ source: official.source, version: official.version, appliedAt: new Date().toISOString(), themes: next }, null, 2)}\n`, 'utf8')
  return result
}

export class OfficialThemes {
  /**
   * @param {object} options - 依赖。
   * @param {string} options.themesDir - 工作区 themes/ 目录。
   * @param {string} options.bundledDir - 插件包里的 themes/。
   * @param {string|null} [options.version] - 插件版本（记进 .official.json）。
   */
  constructor({ themesDir, bundledDir, version = null }) {
    this.themesDir = themesDir
    this.bundledDir = bundledDir
    this.version = version
    this.task = null
    this.status = { state: 'idle', version: null, error: null, at: null, result: null }
  }

  /** 合并一次；并发调用复用同一个任务。 */
  sync() {
    if (this.task) return this.task
    this.status = { ...this.status, state: 'syncing', error: null }
    this.task = this.run()
      .then((result) => {
        this.status = { state: 'done', version: this.version, error: null, at: new Date().toISOString(), result }
        return this.status
      }, (err) => {
        this.status = { ...this.status, state: 'error', error: err?.message ?? String(err), at: new Date().toISOString() }
        return this.status
      })
      .finally(() => {
        this.task = null
      })
    return this.task
  }

  async run() {
    const names = await readdir(this.bundledDir).catch(() => [])
    const themes = {}
    for (const [id, files] of Object.entries(groupThemeFiles(names))) {
      themes[id] = {}
      for (const name of files) themes[id][name] = await readFile(join(this.bundledDir, name), 'utf8')
    }
    if (!Object.keys(themes).length) return null
    return applyOfficialThemes(this.themesDir, { version: this.version, source: 'bundled', themes })
  }
}
