// 浏览器侧：同源 iframe 的样式注入。iframe 指向 Host 的同源反代
// （/slides-workbench/app/），所以这里能直接拿到 contentDocument。
/** dev server 在 DSH 同源路径下的挂载点（与 open-slide.config.ts 的 base 一致）。 */
export const APP_PREFIX = '/slides-workbench/app'

/**
 * 往 iframe 文档里注入一小段样式：隐藏 open-slide 首页外壳自带的左侧导航，
 * 只留右侧内容；deck 编辑器（/s/<id>）有自己的一列页面缩略图，不受影响。
 * @param {Document|null} doc - 同源 iframe 的 document。
 * @returns {boolean} 是否注入成功。
 */
export function injectEmbedStyle(doc) {
  if (!doc || doc.getElementById('sw-embed-style')) return Boolean(doc)
  const style = doc.createElement('style')
  style.id = 'sw-embed-style'
  style.textContent = `
/* 只隐藏 open-slide 首页外壳（HomeShell）那一列导航：
   它的容器是 div.hidden.md:block，里面放 aside.group/side。
   deck 编辑器（/s/<id>）的页面缩略图列是另一个结构，不要动。 */
div.h-dvh > div.hidden.md\\:block:has(> aside.group\\/side) { display: none !important; }

/* 首页外壳：整页统一背景。
   open-slide 的首页是「bg-sidebar 的底 + 8px 内边距 + bg-background 的内容卡片」，
   所以去掉内容卡片的圆角/描边还不够，外圈那 8px 会露出略深的底色，看着仍像一张卡片。
   这里把外壳底色拉成 --background，并把内边距清零，整页就是一个颜色。 */
div.h-dvh:not(.flex-col) { background-color: var(--background) !important; }
div.h-dvh:not(.flex-col) > div[class*="md:py-2"][class*="md:pr-2"] { padding: 0 !important; }

/* 桌面客户端（Electron）里让页面顶部那一行当窗口拖拽区：
   同源 iframe 里的 -webkit-app-region 会被内核收集，但宿主 base.css 的 no-drag
   规则管不到 iframe 内部，所以这里自己把可交互元素排除掉。 */
html[data-sw-desktop] [data-sw-drag] { -webkit-app-region: drag; }
/* 顶部那一行上面还有一段空白内边距，一起做成拖拽区（宽度撑满、高度跟着算） */
html[data-sw-desktop] #sw-drag-band {
  position: fixed; left: 0; right: 0; top: 0;
  -webkit-app-region: drag; background: transparent; z-index: 0;
}
html[data-sw-desktop] [data-sw-drag] :is(
  button, a, input, select, textarea, summary, [contenteditable='true'], [tabindex],
  [role='button'], [role='link'], [role='tab'], [role='checkbox'], [role='radio'],
  [role='combobox'], [role='textbox'], [role='menuitem'], [role='switch'], [role='slider']
) { -webkit-app-region: no-drag; }

/* 首页内容那张卡片本身（md:rounded-[10px] + ring + shadow-edge）也摊平；
   这个类只有 deck 列表页在用（编辑器里没有），按类名+背景一起限定即可。 */
div[class*="md:rounded-[10px]"][class*="bg-background"] {
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* Agent 面板：外壳（工具栏按钮、停靠栏、拖宽）照旧，原来的内容让位给盖在上面的 DSH 原生对话
   （外层渲染，见 client/chat.jsx）；藏起来而不是删掉，免得 Tab 键焦点跑进看不见的旧输入框 */
[data-agent-dock] > .sidebar-swap > * { visibility: hidden !important; }
`
  doc.head?.appendChild(style)
  return true
}

/** 当前是不是 DSH 桌面客户端（Electron 渲染进程）。 */
export function isDesktopClient() {
  return typeof navigator !== 'undefined' && /\bElectron\//.test(navigator.userAgent)
}

/**
 * 让 open-slide 页面最顶部那一行当窗口拖拽区（只在桌面客户端里做）。
 * open-slide 自己不知道宿主，所以由我们找到最靠上的 header，打上标记，
 * 再用上面注入的 html[data-sw-desktop] [data-sw-drag] 规则变成 app-region: drag。
 * @param {Document|null} doc - iframe 文档。
 * @returns {number} 标记了几个。
 */
