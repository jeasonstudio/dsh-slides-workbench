---
name: 暗夜季刊
description: 深色杂志风：暖黑纸面、宋体大标题、琥珀色超大卷号、刊头与双线、首字下沉和引言块，像一本高端季刊的深色特刊。
mode: dark
---

# 暗夜季刊

改编自 open-slide 官方主题 Editorial Noir（MIT），已汉化并重做版式，只用系统字体，不加载任何外部字体和图片。参照 Kinfolk、The Gentlewoman、《单读》这类印刷杂志：画面靠杂志的版式元素撑起来——超大的琥珀色卷号、刊头双线、多栏正文、首字下沉、大引号引言块、目录式列表、页边竖排小字，全部用 CSS / SVG 画出。

## 配色

暖黑底而不是死黑，叠一层极淡的纸张颗粒和暗角。文字分三级：暖白标题、暖灰正文、灰褐元信息，都要在黑底上看得清。琥珀色是唯一的强调色，每页集中在一个大面积的构图元素（卷号 / 章节号 / 引号）上，其余只做眉标、页码这类小点缀。

| 角色   | 色值      | 用途                                                   |
| ------ | --------- | ------------------------------------------------------ |
| bg     | `#14110e` | 暖黑页面底色（不要用 `#000` 或冷调近黑）               |
| text   | `#f3ead9` | 暖白：标题、刊名、引文、当前页码                       |
| body   | `#cfc5b3` | 暖灰：正文、副标题                                     |
| muted  | `#9a8f7e` | 灰褐：眉标以外的元信息、页脚、竖排小字、出处（≥ 20 px） |
| accent | `#d6a64b` | 琥珀：超大数字、眉标、首字下沉、大引号、页码前短线     |
| rule   | `#3a3229` | 细线：书眉线、栏间线、目录行线、版权框                 |

刊头双线用 `text` 色（3 px + 1 px），是全套唯一的粗线。目录的点线引导用 `#5a4f42`。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 标题、刊名、数字、引文（衬线）：`"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif`，字重 700（引文、目录标题 600）。
- 正文与元信息（无衬线）：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`，字重 400；眉标 600。
- 中文不用负字距、不用斜体；标题字距 `0.02em`。只有超大数字 `Numeral` 用 `-0.02em`（纯阿拉伯数字）。页面根节点设 `fontVariantNumeric: 'tabular-nums'`。
- 字号：
  - 封面大标题：156 px，行高 1.18，两行，每行不超过 5 个字。
  - 结尾大标题：136 px。
  - 内页标题：58 px 宋体，行高 1.36，在窄栏里手动断成 3–4 行。
  - 超大数字：封面卷号 800 px，结尾空心卷号 800 px，内页章节号 240 px，行高 0.8。
  - 刊名（刊头里）：52 px 宋体，字距 `0.6em`。
  - 引文：48 px 宋体 600，行高 1.5；大引号 220 px。
  - 首字下沉：132 px 宋体，占三行正文。
  - 正文：28–32 px，行高 1.7；副标题 32 px。
  - 目录标题：34 px 宋体（封面要目 30 px）。
  - 眉标：24 px，字重 600，字距 `0.24em`。
  - 元信息（书眉、页脚、出处、署名）：22 px；竖排小字、版权框、要目小标签：20 px。**任何文字不小于 20 px。**

## 版式

- 画布 1920 × 1080，所有元素按固定网格绝对定位。左边距 `X0 = 120`，内容宽 `W = 1680`，右边距 120；页边竖排小字放在 `x = 52`（左）或 `x = 1846`（右）的边距里。
- 纵向节奏：刊头 / 书眉 `top: 56–64`，主体从 `top: 170–270` 开始，最晚在 ~960 结束，页脚 `top: 1000`。
- 三种页面结构，不要三页长得一样：
  - **封面**：顶部通栏刊头（细线 + 刊名 + 3 px/1 px 双线）。左半（`x 120–960`）眉标 → 两行大标题 → 副标题 → 一条细线下三栏「封面要目」（`P.02 编者按 / 少做一点`）。右半（`x ≈ 1010–1730`）一个实心琥珀色超大卷号压住画面，下方一条与要目对齐的细线和卷信息。右边距一行竖排英文 + 中文。
  - **内页（编者按）**：书眉线。左窄栏（`x 120–580`）章节号 + 100 px 琥珀短线 + 3–4 行宋体标题 + 署名；`x = 620` 一条竖线分栏；右侧（`x 680–1800`）两栏正文（`columnCount: 2`，栏距 72，栏间细线，两端对齐，首段首字下沉，其余段首缩进 2 字），下方细线后接通栏引言块。左边距竖排卷期信息。
  - **结尾**：左侧一个描边空心的下期卷号，下面一个细线框的版权信息（2 × 2）。右栏（`x 1040–1800`）眉标 → 两行大标题 → 两行正文 → 「下期要目」目录列表。右边距竖排小字。
- 留白要有意图：大块空白只留在大数字周围；文字块之间用细线和网格对齐，而不是空着。
- 定位辅助函数和根节点：

```tsx
const abs = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
  height,
});

