// Agent 桥的单元测试：open-slide 的 /__agent/* 协议 → DSH 会话。
import assert from 'node:assert/strict'
import test from 'node:test'
import { AgentBridge } from '../src/agent-bridge.js'

/** 造一个够用的 ctx：agents / sessionController / sessionQuery。 */
function harness() {
  const sent = []
  const cancelled = []
  const sessions = []
  const events = []
  const steered = []
  const agent = {
    session: { id: 'dsh-1' },
    followup(message) {
      sent.push(message)
    },
    steer(message) {
      steered.push(message)
    },
    cancel(cause) {
      cancelled.push(cause)
    },
  }
  const listeners = []
  const selections = []
  const ctx = {
    on(name, listener) {
      listeners.push({ name, listener })
      return () => {
        const index = listeners.findIndex(row => row.listener === listener)
        if (index !== -1) listeners.splice(index, 1)
      }
    },
    get(name) {
      if (name === 'agents') return { get: id => (id === 'dsh-1' ? agent : undefined) }
      if (name === 'sessionController') {
        return {
          async create(request) {
            sessions.push(request)
            return { sessionId: 'dsh-1' }
          },
          async modelCatalog() {
            return {
              default: { provider: 'deepseek', model: 'chat' },
              groups: [{
                id: 'deepseek',
                name: 'DeepSeek',
                models: [{ id: 'chat', name: 'Chat', reasoning: { efforts: ['low', 'high'] } }],
              }],
            }
          },
          async selectModel(request) {
            selections.push(request)
          },
        }
      }
      if (name === 'sessionQuery') {
        return {
          async observeSession() {
            return { events: events.map(event => ({ ...event })), release() {} }
          },
        }
      }
      return undefined
    },
  }
  const bridge = new AgentBridge({ ctx, root: '/tmp/workspace' })
  return { bridge, sent, cancelled, steered, sessions, events, listeners, selections }
}

/** 最小响应对象。 */
function response() {
  const out = { statusCode: 0, headers: {}, body: '' }
  return {
    out,
    get statusCode() {
      return out.statusCode
    },
    set statusCode(value) {
      out.statusCode = value
    },
    setHeader(name, value) {
      out.headers[name.toLowerCase()] = value
    },
    end(chunk) {
      if (chunk !== undefined) out.body += chunk.toString()
    },
    get json() {
      return out.body ? JSON.parse(out.body) : null
    },
  }
}

/** 一次 handle 调用。 */
async function call(bridge, { path, method = 'GET', body }) {
  const res = response()
  const req = {
    method,
    url: `/__agent${path}`,
    headers: {},
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) yield Buffer.from(JSON.stringify(body))
    },
  }
  const handled = await bridge.handle(req, res)
  assert.equal(handled, true, `${method} ${path} 应该被桥接住`)
  return res
}

test('status 只报 DSH 一个 provider，不再有 claude/codex', async () => {
  const { bridge } = harness()
  const res = await call(bridge, { path: '/status' })
  assert.equal(res.out.statusCode, 200)
  assert.equal(res.json.enabled, true)
  assert.equal(res.json.providers.length, 1)
  assert.equal(res.json.providers[0].name, 'DeepSeek Harness')
  assert.equal(res.json.providers[0].ready, true)
})

test('创建 session 会在 DSH 里建一个会话，并带上 slideId', async () => {
  const { bridge, sessions } = harness()
  const res = await call(bridge, { path: '/sessions', method: 'POST', body: { provider: 'claude', slideId: 'q2-launch' } })
  assert.equal(res.out.statusCode, 200)
  assert.equal(res.json.slideId, 'q2-launch')
  assert.equal(res.json.providerSessionId, 'dsh-1')
  assert.deepEqual(res.json.items, [])
  assert.deepEqual(sessions, [{ cwd: '/tmp/workspace' }])

  const list = await call(bridge, { path: '/sessions' })
  assert.equal(list.json.sessions.length, 1)
  assert.equal(list.json.sessions[0].status, 'idle')
})

