---
name: 番茄贴纸
description: 热闹的消费品牌 deck：奶油纸面、粗墨描边、番茄红点睛、贴纸般鲜亮的色块、圆胖的粗体字和带弹性的动效。
mode: light
---

# 番茄贴纸

改编自 open-slide 官方主题 Pommi（MIT），已汉化，只用系统字体，不加载任何外部字体。

## 配色

奶油纸和近黑的墨色撑起结构，番茄红是唯一的强调色。黄油黄、薄荷绿、长春花蓝和粉色是卡片、贴纸、标签和图表的纯色填充——每个填色形状都有 4 px 墨色描边和一道硬投影。

| 角色      | 色值                    | 用途                                                                  |
| --------- | ----------------------- | --------------------------------------------------------------------- |
| bg        | `#FFF3DF`               | 奶油色画布（`design.palette.bg` → `CREAM`）                           |
| text      | `#151313`               | 墨色：文字、描边、投影、胶囊底色（`design.palette.text` → `INK`）     |
| accent    | `#FF5A2C`               | 番茄红：主数字色块、领头贴纸、「你」的标记（`design.palette.accent` → `TOMATO`） |
| butter    | `#FFD23F`               | 眉标默认底色、高亮贴纸、星形点缀                                      |
| mint      | `#7EDDB0`               | 正向 / 「已完成」的填充、次要贴纸                                     |
| peri      | `#98A6FF`               | 冷色填充、封面大色块、第三组数据                                      |
| pink      | `#FFB0D0`               | 第四组数据、小星形点缀                                                |
| paper     | `#FFFCF6`               | 奶油底上的卡片面                                                      |
| white     | `#FFFFFF`               | 只用于聊天气泡一类的表面                                              |
| muted     | `rgba(21, 19, 19, 0.6)` | 说明、等宽标签、脚注（在奶油底上约等于 `#736D65`）                    |
| faint     | `rgba(21, 19, 19, 0.16)`| 虚线分隔、网格线、「未激活」描边（在奶油底上约等于 `#DACFBE`）        |
| heat ramp | `rgba(255, 90, 44, a)`  | 番茄红 0.1–1 透明度，用于热力图格子                                   |

任何色块（番茄红、黄油黄、薄荷绿、长春花蓝、粉色）上的文字一律用墨色，绝不用白色。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 标题与数字（`design.fonts.display`）：`"Arial Rounded MT Bold", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`，字重 700。
  - 原版用的是圆胖的 Gabarito。系统里最接近的是 macOS 自带的 Arial Rounded MT Bold：圆头、笔画粗，数字和英文的憨厚感基本保住。它没有中文字形，中文会自动落到苹方 Semibold / 微软雅黑 Bold。
  - 保留气质靠三件事：字号给足（标题 88–96 px，主角词 250–300 px）、字重 700、配合粗描边和硬投影。不要试图用更细的字或负字距去「收紧」中文。
  - 没装 Arial Rounded 的系统（如 Windows）会直接用黑体，版式不受影响。
- 正文（`design.fonts.body`）：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`，正文字重 500，行内强调 700。
- 标签（等宽）：`"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace`，字重 500，17–20 px，字距 `0.08em`。用于眉标、说明、坐标轴标签、页脚和页码。原版是全大写英文标签；中文没有大小写，直接写简短的中文词，靠等宽字体和字距保持「标签感」。
- 中文排版规则：苹方最粗只有 Semibold，字重写 700 即可；中文不用负字距（统一 `0.01em`，主角词 `0.02em`），纯数字可以用 `-0.02em`；多行标题行高至少 1.1；不要用斜体。
- 字号（与 `slide-authoring` 不同的地方已注明）：
  - 品牌词 / 主角词：250–300 px，字重 700，行高 1.1（`typeScale.hero = 300`，高于默认的 140–200）。中文每字约 1em 宽，左栏 1040 px 里最多放 3 个字。
  - 主数字：180–200 px，行高 0.9，等宽数字。单位（「万」「%」）用一半字号另起 `<span>`，避免中文单位撑爆宽度。
  - 封面 / 结尾标语：64–72 px，字重 700，行高 1.2，每行不超过 10 个字。
  - 页面标题：88–96 px，行高 1.1，每行不超过 8 个字。
  - 卡片标题：46–64 px，标题字体。
  - 统计数字：44–76 px，标题字体。
  - 正文：30 px，字重 500，行高 1.4（`typeScale.body = 30`；卡片里用 28 px）。
  - 行内 UI 标签：20–30 px，字重 700。
  - 等宽标签：16–20 px。脚注：18 px，字重 500，行高 1.4，muted 色。

