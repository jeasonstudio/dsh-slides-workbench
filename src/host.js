// dsh-slides-workbench host 半片：/slides-workbench/* 接口、open-slide 工作区守护、agent 工具。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AgentBridge } from './agent-bridge.js'
import { Decks } from './decks.js'
import { packageRoot, resolveWorkspaceRoot } from './env.js'
import { APP_PREFIX, createHttpProxy, createUpgradeProxy, DEFAULT_ROOT_ROUTES, discoverRootRoutes } from './proxy.js'
import { DevServer } from './preview.js'
import { registerPrompt, registerSkills } from './skills.js'
import { Thumbs } from './thumbs.js'
import { registerTools } from './tools.js'
import { Workspace } from './workspace.js'

const PREFIX = '/slides-workbench'
const DECKS_CACHE_MS = 700
const AUTO_START_RETRY_MS = 60_000

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(payload)
}

async function readJson(req) {
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

/**
 * Web 服务不会替插件路由鉴权，每个请求都要自己走一遍 Host/Origin 与登录凭证检查。
 * 拿不到鉴权服务时一律拒绝。
 * @param {object} ctx - Cordis 上下文。
 * @param {{headers: object}} req - HTTP 请求。
 * @returns {number|undefined} 拒绝时的状态码。
 */
export function requestRejection(ctx, req) {
  const connection = ctx.get('connection')
  if (typeof connection?.requestRejection !== 'function') return 403
  return connection.requestRejection({ headers: req.headers })
}

function pluginVersion() {
  try {
    return JSON.parse(readFileSync(join(packageRoot(), 'package.json'), 'utf8')).version ?? null
  } catch {
    return null
  }
}

export default {
  name: 'dsh-slides-workbench',
  inject: ['webServer', 'connection'],
  apply(ctx, config = {}) {
    const workspace = new Workspace(resolveWorkspaceRoot(config))
    const decks = new Decks(workspace)
    const dev = new DevServer(workspace, { port: Number.isInteger(config.port) ? config.port : 5173 })
    const version = pluginVersion()
    const proxyHttp = createHttpProxy(dev)
    const proxyUpgrade = createUpgradeProxy(dev)
    // open-slide 编辑器的 Agent 面板：只接 DSH（不转发给它自己的 claude/codex provider）
    const bridge = new AgentBridge({ ctx, root: workspace.root })
    // deck 缩略图：headless Chrome 截一张缓存起来，首页直接用 <img>
    const thumbs = new Thumbs({ workspace, dev, decks })
    // token 级流式：把 DSH 的 assistant-stream 直接推给面板
    ctx.effect(() => bridge.attach(), 'dsh-slides-workbench: agent stream')

    let lastStartAttempt = 0
    // 用户手动停过就别自动拉起，直到他再点启动
    let autoStart = true
    let deckCache = { at: 0, rows: [] }
    let setupTask = null

    /** deck 列表缓存：面板轮询很频繁，别每次都扫盘。 */
    async function listDecks(force = false) {
      const now = Date.now()
      if (!force && now - deckCache.at < DECKS_CACHE_MS) return deckCache.rows
      const rows = await decks.list().catch(() => [])
      deckCache = { at: now, rows }
      return rows
    }

    /**
     * 需要时把 dev server 拉起来。失败后 60s 内不重试，避免轮询把日志刷爆。
     * @param {{force?: boolean}} [options] - force 表示用户手动点了启动。
     * @returns {Promise<object>} 快照。
     */
    async function ensureServer(options = {}) {
      if (dev.phase === 'running' || dev.phase === 'starting') return dev.snapshot()
      if (!options.force && !autoStart) return dev.snapshot()
      const now = Date.now()
      if (!options.force && now - lastStartAttempt < AUTO_START_RETRY_MS) return dev.snapshot()
      lastStartAttempt = now
      return dev.start()
    }

    /**
     * 装好插件就开始准备：补模板文件、后台装依赖。
     * 用户不需要手动点「初始化」——打开面板时工作区要么已经就绪，要么正在装。
     * @returns {Promise<void>}
     */
    async function bootstrap() {
      const first = await workspace.status()
      if (first.scaffolded) await workspace.ensureConfig().catch(() => {})
      if (first.scaffolded && first.installed) return
      if (!first.scaffolded) await workspace.scaffold().catch(() => {})
      const after = await workspace.status()
      if (!after.installed && after.install.status !== 'running') await workspace.installDeps().catch(() => {})
    }

    async function state() {
      const [workspaceStatus, deckRows] = await Promise.all([workspace.status(), listDecks()])
      // 顺手把缩略图排进后台队列，下次打开首页就有图
      thumbs.warm(deckRows)
      return {
        version,
        workspace: workspaceStatus,
        server: dev.snapshot(),
        decks: deckRows,
      }
    }

    /**
     * deck 增删之后要让 dev server 重新扫一遍 slides/：open-slide 的清单是启动时生成的，
     * 新目录不会被热更新认出来。重启很快（<1s），只在服务在跑时做。
     */
    function rescanSlides() {
      if (dev.phase !== 'running') return
      dev.restart().catch(() => {})
    }

    /** 初始化工作区并后台装依赖（幂等；面板轮询 /state 看进度）。 */
    function setup() {
      if (setupTask) return setupTask
      setupTask = (async () => {
        await workspace.scaffold()
        if (!(await workspace.status()).installed) await workspace.installDeps()
        deckCache = { at: 0, rows: [] }
        setupTask = null
        return state()
      })().catch((err) => {
        setupTask = null
        throw err
      })
      return setupTask
    }

    async function route(req, res) {
      const url = new URL(req.url || '/', 'http://local')
      const rest = url.pathname.slice(PREFIX.length).replace(/^\/+/, '').replace(/\/+$/, '')
      const method = req.method || 'GET'

      if (rest === 'thumb' && (method === 'GET' || method === 'HEAD')) {
        await thumbs.handle(req, res)
        return
      }

      // open-slide 自己的页面（含它的静态资源和 HMR）：原样转发给 dev server
      if (rest === 'app' || rest.startsWith('app/')) {
        proxyHttp(req, res)
        return
      }

      if (method === 'GET' || method === 'HEAD') {
        if (rest === 'state' || rest === 'health') {
          const payload = await state()
          if (rest === 'state' && payload.workspace.installed) ensureServer().catch(() => {})
          return json(res, 200, payload)
        }
        if (rest === 'deck/source') {
          const id = url.searchParams.get('id') ?? ''
          const deck = await decks.get(id)
          return json(res, 200, { id: deck.id, source: deck.source })
        }
        return json(res, 404, { error: '接口不存在' })
      }

      if (method !== 'POST') return json(res, 405, { error: '不支持的方法' })

      // 写操作拒绝跨站请求
      const site = req.headers['sec-fetch-site']
      if (site && site !== 'same-origin' && site !== 'none') return json(res, 403, { error: '拒绝跨站请求' })

      const body = await readJson(req)
      switch (rest) {
        case 'setup': {
          const workspaceStatus = await workspace.status()
          // 已有工作区：只补文件，不重复装依赖
          if (workspaceStatus.installed) {
            await workspace.scaffold()
            return json(res, 200, await state())
          }
          setup().catch(() => {})
          const payload = await state()
          return json(res, 200, payload)
        }
        case 'server': {
          if (body.action === 'stop') {
            autoStart = false
            await dev.stop()
            return json(res, 200, await state())
          }
          autoStart = true
          lastStartAttempt = Date.now()
          await dev.start().catch(() => {})
          return json(res, 200, await state())
        }
        case 'deck/create': {
          const deck = await decks.create(body.title, body.id)
          deckCache = { at: 0, rows: [] }
          rescanSlides()
          return json(res, 200, { deck })
        }
        case 'deck/delete': {
          const result = await decks.remove(String(body.id ?? ''))
          deckCache = { at: 0, rows: [] }
          rescanSlides()
          return json(res, 200, result)
        }
        case 'build': {
          const result = await workspace.build()
          return json(res, result.ok ? 200 : 500, result)
        }
        default:
          return json(res, 404, { error: '接口不存在' })
      }
    }

    // 模型侧能力：工具、skill、system prompt。服务缺失时各自安静跳过。
    registerTools(ctx, { workspace, decks, dev })
    registerSkills(ctx)
    registerPrompt(ctx, { workspace })

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: PREFIX,
      handler: async (req, res) => {
        const rejection = requestRejection(ctx, req)
        if (rejection) {
          json(res, rejection, { error: '未授权' })
          return
        }
        try {
          await route(req, res)
        } catch (err) {
          if (res.headersSent) {
            res.end()
            return
          }
          json(res, err?.status ?? 500, { error: err?.message ?? '出错了' })
        }
      },
    }), 'dsh-slides-workbench: /slides-workbench routes')

    // 插件一装好就开始准备，不用等用户点初始化
    bootstrap().catch(() => {})

    // open-slide 的客户端会直接请求根路径下的 /__* 接口（/__agent/events、/__slides、/__folders…），
    // 不走 base 前缀。iframe 和面板同源以后这些请求会落到 DSH 上，所以逐个转发给 dev server。
    // 注：DSH 的 prefix 路由按 '/前缀/' 分段匹配，'/__' 接不住 '/__slides'，只能一个一级路径一个。
    const proxiedPaths = new Set()
    const proxyRootRoute = (path) => {
      if (proxiedPaths.has(path)) return
      proxiedPaths.add(path)
      try {
        ctx.effect(() => ctx.webServer.register({
          kind: 'prefix',
          path,
          handler: (req, res) => {
            const rejection = requestRejection(ctx, req)
            if (rejection) {
              json(res, rejection, { error: '未授权' })
              return
            }
            // /__agent 由 DSH 桥接管，其它 /__* 原样转发给 dev server
            if (path === '/__agent') {
              bridge.handle(req, res).then((handled) => {
                if (!handled) proxyHttp(req, res)
              }, (err) => {
                json(res, err?.status ?? 500, { error: err?.message ?? '出错了' })
              })
              return
            }
            proxyHttp(req, res)
          },
        }), `dsh-slides-workbench: ${path} proxy`)
      } catch (err) {
        proxiedPaths.delete(path)
        ctx.logger?.warn?.(`slides-workbench: ${path} 路由被占用，open-slide 对应接口不可用：${err?.message ?? err}`)
      }
    }
    for (const path of DEFAULT_ROOT_ROUTES) proxyRootRoute(path)
    // 装好依赖之后按实际源码再补一遍：open-slide 升级新增的端点也能自动接上
    ctx.effect(() => {
      let cancelled = false
      discoverRootRoutes(workspace.coreDir)
        .then((paths) => {
          if (cancelled) return
          for (const path of paths) proxyRootRoute(path)
        })
        .catch(() => {})
      return () => {
        cancelled = true
      }
    }, 'dsh-slides-workbench: discover /__ routes')

    // Vite 的 HMR WebSocket：路径带 base 前缀，带不带尾斜杠都接一下
    for (const path of [APP_PREFIX, `${APP_PREFIX}/`]) {
      ctx.effect(() => ctx.webServer.registerUpgrade({ path, handler: (req, socket, head) => {
        const rejection = requestRejection(ctx, req)
        if (rejection) {
          socket.end(`HTTP/1.1 ${rejection} ${rejection === 401 ? 'Unauthorized' : 'Forbidden'}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`)
          return
        }
        proxyUpgrade(req, socket, head)
      } }), `dsh-slides-workbench: hmr ${path}`)
    }

    // 插件卸载时把 dev server 和 agent SSE 收掉，不留孤儿
    ctx.effect(() => () => {
      bridge.dispose()
      dev.kill().catch(() => {})
    }, 'dsh-slides-workbench: dev server')
  },
}

export { Decks, DevServer, Workspace }