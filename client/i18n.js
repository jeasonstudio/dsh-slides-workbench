// 界面语言：中文默认，英文全量。key 是语义 key，{name} 是插值占位符。
// 语言跟随 DSH 客户端的 locale 服务（见 index.jsx），拿不到时用 navigator.language 兜底。
import React from 'react'

const ZH = {
  'app.name': '演示文稿工作台',
  'home.date': '{m} 月 {d} 日 · {w}',
  'home.week.0': '周日', 'home.week.1': '周一', 'home.week.2': '周二', 'home.week.3': '周三', 'home.week.4': '周四', 'home.week.5': '周五', 'home.week.6': '周六',
  'home.hint': '点击墙上的卡片试试',
  'home.hintMods': '风格要求会接在这句话后面一起发出去；退格可以删掉最后一个。',
  'home.mods': '已叠加的风格要求',
  'home.modRemove': '去掉「{label}」',
  'home.card.use': '用这句',
  'home.card.add': '叠加',
  'home.kind.prompt': '想法',
  'home.kind.quote': '演讲心法',
  'home.kind.palette': '配色',
  'home.filter.all': '全部',
  'home.filter.cover': '封面',
  'home.filter.prompt': '想法',
  'home.filter.quote': '心法',
  'home.filter.palette': '配色',
  'home.lucky': '手气不错',
  'home.mine': '我的演示 · {n}',
  'home.mineEmpty': '我的演示',
  'home.themes': '模板',
  'home.themeMod': '使用主题 themes/{id}（{name}）',
  'frame.useTheme': '用这个模板',
  'home.dock': '灵感墙',
  'home.zoomIn': '放大',
  'home.zoomOut': '缩小',
  'home.recenter': '回到中心',
  'home.placeholder': '一句话说清主题、受众和风格，剩下的交给 AI……',
  'home.submit': '开始做',
  'home.untitled': '未命名演示',
  'home.failed': '没建成：{error}',
  'nav.slides': '幻灯片',
  'nav.themes': '主题',
  'nav.assets': '素材',
  'nav.slides.title': '幻灯片 · open-slide',
  'nav.themes.title': '主题 · open-slide',
  'nav.assets.title': '素材 · open-slide',
  'panel.label': '演示文稿',
  'frame.exportFailed': '导出没能保存：{error}',
  'frame.shareFailed': '没能生成只读预览链接：{error}',
  'home.handoffFailed': 'deck 建好了，但没能交给 Agent 面板：{error}。可以在编辑器的 Agent 面板里直接描述需求。',
  'chat.context': '（演示文稿工作台上下文：deck = {id}，标题「{title}」。这是用户刚在首页新建的 deck，骨架已在 slides/{id}/index.tsx，按需求把整个 deck 写进这个文件；先加载 create-slide 和 slide-authoring skill。）',
  'chat.title': 'Agent',
  'chat.new': '新对话',
  'chat.close': '关闭 Agent 面板',
  'chat.unavailable': '当前 DSH 没有会话服务，无法在这里对话。',
  'chat.failed': '没能打开对话：{error}',
  'frame.revealWorkspace': '在访达中显示工作区',

  'common.close': '关闭',
  'common.cancel': '取消',
  'common.retry': '重试',
  'load.boot': '正在打开…',
  'load.install': '首次使用，正在安装 open-slide…',
  'load.installCaption': '只需安装一次，通常一两分钟',
  'load.server': '正在启动预览…',
  'load.bootFailed': '工作台没有响应',
  'load.installFailed': 'open-slide 没能装好',
  'load.serverFailed': '预览没能启动',
  'load.unknownError': '未知错误',
  'load.showLog': '查看日志',
  'load.installLog': '安装日志',
  'load.serverLog': '预览服务日志',
  'common.copied': '已复制',
  'common.copyFailed': '复制失败',
  'common.create': '创建',
  'common.creating': '创建中…',
  'common.refresh': '刷新',
  'common.delete': '删除',
  'common.loading': '处理中…',


  'status.running': '服务器运行中',
  'status.starting': '服务器启动中',
  'status.stopped': '服务器未启动',
  'status.error': '服务器出错',

  'frame.title': '演示文稿工作台',
  'frame.reload': '重新加载',
  'frame.home': '回到首页',
  'frame.openExternal': '在浏览器里打开',
  'error.network': '连不上 DSH，确认它还在运行，然后再试一次。',
  'error.request': '请求失败（{status}）',



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


  'log.empty': '暂时没有输出。',
}

