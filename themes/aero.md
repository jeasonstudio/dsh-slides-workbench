---
name: 起跑线
description: 动感的运动发布会风格：亮白底上压电光紫大色块，荧光黄只落在紫块上，窄体斜体数字，所有斜边都切在同一个 12° 角上。
mode: light
---

# 起跑线

改编自 open-slide 官方主题 Aero（MIT），已汉化，只用系统字体，不加载任何外部字体。

## 配色

整套 deck 靠三种基础色撑起来（亮白 / 电光紫 / 墨黑），荧光黄是只活在紫块上的高亮色。电光紫是品牌主色：大数字、通栏色带、整块的紫色区域都用它。**荧光黄绝不直接放在白底上当文字或细线**——它在浅底上读不出来；只在紫块、墨黑上，或作为整块带墨黑字的色带使用。一个观点只配一处荧光黄。

| 角色     | 色值                     | 用途                                                                                     |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| bg       | `#F6F4FF`                | 带一丝紫的亮白，默认页面底色，对应 `design.palette.bg`                                   |
| text     | `#0B0A14`                | 墨黑：亮白底和荧光黄底上的主要文字，对应 `design.palette.text`                           |
| accent   | `#4B1DFF`                | 电光紫（「UV」）：主数字、色带、号码布和眉标色块、整块紫色区域，对应 `design.palette.accent` |
| volt     | `#D8FF2E`                | 荧光黄：只放在紫块上（紫块上的数字、刻度、起跑线），或作带墨黑字的整块色带                 |
| slate    | `#4D4868`                | 灰紫：亮白底上的次要文字、标签、页脚（`TONES.paper.dim`，对 bg 约 7.9:1）                 |
| deep     | `#2A0FA3`                | 深紫：紫块上的速度线                                                                     |
| muted    | `#D3CAFF`                | 淡紫：紫块上的次要文字（`TONES.uv.dim`，对 accent 约 4.7:1）；亮白底上的粗速度线            |
| coral    | `#FF4A3D`                | 热烈的强调色：名次（「第 1」）、纪录数，配墨黑字，每页最多一个色块                       |
| foam     | `#BBAEFF`                | 浅紫：亮白底上的基线柱、对照柱和插画填充                                                 |
| uvA      | `rgba(75,29,255,a)`      | 亮白底上 `0.32–0.45` 作细速度线和分隔线 · `0.12` 作色块（只做装饰，不承载文字）          |
| whiteA   | `rgba(255,255,255,a)`    | 紫块上 `0.92` 作次一级大数字 · `0.45` 作跑道线和分隔线                                   |
| inkA     | `rgba(11,10,20,a)`       | 荧光黄页上：`0.72` 次要文字和说明文字 · `0.24` 未激活的柱和分隔线                        |

### 设计变量与色调

声明 `design` 常量，让 `bg` / `text` / `accent` / 字体 / 封面大标题字号都能在「设计」面板里调；其余都是普通常量。每一页从三种**色调**里选一种，`TONES` 告诉页面外框（页脚、眉标）在这种底色上该用哪些颜色。

```tsx
export const design: DesignSystem = {
  palette: { bg: '#F6F4FF', text: '#0B0A14', accent: '#4B1DFF' },
  fonts: {
    display:
      '"Avenir Next Condensed", "DIN Condensed", "Arial Narrow", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  typeScale: { hero: 460, body: 30 },
  radius: 0,
};

const INK = '#0B0A14';
const VOLT = '#D8FF2E';
const CORAL = '#FF4A3D';
const DEEP = '#2A0FA3';
const SLATE = '#4D4868';
const LAV = '#D3CAFF';
const FOAM = '#BBAEFF';
const WHITE_A = (a: number) => `rgba(255,255,255,${a})`;
const UV_A = (a: number) => `rgba(75,29,255,${a})`;
const INK_A = (a: number) => `rgba(11,10,20,${a})`;

type Tone = 'paper' | 'uv' | 'volt';

const TONES: Record<Tone, { bg: string; fg: string; dim: string; hi: string; hiFg: string }> = {
  paper: {
    bg: 'var(--osd-bg)',
    fg: 'var(--osd-text)',
    dim: SLATE,
    hi: 'var(--osd-accent)',
    hiFg: VOLT,
  },
  uv: { bg: 'var(--osd-accent)', fg: '#FFFFFF', dim: LAV, hi: VOLT, hiFg: INK },
  volt: { bg: VOLT, fg: INK, dim: 'rgba(11,10,20,0.72)', hi: INK, hiFg: VOLT },
};
```

