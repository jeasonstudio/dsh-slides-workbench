// Deck 解析与读写：slides/<id>/index.tsx 的元信息、页面数、讲稿对齐情况。
import { createRequire } from 'node:module'
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { exists } from './env.js'

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_ID = 48
const MAX_SOURCE = 2_000_000

/** 带 HTTP 状态码的错误，路由层直接用它回应。 */
export function httpError(message, status = 400) {
  return Object.assign(new Error(message), { status })
}

/**
 * 从标题生成 deck id：小写、连字符、去掉非 ASCII 之外的噪声。
 * @param {string} title - 用户给的标题。
 * @returns {string} kebab-case id，可能为空。
 */
export function slugify(title) {
  return String(title ?? '')
    .toLowerCase()
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    // 中文标题没法直接当目录名，退回拼音不现实，这里直接砍掉非 ASCII
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_ID)
    .replace(/-$/, '')
}

/** 数一数数组字面量里有多少个顶层元素（粗略但够用，给解析失败兜底）。 */
function countTopLevelItems(text) {
  // 传进来的是方括号里面的正文，所以一开始就在第 1 层
  let depth = 1
  let count = 0
  let seen = false
  let inString = null
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (inString) {
      if (ch === '\\') i += 1
      else if (ch === inString) inString = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      if (depth === 1) seen = true
      continue
    }
    if ('([{'.includes(ch)) {
      depth += 1
      continue
    }
    if (')]}'.includes(ch)) {
      depth -= 1
      if (depth <= 0) break
      continue
    }
    if (depth === 1 && ch === ',') {
      if (seen) count += 1
      seen = false
      continue
    }
    if (depth === 1 && !/\s/.test(ch)) seen = true
  }
  if (seen) count += 1
  return count
}

/** 从某个 `[` 的位置开始，抠出配对方括号之间的正文。 */
function bracketBody(text, openIndex) {
  const start = openIndex + 1
  let depth = 0
  let inString = null
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]
    if (inString) {
      if (ch === '\\') i += 1
      else if (ch === inString) inString = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }
    if (ch === '[' || ch === '(' || ch === '{') depth += 1
    else if (ch === ']' && depth === 0) return text.slice(start, i)
    else if (ch === ']' || ch === ')' || ch === '}') depth -= 1
  }
  return null
}

