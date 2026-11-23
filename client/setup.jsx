// 过渡态：工作台读取中 / 首次安装 open-slide / 预览服务启动中 —— 统一成一个加载画面；
// 只有出错才给操作（重试 + 可展开的日志）。就绪以后面板直接铺首页或 open-slide 页面。
import React from 'react'
import { initialize, refresh, startServer, useSnapshot } from './api.js'
import { t } from './i18n.js'
import { Button, LogView } from './ui.jsx'

/** 工作台图标（与 bundle 图标同一图形，颜色走主题色 token）。 */
function Mark() {
  return (
    <svg className="sw-load-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="var(--primary)" />
      <g transform="translate(11 11) scale(1.75)" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.75 4.75H22.25" />
        <path d="M2.75 4.75V16.25C2.75 17.3546 3.64543 18.25 4.75 18.25H19.25C20.3546 18.25 21.25 17.3546 21.25 16.25V4.75" />
        <path d="M12 20.75V18.25" />
        <path d="M10 14.0397V8.96033C10 8.55582 10.4553 8.31874 10.7867 8.55071L14.4148 11.0904C14.6992 11.2894 14.6992 11.7106 14.4148 11.9096L10.7867 14.4493C10.4553 14.6813 10 14.4442 10 14.0397Z" fill="#fff" stroke="none" />
      </g>
    </svg>
  )
}

/**
 * 加载画面：图标 + 一行进度 + 细进度条。overlay 时盖在 iframe 上（打开 open-slide 页面期间）。
 * @param {{status: string, caption?: string, overlay?: boolean}} props - 文案与模式。
 */
export function LoadingScreen({ status, caption, overlay = false }) {
  return (
    <div className={`sw-load ${overlay ? 'is-overlay' : ''}`} role="status" aria-live="polite">
      <Mark />
      <p className="sw-load-title">{t('app.name')}</p>
      <p className="sw-load-status">{status}</p>
      <div className="sw-load-bar" aria-hidden="true"><span /></div>
      {caption ? <p className="sw-load-caption">{caption}</p> : null}
    </div>
  )
}

function ProblemScreen({ title, message, onRetry, log }) {
  return (
    <div className="sw-load is-problem" role="alert">
      <Mark />
      <p className="sw-load-title">{title}</p>
      {message ? <p className="sw-load-status">{message}</p> : null}
      <div className="sw-actions">
        <Button variant="primary" icon="refresh" onClick={onRetry}>{t('common.retry')}</Button>
      </div>
      {log ? (
        <details className="sw-load-log">
          <summary>{t('load.showLog')}</summary>
          <LogView title={log.title} lines={log.lines} />
        </details>
      ) : null}
    </div>
  )
}

/**
 * 还不能进首页时显示什么：读取中 → 首次安装 → 启动预览；任一步失败给重试。
 * @returns {React.ReactElement|null} 过渡画面；已就绪返回 null。
 */
export function PreparingView() {
  const snap = useSnapshot()
  const state = snap.state
  const workspace = state?.workspace ?? {}
  const install = workspace.install ?? {}
  const server = state?.server ?? {}
  const installing = state && !workspace.installed
  const installFailed = installing && install.status === 'error'
  const serverFailed = state && workspace.installed && server.status === 'error'
  const serverIdle = state && workspace.installed && server.status !== 'running' && server.status !== 'starting' && !serverFailed

  // 用户不用点任何东西：还没开始装就装，预览服务没在跑就拉起来（各只自动触发一次）
  const fired = React.useRef({ install: false, server: false })
  React.useEffect(() => {
    if (installing && !installFailed && install.status !== 'running' && snap.busy !== 'setup' && !fired.current.install) {
      fired.current.install = true
      initialize()
    }
    if (serverIdle && snap.busy !== 'server' && !fired.current.server) {
      fired.current.server = true
      startServer()
    }
  }, [installing, installFailed, install.status, serverIdle, snap.busy])

  if (!state) {
    if (snap.loading) return <LoadingScreen status={t('load.boot')} />
    return <ProblemScreen title={t('load.bootFailed')} message={snap.error} onRetry={() => refresh()} />
  }
  if (installFailed) {
    return (
      <ProblemScreen
        title={t('load.installFailed')}
        message={install.error || t('load.unknownError')}
        onRetry={initialize}
        log={{ title: t('load.installLog'), lines: install.log }}
      />
    )
  }
  if (installing) return <LoadingScreen status={t('load.install')} caption={t('load.installCaption')} />
  if (serverFailed) {
    return (
      <ProblemScreen
        title={t('load.serverFailed')}
        message={server.error || t('load.unknownError')}
        onRetry={() => startServer()}
        log={{ title: t('load.serverLog'), lines: server.log }}
      />
    )
  }
  if (server.status !== 'running') return <LoadingScreen status={t('load.server')} />
  return null
}
