// 工作台首页：中间一个输入框，周围一圈 slide 卡片（固定轨道，不做无限拖动）。
// 视觉参考媒体工作台的「灵感墙」：环境渐变 + 卡片微交互，但布局是稳定的。
import React from 'react'
import { createDeck, startAgent, thumbUrl } from './api.js'
import { t } from './i18n.js'
import { Icon, Spinner } from './ui.jsx'

/**
 * 卡片墙：左右两组松散错落，大小三种，各带一点随机感的旋转。
 * 中间留给输入框，不做无限拖拽，位置是固定的。
 */
const WALL = [
  { x: 17, y: 13, size: 'md', r: -6 },
  { x: 9, y: 43, size: 'sm', r: 5 },
  { x: 19, y: 76, size: 'lg', r: -2 },
  { x: 81, y: 16, size: 'lg', r: 4 },
  { x: 91, y: 45, size: 'md', r: -5 },
  { x: 78, y: 74, size: 'sm', r: 6 },
  { x: 92, y: 88, size: 'sm', r: -3 },
  { x: 28, y: 92, size: 'sm', r: 3 },
]

/** 根据 deck id 选一个预设封面基调（纯 CSS，不加载任何图片）。 */
function toneOf(id) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ['ink', 'violet', 'mint', 'amber'][Math.abs(hash) % 4]
}

/** 空 deck（没写内容的一页 Untitled）不上墙。 */
function isMeaningful(deck) {
  if (!deck || deck.error) return false
  const title = String(deck.title ?? '').trim()
  const generic = !title || /^untitled/i.test(title) || title === deck.id
  if (generic && (deck.pages ?? 0) <= 1) return false
  return true
}

/** 三个起点：点一下把对应的话填进输入框。 */
const TEMPLATES = [
  { id: 'launch', label: 'home.tpl.launch', prompt: 'home.tpl.launchPrompt' },
  { id: 'review', label: 'home.tpl.review', prompt: 'home.tpl.reviewPrompt' },
  { id: 'talk', label: 'home.tpl.talk', prompt: 'home.tpl.talkPrompt' },
]

/** 把标题压成一句能当 deck 名的话。 */
function deckTitle(text) {
  const first = text.split(/[。！？\n.!?]/)[0] ?? text
  return first.trim().slice(0, 40) || t('home.untitled')
}

export function HomeView({ state, onOpen, onBrowse }) {
  const decks = state?.decks ?? []
  const [text, setText] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(null)
  const stageRef = React.useRef(null)
  const inputRef = React.useRef(null)

  // 鼠标轻微视差：只改 CSS 变量，不做拖拽
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const onMove = (event) => {
      const rect = stage.getBoundingClientRect()
      const dx = (event.clientX - rect.left) / rect.width - 0.5
      const dy = (event.clientY - rect.top) / rect.height - 0.5
      stage.style.setProperty('--px', dx.toFixed(3))
      stage.style.setProperty('--py', dy.toFixed(3))
    }
    stage.addEventListener('pointermove', onMove)
    return () => stage.removeEventListener('pointermove', onMove)
  }, [])

  const submit = async (event) => {
    event?.preventDefault?.()
    const prompt = text.trim()
    if (!prompt || busy) return
    setBusy(true)
    setError(null)
    try {
      const deck = await createDeck(deckTitle(prompt))
      if (!deck?.id) throw new Error(t('home.failed', { error: 'no deck' }))
      // 先打开页面，再让 AI 在后面开始写（失败也不挡住人）
      void startAgent(deck.id, prompt)
      setText('')
      onOpen(deck.id)
    } catch (err) {
      setError(t('home.failed', { error: err?.message ?? err }))
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const fill = (prompt) => {
    setText(prompt)
    inputRef.current?.focus()
  }

  const visible = decks.filter(isMeaningful)
  const tiles = visible.slice(0, WALL.length)
  // 截图要等 Host 用 headless Chrome 慢慢截，没截好就先显示预设封面，过几秒再换
  const [shotNonce, setShotNonce] = React.useState(0)
  const [missing, setMissing] = React.useState({})
  React.useEffect(() => {
    const pendingCount = Object.values(missing).filter(Boolean).length
    if (!pendingCount || shotNonce >= 4) return undefined
    const timer = setTimeout(() => {
      setMissing({})
      setShotNonce((n) => n + 1)
    }, 6000)
    return () => clearTimeout(timer)
  }, [missing, shotNonce])

  return (
    <div className="sw-home" ref={stageRef}>
      <div className="sw-home-stage">
        {tiles.map((deck, index) => {
          const spot = WALL[index]
          return (
            <button
              key={deck.id}
              type="button"
              className={`sw-tile is-${spot.size}`}
              style={{
                '--x': `${spot.x}%`,
                '--y': `${spot.y}%`,
                '--r': `${spot.r}deg`,
                '--d': `${80 + index * 55}ms`,
              }}
              onClick={() => onOpen(deck.id)}
              title={deck.title || deck.id}
            >
              <span className="sw-tile-frame">
                <span className={`sw-tile-art is-${toneOf(deck.id)}`} aria-hidden="true">
                  <span className="sw-tile-art-eyebrow">DeepSeek Harness</span>
                  <span className="sw-tile-art-title">{deck.title || deck.id}</span>
                  <span className="sw-tile-art-foot">
                    <span className="sw-tile-art-rule" />
                    <span className="sw-tile-art-page">{String(deck.pages || 1).padStart(2, '0')}</span>
                  </span>
                </span>
                <img
                  className="sw-tile-shot"
                  src={`${thumbUrl(deck.id, deck.updatedAt)}&n=${shotNonce}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setMissing((prev) => (prev[deck.id] ? prev : { ...prev, [deck.id]: true }))}
                />
              </span>
              <span className="sw-tile-title">{deck.title || deck.id}</span>
            </button>
          )
        })}

        <form className="sw-composer" onSubmit={submit}>
          <p className="sw-home-eyebrow">{t('home.eyebrow')}</p>
          <h1 className="sw-home-title">{t('home.title')}</h1>
          <div className={`sw-composer-box ${busy ? 'is-busy' : ''}`}>
            <textarea
              ref={inputRef}
              rows={2}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('home.placeholder')}
              aria-label={t('home.placeholder')}
            />
            <div className="sw-composer-foot">
              <span className="sw-hint">{t('home.hint')}</span>
              <button type="submit" className="sw-send" disabled={busy || !text.trim()} aria-label={t('home.submit')} title={t('home.submit')}>
                {busy ? <Spinner size={14} /> : <Icon name="arrowUp" size={16} />}
              </button>
            </div>
          </div>
          {error ? <p className="sw-home-error" role="alert">{error}</p> : null}
          <div className="sw-chips">
            {TEMPLATES.map((template) => (
              <button key={template.id} type="button" className="sw-chip" onClick={() => fill(t(template.prompt))}>
                {t(template.label)}
              </button>
            ))}
          </div>
        </form>
      </div>

      <footer className="sw-home-foot">
        <span className="sw-hint">{visible.length ? t('home.recent', { n: visible.length }) : t('home.empty')}</span>
        <button type="button" className="sw-home-browse" onClick={onBrowse}>
          {t('home.browse')}<Icon name="arrowRight" size={14} />
        </button>
      </footer>
    </div>
  )
}