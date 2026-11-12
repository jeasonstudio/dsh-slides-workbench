# 写 open-slide 页面（技术参考）

本文件是 `slides/<id>/index.tsx` 的唯一技术规范。从零建整份 deck 见 `slides-create-deck`；这里只讲「怎么写才跑得起来、看得清」。

## 0. 先看环境

- 用 `slides_status` 拿工作区路径、依赖是否装好、dev server URL；用 `slides_list` 看已有 deck id。
- 一个 deck = `slides/<kebab-id>/` 目录，入口固定 `slides/<id>/index.tsx`，图片/视频放 `slides/<id>/assets/`。
- 只允许「一个 index.tsx + assets/」：不要建 `Card.tsx`、`components/`、`helpers.ts`、`README.md` 等兄弟文件；辅助组件和常量写在 index.tsx 里。
- 只改自己负责的 deck；不要动 `package.json`、`open-slide.config.ts`、`themes/`、其他 deck；不新增依赖（只有 `react`、`@open-slide/core` 和标准 Web API）。
- 改已有 deck：先 `slides_read_deck` 拿全文，改完整体 `slides_write_deck` 写回（该工具是整文件覆盖）。

## 1. 文件契约（逐字满足）

```tsx
import type { Page, SlideMeta } from '@open-slide/core';

const Cover: Page = () => <div>…</div>;
const Body: Page = () => <div>…</div>;

export const meta: SlideMeta = { title: 'Q2 Launch', createdAt: '2026-05-16T12:00:00Z' };
export default [Cover, Body] satisfies Page[];
```

- `export default` 必须是**非空数组**，元素是零 props 的 React 组件，数组顺序就是页序。
- `meta.title` 显示在页头；省略则用目录名。`meta.theme` 只在 deck 确实来自 `themes/<id>.md` 时写。
- `meta.createdAt` 是 ISO 8601 **字符串字面量**，只写一次。写文件前先用 Bash 跑 `node -e "console.log(new Date().toISOString())"`，把输出原样粘进去；不要凭记忆写时间，也不要用 `new Date()` 表达式。

## 2. 讲稿：`export const notes`

```tsx
export const notes: (string | undefined)[] = [
  '开场先给结论，再解释为什么。',
  undefined,
  `这一页讲三个抓手，每个一句。
最后停一下，等提问。`,
];
```

- 条目数与页面数组**一一对应**（`notes[0]` 属于第一页）。增删、重排页面时必须在同一次编辑里重新对齐，错位会把讲稿挂到错误的页。
- 纯文本，换行保留，不渲染 Markdown；没有讲稿的页用 `undefined`，末尾连续的 `undefined` 可省略。
- 用户要「讲稿 / talk track / presenter notes」时**只写进 notes**，不要另建 `.md` 文件——运行时只读这个导出。
- 讲稿写「要说的话」：开场、过渡、要点、时间提示，不要复述屏幕文字。

## 3. 画布与绝对坐标

- 每页固定渲染在 **1920 × 1080** 画布，框架自动缩放；按 1920×1080 设计。
- 字号、padding、gap、位置一律用**绝对 px**；不要 `rem`、`vw`/`vh`、用 `%` 设字号。
- 每页根元素必须 `width: '100%', height: '100%'`（建议加 `boxSizing: 'border-box'`），并自己画背景色。
- 优先内联 `style={{ … }}`；CSS 是全局的，必须用时把类名按 deck 作用域命名。
- 画布**不滚动**：超出 1080px 的内容被直接裁掉，负 margin / transform 藏不住。

**垂直预算（头号翻车点）**：`可用高度 = 1080 − 上 padding − 下 padding`——120px padding → **840px**，160px → **760px**；`元素高度 = 字号 × 行高 × 行数`，再累加间距（32–64px），换行的 bullet 按 2 行算。

| 示例（120px padding，预算 840px） | 高度 |
| --- | --- |
| 标题 80px × 1.2 × 1 行 | 96px |
| 间距 | 64px |
| 正文 40px × 1.6 × 3 行 | 192px |
| 间距 | 48px |
| 5 条 bullet，各 40px × 1.6 × 1 行 | 320px |
| bullet 之间 4 × 24px | 96px |
| **合计** | **816px ✅** |

