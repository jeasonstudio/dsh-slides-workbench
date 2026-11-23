// open-slide 编辑器里的 Agent 面板：外壳（工具栏 Agent 按钮、快捷键 A、右侧停靠栏、拖拽改宽）还是
// open-slide 自己的，面板里的内容换成 DSH 原生对话流 + 输入框，渲染完全交给 DSH。
//
// 嵌法照 DSH 自己的子代理侧栏对话（dsh-client-ui-subagent 的 sidebar-chat）：
//   面板（main slot 的 entry）声明一个会话作用域的子 slot `slides.chat.conversation`，
//   用 SessionProvider 把会话引用套在外面渲染它；这个子 slot 的 entry（ChatConversation）
//   再渲染 DSH 的可复用对话工厂 `conversation.content`（variant: 'embedded'），视图固定在 Chat。
//
// 位置：DSH 的组件、样式、弹层都在外层文档里，不能塞进 iframe；所以对话渲染在外层，
// 精确盖在 iframe 里 Agent 面板的内容区上（跟着它开合、拖宽、动画实时对齐），
// open-slide 自己的 Agent 面板内容藏起来（见 embed.js）。
import React from 'react'
import { t } from './i18n.js'
import { chatAvailable, chatMap, ensureChat, newChat, retainChat, subscribe } from './session.js'
import { Icon, IconButton, Spinner } from './ui.jsx'

/** 面板声明的子 slot 名。 */
export const CHAT_SLOT = 'slides.chat.conversation'

// open-slide 停靠栏左边缘的拖拽条宽（resize-handle 的 w-1.5）：不盖住它，拖宽照常
const RESIZE_HANDLE_PX = 6

/** 嵌入的对话只显示 Chat 视图（不要 Trajectory 之类的标签）。 */
function FixedChatView(props) {
  return props.renderSlot('conversation.session', { view: 'chat' })
}

const VIEW_SLOTS = { views: FixedChatView }

/**
 * 子 slot 的 entry：在 SessionProvider 里渲染 DSH 的对话工厂。
 * 不用 DSH 的欢迎页（hero）：Agent 面板一打开就是对话的样子——消息区 + 贴底的输入框，
 * 和 open-slide 原来的面板一致；只在会话历史还在加载时用 settling，免得闪一下。
 */
export function ChatConversation({ sessionId, useSession, useSessions, renderFactorySlot }) {
  const session = useSession((value) => value)
  const summaryBlank = useSessions((state) => state.byId[sessionId]?.blank)
  const settling = session.openState === 'loading' && summaryBlank !== true && session.blank
  return renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false }, { slots: VIEW_SLOTS })
}

// ---- 主题：DSH 对话的颜色换成 open-slide 面板自己的（跟着它的明暗实时变） ----

/** open-slide 用到的颜色变量（shadcn 体系），从 iframe 的 html 上读。 */
const OPEN_SLIDE_VARS = ['sidebar', 'background', 'foreground', 'card', 'muted', 'muted-foreground', 'accent', 'border', 'input', 'primary', 'primary-foreground', 'ring']

/**
 * 读 open-slide 当前的颜色（亮 / 暗切换后重读）。
 * @param {Document} doc - iframe 文档。
 * @returns {Record<string, string>|null} 变量名 → 值；读不到就 null。
 */
function readPalette(doc) {
  const html = doc?.documentElement
  if (!html) return null
  const style = doc.defaultView.getComputedStyle(html)
  const palette = {}
  for (const name of OPEN_SLIDE_VARS) {
    const value = style.getPropertyValue(`--${name}`).trim()
    if (value) palette[name] = value
  }
  const dock = doc.querySelector('[data-agent-dock]')
  if (dock) palette.sidebar = doc.defaultView.getComputedStyle(dock).backgroundColor
  // 字体也用 open-slide 的
  if (doc.body) palette.font = doc.defaultView.getComputedStyle(doc.body).fontFamily
  return palette.background && palette.foreground ? palette : null
}

