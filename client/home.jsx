// 工作台首页：灵感墙。结构与手感照 dsh-media-desk 的散落画布：
//   .sw-stage（点阵底，可拖动/缩放）> .sw-world（相机变换）> .sw-hero-anchor（中间那句话）+ .sw-node（卡片）
// 墙上全是打包好的静态灵感（见 home-wall.jsx），和本地 deck 无关：
//   封面 / 想法卡 → 给出主题；心法 / 配色卡 → 作为「叠加项」挂在那句话后面，一起发出去。
// 卡片默认端正，hover 才抬起并轻轻歪一下；进入时从中心按弹簧散开。
import React from 'react'
import { createDeck, toast } from './api.js'
import { HERO, SPRING_SOFT, cardSize, hash, reducedMotion, scatterLayout } from './home-layout.js'
import { Art, KINDS, WALL } from './home-wall.jsx'
import { lang, t } from './i18n.js'
import { chatAvailable, openAgentDock, startChat } from './session.js'
import { Icon, Spinner } from './ui.jsx'

/** 首页那句话：每次打开随机一句，上下两半各一行。 */
const COUPLETS = [
  ['一念成章', '纸短意长'],
  ['白处有声', '意到页成'],
  ['君言其要', '我理其章'],
  ['胸有千言', '纸成一页'],
  ['登台无惧', '开口有凭'],
  ['先有其意', '后有其形'],
]

const pick = value => (value && typeof value === 'object' ? value[lang()] ?? value.zh : value)
const isTopic = item => item.kind === 'cover' || item.kind === 'prompt'
const narrow = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 760px)').matches

/** 空 deck（没写内容的一页 Untitled）不算「我的演示」。 */
function isMeaningful(deck) {
  if (!deck || deck.error) return false
  const title = String(deck.title ?? '').trim()
  const generic = !title || /^untitled/i.test(title) || title === deck.id
  return !(generic && (deck.pages ?? 0) <= 1)
}

function deckTitle(text) {
  const first = text.split(/[。！？\n.!?]/)[0] ?? text
  return first.trim().slice(0, 40) || t('home.untitled')
}