- `paper`：默认。亮白底、墨黑字、灰紫标签，电光紫做数字和色块，号码布 / 眉标是紫底荧光黄字。
- `uv`：整页电光紫、白字、淡紫标签、荧光黄高亮。用在章节过渡、成果 / 证据这些要「砸」一下的页面；页面上半亮白、下半整块紫也可以（见封面）。
- `volt`：荧光黄底、墨黑字。用在实验数据、定价、诉求这些「必须读」的页面。

### 浅底上的规矩

- 原来在暗底上靠发光、白色半透明线撑起来的层次，在亮白底上改成**实色块**：淡紫 `muted` / 浅紫 `foam` 的粗速度线、`UV_A(0.32–0.45)` 的细速度线，以及大面积的电光紫色块。不要投影、不要发光。
- 亮白底上不要用淡紫、浅紫或任何 50% 以下透明度的颜色写字；次要文字一律 `slate`。
- 每页至少有一块电光紫的大色面（数字、色带、整块区域），保证在浅底上仍有冲击力。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 展示字体：`var(--osd-font-display)` → `"Avenir Next Condensed", "DIN Condensed", "Arial Narrow", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。
  - 原版用的是窄体 Barlow Condensed（全部斜体、全大写）。系统里最接近的是 macOS 的 Avenir Next Condensed（有 Heavy Italic），其次是 DIN Condensed、Windows 的 Arial Narrow；它们只覆盖英文和数字，中文自动落到苹方 / 微软雅黑。
  - **原来的气质这样保留**：数字和英文用 `NUM` / `LEAN`，即窄体 Heavy Italic（字重 800）、字距 `-0.015em`、行高 0.9，号码布和终点计时器的感觉全靠它们；中文标题保持正体（字重 700，行高 1.1，字距 `0.02em`），**不要斜体**（伪斜体很难看），也不要用 `skewX` 把中文拉斜。速度感交给 12° 的色块、色带和速度线去表达。
  - 中文大标题要短：封面一行 2 个字 + 一个电光紫数字，章节 / 结尾标题每行不超过 5 个字。
  - 数字后面跟中文单位（「亿」「倍」）时，用 `UNIT` 把单位扶正并缩小到 0.42em，例如 `¥130<span style={UNIT}>亿</span>`。
- 正文字体：`var(--osd-font-body)` → `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。正文字重 500；标签字重 600–700，字距 `0.12em`。原版标签是全大写加宽字距，中文没有大小写，就只保留字距；英文缩写直接写成大写。
- 字号（刻意走极端，覆盖 `slide-authoring` 的默认值）：
  - 封面大标题：**460 px**（`var(--osd-size-hero)`），行高 1，`nowrap`：两个汉字 + 一个电光紫数字。
  - 章节 / 过渡 / 结尾标题：180–220 px。
  - 页面标题：96–132 px（`Title` 默认 132），一行不超过 10 个字。
  - 主数字：280–360 px。次级数字：84–150 px。行内 / 表格内数字：40–104 px。
  - 色带文字和卡片标题：40–92 px 展示字体。
  - 正文：**30 px**，行高 1.4（次要文字 22–26 px）。
  - 标签：20 px（17–24）。脚注 / 小标签：15–16 px。
  - 页脚：标签 17 px，号码布数字 24 px。

## 版式