const EN = {
  'app.name': 'Slides Workbench',
  'home.date': '{w}, {mon} {d}',
  'home.week.0': 'Sunday', 'home.week.1': 'Monday', 'home.week.2': 'Tuesday', 'home.week.3': 'Wednesday', 'home.week.4': 'Thursday', 'home.week.5': 'Friday', 'home.week.6': 'Saturday',
  'home.line1a': 'One sentence',
  'home.line1b': 'starts a draft,',
  'home.line2a': 'the agent',
  'home.line2b': 'writes the pages,',
  'home.line3a': 'you just',
  'home.line3b': 'tell it well',
  'home.line3c': '.',
  'home.hint': 'Try clicking a card on the wall',
  'home.hintMods': 'Style notes are sent along with your sentence; Backspace removes the last one.',
  'home.mods': 'Stacked style notes',
  'home.modRemove': 'Remove “{label}”',
  'home.card.use': 'Use this',
  'home.card.add': 'Stack',
  'home.kind.prompt': 'Idea',
  'home.kind.quote': 'Craft',
  'home.kind.palette': 'Palette',
  'home.filter.all': 'All',
  'home.filter.cover': 'Covers',
  'home.filter.prompt': 'Ideas',
  'home.filter.quote': 'Craft',
  'home.filter.palette': 'Palettes',
  'home.lucky': 'Surprise me',
  'home.mine': 'My decks · {n}',
  'home.mineEmpty': 'My decks',
  'home.themes': 'Templates',
  'home.themeMod': 'use theme themes/{id} ({name})',
  'frame.useTheme': 'Use this template',
  'home.dock': 'Inspiration wall',
  'home.zoomIn': 'Zoom in',
  'home.zoomOut': 'Zoom out',
  'home.recenter': 'Back to center',
  'home.placeholder': 'One sentence about the topic, audience and tone — the agent writes the pages.',
  'home.submit': 'Start',
  'home.untitled': 'Untitled deck',
  'home.failed': 'Could not create: {error}',
  'nav.slides': 'Slides',
  'nav.themes': 'Themes',
  'nav.assets': 'Assets',
  'nav.slides.title': 'Slides · open-slide',
  'nav.themes.title': 'Themes · open-slide',
  'nav.assets.title': 'Assets · open-slide',
  'panel.label': 'Slides',
  'frame.exportFailed': 'Could not save the export: {error}',
  'frame.shareFailed': 'Could not create the read-only preview link: {error}',
  'home.handoffFailed': 'The deck is ready, but the Agent panel did not take the brief: {error}. Describe it in the editor’s Agent panel.',
  'chat.context': '(Slides workbench context: deck = {id}, title "{title}". The user just created this deck from the home page; its scaffold is slides/{id}/index.tsx; write the whole deck into that file. Load the create-slide and slide-authoring skills first.)',
  'chat.title': 'Agent',
  'chat.new': 'New chat',
  'chat.close': 'Close the Agent panel',
  'chat.unavailable': 'This DSH has no session service, so chat is unavailable here.',
  'chat.failed': 'Could not open the chat: {error}',
  'frame.revealWorkspace': 'Reveal workspace in Finder',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.retry': 'Retry',
  'load.boot': 'Opening…',
  'load.install': 'First run: installing open-slide…',
  'load.installCaption': 'One-time setup, usually a minute or two',
  'load.server': 'Starting the preview…',
  'load.bootFailed': 'The workbench isn’t responding',
  'load.installFailed': 'open-slide couldn’t be installed',
  'load.serverFailed': 'The preview couldn’t start',
  'load.unknownError': 'unknown error',
  'load.showLog': 'Show log',
  'load.installLog': 'Install log',
  'load.serverLog': 'Preview server log',
  'common.copied': 'Copied',
  'common.copyFailed': 'Couldn’t copy',
  'common.create': 'Create',
  'common.creating': 'Creating…',
  'common.refresh': 'Refresh',
  'common.delete': 'Delete',
  'common.loading': 'Working…',


  'status.running': 'Server running',
  'status.starting': 'Server starting',
  'status.stopped': 'Server stopped',
  'status.error': 'Server error',

  'frame.title': 'Slides workbench',
  'frame.reload': 'Reload',
  'frame.home': 'Back to home',
  'frame.openExternal': 'Open in browser',
  'error.network': 'Could not reach DSH. Make sure it is still running, then try again.',
  'error.request': 'Request failed ({status})',



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


  'log.empty': 'Nothing here yet.',
}

const DICTS = { zh: ZH, en: EN }
const listeners = new Set()

// 早期版本有手动切换语言、写在 localStorage 里；现在一律跟随 DSH，顺手清掉
try {
  localStorage.removeItem('slides-workbench.lang.override')
  localStorage.removeItem('slides-workbench.lang')
} catch {
  // 隐私模式里 localStorage 可能不可用
}

function normalize(value) {
  const tag = String(value ?? '').toLowerCase()
  // 'auto' / 'system' 这类未解析的值不算数，交给下一级兜底
  if (!tag || tag === 'auto' || tag === 'system') return null
  return tag.startsWith('zh') ? 'zh' : 'en'
}

/** 浏览器语言只是最后兜底：DSH 的语言优先。 */
function detectBrowser() {
  if (typeof navigator === 'undefined') return 'zh'
  return normalize(navigator.language) ?? 'zh'
}

// DSH 当前语言；由 index.jsx 从 locale 服务接进来
let host = null

// 模块初始化就定下初值：sidebar label thunk 在 apply 里就会被调用
let current = host ?? detectBrowser()

/** 把 DSH 的语言接进来；拿不到有效值就不动。 */
export function setHostLang(active) {
  const next = normalize(active)
  if (!next || next === host) return
  host = next
  const before = current
  current = host ?? detectBrowser()
  if (current !== before) listeners.forEach((fn) => fn())
}

/** 当前生效的语言：'zh' 或 'en'。 */
export function lang() {
  return current
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