## 版式

- 画布 1920 × 1080，`overflow: hidden`。所有元素都用 `abs(left, top)` 绝对定位——这是海报式版式，不是流式布局。
- 左右边距 120 px → 内容宽 1680 px。
- 内容页纵向节奏：眉标 `y = 96`（高 46 px），标题 `y = 168`，内容区大约 `y = 330 → 900`，脚注 `y ≈ 898–956`，页脚 `y = 996`（高 44 px）。
- 左右分栏页：左栏 `x = 120`，宽 1000 px；右栏从 1160–1240 开始，到 1800 结束。右栏常放一块大**色板**（宽 620–640 px，圆角 48，4 px 墨色描边），可以从底边出血。
- 封面和结尾页不放页脚，改在 `y = 984` 放一行 muted 色的等宽小字。
- 描边：卡片、色板、贴纸 4 px 墨色；胶囊、标签、小方块 3 px；极小的徽章 2.5 px。
- 投影一律是不带模糊的硬偏移——`shadow(n)` = `n px n px 0 ink`：胶囊 4，贴纸和小方块 5–6，卡片 8，大卡片 10，色板和主角物件 12。
- 圆角：胶囊 999，卡片 20–28（`design.radius = 28`），倾斜大卡片 34，色板 48。
- 倾斜：贴纸 ±4–10°，卡片 ±1–9°。正文表格和图表保持水平。
- 分隔线：卡片内用 `3px dashed faint`；图表网格线用 `2px dashed faint`；柱状图底部一条 4 px 墨色基线。

## 固定组件

可以直接粘贴。先复制设计变量和布局辅助函数，再复制组件，最后复制「动效」里的辅助函数和样式注入。

### 设计变量与布局辅助函数

`CREAM` / `INK` / `TOMATO` 读取每份 deck 的 `design`，这样设计面板可以调整它们。

```tsx
import {
  type DesignSystem,
  type Page,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';

// 只用系统字体，不加载任何外部字体。
// 标题与数字优先用 macOS 自带的 Arial Rounded MT Bold（圆头粗体，最接近原版 Gabarito 的圆胖感），
// 中文字符会自动落到苹方 / 雅黑。
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const ROUNDED = `"Arial Rounded MT Bold", ${SANS}`;
const MONO_FONT = '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

export const design: DesignSystem = {
  palette: { bg: '#FFF3DF', text: '#151313', accent: '#FF5A2C' },
  fonts: {
    display: ROUNDED,
    body: SANS,
  },
  typeScale: { hero: 300, body: 30 },
  radius: 28,
};

const CREAM = 'var(--osd-bg)';
const INK = 'var(--osd-text)';
const TOMATO = 'var(--osd-accent)';
const BUTTER = '#FFD23F';
const MINT = '#7EDDB0';
const PERI = '#98A6FF';
const PINK = '#FFB0D0';
const PAPER = '#FFFCF6';
const MUTED = 'rgba(21, 19, 19, 0.6)';
const FAINT = 'rgba(21, 19, 19, 0.16)';

const BORDER = `4px solid ${INK}`;
const shadow = (n = 8) => `${n}px ${n}px 0 ${INK}`;

const DISPLAY: CSSProperties = {
  fontFamily: 'var(--osd-font-display)',
  fontWeight: 700,
  letterSpacing: '0.01em',
  lineHeight: 1.1,
  margin: 0,
};

const MONO: CSSProperties = {
  fontFamily: MONO_FONT,
  fontWeight: 500,
  fontSize: 17,
  letterSpacing: '0.08em',
  lineHeight: 1.2,
};

const BODY: CSSProperties = {
  fontFamily: 'var(--osd-font-body)',
  fontWeight: 500,
  fontSize: 'var(--osd-size-body)',
  lineHeight: 1.4,
  margin: 0,
  textWrap: 'pretty',
};

const NUM: CSSProperties = { ...DISPLAY, fontVariantNumeric: 'tabular-nums' };

const abs = (left: number, top: number, extra?: CSSProperties): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  ...extra,
});

const pad = (n: number) => String(n).padStart(2, '0');
```

