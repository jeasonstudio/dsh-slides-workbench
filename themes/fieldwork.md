---
name: 田野手记
description: Notion 风格的经营计划：暖白纸面、粗重的黑体大标题、宋体引言、手绘墨线插画、浅色卡片和珊瑚红的手写批注。
mode: light
---

# 田野手记

改编自 open-slide 官方主题 Fieldwork（MIT），已汉化，只用系统字体，不加载任何外部字体。

## 配色

墨黑和珊瑚红撑起整页。四种浅色填插画，更浅的同色系填卡片。珊瑚红每页只用在一处：眉标、圈出的数字、一个箭头，或一处未达标。

| 角色        | 色值                   | 用途                                         |
| ----------- | ---------------------- | -------------------------------------------- |
| bg          | `#FFFEFC`              | 暖白页面                                     |
| text        | `#191919`              | 墨黑：标题、线条、主要文字                   |
| accent      | `#E8553B`              | 珊瑚红：眉标、批注、圈出的数字、未达标       |
| body        | `#5F5E5B`              | 暖灰：正文与副标题                           |
| muted       | `#9B9A97`              | 说明、页脚、卡片序号、「从 → 到」里的「从」  |
| rule        | `rgba(25,25,25,0.12)`  | 行与行之间 1.5 px 的细分隔线                 |
| track       | `rgba(25,25,25,0.09)`  | 进度条底槽                                   |
| neutral     | `#E7E5E0`              | 图表里「上一期」的柱子                       |
| paper       | `#FFFFFF`              | 墨线插画内部的填充（手机、纸页、人脸）       |
| yellow      | `#F8DA7E`              | 插画填充、星形点缀、背景圆                   |
| blue        | `#8DBDEB`              | 插画填充                                     |
| pink        | `#F6C3CF`              | 插画填充                                     |
| green       | `#A6D4B2`              | 插画填充                                     |
| highlight   | `#FCE38A`              | 一句话背后的荧光笔涂抹（备选粉色 `#FADDE4`） |
| tintYellow  | `#FBF3DB`              | 卡片底色                                     |
| tintBlue    | `#E7F3F8`              | 卡片底色                                     |
| tintPink    | `#FAF1F5`              | 卡片底色                                     |
| tintGreen   | `#EDF3EC`              | 卡片底色                                     |
| ok          | `#448361`              | 状态文字：进展正常                           |
| warn        | `#B07A12`              | 状态文字：中等风险                           |
| note        | `#3E7FCF`              | 次要批注线条 / 「关注」状态                  |

正式 deck 里可调的设计变量（标题读 `var(--osd-font-display)`，封面大标题字号读 `var(--osd-size-hero)`）：

```tsx
export const design: DesignSystem = {
  palette: { bg: '#FFFEFC', text: '#191919', accent: '#E8553B' },
  fonts: {
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  typeScale: { hero: 150, body: 34 },
  radius: 24,
};
```

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 标题与正文：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。
  - 标题字重 700（苹方最粗为 Semibold，浏览器会就近取用），行高 1.1，字距 `0.01em`。中文不要用负字距，也不需要 word-spacing。
  - 正文字重 400；标签和行内强调用 600。页面根节点设 `fontVariantNumeric: 'tabular-nums'`，让数字等宽对齐。
- 引言：`"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif`，字重 400，正体（中文不用斜体），只用于引言。
- 字号：
  - 封面大标题：150 px（两行，每行尽量不超过 5 个字）。
  - 章节 / 结尾标题：120–130 px。
  - 页面标题：104 px（一行，不超过 9 个字）。
  - 卡片标题：42–54 px，同标题样式。
  - 大数字：140 px（主数字）、84 px（行内）、60–72 px（表格内）。
  - 引言：60 px 宋体，行高 1.35。
  - 正文：封面 34 px，内容页 28–32 px，行高 1.45–1.5，颜色 `body`。
  - 眉标：26 px，字重 600，珊瑚红，字距 `0.04em`。
  - 说明 / 元信息：22–26 px，颜色 `muted`。
  - 页脚：21 px。

## 版式

- 画布 1920 × 1080，所有元素按固定网格绝对定位。左边距 `X0 = 120`，内容宽 `W = 1680`。
- 纵向节奏：眉标 `top: 116`，页面标题 `top: 160`，标题旁的一句补充说明靠右放在 `left: 1220–1300, top: 196`，主体内容从 `top: 330` 开始，最晚在 ~940 结束，页脚 `top: 1000`。
- 卡片：圆角 24，纯浅色底，无边框、无阴影。一行三张：536 × 610，`x = 120 / 692 / 1264`。通栏行：1680 × 188，上下间隔 20 px。
- 表格与列表：行间用 1.5 px 的 `rule` 细线分隔；表头线用 2 px 墨黑实线。
- 插画放在文字块右侧（`x ≈ 940–1080`），垫一个浅色背景圆，绝不压住文字。
- 定位辅助函数：

