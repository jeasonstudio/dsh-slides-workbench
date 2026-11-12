// open-slide 编辑器里那个 Agent 面板的后端：用 DSH 的会话当唯一的 agent。
//
// open-slide 自己的 provider 只有 claude / codex（硬编码，走各自 CLI），没有自定义 provider 入口。
// 但它跟面板之间就是一套 HTTP + SSE 协议，而我们站在同源反代中间，于是直接把 /__agent/*
// 接管下来：一个 open-slide agent session 对应一个真实的 DSH 会话（会出现在 DSH 侧栏里），
// 面板里的提问写成这个会话的用户消息，DSH 的会话事件再翻译回 open-slide 的 item。
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PROVIDER_ID = 'claude'
const PROVIDER_NAME = 'DeepSeek Harness'
const POLL_MS = 900
const MAX_ITEMS = 200

/** 文本内容块拼成一段话。 */
function textOf(content) {
  if (!Array.isArray(content)) return ''
  return content
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('\n')
    .trim()
}

/** 把 DSH 的会话事件翻成 open-slide 的 AgentItem。 */
function toItem(event) {
  const data = event?.data ?? {}
  switch (event?.type) {
    case 'user/message': {
      if (data.source?.kind !== 'user') return null
      const text = textOf(data.content)
      return text ? { id: `ev-${event.seq}`, kind: 'user', ts: new Date(event.time).toISOString(), text } : null
    }
    case 'assistant/message': {
      const text = textOf(data.message?.content)
      if (!text) return null
      return { id: `ev-${event.seq}`, kind: 'assistant', ts: new Date(event.time).toISOString(), text, streaming: false }
    }
    case 'tool/call': {
      let detail = String(data.arguments ?? '')
      detail = detail.length > 200 ? `${detail.slice(0, 200)}…` : detail
      return {
        id: `tool-${data.callId}`,
        kind: 'tool',
        ts: new Date(event.time).toISOString(),
        name: String(data.name ?? 'tool'),
        title: String(data.name ?? 'tool'),
        detail: detail || null,
        status: 'running',
      }
    }
    case 'tool/result': {
      const failed = data.error !== undefined || data.message?.isError === true
      return {
        id: `tool-${data.message?.toolCallId ?? data.callId}`,
        kind: 'tool',
        ts: new Date(event.time).toISOString(),
        name: '',
        title: '',
        detail: null,
        status: failed ? 'error' : 'done',
        // 只更新状态：标题/详情沿用 tool/call 那条
        patch: true,
      }
    }
    case 'turn/end': {
      const aborted = data.reason?.kind !== 'completed'
      if (data.reason?.kind === 'error') {
        return {
          id: `result-${event.seq}`,
          kind: 'error',
          ts: new Date(event.time).toISOString(),
          text: data.reason.error?.message ?? '模型调用失败',
        }
      }
      return {
        id: `result-${event.seq}`,
        kind: 'result',
        ts: new Date(event.time).toISOString(),
        durationMs: null,
        costUsd: null,
        aborted,
      }
    }
    default:
      return null
  }
}

/** 把 agent 的 turn 上下文写成给模型看的一小段前缀。 */
function contextBlock(context, slideId) {
  if (!context && !slideId) return ''
  const parts = []
  if (slideId) parts.push(`deck = ${slideId}`)
  if (context?.slideTitle) parts.push(`标题「${context.slideTitle}」`)
  if (context?.pageNumber) parts.push(`第 ${context.pageNumber}/${context.totalPages ?? '?'} 页`)
  if (context?.pendingComments) parts.push(`${context.pendingComments} 条待处理批注`)
  const selection = context?.selection
  if (selection && typeof selection.text === 'string' && selection.text.trim()) {
    parts.push(`选中了 <${selection.tagName ?? 'element'}>「${selection.text.trim().slice(0, 80)}」`)
  }
  if (!parts.length) return ''
  return `（工作台上下文：${parts.join('，')}。用 slides_* 工具改这个 deck，别动别的 deck。）\n\n`
}