- 画布：1920 × 1080，用 `abs(x, y)` 辅助函数**绝对定位**——构图是「摆」出来的，不是「流」出来的。
- 左边线 `x = 120`，右边线 `x = 1800`（内容宽 1680）。斜体的英文 / 数字展示字放在左边线往左 4–8 px（`x = 112–116`，封面大标题 96），让斜体的外挑在视觉上和 120 处的标签对齐。
- 纵向节奏：品牌标志 / 眉标一行在 y ≈ 92–104 · 标题在 y ≈ 156–176 · 内容一直到 ≈ 960 · 页脚号码布在 y = 1004（高 32 px）。
- 通栏母题（速度线、色带、起跑线条纹）超出画布（`left: -80`，宽 2080），斜切的两端永远不露出来；`Stage` 用 `overflow: hidden` 裁掉。
- 所有地方圆角都是 0。没有圆角，没有投影，没有渐变。浅底上的层次靠实色块和淡紫色面，不靠阴影。

### 12° 角度系统

一个角度驱动整套 deck 的所有斜边：色块、柱子、色带、速度线、分隔线、图表的柱，连 SVG 的斜纹都是。绝不引入第二个角度。

```tsx
const ANGLE = 12;
const T = Math.tan((ANGLE * Math.PI) / 180);
const SKEW = `skewX(-${ANGLE}deg)`;

const cut = (h: number) => {
  const d = (h * T).toFixed(2);
  return `polygon(${d}px 0, 100% 0, calc(100% - ${d}px) 100%, 0 100%)`;
};

const BAND_RATIO = 12;
const BAND_PCT = ((T / BAND_RATIO) * 100).toFixed(4);
const BAND_CLIP = `polygon(${BAND_PCT}% 0, 100% 0, ${(100 - Number(BAND_PCT)).toFixed(4)}% 100%, 0 100%)`;
```

- `SKEW`：给「只有斜度」的细长元素用——速度线、竖分隔线、三条杠标志、规格刻度。配 `transformOrigin: '0 100%'`，让底部钉在原来的 x 上。**不要用在中文文字上。**
- `cut(h)`：给里面放着正立内容的实心块用（色块、柱子、诉求行、号码布）。传入元素自身的像素高度，裁切偏移是 `h · tan 12°`，所以任何高度的斜度都一样。
- `BAND_CLIP`：标志性的斜切色带（亮白底上用电光紫，紫块上用荧光黄）。高度永远是 `w / BAND_RATIO`；裁切用百分比，所以色带可以缩放，也可以在页面之间 morph，角度不变。
- 在 SVG 图表里，把柱子顶部偏移 `h * T`（平行四边形柱），SVG 图案用 ``patternTransform={`skewX(-${ANGLE})`}`` 斜切。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去。把占位品牌（`疾风`）和页脚标签换成真实的。

### Foundation（基础）

共用的文字样式、辅助函数，以及模块顶层的关键帧注入（把 `<slide-id>` 换成 deck 的文件夹 id）。不加载任何外部字体。

```tsx
import type { CSSProperties, ReactNode } from 'react';

const SLIDE_ID = '<slide-id>';
const STYLE_ID = `osd-styles-${SLIDE_ID}`;
const KEYFRAMES = `
@keyframes ae-run { from { transform: translateX(0) } to { transform: translateX(calc(var(--tile) * -1)) } }
@keyframes ae-in { from { opacity: 0; transform: translateX(-56px) } to { opacity: 1; transform: none } }
@keyframes ae-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ae-pace { to { stroke-dashoffset: -1000 } }
`;

if (typeof document !== 'undefined') {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== KEYFRAMES) style.textContent = KEYFRAMES;
}

// 中文标题保持正体；斜体只给英文和数字（LEAN / NUM），中文单位用 UNIT 扶正
const DISPLAY: CSSProperties = {
  fontFamily: 'var(--osd-font-display)',
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '0.02em',
  margin: 0,
};

const LEAN: CSSProperties = { fontStyle: 'italic', fontWeight: 800 };

const NUM: CSSProperties = {
  ...DISPLAY,
  ...LEAN,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.015em',
  lineHeight: 0.9,
};

const UNIT: CSSProperties = {
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '0.42em',
  letterSpacing: 0,
  marginLeft: '0.06em',
};

const LABEL: CSSProperties = {
  fontFamily: 'var(--osd-font-body)',
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: '0.12em',
  lineHeight: 1.2,
};

const BODY: CSSProperties = {
  fontFamily: 'var(--osd-font-body)',
  fontSize: 30,
  fontWeight: 500,
  lineHeight: 1.4,
  margin: 0,
};

const abs = (left: number, top: number, extra?: CSSProperties): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  ...extra,
});

const pad = (n: number) => String(n).padStart(2, '0');
```

