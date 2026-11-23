// open-slide 工作区：模板初始化、依赖安装、静态构建。
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { exists, nodeRuntime, pipeLines, resolveNpm, templateDir } from './env.js'

const LOG_LIMIT = 240
const INSTALL_TIMEOUT_MS = 12 * 60_000
const VERIFY_TIMEOUT_MS = 60_000
const BUILD_TIMEOUT_MS = 5 * 60_000

const TEMPLATE_FILES = ['package.json', 'tsconfig.json', 'open-slide.config.ts', 'AGENTS.md', '.gitignore', 'README.md']
const TEMPLATE_DIRS = ['slides', 'themes', 'assets']

// 依次尝试的安装源。lockfile 锁死版本与 integrity，不做版本解析，用户 .npmrc 里的
// 镜像 / min-release-age / before 都影响不到（scripts/lock-template.mjs 生成）。
export const INSTALL_SOURCES = [
  { registry: 'https://registry.npmmirror.com/', lockfile: 'package-lock.public.json' },
  { registry: 'https://registry.npmjs.org/', lockfile: 'package-lock.public.json' },
]

// 装好并验证过之后写在 node_modules 里；内容对不上（依赖或 lockfile 变了、旧版装的）就当没装
const INSTALL_MARKER = '.slides-workbench-install.json'

// 装完实际加载一遍：原生绑定缺了（用户配了 omit=optional 之类）npm 也会报成功
const VERIFY_SCRIPT = "await Promise.all(['rolldown', 'lightningcss', '@tailwindcss/oxide'].map(m => import(m)))"

/**
 * npm 参数：显式覆盖用户 .npmrc 里会让安装出错的配置。
 * @param {'ci'|'install'} command - ci 严格按 lockfile；install 用于用户改过依赖的工作区。
 * @param {string} registry - 源。
 * @returns {string[]} 参数。
 */
export function npmInstallArgs(command, registry) {
  return [
    command,
    `--registry=${registry}`,
    '--replace-registry-host=always', // lockfile 里的 resolved 地址也换成当前源
    '--include=optional', // 原生绑定都是 optionalDependencies
    '--include=dev',
    '--install-strategy=hoisted',
    '--package-lock=true',
    '--no-audit',
    '--no-fund',
    '--loglevel=error',
  ]
}