export class AgentBridge {
  /**
   * @param {object} options - 依赖注入。
   * @param {object} options.ctx - Cordis 上下文。
   * @param {string} options.root - open-slide 工作区路径（DSH 会话的 cwd）。
   */
  constructor({ ctx, root }) {
    this.ctx = ctx
    this.root = root
    /** @type {Map<string, object>} open-slide session id → 记录 */
    this.records = new Map()
    /** @type {Map<string, object>} DSH session id → 记录 */
    this.byDsh = new Map()
    this.modelCache = { at: 0, models: [] }
    this.detachStream = null
    /** @type {Set<import('node:http').ServerResponse>} */
    this.streams = new Set()
    this.timer = null
    this.busy = false
  }

  /** 依赖服务在不在：不在就让面板显示「未连接」，而不是假装能用。 */
  get available() {
    return typeof this.ctx.get('agents')?.get === 'function'
      && typeof this.ctx.get('sessionController')?.create === 'function'
  }

  /** 面板的模型下拉：直接列 DSH 当前可路由的真实模型。 */
  async models() {
    const controller = this.ctx.get('sessionController')
    const now = Date.now()
    if (now - this.modelCache.at < 30_000 && this.modelCache.models.length) return this.modelCache.models
    const models = []
    try {
      const catalog = await controller?.modelCatalog?.()
      for (const group of catalog?.groups ?? []) {
        for (const model of group.models ?? []) {
          const efforts = (model.reasoning?.efforts ?? []).map(effort => String(effort))
          models.push({
            id: `${group.id}/${model.id}`,
            label: `${model.name ?? model.id}`,
            efforts,
          })
        }
      }
    } catch {
      // 目录拿不到就用一个占位项，面板别空着
    }
    if (!models.length) models.push({ id: 'default', label: '当前会话的模型', efforts: [] })
    this.modelCache = { at: now, models }
    return models
  }

  async status() {
    const models = this.available ? await this.models() : []
    return {
      enabled: this.available,
      packageManager: 'npm',
      providers: this.available
        ? [{
            id: PROVIDER_ID,
            name: PROVIDER_NAME,
            sdkPackage: 'dsh',
            sdkVersion: null,
            cliCommand: 'dsh',
            cliFound: true,
            cliVersion: null,
            ready: true,
            models,
          }]
        : [],
    }
  }

  summary(record) {
    return {
      id: record.id,
      provider: PROVIDER_ID,
      title: record.title,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      status: record.running ? 'running' : 'idle',
      slideId: record.slideId,
    }
  }

  full(record) {
    return { ...this.summary(record), providerSessionId: record.dshSessionId, items: record.items.slice(-MAX_ITEMS) }
  }

  list() {
    return [...this.records.values()]
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map(record => this.summary(record))
  }

