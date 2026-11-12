// dsh-slides-workbench 模型侧工具：让 agent 在 DSH 会话里管理 open-slide deck。
//
// 只依赖 Host 模块的公开 API（见 docs/CONTRACT.md「Host 模块 API」）：
// - workspace: Workspace 实例（status / ensureInstalled / build / slidesDir / distDir / root）
// - decks: Decks 实例（list / get / create / write / remove / isValidId）
// - dev: DevServer 实例（start / stop / snapshot / urlFor）
//
// 不 import 任何 @deepseek-ai/* 包；注册的就是普通 ToolDefinition 对象
// （name / description / parameters(JSON Schema) / output:{schema,render} / execute）。
import { join } from 'node:path'

/** 所有工具的输出都是给人读的纯文本（对象会被安全地序列化）。 */
const TEXT_OUTPUT = {
  schema: { type: 'string' },
  render: (_args, value) => [
    { type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) },
  ],
}

const EMPTY_PARAMETERS = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
}

/** 每个工具描述里都要出现的提醒，避免模型绕过 skill 或改坏工作区。 */
const HINT = 'deck 是 open-slide 的 slides/<id>/index.tsx；写页面前先加载 slides-authoring skill；不要修改 package.json。'

/**
 * 注册 dsh-slides-workbench 的全部 agent 工具。
 * @param {object} ctx - Cordis 上下文（用 ctx.get('tools') 取工具服务）。
 * @param {{workspace: object, decks: object, dev: object}} deps - Host 模块实例。
 */