const root: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: BG,
  color: TEXT,
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
};
```

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去（`import { type Page, useIsActivePage, useSlidePageNumber } from '@open-slide/core';`、`import { type CSSProperties, type ReactNode, useId } from 'react';`）。

```tsx
// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const SERIF = '"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif';

const BG = '#14110e';
const TEXT = '#f3ead9';
const BODY = '#cfc5b3';
const MUTED = '#9a8f7e';
const ACCENT = '#d6a64b';
const RULE = '#3a3229';

const X0 = 120;
const W = 1680;
```

### Paper（纸张颗粒 + 暗角）

每页根节点里第一个子元素。颗粒是内联 SVG 噪点（不是图片），暗角是一层径向渐变——这是本主题唯一允许的渐变。

```tsx
// 纸张颗粒 + 暗角：每页最底层铺一次
const Paper = () => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <svg
        aria-hidden="true"
        width={1920}
        height={1080}
        style={{ ...abs(0, 0), opacity: 0.07, mixBlendMode: 'screen', pointerEvents: 'none' }}
      >
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
      </svg>
      <div
        style={{
          ...abs(0, 0, 1920, 1080),
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </>
  );
};
```

### Masthead（刊头，封面用）

上细线、刊名居中、左右是卷期信息、下面 3 px + 1 px 双线。刊名「暗夜季刊」换成自己的。

```tsx
// 刊头：上下双线夹住刊名，左右是卷期信息
const Masthead = ({ left, right }: { left: ReactNode; right: ReactNode }) => (
  <div style={abs(X0, 56, W)}>
    <div style={{ borderTop: `1px solid ${RULE}` }} />
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 96,
        fontSize: 22,
        letterSpacing: '0.2em',
        color: MUTED,
      }}
    >
      <span style={{ width: 480 }}>{left}</span>
      <span
        style={{
          fontFamily: SERIF,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: '0.6em',
          marginRight: '-0.6em',
          color: TEXT,
        }}
      >
        暗夜季刊
      </span>
      <span style={{ width: 480, textAlign: 'right' }}>{right}</span>
    </div>
    <div style={{ borderTop: `3px solid ${TEXT}` }} />
    <div style={{ borderTop: `1px solid ${TEXT}`, marginTop: 5 }} />
  </div>
);
```

### RunningHead（书眉，内页用）

```tsx
// 内页书眉：一条细线，左栏目名、右刊名
const RunningHead = ({ section }: { section: ReactNode }) => (
  <div
    style={{
      ...abs(X0, 64, W),
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: 18,
      borderBottom: `1px solid ${RULE}`,
      fontSize: 22,
      letterSpacing: '0.2em',
    }}
  >
    <span style={{ color: ACCENT, fontWeight: 600 }}>{section}</span>
    <span style={{ color: MUTED }}>暗夜季刊 · 第 04 卷 · 二〇二六 冬</span>
  </div>
);
```

### Footer（页脚）

左边是刊名 / 栏目，右边一条琥珀短线 + 当前页（暖白）/ 总页数（灰褐）。

```tsx
const Footer = ({ label = '暗夜季刊 · 年度回顾' }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return (
    <div
      style={{
        ...abs(X0, 1000, W),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 22,
        letterSpacing: '0.18em',
        color: MUTED,
      }}
    >
      <span>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ width: 48, height: 1, background: ACCENT }} />
        <span style={{ color: TEXT }}>{pad2(current)}</span>
        <span>/ {pad2(total)}</span>
      </span>
    </div>
  );
};
```

### Eyebrow（眉标）与 Title（大标题）

```tsx
const Eyebrow = ({ children, color = ACCENT }: { children: ReactNode; color?: string }) => (
  <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: '0.24em', color }}>
    {children}
  </div>
);