  /** 把事件推给所有 SSE 连接。 */
  broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`
    for (const res of this.streams) {
      try {
        res.write(payload)
      } catch {
        this.streams.delete(res)
      }
    }
  }

  /**
   * 订阅 DSH 的 token 流：assistant-stream 的 text-delta 直接推成 open-slide 的 delta，
   * 面板就能一边生成一边显示，而不是等这一轮结束。
   * @returns {() => void} 取消订阅。
   */
  attach() {
    // 模型问问题时，接管 DSH 的提问：在面板里画成可点选项，答案再回填给工具
    const offQuestions = this.ctx.on('user-questions/request', (request, next) => {
      const agent = request?.agent
      const sessionId = agent?.session?.id
      const record = sessionId ? this.byDsh.get(sessionId) : undefined
      if (!record) return next()
      const questions = Array.isArray(request?.questions) ? request.questions : []
      if (!questions.length) return next()
      const itemId = `q-${Date.now().toString(36)}`
      const item = {
        id: itemId,
        kind: 'question',
        ts: new Date().toISOString(),
        questions: questions.map(question => ({
          header: String(question.header ?? '问题'),
          question: String(question.question ?? ''),
          options: Array.isArray(question.options)
            ? question.options.map(option => ({
                label: String(option.label ?? ''),
                ...(option.description ? { description: String(option.description) } : {}),
              }))
            : [],
          multiSelect: question.multiSelect === true,
        })),
        answers: null,
        status: 'pending',
      }
      this.applyItem(record, item)
      return new Promise((resolve) => {
        record.pending = { itemId, resolve }
      })
    })

    const off = this.ctx.on('agent/assistant-stream', ({ agent, frame }) => {
      const record = this.byDsh.get(agent.session.id)
      if (!record || !frame) return
      if (frame.type === 'start') {
        const id = `a-${String(frame.attemptId)}-${frame.turn}-${frame.step}`
        record.streamId = id
        record.streamText = ''
        this.applyItem(record, {
          id,
          kind: 'assistant',
          ts: new Date().toISOString(),
          text: '',
          streaming: true,
        })
        return
      }
      if (frame.type === 'chunk') {
        const chunk = frame.chunk
        if (chunk?.type !== 'text-delta' || !record.streamId) return
        record.streamText = `${record.streamText ?? ''}${chunk.text}`
        this.broadcast({ type: 'delta', sessionId: record.id, itemId: record.streamId, text: chunk.text })
        return
      }
      if (frame.type === 'end' && record.streamId) {
        const id = record.streamId
        const index = record.items.findIndex(row => row.id === id)
        if (index !== -1) {
          const item = { ...record.items[index], text: record.streamText ?? record.items[index].text, streaming: false }
          record.items[index] = item
          this.broadcast({ type: 'item', sessionId: record.id, item })
        }
        record.streamId = null
        record.streamText = ''
      }
    })
    this.detachStream = () => {
      if (typeof off === 'function') off()
      if (typeof offQuestions === 'function') offQuestions()
    }
    return this.detachStream
  }

  ensurePolling() {
    if (this.timer) return
    this.timer = setInterval(() => {
      this.poll().catch(() => {})
    }, POLL_MS)
    this.timer.unref?.()
  }

  stopPolling() {
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = null
  }

  /** 拉一次每个记录的会话事件，把新 item 发出去。 */
  async poll() {
    if (this.busy) return
    const query = this.ctx.get('sessionQuery')
    if (typeof query?.observeSession !== 'function') return
    this.busy = true
    try {
      for (const record of this.records.values()) {
        if (!record.dshSessionId) continue
        let observation
        try {
          observation = await query.observeSession(record.dshSessionId, { projectionMode: 'none' })
        } catch {
          continue
        }
        try {
          const events = observation.events ?? []
          const fresh = events.filter(event => Number(event.seq) > record.cursor)
          if (!fresh.length) continue
          let changed = false
          let turnEnded = false
          for (const event of fresh) {
            record.cursor = Math.max(record.cursor, Number(event.seq))
            const item = toItem(event)
            if (event.type === 'turn/end') turnEnded = true
            if (!item) continue
            this.applyItem(record, item)
            changed = true
          }
          if (changed || turnEnded) {
            if (turnEnded) record.running = false
            record.updatedAt = new Date().toISOString()
            this.broadcast({ type: 'session', session: this.summary(record) })
          }
        } finally {
          observation?.release?.()
        }
      }
    } finally {
      this.busy = false
    }
  }

  applyItem(record, item) {
    let next = item
    if (item.patch) {
      const index = record.items.findIndex(row => row.id === item.id)
      if (index === -1) return
      next = { ...record.items[index], ...item }
      delete next.patch
      record.items[index] = next
      this.broadcast({ type: 'item', sessionId: record.id, item: next })
      return
    }
    // 助手消息：如果这一轮已经在流式输出，就地补完那条，不再插一条新的
    if (item.kind === 'assistant' && item.streaming !== true) {
      const index = record.items.findIndex(row => row.kind === 'assistant' && row.streaming === true)
      if (index !== -1) {
        const merged = { ...record.items[index], text: item.text, streaming: false, ts: item.ts ?? record.items[index].ts }
        record.items[index] = merged
        record.streamId = null
        this.broadcast({ type: 'item', sessionId: record.id, item: merged })
        return
      }
    }
    const index = record.items.findIndex(row => row.id === item.id)
    if (index === -1) record.items.push(item)
    else record.items[index] = { ...record.items[index], ...item }
    this.broadcast({ type: 'item', sessionId: record.id, item: record.items[record.items.length - 1 === index ? index : index] })
  }

  async createSession({ slideId }) {
    const controller = this.ctx.get('sessionController')
    if (typeof controller?.create !== 'function') throw new Error('当前 profile 没有会话服务，无法创建 DSH 会话')
    const created = await controller.create({ cwd: this.root })
    const dshSessionId = created.sessionId
    const id = `sw-${randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()
    const record = {
      id,
      dshSessionId,
      slideId: slideId ?? null,
      provider: PROVIDER_ID,
      title: slideId ? `${slideId} · 对话` : '演示文稿对话',
      createdAt: now,
      updatedAt: now,
      running: false,
      cursor: -1,
      emitted: 0,
      items: [],
    }
    this.records.set(id, record)
    this.byDsh.set(dshSessionId, record)
    // 给 DSH 会话起个能认出来的标题（侧栏里一眼看到是哪个 deck），
    // 并挂一段 agent 级的提示：这是演示文稿工作台的对话
    try {
      const agent = this.ctx.get('agents')?.get?.(dshSessionId)
      const titles = this.ctx.get('sessionTitle')
      if (agent && typeof titles?.rename === 'function') titles.rename(agent.session, record.title)
      if (agent?.ctx?.systemPrompt && typeof agent.ctx.effect === 'function') {
        agent.ctx.effect(() => agent.ctx.systemPrompt.section({
          name: 'plugin:slides-workbench:deck',
          order: 520,
          text: '这段对话来自 DSH 的演示文稿工作台（open-slide）。改页面请用 slides_* 工具，目标 deck 由每次消息里的"工作台上下文"给出；不要动 package.json 和别的 deck。',
        }), 'dsh-slides-workbench: agent prompt')
      }
    } catch {
      // 标题/提示只是锦上添花
    }
    this.ensurePolling()
    this.broadcast({ type: 'session', session: this.summary(record) })
    return this.full(record)
  }

