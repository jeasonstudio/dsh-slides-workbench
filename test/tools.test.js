// 新加的三个工具：slides_context 附 current.json 原文；slides_themes / slides_write_theme 读写 themes/。
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { registerTools } from '../src/tools.js'

/** 只做收集的假 tools 服务；call 与 DSH 一样，抛错算失败。 */
function setup() {
  const root = mkdtempSync(join(tmpdir(), 'sw-tk-'))
  const defs = new Map()
  registerTools({ get: name => (name === 'tools' ? { register: def => defs.set(def.name, def) } : undefined) }, {
    workspace: { root, slidesDir: join(root, 'slides'), themesDir: join(root, 'themes') },
    decks: {},
    dev: {},
  })
  const call = async (name, args) => {
    try {
      return { text: await defs.get(name).execute(args), isError: false }
    } catch (err) {
      return { text: err.message, isError: true }
    }
  }
  return { root, call }
}

test('slides_context 附上 current.json 原文', async () => {
  const { root, call } = setup()
  mkdirSync(join(root, 'node_modules/.open-slide'), { recursive: true })
  writeFileSync(join(root, 'node_modules/.open-slide/current.json'), JSON.stringify({ slideId: 'demo', pageIndex: 1, pageNumber: 2, totalPages: 5, selection: null }))
  const { text, isError } = await call('slides_context', {})
  assert.equal(isError, false)
  assert.match(text, /当前 deck：demo/)
  assert.match(text, /current\.json 原文：\n\{"slideId":"demo","pageIndex":1/)
})

test('slides_write_theme 校验后写两个文件，slides_themes 能列出和读取', async () => {
  const { root, call } = setup()
  assert.match((await call('slides_themes', {})).text, /还没有主题/)
  const md = '---\nname: Quiet Ink\ndescription: 墨色留白\nmode: light\n---\n\n# Quiet Ink\n'
  const demo = 'export default [() => <div />]\n'
  assert.equal((await call('slides_write_theme', { id: 'Bad Id', markdown: md, demo })).isError, true)
  assert.equal((await call('slides_write_theme', { id: 'quiet-ink', markdown: '# no front', demo })).isError, true)
  assert.equal((await call('slides_write_theme', { id: 'quiet-ink', markdown: md, demo: 'const x = 1' })).isError, true)
  const ok = await call('slides_write_theme', { id: 'quiet-ink', markdown: md, demo })
  assert.equal(ok.isError, false)
  assert.equal(readFileSync(join(root, 'themes/quiet-ink.md'), 'utf8'), md)
  assert.equal(readFileSync(join(root, 'themes/quiet-ink.demo.tsx'), 'utf8'), demo)
  assert.match((await call('slides_themes', {})).text, /quiet-ink：Quiet Ink —— 墨色留白/)
  const one = await call('slides_themes', { id: 'quiet-ink' })
  assert.match(one.text, /# Quiet Ink/)
  assert.match(one.text, /export default/)
})
