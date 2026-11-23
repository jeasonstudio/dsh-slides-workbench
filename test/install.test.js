// 依赖安装：模板 lockfile 是否完整、npm 参数、「已安装」判断。不联网。
// 联网的端到端验证（恶意 .npmrc 下真装一遍）见 test/install.e2e.mjs。
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { templateDir } from '../src/env.js'
import { INSTALL_SOURCES, npmInstallArgs, templateLockKey, Workspace } from '../src/workspace.js'

const pkg = JSON.parse(readFileSync(join(templateDir(), 'package.json'), 'utf8'))
// 三个目标平台都要能用：macOS arm64 / x64、Windows x64
const NATIVE = ['@rolldown/binding-', 'lightningcss-', '@tailwindcss/oxide-']
const PLATFORMS = ['darwin-arm64', 'darwin-x64', 'win32-x64-msvc']

for (const { registry, lockfile } of INSTALL_SOURCES) {
  test(`${lockfile} 和 template/package.json 同步，覆盖三个平台的原生绑定`, () => {
    const lock = JSON.parse(readFileSync(join(templateDir(), lockfile), 'utf8'))
    const root = lock.packages['']
    assert.deepEqual(root.dependencies, pkg.dependencies, '改了模板依赖要跑 npm run lock')
    assert.deepEqual(root.devDependencies, pkg.devDependencies, '改了模板依赖要跑 npm run lock')
    for (const prefix of NATIVE) {
      for (const platform of PLATFORMS) {
        assert.ok(lock.packages[`node_modules/${prefix}${platform}`], `缺 ${prefix}${platform}`)
      }
    }
    const host = new URL(lock.packages['node_modules/@open-slide/core'].resolved).host
    if (lockfile === 'package-lock.json') assert.equal(host, new URL(registry).host)
    for (const [name, entry] of Object.entries(lock.packages)) {
      if (name && !entry.inBundle) assert.ok(entry.integrity, `${name} 缺 integrity`)
    }
  })
}

test('npm 参数覆盖会让安装出错的用户配置', () => {
  const args = npmInstallArgs('ci', 'https://registry.example/')
  assert.equal(args[0], 'ci')
  for (const flag of ['--registry=https://registry.example/', '--replace-registry-host=always', '--include=optional', '--install-strategy=hoisted', '--package-lock=true']) {
    assert.ok(args.includes(flag), flag)
  }
})

async function fakeInstalled({ marker, deps } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'slides-wb-install-'))
  const workspace = new Workspace(root)
  const custom = deps ? { ...pkg, dependencies: { ...pkg.dependencies, ...deps } } : pkg
  await writeFile(join(root, 'package.json'), JSON.stringify(custom, null, 2))
  await mkdir(workspace.coreDir, { recursive: true })
  await writeFile(workspace.binPath, '')
  if (marker) await writeFile(workspace.markerFile, JSON.stringify(marker))
  return workspace
}

test('只有 bin.js、没有安装标记（老版本装的 / 装了一半）不算装好', async () => {
  const workspace = await fakeInstalled()
  try {
    assert.equal(workspace.isManaged(), true)
    assert.equal(workspace.isInstalled(), false)
    assert.equal((await workspace.status()).installed, false)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('标记里的 lockfile 摘要过期要重装', async () => {
  const workspace = await fakeInstalled({ marker: { lock: 'stale' } })
  try {
    assert.equal(workspace.isInstalled(), false)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('用户自己加过依赖的工作区不按模板 lockfile 判断', async () => {
  const workspace = await fakeInstalled({ deps: { 'chart.js': '^4.0.0' }, marker: { lock: null } })
  try {
    assert.equal(workspace.isManaged(), false)
    assert.equal(workspace.isInstalled(), true)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})

test('按当前 lockfile 装好的标记算装好', async () => {
  const workspace = await fakeInstalled({ marker: { lock: templateLockKey() } })
  try {
    assert.equal(workspace.isInstalled(), true)
  } finally {
    await rm(workspace.root, { recursive: true, force: true })
  }
})