/** package.json 里决定安装结果的部分。 */
function depsOf(pkg) {
  return JSON.stringify({ dependencies: pkg?.dependencies ?? {}, devDependencies: pkg?.devDependencies ?? {} })
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

let templateLockHash = null
/** 模板 lockfile 的摘要（模板运行期不变，算一次）。 */
export function templateLockKey() {
  if (templateLockHash === null) {
    const hash = createHash('sha256')
    for (const { lockfile } of INSTALL_SOURCES) hash.update(readFileSync(join(templateDir(), lockfile)))
    templateLockHash = hash.digest('hex').slice(0, 16)
  }
  return templateLockHash
}

/** 把一段命令输出压成环形日志，面板只读最后几十行。 */
function pushLog(log, line) {
  if (!line) return
  log.push(line)
  if (log.length > LOG_LIMIT) log.splice(0, log.length - LOG_LIMIT)
}

/**
 * 跑一个命令，收 stdout/stderr，带超时。
 * @param {{command: string, args: string[], cwd: string, env?: Record<string, string>}} spec - 命令。
 * @param {(line: string) => void} onLine - 行回调。
 * @param {number} timeoutMs - 超时毫秒。
 * @returns {Promise<{ok: boolean, code: number|null, error: string|null}>} 结果。
 */
function run(spec, onLine, timeoutMs) {
  return new Promise((resolvePromise) => {
    // Windows 上 .cmd 不能直接 spawn（Node 20.12+ 报 EINVAL），要走 shell；路径可能带空格
    const viaShell = process.platform === 'win32' && /\.(cmd|bat)$/i.test(spec.command)
    const child = spawn(viaShell ? `"${spec.command}"` : spec.command, spec.args, {
      cwd: spec.cwd,
      shell: viaShell,
      env: { ...process.env, ...spec.env, NO_COLOR: '1', FORCE_COLOR: '0', CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolvePromise(result)
    }
    const timer = setTimeout(() => {
      onLine(`超时（${Math.round(timeoutMs / 1000)}s），已结束进程`)
      child.kill('SIGTERM')
      finish({ ok: false, code: null, error: '命令超时' })
    }, timeoutMs)
    timer.unref?.()
    pipeLines(child.stdout, onLine)
    pipeLines(child.stderr, onLine)
    child.on('error', (err) => finish({ ok: false, code: null, error: err.message }))
    child.on('close', (code) => finish({ ok: code === 0, code, error: code === 0 ? null : `退出码 ${code}` }))
  })
}

export class Workspace {
  /** @param {string} root - 工作区绝对路径。 */
  constructor(root) {
    this.root = root
    /** @type {{status: 'idle'|'running'|'done'|'error', log: string[], error: string|null}} */
    this.installState = { status: 'idle', log: [], error: null }
    this.installing = null
    this.building = null
  }

  get slidesDir() {
    return join(this.root, 'slides')
  }

  get themesDir() {
    return join(this.root, 'themes')
  }

  get assetsDir() {
    return join(this.root, 'assets')
  }

  get distDir() {
    return join(this.root, 'dist')
  }

  get coreDir() {
    return join(this.root, 'node_modules', '@open-slide', 'core')
  }

  /** open-slide CLI 入口（core 包自带 bin.js）。 */
  get binPath() {
    return join(this.coreDir, 'bin.js')
  }

  path(...parts) {
    return join(this.root, ...parts)
  }

  get configFile() {
    return this.path('open-slide.config.ts')
  }

  get markerFile() {
    return this.path('node_modules', INSTALL_MARKER)
  }

  /** 工作区依赖和模板一致：用模板 lockfile 走 npm ci；不一致说明用户自己加过依赖。 */
  isManaged() {
    return depsOf(readJson(this.path('package.json'))) === depsOf(readJson(join(templateDir(), 'package.json')))
  }

  /** 依赖装好且验证过；受管工作区还要求是按当前模板 lockfile 装的（老版本装的会重装一次）。 */
  isInstalled() {
    if (!exists(this.binPath)) return false
    const marker = readJson(this.markerFile)
    if (!marker) return false
    return !this.isManaged() || marker.lock === templateLockKey()
  }

  /**
   * 确保 open-slide.config.ts 带上面板需要的东西（尤其 base）。
   * 这个文件归工作台管：用户手改过也会被模板内容覆盖，README 里写明了。
   * @returns {Promise<boolean>} 是否（重新）写过。
   */
  async ensureConfig() {
    const wanted = await readFile(join(templateDir(), 'open-slide.config.ts'), 'utf8').catch(() => '')
    if (!wanted) return false
    const current = await readFile(this.configFile, 'utf8').catch(() => null)
    if (current === wanted) return false
    await writeFile(this.configFile, wanted, 'utf8')
    return true
  }

  /**
   * 老版本工作台写的 AGENTS.md 让模型用 slides_* 工具，这些工具已经换成 agent preset 里的技能 + 文件工具。
   * 只替换带 `slides_` 的旧版，用户自己写的 AGENTS.md 不动。
   * @returns {Promise<boolean>} 是否替换过。
   */
  async ensureAgents() {
    const current = await readFile(this.path('AGENTS.md'), 'utf8').catch(() => null)
    if (current === null || !current.includes('`slides_')) return false
    const wanted = await readFile(join(templateDir(), 'AGENTS.md'), 'utf8').catch(() => '')
    if (!wanted) return false
    await writeFile(this.path('AGENTS.md'), wanted, 'utf8')
    return true
  }

  /**
   * 工作区现状：是否初始化、依赖是否装好、open-slide 版本、安装进度。
   * @returns {Promise<{path: string, scaffolded: boolean, installed: boolean, version: string|null, install: {status: string, log: string[], error: string|null}}>}
   */
  async status() {
    const scaffolded = exists(this.path('package.json'))
    const installed = this.isInstalled()
    let version = null
    if (installed) {
      try {
        version = JSON.parse(await readFile(join(this.coreDir, 'package.json'), 'utf8')).version ?? null
      } catch {
        version = null
      }
    }
    return {
      path: this.root,
      scaffolded,
      installed,
      version,
      install: { status: this.installState.status, log: this.installState.log.slice(-40), error: this.installState.error },
    }
  }

  /**
   * 写模板文件（幂等，不覆盖用户改过的文件）并建好目录。
   * @returns {Promise<{created: string[]}>} 新建了哪些。
   */
  async scaffold() {
    const created = []
    await mkdir(this.root, { recursive: true })
    for (const name of TEMPLATE_DIRS) {
      const dir = this.path(name)
      if (!exists(dir)) {
        await mkdir(dir, { recursive: true })
        created.push(`${name}/`)
      }
    }
    const source = templateDir()
    for (const name of TEMPLATE_FILES) {
      const target = this.path(name)
      if (exists(target)) continue
      const from = join(source, name)
      if (!exists(from)) continue
      await copyFile(from, target)
      created.push(name)
    }
    // 老工作区的配置可能缺 base：统一刷新一次（这个文件由工作台维护）
    if (await this.ensureConfig()) created.push('open-slide.config.ts（已更新）')
    if (await this.ensureAgents()) created.push('AGENTS.md（已更新）')
    return { created }
  }

  /**
   * 后台装依赖（npm ci，按 INSTALL_SOURCES 依次回退）。重复调用复用同一个任务。
   * @param {(line: string) => void} [onLine] - 额外日志回调。
   * @returns {Promise<{ok: boolean, error: string|null}>} 结果。
   */
  installDeps(onLine = () => {}) {
    if (this.installState.status === 'running' && this.installing) return this.installing
    this.installState = { status: 'running', log: [], error: null }
    const note = (line) => {
      pushLog(this.installState.log, line)
      onLine(line)
    }
    this.installing = this.runInstall(note).catch(err => err?.message ?? String(err)).then(async (error) => {
      this.installState.status = error ? 'error' : 'done'
      this.installState.error = error
      note(error ? `安装失败：${error}` : '依赖装好了。')
      this.installing = null
      if (!error) await this.syncSkills(note).catch(() => {})
      return { ok: !error, error }
    })
    return this.installing
  }

  /**
   * 逐个源尝试安装并验证，成功就写标记。
   * @param {(line: string) => void} note - 日志。
   * @returns {Promise<string|null>} 最后一次的错误；null 表示成功。
   */
  async runInstall(note) {
    const npm = resolveNpm()
    const managed = this.isManaged()
    note(`在 ${this.root} 安装 open-slide 依赖${managed ? '' : '（package.json 改过，按工作区自己的依赖装）'}…`)
    let error = '安装失败'
    for (const source of INSTALL_SOURCES) {
      note(`→ ${source.registry}`)
      if (managed) await copyFile(join(templateDir(), source.lockfile), this.path('package-lock.json'))
      const result = await run(
        { command: npm.command, args: [...npm.prefixArgs, ...npmInstallArgs(managed ? 'ci' : 'install', source.registry)], cwd: this.root },
        note,
        INSTALL_TIMEOUT_MS,
      )
      if (!result.ok) {
        error = result.error ?? '安装失败'
        continue
      }
      error = await this.verifyRuntime(note)
      if (error) continue
      const marker = { lock: managed ? templateLockKey() : null, registry: source.registry, at: new Date().toISOString() }
      await writeFile(this.markerFile, `${JSON.stringify(marker)}\n`, 'utf8')
      return null
    }
    return error
  }

  /**
   * 实际加载一遍 open-slide 依赖的原生绑定（rolldown / lightningcss / tailwind oxide）。
   * @param {(line: string) => void} note - 日志。
   * @returns {Promise<string|null>} 错误；null 表示通过。
   */
  async verifyRuntime(note) {
    if (!exists(this.binPath)) return '依赖装完了但找不到 @open-slide/core'
    const runtime = nodeRuntime()
    const result = await run(
      { command: runtime.command, args: ['--input-type=module', '-e', VERIFY_SCRIPT], cwd: this.root, env: runtime.env },
      note,
      VERIFY_TIMEOUT_MS,
    )
    return result.ok ? null : `依赖装完但加载失败（${result.error}），可能缺了本平台的原生绑定`
  }

  /**
   * 把 core 自带的 agent skills 同步到工作区 .agents/skills（等价 open-slide sync:skills）。
   * 失败不影响主流程：DSH 里用的是插件自己注册的 skill。
   * @param {(line: string) => void} note - 日志。
   * @returns {Promise<void>} 完成。
   */
  async syncSkills(note) {
    const source = join(this.coreDir, 'skills')
    if (!exists(source)) return
    const target = this.path('.agents', 'skills')
    await mkdir(target, { recursive: true })
    const entries = await readdir(source, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      await copyTree(join(source, entry.name), join(target, entry.name))
    }
    // Claude Code 习惯从 .claude/skills 读，和官方 init 保持一致
    const linkRoot = this.path('.claude', 'skills')
    await mkdir(linkRoot, { recursive: true }).catch(() => {})
    note(`已同步 ${entries.filter(row => row.isDirectory()).length} 个 agent skill 到 .agents/skills`)
  }

  /**
   * 契约里的 `install(onLog)` 别名：后台装依赖。
   * @param {(line: string) => void} [onLine] - 额外日志回调。
   * @returns {Promise<{ok: boolean, error: string|null}>} 结果。
   */
  install(onLine = () => {}) {
    return this.installDeps(onLine)
  }

  /**
   * 依赖没装就装，装好就返回现状。
   * @returns {Promise<{status: string, log: string[], error: string|null}>} 安装状态。
   */
  async ensureInstalled() {
    if (this.isInstalled()) return { status: 'done', log: this.installState.log.slice(-40), error: null }
    const result = await this.installDeps()
    return { status: this.installState.status, log: this.installState.log.slice(-40), error: result.error ?? this.installState.error }
  }

  /**
   * 构建静态站（open-slide build）。
   * @returns {Promise<{ok: boolean, outDir: string, log: string[], error: string|null}>} 结果。
   */
  build() {
    if (this.building) return this.building
    if (!exists(this.binPath)) {
      return Promise.resolve({ ok: false, outDir: this.distDir, log: ['依赖还没装好'], error: '依赖还没装好' })
    }
    const log = []
    this.building = (async () => {
      // 导出产物要能独立部署在域名根路径：构建期间把 base 换回 '/'，结束再恢复
      const original = await readFile(this.configFile, 'utf8').catch(() => null)
      if (original !== null) {
        const rootBased = original.replace(/base:\s*['"][^'"]*['"]/, "base: '/'")
        if (rootBased !== original) await writeFile(this.configFile, rootBased, 'utf8').catch(() => {})
      }
      try {
        const result = await run(
          { command: nodeRuntime().command, args: [this.binPath, 'build'], cwd: this.root, env: nodeRuntime().env },
          (line) => pushLog(log, line),
          BUILD_TIMEOUT_MS,
        )
        return { ok: result.ok, outDir: this.distDir, log: log.slice(-40), error: result.error }
      } finally {
        if (original !== null) await writeFile(this.configFile, original, 'utf8').catch(() => {})
      }
    })().finally(() => {
      this.building = null
    })
    return this.building
  }

  /**
   * 工作区里有没有内容可以展示（至少一个 deck 或任意文件），供初始化判断。
   * @returns {Promise<boolean>} 是否已有内容。
   */
  async isEmpty() {
    if (!exists(this.slidesDir)) return true
    const entries = await readdir(this.slidesDir, { withFileTypes: true }).catch(() => [])
    return !entries.some(entry => entry.isDirectory() && !entry.name.startsWith('.'))
  }

  /** 最近一次写入时间，给面板排序用。 */
  async touchedAt(file) {
    try {
      return (await stat(file)).mtimeMs
    } catch {
      return 0
    }
  }

  /** 目录名（调试日志用）。 */
  get label() {
    return basename(this.root)
  }
}

/** 递归复制目录（模板很小，不值得引依赖）。 */
async function copyTree(from, to) {
  await mkdir(to, { recursive: true })
  const entries = await readdir(from, { withFileTypes: true })
  for (const entry of entries) {
    const source = join(from, entry.name)
    const target = join(to, entry.name)
    if (entry.isDirectory()) await copyTree(source, target)
    else if (entry.isFile()) await copyFile(source, target)
  }
}

export { run as runCommand }