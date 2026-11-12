// 路径、包管理器与环境解析。插件只依赖 Node 内置模块。
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

/** 插件包根目录。 */
export function packageRoot() {
  return dirname(HERE)
}

/** 模板目录（初始化工作区时复制）。 */
export function templateDir() {
  return join(packageRoot(), 'template')
}

/** Skill 正文目录。 */
export function skillsDir() {
  return join(packageRoot(), 'skills')
}

/** $DSH_HOME，和 Harness 其它插件保持同一个约定。 */
export function dshHome(env = process.env) {
  return env.DSH_HOME || join(homedir(), '.dsh')
}

/**
 * 工作区根目录：配置项 workspace 优先，否则 $DSH_HOME/slides-workbench。
 * 支持 ~ 开头和相对路径（相对进程 cwd）。
 * @param {{workspace?: string}} config - 插件行配置。
 * @param {Record<string, string|undefined>} env - 环境变量。
 * @returns {string} 绝对路径。
 */
export function resolveWorkspaceRoot(config = {}, env = process.env) {
  const configured = typeof config?.workspace === 'string' ? config.workspace.trim() : ''
  if (!configured) return join(dshHome(env), 'slides-workbench')
  if (configured === '~') return homedir()
  if (configured.startsWith('~/')) return resolve(homedir(), configured.slice(2))
  return resolve(configured)
}

/**
 * 找可用的 npm：优先 node 旁边的，其次 PATH 里的。
 * @param {Record<string, string|undefined>} env - 环境变量。
 * @returns {{command: string, prefixArgs: string[]}} 可直接 spawn 的命令。
 */
export function resolveNpm(env = process.env) {
  const exe = process.execPath
  const dir = dirname(exe)
  const cliCandidates = [
    join(dir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(dir, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(dir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ]
  for (const cli of cliCandidates) {
    if (existsSync(cli)) return { command: exe, prefixArgs: [cli] }
  }
  const binCandidates = [join(dir, 'npm'), join(dir, 'npm.cmd')]
  for (const bin of binCandidates) {
    if (existsSync(bin)) return { command: bin, prefixArgs: [] }
  }
  const pathDirs = String(env.PATH ?? '').split(process.platform === 'win32' ? ';' : ':').filter(Boolean)
  for (const entry of pathDirs) {
    for (const name of process.platform === 'win32' ? ['npm.cmd', 'npm.exe'] : ['npm']) {
      const candidate = join(entry, name)
      if (existsSync(candidate)) return { command: candidate, prefixArgs: [] }
    }
  }
  return { command: 'npm', prefixArgs: [] }
}

/**
 * 把子进程输出切成整行，回调里拿到干净的行。
 * @param {import('node:stream').Readable|undefined} stream - 子进程输出流。
 * @param {(line: string) => void} onLine - 每行回调。
 * @returns {void}
 */
export function pipeLines(stream, onLine) {
  if (!stream) return
  let rest = ''
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    rest += chunk
    const lines = rest.split('\n')
    rest = lines.pop() ?? ''
    for (const line of lines) onLine(stripAnsi(line).replace(/\s+$/, ''))
  })
  stream.on('end', () => {
    if (rest) onLine(stripAnsi(rest).replace(/\s+$/, ''))
    rest = ''
  })
}

/** 去掉终端颜色控制符，日志才能在面板里显示。 */
export function stripAnsi(text) {
  return String(text ?? '').replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
}

/** 目录/文件是否存在。 */
export function exists(path) {
  try {
    return existsSync(path)
  } catch {
    return false
  }
}