```tsx
const abs = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
  height,
});
```

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去（`import { type CSSProperties, type ReactNode, useId } from 'react';`）。

```tsx
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const SERIF = '"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif';
```

### Title（封面大标题）

```tsx
const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      margin: 0,
      fontFamily: SANS,
      fontSize: 150,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '0.01em',
      color: '#191919',
    }}
  >
    {children}
  </h1>
);
```

### Heading（标题）

页面标题（104）、结尾标题（130）和卡片标题（54）共用一套样式。

```tsx
const Heading = ({ children, size = 104 }: { children: ReactNode; size?: number }) => (
  <h2
    style={{
      margin: 0,
      fontFamily: SANS,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '0.01em',
      color: '#191919',
    }}
  >
    {children}
  </h2>
);
```

### Footer（页脚）

左边是定位针标志 + 品牌名 + 标签，右边是补零的页码。`brand` / `label` 换成自己的。

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Mark = ({ size = 24 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    width={size * 0.8}
    height={size}
    viewBox="0 0 20 25"
    style={{ display: 'block' }}
  >
    <path
      d="M10 24C8.5 20 1.5 15 1.5 9.5a8.5 8.5 0 0 1 17 0C18.5 15 11.5 20 10 24Z"
      fill="#191919"
    />
    <circle cx="10" cy="9.5" r="3.4" fill="#FFFEFC" />
  </svg>
);

const Footer = ({
  brand = '田野手记',
  label = '年度经营计划',
}: {
  brand?: string;
  label?: string;
}) => {
  const { current, total } = useSlidePageNumber();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        top: 1000,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: SANS,
        fontSize: 21,
        color: '#9B9A97',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Mark size={24} />
        <span style={{ color: '#191919', fontWeight: 600 }}>{brand}</span>
        <span style={{ marginLeft: 12 }}>{label}</span>
      </span>
      <span>
        {pad2(current)} / {pad2(total)}
      </span>
    </div>
  );
};
```

### Eyebrow（眉标）

珊瑚红的短词，读起来像 Notion 页面的面包屑，而不是全大写的标签。

```tsx
const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: '0.04em',
      color: '#E8553B',
    }}
  >
    {children}
  </div>
);
```

### Highlight（荧光笔）

每页只给一句话涂上荧光笔。四个角的圆角不一样，看起来像手涂的。

```tsx
const Highlight = ({ children, color = '#FCE38A' }: { children: ReactNode; color?: string }) => (
  <span
    style={{
      background: color,
      borderRadius: '6px 12px 8px 14px',
      padding: '0 6px',
      margin: '0 -2px',
      color: '#191919',
      WebkitBoxDecorationBreak: 'clone',
      boxDecorationBreak: 'clone',
    }}
  >
    {children}
  </span>
);
```

### TintCard（浅色卡片）

纯浅色卡片。底色从 `tintBlue` / `tintGreen` / `tintYellow` / `tintPink` 里选，同一行轮换使用。

```tsx
const TintCard = ({
  tint = '#E7F3F8',
  style,
  children,
}: {
  tint?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: 24,
      background: tint,
      padding: '34px 44px 32px',
      ...style,
    }}
  >
    {children}
  </div>
);
```

### Ink、Stroke、CircleDoodle、Sparkle（手绘层）

`Ink` 是一个 SVG：3.2 px 圆头墨线，经过湍流滤镜，每根线都带一点手抖。在里面用普通的 `<path>` / `<rect>` / `<circle>` 画插画：墨线描边，`#FFFFFF` 或浅色填充，再垫一个 `stroke="none"` 的浅色背景圆。`Stroke` 在 `live` 为 true 时把自己「画」出来，页面里传 `useIsActivePage()`。`CircleDoodle` 用珊瑚红圈出关键数字；`Sparkle` 是四角星，可当列表符号、里程碑标记或点缀。

```tsx
const Ink = ({
  width,
  height,
  viewBox,
  style,
  wobble = 2.2,
  children,
}: {
  width: number;
  height: number;
  viewBox?: string;
  style?: CSSProperties;
  wobble?: number;
  children: ReactNode;
}) => {
  const id = `fw${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={viewBox ?? `0 0 ${width} ${height}`}
      fill="none"
      stroke="#191919"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={4} />
          <feDisplacementMap in="SourceGraphic" scale={wobble} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </svg>
  );
};

const Stroke = ({
  d,
  live,
  delay = 0.3,
  dur = 0.7,
  color = '#191919',
  width = 3.2,
}: {
  d: string;
  live: boolean;
  delay?: number;
  dur?: number;
  color?: string;
  width?: number;
}) => (
  <path
    d={d}
    pathLength={1}
    strokeDasharray={1}
    stroke={color}
    strokeWidth={width}
    fill="none"
    style={{
      animation: live ? `fw-draw ${dur}s cubic-bezier(0, 0, 0.2, 1) ${delay}s both` : undefined,
    }}
  />
);

