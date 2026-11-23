// dsh-slides-workbench 浏览器半片：侧栏一个「演示文稿」入口，
// 点开先是工作台首页（灵感墙），进去就是 open-slide 自己的页面（deck 列表 / 模板 / 编辑器），
// 插件不重画任何 deck UI。open-slide 编辑器里 Agent 面板的内容换成 DSH 原生对话（见 chat.jsx）。
//
// 注：DSH 的 sidebar.panellist 是扁平列表（每行是宿主渲染的 button，只有 id/order/label），
// 没有 children 或展开态，所以侧栏做不出「可展开的父级菜单」。
import React from 'react'
import { AppFrame } from './app.jsx'
import { CHAT_SLOT, ChatConversation } from './chat.jsx'
import { HomeView } from './home.jsx'
import { dismissToast, getSnapshot, syncThemes, useSnapshot, watchState } from './api.js'
import { setHostLang, subscribeLang, t, useLang } from './i18n.js'
import { bindServices } from './session.js'
import { PreparingView } from './setup.jsx'
import css from './styles.css'
import { ToastHost } from './ui.jsx'

/** 唯一入口：侧栏行 id 同时是 main 面板 key。 */
const PANEL_ID = 'slides-workbench'

function SlidesIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="4.5" width="18" height="12.5" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

/**
 * 面板：准备态 → 首页（灵感墙）→ 铺满的 open-slide 页面。
 * renderSlot / SessionProvider 由 DSH 的 slot 渲染器传进来（注册时声明了会话作用域的子 slot），
 * 交给编辑器外框，在 open-slide 的 Agent 面板里渲染 DSH 原生对话。
 */
function Panel({ renderSlot, SessionProvider }) {
  // 切语言时整棵树重新渲染
  useLang()
  const snap = useSnapshot()
  const state = snap.state
  // 首页（灵感墙）↔ open-slide 页面（route：'' 是 deck 列表，themes 是模板，s/<id> 是编辑器）；
  // mods：回首页时预先挂上的叠加项（从模板详情点「用这个模板」带回来的）
  const [view, setView] = React.useState({ mode: 'home', route: '', mods: null })

  React.useEffect(() => watchState(), [])

  const openRoute = route => setView({ mode: 'app', route, mods: null })
  // 打开模板页时顺手把内置官方模板合并一次；写进 themes/ 后 open-slide 自己热更新
  const openThemes = () => {
    syncThemes()
    openRoute('themes')
  }
  const goHome = (mods = null) => setView({ mode: 'home', route: '', mods })
  const pickTheme = ({ id, name }) => goHome([{ id: `theme:${id}`, kind: 'theme', label: name || id, text: t('home.themeMod', { id, name: name || id }) }])

  const ready = state?.workspace?.installed && state?.server?.status === 'running'
  let body
  if (!ready) body = <PreparingView />
  else if (view.mode === 'app') body = <AppFrame state={state} route={view.route} onHome={() => goHome()} onUseTheme={pickTheme} renderSlot={renderSlot} SessionProvider={SessionProvider} />
  else body = <HomeView state={state} initialMods={view.mods} onOpen={deckId => openRoute(`s/${deckId}`)} onBrowse={() => openRoute('')} onThemes={openThemes} />

  return (
    <div className="sw-root">
      <style>{css}</style>
      {body}
      <ToastHost toast={snap.toast} onDismiss={dismissToast} />
    </div>
  )
}

export const inject = ['slots']

/**
 * 语言时刻跟着 DSH 外壳：locale 服务一就绪就接上（插件 apply 时它可能还没起来，
 * 只在 apply 那一刻 ctx.get 一次会拿不到、退回浏览器语言），之后每次切换都同步。
 * @param {object} ctx - 客户端插件上下文。
 */
function followHostLocale(ctx) {
  const bind = (locale) => {
    if (!locale || typeof locale.getLocale !== 'function') return () => {}
    const sync = () => setHostLang(locale.getLocale()?.active)
    sync()
    const off = typeof locale.subscribe === 'function' ? locale.subscribe(sync) : null
    return () => {
      if (typeof off === 'function') off()
    }
  }
  if (typeof ctx.inject === 'function') {
    ctx.inject(['locale'], (scope) => {
      scope.effect(() => bind(scope.locale), 'dsh-slides-workbench: host locale')
    })
    return
  }
  // 老宿主没有 inject：退回一次性读取
  try {
    const locale = ctx.get?.('locale')
    if (locale) ctx.effect(() => bind(locale), 'dsh-slides-workbench: host locale')
  } catch {
    // locale 服务不可用就按浏览器语言走
  }
}

/**
 * Agent 面板里的对话用到的 DSH 会话服务（只在带会话界面的 profile 里有；没有就显示一句说明），
 * 以及对话正文的 slot entry。
 */
function registerChat(ctx) {
  if (typeof ctx.inject !== 'function') return
  ctx.inject(['sessions', 'workspaces'], (scope) => {
    scope.effect(() => {
      bindServices({ sessions: scope.sessions, workspaces: scope.workspaces })
      return () => bindServices({ sessions: null, workspaces: null })
    }, 'dsh-slides-workbench: session services')
  })
  ctx.effect(() => ctx.slots.inject(CHAT_SLOT, () => ctx.slots.register({ name: CHAT_SLOT }, ChatConversation)), 'dsh-slides-workbench: chat conversation')
}

export function apply(ctx) {
  followHostLocale(ctx)

  // 面板声明一个会话作用域的子 slot：Agent 面板里用 SessionProvider 套着渲染它
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    children: { [CHAT_SLOT]: { kind: 'single', scope: 'session' } },
  }, Panel))
  registerChat(ctx)

  // 侧栏入口；label 是 thunk，但换语言时仍然重注册一份
  ctx.effect(() => {
    let release = null
    const mount = () => {
      release?.()
      release = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 6,
        label: () => t('panel.label'),
      }, SlidesIcon))
    }
    mount()
    const off = subscribeLang(mount)
    return () => {
      off()
      release?.()
    }
  }, 'dsh-slides-workbench: sidebar entry')
}

// 调试用：面板里可以直接拿到当前状态镜像
export { getSnapshot }