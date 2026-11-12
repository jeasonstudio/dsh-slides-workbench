// 界面语言：中文默认，英文全量。key 是语义 key，{name} 是插值占位符。
// 语言优先级：用户手动切换（localStorage override）> DSH client locale > navigator.language。
import React from 'react'

const ZH = {
  'app.name': '演示文稿工作台',
  'home.eyebrow': '演示文稿工作台',
  'home.line1': '想做一份',
  'home.line2': '能讲的演示？',
  'home.title': '想做一份什么演示？',
  'home.placeholder': '一句话说清主题、受众和风格，剩下的交给 AI……',
  'home.hint': 'Enter 开始 · Shift+Enter 换行',
  'home.submit': '开始做',
  'home.browse': '浏览全部幻灯片',
  'home.recent': '最近的 {n} 份演示',
  'home.empty': '还没有演示，说一句话就开始了',
  'home.pages': '{n} 页',
  'home.untitled': '未命名演示',
  'home.failed': '没建成：{error}',
  'home.tpl.launch': '产品发布',
  'home.tpl.review': '季度复盘',
  'home.tpl.talk': '技术分享',
  'home.tpl.launchPrompt': '帮我做一个产品发布演示：主题是一款新的开发者工具，受众是现有用户，8 页，克制、留白多，带讲稿。',
  'home.tpl.reviewPrompt': '帮我做一个季度复盘演示：讲数据、结论和下一步，6 页，深色，带讲稿。',
  'home.tpl.talkPrompt': '帮我做一个技术分享演示：讲我们这次架构调整是怎么做的，10 页，带代码片段和讲稿。',
  'nav.slides': '幻灯片',
  'nav.themes': '主题',
  'nav.assets': '素材',
  'nav.slides.title': '幻灯片 · open-slide',
  'nav.themes.title': '主题 · open-slide',
  'nav.assets.title': '素材 · open-slide',
  'panel.label': '演示文稿',

  'common.close': '关闭',
  'common.cancel': '取消',
  'common.retry': '重试',
  'common.copied': '已复制',
  'common.copyFailed': '复制失败',
  'common.create': '创建',
  'common.creating': '创建中…',
  'common.refresh': '刷新',
  'common.delete': '删除',
  'common.loading': '处理中…',

  'lang.switch': '切换语言',
  'lang.toggle': 'English',

  'status.running': '服务器运行中',
  'status.starting': '服务器启动中',
  'status.stopped': '服务器未启动',
  'status.error': '服务器出错',

  'frame.title': '演示文稿工作台',
  'frame.loading': '正在打开 open-slide…',
  'frame.reload': '重新加载',
  'frame.home': '回到首页',
  'frame.openExternal': '在浏览器里打开',
  'boot.loading': '正在读取工作台…',
  'error.title': '连不上工作台',
  'error.lead': '确认 DSH 还在运行，然后再试一次。',
  'error.network': '网络请求失败，检查一下 DSH 是否还在运行。',
  'error.request': '请求失败（{status}）',

  'setup.title': '正在准备工作台',
  'setup.lead': '这是 open-slide 的演示文稿工作台。AI 写的每个 deck 和它依赖的东西，都存在本机这个目录里：',
  'setup.pathLabel': '工作区路径',
  'setup.pathUnknown': 'DSH 默认目录',
  'setup.deps': '插件装好就会自动准备这里：安装 @open-slide/core（几十 MB，取决于网络），之后打开面板直接可用。',
  'setup.action': '继续准备',
  'setup.running': '正在准备…',
  'setup.logTitle': '安装日志',
  'setup.failed': '准备失败：{error}',
  'setup.hint': '通常不需要你做什么：装好插件就会自动准备，重试只用于失败或中断之后。',

  'server.startingTitle': '正在启动预览服务器…',
  'server.errorTitle': '预览服务器没能启动',
  'server.stoppedTitle': '预览服务器处于停止状态',
  'server.startingLead': 'open-slide dev 正在启动，起来之后预览、演示和编辑器就都能用了。',
  'server.errorLead': '上一次启动失败：{error}',
  'server.stoppedLead': '启动 dev server 之后才能预览、演示和编辑 deck。',
  'server.unknownError': '未知错误',
  'server.logTitle': '服务器日志',
  'server.actionStart': '启动服务器',
  'server.actionRestart': '重新启动',
  'server.actionStop': '停止',
  'server.hint': 'dev server 只监听 localhost，仅本机可以访问。',

  'empty.title': '还没有演示文稿',
  'empty.lead': '直接对 AI 说一句话就能开始：它写好每一页，你在这里预览。',
  'empty.promptTitle': '试试这样对 AI 说',
  'empty.promptText': '帮我做一个关于「AI 编程助手」的演示文稿，8 页左右，面向产品团队，风格简洁。',
  'empty.copy': '复制提示词',
  'empty.create': '新建空白演示文稿',
  'empty.or': '或者',

  'deck.new': '新建演示文稿',
  'deck.newTitle': '新建演示文稿',
  'deck.titleField': '标题',
  'deck.titlePlaceholder': '比如：Q2 产品发布',
  'deck.newHint': '标题就是 deck 的名字，页面内容之后可以让 AI 改写。',
  'deck.count': '{n} 页',
  'deck.pagesUnknown': '没有页面',
  'deck.updated': '更新于 {time}',
  'deck.broken': '源码有问题：{error}',
  'deck.brokenShort': '源码有问题',
  'deck.preview': '预览',
  'deck.present': '演示',
  'deck.openWindow': '在新窗口打开',
  'deck.delete': '删除',
  'deck.deleteTitle': '删除「{title}」？',
  'deck.deleteBody': 'deck 目录会被移到工作区的 .trash 里，需要时还能手动找回。',
  'deck.deleteConfirm': '删除',
  'deck.deleted': '已删除「{title}」',
  'deck.created': '已创建「{title}」',
  'deck.more': '更多操作',
  'deck.listLabel': '演示文稿列表',
  'deck.untitled': '未命名',
  'deck.emptyHint': '在下面新建一个，或者让 AI 写一个。',

  'view.label': '视图',
  'view.preview': '预览',
  'view.editor': '编辑器',

  'nav.prev': '上一页',
  'nav.next': '下一页',
  'nav.pageLabel': '页码',
  'nav.jump': '跳到第 {n} 页',

  'stage.previewTitle': '{title} 第 {page} 页预览',
  'stage.editorTitle': '{title} 第 {page} 页编辑器',
  'stage.loading': '加载中…',
  'stage.filmLabel': '页面',
  'stage.noServer': '预览服务器还没准备好。',

  'build.export': '导出',
  'build.running': '导出中…',
  'build.ok': '已导出到 {path}',
  'build.okPlain': '导出完成',
  'build.failed': '导出失败：{error}',

  'present.title': '演示模式',
  'present.frameTitle': '第 {page} 页',
  'present.exit': '退出演示',
  'present.fullscreen': '全屏',
  'present.hint': '← → 翻页 · Esc 退出',
  'present.noServer': '预览服务器没有在运行。',

  'open.editor': '打开完整编辑器',

  'time.justNow': '刚刚',
  'time.minutes': '{n} 分钟前',
  'time.hours': '{n} 小时前',
  'time.days': '{n} 天前',
  'time.never': '从未',

  'log.empty': '暂时没有输出。',
}