### Title（标题）

绝对定位在标准标题位置。页面激活时上浮进场。

```tsx
const Title = ({
  children,
  live,
  x = 120,
  y = 168,
  size = 88,
  width = 1680,
  delay = 70,
}: {
  children: ReactNode;
  live: boolean;
  x?: number;
  y?: number;
  size?: number;
  width?: number;
  delay?: number;
}) => (
  <h2 style={{ ...DISPLAY, ...abs(x, y), width, fontSize: size, ...rise(live, delay, 40) }}>
    {children}
  </h2>
);
```

### Footer（页脚）

页码从 `useSlidePageNumber()` 取——不要硬写 `pageNum` / `total`。左边是吉祥物标志 + 品牌名，接着是等宽标签，muted 色的备注推到右边，最后是墨色胶囊页码（`03 / 12`）。`brand` / `label` / `note` 换成自己的。

```tsx
const Footer = ({
  brand = '小番茄',
  label = '季度汇报 · 2026',
  note = '内部资料',
}: {
  brand?: string;
  label?: string;
  note?: string;
}) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={abs(120, 996, {
        width: 1680,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        zIndex: 8,
      })}
    >
      <Mark size={34} />
      <span style={{ ...DISPLAY, fontSize: 28 }}>{brand}</span>
      <span style={{ ...MONO, color: MUTED, marginLeft: 18 }}>{label}</span>
      <span style={{ ...MONO, color: MUTED, marginLeft: 'auto', marginRight: 10 }}>{note}</span>
      <span
        style={{
          ...MONO,
          height: 38,
          padding: '0 16px',
          borderRadius: 999,
          background: INK,
          color: CREAM,
          display: 'inline-flex',
          alignItems: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {pad(current)} / {pad(total)}
      </span>
    </div>
  );
};
```

### Eyebrow（眉标）

带编号的章节标签：墨色小格放章节号，黄油黄底放标签，4 px 硬投影。高潮章节（比如最后的诉求）传 `color={TOMATO}`。标签写 2–6 个字的中文短词。

```tsx
const Eyebrow = ({
  n,
  children,
  live,
  x = 120,
  y = 96,
  color = BUTTER,
}: {
  n: string;
  children: ReactNode;
  live: boolean;
  x?: number;
  y?: number;
  color?: string;
}) => (
  <div
    style={abs(x, y, {
      display: 'flex',
      alignItems: 'stretch',
      height: 46,
      border: `3px solid ${INK}`,
      borderRadius: 999,
      background: color,
      boxShadow: shadow(4),
      overflow: 'hidden',
      ...rise(live, 0, 20),
    })}
  >
    <span
      style={{
        ...MONO,
        fontSize: 18,
        padding: '0 14px 0 16px',
        display: 'flex',
        alignItems: 'center',
        background: INK,
        color: CREAM,
      }}
    >
      {n}
    </span>
    <span
      style={{
        ...MONO,
        fontSize: 18,
        padding: '0 20px 0 16px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </span>
  </div>
);
```

### Stage（页面根节点）

每一页都包在它里面；封面和结尾页传 `footer={false}`。

```tsx
const Stage = ({ footer = true, children }: { footer?: boolean; children: ReactNode }) => (
  <div
    className="pm-root"
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      background: CREAM,
      color: INK,
      fontFamily: 'var(--osd-font-body)',
    }}
  >
    {children}
    {footer && <Footer />}
  </div>
);
```

### Mark（吉祥物）

番茄吉祥物：墨线描边的番茄，一片薄荷绿叶子，还有一扇小门。页脚里 34 px，封面 50 px，结尾页 400 px 上下浮动。

