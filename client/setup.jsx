// 两种过渡态：正在准备（装依赖）和 dev server 没在跑。
// 就绪以后没有这一层了 —— 面板直接铺 open-slide 自己的页面（见 app.jsx）。
import React from 'react'
import { initialize, startServer, stopServer, useSnapshot } from './api.js'
import { t } from './i18n.js'
import { Button, LangSwitch, LogView, Spinner } from './ui.jsx'

/** 状态一：工作区还没脚手架 / 依赖还没装。装好插件就开始准备，这里只展示进度。 */
export function SetupView() {
  const snap = useSnapshot()
  const workspace = snap.state?.workspace ?? {}
  const install = workspace.install ?? {}
  const running = install.status === 'running'
  const failed = install.status === 'error'
  const busy = snap.busy === 'setup' || running

  // Host 装好就已经在装了；这里再兜一层：真的还是 idle 就自己触发一次，用户不用点
  const fired = React.useRef(false)
  React.useEffect(() => {
    if (fired.current) return
    if (workspace.installed || running || failed || snap.busy === 'setup') return
    fired.current = true
    initialize()
  }, [workspace.installed, running, failed, snap.busy])

  return (
    <div className="sw-page">
      <header className="sw-page-head">
        <div>
          <p className="sw-eyebrow">{t('app.name')}</p>
          <h1>{t('setup.title')}</h1>
        </div>
        <LangSwitch />
      </header>
      <div className="sw-page-body">
        <p className="sw-lead">{t('setup.lead')}</p>
        <div className="sw-path">
          <span className="sw-path-label">{t('setup.pathLabel')}</span>
          <code>{workspace.path || t('setup.pathUnknown')}</code>
        </div>
        <div className="sw-actions">
          <Button variant="primary" icon={busy ? undefined : 'download'} onClick={initialize} disabled={busy}>
            {busy ? <><Spinner size={13} />{t('setup.running')}</> : t('setup.action')}
          </Button>
        </div>
        <LogView
          title={t('setup.logTitle')}
          lines={install.log}
          live={running}
          error={failed ? t('setup.failed', { error: install.error || t('server.unknownError') }) : null}
        />
        <p className="sw-hint">{t('setup.hint')}</p>
      </div>
    </div>
  )
}

/** 状态二：依赖装好了，但 dev server 不在 running（启动中 / 失败 / 停止）。 */
export function ServerView() {
  const snap = useSnapshot()
  const server = snap.state?.server ?? {}
  const starting = server.status === 'starting'
  const failed = server.status === 'error'
  const busy = snap.busy === 'server'
  const heading = starting ? t('server.startingTitle') : failed ? t('server.errorTitle') : t('server.stoppedTitle')
  const actionLabel = starting || failed ? t('server.actionRestart') : t('server.actionStart')
  const lead = starting
    ? t('server.startingLead')
    : failed
      ? t('server.errorLead', { error: server.error || t('server.unknownError') })
      : t('server.stoppedLead')
  return (
    <div className="sw-page">
      <header className="sw-page-head">
        <div>
          <p className="sw-eyebrow">{t('app.name')}</p>
          <h1>{heading}</h1>
        </div>
        <LangSwitch />
      </header>
      <div className="sw-page-body">
        <p className="sw-lead">{lead}</p>
        <div className="sw-actions">
          <Button variant="primary" icon="refresh" onClick={() => startServer()} disabled={busy || starting}>
            {starting ? <><Spinner size={13} />{t('status.starting')}</> : actionLabel}
          </Button>
          {starting ? <Button variant="ghost" onClick={stopServer} disabled={busy}>{t('server.actionStop')}</Button> : null}
        </div>
        <LogView title={t('server.logTitle')} lines={server.log} live={starting} error={failed ? server.error : null} />
        <p className="sw-hint">{t('server.hint')}</p>
      </div>
    </div>
  )
}