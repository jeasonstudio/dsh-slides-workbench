// open-slide Agent 面板里的 DSH 原生对话：每个 deck 一段 DSH 会话（deck → 会话 id 记在 localStorage）。
//
// 渲染交给 DSH 自己（见 chat.jsx），这里只管会话，用到的都是 DSH 客户端开放给插件的服务：
//   ctx.workspaces   把 open-slide 工作区登记成 DSH Workspace（幂等），对话会话都归在它下面
//   ctx.sessions     新建会话、持有会话引用、原生提交消息、改标题

const services = { sessions: null, workspaces: null }
const STORE_KEY = 'slides-workbench.chat.sessions'
/** 对话会话用的 agent preset（cordis.patch.yml 里声明）：open-slide 的技能只在它里面。 */
export const AGENT_PRESET = 'slides-workbench'

let byDeck = readStored()
let available = false
const listeners = new Set()
const pending = new Map()

function readStored() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(STORE_KEY) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function emit() {
  listeners.forEach((fn) => fn())
}

function assign(deckId, sessionId) {
  byDeck = { ...byDeck, [deckId]: sessionId }
  try {
    globalThis.localStorage?.setItem(STORE_KEY, JSON.stringify(byDeck))
  } catch {
    // 隐私模式里 localStorage 可能不可用
  }
  emit()
}

/**
 * 记下 DSH 的会话相关服务（index.jsx 在 apply 里调用；服务卸载时传 null 清掉）。
 * @param {Partial<typeof services>} next - 拿到的服务。
 */
export function bindServices(next) {
  Object.assign(services, next)
  available = Boolean(services.sessions && services.workspaces)
  emit()
}

/** 当前 DSH 能不能在 Agent 面板里挂原生对话。 */
export function chatAvailable() {
  return available
}

/** deck → 会话 id 的当前映射（引用只在变化时更新）。 */
export function chatMap() {
  return byDeck
}

/** 订阅映射与服务可用性的变化（chat.jsx 的 hook 用）。 */
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * 把 open-slide 工作区登记成 DSH Workspace（Host 侧幂等：已登记就返回原来那个）。
 * 只给 cwd 的会话不属于任何 Workspace，DSH 的输入框会先要求选 Workspace。
 * @param {string} path - 工作区目录。
 * @returns {Promise<string>} WorkspaceId。
 */
export async function ensureWorkspace(path) {
  const view = await services.workspaces.create({ path })
  return view.workspaceId
}

async function createFor(deckId, workspacePath, title) {
  const workspaceId = await ensureWorkspace(workspacePath)
  const id = await services.sessions.create({ workspaceId, agentPreset: AGENT_PRESET })
  assign(deckId, id)
  if (title) {
    services.sessions.using(id, { source: 'controllerOperation' }, async (reference) => {
      const binding = await reference.ready
      await binding.session.rename(title)
    }).catch(() => {})
  }
  return id
}

/**
 * 记下的会话还能不能接着用：DSH 还列着它，并且跑的是工作台的 preset。
 * 改用 preset 之前建的会话跑的是 standard，没有 open-slide 技能，preset 开始对话后也不能再切，只能换一段新的。
 * preset 记在会话的 agentPreset 投影里，列表项的 projectionValues 带着它。
 * @param {object|undefined} summary - DSH 会话列表里的这一项。
 * @returns {boolean} 能否复用。
 */
export function reusable(summary) {
  return summary?.projectionValues?.agentPreset === AGENT_PRESET
}

/**
 * 这个 deck 的对话会话：之前开过、DSH 还列着且是工作台 preset 就接着用，否则新建一个（同一 deck 并发调用只建一次）。
 * @param {{deckId: string, workspacePath: string, title?: string}} options - deck、工作区、会话标题。
 * @returns {Promise<string>} 会话 id。
 */
export function ensureChat({ deckId, workspacePath, title }) {
  if (!available) return Promise.reject(new Error('DSH session services are unavailable'))
  const known = byDeck[deckId]
  if (known && reusable(services.sessions.list?.getSnapshot?.()?.byId?.[known])) return Promise.resolve(known)
  if (!pending.has(deckId)) {
    pending.set(deckId, createFor(deckId, workspacePath, title).finally(() => pending.delete(deckId)))
  }
  return pending.get(deckId)
}

/**
 * 这个 deck 换一段新对话（Agent 面板标题栏的「新对话」）。
 * @param {{deckId: string, workspacePath: string, title?: string}} options - deck、工作区、会话标题。
 * @returns {Promise<string>} 会话 id。
 */
export function newChat({ deckId, workspacePath, title }) {
  if (!available) return Promise.reject(new Error('DSH session services are unavailable'))
  return createFor(deckId, workspacePath, title)
}

/**
 * 首页提交：给新 deck 开对话，把需求原生发成第一条消息（和在输入框里按回车一样）。
 * @param {{deckId: string, workspacePath: string, title?: string, prompt: string}} options - deck、工作区、标题与需求。
 * @returns {Promise<string>} 会话 id。
 */
export async function startChat({ deckId, workspacePath, title, prompt }) {
  const id = await ensureChat({ deckId, workspacePath, title })
  await services.sessions.using(id, { source: 'controllerOperation' }, async (reference) => {
    const binding = await reference.ready
    const result = await binding.session.prompt([{ type: 'text', text: prompt }], 'queue')
    if (result && result.ok === false) throw new Error(result.error?.message ?? 'prompt rejected')
  })
  return id
}

/**
 * 让 open-slide 下次进编辑器时 Agent 面板是开着的（它的停靠栏状态存在同源 localStorage 里，启动时读）。
 */
export function openAgentDock() {
  try {
    globalThis.localStorage?.setItem('open-slide:agent-dock', '1')
  } catch {
    // 隐私模式里 localStorage 可能不可用
  }
}

/**
 * 持有一个会话引用（渲染期间不让 DSH 把它的作用域收掉）；调用方用完 release()。
 * @param {string} id - 会话 id。
 * @returns {object} SessionReference（交给 SessionProvider）。
 */
export function retainChat(id) {
  return services.sessions.retain(id, { source: 'slidesChat' })
}