const Title = ({ children, size = 156 }: { children: ReactNode; size?: number }) => (
  <h1
    style={{
      margin: 0,
      fontFamily: SERIF,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.18,
      letterSpacing: '0.02em',
      color: TEXT,
    }}
  >
    {children}
  </h1>
);
```

### Numeral（超大卷号 / 章节号）

琥珀色宋体数字，是每页的构图主体。封面用实心 800 px，结尾用 `outline` 空心 800 px，内页章节号 240 px。每页最多一个。

```tsx
// 超大卷号 / 章节号：琥珀色宋体数字，作为构图主体。outline 为描边空心字
const Numeral = ({
  children,
  size,
  outline = false,
  style,
}: {
  children: ReactNode;
  size: number;
  outline?: boolean;
  style?: CSSProperties;
}) => (
  <div
    aria-hidden="true"
    style={{
      fontFamily: SERIF,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 0.8,
      letterSpacing: '-0.02em',
      color: outline ? 'transparent' : ACCENT,
      WebkitTextStroke: outline ? `2px ${ACCENT}` : undefined,
      userSelect: 'none',
      ...style,
    }}
  >
    {children}
  </div>
);
```

### SideNote（页边竖排小字）

```tsx
// 页边竖排小字
const SideNote = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <div
    style={{
      ...abs(x, y),
      writingMode: 'vertical-rl',
      fontFamily: SANS,
      fontSize: 20,
      letterSpacing: '0.32em',
      color: MUTED,
    }}
  >
    {children}
  </div>
);
```

### DropCap（首字下沉）

放在首段 `<p>` 的最前面，首字选笔画饱满的字（避免「一」「了」这类单薄的字）。

```tsx
// 首字下沉：占三行正文
const DropCap = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      float: 'left',
      fontFamily: SERIF,
      fontSize: 132,
      fontWeight: 700,
      lineHeight: 1,
      color: ACCENT,
      margin: '6px 18px 0 0',
    }}
  >
    {children}
  </span>
);
```

### PullQuote（引言块）

```tsx
// 引言块：大号琥珀色引号 + 宋体引文 + 出处
const PullQuote = ({ children, cite }: { children: ReactNode; cite: ReactNode }) => (
  <figure style={{ margin: 0, position: 'relative', paddingLeft: 140 }}>
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: -6,
        top: -34,
        fontFamily: SERIF,
        fontSize: 220,
        fontWeight: 700,
        lineHeight: 1,
        color: ACCENT,
      }}
    >
      “
    </span>
    <blockquote
      style={{
        margin: 0,
        fontFamily: SERIF,
        fontSize: 48,
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        color: TEXT,
      }}
    >
      {children}
    </blockquote>
    <figcaption style={{ marginTop: 20, fontSize: 22, letterSpacing: '0.16em', color: MUTED }}>
      {cite}
    </figcaption>
  </figure>
);
```

### TocRow（目录行）

页码（琥珀宋体）· 标题（暖白宋体）· 点线引导 · 作者。外面包一个宽 760 左右的容器，上方放 20 px 的小标签（如「下期要目」）。

```tsx
// 目录行：页码 · 标题 · 点线引导 · 作者
const TocRow = ({ num, title, by }: { num: string; title: string; by: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 28,
      padding: '18px 0',
      borderBottom: `1px solid ${RULE}`,
    }}
  >
    <span style={{ width: 56, fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: ACCENT }}>{num}</span>
    <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: TEXT }}>{title}</span>
    <span style={{ flex: 1, borderBottom: '2px dotted #5a4f42', transform: 'translateY(-8px)' }} />
    <span style={{ fontSize: 22, letterSpacing: '0.12em', color: MUTED }}>{by}</span>
  </div>
);
```

## 动效

- 原则：克制，没有任何循环动画。文字轻轻上浮 18 px，大数字慢慢淡入，琥珀短线从左画出。
- 关键帧（在模块顶层用带 deck 标识的 `<style>` id 注入一次）：

```tsx
const STYLE_ID = 'osd-styles-theme-editorial-noir';
const KEYFRAMES = `
@keyframes en-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes en-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes en-draw { from { transform: scaleX(0) } to { transform: scaleX(1) } }
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
```

- 页面里的每个动画都要以 `useIsActivePage()` 为开关，缩略图才会显示终态：

