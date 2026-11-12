// deck 缩略图：用本机 Chrome 的 headless 模式真截一张，缓存到工作区里。
// 面板只 <img> 加载这张 PNG，不再挂 preview iframe（每次开面板都起一遍应用会非常卡）。
import { spawn } from 'node:child_process'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, readdir, rename, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'

const SHOT_TIMEOUT_MS = 25_000
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

export class Thumbs {
  /**
   * @param {{workspace: object, dev: object, decks: object}} deps - 工作区、dev server、deck 操作。
   */
  constructor({ workspace, dev, decks }) {
    this.workspace = workspace
    this.dev = dev
    this.decks = decks
    this.dir = join(workspace.root, '.thumbnails')
    this.pending = new Set()
    this.chain = Promise.resolve()
  }

  /** 本机有没有能无头截图的浏览器。 */
  get browser() {
    return CHROME_CANDIDATES.find(path => existsSync(path)) ?? null
  }

  /** 缓存文件名带上 index.tsx 的 mtime，改了页面自然会重新截。 */
  async fileFor(id) {
    const info = await stat(this.decks.deckFile(id))
    return join(this.dir, `${id}-${Math.round(info.mtimeMs)}.png`)
  }

  /**
   * 拿这张缩略图：有缓存直接给，没有就排队去截。
   * @param {string} id - deck id。
   * @returns {Promise<string|null>} PNG 路径，或 null（还没好 / 没法截）。
   */
  async ensure(id) {
    if (this.dev.phase !== 'running' || !this.dev.port || !this.browser) return null
    let file
    try {
      file = await this.fileFor(id)
    } catch {
      return null
    }
    if (existsSync(file)) return file
    this.enqueue(id)
    return null
  }

  /** 串行排队：一次只截一张，别把机器打满。 */
  enqueue(id) {
    if (this.pending.has(id)) return
    this.pending.add(id)
    this.chain = this.chain
      .then(() => this.shoot(id))
      .catch(() => {})
      .finally(() => this.pending.delete(id))
  }

  async shoot(id) {
    const browser = this.browser
    if (!browser || this.dev.phase !== 'running' || !this.dev.port) return
    let file
    try {
      file = await this.fileFor(id)
    } catch {
      return
    }
    if (existsSync(file)) return
    await mkdir(this.dir, { recursive: true })
    const temp = `${file}.${process.pid}.tmp.png`
    // dev server 只监听 IPv6 环回，Chrome 解析 localhost 会先走 127.0.0.1 被拒，所以显式写 [::1]
    const url = `http://[::1]:${this.dev.port}/slides-workbench/app/s/${encodeURIComponent(id)}/preview?p=1`
    const profile = join(this.dir, '.chrome-profile')
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--user-data-dir=' + profile,
      '--window-size=1280,720',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=8000',
      `--screenshot=${temp}`,
      url,
    ]
    const ok = await new Promise((resolve) => {
      let settled = false
      const child = spawn(browser, args, { stdio: 'ignore' })
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        try {
          child.kill('SIGKILL')
        } catch {
          // 已经退出
        }
        resolve(false)
      }, SHOT_TIMEOUT_MS)
      timer.unref?.()
      child.on('error', () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(false)
      })
      child.on('exit', () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(existsSync(temp))
      })
    })
    if (!ok) {
      await unlink(temp).catch(() => {})
      return
    }
    await rename(temp, file).catch(() => {})
    await this.prune(id, file)
  }

  /** 同一个 deck 只留最新一张。 */
  async prune(id, keep) {
    const entries = await readdir(this.dir).catch(() => [])
    for (const name of entries) {
      if (!name.startsWith(`${id}-`) || !name.endsWith('.png')) continue
      if (join(this.dir, name) === keep) continue
      await unlink(join(this.dir, name)).catch(() => {})
    }
  }

  /**
   * GET /slides-workbench/thumb?id=…：命中就回 PNG，没有就 404（前端用占位封面兜着，
   * 后台截好了下次轮询自然会换）。
   * @param {import('node:http').IncomingMessage} req - 请求。
   * @param {import('node:http').ServerResponse} res - 响应。
   * @returns {Promise<boolean>} 是否已经处理。
   */
  async handle(req, res) {
    const url = new URL(req.url || '/', 'http://local')
    const id = url.searchParams.get('id') ?? ''
    if (!this.decks.isValidId(id)) {
      res.statusCode = 400
      res.end('bad id')
      return true
    }
    const file = await this.ensure(id)
    if (!file) {
      res.statusCode = 404
      res.setHeader('cache-control', 'no-store')
      res.end('not ready')
      return true
    }
    const info = await stat(file).catch(() => null)
    if (!info) {
      res.statusCode = 404
      res.end('not ready')
      return true
    }
    res.statusCode = 200
    res.setHeader('content-type', 'image/png')
    res.setHeader('content-length', String(info.size))
    res.setHeader('cache-control', 'private, max-age=604800')
    createReadStream(file).pipe(res)
    return true
  }
}