/** 弹簧相机（移植自 media-desk）：world 的平移 + 缩放，点阵背景跟着走。 */
function useCamera(stageRef, worldRef) {
  const cam = React.useRef({ x: 0, y: 0, s: 1, vx: 0, vy: 0, vs: 0, tx: 0, ty: 0, ts: 1, raf: 0 })
  const apply = React.useCallback(() => {
    const c = cam.current
    const world = worldRef.current
    const stage = stageRef.current
    if (!world || !stage) return
    world.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`
    stage.style.setProperty('--grid-x', `${c.x}px`)
    stage.style.setProperty('--grid-y', `${c.y}px`)
    stage.style.setProperty('--grid-size', `${28 * c.s}px`)
  }, [stageRef, worldRef])
  const tick = React.useCallback(() => {
    const c = cam.current
    const k = c.stiffness ?? 90
    const d = c.damping ?? 17
    const dt = 1 / 60
    c.vx += (k * (c.tx - c.x) - d * c.vx) * dt
    c.vy += (k * (c.ty - c.y) - d * c.vy) * dt
    c.vs += (k * (c.ts - c.s) - d * c.vs) * dt
    c.x += c.vx * dt
    c.y += c.vy * dt
    c.s += c.vs * dt
    apply()
    const idle = Math.abs(c.tx - c.x) < 0.2 && Math.abs(c.ty - c.y) < 0.2 && Math.abs(c.ts - c.s) < 0.0005 && Math.abs(c.vx) + Math.abs(c.vy) < 0.5
    if (idle) {
      Object.assign(c, { x: c.tx, y: c.ty, s: c.ts, vx: 0, vy: 0, vs: 0, raf: 0 })
      apply()
      return
    }
    c.raf = requestAnimationFrame(tick)
  }, [apply])
  const flyTo = React.useCallback((target, { instant = false, stiffness = 90, damping = 17 } = {}) => {
    const c = cam.current
    Object.assign(c, { tx: target.x, ty: target.y, ts: target.s, stiffness, damping })
    if (instant || reducedMotion()) {
      cancelAnimationFrame(c.raf)
      Object.assign(c, { x: c.tx, y: c.ty, s: c.ts, vx: 0, vy: 0, vs: 0, raf: 0 })
      apply()
      return
    }
    if (!c.raf) c.raf = requestAnimationFrame(tick)
  }, [apply, tick])
  const halt = React.useCallback(() => {
    const c = cam.current
    cancelAnimationFrame(c.raf)
    Object.assign(c, { raf: 0, vx: 0, vy: 0, vs: 0, tx: c.x, ty: c.y, ts: c.s })
  }, [])
  React.useEffect(() => () => cancelAnimationFrame(cam.current.raf), [])
  return { cam, flyTo, halt }
}

/** 墙上的一张卡：四种样式共用一个外壳（白底圆角 + 柔和阴影，无深色边框）。 */
function WallCard({ item, onPick }) {
  const title = pick(item.title)
  let body
  if (item.kind === 'cover') {
    body = (
      <>
        <div className="sw-card-media"><Art name={item.art} /></div>
        <div className="sw-card-caption"><h3>{title}</h3></div>
        <footer className="sw-card-foot">
          <span className="sw-dot is-cover" aria-hidden="true" />
          <span className="sw-card-source">{pick(item.tag)}</span>
          <span className="sw-card-time sw-card-cta">{t('home.card.use')}</span>
        </footer>
      </>
    )
  } else if (item.kind === 'prompt') {
    body = (
      <>
        <div className="sw-card-note">
          <span className="sw-card-rel">{pick(item.rel)}</span>
          <h3>{title}</h3>
          <p className="is-ruled">{pick(item.body)}</p>
        </div>
        <footer className="sw-card-foot">
          <span className="sw-dot is-prompt" aria-hidden="true" />
          <span className="sw-card-source">{t('home.kind.prompt')}</span>
          <span className="sw-card-time sw-card-cta">{t('home.card.use')}</span>
        </footer>
      </>
    )
  } else if (item.kind === 'quote') {
    body = (
      <>
        <blockquote className="sw-card-quote">{title}</blockquote>
        <footer className="sw-card-foot">
          <span className="sw-dot is-quote" aria-hidden="true" />
          <span className="sw-card-source">{t('home.kind.quote')}</span>
          <span className="sw-card-time sw-card-cta">{t('home.card.add')}</span>
        </footer>
      </>
    )
  } else {
    body = (
      <>
        <div className="sw-card-palette">
          <div className="sw-swatches">{item.colors.map(color => <i key={color} style={{ background: color }} />)}</div>
          <h3>{title}</h3>
          <p>{pick(item.font)}</p>
        </div>
        <footer className="sw-card-foot">
          <span className="sw-dot is-palette" aria-hidden="true" />
          <span className="sw-card-source">{t('home.kind.palette')}</span>
          <span className="sw-card-time sw-card-cta">{t('home.card.add')}</span>
        </footer>
      </>
    )
  }
  return (
    <article
      className={`sw-card kind-${item.kind}`}
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={() => onPick(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onPick(item)
        }
      }}
    >
      {body}
    </article>
  )
}

/** 一张卡在画布上的位置壳：负责进入动画、筛选时变淡、被选中时闪一下。 */
function Node({ item, pos, index, tone, onPick }) {
  const ref = React.useRef(null)
  React.useLayoutEffect(() => {
    // 只动画内层 .sw-pop：外层的 translate(-50%,-50%) 不能被动画覆盖
    const el = ref.current?.firstElementChild
    if (!el || reducedMotion()) return
    const k = 0.25
    el.animate(
      [
        { transform: `translate(${-pos.x * k}px, ${-pos.y * k}px) scale(.8) rotate(${(hash(item.id) % 20) - 10}deg)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: SPRING_SOFT.duration + 200, easing: SPRING_SOFT.easing, delay: Math.min(index * 32, 760), fill: 'backwards' },
    )
    // 只在第一次挂载时进入
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const size = cardSize(item)
  return (
    <div
      ref={ref}
      className={`sw-node${tone ? ` is-${tone}` : ''}`}
      data-node={item.id}
      style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: `${size.w}px`, '--tilt': `${pos.t}deg` }}
    >
      <div className="sw-pop"><WallCard item={item} onPick={onPick} /></div>
    </div>
  )
}