写每页前先心算一遍；装不下就**拆页**。不要缩到 28px 以下、不要加 `overflow: auto/scroll/hidden`、不要收紧行高硬塞。

## 4. 字号与间距

| 用途 | 字号 | 用途 | 字号 |
| --- | --- | --- | --- |
| 封面主标题 | 140–200px | 正文 | 32–44px |
| 章节大标题 | 80–120px | 注释/标签 | 22–28px |
| 页面标题 | 56–80px | 页码 | 从 `useSlidePageNumber()` 读，不要写死 |

- 内容 padding 100–160px，文字永远不要贴边；行高标题 1.05–1.2、正文 1.5–1.7；元素间距 32–64px。
- 一页一个观点：标题 + 一段正文（≤3 行），**或**标题 + ≤5 条不换行的短 bullet，不要两者同时堆。

## 5. 视觉方向与 `design` 常量

一个 deck 只锁一套：1 背景色 + 1 主文字色 + 1 强调色 + 1 弱化色；1 个展示字体 + 1 个正文字体；1 个 padding；1 种气质（极简 / 编辑 / 复古 / 野兽 / 柔和…），不要混搭。

```tsx
import type { DesignSystem } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#0f172a', text: '#f8fafc', accent: '#fbbf24' },
  fonts: { display: 'system-ui, -apple-system, sans-serif', body: 'system-ui, -apple-system, sans-serif' },
  typeScale: { hero: 180, body: 40 },
  radius: 12,
};
const muted = '#94a3b8'; // palette 之外的常量照旧用普通 const
```

- 颜色/字体/字号/圆角用 `var(--osd-bg)`、`var(--osd-text)`、`var(--osd-accent)`、`var(--osd-font-display)`、`var(--osd-font-body)`、`var(--osd-size-hero)`、`var(--osd-size-body)`、`var(--osd-radius)`；需要 JS 数值做计算时才直接读 `design.typeScale.hero`。
- `design` 必须是 `export const`、对象必须是字面量（不能 spread、不能调函数），Design 面板才能改。

## 6. 起手模板

```tsx
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#0f172a', text: '#f8fafc', accent: '#fbbf24' },
  fonts: { display: 'system-ui, -apple-system, sans-serif', body: 'system-ui, -apple-system, sans-serif' },
  typeScale: { hero: 180, body: 40 },
  radius: 12,
};
const muted = '#94a3b8';
const fill = { width: '100%', height: '100%', boxSizing: 'border-box' } as const;

const Cover: Page = () => (
  <div style={{ ...fill, background: 'var(--osd-bg)', color: 'var(--osd-text)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
    <div style={{ fontSize: 28, letterSpacing: '0.2em', color: 'var(--osd-accent)' }}>CHAPTER 01</div>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 'var(--osd-size-hero)', fontWeight: 900, lineHeight: 1.05, margin: '32px 0' }}>The Big Idea</h1>
    <p style={{ fontSize: 'var(--osd-size-body)', color: muted, maxWidth: 1200 }}>一句副标题，说明这份演示要回答的问题。</p>
  </div>
);

const Content: Page = () => (
  <div style={{ ...fill, background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: 120 }}>
    <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 80, fontWeight: 800, margin: 0 }}>Section heading</h2>
    <ul style={{ fontSize: 'var(--osd-size-body)', lineHeight: 1.6, marginTop: 64, paddingLeft: 48 }}>
      <li>一行一个观点</li><li>3–5 条就够</li><li>留白也是内容</li>
    </ul>
  </div>
);

export const meta: SlideMeta = { title: 'The Big Idea', createdAt: '2026-05-16T12:00:00Z' };
export default [Cover, Content] satisfies Page[];
```

## 7. 常用页面套路

