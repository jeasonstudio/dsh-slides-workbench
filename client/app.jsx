// 面板主体：直接把 open-slide 自己的页面铺满（deck 浏览 → 编辑器 → inspector → 演示 → 导出）。
// 我们只盖一层「加载中」、几个小按钮，外加把 DSH 的明暗主题和界面语言同步进去。
import React from 'react'
import { appLocaleId, applyLocale, applyTheme, hostIsDark, watchHostTheme } from './appearance.js'
import { appUrl, openExternal, revealWorkspace } from './api.js'
import { AgentDockChat, seedAgentWidth } from './chat.jsx'
import { injectEmbedStyle, watchDragRegion, watchUseThemeButton } from './embed.js'
import { lang, subscribeLang, t } from './i18n.js'
import { LoadingScreen } from './setup.jsx'
import { IconButton } from './ui.jsx'

export function AppFrame({ state, title, route = '', onHome, onUseTheme, renderSlot, SessionProvider }) {
  const url = appUrl(state, route)
  // 在 iframe 加载前定好 Agent 面板的默认宽度（和 Format / Design 一样）
  React.useState(seedAgentWidth)
  const frameRef = React.useRef(null)
  // 手动重载：换 key 让 iframe 重新挂载
  const [nonce, setNonce] = React.useState(0)
  const [loaded, setLoaded] = React.useState(false)
  // 每次 iframe 文档（重新）加载都换一个值：Agent 面板的测量要跟着换文档
  const [loadId, setLoadId] = React.useState(0)
  // Agent 面板开着时它的宽度：右边缘那列小按钮让到它左边
  const [dockWidth, setDockWidth] = React.useState(0)
  // 语言对不上时 reload 一次就够，避免死循环
  const localeSynced = React.useRef(false)
  const useTheme = React.useRef(onUseTheme)
  useTheme.current = onUseTheme

  React.useEffect(() => {
    setLoaded(false)
    localeSynced.current = false
  }, [url])

  // 页面顶部那一行标记成窗口拖拽区（只在桌面客户端里生效）；
  // 模板详情页加一个「用这个模板」，点了回首页挂成叠加项
  React.useEffect(() => {
    const doc = frameRef.current?.contentDocument
    if (!doc) return undefined
    const stops = [
      watchDragRegion(doc),
      watchUseThemeButton(doc, { label: t('frame.useTheme'), onUse: (theme) => useTheme.current?.(theme) }),
    ]
    return () => stops.forEach((stop) => stop())
  }, [nonce, loaded])

  // DSH 切明暗：直接改 iframe 里的 class，不重载页面
  React.useEffect(() => watchHostTheme((dark) => {
    applyTheme(frameRef.current?.contentDocument, dark)
  }), [])

  // DSH 切语言：写进 open-slide 的 locale 存储，再让它重载一次
  React.useEffect(() => subscribeLang(() => {
    const changed = applyLocale(appLocaleId(lang()))
    localeSynced.current = false
    if (changed && frameRef.current?.contentWindow) {
      try {
        frameRef.current.contentWindow.location.reload()
      } catch {
        // 跨源或还没加载好：下次 load 时再同步
      }
    }
  }), [])

  const reload = () => {
    setLoaded(false)
    setNonce((n) => n + 1)
  }

  const onLoad = (event) => {
    const frame = event.currentTarget
    const doc = frame.contentDocument
    // 同源：藏掉 open-slide 首页自带的左侧导航（只留右侧内容）；Agent 面板的原内容让位给 DSH 对话
    injectEmbedStyle(doc)
    // 主题跟随外壳
    applyTheme(doc, hostIsDark())
    // 语言跟随外壳：首次对不上就重载一次
    if (!localeSynced.current) {
      localeSynced.current = true
      if (applyLocale(appLocaleId(lang()))) {
        try {
          frame.contentWindow?.location.reload()
          return
        } catch {
          // 重载失败就先用默认语言
        }
      }
    }
    setLoaded(true)
    setLoadId((n) => n + 1)
  }

  if (!url) return null

  return (
    <div className="sw-app">
      {loaded ? null : <LoadingScreen status={t('load.boot')} overlay />}
      <iframe
        key={`${url}#${nonce}`}
        ref={frameRef}
        className={`sw-app-frame ${loaded ? 'is-ready' : ''}`}
        src={url}
        title={title || t('frame.title')}
        allow="fullscreen; clipboard-write; clipboard-read"
        referrerPolicy="no-referrer"
        onLoad={onLoad}
      />
      {loaded ? <AgentDockChat frame={frameRef.current} nonce={`${nonce}:${loadId}`} state={state} renderSlot={renderSlot} SessionProvider={SessionProvider} onDockWidth={setDockWidth} /> : null}
      <div className="sw-app-actions" style={dockWidth ? { right: dockWidth + 8 } : undefined}>
        {onHome ? <IconButton icon="home" label={t('frame.home')} onClick={onHome} /> : null}
        <IconButton icon="refresh" label={t('frame.reload')} onClick={reload} />
        <IconButton icon="folder" label={t('frame.revealWorkspace')} onClick={revealWorkspace} />
        <IconButton icon="external" label={t('frame.openExternal')} onClick={() => openExternal(state, route)} />
      </div>
    </div>
  )
}