export function registerTools(ctx, deps) {
  const tools = ctx.get('tools')
  if (!tools || typeof tools.register !== 'function') return

  const { workspace, decks, dev } = deps ?? {}
  if (!workspace || !decks || !dev) {
    ctx.logger?.warn?.('slides-workbench: registerTools 缺少 workspace/decks/dev，agent 工具未注册')
    return
  }

  tools.register({
    name: 'slides_status',
    description: `查看演示文稿（open-slide）工作区状态：工作区路径、依赖是否装好、dev server 地址和 deck 列表摘要。接到幻灯片相关任务先调它确认环境；${HINT}`,
    parameters: EMPTY_PARAMETERS,
    output: TEXT_OUTPUT,
    execute: async () => {
      const status = await workspace.status()
      const lines = []
      lines.push(`工作区：${status.path ?? workspace.root ?? '(未知)'}`)
      lines.push(`脚手架：${status.scaffolded ? '已就绪' : '未初始化'}`)
      lines.push(`依赖：${describeInstall(status)}`)
      if (status.version) lines.push(`open-slide：${status.version}`)
      const installLog = Array.isArray(status.install?.log) ? status.install.log : []
      if ((status.install?.status === 'running' || status.install?.status === 'error') && installLog.length) {
        lines.push('安装日志尾部：')
        for (const line of installLog.slice(-5)) lines.push(`  ${line}`)
      }

      const server = serverSnapshot(dev)
      lines.push(`演示服务：${describeServer(server)}`)
      if (server?.status === 'error' && Array.isArray(server.log) && server.log.length) {
        lines.push('演示服务日志尾部：')
        for (const line of server.log.slice(-3)) lines.push(`  ${line}`)
      }

      if (!status.scaffolded) {
        lines.push('deck：工作区还没初始化，暂无 deck。')
        lines.push('下一步：在 DSH 侧栏「演示文稿」面板点「初始化工作台」完成安装；装好后用 slides_create_deck 建 deck。')
        return lines.join('\n')
      }

      let rows = []
      let listError = null
      try {
        rows = await decks.list()
      } catch (error) {
        listError = errorText(error)
      }
      if (listError) {
        lines.push(`deck：列表读取失败：${listError}`)
      } else if (rows.length === 0) {
        lines.push('deck：0 个。用 slides_create_deck 建第一个 deck。')
      } else {
        lines.push(`deck：共 ${rows.length} 个`)
        for (const row of rows.slice(0, 8)) lines.push(deckLine(row, false))
        if (rows.length > 8) lines.push(`- …其余 ${rows.length - 8} 个用 slides_list 查看`)
      }
      if (server?.status !== 'running') lines.push('需要预览或演示时用 slides_present 启动演示服务。')
      return lines.join('\n')
    },
  })

  tools.register({
    name: 'slides_list',
    description: `列出工作区里的所有 open-slide deck（id、标题、页数、更新时间），full=true 时补讲稿数、资源数、字节数、创建时间和解析告警。${HINT}`,
    parameters: {
      type: 'object',
      properties: {
        full: {
          type: 'boolean',
          description: '是否返回完整信息；默认 false 只给 id / 标题 / 页数 / 更新时间。',
        },
      },
      required: [],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    execute: async (args) => {
      const full = booleanArg(args, 'full', 'full')
      let rows
      try {
        rows = await decks.list()
      } catch (error) {
        throw new Error(`读取 deck 列表失败：${errorText(error)}`)
      }
      if (rows.length === 0) return '工作区里还没有 deck。用 slides_create_deck 建一个，再用 slides_write_deck 写页面。'
      const lines = [`共 ${rows.length} 个 deck${full ? '（完整信息）' : ''}：`]
      for (const row of rows) lines.push(deckLine(row, full))
      return lines.join('\n')
    },
  })

  tools.register({
    name: 'slides_read_deck',
    description: `读取某个 deck 的 slides/<id>/index.tsx 全文，用于改写前先拿到当前代码；返回的是可以直接编辑、整体写回的源码。${HINT}`,
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'deck id，也就是 slides/<id>/ 的目录名（kebab-case，例如 q2-launch）。',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    execute: async (args) => {
      const id = deckIdArg(args, decks)
      let deck
      try {
        deck = await decks.get(id)
      } catch (error) {
        throw new Error(`读取 deck "${id}" 失败：${errorText(error)}`)
      }
      const source = typeof deck?.source === 'string' ? deck.source : ''
      if (!source.trim()) throw new Error(`deck "${id}" 的 index.tsx 是空的，用 slides_write_deck 写入完整源码`)
      return source
    },
  })

  tools.register({
    name: 'slides_create_deck',
    description: `新建一个 open-slide deck（目录 slides/<id>/ 加一页起始 index.tsx），返回最终 id 与文件路径；已有 deck 直接用 slides_write_deck 覆盖，不要重复创建。${HINT}`,
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'deck 标题，会显示在页头，也用于生成 id（例如 "Q2 Launch"）。',
        },
        id: {
          type: 'string',
          description: '可选 deck id（kebab-case，小写字母/数字/连字符）；省略则从标题生成，重名会自动加后缀。',
        },
      },
      required: ['title'],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    execute: async (args) => {
      const title = stringArg(args, 'title', '标题')
      if (title.length > 120) throw new Error('标题太长（最多 120 个字符）')
      const preferredId = args?.id === undefined || args?.id === null ? undefined : stringArg(args, 'id', 'deck id')
      if (preferredId !== undefined && !decks.isValidId(preferredId)) {
        throw new Error(`deck id 不合法："${preferredId}"；只能用小写字母、数字和连字符（例如 q2-launch）`)
      }
      let deck
      try {
        deck = await decks.create(title, preferredId)
      } catch (error) {
        throw new Error(`创建 deck 失败：${errorText(error)}`)
      }
      const id = deck?.id ?? preferredId ?? ''
      return [
        `已创建 deck "${id}"（标题：${deck?.title ?? title}，${deck?.pages ?? 1} 页）。`,
        `文件：${deckFile(workspace, id)}`,
        '下一步：先加载 slides-authoring skill，再用 slides_write_deck 一次性写入完整 index.tsx；写完用 slides_present 预览。',
      ].join('\n')
    },
  })

  tools.register({
    name: 'slides_write_deck',
    description: `用完整源码覆盖写入 slides/<id>/index.tsx（一次写整份文件，不要分多次小改），返回页数、讲稿条数和校验告警；写页面前先看 slides-authoring skill。${HINT}`,
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'deck id，也就是 slides/<id>/ 的目录名（kebab-case）。',
        },
        source: {
          type: 'string',
          description: '完整的 index.tsx 源码（覆盖写入）：必须以 export default [...] satisfies Page[] 结尾，包含 meta 与 notes。',
        },
      },
      required: ['id', 'source'],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    execute: async (args) => {
      const id = deckIdArg(args, decks)
      const source = args?.source
      if (typeof source !== 'string' || !source.trim()) {
        throw new Error('source 必须是完整 index.tsx 源码（非空字符串），一次写完整个文件')
      }
      let result
      try {
        result = await decks.write(id, source)
      } catch (error) {
        throw new Error(`写入 deck "${id}" 失败：${errorText(error)}`)
      }
      const deck = result?.deck ?? {}
      const warnings = Array.isArray(result?.warnings) ? result.warnings : []
      const lines = [
        `已写入 deck "${id}"：${deck.pages ?? '?'} 页，${deck.notesCount ?? 0} 条讲稿。`,
        `文件：${deckFile(workspace, id)}`,
      ]
      if (warnings.length) {
        lines.push('校验告警：')
        for (const warning of warnings) lines.push(`- ${warning}`)
      } else {
        lines.push('校验告警：无。')
      }
      lines.push('dev server 会自动热更新；用 slides_present 拿预览地址，或点 DSH 侧栏「演示文稿」面板。')
      return lines.join('\n')
    },
  })

  tools.register({
    name: 'slides_delete_deck',
    description: `删除一个 deck：把 slides/<id>/ 整个目录移到工作区 .trash/ 下（可手动恢复）。删除前先用 slides_list 确认 id，别猜。${HINT}`,
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '要删除的 deck id（slides/<id>/ 的目录名）。',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    execute: async (args) => {
      const id = deckIdArg(args, decks)
      let result
      try {
        result = await decks.remove(id)
      } catch (error) {
        throw new Error(`删除 deck "${id}" 失败：${errorText(error)}`)
      }
      return `已删除 deck "${id}"（目录已移到 ${result?.trash ?? '工作区 .trash/'}，需要时可手动恢复）。`
    },
  })

  tools.register({
    name: 'slides_present',
    description: `确保 open-slide dev server 在运行，返回该 deck 的单页预览与完整编辑器 URL，并提示用户在侧栏「演示文稿」面板里预览/演示；不传 id 时返回工作台首页。${HINT}`,
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '可选 deck id；省略时只返回工作台首页和现有 deck 列表。',
        },
      },
      required: [],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    execute: async (args) => {
      const hasId = args?.id !== undefined && args?.id !== null
      const id = hasId ? deckIdArg(args, decks) : null

      let server = serverSnapshot(dev)
      if (server?.status !== 'running') {
        try {
          await dev.start()
        } catch (error) {
          throw new Error(`启动演示服务失败：${errorText(error)}`)
        }
        server = serverSnapshot(dev)
      }
      if (server?.status !== 'running') {
        const tail = Array.isArray(server?.log) && server.log.length ? `\n${server.log.slice(-5).join('\n')}` : ''
        throw new Error(`演示服务没有就绪：${server?.error ?? '未知错误'}${tail}`)
      }
      const root = String(server.url ?? '').replace(/\/+$/, '')

      let rows = []
      try {
        rows = await decks.list()
      } catch {
        rows = []
      }

      if (id) {
        const row = rows.find(item => item.id === id)
        if (!row) throw new Error(`找不到 deck "${id}"；用 slides_list 查看现有 deck`)
        const preview = dev.urlFor?.(id, 1, 'preview') ?? `${root}/s/${id}/preview?p=1`
        const editor = dev.urlFor?.(id, 1, 'editor') ?? `${root}/s/${id}`
        return [
          `演示服务已就绪：${server.url}`,
          `deck "${id}" 共 ${row.pages ?? 1} 页。`,
          `单页干净预览：${preview}`,
          `完整编辑器：${editor}`,
          '告诉用户：在 DSH 侧栏「演示文稿」面板里选中这个 deck 即可预览、演示、导出；上面的地址也可以直接在新窗口打开。',
        ].join('\n')
      }

      const lines = [`演示服务已就绪：${server.url}`, `工作台首页：${root}/`]
      if (rows.length) {
        lines.push(`当前 deck：${rows.map(row => row.id).join('、')}`)
        lines.push(`单个 deck 的预览地址形如：${root}/s/<id>/preview?p=1`)
      } else {
        lines.push('工作区还没有 deck。用 slides_create_deck 建一个。')
      }
      lines.push('提示用户：DSH 侧栏「演示文稿」面板里能看到同一份工作台。')
      return lines.join('\n')
    },
  })

  tools.register({
    name: 'slides_build',
    description: `把当前所有 deck 构建成静态站点（open-slide build），返回 dist 目录与日志尾部；依赖没装时会先安装。导出用这个，演示用 slides_present。${HINT}`,
    parameters: EMPTY_PARAMETERS,
    output: TEXT_OUTPUT,
    execute: async () => {
      const status = await workspace.status()
      const lines = []
      if (!status.installed) {
        lines.push('依赖未安装，先安装 open-slide 依赖…')
        try {
          await workspace.ensureInstalled()
        } catch (error) {
          throw new Error(`安装依赖失败：${errorText(error)}`)
        }
      }
      let result
      try {
        result = await workspace.build()
      } catch (error) {
        throw new Error(`构建失败：${errorText(error)}`)
      }
      if (!result || result.ok !== true) {
        const tail = Array.isArray(result?.log) && result.log.length ? `\n${result.log.slice(-8).join('\n')}` : ''
        throw new Error(`构建失败：${result?.error ?? '未知错误'}${tail}`)
      }
      lines.push(`构建完成：${result.outDir ?? workspace.distDir}`)
      if (Array.isArray(result.log) && result.log.length) {
        lines.push('日志尾部：')
        for (const line of result.log.slice(-5)) lines.push(`  ${line}`)
      }
      lines.push('产物是静态站点（HTML + 资源），用静态服务器打开；它不是演示用的 dev URL。')
      return lines.join('\n')
    },
  })
}