const EN = {
  'app.name': 'Slides Workbench',
  'home.eyebrow': 'Slides workbench',
  'home.line1': 'What are you',
  'home.line2': 'presenting today?',
  'home.title': 'What are you presenting?',
  'home.placeholder': 'One sentence about the topic, audience and tone — the agent writes the pages.',
  'home.hint': 'Enter to start · Shift+Enter for a new line',
  'home.submit': 'Start',
  'home.browse': 'Browse all slides',
  'home.recent': '{n} recent decks',
  'home.empty': 'No decks yet — one sentence is enough to start',
  'home.pages': '{n} pages',
  'home.untitled': 'Untitled deck',
  'home.failed': 'Could not create: {error}',
  'home.tpl.launch': 'Product launch',
  'home.tpl.review': 'Quarterly review',
  'home.tpl.talk': 'Tech talk',
  'home.tpl.launchPrompt': 'Draft a product launch deck: a new developer tool, audience is existing users, 8 pages, restrained with lots of whitespace, speaker notes included.',
  'home.tpl.reviewPrompt': 'Draft a quarterly review deck: numbers, conclusions, next steps. 6 pages, dark, with speaker notes.',
  'home.tpl.talkPrompt': 'Draft a tech talk deck about our architecture migration: 10 pages, code snippets and speaker notes.',
  'nav.slides': 'Slides',
  'nav.themes': 'Themes',
  'nav.assets': 'Assets',
  'nav.slides.title': 'Slides · open-slide',
  'nav.themes.title': 'Themes · open-slide',
  'nav.assets.title': 'Assets · open-slide',
  'panel.label': 'Slides',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.retry': 'Retry',
  'common.copied': 'Copied',
  'common.copyFailed': 'Couldn’t copy',
  'common.create': 'Create',
  'common.creating': 'Creating…',
  'common.refresh': 'Refresh',
  'common.delete': 'Delete',
  'common.loading': 'Working…',

  'lang.switch': 'Switch language',
  'lang.toggle': '中文',

  'status.running': 'Server running',
  'status.starting': 'Server starting',
  'status.stopped': 'Server stopped',
  'status.error': 'Server error',

  'frame.title': 'Slides workbench',
  'frame.loading': 'Opening open-slide…',
  'frame.reload': 'Reload',
  'frame.home': 'Back to home',
  'frame.openExternal': 'Open in browser',
  'boot.loading': 'Reading the workbench…',
  'error.title': 'Couldn’t reach the workbench',
  'error.lead': 'Check that DSH is still running, then try again.',
  'error.network': 'The request failed. Check that DSH is still running.',
  'error.request': 'Request failed ({status})',

  'setup.title': 'Preparing the workbench',
  'setup.lead': 'This is an open-slide workbench. Every deck the AI writes lives in this folder on your machine, together with its dependencies:',
  'setup.pathLabel': 'Workspace',
  'setup.pathUnknown': 'Default DSH folder',
  'setup.deps': 'The plugin prepares this folder on install: it installs @open-slide/core (a few dozen MB, depending on your network) once, then the panel is ready.',
  'setup.action': 'Resume setup',
  'setup.running': 'Preparing…',
  'setup.logTitle': 'Install log',
  'setup.failed': 'Preparation failed: {error}',
  'setup.hint': 'Usually nothing to do here: the plugin prepares the workspace on install. Retry only after a failure or interruption.',

  'server.startingTitle': 'Starting the preview server…',
  'server.errorTitle': 'The preview server didn’t start',
  'server.stoppedTitle': 'The preview server is stopped',
  'server.startingLead': 'open-slide dev is booting. Previews, presentations, and the editor unlock as soon as it’s ready.',
  'server.errorLead': 'The last attempt failed: {error}',
  'server.stoppedLead': 'Start the dev server to preview, present, and edit decks.',
  'server.unknownError': 'unknown error',
  'server.logTitle': 'Server log',
  'server.actionStart': 'Start server',
  'server.actionRestart': 'Restart',
  'server.actionStop': 'Stop',
  'server.hint': 'The dev server only listens on localhost, so it stays private to this machine.',

  'empty.title': 'No decks yet',
  'empty.lead': 'Just ask the AI for one: it writes every page, and you preview it here.',
  'empty.promptTitle': 'Try saying',
  'empty.promptText': 'Make me a presentation about “AI coding assistants”, around 8 slides, for a product team, clean visual style.',
  'empty.copy': 'Copy prompt',
  'empty.create': 'New blank deck',
  'empty.or': 'or',

  'deck.new': 'New deck',
  'deck.newTitle': 'New deck',
  'deck.titleField': 'Title',
  'deck.titlePlaceholder': 'e.g. Q2 product launch',
  'deck.newHint': 'The title names the deck; the AI can rewrite every page later.',
  'deck.count': '{n} pages',
  'deck.pagesUnknown': 'No pages',
  'deck.updated': 'Updated {time}',
  'deck.broken': 'Source error: {error}',
  'deck.brokenShort': 'Source error',
  'deck.preview': 'Preview',
  'deck.present': 'Present',
  'deck.openWindow': 'Open in new window',
  'deck.delete': 'Delete',
  'deck.deleteTitle': 'Delete “{title}”?',
  'deck.deleteBody': 'The deck folder moves to .trash inside the workspace, so you can still recover it.',
  'deck.deleteConfirm': 'Delete',
  'deck.deleted': 'Deleted “{title}”',
  'deck.created': 'Created “{title}”',
  'deck.more': 'More actions',
  'deck.listLabel': 'Decks',
  'deck.untitled': 'Untitled',
  'deck.emptyHint': 'Create one below, or ask the AI to write one.',

  'view.label': 'View',
  'view.preview': 'Preview',
  'view.editor': 'Editor',

  'nav.prev': 'Previous page',
  'nav.next': 'Next page',
  'nav.pageLabel': 'Page number',
  'nav.jump': 'Go to page {n}',

  'stage.previewTitle': 'Preview of {title}, page {page}',
  'stage.editorTitle': 'Editor for {title}, page {page}',
  'stage.loading': 'Loading…',
  'stage.filmLabel': 'Pages',
  'stage.noServer': 'The preview server isn’t ready yet.',

  'build.export': 'Export',
  'build.running': 'Exporting…',
  'build.ok': 'Exported to {path}',
  'build.okPlain': 'Export finished',
  'build.failed': 'Export failed: {error}',

  'present.title': 'Presentation',
  'present.frameTitle': 'Slide {page}',
  'present.exit': 'Exit presentation',
  'present.fullscreen': 'Fullscreen',
  'present.hint': '← → to move · Esc to exit',
  'present.noServer': 'The preview server isn’t running.',

  'open.editor': 'Open full editor',

  'time.justNow': 'just now',
  'time.minutes': '{n} min ago',
  'time.hours': '{n} h ago',
  'time.days': '{n} d ago',
  'time.never': 'never',

  'log.empty': 'Nothing here yet.',
}

