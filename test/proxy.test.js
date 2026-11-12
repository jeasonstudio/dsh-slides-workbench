// 同源反代的单元测试：起真 HTTP 假 dev server，再起一个"DSH 侧"的 server 把请求交给反代。
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import { DEFAULT_ROOT_ROUTES, discoverRootRoutes, createHttpProxy } from '../src/proxy.js'

/** 假 dev server：记录请求，`/__slides` 返回一个 deck id。 */
async function fakeDev() {
  const seen = []
  const server = createServer((req, res) => {
    seen.push({ method: req.method, url: req.url })
    if (req.url === '/__slides' && req.method === 'POST') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ slideId: 'untitled-2' }))
      return
    }
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('nope')
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, seen, port: server.address().port }
}

/** 起一个"DSH 侧"的 server，用给定 handler 处理请求。 */
async function frontServer(handler) {
  const server = createServer((req, res) => handler(req, res))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, base: `http://127.0.0.1:${server.address().port}` }
}

test('POST /__slides 会转发给 dev server，而不是落到 DSH 的 405', async () => {
  const dev = await fakeDev()
  const front = await frontServer(createHttpProxy({ phase: 'running', port: dev.port }))
  try {
    const res = await fetch(`${front.base}/__slides`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { slideId: 'untitled-2' })
    assert.deepEqual(dev.seen, [{ method: 'POST', url: '/__slides' }])
  } finally {
    front.server.close()
    dev.server.close()
  }
})

test('dev server 没起来时给 503，不抛异常', async () => {
  const front = await frontServer(createHttpProxy({ phase: 'stopped', port: null }))
  try {
    const res = await fetch(`${front.base}/__folders`)
    assert.equal(res.status, 503)
    assert.match(await res.text(), /还没就绪/)
  } finally {
    front.server.close()
  }
})

test('内置根路径清单覆盖 open-slide 用到的接口', () => {
  for (const path of ['/__slides', '/__folders', '/__agent', '/__edit', '/__notes', '/__comments', '/__design', '/__assets', '/__svgl', '/__gfonts', '/__server-status', '/__restart-server', '/__update-check', '/__update-package']) {
    assert.ok(DEFAULT_ROOT_ROUTES.includes(path), `缺少 ${path}`)
  }
})

test('discoverRootRoutes 扫不到源码时退回内置清单', async () => {
  const routes = await discoverRootRoutes('/definitely/not/here')
  assert.deepEqual(routes, [...DEFAULT_ROOT_ROUTES].sort())
})