/** 把异常转成可读的一句话。 */
function errorText(error) {
  if (error instanceof Error) return error.message
  return String(error ?? '未知错误')
}

/** 参数必须是普通对象；模型偶尔会传 null。 */
function ensureArgs(args) {
  return args && typeof args === 'object' && !Array.isArray(args) ? args : {}
}

/** 取必填字符串参数并去首尾空白。 */
function stringArg(args, key, label) {
  const value = ensureArgs(args)[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label}（${key}）必须是非空字符串`)
  }
  return value.trim()
}

/** 取可选布尔参数；缺省为 false。 */
function booleanArg(args, key, label) {
  const value = ensureArgs(args)[key]
  if (value === undefined || value === null) return false
  if (typeof value !== 'boolean') throw new Error(`${label}（${key}）必须是布尔值 true/false`)
  return value
}

/** 取并校验 deck id（交给 Decks.isValidId，和目录名规则保持一致）。 */
function deckIdArg(args, decks) {
  const id = stringArg(args, 'id', 'deck id')
  if (typeof decks.isValidId === 'function' && !decks.isValidId(id)) {
    throw new Error(`deck id 不合法："${id}"；只能用小写字母、数字和连字符（例如 q2-launch），可用 slides_list 查看现有 deck`)
  }
  return id
}

/** deck 的 index.tsx 绝对路径，用于在结果里告诉模型改哪个文件。 */
function deckFile(workspace, id) {
  const slidesDir = workspace.slidesDir ?? join(workspace.root ?? '', 'slides')
  return join(slidesDir, id, 'index.tsx')
}

/** 时间戳（毫秒或 ISO 字符串）→ ISO 文本。 */
function isoTime(value) {
  if (value === null || value === undefined || value === '') return '—'
  const timestamp = typeof value === 'number' ? value : Date.parse(String(value))
  if (!Number.isFinite(timestamp)) return '—'
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '—' : date.toISOString()
}

/** 字节数 → 简短人类可读文本。 */
function formatBytes(value) {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** deck 列表里的一行（full=true 时补详细信息）。 */
function deckLine(deck, full) {
  const parts = [deck.id, deck.title ?? deck.id, `${deck.pages ?? 0} 页`]
  if (deck.notesCount) parts.push(`${deck.notesCount} 条讲稿`)
  if (deck.updatedAt) parts.push(`更新于 ${isoTime(deck.updatedAt)}`)
  if (full) {
    parts.push(`${deck.assets ?? 0} 个资源`, formatBytes(deck.bytes))
    if (deck.createdAt) parts.push(`创建于 ${isoTime(deck.createdAt)}`)
    if (deck.theme) parts.push(`主题 ${deck.theme}`)
    if (deck.comments) parts.push(`${deck.comments} 处评论标记`)
  }
  let line = `- ${parts.join(' · ')}`
  if (deck.error) line += `\n  ⚠ ${deck.error}`
  if (full && Array.isArray(deck.warnings)) {
    for (const warning of deck.warnings) line += `\n  ⚠ ${warning}`
  }
  return line
}

/** 兼容 snapshot() 与 status() 两种读法，读不到就给一个保守快照。 */
function serverSnapshot(dev) {
  try {
    if (typeof dev?.status === 'function') return dev.status()
    if (typeof dev?.snapshot === 'function') return dev.snapshot()
  } catch (error) {
    return { status: 'error', url: null, error: errorText(error), log: [] }
  }
  return { status: 'unknown', url: null, error: null, log: [] }
}

/** dev server 状态的一句话描述。 */
function describeServer(server) {
  switch (server?.status) {
    case 'running':
      return `运行中 ${server.url ?? ''}`.trim()
    case 'starting':
      return '启动中'
    case 'error':
      return `错误：${server.error ?? '未知错误'}`
    default:
      return '未启动（需要预览或演示时用 slides_present 启动）'
  }
}

/** 依赖安装状态的一句话描述（优先看 workspace.status().install）。 */
function describeInstall(status) {
  if (status?.installed) return '已安装'
  const install = status?.install
  if (install && install.status === 'running') return '安装中'
  if (install && install.status === 'error') return `安装失败：${install.error ?? '未知错误'}`
  return '未安装'
}