  agentFor(record) {
    const agent = this.ctx.get('agents')?.get?.(record.dshSessionId)
    if (!agent) throw new Error('DSH 会话还没准备好（可能已被关闭），刷新面板再试')
    return agent
  }

  async send(id, body) {
    const record = this.records.get(id)
    if (!record) throw Object.assign(new Error('会话不存在'), { status: 404 })
    const text = String(body?.text ?? '').trim()
    if (!text) throw Object.assign(new Error('消息为空'), { status: 400 })
    const agent = this.agentFor(record)
    const running = record.running
    // 面板里选了模型就把它落到这个 DSH 会话上（provider/model + effort）
    const model = typeof body?.model === 'string' ? body.model : ''
    if (model && model !== 'default' && model.includes('/')) {
      const [provider, ...rest] = model.split('/')
      try {
        await this.ctx.get('sessionController')?.selectModel?.({
          sessionId: record.dshSessionId,
          provider,
          model: rest.join('/'),
          ...(typeof body?.effort === 'string' && body.effort ? { reasoningEffort: body.effort } : {}),
        })
      } catch {
        // 选模型失败不该挡住这次提问
      }
    }
    const live = await this.liveContext()
    const context = { ...(live ?? {}), ...(body?.context ?? {}) }
    const prompt = `${contextBlock(context, record.slideId)}${text}`
    const message = {
      id: `sw-${randomUUID()}`,
      role: 'user',
      content: [{ type: 'text', text: prompt }],
      source: { kind: 'user' },
    }
    record.updatedAt = new Date().toISOString()
    try {
      // 已经在跑：DSH 的 steer 会把这句话插到下一个 step 边界，相当于"插话"
      if (running) agent.steer(message)
      else {
        record.running = true
        agent.followup(message)
      }
    } catch (err) {
      record.running = false
      throw Object.assign(new Error(`发不出去：${err?.message ?? err}`), { status: 500 })
    }
    this.broadcast({ type: 'session', session: this.summary(record) })
    return { ok: true }
  }