const DICTS = { zh: ZH, en: EN }
const listeners = new Set()

// 用户手动切过的语言单独存；没有它就一直跟随 DSH 的语言设置
const OVERRIDE_KEY = 'slides-workbench.lang.override'
const LEGACY_KEY = 'slides-workbench.lang'

function readStored(key) {
  try {
    const value = localStorage.getItem(key)
    if (value === 'zh' || value === 'en') return value
  } catch {
    // 隐私模式里 localStorage 可能不可用
  }
  return null
}

function normalize(value) {
  const tag = String(value ?? '').toLowerCase()
  // 'auto' / 'system' 这类未解析的值不算数，交给下一级兜底
  if (!tag || tag === 'auto' || tag === 'system') return null
  return tag.startsWith('zh') ? 'zh' : 'en'
}

/** 浏览器语言只是最后兜底：DSH 的 locale 和用户的手动选择都优先。 */
function detectBrowser() {
  if (typeof navigator === 'undefined') return 'zh'
  return normalize(navigator.language) ?? 'zh'
}

// 旧版本把语言写在 slides-workbench.lang 里，迁移成 override
let override = readStored(OVERRIDE_KEY) ?? readStored(LEGACY_KEY)
if (override && !readStored(OVERRIDE_KEY)) {
  try {
    localStorage.setItem(OVERRIDE_KEY, override)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // 迁移失败就继续用旧 key 读到的值
  }
}