### Title（标题）

绝对定位的展示标题。颜色继承页面色调；入场动画通过 `style` 传入。

```tsx
const Title = ({
  children,
  size = 132,
  x = 116,
  y = 160,
  style,
}: {
  children: ReactNode;
  size?: number;
  x?: number;
  y?: number;
  style?: CSSProperties;
}) => <h2 style={{ ...DISPLAY, ...abs(x, y), fontSize: size, ...style }}>{children}</h2>;
```

### Footer（页脚）

比赛号码布：页码放在斜切的色块里（亮白底上是电光紫块配荧光黄数字），旁边是总页数，再跟品牌 + deck 标题 + 备注标签。通过 `TONES` 适配色调。由 `Stage` 渲染——封面、过渡页、结尾页会关掉它。

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = ({
  tone,
  brand = '疾风',
  title = '赛季计划',
  meta = '2027 · 内部资料',
}: {
  tone: Tone;
  brand?: string;
  title?: string;
  meta?: string;
}) => {
  const { current, total } = useSlidePageNumber();
  const t = TONES[tone];
  return (
    <div
      style={{
        ...LABEL,
        position: 'absolute',
        left: 120,
        right: 120,
        top: 1004,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        fontSize: 17,
        color: t.dim,
        zIndex: 5,
      }}
    >
      <span
        style={{
          ...NUM,
          width: 64,
          height: 32,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: t.hi,
          color: t.hiFg,
          clipPath: cut(32),
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        {pad(current)}
      </span>
      <span style={{ fontVariantNumeric: 'tabular-nums', marginLeft: -8 }}>/ {pad(total)}</span>
      <span style={{ color: t.fg, marginLeft: 14 }}>{brand}</span>
      <span>{title}</span>
      <span style={{ marginLeft: 'auto' }}>{meta}</span>
    </div>
  );
};
```

### Stage（舞台）

每一页的根节点。设置色调背景和文字颜色，并挂上页脚。

```tsx
const Stage = ({
  tone = 'paper',
  footer = true,
  children,
}: {
  tone?: Tone;
  footer?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      background: TONES[tone].bg,
      color: TONES[tone].fg,
      fontFamily: 'var(--osd-font-body)',
    }}
  >
    {children}
    {footer && <Footer tone={tone} />}
  </div>
);
```

### Eyebrow（Kicker 眉标）

一个斜切色块写章节标签，后面跟这一页的主题，用标签字体。每个内容页都放在左上角 `(120, 104)`。

```tsx
const Kicker = ({
  tag,
  children,
  tone = 'paper',
  x = 120,
  y = 104,
}: {
  tag: string;
  children: ReactNode;
  tone?: Tone;
  x?: number;
  y?: number;
}) => {
  const t = TONES[tone];
  return (
    <div
      style={abs(x, y, { ...LABEL, display: 'flex', alignItems: 'center', gap: 18, color: t.fg })}
    >
      <span
        style={{
          ...LABEL,
          height: 32,
          padding: '0 18px',
          display: 'inline-flex',
          alignItems: 'center',
          background: t.hi,
          color: t.hiFg,
          clipPath: cut(32),
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        {tag}
      </span>
      {children}
    </div>
  );
};
```

### Wordmark + Mark（品牌标志）

三条斜杠，透明度逐级递减——品牌的速度标志。封面和结尾页把 Wordmark 放在 `(120, 92)`；单独的 Mark（墨黑，`h={64}`）放在荧光黄色带里。Wordmark 默认墨黑字 + 电光紫三条杠，放在紫块上时传 `color="#FFFFFF" mark={VOLT}`。

```tsx
const Mark = ({ color, h = 34 }: { color: string; h?: number }) => (
  <div style={{ display: 'flex', gap: h * 0.16 }}>
    <div style={{ width: h * 0.3, height: h, background: color, transform: SKEW }} />
    <div style={{ width: h * 0.3, height: h, background: color, transform: SKEW, opacity: 0.7 }} />
    <div style={{ width: h * 0.3, height: h, background: color, transform: SKEW, opacity: 0.4 }} />
  </div>
);

const Wordmark = ({
  x,
  y,
  brand = '疾风',
  color = 'var(--osd-text)',
  mark = 'var(--osd-accent)',
}: {
  x: number;
  y: number;
  brand?: string;
  color?: string;
  mark?: string;
}) => (
  <div style={abs(x, y, { display: 'flex', alignItems: 'center', gap: 18, zIndex: 4 })}>
    <Mark color={mark} />
    <span style={{ ...DISPLAY, fontSize: 44, letterSpacing: '0.06em', color, lineHeight: 1 }}>
      {brand}
    </span>
  </div>
);
```

### Streak（速度线）

一条斜切的虚线速度线，横向循环流动。封面上叠 8–12 条：亮白底上用 `LAV` / `FOAM`（粗、慢）和 `UV_A(0.32–0.45)`（细、快）；紫块上用 `DEEP`。`live` 来自 `useIsActivePage()`。

```tsx
const Streak = ({
  y,
  h,
  tile,
  dash,
  color,
  dur,
  shift = 0,
  live,
}: {
  y: number;
  h: number;
  tile: number;
  dash: number;
  color: string;
  dur: number;
  shift?: number;
  live: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: -80,
      top: y,
      width: 2080,
      height: h,
      overflow: 'hidden',
      transform: SKEW,
    }}
  >
    <div
      style={
        {
          '--tile': `${tile}px`,
          width: 2080 + tile,
          height: h,
          backgroundImage: `linear-gradient(90deg, ${color} 0 ${dash}px, transparent ${dash}px)`,
          backgroundSize: `${tile}px ${h}px`,
          backgroundRepeat: 'repeat-x',
          backgroundPosition: `${shift}px 0`,
          animation: live ? `ae-run ${dur}s linear infinite` : undefined,
        } as CSSProperties
      }
    />
  </div>
);
```

### VoltBand（斜切色带）

标志性的斜切色带——整套 deck 的「那一条线」。亮白底上默认是电光紫（上面写白字，数字用荧光黄）；放在紫块上时传 `color={VOLT}`，上面的字用墨黑。要做封面到下一页的 morph，就用 `<MorphElement id="volt-band">` 包起来（见动效）。

```tsx
const VoltBand = ({
  x,
  y,
  w,
  color = 'var(--osd-accent)',
}: {
  x: number;
  y: number;
  w: number;
  color?: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: w / BAND_RATIO,
      background: color,
      clipPath: BAND_CLIP,
    }}
  />
);
```

### CutBar、SkewRule、Chip、SpecChip

数据柱、分栏线、标签和行内规格刻度——全都在 12° 角上。

```tsx
const CutBar = ({
  x,
  y,
  w,
  h,
  color,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: color,
      clipPath: cut(h),
    }}
  />
);

