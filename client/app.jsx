// 面板主体：直接把 open-slide 自己的页面铺满（deck 浏览 → 编辑器 → inspector → 演示 → 导出）。
// 我们只盖一层「加载中」、两个小按钮，外加把 DSH 的明暗主题和界面语言同步进去。
import React from 'react'
import { appLocaleId, applyLocale, applyTheme, hostIsDark, watchHostTheme } from './appearance.js'
import { appUrl, externalUrl } from './api.js'
import { injectEmbedStyle, watchBrandLogo, watchDragRegion } from './embed.js'
import { lang, subscribeLang, t } from './i18n.js'
import { IconButton, Spinner } from './ui.jsx'

export function AppFrame({ state, title }) {
  const url = appUrl(state)
  const frameRef = React.useRef(null)
  // 手动重载：换 key 让 iframe 重新挂载
  const [nonce, setNonce] = React.useState(0)
  const [loaded, setLoaded] = React.useState(false)
  // 语言对不上时 reload 一次就够，避免死循环
  const localeSynced = React.useRef(false)

  React.useEffect(() => {
    setLoaded(false)
    localeSynced.current = false
  }, [url])

  // open-slide 的 provider 图标写死了 claude / codex：换成我们的图标，并在重渲染后补上；
  // 顺便把页面顶部那一行标记成窗口拖拽区（只在桌面客户端里生效）
  React.useEffect(() => {
    const doc = frameRef.current?.contentDocument
    if (!doc) return undefined
    const stopBrand = watchBrandLogo(doc)
    const stopDrag = watchDragRegion(doc)
    return () => {
      stopBrand()
      stopDrag()
    }
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
  const openExternal = () => {
    const target = externalUrl(state)
    if (target) window.open(target, '_blank', 'noopener,noreferrer')
  }

  const onLoad = (event) => {
    const frame = event.currentTarget
    const doc = frame.contentDocument
    // 同源：藏掉 open-slide 首页自带的左侧导航，只留右侧内容
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
  }

  if (!url) return null

  return (
    <div className="sw-app">
      {loaded ? null : (
        <div className="sw-app-loading" aria-hidden="true">
          <Spinner size={18} />
          <span>{t('frame.loading')}</span>
        </div>
      )}
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
      <div className="sw-app-actions">
        <IconButton icon="refresh" label={t('frame.reload')} onClick={reload} />
        <IconButton icon="external" label={t('frame.openExternal')} onClick={openExternal} />
      </div>
    </div>
  )
}