// 外观同步的单元测试：语言映射、主题写入、locale 存储。
import assert from 'node:assert/strict'
import test from 'node:test'
import { appLocaleId, applyLocale, applyTheme } from '../client/appearance.js'

/** 最小 document 替身。 */
function fakeDoc() {
  const classes = new Set()
  return {
    documentElement: {
      classList: {
        toggle(name, on) {
          if (on) classes.add(name)
          else classes.delete(name)
        },
      },
      style: {},
      _classes: classes,
    },
  }
}

test('语言映射：zh → zh-CN，其它 → en', () => {
  assert.equal(appLocaleId('zh'), 'zh-CN')
  assert.equal(appLocaleId('en'), 'en')
  assert.equal(appLocaleId(undefined), 'en')
})

test('暗色写 html.dark 和 color-scheme，亮色再撤掉', () => {
  const doc = fakeDoc()
  applyTheme(doc, true)
  assert.equal(doc.documentElement._classes.has('dark'), true)
  assert.equal(doc.documentElement.style.colorScheme, 'dark')
  applyTheme(doc, false)
  assert.equal(doc.documentElement._classes.has('dark'), false)
  assert.equal(doc.documentElement.style.colorScheme, 'light')
})

test('没有 document 时安静跳过（加载中/跨源）', () => {
  applyTheme(null, true)
  applyTheme(undefined, false)
})

test('locale 只在变化时写存储，并告诉调用方要不要重载', () => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
  }
  try {
    assert.equal(applyLocale('zh-CN'), true)
    assert.equal(store.get('open-slide:locale'), 'zh-CN')
    assert.equal(applyLocale('zh-CN'), false, '已经是这个语言就不用重载')
    assert.equal(applyLocale('en'), true)
  } finally {
    delete globalThis.localStorage
  }
})

test('localStorage 不可用时返回 false，不抛异常', () => {
  assert.equal(applyLocale('en'), false)
})