const SkewRule = ({
  x,
  y,
  h,
  w = 6,
  color = 'var(--osd-accent)',
}: {
  x: number;
  y: number;
  h: number;
  w?: number;
  color?: string;
}) => (
  <div
    style={abs(x, y, {
      width: w,
      height: h,
      background: color,
      transform: SKEW,
      transformOrigin: '0 100%',
    })}
  />
);

const Chip = ({
  children,
  bg = CORAL,
  fg = INK,
  h = 34,
}: {
  children: ReactNode;
  bg?: string;
  fg?: string;
  h?: number;
}) => (
  <span
    style={{
      ...LABEL,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      height: h,
      padding: '0 16px',
      display: 'inline-flex',
      alignItems: 'center',
      background: bg,
      color: fg,
      clipPath: cut(h),
    }}
  >
    {children}
  </span>
);

const SpecChip = ({
  children,
  color = 'var(--osd-accent)',
}: {
  children: ReactNode;
  color?: string;
}) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 22 }}>
    <span style={{ width: 5, height: 24, background: color, transform: SKEW }} />
    {children}
  </span>
);
```

- `CutBar`：横向数据柱。亮白底上 `FOAM` 表示基线，电光紫 `VoltBand`（或电光紫 `CutBar`）表示目标；紫块上基线用 `DEEP`、目标用 `VOLT`；荧光黄页上用 `INK_A(0.24)` 表示「品类平均」。
- `SkewRule`：主数字之间 6 px 的电光紫分隔（紫块上传 `color={VOLT}`）；分栏 / 表格列在亮白底上用 3 px 的 `UV_A(0.32)`，紫块上用 `WHITE_A(0.45)`。
- `Chip`：默认珊瑚红，用于名次和提示；中性代号（国家、尺码）在亮白底上用 `bg={LAV} fg={INK}`，紫块上用 `bg={WHITE_A(0.16)} fg="#FFFFFF"`。
- `SpecChip`：封面色带下方的规格行。第一项不加标记，后面每一项前面带一根斜刻度（默认电光紫；放在紫块上传 `color={VOLT}`，如 `<SpecChip color={VOLT}>38 个市场</SpecChip>`）。

## 动效

- 原则：**丰富，但只在表达速度的地方动。** 封面、过渡页、结尾页会动（循环的速度线、快速切入的大标题、沿跑道跑动的配速光点）；内容页除了 `<Steps>` 逐步出现和一次 morph 之外保持静止。所有运动都是水平的，方向从左到右。所有动画都以 `useIsActivePage()` 为开关，缩略图、总览网格和 PDF 才会显示最终画面。
- 可复用的关键帧（已经在 Foundation 的 `KEYFRAMES` 字符串里）：

```css
@keyframes ae-run { from { transform: translateX(0) } to { transform: translateX(calc(var(--tile) * -1)) } }
@keyframes ae-in { from { opacity: 0; transform: translateX(-56px) } to { opacity: 1; transform: none } }
@keyframes ae-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ae-pace { to { stroke-dashoffset: -1000 } }
```

- `ae-run`：`Streak` 循环，1.3–4.2 s，linear infinite；越细的速度线跑得越快。
- `ae-in`：大标题和标题入场：`ae-in 0.8s ${SNAP} ${delay}s both`，依次错开 0.05 s → 0.18 s。
- `ae-fade`：morph 之后落在柱子上的内容：`ae-fade 0.45s ease-out ${MORPH_MS}ms both`。
- `ae-pace`：沿 SVG 路径跑动的短线（紫块上白色，亮白底上电光紫）（`pathLength={1000}`，`strokeDasharray: '22 228'`，9 s linear infinite）。

缓动与翻页过渡——沿行进方向快速推进 240 ms；离开的页面停住不动，新页面落位：

```tsx
import { type SlideTransition } from '@open-slide/core';