```tsx
const Mark = ({ size = 56 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    style={{ display: 'block', overflow: 'visible' }}
  >
    <path
      d="M36.5 13.5 C 38.5 6, 46.5 2.5, 55 4.5 C 53 12, 45 16, 36.5 13.5 Z"
      style={{ fill: MINT, stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' }}
    />
    <path
      d="M32 19 C 32 13, 33 9, 36 6"
      style={{ fill: 'none', stroke: INK, strokeWidth: 4, strokeLinecap: 'round' }}
    />
    <path
      d="M32 19 C 23 13, 6 15, 6 34 C 6 50, 17 60, 25 60 C 28 60, 30 58.5, 32 58.5 C 34 58.5, 36 60, 39 60 C 47 60, 58 50, 58 34 C 58 15, 41 13, 32 19 Z"
      style={{ fill: TOMATO, stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' }}
    />
    <path
      d="M26.5 58.6 V 47 A 5.5 5.5 0 0 1 37.5 47 V 58.6"
      style={{ fill: CREAM, stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' }}
    />
    <path
      d="M15 30 C 15.5 25.5, 18.5 22.5, 22.5 21.5"
      style={{ fill: 'none', stroke: PAPER, strokeWidth: 3.5, strokeLinecap: 'round' }}
    />
  </svg>
);
```

### Sticker（贴纸）

招牌动作：一张倾斜、描边、带硬投影的徽章，「啪」地贴上去，然后一直轻轻晃动。传 `round={232}` 得到圆形贴纸。贴纸上的中文控制在 2–6 个字。

```tsx
const Sticker = ({
  x,
  y,
  r,
  live,
  delay,
  bg,
  children,
  round,
  pad: padding = '14px 26px',
  z = 6,
}: {
  x: number;
  y: number;
  r: number;
  live: boolean;
  delay: number;
  bg: string;
  children: ReactNode;
  round?: number;
  pad?: string;
  z?: number;
}) => (
  <div
    style={
      {
        ...abs(x, y),
        '--r': `${r}deg`,
        transform: `rotate(${r}deg)`,
        zIndex: z,
        ...anim(live, `pm-slap 760ms ${SLAP} ${delay}ms both`),
      } as CSSProperties
    }
  >
    <div
      style={{
        ...anim(live, `pm-wobble 5.2s ease-in-out ${delay + 900}ms infinite`),
        background: bg,
        border: BORDER,
        boxShadow: shadow(6),
        borderRadius: round ? '50%' : 22,
        width: round,
        height: round,
        padding: round ? 0 : padding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  </div>
);
```

### Sparkle（星星）

墨线描边的四角星，弹出后一闪一闪。在贴纸和色板周围撒两三颗，不要更多。

```tsx
const Sparkle = ({
  x,
  y,
  size,
  color = BUTTER,
  live,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  color?: string;
  live: boolean;
  delay: number;
}) => (
  <div
    style={{
      ...abs(x, y),
      width: size,
      height: size,
      ...anim(live, `pm-pop 700ms ${BOUNCY} ${delay}ms both`),
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      style={{
        display: 'block',
        overflow: 'visible',
        ...anim(live, `pm-twinkle 2.8s ease-in-out ${delay + 700}ms infinite`),
      }}
    >
      <path
        d="M20 2 C 22 14, 26 18, 38 20 C 26 22, 22 26, 20 38 C 18 26, 14 22, 2 20 C 14 18, 18 14, 20 2 Z"
        style={{ fill: color, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' }}
      />
    </svg>
  </div>
);
```

### Chip（胶囊标签）

放在标语下方的纸色胶囊，写事实信息（数量、市场、联系方式）。

```tsx
const Chip = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      height: 52,
      padding: '0 22px',
      border: `3px solid ${INK}`,
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 24,
      fontWeight: 700,
      background: PAPER,
    }}
  >
    {children}
  </span>
);
```

### StatRow（数字行）

左边一块彩色数字区的纸卡——「三个数字」页面的主力组件。按 156 px 间距堆叠（`y = 420, 576, 732`）。右侧说明 30 px，一行约 22 个字，最多两行。

```tsx
const StatRow = ({
  x = 120,
  y,
  n,
  color,
  live,
  delay,
  children,
}: {
  x?: number;
  y: number;
  n: string;
  color: string;
  live: boolean;
  delay: number;
  children: ReactNode;
}) => (
  <div
    style={abs(x, y, {
      width: 1000,
      height: 132,
      display: 'flex',
      border: BORDER,
      borderRadius: 28,
      background: PAPER,
      boxShadow: shadow(8),
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...anim(live, `pm-in-l 900ms ${SNAPPY} ${delay}ms both`),
    })}
  >
    <div
      style={{
        width: 250,
        flex: 'none',
        background: color,
        borderRight: BORDER,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 30,
        boxSizing: 'border-box',
      }}
    >
      <span style={{ ...NUM, fontSize: 72, letterSpacing: '-0.02em' }}>{n}</span>
    </div>
    <p style={{ ...BODY, padding: '0 36px', alignSelf: 'center' }}>{children}</p>
  </div>
);
```

