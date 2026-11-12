// 浏览器侧数据层：只和同源的 /slides-workbench/* 说话，维护一份状态镜像。
// 面板本身不画 deck —— 画布、列表、编辑器全部是 open-slide 自己的页面，这里只负责
// 「工作区好了没 / dev server 起来没 / 起来以后那个页面挂哪个地址」。
import React from 'react'
import { APP_PREFIX } from './embed.js'
import { t } from './i18n.js'

const BASE = '/slides-workbench/'
const TICK_IDLE = 1500
const TICK_INSTALL = 800
const TICK_STARTING = 1000

let snapshot = {
  state: null,
  loading: true,
  error: null,
  busy: null,
  toast: null,
}

const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn())
}

function set(patch) {
  snapshot = { ...snapshot, ...(typeof patch === 'function' ? patch(snapshot) : patch) }
  emit()
}

function subscribe(fn) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getSnapshot() {
  return snapshot
}

/** 整个状态镜像；快照引用只在变化时更新，所以可以整块订阅。 */
export function useSnapshot() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

async function request(path, body) {
  let res
  try {
    res = await fetch(BASE + path, body === undefined
      ? { headers: { accept: 'application/json' }, credentials: 'same-origin' }
      : {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(body),
          credentials: 'same-origin',
        })
  } catch {
    throw new Error(t('error.network'))
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

const http = {
  state: () => request('state'),
  setup: () => request('setup', {}),
  server: (action) => request('server', { action }),
  createDeck: (title) => request('deck/create', { title }),
}

/** 直接和 agent 桥说话的几条路径（/__agent 由插件接管，同源）。 */
const agent = {
  createSession: (slideId) => call('/__agent/sessions', { provider: 'claude', slideId }),
  send: (id, text) => call(`/__agent/sessions/${encodeURIComponent(id)}/messages`, { text }),
}

async function call(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

// ---- 轮询 ----

let timer = 0
let inflight = false
let watchers = 0

function tickDelay() {
  const state = snapshot.state
  if (state?.workspace?.install?.status === 'running') return TICK_INSTALL
  if (state?.server?.status === 'starting') return TICK_STARTING
  return TICK_IDLE
}

function schedule(ms) {
  clearTimeout(timer)
  timer = setTimeout(tick, ms)
}

async function tick() {
  if (inflight) return
  inflight = true
  try {
    const state = await http.state()
    set({ state, loading: false, error: null })
  } catch (err) {
    set({ loading: false, error: err.message })
  } finally {
    inflight = false
    if (watchers > 0) schedule(tickDelay())
  }
}

/** 开始轮询；返回停止函数。页面切到后台时暂停，省 CPU。 */
export function watchState() {
  watchers += 1
  if (watchers === 1) {
    if (!snapshot.state) tick()
    else schedule(tickDelay())
    document.addEventListener('visibilitychange', onVisibility)
  }
  return () => {
    watchers = Math.max(0, watchers - 1)
    if (watchers === 0) {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }
}

function onVisibility() {
  clearTimeout(timer)
  if (document.hidden) return
  tick()
}

export function refresh() {
  clearTimeout(timer)
  return tick()
}

// ---- 动作 ----

export async function initialize() {
  set({ busy: 'setup' })
  try {
    set({ state: await http.setup() })
  } catch (err) {
    toast(err.message, { error: true })
  } finally {
    set({ busy: null })
  }
}

export async function startServer() {
  set({ busy: 'server' })
  try {
    set({ state: await http.server('start') })
  } catch (err) {
    toast(err.message, { error: true })
  } finally {
    set({ busy: null })
  }
}

export async function stopServer() {
  set({ busy: 'server' })
  try {
    set({ state: await http.server('stop') })
  } catch (err) {
    toast(err.message, { error: true })
  } finally {
    set({ busy: null })
  }
}

// ---- iframe 地址 ----

/** dev server 只监听 localhost（IPv6 ::1），127.0.0.1 连不上。 */
export function serverBase(state = snapshot.state) {
  const url = state?.server?.url
  if (!url) return null
  return String(url).replace('://127.0.0.1', '://localhost')
}

/**
 * iframe 地址：走 DSH 同源反代，而不是 open-slide 的 localhost:port。
 * 同源才能往页面里注入样式（隐藏 open-slide 自带的左侧导航）；带上 dev server
 * 的启动时间，服务重启后 iframe 会自动重新加载，而不是继续拿旧清单。
 * @param {object} state - /state 快照。
 * @returns {string} iframe 地址。
 */
export function appUrl(state = snapshot.state, route = '') {
  const at = Number(state?.server?.startedAt) || 0
  const path = String(route || '').replace(/^\/+/, '').replace(/\/+$/, '')
  return `${APP_PREFIX}/${path}?v=${at}`
}

/**
 * 首页卡片用的单页预览地址（open-slide 的干净预览路由，会把画布等比缩到 iframe 大小）。
 * @param {object} state - /state 快照。
 * @param {string} id - deck id。
 * @param {number} [page] - 第几页，从 1 开始。
 * @returns {string} iframe 地址。
 */
export function deckThumbUrl(state = snapshot.state, id, page = 1) {
  const at = Number(state?.server?.startedAt) || 0
  return `${APP_PREFIX}/s/${encodeURIComponent(id)}/preview?p=${Math.max(1, page)}&v=${at}`
}

/** 新建一个 deck，返回 deck 行。 */
export async function createDeck(title) {
  const data = await http.createDeck(title)
  return data?.deck ?? null
}

/** 把一句话需求发进新建的 deck 对话（失败不阻塞：先让人看到页面）。 */
export async function startAgent(deckId, text) {
  try {
    const session = await agent.createSession(deckId)
    await agent.send(session.id, text)
    return session
  } catch {
    return null
  }
}

/**
 * 在浏览器里单独打开时用的地址（真正的 dev server 地址，不经反代）。
 * @param {object} state - /state 快照。
 * @returns {string|null} 外链地址。
 */
export function externalUrl(state = snapshot.state) {
  const base = serverBase(state)
  return base ? `${base}${APP_PREFIX}/` : null
}

// ---- toast ----

let toastTimer = 0

export function toast(text, { error = false } = {}) {
  clearTimeout(toastTimer)
  set({ toast: { text, error, key: Date.now() } })
  toastTimer = setTimeout(() => set({ toast: null }), error || String(text).length > 24 ? 6000 : 3200)
}

export function dismissToast() {
  clearTimeout(toastTimer)
  set({ toast: null })
}