```tsx
// 进场动画：只在页面激活时播放，缩略图直接显示终态
const rise = (live: boolean, delay = 0): CSSProperties =>
  live ? { animation: `en-rise 700ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms both` } : {};
const fade = (live: boolean, delay = 0, dur = 1200): CSSProperties =>
  live ? { animation: `en-fade ${dur}ms ease-out ${delay}ms both` } : {};
```

- 用法：`const live = useIsActivePage();`，然后 `style={{ ...abs(X0, 268), ...rise(live, 200) }}`。先标题（100–300 ms），再副文（450 ms），最后要目 / 目录（500–700 ms）；大数字 `fade(live, 0–100, 1600)`。短线：`transformOrigin: 'left'`，`animation: 'en-draw 700ms ease-out 200ms both'`。页脚、书眉、刊头保持不动。

## 气质

一本认真印刷的深色季刊：暖黑的纸、暖白的宋体、一种琥珀色的金属感。画面由杂志的版式语言撑起——刊头双线、超大卷号、多栏正文、首字下沉、大引号、目录点线、页边竖排小字——每页都有一个大面积的琥珀色锚点，其余全部克制。文案像编者写给读者的信，安静、具体、有一点文学感。避免：死黑或冷蓝调的底色、投影、发光、除暗角外的渐变、大于 4 px 的圆角、emoji、图片和外部资源、居中的标题、中文斜体和负字距、小于 20 px 的文字、同一页里两个以上的大琥珀元素、只有一行标题加一句话的空页面。

## 示例

封面、编者按、结尾三页（依赖上面的全部固定组件）：

