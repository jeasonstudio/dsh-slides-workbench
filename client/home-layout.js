// 1:1 移植自 dsh-media-desk 的散落算法（client/layout.js + util.js 里的 hash/seeded/spring）：
// 螺旋撒点 → 迭代推开重叠 → 中间给首屏留一块 HERO 区域。

export const HERO = { w: 540, h: 372 }

export function hash(text) {
  let value = 0
  const input = String(text)
  for (let i = 0; i < input.length; i += 1) value = (value * 31 + input.charCodeAt(i)) | 0
  return Math.abs(value)
}

/** 固定种子的伪随机，保证每次打开位置一样。 */
export function seeded(seed) {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** 把弹簧响应采样成 CSS linear() 缓动。 */
export function springEasing(stiffness = 170, damping = 20, mass = 1) {
  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  const wd = w0 * Math.sqrt(Math.max(1 - zeta * zeta, 1e-4))
  const at = (t) => 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
  let duration = 0.1
  while (duration < 4 && (Math.abs(at(duration) - 1) > 0.002 || Math.abs(at(duration + 0.05) - 1) > 0.002)) duration += 0.05
  const points = []
  const N = 36
  for (let i = 0; i <= N; i += 1) points.push(Number(at((i / N) * duration).toFixed(4)))
  points[N] = 1
  return { easing: `linear(${points.join(',')})`, duration: Math.round(duration * 1000) }
}

export const SPRING_SOFT = springEasing(120, 16)

/** 卡片尺寸（布局用的外框）：封面 = 16:9 图 + 文字区；其他按类型给固定高度。 */
export function cardSize(item) {
  const h = hash(item.id)
  switch (item.kind) {
    case 'cover': {
      const width = 196 + (h % 4) * 20
      return { w: width, h: Math.round((width - 12) * (9 / 16)) + 72 }
    }
    case 'quote':
      return { w: 220 + (h % 3) * 16, h: 150 }
    case 'palette':
      return { w: 200, h: 156 }
    default:
      return { w: 236, h: 176 }
  }
}

/**
 * 散落布局：和媒体工作台同一套螺旋 + 推开算法，中间留给首屏那句话。
 * 卡片默认端正（不旋转）；t 是 hover 时轻轻歪向哪边（±1.6°）。
 * @param {Array<{id: string, kind: string}>} items - 卡片，按给定顺序从中心往外排。
 * @returns {Record<string, {x: number, y: number, t: number}>} 每张卡相对中心的偏移。
 */
export function scatterLayout(items) {
  const rand = seeded(7919)
  const nodes = items.map((item, index) => {
    const angle = index * 2.39996 + rand() * 0.5
    const radius = 210 + 104 * Math.sqrt(index + 1)
    const size = cardSize(item)
    return {
      id: item.id,
      x: Math.cos(angle) * radius * 1.42,
      y: Math.sin(angle) * radius * 0.98,
      w: size.w,
      h: size.h,
    }
  })
  const gap = 18
  for (let step = 0; step < 240; step += 1) {
    let moved = false
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i]
      // 别压到中间的输入区
      const hx = (a.w + HERO.w) / 2 + gap - Math.abs(a.x)
      const hy = (a.h + HERO.h) / 2 + gap - Math.abs(a.y)
      if (hx > 0 && hy > 0) {
        if (hx < hy) a.x += Math.sign(a.x || 1) * hx
        else a.y += Math.sign(a.y || 1) * hy
        moved = true
      }
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j]
        const ox = (a.w + b.w) / 2 + gap - Math.abs(a.x - b.x)
        const oy = (a.h + b.h) / 2 + gap - Math.abs(a.y - b.y)
        if (ox <= 0 || oy <= 0) continue
        moved = true
        const horizontal = ox < oy
        const push = (horizontal ? ox : oy) / 2
        const dir = horizontal ? Math.sign(a.x - b.x || 1) : Math.sign(a.y - b.y || 1)
        if (horizontal) {
          a.x += dir * push
          b.x -= dir * push
        } else {
          a.y += dir * push
          b.y -= dir * push
        }
      }
    }
    if (!moved) break
  }
  return Object.fromEntries(
    nodes.map((node) => [node.id, { x: Math.round(node.x), y: Math.round(node.y), t: hash(node.id) % 2 ? 1.6 : -1.6 }]),
  )
}