const loopPath = (w: number, h: number) => {
  const p = (x: number, y: number) => `${((x * w) / 100).toFixed(1)} ${((y * h) / 100).toFixed(1)}`;
  return `M${p(30, 8)}C${p(55, 2)} ${p(90, 8)} ${p(96, 40)}C${p(100, 70)} ${p(72, 94)} ${p(42, 93)}C${p(14, 92)} ${p(2, 74)} ${p(4, 50)}C${p(6, 26)} ${p(26, 10)} ${p(56, 5)}`;
};

const CircleDoodle = ({
  x,
  y,
  w,
  h,
  live,
  color = '#E8553B',
  delay = 0.4,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  live: boolean;
  color?: string;
  delay?: number;
}) => (
  <Ink width={w} height={h} wobble={1.6} style={{ position: 'absolute', left: x, top: y }}>
    <Stroke d={loopPath(w, h)} color={color} width={3.6} live={live} delay={delay} dur={0.8} />
  </Ink>
);

const Sparkle = ({
  x,
  y,
  s = 1,
  fill = '#F8DA7E',
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -20Q3 -3 20 0Q3 3 0 20Q-3 3 -20 0Q-3 -3 0 -20Z"
    fill={fill}
    strokeWidth={3 / s}
  />
);
```

手绘箭头 / 下划线：一个 `Ink` 盒子里放一两条珊瑚红的 `Stroke`。下划线比如 `M6 22C70 10 140 30 220 16S280 12 292 16`（长度跟着上方文字调）；箭头是在箭杆后面接两笔短线作箭头（`…M22 50L44 30M22 50L50 58`）。

## 动效

- 原则：克制。页面进入时轻轻上浮 5 px，页面激活后墨线批注自己画出来、柱子长出来；没有任何循环动画。
- 关键帧（在模块顶层用带 deck 标识的 `<style>` id 注入一次）：

```css
@keyframes fw-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
@keyframes fw-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes fw-rise { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@keyframes fw-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
```

- 缓动：出 `cubic-bezier(0, 0, 0.2, 1)`，入 `cubic-bezier(0.4, 0, 1, 1)`。画线 0.7–0.8 s，延迟 0.3–1.0 s；柱子用 `fw-rise` / `fw-grow`，0.7 s，`transformOrigin` 分别设为底部 / 左侧。
- 页面里的每个动画都要以 `useIsActivePage()` 为开关，缩略图才会显示画完的状态。
- 翻页过渡：

```tsx
export const transition: SlideTransition = {
  duration: 240,
  exit: {
    duration: 240,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [{ opacity: 1 }, { opacity: 1 }],
  },
  enter: {
    duration: 240,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};
```

- 卡片展开成独立一页时，用 `MorphElement` 包住卡片的浅色底，设 `morph: { duration: 760, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }`；morph 结束后新页面的内容用 `fw-fade` 淡入。

## 气质

一份在 Notion 里写成、再手绘插图的公司经营计划：暖白的纸面，像页面标题一样粗重的黑体大标题，安静的暖灰正文，大量留白。个性来自墨线这一层：抖动的黑色描边小插画（货车、房子、手机、人物、工具箱）坐在柔和的浅色圆上，珊瑚红的圈和箭头潦草地标出关键数字，一句话背后一道黄色荧光笔，偶尔一段宋体引言。每个数字都是真的，并且有明确的负责人。避免：渐变、投影、卡片描边、深色背景、照片、emoji、全大写加字距的标签、同一页里多处珊瑚红互相抢戏，以及用干净几何线条（不抖）画的插画。

## 示例

```tsx
const root: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: '#FFFEFC',
  color: '#191919',
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
  WebkitFontSmoothing: 'antialiased',
};

const Cover: Page = () => (
  <div style={root}>
    <div style={{ ...abs(120, 100), display: 'flex', alignItems: 'center', gap: 14 }}>
      <Mark size={32} />
      <span style={{ fontSize: 30, fontWeight: 700 }}>田野手记</span>
    </div>
    <div style={abs(120, 262)}>
      <Title>
        年度
        <br />
        经营计划。
      </Title>
    </div>
    <p style={{ ...abs(120, 772, 760), margin: 0, fontSize: 34, lineHeight: 1.45, color: '#5F5E5B' }}>
      我们在哪里、要去哪里，以及<Highlight>每一步由谁负责</Highlight>。
    </p>
    <div style={{ ...abs(120, 906), fontSize: 24, color: '#9B9A97' }}>全员会前阅读 · 规划组</div>
    <Footer />
  </div>
);

const Summary: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <div style={abs(120, 116)}>
        <Eyebrow>战略</Eyebrow>
      </div>
      <div style={abs(120, 160)}>
        <Heading>今年押注三件事。</Heading>
      </div>
      <TintCard tint="#E7F3F8" style={abs(120, 330, 536, 610)}>
        …
      </TintCard>
      <CircleDoodle x={710} y={834} w={300} h={104} live={live} />
      <Footer />
    </div>
  );
};
```