  /**
   * 读 open-slide 自己的 current.json：用户正在看哪个 deck、哪一页、选中了什么。
   * @returns {Promise<object|null>} 提示词上下文，读不到就 null。
   */
  async liveContext() {
    try {
      const file = join(this.root, 'node_modules', '.open-slide', 'current.json')
      const raw = await readFile(file, 'utf8')
      const data = JSON.parse(raw)
      return {
        slideTitle: data.slideTitle ?? undefined,
        pageNumber: data.pageNumber ?? undefined,
        totalPages: data.totalPages ?? undefined,
        selection: data.selection ?? null,
      }
    } catch {
      return null
    }
  }

  /**
   * 面板里回答了 DSH 的提问：把答案回填给挂起的 user-question，工具就能继续跑。
   * @param {string} id - open-slide 会话 id。
   * @param {object} body - `{ itemId, answers?, cancel?, allow? }`。
   * @returns {{ok: boolean}} 结果。
   */
  answer(id, body) {
    const record = this.records.get(id)
    if (!record) throw Object.assign(new Error('会话不存在'), { status: 404 })
    const pending = record.pending
    if (!pending) return { ok: false }
    const item = record.items.find(row => row.id === pending.itemId)
    const cancelled = body?.cancel === true
    const entries = body?.answers && typeof body.answers === 'object' ? Object.entries(body.answers) : []
    record.pending = null
    if (item) {
      const updated = cancelled
        ? { ...item, status: 'cancelled' }
        : { ...item, status: 'answered', answers: Object.fromEntries(entries) }
      const index = record.items.findIndex(row => row.id === item.id)
      if (index !== -1) record.items[index] = updated
      this.broadcast({ type: 'item', sessionId: record.id, item: updated })
    }
    // DSH 侧的答案结构：{ answers: [{ id, selected: [...], custom? }] }
    const answers = entries.map(([questionId, value]) => {
      const text = Array.isArray(value) ? value : [value]
      return { id: questionId, selected: text.map(item => String(item)) }
    })
    try {
      pending.resolve(cancelled ? { answers: [] } : { answers })
    } catch {
      // 提问已经超时结束
    }
    return { ok: true }
  }

  stop(id) {
    const record = this.records.get(id)
    if (!record) throw Object.assign(new Error('会话不存在'), { status: 404 })
    const agent = this.ctx.get('agents')?.get?.(record.dshSessionId)
    if (agent) {
      try {
        agent.cancel({ kind: 'user' })
      } catch {
        // 已经停了
      }
    }
    record.running = false
    this.broadcast({ type: 'session', session: this.summary(record) })
    return { ok: true }
  }

  remove(id) {
    const record = this.records.get(id)
    if (!record) throw Object.assign(new Error('会话不存在'), { status: 404 })
    const agent = this.ctx.get('agents')?.get?.(record.dshSessionId)
    if (agent && record.running) {
      try {
        agent.cancel({ kind: 'user' })
      } catch {
        // 忽略
      }
    }
    this.records.delete(id)
    this.byDsh.delete(record.dshSessionId)
    if (record.streamId) record.streamId = null
    this.broadcast({ type: 'session-removed', sessionId: id })
    return { ok: true }
  }