### TiltCard（倾斜卡片）

带墨色编号徽章和大标题的彩色大卡片，倾斜着贴上去。三张扇形排开，适合「怎么运作」或功能介绍页。210 px 高的卡片里，标题 2–3 个字，正文一行（约 15 个字）。

```tsx
const TiltCard = ({
  x,
  y,
  r,
  color,
  n,
  title,
  live,
  delay,
  width = 360,
  height = 420,
  children,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  n: string;
  title: string;
  live: boolean;
  delay: number;
  width?: number;
  height?: number;
  children: ReactNode;
}) => (
  <div
    style={
      {
        ...abs(x, y),
        '--r': `${r}deg`,
        transform: `rotate(${r}deg)`,
        width,
        height,
        boxSizing: 'border-box',
        padding: 28,
        background: color,
        border: BORDER,
        borderRadius: 34,
        boxShadow: shadow(10),
        display: 'flex',
        flexDirection: 'column',
        ...anim(live, `pm-slap 760ms ${SLAP} ${delay}ms both`),
      } as CSSProperties
    }
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span
        style={{
          ...MONO,
          fontSize: 18,
          width: 52,
          height: 52,
          flex: 'none',
          borderRadius: '50%',
          background: INK,
          color: CREAM,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </span>
      <span style={{ ...DISPLAY, fontSize: 60 }}>{title}</span>
    </div>
    <p style={{ ...BODY, fontSize: 28, marginTop: 20, lineHeight: 1.35 }}>{children}</p>
  </div>
);
```

### DropWord（掉落主角词）

主角词：每个字带着重力回弹掉下来，落地时被压扁一下。只用于一个很短的词（中文 2–3 个字，可以带一个「！」），字号 250–300 px。

```tsx
const DropWord = ({
  text,
  size,
  live,
  delay = 0,
}: {
  text: string;
  size: number;
  live: boolean;
  delay?: number;
}) => {
  const letters = Array.from(text, (ch, i) => ({ ch, id: `${i}-${ch}` }));
  return (
    <div
      style={{
        ...DISPLAY,
        fontSize: size,
        letterSpacing: '0.02em',
        lineHeight: 1.1,
        display: 'flex',
        whiteSpace: 'nowrap',
      }}
    >
      {letters.map((l, i) => {
        const d = delay + i * 85;
        return (
          <span
            key={l.id}
            style={{
              display: 'inline-block',
              ...(live
                ? ({
                    animation: `pm-drop 940ms ${DROP} ${d}ms both`,
                    '--pm-from': '-1.6em',
                  } as CSSProperties)
                : {}),
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transformOrigin: '50% 88%',
                ...anim(live, `pm-squash 560ms ease-out ${d + Math.round(940 * DROP_LAND)}ms both`),
              }}
            >
              {l.ch}
            </span>
          </span>
        );
      })}
    </div>
  );
};
```

### Footnote（脚注）

```tsx
const Footnote = ({
  x = 120,
  y,
  width = 1680,
  children,
}: {
  x?: number;
  y: number;
  width?: number;
  children: ReactNode;
}) => (
  <p style={{ ...BODY, ...abs(x, y), width, fontSize: 18, lineHeight: 1.4, color: MUTED }}>
    {children}
  </p>
);
```

## 动效

- 原则：**丰富**——一切都有重量：字会掉落并压扁，贴纸会拍上去再晃动，卡片弹进来，主数字从 0 数上去，落定时「咚」地一震；但动画只在页面激活时播放（`useLive`），所以缩略图、总览和 PDF 都显示最终画面。
- 缓动：用物理曲线生成 CSS `linear()`——`BOUNCY`（弹簧，ζ 0.38）用于弹出和柱子，`SNAPPY`（弹簧，ζ 0.62）用于上浮和滑入，`DROP`（带两次回弹的重力）用于掉落物，`SLAP` 三次贝塞尔用于贴纸。
- 编排：眉标 0 ms，标题约 70 ms，内容依次错开 120–150 ms，贴纸和星星最后出场（1.2–2.5 s）。数字递增用四次方缓出，约 1.6 s；数字落定时触发 `pm-thunk`。
- 翻页过渡：240 ms——离开的页面保持不动，进入的页面上浮 8 px 淡入。
- `prefers-reduced-motion` 会关闭 `.pm-root` 下的所有动画。