```tsx
const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <Paper />
      <Masthead left="第 04 卷 · 总第 16 期" right="二〇二六 · 冬季号" />
      <Numeral size={800} style={{ ...abs(1010, 236), ...fade(live, 100, 1600) }}>
        04
      </Numeral>
      <div
        style={{
          ...abs(1010, 852, 720),
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${RULE}`,
          paddingTop: 22,
          fontSize: 20,
          letterSpacing: '0.2em',
          color: MUTED,
          ...fade(live, 700),
        }}
      >
        <span>
          <span style={{ color: ACCENT, fontWeight: 600 }}>VOL. 04</span>　本卷 16 篇 · 对谈 3 场
        </span>
        <span>定价 ¥ 68</span>
      </div>
      <SideNote x={1846} y={260}>
        ANNUAL REVIEW · 年度回顾特刊
      </SideNote>
      <div style={{ ...abs(X0, 268), ...rise(live, 200) }}>
        <Eyebrow>年度回顾 · 编者特辑</Eyebrow>
      </div>
      <div style={{ ...abs(X0, 318), ...rise(live, 300) }}>
        <Title>
          安静之年
          <br />
          的轮廓。
        </Title>
      </div>
      <p
        style={{
          ...abs(X0, 712, 820),
          margin: 0,
          fontSize: 32,
          lineHeight: 1.7,
          color: BODY,
          ...rise(live, 450),
        }}
      >
        回望这一年里，那些我们没有声张、却认真交付的工作，以及被我们亲手划掉的那些。
      </p>
      <div
        style={{
          ...abs(X0, 852, 860),
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          borderTop: `1px solid ${RULE}`,
          paddingTop: 22,
          ...fade(live, 700),
        }}
      >
        {[
          ['02', '编者按', '少做一点'],
          ['14', '长清单', '没有上线的'],
          ['38', '对谈', '慢的价值'],
        ].map(([n, k, t]) => (
          <div key={n}>
            <div style={{ fontSize: 20, letterSpacing: '0.2em', color: MUTED }}>
              <span style={{ color: ACCENT, fontWeight: 600 }}>P.{n}</span>　{k}
            </div>
            <div style={{ marginTop: 6, fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: TEXT }}>{t}</div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

const EditorsNote: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <Paper />
      <RunningHead section="编者按 · EDITOR’S NOTE" />
      <SideNote x={52} y={180}>
        第 04 卷 · 二〇二六 · 编者按
      </SideNote>
      <Numeral size={240} style={{ ...abs(X0 - 8, 176), ...fade(live, 0) }}>
        01
      </Numeral>
      <div
        style={{
          ...abs(X0, 400, 100, 2),
          background: ACCENT,
          transformOrigin: 'left',
          ...(live ? { animation: 'en-draw 700ms ease-out 200ms both' } : {}),
        }}
      />
      <h2
        style={{
          ...abs(X0, 440, 460),
          margin: 0,
          fontFamily: SERIF,
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.36,
          letterSpacing: '0.02em',
          color: TEXT,
          ...rise(live, 150),
        }}
      >
        今年做的事
        <br />
        更少了，
        <br />
        但每一件都
        <br />
        更值得。
      </h2>
      <div style={{ ...abs(X0, 800, 440), fontSize: 22, lineHeight: 1.8, letterSpacing: '0.1em', color: MUTED }}>
        <div>
          文 / <span style={{ color: TEXT }}>林间</span>　本刊主编
        </div>
        <div>二〇二六年十二月 · 于杭州</div>
      </div>
      <div style={{ ...abs(620, 176, 1, 790), background: RULE }} />
      <div
        style={{
          ...abs(680, 176, 1120),
          columnCount: 2,
          columnGap: 72,
          columnRule: `1px solid ${RULE}`,
          fontSize: 28,
          lineHeight: 1.7,
          color: BODY,
          textAlign: 'justify',
          ...fade(live, 250, 900),
        }}
      >
        <p style={{ margin: 0 }}>
          <DropCap>去</DropCap>
          年冬天，我们在会议室的白板上写满了计划：十二个新功能、四次大版本、一场发布会。到了年底回头看，真正上线的还不到一半，白板早已擦过许多遍。
        </p>
        <p style={{ margin: '0.6em 0 0', textIndent: '2em' }}>
          可我们并不觉得这是失败。被划掉的每一行，都经过了一次认真的追问——它真的被需要吗，还是只让我们显得很忙？答案往往要等上几个星期，等热情退去，等用户的声音慢慢浮上来。
        </p>
        <p style={{ margin: '0.6em 0 0', textIndent: '2em' }}>
          这一期，我们把那张长长的清单原样印了出来，连同删改的痕迹。没有上线的，和上线了的一样，共同构成了这一年的
          <span style={{ color: ACCENT }}>轮廓</span>。愿你读完，也能在自己的清单上，安心地划掉一两行。
        </p>
      </div>
      <div style={{ ...abs(680, 700, 1120), borderTop: `1px solid ${RULE}`, paddingTop: 56, ...rise(live, 500) }}>
        <PullQuote cite="—— 摘自本期《长清单》，第 14 页">被划掉的每一行，都是一次认真的追问。</PullQuote>
      </div>
      <Footer />
    </div>
  );
};

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <Paper />
      <Numeral size={800} outline style={{ ...abs(80, 150), ...fade(live, 0, 1600) }}>
        05
      </Numeral>
      <div
        style={{
          ...abs(X0, 820, 780),
          border: `1px solid ${RULE}`,
          padding: '22px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          rowGap: 8,
          fontSize: 20,
          letterSpacing: '0.12em',
          color: MUTED,
        }}
      >
        <span>
          主编　<span style={{ color: BODY }}>林间</span>
        </span>
        <span>
          排印　<span style={{ color: BODY }}>宋体 · 深色印刷</span>
        </span>
        <span>
          出版　<span style={{ color: BODY }}>一年两期</span>
        </span>
        <span>
          印数　<span style={{ color: BODY }}>两千册 · 烛光下装订</span>
        </span>
      </div>
      <SideNote x={1846} y={150}>
        本期完 · 第 04 卷 · 二〇二六 冬
      </SideNote>
      <div style={{ ...abs(1040, 150), ...rise(live, 100) }}>
        <Eyebrow>本期完 · 下期预告</Eyebrow>
      </div>
      <div style={{ ...abs(1040, 200), ...rise(live, 200) }}>
        <Title size={136}>
          第五卷
          <br />
          再会。
        </Title>
      </div>
      <p
        style={{
          ...abs(1040, 540, 740),
          margin: 0,
          fontSize: 30,
          lineHeight: 1.7,
          color: BODY,
          ...rise(live, 300),
        }}
      >
        春天的时候，我们会带着新的一期回来。
        <br />
        在那之前，请慢一点读完这一本。
      </p>
      <div style={{ ...abs(1040, 690, 760), ...fade(live, 500) }}>
        <div style={{ fontSize: 20, letterSpacing: '0.24em', color: MUTED, marginBottom: 6 }}>下期要目</div>
        <TocRow num="01" title="留白的手艺" by="林间" />
        <TocRow num="02" title="一张没发出的海报" by="周遥" />
        <TocRow num="03" title="给新同事的信" by="编辑部" />
      </div>
      <Footer label="暗夜季刊 · 第五卷 · 二〇二七 春" />
    </div>
  );
};

export default [Cover, EditorsNote, Closer];
```
