// 工作台首页：1:1 照搬 dsh-media-desk 的灵感墙结构
//   .sw-stage（点阵底）> .sw-world（中心原点、可缩放）> .sw-hero-anchor（中间那句话）+ .sw-node（卡片）
// 卡片进入用 WAAPI 从中心往外弹（按顺时针先后），hover 时摆正、抬起、放大。
import React from 'react'
import { createDeck, startAgent, thumbUrl } from './api.js'
import { SPRING_SOFT, cardSize, hash, reducedMotion, scatterLayout } from './home-layout.js'
import { formatWhen, t } from './i18n.js'
import { Icon, Spinner } from './ui.jsx'

/** 三个起点：点一下把对应的话填进输入框。 */
const TEMPLATES = [
  { id: 'launch', label: 'home.tpl.launch', prompt: 'home.tpl.launchPrompt' },
  { id: 'review', label: 'home.tpl.review', prompt: 'home.tpl.reviewPrompt' },
  { id: 'talk', label: 'home.tpl.talk', prompt: 'home.tpl.talkPrompt' },
]

/** 空 deck（没写内容的一页 Untitled）不上墙。 */
function isMeaningful(deck) {
  if (!deck || deck.error) return false
  const title = String(deck.title ?? '').trim()
  const generic = !title || /^untitled/i.test(title) || title === deck.id
  if (generic && (deck.pages ?? 0) <= 1) return false
  return true
}

function deckTitle(text) {
  const first = text.split(/[。！？\n.!?]/)[0] ?? text
  return first.trim().slice(0, 40) || t('home.untitled')
}

/** 卡片：结构完全照 media-desk 的 .md-card（内嵌图 + 标题 + 底栏）。 */
function DeckCard({ deck, state, angle, onOpen, onShown }) {
  const shot = thumbUrl(deck.id, deck.updatedAt)
  return (
    <article
      className="sw-card"
      role="button"
      tabIndex={0}
      aria-label={deck.title || deck.id}
      onClick={() => onOpen(deck.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(deck.id)
        }
      }}
    >
      <div className="sw-card-media">
        <img
          className="sw-card-shot"
          src={shot}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={onShown}
          onError={onShown}
        />
      </div>
      <div className="sw-card-caption">
        <h3>{deck.title || deck.id}</h3>
      </div>
      <footer className="sw-card-foot">
        <span className={`sw-dot is-${(hash(deck.id) % 4)}`} aria-hidden="true" />
        <span className="sw-card-source">{t('home.pages', { n: deck.pages || 1 })}</span>
        <span className="sw-card-time">{deck.updatedAt ? formatWhen(deck.updatedAt) : ''}</span>
      </footer>
      {angle ? null : null}
    </article>
  )
}

/** 一张卡在画布上的位置壳，负责进入动画。 */
function Node({ deck, pos, index, state, onOpen, onShown }) {
  const ref = React.useRef(null)
  const entered = React.useRef(false)

  React.useLayoutEffect(() => {
    if (entered.current) return
    entered.current = true
    const el = ref.current
    if (!el || reducedMotion()) return
    const k = 0.25
    el.animate(
      [
        {
          transform: `translate(${-pos.x * k}px, ${-pos.y * k}px) scale(.8) rotate(${(hash(deck.id) % 20) - 10}deg)`,
          opacity: 0,
        },
        { transform: 'none', opacity: 1 },
      ],
      {
        duration: SPRING_SOFT.duration + 200,
        easing: SPRING_SOFT.easing,
        delay: Math.min(index * 45, 760),
        fill: 'backwards',
      },
    )
  }, [deck.id, index, pos.x, pos.y])

  const size = cardSize(deck)
  return (
    <div
      ref={ref}
      className="sw-node"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.w}px`,
        '--r': `${pos.r}deg`,
      }}
    >
      <div className="sw-pop">
        <DeckCard deck={deck} state={state} onOpen={onOpen} onShown={onShown} />
      </div>
    </div>
  )
}

export function HomeView({ state, onOpen, onBrowse }) {
  const decks = (state?.decks ?? []).filter(isMeaningful)
  const [text, setText] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(null)
  const inputRef = React.useRef(null)
  const [, setShotTick] = React.useState(0)

  const posOf = React.useMemo(() => scatterLayout(decks), [decks])

  const submit = async (event) => {
    event?.preventDefault?.()
    const prompt = text.trim()
    if (!prompt || busy) return
    setBusy(true)
    setError(null)
    try {
      const deck = await createDeck(deckTitle(prompt))
      if (!deck?.id) throw new Error(t('home.failed', { error: 'no deck' }))
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

  return (
    <div className="sw-stage">
      <div className="sw-world">
        <div className="sw-hero-anchor">
          <section className="sw-hero">
            <p className="sw-hero-date">{t('home.eyebrow')}</p>
            <h1 className="sw-hero-line">
              {t('home.line1')}
              <br />
              <b>{t('home.line2')}</b>
            </h1>
            <form className="sw-hero-input" onSubmit={submit}>
              <Icon name="slides" size={16} />
              <input
                ref={inputRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('home.placeholder')}
                aria-label={t('home.placeholder')}
              />
              <button type="submit" className="sw-hero-send" disabled={busy || !text.trim()} aria-label={t('home.submit')}>
                {busy ? <Spinner size={14} /> : <Icon name="arrowUp" size={16} />}
              </button>
            </form>
            {error ? <p className="sw-hero-error" role="alert">{error}</p> : null}
            <p className="sw-hero-meta">
              {decks.length ? t('home.recent', { n: decks.length }) : t('home.empty')}
              {' · '}
              <button type="button" className="sw-inline-link" onClick={onBrowse}>
                {t('home.browse')}
              </button>
            </p>
            <div className="sw-chips">
              {TEMPLATES.map((template) => (
                <button key={template.id} type="button" className="sw-chip" onClick={() => fill(t(template.prompt))}>
                  {t(template.label)}
                </button>
              ))}
            </div>
          </section>
        </div>

        {decks.map((deck, index) => (
          <Node
            key={deck.id}
            deck={deck}
            pos={posOf[deck.id] ?? { x: 0, y: 0, r: 0 }}
            index={index}
            state={state}
            onOpen={onOpen}
            onShown={() => setShotTick((n) => n + 1)}
          />
        ))}
      </div>
    </div>
  )
}