// 通用小组件：图标、按钮、对话框、日志、toast。样式全在 styles.css 的 .sw- 前缀下。
import React from 'react'
import { t, toggleLang } from './i18n.js'

const PATHS = {
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  chevL: 'M14.5 5.5L8 12l6.5 6.5',
  chevR: 'M9.5 5.5L16 12l-6.5 6.5',
  play: 'M8 5.5v13l11-6.5z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  edit: 'M4 20l1-4L16 5l3 3L8 19z',
  refresh: 'M19 8a8 8 0 0 0-14-1L4 9M5 16a8 8 0 0 0 14 1l1-2M4 4v5h5M20 20v-5h-5',
  trash: 'M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  external: 'M7 17L17 7M8 7h9v9',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  expand: 'M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6',
  slides: 'M3 5h18v12H3zM8 21h8M12 17v4',
  warn: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
}

export function Icon({ name, size = 16, stroke = 1.6 }) {
  const path = PATHS[name] ?? PATHS.slides
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  )
}

export function IconButton({ icon, label, onClick, disabled = false, active = false, tone, size = 16, spinning = false, className = '' }) {
  return (
    <button
      type="button"
      className={`sw-icon-btn ${active ? 'is-active' : ''} ${tone === 'danger' ? 'is-danger' : ''} ${spinning ? 'is-spinning' : ''} ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}

export function Button({ children, onClick, variant = 'default', disabled = false, icon, type = 'button', title, className = '', form }) {
  return (
    <button
      type={type}
      className={`sw-btn ${variant === 'primary' ? 'is-primary' : ''} ${variant === 'ghost' ? 'is-ghost' : ''} ${variant === 'danger' ? 'is-danger' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      form={form}
      aria-label={title || undefined}
    >
      {icon ? <Icon name={icon} size={14} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  )
}

export function Segmented({ value, options, onChange, label }) {
  return (
    <div className="sw-seg" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? 'is-on' : ''}
          title={option.title ?? option.label}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? <Icon name={option.icon} size={14} /> : null}
          {option.label ? <span>{option.label}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function Spinner({ size = 16 }) {
  return <span className="sw-spinner" style={{ width: size, height: size }} role="status" aria-hidden="true" />
}

export function StatusDot({ status, label }) {
  return <span className={`sw-dot is-${status || 'stopped'}`} role="img" aria-label={label} title={label} />
}

/** 右上角的语言切换；floating 时绝对定位到面板右上角。 */
export function LangSwitch({ floating = false }) {
  return (
    <button type="button" className={`sw-lang ${floating ? 'is-floating' : ''}`} onClick={toggleLang} aria-label={t('lang.switch')} title={t('lang.switch')}>
      {t('lang.toggle')}
    </button>
  )
}

export function Dialog({ title, onClose, children, footer, width = 420 }) {
  const ref = React.useRef(null)
  const close = React.useRef(onClose)
  close.current = onClose
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close.current()
      }
    }
    window.addEventListener('keydown', onKey, true)
    const body = ref.current
    const first = body?.querySelector('input:not([type="hidden"]), textarea, select, button')
    first?.focus()
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])
  return (
    <div className="sw-mask" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="sw-dialog" role="dialog" aria-modal="true" aria-label={title} style={{ width }} ref={ref}>
        <header>
          <h2>{title}</h2>
          <IconButton icon="close" label={t('common.close')} onClick={onClose} />
        </header>
        <div className="sw-dialog-body">{children}</div>
        {footer ? <footer className="sw-dialog-foot">{footer}</footer> : null}
      </div>
    </div>
  )
}

export function ConfirmDialog({ title, body, confirmLabel, danger = false, busy = false, onConfirm, onCancel }) {
  return (
    <Dialog
      title={title}
      onClose={onCancel}
      footer={(
        <>
          <Button variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>{busy ? t('common.loading') : (confirmLabel || t('common.delete'))}</Button>
        </>
      )}
    >
      <p className="sw-dialog-text">{body}</p>
    </Dialog>
  )
}

/** 安装 / 服务器日志：自动滚到底部，只渲染尾部若干行。 */
export function LogView({ title, lines, live = false, error = null }) {
  const ref = React.useRef(null)
  const list = Array.isArray(lines) ? lines : []
  const tail = list.slice(-200)
  React.useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [tail.length, live, error])
  return (
    <section className="sw-log" aria-label={title}>
      <header>
        <span>{title}</span>
        {live ? <Spinner size={12} /> : null}
      </header>
      <pre ref={ref}>{tail.length ? tail.join('\n') : t('log.empty')}</pre>
      {error ? <p className="sw-log-error" role="alert">{error}</p> : null}
    </section>
  )
}

export function ToastHost({ toast, onDismiss }) {
  if (!toast) return null
  return (
    <div key={toast.key} className={`sw-toast ${toast.error ? 'is-error' : ''}`} role={toast.error ? 'alert' : 'status'} onPointerDown={onDismiss}>
      {toast.text}
    </div>
  )
}

/** 复制文本：走剪贴板 API（DSH 页面是安全上下文），不可用时返回 false。 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}