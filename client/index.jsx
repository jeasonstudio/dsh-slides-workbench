// dsh-slides-workbench 浏览器半片：侧栏一个「演示文稿」入口，
// 点开就是 open-slide 自己的页面（Slides / Themes / Assets 都在它自己的左侧导航里），
// 插件不重画任何 deck UI。
//
// 注：DSH 的 sidebar.panellist 是扁平列表（每行是宿主渲染的 button，只有 id/order/label），
// 没有 children 或展开态，所以侧栏做不出「可展开的父级菜单」。
import React from 'react'
import { AppFrame } from './app.jsx'
import { getSnapshot, refresh, useSnapshot, watchState } from './api.js'
import { setHostLang, subscribeLang, t, useLang } from './i18n.js'
import { ServerView, SetupView } from './setup.jsx'
import css from './styles.css'
import { Button, LangSwitch, Spinner, ToastHost } from './ui.jsx'
import { dismissToast } from './api.js'

/** 三个入口：key 同时是侧栏行 id 和 main 面板 key，route 是 open-slide 的路径。 */
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

function BootState() {
  return (
    <div className="sw-boot">
      <LangSwitch floating />
      <Spinner size={20} />
      <p>{t('boot.loading')}</p>
    </div>
  )
}

function FailState({ error }) {
  return (
    <div className="sw-fail">
      <LangSwitch floating />
      <h2>{t('error.title')}</h2>
      <p className="sw-lead">{t('error.lead')}</p>
      {error ? <p className="sw-hint">{error}</p> : null}
      <div className="sw-actions">
        <Button variant="primary" icon="refresh" onClick={() => refresh()}>{t('common.retry')}</Button>
      </div>
    </div>
  )
}

/** 面板：三种过渡态之后，把 open-slide 的页面铺满。 */
function Panel() {
  // 切语言时整棵树重新渲染
  useLang()
  const snap = useSnapshot()
  const state = snap.state

  React.useEffect(() => watchState(), [])

  let body
  if (!state) body = snap.loading ? <BootState /> : <FailState error={snap.error} />
  else if (!state.workspace?.scaffolded || !state.workspace?.installed) body = <SetupView />
  else if (state.server?.status !== 'running') body = <ServerView />
  else body = <AppFrame state={state} />

  return (
    <div className="sw-root">
      <style>{css}</style>
      {body}
      <ToastHost toast={snap.toast} onDismiss={dismissToast} />
    </div>
  )
}

export const inject = ['slots']

/** 先接住宿主语言，再注册侧栏，保证第一帧的 label 就是对的。 */
function followHostLocale(ctx) {
  try {
    const locale = ctx.get('locale')
    if (!locale || typeof locale.getLocale !== 'function') return
    const active = locale.getLocale()?.active
    // active 可能是 auto/system 这类还没解析的值，setHostLang 自己会忽略
    if (active) setHostLang(active)
    if (typeof locale.subscribe === 'function') {
      ctx.effect(() => {
        const off = locale.subscribe(() => {
          const next = locale.getLocale?.()?.active
          if (next) setHostLang(next)
        })
        return () => {
          if (typeof off === 'function') off()
        }
      }, 'dsh-slides-workbench: host locale')
    }
  } catch {
    // locale 服务不可用就按浏览器语言走
  }
}

export function apply(ctx) {
  followHostLocale(ctx)

  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, Panel))

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