const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const SNAP = 'cubic-bezier(0.16, 1, 0.3, 1)';
const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];
const MORPH_MS = 860;

export const transition: SlideTransition = {
  duration: 240,
  exit: { duration: 240, easing: EASE_IN, keyframes: HOLD },
  enter: {
    duration: 240,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateX(calc(var(--osd-dir, 1) * 10px))' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
  },
};

const morphTransition: SlideTransition = {
  duration: 300,
  exit: { duration: 320, easing: EASE_IN, keyframes: HOLD },
  enter: { duration: 320, easing: EASE_OUT, keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  morph: { duration: MORPH_MS, easing: 'cubic-bezier(0.65, 0, 0.25, 1)' },
};
```

招牌动作：封面上通栏的色带 morph 成下一页的「目标」柱（两边都用 `<MorphElement id="volt-band">` 包起来，设 `Cover.transition = morphTransition`，接收页也设同样的过渡）。

## 气质

运动品牌发布会——比赛日营销战役的视觉语言：亮白像白天的赛道和球鞋发布会的展台，电光紫是品牌的大色块，荧光黄只在紫块上闪一下，数字用窄体斜体排得巨大，就像号码布或终点计时器上那样。所有东西都沿同一个 12° 角向前倾，即使是静止的页面也像在从左往右跑。构图靠「摆」：大数字撑起整页，文字保持简短；中文标题短而重，正体站稳，倾斜交给数字和色块。守住纪律——一种高亮色、一个角度、一种展示字体。避免：圆角、投影、渐变、发光、白底上的荧光黄文字、白底上的淡紫小字、和平涂色打架的照片、中文伪斜体、长句标题、第二个倾斜角度，以及同一页里超过一个珊瑚红元素。

## 示例

```tsx
const Cover: Page = () => {
  const live = useIsActivePage();
  const enter = (delay: number): CSSProperties =>
    live ? { animation: `ae-in 0.8s ${SNAP} ${delay}s both` } : {};
  return (
    <Stage footer={false}>
      <div style={abs(0, 652, { width: 1920, height: 428, background: 'var(--osd-accent)' })} />
      <Streak y={236} h={16} tile={920} dash={560} color={LAV} dur={3.4} shift={-300} live={live} />
      <Streak y={462} h={3} tile={340} dash={120} color={UV_A(0.4)} dur={1.5} live={live} />
      <Streak y={880} h={8} tile={640} dash={260} color={DEEP} dur={2.4} shift={-330} live={live} />
      <Wordmark x={120} y={72} />
      <h1
        style={{
          ...DISPLAY,
          ...abs(96, 136),
          fontSize: 'var(--osd-size-hero)',
          lineHeight: 1,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          ...enter(0.05),
        }}
      >
        开跑 <span style={{ ...NUM, color: 'var(--osd-accent)' }}>27</span>
      </h1>
      <VoltBand x={60} y={680} w={1800} color={VOLT} />
      <div
        style={abs(196, 680, {
          height: 150,
          width: 1528,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: INK,
          ...enter(0.18),
        })}
      >
        <span style={{ ...DISPLAY, fontSize: 92, lineHeight: 1 }}>赛季计划</span>
        <Mark color={INK} h={64} />
        <span style={{ ...DISPLAY, fontSize: 92, lineHeight: 1 }}>
          <span style={LEAN}>2027</span> 春季
        </span>
      </div>
    </Stage>
  );
};

const Results: Page = () => (
  <Stage tone="volt">
    <Kicker tag="实验室" tone="volt">
      实验室数据
    </Kicker>
    <Title size={104}>实验室说：更快了。</Title>
    <div style={abs(120, 320)}>
      <div style={{ ...LABEL, fontSize: 18, fontWeight: 700 }}>跑步经济性</div>
      <div style={{ ...NUM, fontSize: 132, marginTop: 10 }}>+4.1%</div>
      <p style={{ ...BODY, fontSize: 24, color: INK_A(0.72), marginTop: 6 }}>
        同样配速下，耗氧量比上个赛季更低。
      </p>
    </div>
    <CutBar x={760} y={340} w={655} h={44} color="var(--osd-accent)" />
    <CutBar x={760} y={396} w={266} h={44} color={INK} />
    <CutBar x={760} y={452} w={380} h={44} color={INK_A(0.24)} />
  </Stage>
);
```