// DSH 当前语言；apply 阶段由 client locale 服务注入
let host = null

// 模块初始化就定下初值：sidebar label thunk 在 apply 里就会被调用
let current = override ?? host ?? detectBrowser()

/** apply 阶段把 DSH 的语言接进来；拿不到有效值就不动。 */
export function setHostLang(active) {
  const next = normalize(active)
  if (!next || next === host) return
  host = next
  const before = current
  current = override ?? host ?? detectBrowser()
  if (current !== before) listeners.forEach((fn) => fn())
}

/** 当前生效的语言：'zh' 或 'en'。 */
export function lang() {
  return current
}

/** 用户手动切语言：写进 override，之后不再跟随 DSH。 */
export function setLang(next) {
  if (next !== 'zh' && next !== 'en') return
  const before = current
  override = next
  try {
    localStorage.setItem(OVERRIDE_KEY, next)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // 存不了就只在这次会话里生效
  }
  current = override
  if (current !== before) listeners.forEach((fn) => fn())
}

export function toggleLang() {
  setLang(current === 'zh' ? 'en' : 'zh')
}

export function subscribeLang(fn) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** 语言变化时重新渲染组件。 */
export function useLang() {
  return React.useSyncExternalStore(subscribeLang, lang)
}

/**
 * 翻译一条界面文字。key 是语义 key，{name} 是占位符。
 * @param {string} key
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
export function t(key, vars) {
  const dict = DICTS[current] ?? ZH
  let text = dict[key]
  if (text === undefined) text = ZH[key]
  if (text === undefined) text = key
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
}

/** 相对时间：刚刚 / n 分钟前 / n 小时前 / n 天前 / 具体日期。 */
export function formatWhen(timestamp) {
  if (!timestamp) return t('time.never')
  const diff = Date.now() - Number(timestamp)
  if (!Number.isFinite(diff) || diff < 0) return t('time.justNow')
  if (diff < 60_000) return t('time.justNow')
  if (diff < 3_600_000) return t('time.minutes', { n: Math.round(diff / 60_000) })
  if (diff < 86_400_000) return t('time.hours', { n: Math.round(diff / 3_600_000) })
  if (diff < 7 * 86_400_000) return t('time.days', { n: Math.round(diff / 86_400_000) })
  try {
    return new Date(Number(timestamp)).toLocaleDateString(current === 'zh' ? 'zh-CN' : 'en', { month: 'short', day: 'numeric' })
  } catch {
    return new Date(Number(timestamp)).toISOString().slice(0, 10)
  }
}