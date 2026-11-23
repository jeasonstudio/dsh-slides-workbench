#!/usr/bin/env node
// 给 template/package.json 生成 lockfile（改了模板依赖后跑 `npm run lock`）：
//   package-lock.public.json  公网 registry.npmjs.org（安装时按 npmmirror → npmjs 依次用）
// 用空的 userconfig 生成，不受本机 .npmrc（镜像、min-release-age 等）影响。
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), '..', 'template')
const TARGETS = [
  { registry: 'https://registry.npmjs.org/', file: 'package-lock.public.json' },
]

for (const { registry, file } of TARGETS) {
  const dir = mkdtempSync(join(tmpdir(), 'sw-lock-'))
  try {
    copyFileSync(join(TEMPLATE, 'package.json'), join(dir, 'package.json'))
    writeFileSync(join(dir, 'empty.npmrc'), '')
    execFileSync('npm', [
      'install', '--package-lock-only', '--userconfig=empty.npmrc', `--registry=${registry}`,
      '--install-strategy=hoisted', '--no-audit', '--no-fund', '--loglevel=error',
    ], { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' })
    copyFileSync(join(dir, 'package-lock.json'), join(TEMPLATE, file))
    console.log(`✓ template/${file}（${registry}）`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
