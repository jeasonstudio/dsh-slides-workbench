// 工作台首页：中间一个输入框，周围一圈 slide 卡片（固定轨道，不做无限拖动）。
// 视觉参考媒体工作台的「灵感墙」：环境渐变 + 卡片微交互，但布局是稳定的。
import React from 'react'
import { createDeck, deckThumbUrl, startAgent } from './api.js'
import { t } from './i18n.js'
import { Icon, Spinner } from './ui.jsx'

/** 卡片的固定轨道（相对舞台的百分比中心点 + 轻微旋转）。 */
const ORBIT = [
  { x: 15, y: 20, r: -6, s: 1 },
  { x: 9, y: 62, r: 4, s: 0.94 },
  { x: 22, y: 84, r: -3, s: 0.9 },
  { x: 85, y: 18, r: 5, s: 1 },
  { x: 91, y: 58, r: -4, s: 0.95 },
  { x: 78, y: 84, r: 3, s: 0.9 },
]

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

  const tiles = decks.slice(0, ORBIT.length)

  return (
    <div className="sw-home" ref={stageRef}>
      <div className="sw-home-ambient" aria-hidden="true"><i /><i /><i /></div>

      <div className="sw-home-stage">
        {tiles.map((deck, index) => {
          const spot = ORBIT[index]
          return (
            <button
              key={deck.id}
              type="button"
              className="sw-tile"
              style={{
                '--x': `${spot.x}%`,
                '--y': `${spot.y}%`,
                '--r': `${spot.r}deg`,
                '--s': String(spot.s),
                '--d': `${120 + index * 70}ms`,
              }}
              onClick={() => onOpen(deck.id)}
              title={deck.title || deck.id}
            >
              <span className="sw-tile-thumb">
                <iframe
                  title={deck.title || deck.id}
                  src={deckThumbUrl(state, deck.id)}
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden="true"
                  scrolling="no"
                />
              </span>
              <span className="sw-tile-meta">
                <span className="sw-tile-title">{deck.title || deck.id}</span>
                <span className="sw-tile-pages">{t('home.pages', { n: deck.pages || 1 })}</span>
              </span>
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
        <span className="sw-hint">{decks.length ? t('home.recent', { n: decks.length }) : t('home.empty')}</span>
        <button type="button" className="sw-home-browse" onClick={onBrowse}>
          {t('home.browse')}<Icon name="arrowRight" size={14} />
        </button>
      </footer>
    </div>
  )
}