// 顶层页左上角的「返回」：哪些页补、挂在哪、点了回首页；open-slide 自己有返回的页面不补。
import assert from 'node:assert/strict'
import test from 'node:test'
import { appPath, needsBack } from '../client/embed.js'

test('appPath 去掉 DSH 反代的挂载点', () => {
  assert.equal(appPath({ location: { pathname: '/slides-workbench/app/' } }), '/')
  assert.equal(appPath({ location: { pathname: '/slides-workbench/app/themes' } }), '/themes')
  assert.equal(appPath({ location: { pathname: '/slides-workbench/app/s/q2/' } }), '/s/q2/')
  assert.equal(appPath({ location: { pathname: '/themes/aero' } }), '/themes/aero')
})

test('needsBack：顶层页补返回，编辑器和模板详情不补', () => {
  for (const path of ['/', '/themes', '/themes/', '/assets', '/folders/draft']) assert.equal(needsBack(path), true, path)
  for (const path of ['/s/q2', '/s/q2/', '/s/q2/preview', '/themes/aero', '/themes/aero/']) assert.equal(needsBack(path), false, path)
})