test('发消息会写进 DSH 会话，并把工作台上下文一起带过去', async () => {
  const { bridge, sent } = harness()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: { slideId: 'q2-launch' } })
  const id = created.json.id
  const res = await call(bridge, {
    path: `/sessions/${id}/messages`,
    method: 'POST',
    body: {
      text: '把这页的标题改小一点',
      context: { slideTitle: 'Q2 launch', pageNumber: 3, totalPages: 6, selection: { tagName: 'h1', text: '一句话' } },
    },
  })
  assert.equal(res.out.statusCode, 200)
  assert.equal(sent.length, 1)
  const message = sent[0]
  assert.equal(message.role, 'user')
  assert.equal(message.source.kind, 'user')
  const text = message.content[0].text
  assert.match(text, /q2-launch/)
  assert.match(text, /第 3\/6 页/)
  assert.match(text, /标题改小一点/)

  // 会话进入 running；再发一条不会报错，而是走 steer 插话
  const full = await call(bridge, { path: `/sessions/${id}` })
  assert.equal(full.json.status, 'running')
  const again = await call(bridge, { path: `/sessions/${id}/messages`, method: 'POST', body: { text: '再来' } })
  assert.equal(again.out.statusCode, 200)
})

test('会话事件会翻成 open-slide 的 item：用户 / 助手 / 工具 / 结果', async () => {
  const { bridge, events } = harness()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: { slideId: 'q2-launch' } })
  const id = created.json.id
  await call(bridge, { path: `/sessions/${id}/messages`, method: 'POST', body: { text: 'hi' } })

  events.push(
    { type: 'user/message', seq: 1, time: Date.now(), data: { id: 'm1', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'hi' }] } },
    { type: 'tool/call', seq: 2, time: Date.now(), data: { name: 'slides_list', arguments: '{}', callId: 'c1' } },
    { type: 'tool/result', seq: 3, time: Date.now(), data: { message: { toolCallId: 'c1', isError: false } } },
    { type: 'assistant/message', seq: 4, time: Date.now(), data: { message: { content: [{ type: 'text', text: '改好了' }] } } },
    { type: 'turn/end', seq: 5, time: Date.now(), data: { reason: { kind: 'completed' } } },
  )
  await bridge.poll()

  const full = await call(bridge, { path: `/sessions/${id}` })
  const items = full.json.items
  assert.deepEqual(items.map(item => item.kind), ['user', 'tool', 'assistant', 'result'])
  assert.equal(items[1].status, 'done')
  assert.equal(items[2].text, '改好了')
  assert.equal(full.json.status, 'idle', 'turn/end 之后要回到 idle')
})

test('停止会打断 DSH 会话，删除会移除映射', async () => {
  const { bridge, cancelled } = harness()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: {} })
  const id = created.json.id
  await call(bridge, { path: `/sessions/${id}/messages`, method: 'POST', body: { text: 'hi' } })
  const stopped = await call(bridge, { path: `/sessions/${id}/stop`, method: 'POST' })
  assert.equal(stopped.out.statusCode, 200)
  assert.deepEqual(cancelled, [{ kind: 'user' }])

  const removed = await call(bridge, { path: `/sessions/${id}`, method: 'DELETE' })
  assert.equal(removed.out.statusCode, 200)
  const list = await call(bridge, { path: '/sessions' })
  assert.equal(list.json.sessions.length, 0)
})

test('install 是空操作，未知接口不会被桥接（交回反代）', async () => {
  const { bridge } = harness()
  const install = await call(bridge, { path: '/install', method: 'POST', body: { provider: 'claude' } })
  assert.deepEqual(install.json, { ok: true })

  const res = response()
  const handled = await bridge.handle({ method: 'GET', url: '/__agent/nope', headers: {} }, res)
  assert.equal(handled, false)
})
test('模型下拉列的是 DSH 真实模型，选择会落到这个会话上', async () => {
  const { bridge, selections } = harness()
  const status = await call(bridge, { path: '/status' })
  assert.deepEqual(status.json.providers[0].models, [
    { id: 'deepseek/chat', label: 'Chat', efforts: ['low', 'high'] },
  ])

  const created = await call(bridge, { path: '/sessions', method: 'POST', body: {} })
  await call(bridge, {
    path: `/sessions/${created.json.id}/messages`,
    method: 'POST',
    body: { text: 'hi', model: 'deepseek/chat', effort: 'high' },
  })
  assert.deepEqual(selections, [
    { sessionId: 'dsh-1', provider: 'deepseek', model: 'chat', reasoningEffort: 'high' },
  ])
})

