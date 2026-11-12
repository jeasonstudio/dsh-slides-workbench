// open-slide dev server 的同源反代（Host 半片）。
//
// 为什么要反代：iframe 只有和 DSH 页面同源，才能往里注入 CSS（去掉 open-slide 首页自带的
// 左侧导航），也顺手解决了远程访问时 localhost 连不上的问题。
// 做法：workspace 的 open-slide.config.ts 把 dev server 挂在 /slides-workbench/app/ 下，
// 这里把这个前缀原样转发给本机 dev server（路径不改，因为 base 已经带上了前缀），
// 另外把 Vite 的 HMR WebSocket 也接过去。
import { connect } from 'node:net'
import { readdir, readFile } from 'node:fs/promises'
import { request as httpRequest } from 'node:http'
import { join } from 'node:path'

/** dev server 在 DSH 同源路径下的挂载点（和 open-slide.config.ts 的 base 保持一致）。 */
export const APP_PREFIX = '/slides-workbench/app'

/** 代理转发的公共前置检查。 */
function unavailable(res) {
  res.statusCode = 503
  res.setHeader('content-type', 'text/plain; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end('open-slide dev server 还没就绪')
}

/**
 * HTTP 反代：把请求原样转发到本机 dev server，响应流式回去。
 * @param {{phase: string, port: number|null}} dev - dev server 实例。
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void} 处理器。
 */
export function createHttpProxy(dev) {
  return (req, res) => {
    if (dev.phase !== 'running' || !dev.port) {
      unavailable(res)
      return
    }
    const port = dev.port
    const headers = { ...req.headers, host: `localhost:${port}` }
    // 上游压缩会让 content-length 对不上（我们只是转发，不解压）
    delete headers['accept-encoding']
    const upstream = httpRequest({
      host: 'localhost',
      port,
      path: req.url || `${APP_PREFIX}/`,
      method: req.method,
      headers,
    }, (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers)
      response.pipe(res)
    })
    upstream.on('error', () => {
      if (res.headersSent) {
        res.destroy()
        return
      }
      res.statusCode = 502
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      res.end('open-slide dev server 连接失败')
    })
    req.pipe(upstream)
  }
}

/**
 * HMR WebSocket 反代：接管 upgrade 后把字节流对接给 dev server。
 * @param {{phase: string, port: number|null}} dev - dev server 实例。
 * @returns {(req: import('node:http').IncomingMessage, socket: import('node:stream').Duplex, head: Buffer) => void} 处理器。
 */
export function createUpgradeProxy(dev) {
  return (req, socket, head) => {
    if (dev.phase !== 'running' || !dev.port) {
      socket.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 0\r\n\r\n')
      return
    }
    const port = dev.port
    const upstream = connect(port, 'localhost')
    const close = () => {
      socket.destroy()
      upstream.destroy()
    }
    upstream.once('error', close)
    socket.once('error', close)
    upstream.once('close', close)
    socket.once('close', close)
    upstream.once('connect', () => {
      const path = req.url || `${APP_PREFIX}/`
      upstream.write(`GET ${path} HTTP/1.1\r\nHost: localhost:${port}\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n`)
      for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) continue
        // 只转发握手相关的头，其它（cookie 等）留在 DSH 这一侧
        if (!/^(sec-websocket-|origin$|user-agent$|accept-language$|accept-encoding$|accept$|cache-control$|pragma$)/i.test(key)) continue
        upstream.write(`${key}: ${Array.isArray(value) ? value.join(', ') : value}\r\n`)
      }
      upstream.write('\r\n')
      if (head?.length) upstream.write(head)
      socket.pipe(upstream).pipe(socket)
    })
  }
}

/**
 * open-slide 的客户端会直接请求根路径下的 `/__xxx` 接口（不走 base 前缀），
 * 而 DSH 的 prefix 路由按「/前缀/」分段匹配，`/__` 接不住 `/__slides`，
 * 所以要把每个一级路径单独注册。这里从装好的 @open-slide/core 里扫出实际用到的
 * 名字，这样升级 open-slide 之后新端点也能自动接上；扫不到就退回内置清单。
 * @param {string} coreDir - node_modules/@open-slide/core 的绝对路径。
 * @returns {Promise<string[]>} 形如 '/__slides' 的路径清单。
 */
export async function discoverRootRoutes(coreDir) {
  const found = new Set(DEFAULT_ROOT_ROUTES)
  try {
    const dir = join(coreDir, 'dist')
    const entries = await readdir(dir)
    for (const name of entries) {
      if (!name.endsWith('.js')) continue
      let text
      try {
        text = await readFile(join(dir, name), 'utf8')
      } catch {
        continue
      }
      for (const match of text.matchAll(/\/__[a-z][a-z0-9-]{1,24}/g)) found.add(match[0])
    }
  } catch {
    // 依赖没装好就只用内置清单
  }
  return [...found].sort()
}

/** 内置清单（扫不到源码时的兜底）。 */
export const DEFAULT_ROOT_ROUTES = [
  '/__agent',
  '/__assets',
  '/__comments',
  '/__design',
  '/__edit',
  '/__folders',
  '/__gfonts',
  '/__notes',
  '/__restart-server',
  '/__server-status',
  '/__slides',
  '/__svgl',
  '/__update-check',
  '/__update-package',
]
