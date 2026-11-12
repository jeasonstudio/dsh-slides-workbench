// open-slide dev server 守护：按需启动、找空闲端口、保留日志尾部、退出时收尸。
import { spawn } from 'node:child_process'
import { createConnection } from 'node:net'
import { exists } from './env.js'
import { pipeLines } from './env.js'

const LOG_LIMIT = 240
const START_TIMEOUT_MS = 90_000
const READY_POLL_MS = 350
const PORT_RANGE = 40

/** 端口是否空闲（本机 127.0.0.1）。 */
function portFree(port) {
  return new Promise((resolvePromise) => {
    const socket = createConnection({ port, host: '127.0.0.1' })
    const done = (free) => {
      socket.removeAllListeners()
      socket.destroy()
      resolvePromise(free)
    }
    socket.setTimeout(400)
    socket.once('connect', () => done(false))
    socket.once('timeout', () => done(true))
    socket.once('error', () => done(true))
  })
}

/** 探测 dev server 是否已经能响应（localhost 可能解析到 ::1）。 */
async function httpReady(port) {
  const targets = [`http://localhost:${port}/`, `http://[::1]:${port}/`, `http://127.0.0.1:${port}/`]
  for (const url of targets) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1200) })
      if (response.ok) return true
    } catch {
      // 换下一个地址
    }
  }
  return false
}

/** 让出一小会儿，别把事件循环堵死。 */
const sleep = (ms) => new Promise(resolvePromise => setTimeout(resolvePromise, ms))

export class DevServer {
  /**
   * @param {import('./workspace.js').Workspace} workspace - 工作区。
   * @param {{port?: number}} [options] - 起始端口。
   */
  constructor(workspace, options = {}) {
    this.workspace = workspace
    this.preferredPort = Number.isInteger(options.port) ? options.port : 5173
    this.phase = 'stopped'
    this.port = null
    this.url = null
    this.error = null
    this.log = []
    this.child = null
    this.starting = null
    this.pending = null
    this.startedAt = null
  }

  /** 给面板的快照。 */
  snapshot() {
    return {
      status: this.phase,
      url: this.phase === 'running' ? this.url : null,
      port: this.port,
      error: this.error,
      startedAt: this.startedAt,
      log: this.log.slice(-40),
    }
  }

  note(line) {
    if (!line) return
    this.log.push(line)
    if (this.log.length > LOG_LIMIT) this.log.splice(0, this.log.length - LOG_LIMIT)
  }

  /** 取一个空闲端口。 */
  async pickPort() {
    for (let offset = 0; offset < PORT_RANGE; offset += 1) {
      const port = this.preferredPort + offset
      if (await portFree(port)) return port
    }
    throw new Error('找不到空闲端口')
  }

  /**
   * 串行执行启动/停止/重启：面板轮询、deck 增删、用户点按钮可能同时触发，
   * 不同步就会出现「两个 dev server 抢一个端口」的孤儿进程。
   * @param {() => Promise<object>} operation - 要执行的操作。
   * @returns {Promise<object>} 操作结果。
   */
  queue(operation) {
    const previous = this.pending ?? Promise.resolve()
    const next = previous.then(operation, operation)
    this.pending = next.catch(() => {})
    return next
  }

  /**
   * 启动 dev server（幂等）。已经在跑就直接返回快照。
   * @returns {Promise<object>} 快照。
   */
  async start() {
    if (this.phase === 'running' && this.child) return this.snapshot()
    if (this.starting) return this.starting
    this.starting = this.queue(() => this._start()).finally(() => {
      this.starting = null
    })
    return this.starting
  }

  async _start() {
    if (!exists(this.workspace.binPath)) {
      this.phase = 'error'
      this.error = '依赖还没装好，先在面板里初始化工作台'
      this.note(this.error)
      return this.snapshot()
    }
    await this.kill()
    this.phase = 'starting'
    this.error = null
    this.log = []
    try {
      this.port = await this.pickPort()
    } catch (err) {
      this.phase = 'error'
      this.error = err.message
      return this.snapshot()
    }
    this.url = `http://localhost:${this.port}`
    this.note(`启动 open-slide dev（端口 ${this.port}）…`)
    const child = spawn(process.execPath, [this.workspace.binPath, 'dev', '--port', String(this.port), '--no-skills-check'], {
      cwd: this.workspace.root,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', BROWSER: 'none' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    this.child = child
    pipeLines(child.stdout, line => this.note(line))
    pipeLines(child.stderr, line => this.note(line))
    child.on('exit', (code, signal) => {
      if (this.child !== child) return
      this.child = null
      const crashed = this.phase === 'running' || this.phase === 'starting'
      if (crashed) {
        this.phase = 'error'
        this.error = `dev server 退出了（${signal ?? `退出码 ${code}`}）`
        this.note(this.error)
      }
    })
    child.on('error', (err) => {
      if (this.child !== child) return
      this.phase = 'error'
      this.error = err.message
      this.note(`启动失败：${err.message}`)
    })

    const deadline = Date.now() + START_TIMEOUT_MS
    while (Date.now() < deadline) {
      // 用户中途点了停止、或者子进程自己挂了，就别再等
      if (this.phase !== 'starting') return this.snapshot()
      if (this.phase === 'error') return this.snapshot()
      if (await httpReady(this.port)) {
        this.phase = 'running'
        this.startedAt = Date.now()
        this.note(`dev server 就绪：${this.url}`)
        return this.snapshot()
      }
      await sleep(READY_POLL_MS)
    }
    this.phase = 'error'
    this.error = 'dev server 启动超时（90s），看看下面的日志'
    return this.snapshot()
  }

  /** 停掉子进程。 */
  async kill() {
    const child = this.child
    this.child = null
    if (!child) return
    try {
      child.kill('SIGTERM')
    } catch {
      // 已经没了
    }
    const exited = new Promise(resolvePromise => child.once('exit', () => resolvePromise(true)))
    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL')
      } catch {
        // 已经没了
      }
    }, 2500)
    timer.unref?.()
    await Promise.race([exited, sleep(3000)])
    clearTimeout(timer)
  }

  /** 重启：deck 目录结构变了（新建/删除）之后，让 dev server 重新扫描 slides/。 */
  async restart() {
    if (this.starting) await this.starting.catch(() => {})
    this.starting = this.queue(async () => {
      await this.kill()
      this.phase = 'stopped'
      this.startedAt = null
      this.error = null
      return this._start()
    }).finally(() => {
      this.starting = null
    })
    return this.starting
  }

  /** 停服务并复位状态。 */
  async stop() {
    if (this.starting) await this.starting.catch(() => {})
    return this.queue(async () => {
      await this.kill()
      this.phase = 'stopped'
      this.startedAt = null
      this.error = null
      return this.snapshot()
    })
  }

  /** 供 tools 用的预览 URL。 */
  urlFor(deckId, page = 1, view = 'preview') {
    if (this.phase !== 'running' || !this.url) return null
    const suffix = view === 'editor' ? '' : '/preview'
    return `${this.url}/s/${encodeURIComponent(deckId)}${suffix}?p=${Math.max(1, Math.floor(page) || 1)}`
  }
}