/** 从 `export default [ ... ]` 里抠出数组正文。 */
function defaultArrayBody(source) {
  const match = /export\s+default\s*\[/.exec(source)
  if (!match) return null
  return bracketBody(source, match.index + match[0].length - 1)
}

/** 数一数 `export const notes = [ ... ]` 的元素个数。 */
function notesCount(source) {
  const match = /export\s+(?:const|let|var)\s+notes\s*(?::[^=]+?)?=\s*\[/.exec(source)
  if (!match) return 0
  const body = bracketBody(source, match.index + match[0].length - 1)
  if (body === null) return 0
  return countTopLevelItems(body)
}

/** 尝试从工作区装好的 @open-slide/core 里拿 @babel/parser（官方解析器）。 */
function loadParser(workspace) {
  if (loadParser.cache !== undefined) return loadParser.cache
  const roots = [
    workspace.root,
    workspace.coreDir,
    join(workspace.root, 'node_modules'),
  ]
  for (const root of roots) {
    try {
      const require = createRequire(join(root, 'index.js'))
      const parser = require('@babel/parser')
      if (typeof parser?.parse === 'function') {
        loadParser.cache = parser
        return parser
      }
    } catch {
      // 换下一个位置
    }
  }
  loadParser.cache = null
  return null
}

/** 剥掉 TS 包装（`satisfies` / `as` / 括号），拿到真正的表达式节点。 */
function unwrap(node) {
  let current = node
  for (let guard = 0; guard < 8; guard += 1) {
    if (!current) return current
    if (current.type === 'TSSatisfiesExpression' || current.type === 'TSAsExpression' || current.type === 'TSNonNullExpression' || current.type === 'ParenthesizedExpression' || current.type === 'TSInstantiationExpression') {
      current = current.expression
      continue
    }
    return current
  }
  return current
}

/** 把 AST 里的字面量节点转成值。 */
function literalOf(node) {
  if (!node) return undefined
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral' || node.type === 'BooleanLiteral') return node.value
  if (node.type === 'TemplateLiteral' && node.expressions?.length === 0) return node.quasis.map(q => q.value.cooked).join('')
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument?.type === 'NumericLiteral') return -node.argument.value
  return undefined
}

/** 从 `const meta = { ... }` 里取 title / theme / createdAt。 */
function metaFromObject(objectNode) {
  const meta = {}
  for (const property of objectNode.properties ?? []) {
    if (property.type !== 'ObjectProperty' && property.type !== 'Property') continue
    const key = property.key?.name ?? property.key?.value
    const value = literalOf(property.value)
    if (typeof key === 'string' && value !== undefined) meta[key] = value
  }
  return meta
}

/**
 * 解析 deck 源码：页数、meta、notes、@slide-comment 标记。
 * 先用 @babel/parser（准确），拿不到就退回正则（仍然能用）。
 * @param {string} source - index.tsx 内容。
 * @param {object} [workspace] - 工作区实例，用于定位 parser。
 * @returns {{pages: number, title: string|null, theme: string|null, createdAt: string|null, notes: number, comments: number, error: string|null, warnings: string[]}}
 */
export function parseDeckSource(source, workspace) {
  const warnings = []
  const comments = (source.match(/@slide-comment/g) ?? []).length
  const text = String(source ?? '')
  const parser = workspace ? loadParser(workspace) : null

  if (parser) {
    try {
      const ast = parser.parse(text, { sourceType: 'module', plugins: ['typescript', 'jsx'], errorRecovery: false })
      let pages = 0
      let hasDefault = false
      const meta = {}
      let notes = 0
      const declared = new Map()
      for (const node of ast.program.body) {
        if (node.type === 'VariableDeclaration') {
          for (const decl of node.declarations) {
            if (decl.id?.type === 'Identifier' && decl.init) declared.set(decl.id.name, unwrap(decl.init))
          }
        }
        if (node.type === 'ExportNamedDeclaration' && node.declaration) {
          const decl = node.declaration
          if (decl.type === 'VariableDeclaration') {
            for (const row of decl.declarations) {
              if (row.id?.type === 'Identifier') declared.set(row.id.name, unwrap(row.init))
            }
          }
        }
        if (node.type === 'ExportDefaultDeclaration') {
          hasDefault = true
          let target = unwrap(node.declaration)
          if (target?.type === 'Identifier') target = unwrap(declared.get(target.name))
          if (target?.type === 'ArrayExpression') pages = target.elements.filter(Boolean).length
          else warnings.push('默认导出的不是数组字面量，页数可能不准')
        }
      }
      const metaNode = unwrap(declared.get('meta'))
      if (metaNode?.type === 'ObjectExpression') Object.assign(meta, metaFromObject(metaNode))
      const notesNode = unwrap(declared.get('notes'))
      if (notesNode?.type === 'ArrayExpression') notes = notesNode.elements.filter(Boolean).length
      if (!hasDefault) return { pages: 0, title: meta.title ?? null, theme: meta.theme ?? null, createdAt: meta.createdAt ?? null, notes, comments, error: '没有找到 export default', warnings }
      if (pages === 0) return { pages: 0, title: meta.title ?? null, theme: meta.theme ?? null, createdAt: meta.createdAt ?? null, notes, comments, error: '默认导出的数组是空的', warnings }
      if (notes > 0 && notes !== pages) warnings.push(`notes 有 ${notes} 条，页面有 ${pages} 页，没有对齐`)
      return { pages, title: typeof meta.title === 'string' ? meta.title : null, theme: typeof meta.theme === 'string' ? meta.theme : null, createdAt: typeof meta.createdAt === 'string' ? meta.createdAt : null, notes, comments, error: null, warnings }
    } catch (err) {
      return {
        pages: 0, title: null, theme: null, createdAt: null, notes: 0, comments,
        error: `源码解析失败：${String(err?.message ?? err).split('\n')[0]}`,
        warnings,
      }
    }
  }

  // 兜底：没有 parser 时用正则，够判断有没有内容
  const body = defaultArrayBody(text)
  if (body === null) {
    const titleMatch = /title\s*:\s*['"`]([^'"`]+)['"`]/.exec(text)
    return { pages: 0, title: titleMatch ? titleMatch[1] : null, theme: null, createdAt: null, notes: notesCount(text), comments, error: '没有找到 export default [...]', warnings }
  }
  const pages = countTopLevelItems(body)
  const titleMatch = /title\s*:\s*['"`]([^'"`]+)['"`]/.exec(text)
  const themeMatch = /theme\s*:\s*['"`]([^'"`]+)['"`]/.exec(text)
  const createdMatch = /createdAt\s*:\s*['"`]([^'"`]+)['"`]/.exec(text)
  const notes = notesCount(text)
  if (notes > 0 && notes !== pages) warnings.push(`notes 有 ${notes} 条，页面有 ${pages} 页，没有对齐`)
  return { pages, title: titleMatch ? titleMatch[1] : null, theme: themeMatch ? themeMatch[1] : null, createdAt: createdMatch ? createdMatch[1] : null, notes, comments, error: pages === 0 ? '默认导出的数组是空的' : null, warnings }
}

/** JSX 文本 / JS 单引号字符串里的安全转义。 */
function quote(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function escapeJsx(text) {
  return String(text).replace(/[{}<>]/g, '')
}

/** 新建 deck 的起始页：一页封面，直接用 open-slide 的画布约定。 */
export function starterSource(title, createdAt) {
  const safe = escapeJsx(title)
  return `import type { Page, SlideMeta } from '@open-slide/core';

const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#0b0d10',
      color: '#f4f6f8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 120,
      boxSizing: 'border-box',
    }}
  >
    <div style={{ fontSize: 22, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7f8b99' }}>
      DeepSeek Harness
    </div>
    <h1 style={{ margin: 0, fontSize: 136, lineHeight: 1.04, letterSpacing: '-0.04em', fontWeight: 600, maxWidth: 1560 }}>
      ${safe}
    </h1>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#8b97a5' }}>
      <span>让 AI 继续写下一页</span>
      <span>01</span>
    </div>
  </div>
);

export const meta: SlideMeta = { title: '${quote(title)}', createdAt: '${createdAt}' };

export const notes: (string | undefined)[] = ['开场：用一句话说明这份演示要回答的问题。'];

export default [Cover] satisfies Page[];
`
}

export class Decks {
  /** @param {import('./workspace.js').Workspace} workspace - 工作区。 */
  constructor(workspace) {
    this.workspace = workspace
  }

  isValidId(id) {
    return typeof id === 'string' && ID_RE.test(id) && id.length <= MAX_ID
  }

  deckDir(id) {
    return join(this.workspace.slidesDir, id)
  }

  deckFile(id) {
    return join(this.deckDir(id), 'index.tsx')
  }

  /** 目录里有没有这个 deck。 */
  async exists(id) {
    if (!this.isValidId(id)) return false
    return existsSync(this.deckFile(id))
  }

  /**
   * 列出全部 deck。
   * @returns {Promise<Array<object>>} 按更新时间倒序。
   */
  async list() {
    const dir = this.workspace.slidesDir
    if (!exists(dir)) return []
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
    const rows = []
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue
      const id = entry.name
      if (!this.isValidId(id)) continue
      if (!existsSync(this.deckFile(id))) continue
      const row = await this.describe(id).catch(err => ({
        id,
        title: id,
        pages: 0,
        notesCount: 0,
        theme: null,
        createdAt: null,
        updatedAt: 0,
        bytes: 0,
        assets: 0,
        error: err.message,
      }))
      rows.push(row)
    }
    return rows.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0) || a.id.localeCompare(b.id))
  }

  /**
   * 单个 deck 的元信息（不读全文）。
   * @param {string} id - deck id。
   * @returns {Promise<object>} deck 行。
   */
  async describe(id) {
    if (!this.isValidId(id)) throw httpError('deck id 不合法', 400)
    const file = this.deckFile(id)
    if (!existsSync(file)) throw httpError(`找不到 deck：${id}`, 404)
    const [source, info] = await Promise.all([readFile(file, 'utf8'), stat(file)])
    const parsed = parseDeckSource(source, this.workspace)
    const assets = await this.countAssets(id)
    return {
      id,
      title: parsed.title ?? id,
      pages: parsed.pages,
      notesCount: parsed.notes,
      comments: parsed.comments,
      theme: parsed.theme,
      createdAt: parsed.createdAt ? Date.parse(parsed.createdAt) || null : null,
      updatedAt: info.mtimeMs,
      bytes: info.size,
      assets,
      error: parsed.error,
      warnings: parsed.warnings,
    }
  }

  /**
   * 读 deck 全文。
   * @param {string} id - deck id。
   * @returns {Promise<object>} `{ ...deck, source }`。
   */
  async get(id) {
    const deck = await this.describe(id)
    const source = await readFile(this.deckFile(id), 'utf8')
    return { ...deck, source }
  }

  /** 数一数 assets 目录里的文件。 */
  async countAssets(id) {
    const dir = join(this.deckDir(id), 'assets')
    if (!exists(dir)) return 0
    let count = 0
    const walk = async (current) => {
      const entries = await readdir(current, { withFileTypes: true }).catch(() => [])
      for (const entry of entries) {
        if (entry.isDirectory()) await walk(join(current, entry.name))
        else count += 1
      }
    }
    await walk(dir)
    return count
  }

  /**
   * 新建 deck：目录 + 一页封面 + assets 目录。
   * @param {string} title - 标题（也用来生成 id）。
   * @param {string} [preferredId] - 指定 id。
   * @returns {Promise<object>} deck 行。
   */
  async create(title, preferredId) {
    const cleanTitle = String(title ?? '').trim().slice(0, 120)
    if (!cleanTitle) throw httpError('标题不能为空', 400)
    let id = preferredId ? String(preferredId).trim().toLowerCase() : slugify(cleanTitle)
    if (preferredId && !this.isValidId(id)) throw httpError('id 只能是小写字母、数字和连字符', 400)
    if (!id) id = `deck-${Date.now().toString(36).slice(-5)}`
    if (!this.isValidId(id)) throw httpError('标题生成不出合法的目录名，请手动指定 id', 400)
    let candidate = id
    for (let n = 2; existsSync(this.deckDir(candidate)); n += 1) {
      candidate = `${id}-${n}`
      if (n > 60) throw httpError('同名 deck 太多了，请换个标题', 409)
    }
    id = candidate
    await mkdir(join(this.deckDir(id), 'assets'), { recursive: true })
    const createdAt = new Date().toISOString()
    await writeFile(this.deckFile(id), starterSource(cleanTitle, createdAt), 'utf8')
    return this.describe(id)
  }

  /**
   * 覆盖写 deck 源码（先校验，再原子替换）。
   * @param {string} id - deck id。
   * @param {string} source - 新源码。
   * @returns {Promise<{deck: object, warnings: string[]}>} 结果。
   */
  async write(id, source) {
    if (!this.isValidId(id)) throw httpError('deck id 不合法', 400)
    const text = String(source ?? '')
    if (!text.trim()) throw httpError('源码是空的', 400)
    if (text.length > MAX_SOURCE) throw httpError('源码太大了（超过 2MB）', 413)
    const parsed = parseDeckSource(text, this.workspace)
    if (parsed.error) throw httpError(parsed.error, 400)
    await mkdir(this.deckDir(id), { recursive: true })
    const target = this.deckFile(id)
    const temp = join(this.deckDir(id), `.index.tsx.${process.pid}.tmp`)
    await writeFile(temp, text, 'utf8')
    await rename(temp, target)
    return { deck: await this.describe(id), warnings: parsed.warnings }
  }

  /**
   * 删除 deck：移到 .trash，不真删，误操作还能捞回来。
   * @param {string} id - deck id。
   * @returns {Promise<{ok: true, trash: string}>} 结果。
   */
  async remove(id) {
    if (!this.isValidId(id)) throw httpError('deck id 不合法', 400)
    const dir = this.deckDir(id)
    if (!existsSync(dir)) throw httpError(`找不到 deck：${id}`, 404)
    const trash = join(this.workspace.root, '.trash')
    await mkdir(trash, { recursive: true })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const target = join(trash, `${id}-${stamp}`)
    await rename(dir, target).catch(async (err) => {
      if (err?.code !== 'EXDEV') throw err
      await writeFile(join(trash, `${id}-${stamp}.txt`), '跨设备移动失败', 'utf8')
      throw httpError('删除失败：工作区和回收站不在同一个磁盘', 500)
    })
    return { ok: true, trash: target }
  }
}