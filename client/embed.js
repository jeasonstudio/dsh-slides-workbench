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

/* 首页内容外面那层大圆角卡片（md:rounded-[10px] + ring + shadow-edge）去掉。
   这个类只有 deck 列表页在用（编辑器里没有），所以按类名+背景一起限定即可。 */
div[class*="md:rounded-[10px]"][class*="bg-background"] {
  border-radius: 0 !important;
  box-shadow: none !important;
}
`
  doc.head?.appendChild(style)
  return true
}

/** 我们给 Agent provider 用的图标（和侧栏入口同一套视觉，用 currentColor 跟随主题）。 */
const BRAND_PATHS = '<rect x="3" y="4.5" width="18" height="12.5" rx="2.2" /><path d="M8 21h8M12 17v4" /><path d="M7 9.5h6M7 12.5h4" />'

/**
 * open-slide 的 provider 图标是按 provider id 写死的（claude / codex 两家品牌 SVG）。
 * 我们接的是 DSH，就把这两个 viewBox 的 SVG 就地换成自己的图标：
 * 只改这个 SVG 自己的属性/子节点，不动 React 的节点身份，避免它的 diff 出错。
 * @param {Document|null} doc - iframe 文档。
 * @returns {number} 换掉了几个。
 */
export function replaceBrandLogo(doc) {
  const targets = doc?.querySelectorAll?.('svg[viewBox="0 0 256 257"], svg[viewBox="100 100 411 411"]')
  if (!targets || !targets.length) return 0
  for (const svg of targets) {
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '1.7')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.setAttribute('data-sw-brand', '')
    svg.innerHTML = BRAND_PATHS
  }
  return targets.length
}

/**
 * 盯着 iframe：open-slide 重新渲染出品牌图标时再换一次。
 * @param {Document|null} doc - iframe 文档。
 * @returns {() => void} 停止监听。
 */
export function watchBrandLogo(doc) {
  replaceBrandLogo(doc)
  const body = doc?.body
  if (!body || typeof MutationObserver !== 'function') return () => {}
  let scheduled = false
  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      replaceBrandLogo(doc)
    })
  })
  observer.observe(body, { childList: true, subtree: true })
  return () => observer.disconnect()
}