- **封面**：eyebrow + 140–200px 主标题 + 一句副标题，垂直居中，别的都不要。**章节页**：一个 80–120px 大标签 + 一行说明，几乎留空。
- **内容页**：标题 + 3–5 条短 bullet，或标题 + 2–3 行正文。**大数字页**：一个 200–320px 的数字占满视觉 + 一句解释。
- **引用页**：56–72px 引文 + 28px 出处。**对比页**：两栏等宽（gap 64），各一个标题 + 3 条；不要四栏。
- 需要视觉元素时优先排版、色块、线条、大字号，而不是找图。

## 8. 分步揭示：`<Steps>` / `<Step>`

```tsx
import { Step, Steps } from '@open-slide/core';

<Steps>
  <h2>标题先出现，正文逐条来</h2>
  <Step><p>第一条：先给背景。</p></Step>
  <Step><p>第二条：再给结论。</p></Step>
</Steps>
```

- `<Step>` 必须是 `<Steps>` 的**直接子元素**，否则不会延迟、直接全显示；`<Steps>` 里的非 `Step` 子元素立刻可见（「标题常驻、正文逐条」）。
- 一页多个 `<Steps>` 按文档顺序依次揭示，← 反向收回；从总览网格跳进来或从后一页往回翻时**全部展开**，整页在所有步骤都出现时必须自洽可读。
- `<Step>` 淡入默认 180ms，`<Step duration={...}>` 可调；`prefers-reduced-motion` 自动降级，不用写兜底。
- 只在「顺序本身是重点」时用（铺垫 → 转折 → 结论）；封面、金句、图解这类该一眼看完的页不要包。

## 9. 页面转场：`SlideTransition`

```tsx
import type { Page, SlideTransition } from '@open-slide/core';

export const transition: SlideTransition = {
  duration: 260,
  exit: { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: [{ opacity: 1 }, { opacity: 1 }] },
  enter: { duration: 260, easing: 'cubic-bezier(0, 0, 0.2, 1)', keyframes: [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }] },
};
```

- 默认**没有**转场，页面直接切换；不写完全没问题。写就整份 deck 一套 DNA：同样 200–280ms、同样缓动、同样「旧页保持、新页淡入」。
- 只能改 enter 上那点小位移：≤12px 或 ≤3% 缩放。框架忽略 exit 里的 opacity：exit 写 hold（`[{opacity:1},{opacity:1}]`），不要写淡出，也不要在 enter 上加 delay。
- 只给少数页覆写：`Cover.transition = { ... }`；转场跟「进入的那一页」走。不要六页六种转场，不要 `translateX(100%)`、`linear`、激进 scale-pop、`throughBackground`（除刻意章节黑场）。

## 10. 共享元素变形：`MorphElement`

```tsx
import { MorphElement, type SlideTransition } from '@open-slide/core';

const morph: SlideTransition = {
  duration: 280,
  exit: { duration: 308, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: [{ opacity: 1 }, { opacity: 1 }] },
  enter: { duration: 308, easing: 'cubic-bezier(0, 0, 0.2, 1)', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  morph: { duration: 868, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
};
// 两页用同一个 id，位置/尺寸写像素常量；目标页挂转场 Wide.transition = morph（反向也要挂）
<MorphElement id="pill">
  <div style={{ position: 'absolute', left: 842, top: 479, width: 236, height: 122, borderRadius: 999, background: '#fff' }} />
</MorphElement>
```

- 两页同一 `id` 才配对；同一页内 id 唯一，不要嵌套 `MorphElement`。
- 几何必须在挂载时确定：像素常量，不要用 effect 里量出来的值；文本会变长时放隐藏满宽占位，避免盒子被撑变。
- 变形节点自身**不要加 `transform`**（居中用外层普通 div 包一层）。变形页的入场动画用 `useIsActivePage()` 守卫，只有当前页实例才播。
- 只在「状态连续」时用（卡片展开、开关滑动、一列里多一个盒子）；不要拿它做装饰。

## 11. 资源与占位图

```tsx
import hero from './assets/hero.jpg'; // deck 内资源；工作区根 assets/ 用 @assets/logos/acme.svg
<img src={hero} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
const videoUrl = new URL('./assets/intro.mp4', import.meta.url).href;
```