/**
 * open-slide 颜色 → DSH 的语义 token（只在 Agent 面板这棵子树里覆盖，DSH 其它地方不受影响）。
 * 对照 open-slide 原来的 Agent 面板：面板底 bg-sidebar、用户消息 bg-muted、输入框 bg-background + border。
 * @param {Record<string, string>|null} p - readPalette 的结果。
 * @returns {Record<string, string>|undefined} 要写到 .sw-chat 上的 CSS 变量。
 */
export function dshTokens(p) {
  if (!p) return undefined
  const sidebar = p.sidebar || p.background
  const muted = p['muted-foreground'] || p.foreground
  const border = p.border || p.input
  return {
    background: sidebar,
    color: p.foreground,
    fontFamily: p.font || undefined,
    '--sw-chat-bg': sidebar,
    '--dsw-alias-bg-base': sidebar,
    '--dsw-alias-bg-layer-1': sidebar,
    '--dsw-alias-bg-layer-2': p.background,
    '--dsw-alias-bg-layer-3': p.background,
    '--dsw-alias-card-fill': p.background,
    '--dsw-alias-card-fill-hover': p.accent || p.muted,
    '--dsw-alias-card-tile-fill': p.background,
    '--dsw-alias-button-elevated-fill': p.background,
    '--dsw-specific-input-major': p.background,
    '--dsw-alias-border-l1': `color-mix(in oklab, ${border} 60%, transparent)`,
    '--dsw-alias-border-l2': border,
    '--dsw-alias-border-l3': border,
    '--dsw-alias-border-l4': p.input || border,
    '--dsw-alias-label-primary': p.foreground,
    '--dsw-alias-label-secondary': muted,
    '--dsw-alias-label-tertiary': `color-mix(in oklab, ${muted} 80%, ${sidebar})`,
    '--dsw-alias-label-caption': `color-mix(in oklab, ${muted} 80%, ${sidebar})`,
    '--dsw-alias-label-quaternary': `color-mix(in oklab, ${muted} 55%, ${sidebar})`,
    '--dsw-alias-interactive-bg-hover': p.accent || p.muted,
    '--dsw-alias-interactive-bg-active': p.muted || p.accent,
    '--dsw-specific-bubble': p.muted || p.accent,
    '--dsw-specific-selector': p.muted || p.accent,
    '--dsw-alias-button-info-fill': p.primary || p.foreground,
    '--dsw-alias-state-business-tertiary': p.muted || p.accent,
    '--dsw-alias-state-business-primary': p.foreground,
    '--dsw-alias-button-primary-fill': p.primary || p.foreground,
    '--dsw-alias-label-primary-inverted': p['primary-foreground'] || p.background,
    '--dsw-alias-label-on-color': p['primary-foreground'] || p.background,
  }
}

/** 当前 deck 的会话 id 与服务可用性。 */
function useDeckChat(deckId) {
  const map = React.useSyncExternalStore(subscribe, chatMap)
  const available = React.useSyncExternalStore(subscribe, chatAvailable)
  return { id: deckId ? map[deckId] ?? null : null, available }
}

/** 持有当前会话的引用，id 变了或卸载时释放。 */
function useSessionReference(id) {
  const [reference, setReference] = React.useState(null)
  React.useEffect(() => {
    if (!id) {
      setReference(null)
      return undefined
    }
    const ref = retainChat(id)
    setReference(ref)
    return () => {
      setReference(null)
      ref.release()
    }
  }, [id])
  return reference
}