export function markDragRegion(doc) {
  const html = doc?.documentElement
  if (!html || !isDesktopClient()) return 0
  html.setAttribute('data-sw-desktop', '')
  const headers = [...(doc.querySelectorAll('header') ?? [])]
  let marked = 0
  let topmost = Infinity
  for (const el of headers) {
    const rect = el.getBoundingClientRect()
    // 只认真正在最上面的那条：宽度占大半屏、高度是一行
    if (rect.width < window.innerWidth * 0.5 || rect.height < 20 || rect.height > 120) continue
    if (rect.top > 160) continue
    el.setAttribute('data-sw-drag', '')
    topmost = Math.min(topmost, rect.top)
    marked += 1
  }
  // 行上方那段空白（页面上边距）也做成拖拽区，不然只有 32px 可抓
  let band = doc.getElementById('sw-drag-band')
  if (topmost > 8) {
    if (!band) {
      band = doc.createElement('div')
      band.id = 'sw-drag-band'
      band.setAttribute('data-sw-drag', '')
      band.setAttribute('aria-hidden', 'true')
      doc.body?.insertBefore(band, doc.body.firstChild)
    }
    band.style.height = `${Math.floor(topmost)}px`
  } else if (band) {
    band.remove()
  }
  return marked
}

/**
 * 盯着 iframe：换页 / 重新渲染后补上拖拽标记。
 * @param {Document|null} doc - iframe 文档。
 * @returns {() => void} 停止监听。
 */
export function watchDragRegion(doc) {
  markDragRegion(doc)
  const body = doc?.body
  if (!body || typeof MutationObserver !== 'function') return () => {}
  let scheduled = false
  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      markDragRegion(doc)
    })
  })
  observer.observe(body, { childList: true, subtree: true })
  return () => observer.disconnect()
}

/** 主题详情页的路由：<base>/themes/<id>。 */
const THEME_PATH = /\/themes\/([^/]+)\/?$/

/**
 * 模板详情页（/themes/<id>）的返回按钮那一行（标题 header 的前一个兄弟）最右边加一个
 * 「用这个模板」，点了交给外壳（回首页、把这个主题挂成叠加项）。别的页面上把它拿掉。
 * @param {Document|null} doc - iframe 文档。
 * @param {{label: string, onUse: (theme: {id: string, name: string}) => void}} options - 按钮文案与回调。
 * @returns {boolean} 当前是否挂着按钮。
 */
export function mountUseThemeButton(doc, { label, onUse }) {
  if (!doc?.body) return false
  const match = THEME_PATH.exec(doc.location?.pathname ?? '')
  const old = doc.getElementById('sw-use-theme')
  if (!match) {
    old?.remove()
    return false
  }
  const id = decodeURIComponent(match[1])
  const title = doc.querySelector('header > h2')
  const row = title?.parentElement?.previousElementSibling
  if (!row) return false
  if (old && old.parentElement === row && old.dataset.theme === id && old.textContent === label) return true
  old?.remove()
  const btn = doc.createElement('button')
  btn.id = 'sw-use-theme'
  btn.type = 'button'
  btn.dataset.theme = id
  btn.textContent = label
  btn.style.cssText = 'margin-left:auto;height:32px;padding:0 14px;border-radius:6px;border:0;cursor:pointer;'
    + 'font-size:13px;font-weight:500;background:var(--primary);color:var(--primary-foreground);'
  btn.addEventListener('click', () => {
    const h2 = doc.querySelector('header > h2')
    onUse({ id, name: (h2?.textContent ?? '').trim() || id })
  })
  row.appendChild(btn)
  return true
}

/**
 * 盯着 iframe：换页 / 重新渲染后补上（或拿掉）「用这个模板」。
 * @param {Document|null} doc - iframe 文档。
 * @param {{label: string, onUse: (theme: {id: string, name: string}) => void}} options - 按钮文案与回调。
 * @returns {() => void} 停止监听。
 */
export function watchUseThemeButton(doc, options) {
  mountUseThemeButton(doc, options)
  const body = doc?.body
  if (!body || typeof MutationObserver !== 'function') return () => {}
  let scheduled = false
  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      mountUseThemeButton(doc, options)
    })
  })
  observer.observe(body, { childList: true, subtree: true })
  return () => observer.disconnect()
}