  /** 读一段 JSON body。 */
  async readBody(req) {
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 512_000) throw Object.assign(new Error('内容太大'), { status: 413 })
      chunks.push(chunk)
    }
    if (!chunks.length) return {}
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      throw Object.assign(new Error('请求不是有效的 JSON'), { status: 400 })
    }
  }

  json(res, status, body) {
    const payload = JSON.stringify(body)
    res.statusCode = status
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('cache-control', 'no-store')
    res.end(payload)
  }

  /** SSE：open-slide 用它接流。 */
  openStream(res) {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    })
    res.write(': connected\n\n')
    this.streams.add(res)
    this.ensurePolling()
    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n')
      } catch {
        clearInterval(heartbeat)
      }
    }, 15_000)
    heartbeat.unref?.()
    res.on('close', () => {
      clearInterval(heartbeat)
      this.streams.delete(res)
      if (this.streams.size === 0) this.stopPolling()
    })
  }

  /**
   * 处理一个 /__agent/* 请求。
   * @param {import('node:http').IncomingMessage} req - 请求。
   * @param {import('node:http').ServerResponse} res - 响应。
   * @returns {Promise<boolean>} 是否已经处理（false 表示交回原来的反代）。
   */
  async handle(req, res) {
    const url = new URL(req.url || '/', 'http://local')
    const rest = url.pathname.replace(/^\/__agent\/?/, '')
    const method = (req.method || 'GET').toUpperCase()

    if (rest === 'status' && method === 'GET') {
      this.json(res, 200, await this.status())
      return true
    }
    if (rest === 'events' && method === 'GET') {
      if (!this.available) {
        this.json(res, 200, { enabled: false })
        return true
      }
      this.openStream(res)
      return true
    }
    if (rest === 'install' && method === 'POST') {
      this.json(res, 200, { ok: true })
      return true
    }
    if (!this.available) {
      this.json(res, 503, { error: '当前 profile 缺少会话服务，Agent 面板暂不可用' })
      return true
    }

    const sessionsMatch = /^sessions\/([^/]+)(?:\/(messages|stop|respond))?$/.exec(rest)
    const queryMatch = /^sessions(?:\/([^/]+)\/(\d+))?$/.exec(rest)

    try {
      if (rest === 'sessions' && method === 'GET') {
        this.json(res, 200, { sessions: this.list() })
        return true
      }
      if (rest === 'sessions' && method === 'POST') {
        const body = await this.readBody(req)
        this.json(res, 200, await this.createSession(body))
        return true
      }
      if (sessionsMatch) {
        const id = sessionsMatch[1]
        const action = sessionsMatch[2]
        if (!action && method === 'GET') {
          const record = this.records.get(id)
          if (!record) this.json(res, 404, { error: '会话不存在' })
          else this.json(res, 200, this.full(record))
          return true
        }
        if (!action && method === 'DELETE') {
          this.json(res, 200, this.remove(id))
          return true
        }
        if (action === 'messages' && method === 'POST') {
          const body = await this.readBody(req)
          this.json(res, 200, await this.send(id, body))
          return true
        }
        if (action === 'stop' && method === 'POST') {
          this.json(res, 200, this.stop(id))
          return true
        }
        if (action === 'respond' && method === 'POST') {
          const body = await this.readBody(req)
          this.json(res, 200, this.answer(id, body))
          return true
        }
      }
      if (queryMatch && method === 'GET') {
        this.json(res, 404, { error: '接口不存在' })
        return true
      }
    } catch (err) {
      this.json(res, err?.status ?? 500, { error: err?.message ?? '出错了' })
      return true
    }
    return false
  }

  dispose() {
    this.detachStream?.()
    this.detachStream = null
    for (const res of this.streams) {
      try {
        res.end()
      } catch {
        // 忽略
      }
    }
    this.streams.clear()
    this.stopPolling()
    this.records.clear()
  }
}