/** iframe 里当前打开的 deck（open-slide 是单页应用，路由在 iframe 自己的 location 里）。 */
function deckOf(doc) {
  try {
    return /\/s\/([^/?#]+)/.exec(doc?.location?.pathname ?? '')?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * 盯着 iframe 里的 Agent 停靠栏：开着时给出内容区在 iframe 里的位置（已裁到停靠栏可见范围内），关着给 null；
 * 顺带给出当前 deck。开合动画、拖宽、窗口缩放、换页都会触发重新测量。
 * @param {HTMLIFrameElement|null} frame - open-slide 的 iframe。
 * @param {unknown} nonce - iframe 重新加载时变化。
 */
function useAgentDock(frame, nonce) {
  const [dock, setDock] = React.useState({ rect: null, deckId: null, palette: null })
  React.useEffect(() => {
    const doc = frame?.contentDocument
    const win = frame?.contentWindow
    if (!doc?.body || !win) return undefined
    let raf = 0
    let last = ''
    const measure = () => {
      raf = 0
      const host = doc.querySelector('[data-agent-dock]')
      const content = host?.querySelector(':scope > .sidebar-swap:not([hidden])')
      let rect = null
      if (host && content && !host.hasAttribute('inert')) {
        const outer = host.getBoundingClientRect()
        const inner = content.getBoundingClientRect()
        const left = Math.max(outer.left + RESIZE_HANDLE_PX, inner.left)
        const right = Math.min(outer.right, inner.right)
        if (right - left > 40 && outer.height > 40) rect = { left, top: outer.top, width: right - left, height: outer.height }
      }
      const deckId = deckOf(doc)
      const palette = rect ? readPalette(doc) : null
      const key = JSON.stringify([rect && Object.values(rect).map(Math.round), deckId, palette])
      if (key === last) return
      last = key
      setDock({ rect, deckId, palette })
    }
    const schedule = () => {
      if (!raf) raf = win.requestAnimationFrame(measure)
    }
    const mutations = new win.MutationObserver(schedule)
    mutations.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-agent-dock', 'hidden', 'inert', 'style'] })
    // 明暗由外壳写在 iframe 的 html.class 上（appearance.js），open-slide 的主题也写在 html 上
    mutations.observe(doc.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
    const sizes = new win.ResizeObserver(schedule)
    sizes.observe(doc.body)
    win.addEventListener('resize', schedule)
    // 停靠栏开合时宽度走 CSS 动画：动画期间每帧量一次
    let animating = 0
    const tick = () => {
      measure()
      animating = win.requestAnimationFrame(tick)
    }
    const startTick = (event) => {
      if (!event.target?.matches?.('[data-editor-sidebar]') || animating) return
      tick()
    }
    const stopTick = (event) => {
      if (!event.target?.matches?.('[data-editor-sidebar]')) return
      win.cancelAnimationFrame(animating)
      animating = 0
      schedule()
    }
    doc.addEventListener('transitionstart', startTick, true)
    doc.addEventListener('transitionend', stopTick, true)
    doc.addEventListener('transitioncancel', stopTick, true)
    measure()
    return () => {
      mutations.disconnect()
      sizes.disconnect()
      doc.removeEventListener('transitionstart', startTick, true)
      doc.removeEventListener('transitionend', stopTick, true)
      doc.removeEventListener('transitioncancel', stopTick, true)
      win.removeEventListener('resize', schedule)
      win.cancelAnimationFrame(raf)
      win.cancelAnimationFrame(animating)
    }
  }, [frame, nonce])
  return dock
}

// open-slide 自己的面板宽度（resize-handle 的 useStoredWidth）：Format / Design 默认 320，Agent 最小 300
const EDITOR_WIDTH_KEY = 'open-slide:editor-panel-width'
const AGENT_WIDTH_KEY = 'open-slide:agent-panel-width'
const EDITOR_DEFAULT_W = 320
const AGENT_MIN_W = 300
const AGENT_MAX_W = 720
const SEEDED_KEY = 'slides-workbench.agent-width-seeded'

/**
 * Agent 面板默认和 Format / Design 一样宽（open-slide 默认给 Agent 380）。只在第一次做：
 * open-slide 一挂上停靠栏就把宽度写进 localStorage，之后用户自己拖过的宽度照常保留。
 * iframe 和面板同源、共用 localStorage，所以在 iframe 加载前写进去，它启动时就会读到。
 */
export function seedAgentWidth() {
  try {
    const store = globalThis.localStorage
    if (!store || store.getItem(SEEDED_KEY)) return
    const editor = Number(store.getItem(EDITOR_WIDTH_KEY))
    const width = Number.isFinite(editor) && editor > 0 ? editor : EDITOR_DEFAULT_W
    store.setItem(AGENT_WIDTH_KEY, String(Math.min(AGENT_MAX_W, Math.max(AGENT_MIN_W, width))))
    store.setItem(SEEDED_KEY, '1')
  } catch {
    // 隐私模式里 localStorage 可能不可用
  }
}

/** 关掉 open-slide 的 Agent 停靠栏：点它工具栏上的 Agent 按钮（窄工具栏时按钮不在，就按一下快捷键 A）。 */
function closeDock(frame) {
  const doc = frame?.contentDocument
  const button = doc?.querySelector('button[data-agent-ui][aria-pressed="true"]')
  if (button) {
    button.click()
    return
  }
  doc?.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown', { key: 'a', bubbles: true }))
}

/**
 * Agent 面板里的 DSH 对话：盖在 open-slide 停靠栏的内容区上。
 * @param {{frame: HTMLIFrameElement|null, nonce: unknown, state: object, renderSlot?: Function, SessionProvider?: Function}} props - iframe、slot 渲染能力。
 */
export function AgentDockChat({ frame, nonce, state, renderSlot, SessionProvider }) {
  const { rect, deckId, palette } = useAgentDock(frame, nonce)
  const { id, available } = useDeckChat(deckId)
  const reference = useSessionReference(available ? id : null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(null)
  const workspacePath = state?.workspace?.path
  const title = deckId ? (state?.decks ?? []).find((deck) => deck.id === deckId)?.title : undefined
  const open = Boolean(rect && deckId)
  // 正文排版和 open-slide Agent 面板一致（12.5px · 1.5）；颜色、字体跟着它的主题
  const textStyle = { fontSize: '12.5px', lineHeight: 1.5, fontWeight: 400, letterSpacing: 'normal', ...(palette ? { color: palette.foreground, fontFamily: palette.font } : null) }
  const tokens = dshTokens(palette)

  // 面板打开时：这个 deck 之前的对话接着用，没有就开一段
  React.useEffect(() => {
    if (!open || !available || !workspacePath) return
    setError(null)
    ensureChat({ deckId, workspacePath, title }).catch((err) => setError(err?.message ?? String(err)))
  }, [open, available, deckId, workspacePath, title])

  if (!open) return null

  const fresh = () => {
    if (busy || !workspacePath) return
    setBusy(true)
    newChat({ deckId, workspacePath, title })
      .then(() => setError(null), (err) => setError(err?.message ?? String(err)))
      .finally(() => setBusy(false))
  }

  let body
  if (!available || typeof SessionProvider !== 'function' || typeof renderSlot !== 'function') body = <p className="sw-chat-note">{t('chat.unavailable')}</p>
  else if (error) body = <p className="sw-chat-note is-error">{t('chat.failed', { error })}</p>
  else if (!reference) body = <div className="sw-chat-note"><Spinner size={16} /></div>
  else body = <SessionProvider session={reference}>{renderSlot(CHAT_SLOT, {})}</SessionProvider>

  return (
    <aside
      className="sw-chat"
      aria-label={t('chat.title')}
      style={{ ...tokens, left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
    >
      <header className="sw-chat-head">
        <Icon name="chat" size={15} />
        <span className="sw-chat-title">{title || t('chat.title')}</span>
        <span className="sw-chat-spacer" />
        {available ? <IconButton icon="plus" label={t('chat.new')} onClick={fresh} disabled={busy} /> : null}
        <IconButton icon="close" label={t('chat.close')} onClick={() => closeDock(frame)} />
      </header>
      <div className="sw-chat-body" style={textStyle}>{body}</div>
    </aside>
  )
}
