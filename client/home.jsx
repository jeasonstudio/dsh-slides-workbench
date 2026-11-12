// 工作台首页：中间一个输入框，周围一圈 slide 卡片（固定轨道，不做无限拖动）。
// 视觉参考媒体工作台的「灵感墙」：环境渐变 + 卡片微交互，但布局是稳定的。
import React from 'react'
import { createDeck, startAgent } from './api.js'
import { t } from './i18n.js'
import { Icon, Spinner } from './ui.jsx'

/**
 * 固定轨道：左右两列、竖向均分，越靠中间越靠里一点，形成一圈但不占满。
 * @param {number} count - 要摆几张。
 * @returns {Array<{x: number, y: number, r: number, s: number}>} 每张的中心点（%）和微旋转/缩放。
 */
function orbitFor(count) {
  const rows = Math.max(1, Math.ceil(count / 2))
  const spots = []
  for (let index = 0; index < count; index += 1) {
    const side = index % 2 === 0 ? -1 : 1
    const row = Math.floor(index / 2)
    const y = rows === 1 ? 50 : 8 + (row * 84) / (rows - 1)
    const inward = row % 2 === 0 ? 0 : 3.5
    spots.push({
      x: side < 0 ? 13 + inward : 87 - inward,
      y,
      r: ((index % 3) - 1) * 3,
      s: 0.82 + (index % 2) * 0.06,
    })
  }
  return spots
}

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
  const tiles = visible.slice(0, 10)
  const spots = orbitFor(tiles.length)

  return (
    <div className="sw-home" ref={stageRef}>
      <div className="sw-home-stage">
        {tiles.map((deck, index) => {
          const spot = spots[index]
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
                '--d': `${90 + index * 45}ms`,
              }}
              onClick={() => onOpen(deck.id)}
              title={deck.title || deck.id}
            >
              <span className={`sw-tile-art is-${toneOf(deck.id)}`} aria-hidden="true">
                <span className="sw-tile-art-eyebrow">DeepSeek Harness</span>
                <span className="sw-tile-art-title">{deck.title || deck.id}</span>
                <span className="sw-tile-art-foot">
                  <span className="sw-tile-art-rule" />
                  <span className="sw-tile-art-page">{String(deck.pages || 1).padStart(2, '0')}</span>
                </span>
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
        <span className="sw-hint">{visible.length ? t('home.recent', { n: visible.length }) : t('home.empty')}</span>
        <button type="button" className="sw-home-browse" onClick={onBrowse}>
          {t('home.browse')}<Icon name="arrowRight" size={14} />
        </button>
      </footer>
    </div>
  )
}