test('token 流：start / text-delta / end 会变成一条流式 assistant item', async () => {
  const { bridge, listeners } = harness()
  bridge.attach()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: {} })
  const id = created.json.id
  const stream = listeners.find(row => row.name === 'agent/assistant-stream')
  assert.ok(stream, '要订阅 assistant-stream')
  const agent = { session: { id: 'dsh-1' } }

  stream.listener({ agent, frame: { type: 'start', attemptId: 'a1', revision: 1, turn: 1, step: 1 } })
  stream.listener({ agent, frame: { type: 'chunk', attemptId: 'a1', revision: 1, index: 0, time: Date.now(), chunk: { type: 'text-delta', index: 0, text: '改' } } })
  stream.listener({ agent, frame: { type: 'chunk', attemptId: 'a1', revision: 1, index: 1, time: Date.now(), chunk: { type: 'text-delta', index: 0, text: '好了' } } })
  stream.listener({ agent, frame: { type: 'end', attemptId: 'a1', revision: 1, index: 2, outcome: { kind: 'committed', eventType: 'assistant/message', seq: 9 } } })

  const full = await call(bridge, { path: `/sessions/${id}` })
  const assistants = full.json.items.filter(item => item.kind === 'assistant')
  assert.equal(assistants.length, 1)
  assert.equal(assistants[0].text, '改好了')
  assert.equal(assistants[0].streaming, false)
})

test('turn 失败会显示成 error item', async () => {
  const { bridge, events } = harness()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: {} })
  const id = created.json.id
  await call(bridge, { path: `/sessions/${id}/messages`, method: 'POST', body: { text: 'hi' } })
  events.push({ type: 'turn/end', seq: 7, time: Date.now(), data: { reason: { kind: 'error', error: { message: '额度用完了' } } } })
  await bridge.poll()
  const full = await call(bridge, { path: `/sessions/${id}` })
  const error = full.json.items.find(item => item.kind === 'error')
  assert.equal(error.text, '额度用完了')
  assert.equal(full.json.status, 'idle')
})

test('DSH 提问会变成面板里的 question item，回答再回填给工具', async () => {
  const { bridge, listeners } = harness()
  bridge.attach()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: { slideId: 'q2-launch' } })
  const id = created.json.id
  const ask = listeners.find(row => row.name === 'user-questions/request')
  assert.ok(ask, '要接管 user-questions/request')

  const answerPromise = ask.listener({
    agent: { session: { id: 'dsh-1' } },
    questions: [{
      id: 'theme',
      header: '风格',
      question: '要深色还是浅色？',
      options: [{ label: '深色' }, { label: '浅色', description: '更像文档' }],
      multiSelect: false,
    }],
  }, () => Promise.reject(new Error('不该走 next')))

  const full = await call(bridge, { path: `/sessions/${id}` })
  const question = full.json.items.find(item => item.kind === 'question')
  assert.equal(question.status, 'pending')
  assert.equal(question.questions[0].question, '要深色还是浅色？')
  assert.deepEqual(question.questions[0].options.map(option => option.label), ['深色', '浅色'])

  await call(bridge, {
    path: `/sessions/${id}/respond`,
    method: 'POST',
    body: { itemId: question.id, answers: { theme: '深色' } },
  })
  assert.deepEqual(await answerPromise, { answers: [{ id: 'theme', selected: ['深色'] }] })

  const after = await call(bridge, { path: `/sessions/${id}` })
  assert.equal(after.json.items.find(item => item.kind === 'question').status, 'answered')
})

test('会话在跑的时候再发一句走 steer，而不是拒绝', async () => {
  const { bridge, steered, sent } = harness()
  const created = await call(bridge, { path: '/sessions', method: 'POST', body: {} })
  const id = created.json.id
  await call(bridge, { path: `/sessions/${id}/messages`, method: 'POST', body: { text: '第一句' } })
  const second = await call(bridge, { path: `/sessions/${id}/messages`, method: 'POST', body: { text: '插一句' } })
  assert.equal(second.out.statusCode, 200)
  assert.equal(sent.length, 1)
  assert.equal(steered.length, 1)
  assert.match(steered[0].content[0].text, /插一句/)
})