export function HomeView({ state, initialMods, onOpen, onBrowse, onThemes }) {
  const mine = (state?.decks ?? []).filter(isMeaningful).length
  const [text, setText] = React.useState('')
  const [mods, setMods] = React.useState(() => initialMods ?? []) // 叠加项：[{id, kind, text, label}]
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [filter, setFilter] = React.useState('all')
  const [picked, setPicked] = React.useState(null)
  const [couplet] = React.useState(() => COUPLETS[Math.floor(Math.random() * COUPLETS.length)])
  const inputRef = React.useRef(null)
  const stageRef = React.useRef(null)
  const worldRef = React.useRef(null)
  const typing = React.useRef(0)
  const suppressClick = React.useRef(false)
  const { cam, flyTo, halt } = useCamera(stageRef, worldRef)

  const layout = React.useMemo(() => scatterLayout(WALL), [])

  const stageBox = React.useCallback(() => {
    const el = stageRef.current
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 1000, h: 700 }
  }, [])
  const frameHome = React.useCallback(() => {
    const { w, h } = stageBox()
    return { x: w / 2, y: h / 2 + 8, s: w < 1000 ? 0.7 : w < 1300 ? 0.8 : w < 1600 ? 0.88 : 0.96 }
  }, [stageBox])

  React.useLayoutEffect(() => {
    flyTo(frameHome(), { instant: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 面板宽度变化（开合右侧对话）：镜头跟着平移，中间那句话保持居中
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    let last = { w: el.clientWidth, h: el.clientHeight }
    const observer = new ResizeObserver(() => {
      const dw = el.clientWidth - last.w
      const dh = el.clientHeight - last.h
      last = { w: el.clientWidth, h: el.clientHeight }
      if (!dw && !dh) return
      const c = cam.current
      flyTo({ x: c.tx + dw / 2, y: c.ty + dh / 2, s: c.ts }, { stiffness: 140, damping: 24 })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [cam, flyTo])

  React.useEffect(() => () => cancelAnimationFrame(typing.current), [])

  /** 把一句话「打」进输入框（一两百毫秒打完，不拖沓）。 */
  const typeIn = React.useCallback((value) => {
    cancelAnimationFrame(typing.current)
    if (reducedMotion()) {
      setText(value)
      inputRef.current?.focus()
      return
    }
    const start = performance.now()
    const duration = Math.min(700, 160 + value.length * 7)
    const step = (now) => {
      const k = Math.min(1, (now - start) / duration)
      setText(value.slice(0, Math.ceil(value.length * k)))
      if (k < 1) typing.current = requestAnimationFrame(step)
      else inputRef.current?.focus({ preventScroll: true })
    }
    typing.current = requestAnimationFrame(step)
  }, [])

  const flash = (id) => {
    setPicked(id)
    setTimeout(() => setPicked(current => (current === id ? null : current)), 1100)
  }

  const use = React.useCallback((item) => {
    if (suppressClick.current) return
    flash(item.id)
    if (!narrow()) flyTo(frameHome())
    if (isTopic(item)) {
      typeIn(pick(item.prompt))
      return
    }
    setMods((list) => (list.some(m => m.id === item.id) ? list : [...list, { id: item.id, kind: item.kind, text: pick(item.prompt), label: pick(item.title) }]))
    inputRef.current?.focus({ preventScroll: true })
  }, [flyTo, frameHome, typeIn])

  /** 手气不错：随机挑一张主题卡，镜头飞过去，亮一下，再把它填进来。 */
  const lucky = () => {
    const pool = WALL.filter(item => isTopic(item) && item.id !== picked)
    const item = pool[Math.floor(Math.random() * pool.length)]
    const pos = layout[item.id]
    setFilter('all')
    flash(item.id)
    if (!narrow()) {
      const { w, h } = stageBox()
      const s = Math.max(cam.current.ts, 0.9)
      flyTo({ x: w / 2 - pos.x * s, y: h / 2 - pos.y * s, s })
    } else {
      worldRef.current?.querySelector(`[data-node="${item.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => {
      if (!narrow()) flyTo(frameHome())
      typeIn(pick(item.prompt))
    }, reducedMotion() ? 0 : 900)
  }

  const composed = () => {
    const base = text.trim()
    if (!mods.length) return base
    const joiner = lang() === 'en' ? '; ' : '；'
    const tail = mods.map(m => m.text).join(joiner)
    return base ? `${base.replace(/[。.]$/, '')}${lang() === 'en' ? '. Style: ' : '。风格要求：'}${tail}${lang() === 'en' ? '.' : '。'}` : tail
  }

  const submit = async (event) => {
    event?.preventDefault?.()
    const prompt = composed()
    if (!prompt || busy) return
    setBusy(true)
    setError(null)
    try {
      const deck = await createDeck(deckTitle(text.trim() || prompt))
      if (!deck?.id) throw new Error(t('home.failed', { error: 'no deck' }))
      setText('')
      setMods([])
      // 交给编辑器里的 Agent 面板（DSH 原生对话，自动发送）：进编辑器时面板就开着；失败不挡住进编辑器，只提示一句
      if (chatAvailable()) openAgentDock()
      onOpen(deck.id)
      if (!chatAvailable()) return
      const context = t('chat.context', { id: deck.id, title: deck.title || deck.id })
      startChat({ deckId: deck.id, workspacePath: state.workspace.path, title: deck.title, prompt: `${prompt}\n\n${context}` }).catch((err) => {
        toast(t('home.handoffFailed', { error: err?.message ?? err }), { error: true })
      })
    } catch (err) {
      setError(t('home.failed', { error: err?.message ?? err }))
    } finally {
      setBusy(false)
    }
  }

  // ---- 拖动平移 / 滚轮 / 缩放（照 media-desk）----
  const onPointerDown = (event) => {
    if (narrow() || event.button !== 0 || event.target.closest('input,textarea,button,.sw-hero,.sw-dockbar,.sw-toolrow')) return
    const startX = event.clientX
    const startY = event.clientY
    const c = cam.current
    const baseX = c.x
    const baseY = c.y
    let moved = false
    let lastX = startX
    let lastY = startY
    let lastT = performance.now()
    let vx = 0
    let vy = 0
    suppressClick.current = false
    halt()
    const onMove = (e) => {
      if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) > 4) {
        moved = true
        suppressClick.current = true
        stageRef.current?.classList.add('is-panning')
      }
      if (!moved) return
      const now = performance.now()
      const dt = Math.max(now - lastT, 1)
      vx = (e.clientX - lastX) / dt
      vy = (e.clientY - lastY) / dt
      lastX = e.clientX
      lastY = e.clientY
      lastT = now
      flyTo({ x: baseX + e.clientX - startX, y: baseY + e.clientY - startY, s: c.s }, { instant: true })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      stageRef.current?.classList.remove('is-panning')
      if (moved) {
        flyTo({ x: c.x + vx * 180, y: c.y + vy * 180, s: c.s }, { stiffness: 42, damping: 13 })
        setTimeout(() => { suppressClick.current = false }, 0)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const zoomAt = React.useCallback((factor, cx, cy, instant = true) => {
    const c = cam.current
    const s = Math.max(0.35, Math.min(2, c.ts * factor))
    const k = s / c.ts
    flyTo({ x: cx - (cx - c.tx) * k, y: cy - (cy - c.ty) * k, s }, { instant, stiffness: 160, damping: 24 })
  }, [cam, flyTo])

  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    const onWheel = (event) => {
      if (narrow()) return
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      if (event.ctrlKey || event.metaKey) {
        zoomAt(Math.exp(-event.deltaY * 0.01), event.clientX - rect.left, event.clientY - rect.top)
      } else {
        const c = cam.current
        flyTo({ x: c.tx - event.deltaX, y: c.ty - event.deltaY, s: c.ts }, { instant: true })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [cam, flyTo, zoomAt])

  // 键盘 Tab 到画面外的卡片时，镜头跟过去
  const onFocusIn = (event) => {
    const node = event.target.closest?.('[data-node]')
    if (narrow() || !node || !event.target.matches(':focus-visible')) return
    const stageRect = stageRef.current.getBoundingClientRect()
    const rect = node.getBoundingClientRect()
    const c = cam.current
    const margin = 72
    let dx = 0
    let dy = 0
    if (rect.left < stageRect.left + margin) dx = stageRect.left + margin - rect.left
    else if (rect.right > stageRect.right - margin) dx = stageRect.right - margin - rect.right
    if (rect.top < stageRect.top + margin) dy = stageRect.top + margin - rect.top
    else if (rect.bottom > stageRect.bottom - margin) dy = stageRect.bottom - margin - rect.bottom
    if (dx || dy) flyTo({ x: c.tx + dx, y: c.ty + dy, s: c.ts })
  }

  const center = () => {
    const { w, h } = stageBox()
    return [w / 2, h / 2]
  }

  const toneOf = (item) => {
    if (picked === item.id) return 'picked'
    if (filter !== 'all' && item.kind !== filter) return 'dim'
    return null
  }

  const now = new Date()
  return (
    <div className="sw-home">
      <div className="sw-stage" ref={stageRef} onPointerDown={onPointerDown} onFocus={onFocusIn}>
        <div className="sw-world" ref={worldRef}>
          <div className="sw-hero-anchor" style={{ width: `${HERO.w - 20}px` }}>
            <section className="sw-hero">
              <p className="sw-hero-date">{t('home.date', { m: now.getMonth() + 1, mon: now.toLocaleString('en-US', { month: 'short' }), d: now.getDate(), w: t(`home.week.${now.getDay()}`) })}</p>
              <h1 className="sw-hero-line">
                {lang() === 'zh' ? (
                  <>
                    {couplet[0].slice(0, 2)} <span className="sw-inline-pic"><Art name="gradient" /></span> <b>{couplet[0].slice(2)}</b>，
                    <br />
                    <span className="sw-inline-pic"><Art name="brand" /></span> {couplet[1].slice(0, 2)} <b className="sw-hero-accent">{couplet[1].slice(2)}</b>。
                  </>
                ) : (
                  <>
                    {t('home.line1a')} <span className="sw-inline-pic"><Art name="gradient" /></span> <b>{t('home.line1b')}</b>
                    <br />
                    <span className="sw-inline-pic"><Art name="brand" /></span> <b>{t('home.line2a')}</b> {t('home.line2b')}
                    <br />
                    {t('home.line3a')} <b className="sw-hero-accent">{t('home.line3b')}</b>{t('home.line3c')}
                  </>
                )}
              </h1>
              <form className="sw-hero-input" onSubmit={submit}>
                <Icon name="slides" size={16} />
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(event) => {
                    cancelAnimationFrame(typing.current)
                    setText(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) submit(event)
                    if (event.key === 'Backspace' && !text && mods.length) setMods(list => list.slice(0, -1))
                  }}
                  placeholder={t('home.placeholder')}
                  aria-label={t('home.placeholder')}
                />
                <button type="submit" className="sw-hero-send" disabled={busy || !composed()} aria-label={t('home.submit')}>
                  {busy ? <Spinner size={14} /> : <Icon name="arrowUp" size={16} />}
                </button>
              </form>
              {mods.length ? (
                <div className="sw-mods" aria-label={t('home.mods')}>
                  {mods.map(mod => (
                    <span key={mod.id} className={`sw-mod is-${mod.kind}`}>
                      {mod.label}
                      <button type="button" aria-label={t('home.modRemove', { label: mod.label })} onClick={() => setMods(list => list.filter(m => m.id !== mod.id))}>
                        <Icon name="close" size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              {error ? <p className="sw-hero-error" role="alert">{error}</p> : null}
              <p className="sw-hero-meta">{mods.length ? t('home.hintMods') : t('home.hint')}</p>
            </section>
          </div>

          {WALL.map((item, index) => (
            <Node key={item.id} item={item} pos={layout[item.id]} index={index} tone={toneOf(item)} onPick={use} />
          ))}
        </div>

        <div className="sw-toolrow" onPointerDown={e => e.stopPropagation()}>
          <button type="button" className="sw-tool" aria-label={t('home.zoomOut')} title={t('home.zoomOut')} onClick={() => zoomAt(0.8, ...center(), false)}><Icon name="minus" size={15} /></button>
          <button type="button" className="sw-tool" aria-label={t('home.recenter')} title={t('home.recenter')} onClick={() => flyTo(frameHome())}><Icon name="target" size={15} /></button>
          <button type="button" className="sw-tool" aria-label={t('home.zoomIn')} title={t('home.zoomIn')} onClick={() => zoomAt(1.25, ...center(), false)}><Icon name="plus" size={15} /></button>
        </div>
      </div>

      <div className="sw-dockbar" role="toolbar" aria-label={t('home.dock')}>
        <div className="sw-filter">
          {['all', ...KINDS].map(kind => (
            <button key={kind} type="button" className={filter === kind ? 'is-on' : ''} aria-pressed={filter === kind} onClick={() => setFilter(kind)}>
              {t(`home.filter.${kind}`)}
            </button>
          ))}
        </div>
        <span className="sw-dockbar-sep" />
        <button type="button" className="sw-dock-btn" onClick={lucky}>
          <Icon name="dice" size={15} />
          <span>{t('home.lucky')}</span>
        </button>
        <span className="sw-dockbar-sep" />
        <button type="button" className="sw-dock-btn" onClick={onThemes}>
          <Icon name="palette" size={15} />
          <span>{t('home.themes')}</span>
        </button>
        <button type="button" className="sw-dock-btn is-primary" onClick={onBrowse}>
          <Icon name="folder" size={15} />
          <span>{mine ? t('home.mine', { n: mine }) : t('home.mineEmpty')}</span>
        </button>
      </div>
    </div>
  )
}
