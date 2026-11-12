// 让面板里的 open-slide 跟随 DSH 外壳的外观：主题（明/暗）和界面语言。
//
// iframe 和我们同源（/slides-workbench/app/ 是 Host 反代），所以可以直接读它的
// document、写它的 localStorage。DSH 用 `body[data-ds-dark-theme]` 表示暗色；
// open-slide 用 next-themes 的 class 模式（html.dark）+ `open-slide:locale` 存语言。

/** open-slide 存界面语言的 key（和它自己的 locale-store 一致）。 */
const LOCALE_KEY = 'open-slide:locale'

/** 当前 DSH 是不是暗色。 */
export function hostIsDark() {
  return document.body?.hasAttribute('data-ds-dark-theme') === true
}

/**
 * 监听 DSH 主题切换。
 * @param {(dark: boolean) => void} callback - 主题变化回调。
 * @returns {() => void} 停止监听。
 */
export function watchHostTheme(callback) {
  const body = document.body
  if (!body || typeof MutationObserver !== 'function') return () => {}
  const observer = new MutationObserver(() => callback(hostIsDark()))
  observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
  return () => observer.disconnect()
}

/**
 * 把明/暗写进 iframe：open-slide 的 next-themes 用 class，再顺手同步 color-scheme。
 * @param {Document|null} doc - iframe 文档。
 * @param {boolean} dark - 是否暗色。
 * @returns {void}
 */
export function applyTheme(doc, dark) {
  const html = doc?.documentElement
  if (!html) return
  html.classList.toggle('dark', dark)
  html.style.colorScheme = dark ? 'dark' : 'light'
}

/**
 * DSH 的界面语言 → open-slide 的 locale id。
 * @param {string} lang - 'zh' | 'en'（我们 i18n 里的语言）。
 * @returns {string} open-slide 的 LocaleId。
 */
export function appLocaleId(lang) {
  return lang === 'zh' ? 'zh-CN' : 'en'
}

/**
 * 让 open-slide 用指定语言。同源共享 localStorage，写进去之后要重载一次才生效，
 * 所以返回「是否需要重载」。
 * @param {string} id - open-slide 的 LocaleId。
 * @returns {boolean} 是否写了新的语言（调用方据此重载 iframe）。
 */
export function applyLocale(id) {
  try {
    if (localStorage.getItem(LOCALE_KEY) === id) return false
    localStorage.setItem(LOCALE_KEY, id)
    return true
  } catch {
    return false
  }
}