缓动生成函数，以及 live / 数字递增辅助函数：

```tsx
const springAt = (t: number, zeta: number, omega: number) => {
  if (t >= 1) return 1;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp(-zeta * omega * t);
  return 1 - decay * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
};

// 重力下落，带两次逐渐变小的回弹；和弹簧不同，它不会穿过地面。
const dropAt = (t: number) => {
  const e = 0.3;
  const segs = [1, 2 * e, 2 * e * e];
  const total = segs[0] + segs[1] + segs[2];
  let u = t * total;
  if (u <= 1) return u * u;
  u -= 1;
  for (let k = 1; k < segs.length; k++) {
    if (u <= segs[k]) {
      const x = u / segs[k];
      return 1 - e ** (2 * k) * 4 * x * (1 - x);
    }
    u -= segs[k];
  }
  return 1;
};
const DROP_LAND = 1 / (1 + 0.6 + 0.18);

const toLinear = (f: (t: number) => number, n: number) =>
  `linear(${Array.from({ length: n + 1 }, (_, i) => Number(f(i / n).toFixed(4))).join(', ')})`;

const BOUNCY = toLinear((t) => springAt(t, 0.38, 15), 64);
const SNAPPY = toLinear((t) => springAt(t, 0.62, 10.5), 48);
const DROP = toLinear(dropAt, 72);
const SLAP = 'cubic-bezier(0.2, 0.8, 0.3, 1)';

const anim = (live: boolean, value: string): CSSProperties => (live ? { animation: value } : {});

const rise = (live: boolean, delay = 0, dist = 32): CSSProperties =>
  live
    ? ({
        animation: `pm-rise 820ms ${SNAPPY} ${delay}ms both`,
        '--pm-rise': `${dist}px`,
      } as CSSProperties)
    : {};

const useLive = () => {
  const active = useIsActivePage();
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return active && !reduced;
};

const useCount = (target: number, live: boolean, delay: number, dur = 1700) => {
  const [value, setValue] = useState(live ? 0 : target);
  useEffect(() => {
    if (!live) {
      setValue(target);
      return;
    }
    setValue(0);
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      setValue(target * (1 - (1 - p) ** 4));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, target, delay, dur]);
  return value;
};
```

关键帧在模块顶层注入一次（id 换成你自己 deck 的标识）。不需要注入任何字体：