- 纯文字 deck 不要建 `assets/` 目录。
- 只有用户必须提供的真实图片（产品截图、团队合影、真实图表）才用 `<ImagePlaceholder hint="Q3 收入图表" width={1280} height={720} />`；装饰、图标、氛围图不要用占位图，用排版解决。

## 12. Webfont（需要非系统字体时）

```tsx
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap';
const FONT_ID = 'osd-webfont-q2-launch'; // 后缀换成当前 deck id
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_ID) as HTMLLinkElement | null;
  if (!link) { link = document.createElement('link'); link.id = FONT_ID; link.rel = 'stylesheet'; document.head.appendChild(link); }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
}
```

- 默认用系统字体栈。加载必须在**模块顶层**做一次，不能放进页面组件（每页都挂载，会重复注册整套 `@font-face`）。
- 一律「创建或更新」，不要 `if (!link) return` 跳过：HMR 重跑模块时旧元素还在，否则改了不生效。`id` 必须带 deck id，避免首页同时挂多个 deck 时互相覆盖。
- 只列实际用到的字重；CJK 字体很大，文本固定时用 `&text=<用到的字>` 做小子集。

## 13. 重复元素用组件，不要 `map`

卡片、图块、logo 行这类**视觉上重复**的元素，在 index.tsx 里定义小组件，逐个 `<Card ... />` 实例化；不要把数据数组 `.map()` 成 JSX。检查器改的是源码里的一个位置，`map` 只有一个位置，改一张会改全部。纯文字 `<ul><li>` 不适用这条——每个 `<li>` 本来就是独立节点。

```tsx
const Card = ({ title, accent }: { title: string; accent: string }) => (
  <div style={{ borderTop: `4px solid ${accent}`, paddingTop: 24 }}><p style={{ fontSize: 36, margin: 0 }}>{title}</p></div>
);
// 用法：<Card title="速度" accent="#fbbf24" /> <Card title="稳定" accent="#38bdf8" />
```

## 14. 反模式

- ❌ 一页超过约 40 个英文词 / 大段文字墙 → 拆页。❌ 内容超出 1080px、靠 `overflow` 或负 margin 掩盖 → 拆页。
- ❌ 字号低于 28px、padding 低于 100px 硬塞 → 拆页。❌ bullet 换行到第二行 → 缩短或单独成页。
- ❌ 全篇配色/字号不统一；一页一个风格。❌ 用 `map` 渲染重复视觉元素。
- ❌ 在 deck 目录建组件文件、README、讲稿 md。❌ 改 `package.json`、装依赖、改别的 deck。
- ❌ 用没读过的框架原语（`MorphElement`、`Steps`、转场）凭记忆开写。

## 15. 写完自检

- [ ] `slides/<id>/index.tsx` 的 `export default` 是非空数组，**页数**与约定一致；元素都是零 props 组件，页序符合叙事。
- [ ] 每页根元素 `width/height: 100%`，内容全部在 padding 内，垂直预算 ≤1080px。
- [ ] `export const notes` 条数与页数对齐（`undefined` 允许），讲稿在 notes 而不是 md 文件。
- [ ] `meta.createdAt` 是 Bash 取到的真实 ISO 时间字符串；`meta.title` 已写。
- [ ] 全篇一套配色 + 一套字号 + 一个 padding；`design` 已 `export` 且被 `var(--osd-*)` 消费。
- [ ] 重复视觉元素是显式组件实例，不是 `map`；用了 `<Steps>` 时每个 `<Step>` 都是直接子元素。
- [ ] 声明了转场时全篇一个家族；用了 morph 时 id 在两页一致、几何是像素常量。
- [ ] 引用的 `./assets/...`、`@assets/...` 文件真实存在；没有改 `package.json`，没有动 `slides/<id>/` 以外的文件。
- [ ] 写完后用 `slides_present` 拿到 `/s/<id>/preview?p=N` 逐页看一眼（有浏览器工具时）；预览页 `[data-osd-preview="ready"]` 表示渲染稳定。