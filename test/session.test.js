// Agent 面板里的对话会话：每个 deck 一段 DSH 会话，首页需求原生发进去。用假的 DSH 服务，不起浏览器。
import assert from 'node:assert/strict'
import test from 'node:test'
import { bindServices, chatAvailable, chatMap, ensureChat, newChat, startChat } from '../client/session.js'

function fakes({ known = [] } = {}) {
  const calls = []
  let n = 0
  const face = {
    rename: async (title) => { calls.push(['rename', title]); return { ok: true, value: { title } } },
    prompt: async (content, mode) => { calls.push(['prompt', content, mode]); return { ok: true, value: { accepted: true } } },
  }
  return {
    calls,
    face,
    workspaces: {
      create: async (input) => { calls.push(['workspace', input]); return { workspaceId: 'w1', path: input.path } },
    },
    sessions: {
      list: { getSnapshot: () => ({ byId: Object.fromEntries(known.map((id) => [id, { id }])) }) },
      create: async (opts) => { n += 1; calls.push(['create', opts]); return `s${n}` },
      using: async (id, opts, fn) => { calls.push(['using', id]); return fn({ ready: Promise.resolve({ session: face }) }) },
    },
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

test('缺服务时不可用，调用直接报错', async () => {
  bindServices({ sessions: null, workspaces: null })
  assert.equal(chatAvailable(), false)
  await assert.rejects(ensureChat({ deckId: 'a', workspacePath: '/ws' }), /unavailable/)
})

test('ensureChat：工作区登记成 DSH Workspace，在里面给 deck 建会话并记住；改成 deck 标题', async () => {
  const f = fakes()
  bindServices(f)
  const id = await ensureChat({ deckId: 'deck-a', workspacePath: '/ws', title: 'Deck A' })
  await settle()
  assert.equal(chatMap()['deck-a'], id)
  assert.deepEqual(f.calls.find((c) => c[0] === 'workspace'), ['workspace', { path: '/ws' }])
  assert.deepEqual(f.calls.find((c) => c[0] === 'create'), ['create', { workspaceId: 'w1' }])
  assert.deepEqual(f.calls.find((c) => c[0] === 'rename'), ['rename', 'Deck A'])
})

test('ensureChat：deck 的会话 DSH 还列着就接着用；同一 deck 并发只建一次', async () => {
  const first = fakes()
  bindServices(first)
  const id = await ensureChat({ deckId: 'deck-b', workspacePath: '/ws' })

  const kept = fakes({ known: [id] })
  bindServices(kept)
  assert.equal(await ensureChat({ deckId: 'deck-b', workspacePath: '/ws' }), id)
  assert.equal(kept.calls.length, 0)

  const fresh = fakes()
  bindServices(fresh)
  const [x, y] = await Promise.all([ensureChat({ deckId: 'deck-c', workspacePath: '/ws' }), ensureChat({ deckId: 'deck-c', workspacePath: '/ws' })])
  assert.equal(x, y)
  assert.equal(fresh.calls.filter((c) => c[0] === 'create').length, 1)
})

test('newChat：这个 deck 换成一段新会话', async () => {
  const f = fakes({ known: [] })
  bindServices(f)
  const a = await ensureChat({ deckId: 'deck-d', workspacePath: '/ws' })
  const b = await newChat({ deckId: 'deck-d', workspacePath: '/ws' })
  assert.notEqual(a, b)
  assert.equal(chatMap()['deck-d'], b)
})

test('startChat：给 deck 开对话并原生发出需求；被拒时报错', async () => {
  const f = fakes()
  bindServices(f)
  const id = await startChat({ deckId: 'deck-e', workspacePath: '/ws', title: 'Q2', prompt: '做一份复盘' })
  assert.equal(chatMap()['deck-e'], id)
  assert.deepEqual(f.calls.find((c) => c[0] === 'prompt'), ['prompt', [{ type: 'text', text: '做一份复盘' }], 'queue'])

  const g = fakes()
  g.face.prompt = async () => ({ ok: false, error: { message: 'busy' } })
  bindServices(g)
  await assert.rejects(startChat({ deckId: 'deck-f', workspacePath: '/ws', prompt: 'x' }), /busy/)
})