```tsx
const SLIDE_ID = 'theme-pommi';
const STYLE_ID = `osd-styles-${SLIDE_ID}`;

const CSS = `
@keyframes pm-rise { from { opacity: 0; transform: translateY(var(--pm-rise, 32px)) } to { opacity: 1; transform: translateY(0) } }
@keyframes pm-in-l { from { opacity: 0; transform: translateX(-90px) } to { opacity: 1; transform: translateX(0) } }
@keyframes pm-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes pm-drop { from { transform: translateY(var(--pm-from, -320px)) } to { transform: translateY(0) } }
@keyframes pm-pop { from { opacity: 0; transform: scale(0) } to { opacity: 1; transform: scale(1) } }
@keyframes pm-pop-b { from { opacity: 0; transform: translateY(20px) scale(0.55) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes pm-squash { 0% { transform: scale(1, 1) } 26% { transform: scale(1.14, 0.82) } 56% { transform: scale(0.96, 1.05) } 100% { transform: scale(1, 1) } }
@keyframes pm-slap {
  0% { opacity: 0; transform: rotate(calc(var(--r) - 24deg)) scale(1.9) }
  42% { opacity: 1; transform: rotate(calc(var(--r) + 4deg)) scale(0.88, 0.84) }
  70% { opacity: 1; transform: rotate(calc(var(--r) - 1.5deg)) scale(1.04) }
  100% { opacity: 1; transform: rotate(var(--r)) scale(1) }
}
@keyframes pm-wobble { 0%, 100% { transform: rotate(0deg) } 50% { transform: rotate(2.6deg) } }
@keyframes pm-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
@keyframes pm-twinkle { 0%, 100% { transform: scale(1) rotate(0deg) } 50% { transform: scale(0.7) rotate(25deg) } }
@keyframes pm-thunk { 0% { transform: scale(1) } 24% { transform: scale(1.07) rotate(-1.4deg) } 58% { transform: scale(0.985) rotate(0.4deg) } 100% { transform: scale(1) } }

@media (prefers-reduced-motion: reduce) {
  .pm-root *, .pm-root *::before, .pm-root *::after { animation: none !important; transition: none !important; }
}
`;

if (typeof document !== 'undefined') {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== CSS) style.textContent = CSS;
}
```

可选的翻页过渡：

```tsx
import type { SlideTransition } from '@open-slide/core';

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
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};
```

## 气质

一份像贴纸册一样的消费类 App 路演 deck：温暖的奶油纸，每个形状都有粗墨描边，糖果般的纯色填充（番茄红、黄油黄、薄荷绿、长春花蓝、粉色），加上不带模糊的硬投影，让卡片看起来像模切出来、一张张叠在一起。字又大又粗，等宽标签让信息保持清楚。版式像海报——大块绝对定位的色块、右边一块彩色色板、几张倾斜的贴纸和星星打破网格——动效带弹性、有物理感，好像所有东西都是被扔到页面上的。避免：渐变、柔和或模糊的投影、毛玻璃、细线描边、色块上的白字、照片、深色模式，以及一页里出现多个番茄红主角。如果它能做成一张贴在笔记本盖子上的模切贴纸，那就对味了。

## 示例

```tsx
const Content: Page = () => {
  const live = useLive();
  const count = useCount(412, live, 600, 1600);
  return (
    <Stage>
      <Eyebrow n="01" live={live}>
        本季亮点
      </Eyebrow>
      <Title live={live} size={92} width={1000}>
        这个季度，
        <br />
        看三个数字。
      </Title>
      <StatRow y={420} n="3.4×" color={TOMATO} live={live} delay={260}>
        周活跃用户是去年同期的 3.4 倍
      </StatRow>
      <StatRow y={576} n="61%" color={BUTTER} live={live} delay={380}>
        的新注册用户来自好友的邀请链接
      </StatRow>
      <StatRow y={732} n="4 秒" color={PERI} live={live} delay={500}>
        完成一次下单的中位用时，原来要 11 秒
      </StatRow>
      <Footnote y={898} width={1000}>
        示意数据，仅用于主题预览，请换成你自己的数字和来源。
      </Footnote>

      <div
        style={abs(1220, 330, {
          width: 580,
          height: 520,
          boxSizing: 'border-box',
          padding: '40px 44px',
          background: PAPER,
          border: BORDER,
          borderRadius: 34,
          boxShadow: shadow(10),
          display: 'flex',
          flexDirection: 'column',
          ...rise(live, 160, 60),
        })}
      >
        <span style={{ ...MONO, color: MUTED }}>月活跃家庭</span>
        <span
          style={{
            ...NUM,
            fontSize: 190,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            marginTop: 24,
            transformOrigin: '0% 80%',
            ...anim(live, 'pm-thunk 620ms ease-out 2200ms both'),
          }}
        >
          {Math.round(count)}
          <span style={{ fontSize: 88, marginLeft: 8, letterSpacing: 0 }}>万</span>
        </span>
        <p style={{ ...BODY, fontWeight: 700, marginTop: 26 }}>
          个家庭每个月至少打开一次小番茄。
        </p>
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 22,
            borderTop: `3px dashed ${FAINT}`,
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
          }}
        >
          <span style={{ ...NUM, fontSize: 44 }}>+3.1×</span>
          <span style={{ ...MONO, fontSize: 18, color: MUTED }}>同比</span>
        </div>
      </div>
      <Sticker x={1580} y={286} r={6} live={live} delay={2300} bg={MINT} pad="10px 20px">
        <span style={{ fontSize: 24, fontWeight: 700 }}>64% 自然增长</span>
      </Sticker>
      <Sparkle x={1180} y={296} size={40} live={live} delay={2450} />
    </Stage>
  );
};
```
