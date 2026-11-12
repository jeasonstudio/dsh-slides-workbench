// Host 路由层的集成测试：用假 ctx 挂上插件，直接喂 HTTP 请求。
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import plugin, { requestRejection } from '../src/host.js'

const PREFIX = '/slides-workbench'

/** 造一个够用的 Cordis 上下文：webServer 收路由，connection 决定放不放行。 */
function harness(options = {}) {
  const routes = []
  const disposers = []
  const ctx = {
    get(name) {
      if (name === 'connection') return { requestRejection: () => options.reject }
      return undefined
    },
    webServer: {
      register(route) {
        routes.push(route)
        return () => {}
      },
      registerUpgrade() {
        return () => {}
      },
    },
    effect(factory) {
      const dispose = factory()
      if (typeof dispose === 'function') disposers.push(dispose)
      return () => {}
    },
    on() {
      return () => {}
    },
    logger: { warn() {} },
  }
  plugin.apply(ctx, { workspace: options.workspace })
  const main = routes.find(row => row.path === PREFIX)
  assert.ok(main, '插件应该注册 /slides-workbench 路由')
  const appRoute = routes.find(row => row.path === '/__folders')
  assert.ok(appRoute, 'open-slide 的 /__ 根接口也要注册代理')
  return { route: main, appRoute, routes, disposers }
}

/** 假响应：收集状态码、头和 body。 */
function response() {
  const out = { statusCode: 200, headers: {}, body: '' }
  return {
    out,
    get statusCode() {
      return out.statusCode
    },
    set statusCode(value) {
      out.statusCode = value
    },
    setHeader(name, value) {
      out.headers[name] = value
    },
    end(chunk) {
      if (chunk !== undefined) out.body += chunk
    },
    get json() {
      return out.body ? JSON.parse(out.body) : null
    },
    get done() {
      return out.body !== ''
    },
  }
}

async function call(route, { method = 'GET', path = '', body, headers = {} } = {}) {
  const res = response()
  const req = { method, url: `${PREFIX}${path}`, headers, async *[Symbol.asyncIterator]() {
    if (body !== undefined) yield Buffer.from(JSON.stringify(body))
  } }
  await route.handler(req, res)
  return res
}

/** 一个"已经装好"的工作区：不联网，但状态看起来像装完了。 */
async function installedWorkspace() {
  const root = await mkdtemp(join(tmpdir(), 'slides-route-'))
  await writeFile(join(root, 'package.json'), '{"name":"fixture","private":true}', 'utf8')
  const core = join(root, 'node_modules', '@open-slide', 'core')
  await mkdir(core, { recursive: true })
  await writeFile(join(core, 'package.json'), '{"name":"@open-slide/core","version":"9.9.9"}', 'utf8')
  // 假 CLI：被拉起来时立刻退出，测试里不会真的起 dev server
  await writeFile(join(core, 'bin.js'), 'process.exit(0)\n', 'utf8')
  return root
}

test('未鉴权的请求一律 401，不泄露路径', async () => {
  const { route } = harness({ reject: 401, workspace: await installedWorkspace() })
  const res = await call(route, { path: '/state' })
  assert.equal(res.out.statusCode, 401)
  assert.deepEqual(res.json, { error: '未授权' })
})

test('拿不到鉴权服务时 requestRejection 返回 403', () => {
  const ctx = { get: () => undefined }
  assert.equal(requestRejection(ctx, { headers: {} }), 403)
})

test('GET /state 给出工作区、服务、deck 三段状态', async () => {
  const root = await installedWorkspace()
  try {
    const { route } = harness({ workspace: root })
    const res = await call(route, { path: '/state' })
    assert.equal(res.out.statusCode, 200)
    const state = res.json
    assert.equal(state.workspace.path, root)
    assert.equal(state.workspace.scaffolded, true)
    assert.equal(state.workspace.installed, true)
    assert.equal(state.workspace.version, '9.9.9')
    assert.equal(state.server.status === 'stopped' || state.server.status === 'starting' || state.server.status === 'error', true)
    assert.deepEqual(state.decks, [])
    assert.equal(typeof state.version, 'string')
    await call(route, { method: 'POST', path: '/server', body: { action: 'stop' } })
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 })
  }
})

test('POST /setup 补模板文件，已有依赖不重装', async () => {
  const root = await installedWorkspace()
  try {
    const { route } = harness({ workspace: root })
    const res = await call(route, { method: 'POST', path: '/setup', body: {} })
    assert.equal(res.out.statusCode, 200)
    assert.equal(res.json.workspace.scaffolded, true)
    const template = await readFile(join(root, 'open-slide.config.ts'), 'utf8')
    assert.match(template, /OpenSlideConfig/)
    await call(route, { method: 'POST', path: '/server', body: { action: 'stop' } })
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 })
  }
})

test('deck 创建 / 读源码 / 删除走完整链路', async () => {
  const root = await installedWorkspace()
  try {
    const { route } = harness({ workspace: root })
    const created = await call(route, { method: 'POST', path: '/deck/create', body: { title: 'Q2 Launch' }, headers: { 'sec-fetch-site': 'same-origin' } })
    assert.equal(created.out.statusCode, 200)
    assert.equal(created.json.deck.id, 'q2-launch')
    assert.equal(created.json.deck.pages, 1)

    const state = await call(route, { path: '/state' })
    assert.equal(state.json.decks.length, 1)
    assert.equal(state.json.decks[0].id, 'q2-launch')

    const source = await call(route, { path: '/deck/source?id=q2-launch' })
    assert.equal(source.out.statusCode, 200)
    assert.match(source.json.source, /export default \[Cover\] satisfies Page\[\];/)

    const removed = await call(route, { method: 'POST', path: '/deck/delete', body: { id: 'q2-launch' }, headers: { 'sec-fetch-site': 'same-origin' } })
    assert.equal(removed.out.statusCode, 200)
    assert.equal(removed.json.ok, true)
    await call(route, { method: 'POST', path: '/server', body: { action: 'stop' } })
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 })
  }
})

test('跨站写请求被拒，参数错误给 400 而不是 500', async () => {
  const root = await installedWorkspace()
  try {
    const { route } = harness({ workspace: root })
    const crossSite = await call(route, { method: 'POST', path: '/deck/create', body: { title: 'x' }, headers: { 'sec-fetch-site': 'cross-site' } })
    assert.equal(crossSite.out.statusCode, 403)

    const noTitle = await call(route, { method: 'POST', path: '/deck/create', body: {}, headers: { 'sec-fetch-site': 'same-origin' } })
    assert.equal(noTitle.out.statusCode, 400)
    assert.match(noTitle.json.error, /标题/)

    const missing = await call(route, { path: '/deck/source?id=nope' })
    assert.equal(missing.out.statusCode, 404)

    const unknown = await call(route, { path: '/nope' })
    assert.equal(unknown.out.statusCode, 404)
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 })
  }
})