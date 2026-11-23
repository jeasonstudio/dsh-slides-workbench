---
name: 黑白栅格
description: 瑞士国际主义风格的单色 deck：纯黑画布上铺一张看得见的 120 px 栅格，十字对位标记、行列编号、刻度尺，超大数字压在栅格线上作构图，只留一处信号橙。
mode: dark
---

# 黑白栅格

改编自 open-slide 官方主题 Mono Grid（MIT），已汉化并重做版式，只用系统字体，不加载任何外部字体或资源。

## 配色

单色为主，一种米白承担全部信息，灰阶只分三级。信号橙是唯一的强调色，**每页只用一处**：封面版本号里的小数点、数据页里「新版本」那根条、结尾页的命令行光标。

| 角色   | 色值      | 用途                                                   |
| ------ | --------- | ------------------------------------------------------ |
| bg     | `#000000` | 纯黑画布                                               |
| text   | `#EDEDED` | 米白：标题、大数字、数值、页码当前页                   |
| body   | `#A1A1A1` | 中灰：正文、副标题、表格里的键                         |
| muted  | `#8A8A8A` | 元信息：眉标、页眉页脚、行列编号、刻度数字（最暗的字） |
| grid   | `#161616` | 栅格细线（极淡，只做底纹）                             |
| frame  | `#2A2A2A` | 内容区外框线、表格行分隔线                             |
| mark   | `#4D4D4D` | 栅格交点上的十字对位标记                               |
| accent | `#FF4F00` | 信号橙，每页一处                                       |
| ghost  | `#5C5C5C` | 图表里「旧版本 / 对照组」的条                          |

文字不要暗于 `#8A8A8A`；比它暗的灰只能用于线和标记。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 无衬线（标题、正文、大数字）：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。
- 等宽（页眉页脚、行列编号、刻度、数值、命令行）：`"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace`。
- 字重：标题和大数字 700，标签 600，正文 400。页面根节点设 `fontVariantNumeric: 'tabular-nums'`。
- 中文不用负字距、不用斜体，靠极端的字号对比撑气场。只有纯西文 / 数字（`4.0`、`50ms`、`0.8s`）可以收紧：大数字 `-0.045em`，步骤数字 `-0.02em`。
- 字号（大小对比要极端）：

| 层级                     | 字号        | 说明                                              |
| ------------------------ | ----------- | ------------------------------------------------- |
| 超大数字                 | 560–640 px  | 占半屏，基线压在栅格线上                          |
| 结尾大字                 | 240 px      | 行高 240 px，最多 4 个字                          |
| 封面标题                 | 112 px      | 行高 120 px（正好一个模块），两行，每行 ≤ 6 个字  |
| 页面标题                 | 56 px       | 行高 1.2，一行                                    |
| 步骤数字                 | 80 px       |                                                   |
| 命令行                   | 48 px 等宽  |                                                   |
| 正文 / 副标题            | 26–30 px    | 行高 1.6，主动断行，不留孤字                      |
| 表格数值                 | 26–32 px 等宽 |                                                 |
| 眉标                     | 22 px       | 标签 600 字重，字距 `0.12em`                      |
| 页眉 / 页脚 / 编号 / 刻度 | 20 px 等宽 | `muted` 色                                         |

## 版式

- **栅格就是画面**。1920×1080 切成 16 × 9 个 120 px 正方形模块，栅格线贯穿全画布：
  - 第 0 行（y 0–120）是页眉带：上半放页眉，下半放列号 01–14 和顶部刻度。
  - 第 0 列（x 0–120）是行号带：A–G。
  - 内容区 x 120–1800、y 120–960（14 列 × 7 行）；最后一行（y 960–1080）是页脚带。
- 所有元素的左边、顶边、基线都落在 120 px 或 60 px 的倍数上：眉标 y=160，封面标题 y=240，表格每行 60 px 高、分隔线正好压在栅格线上。
- 超大数字用 SVG `<text>` 按**基线**定位（`BigNumber`），基线压在某条横向栅格线上（封面 y=840，数据页 y=720），右对齐时右边缘贴住 x=1800。
- 每页都要有一个「主体」占掉半屏以上：封面是版本号，数据页是指标数字，结尾页是大字 + 横贯整行的命令行。其余信息用小字精确对齐在它旁边，留白要整块整块地留。
- 三页结构各不相同：
  - 封面：左栏标题 + 副标题 + 规格表，右侧超大版本号，版本号下方一条 2 px 米白基线和两端注释。
  - 数据页：左上标题，左侧超大数字，右栏分位数表，底部横贯整页的刻度尺对比条。
  - 结尾页：240 px 大字，一整行命令行框，下方四格步骤（每格 3.5 个模块宽、顶边 2 px 米白线）。
- 直角，不用圆角、投影、渐变。分隔线 1 px `frame`，强调分隔用 2 px `text`。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去：

```tsx
import { type Page, useIsActivePage } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO =
  '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

const BG = '#000000';
const TEXT = '#EDEDED';
const BODY = '#A1A1A1';
const MUTED = '#8A8A8A';
const GRID = '#161616';
const FRAME = '#2A2A2A';
const MARK = '#4D4D4D';
const ACCENT = '#FF4F00';

// 栅格：120 px 正方形模块，16 × 9。内容区 x 120–1800、y 120–960（14 列 × 7 行）
const U = 120;
const COLS = 16;
const ROWS = 9;
```

### 关键帧与工具函数

```tsx
const KEYFRAMES = `
@keyframes mg-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mg-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mg-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes mg-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
`;

const abs = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
  width: w,
  height: h,
});

// live 为 true 时进场；缩略图（非当前页）直接显示最终状态
const enter = (live: boolean, delay = 0, name = 'mg-fadeUp', ms = 700): CSSProperties =>
  live ? { animation: `${name} ${ms}ms cubic-bezier(0.2, 0, 0, 1) ${delay}ms both` } : {};

const root: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: BG,
  color: TEXT,
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
  WebkitFontSmoothing: 'antialiased',
};
```

每页根节点用 `root`，第一个子元素放 `<style>{KEYFRAMES}</style>`，第二个放 `<GridField />`，其余元素一律用 `abs(x, y, w, h)` 绝对定位到栅格上。

### GridField（栅格底纹）

整页铺满：极淡的栅格线、内容区外框、每个交点的十字对位标记、顶部 60 / 120 px 刻度、列号 01–14、行号 A–G。每页都要有，不要改密度。

```tsx
const GridField = () => {
  const xs = Array.from({ length: COLS - 1 }, (_, i) => (i + 1) * U);
  const ys = Array.from({ length: ROWS - 1 }, (_, i) => (i + 1) * U);
  const edge = (v: number, max: number) => v === U || v === max - U;
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      {xs.map((x) => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={1080} stroke={edge(x, 1920) ? FRAME : GRID} />
      ))}
      {ys.map((y) => (
        <line key={`h${y}`} x1={0} y1={y} x2={1920} y2={y} stroke={edge(y, 1080) ? FRAME : GRID} />
      ))}
      {/* 顶部刻度：每 60 px 一短刻，每 120 px 一长刻 */}
      {Array.from({ length: 29 }, (_, i) => U + i * 60).map((x, i) => (
        <line key={`t${x}`} x1={x} y1={U} x2={x} y2={U - (i % 2 ? 6 : 14)} stroke={MUTED} />
      ))}
      {/* 十字对位标记：每个交点一个 */}
      {xs.flatMap((x) =>
        ys.map((y) => (
          <path key={`c${x}-${y}`} d={`M${x - 7} ${y}H${x + 7}M${x} ${y - 7}V${y + 7}`} stroke={MARK} />
        )),
      )}
      {/* 列号与行号 */}
      {xs.slice(0, -1).map((x, i) => (
        <text key={`n${x}`} x={x + 8} y={U - 22} fill={MUTED} fontFamily={MONO} fontSize={20}>
          {String(i + 1).padStart(2, '0')}
        </text>
      ))}
      {ys.slice(0, -1).map((y, i) => (
        <text key={`r${y}`} x={U - 16} y={y + 30} fill={MUTED} fontFamily={MONO} fontSize={20} textAnchor="end">
          {String.fromCharCode(65 + i)}
        </text>
      ))}
    </svg>
  );
};
```

### Header / Footer（页眉 / 页脚）

页眉在 y=36，页脚在 y=1000，都是 20 px 等宽 `muted`。页眉右侧写本页的「分类 / 主题」，页脚右侧当前页码用 `text` 提亮。

```tsx
const Header = ({ right }: { right: string }) => (
  <div
    style={{
      ...abs(U, 36, 1680),
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.04em',
      color: MUTED,
    }}
  >
    <span>
      <span style={{ color: TEXT }}>ATLAS</span>　边缘运行时 4.0
    </span>
    <span>{right}</span>
  </div>
);

const Footer = ({ n, total }: { n: number; total: number }) => (
  <div
    style={{
      ...abs(U, 1000, 1680),
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.04em',
      color: MUTED,
    }}
  >
    <span>基础设施团队 · 技术发布</span>
    <span>
      <span style={{ color: TEXT }}>{String(n).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
    </span>
  </div>
);
```

### Eyebrow（眉标）

放在 y=160（第 A 行中部），编号等宽米白，短横线，标签 600 字重。

```tsx
const Eyebrow = ({ index, label }: { index: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, color: MUTED }}>
    <span style={{ fontFamily: MONO, color: TEXT }}>{index}</span>
    <span style={{ width: 40, height: 1, background: MUTED }} />
    <span style={{ fontWeight: 600, letterSpacing: '0.12em' }}>{label}</span>
  </div>
);
```

### BigNumber（超大数字）

用 SVG `<text>` 让基线精确压在栅格线上。可以用 `<tspan>` 把单位缩小（`fontSize={180} dx={36}`），或把一个字符染成信号橙（`<tspan fill={ACCENT}>.</tspan>`）。外面套一层 `position: absolute; inset: 0` 的 div 来挂进场动画。

```tsx
// 超大数字：用 SVG text 按基线精确落在栅格线上
const BigNumber = ({
  x,
  y,
  size,
  anchor = 'start',
  children,
}: {
  x: number;
  y: number;
  size: number;
  anchor?: 'start' | 'end';
  children: ReactNode;
}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={TEXT}
      fontFamily={SANS}
      fontWeight={700}
      fontSize={size}
      letterSpacing={-size * 0.045}
    >
      {children}
    </text>
  </svg>
);
```

### 规格表 / 分位数表

每行 60 px，顶边 1 px `frame`，左键（26 px `body`）右值（等宽 `text`）。4 行正好 240 px，起点放在栅格线上，分隔线就会每隔一行和栅格线重合。要突出某一行，把它的键改成 `text` + 600 字重，不要加色。

### 刻度尺对比条

横贯 x 120–1800 的数值轴：1 px 米白轴线，每 20 单位一短刻（`muted`），每 100 单位一长刻（`text`）加 20 px 等宽数字。轴线上方两根 12 px 高的条：对照组 `#5C5C5C`、新版本 `ACCENT`，条尾右侧 16 px 写「数值　版本」。

```tsx
// 刻度尺：0–400 ms 映射到 x 120–1800，轴线在 y=888
const SCALE_MAX = 400;
const sx = (ms: number) => U + (ms / SCALE_MAX) * 1680;
```

完整写法见下方「示例」里的数据页。

## 动效

- 原则：克制、精确，没有弹性和循环（命令行光标闪烁除外）。
- 所有动画都以 `useIsActivePage()` 为开关（`enter(live, delay, name, ms)`）；非当前页和缩略图直接显示最终状态。
- 节奏：眉标 0 ms → 标题 60–80 ms → 正文 160 ms → 表格 200–240 ms，`mg-fadeUp` 700 ms；超大数字用 `mg-fade` 900 ms；对比条 `mg-grow`（`transformOrigin: 'left'`）800 ms，在 300 ms 后依次长出，条尾标签随后淡入。
- 缓动统一 `cubic-bezier(0.2, 0, 0, 1)`。栅格底纹、页眉页脚永远静止。
- 结尾页的信号橙光标：`mg-blink 1s steps(1) infinite`，同样只在 `live` 时开启。

## 气质

一张瑞士国际主义海报，或者一家只做深色模式的基础设施公司（Vercel、Teenage Engineering 那种）做的发布会 deck：冷峻、精确、单色。栅格不藏在背后，而是被画出来——编号、刻度、十字对位标记让整页像一张工程图纸。构图靠一个占半屏的超大数字或大字，旁边用 20–30 px 的小字精确对齐注释，大小对比越极端越好。信号橙只出现一次，像仪器面板上唯一亮着的灯。

避免：渐变、投影、圆角、照片、emoji、第二种强调色、同一页多处信号橙、文字暗于 `#8A8A8A`、正文小于 26 px、元信息小于 20 px、中文负字距和中文斜体、脱离栅格随手摆放的元素、三页同一个结构。

## 示例

```tsx
const TOTAL = 3;

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <style>{KEYFRAMES}</style>
      <GridField />
      <Header right="发布会 / 2026.11" />

      <div style={{ ...abs(U, 160), ...enter(live, 0) }}>
        <Eyebrow index="01" label="技术发布" />
      </div>
      <h1
        style={{
          ...abs(U, 240),
          margin: 0,
          fontSize: 112,
          fontWeight: 700,
          lineHeight: '120px',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          ...enter(live, 80),
        }}
      >
        边缘运行时，
        <br />
        终于就绪。
      </h1>
      <p style={{ ...abs(U, 520, 600), margin: 0, fontSize: 30, lineHeight: 1.6, color: BODY, ...enter(live, 160) }}>
        三条没有妥协的约束，
        <br />
        以及为守住它们交付的整套技术栈。
      </p>

      {/* 左下：规格表，预告下一页 */}
      <div style={{ ...abs(U, 720, 480), ...enter(live, 240) }}>
        {[
          ['冷启动', '50ms'],
          ['客户端运行时', '0kb'],
          ['覆盖区域', '32'],
          ['可用性', '99.99%'],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${FRAME}`,
              fontSize: 26,
            }}
          >
            <span style={{ color: BODY }}>{k}</span>
            <span style={{ fontFamily: MONO, color: TEXT }}>{v}</span>
          </div>
        ))}
      </div>

      {/* 右侧：超大版本号，基线压在 y=840 */}
      <div style={{ position: 'absolute', inset: 0, ...enter(live, 120, 'mg-fade', 900) }}>
        <BigNumber x={1800} y={840} size={640} anchor="end">
          4<tspan fill={ACCENT}>.</tspan>0
        </BigNumber>
      </div>
      <div style={{ ...abs(840, 839, 960, 2), background: TEXT }} />
      <div
        style={{
          ...abs(840, 860, 960),
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 20,
          color: MUTED,
        }}
      >
        <span>v3.2 → v4.0</span>
        <span>2026.11.16 正式可用</span>
      </div>

      <Footer n={1} total={TOTAL} />
    </div>
  );
};

const Data: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <style>{KEYFRAMES}</style>
      <GridField />
      <Header right="指标 / 冷启动" />

      <div style={{ ...abs(U, 160), ...enter(live, 0) }}>
        <Eyebrow index="02" label="约束一" />
      </div>
      <h2 style={{ ...abs(U, 200), margin: 0, fontSize: 56, fontWeight: 700, lineHeight: 1.2, ...enter(live, 60) }}>
        冷启动，压到 50 毫秒以内。
      </h2>

      <div style={{ position: 'absolute', inset: 0, ...enter(live, 120, 'mg-fade', 900) }}>
        <BigNumber x={U - 24} y={720} size={560}>
          50
          <tspan fontSize={180} dx={36} letterSpacing={-4}>
            ms
          </tspan>
        </BigNumber>
      </div>

      {/* 右栏：实测分位数 */}
      <div style={{ ...abs(1320, 360, 480), ...enter(live, 200) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, height: 60 }}>实测 · 全球 32 个区域</div>
        {[
          ['P50', '18ms'],
          ['P90', '31ms'],
          ['P99', '47ms'],
          ['最慢区域', '49ms'],
        ].map(([k, v], i) => (
          <div
            key={k}
            style={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${FRAME}`,
            }}
          >
            <span style={{ fontSize: 26, color: i === 2 ? TEXT : BODY, fontWeight: i === 2 ? 600 : 400 }}>{k}</span>
            <span style={{ fontFamily: MONO, fontSize: 32, color: TEXT }}>{v}</span>
          </div>
        ))}
        <p style={{ margin: '28px 0 0', fontSize: 26, lineHeight: 1.6, color: BODY }}>
          从收到请求计时，到返回首字节。
          <br />
          连续 30 天，每分钟采样一次。
        </p>
      </div>

      {/* 底部：对比刻度尺 */}
      <div style={{ ...abs(U, 776), fontFamily: MONO, fontSize: 20, color: MUTED }}>P99 冷启动 / 毫秒</div>
      {[
        { ms: 340, y: 820, color: '#5C5C5C', label: '340ms　v3.2' },
        { ms: 47, y: 848, color: ACCENT, label: '47ms　v4.0' },
      ].map((b, i) => (
        <div key={b.label}>
          <div
            style={{
              ...abs(U, b.y, sx(b.ms) - U, 12),
              background: b.color,
              transformOrigin: 'left',
              ...enter(live, 300 + i * 150, 'mg-grow', 800),
            }}
          />
          <div
            style={{
              ...abs(sx(b.ms) + 16, b.y - 7),
              fontFamily: MONO,
              fontSize: 20,
              lineHeight: '26px',
              color: i ? TEXT : MUTED,
              whiteSpace: 'nowrap',
              ...enter(live, 700 + i * 150, 'mg-fade', 400),
            }}
          >
            {b.label}
          </div>
        </div>
      ))}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <line x1={U} y1={888} x2={1800} y2={888} stroke={TEXT} />
        {Array.from({ length: SCALE_MAX / 20 + 1 }, (_, i) => i * 20).map((ms) => (
          <line
            key={ms}
            x1={sx(ms)}
            y1={888}
            x2={sx(ms)}
            y2={ms % 100 ? 896 : 906}
            stroke={ms % 100 ? MUTED : TEXT}
          />
        ))}
        {[0, 100, 200, 300, 400].map((ms) => (
          <text
            key={ms}
            x={sx(ms)}
            y={936}
            fill={MUTED}
            fontFamily={MONO}
            fontSize={20}
            textAnchor={ms === 0 ? 'start' : ms === SCALE_MAX ? 'end' : 'middle'}
          >
            {ms}
          </text>
        ))}
      </svg>

      <Footer n={2} total={TOTAL} />
    </div>
  );
};

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <style>{KEYFRAMES}</style>
      <GridField />
      <Header right="上线 / 现在" />

      <div style={{ ...abs(U, 160), ...enter(live, 0) }}>
        <Eyebrow index="03" label="上线" />
      </div>
      <h2
        style={{
          ...abs(U - 8, 220),
          margin: 0,
          fontSize: 240,
          fontWeight: 700,
          lineHeight: '240px',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          ...enter(live, 60),
        }}
      >
        上线吧。
      </h2>
      <p style={{ ...abs(1320, 240, 480), margin: 0, fontSize: 30, lineHeight: 1.6, color: BODY, ...enter(live, 160) }}>
        一条命令就够了。
        <br />
        不提工单，不排值班表。
      </p>

      {/* 命令行：占满一整行模块 */}
      <div
        style={{
          ...abs(U, 540, 1680, 120),
          boxSizing: 'border-box',
          border: `1px solid ${TEXT}`,
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          fontFamily: MONO,
          ...enter(live, 240),
        }}
      >
        <span style={{ fontSize: 48, color: TEXT, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: MUTED, marginRight: 28 }}>$</span>
          atlas deploy --prod
          <span
            style={{
              display: 'inline-block',
              width: 26,
              height: 52,
              marginLeft: 14,
              background: ACCENT,
              ...(live ? { animation: 'mg-blink 1s steps(1) infinite' } : {}),
            }}
          />
        </span>
        <span style={{ fontSize: 22, color: MUTED }}>↵ 回车即上线</span>
      </div>

      {/* 四步：每格 3.5 个模块宽 */}
      {[
        ['01', '构建', '0.8s', '增量构建，只编译改动的路由'],
        ['02', '分发', '×32', '产物同时推到 32 个边缘区域'],
        ['03', '预热', '1.6s', '每个区域先拉起一个实例'],
        ['04', '生效', '4.2s', '切换流量，旧版本随时回滚'],
      ].map(([n, k, v, d], i) => (
        <div
          key={n}
          style={{
            ...abs(U + i * 420, 720, 420, 240),
            boxSizing: 'border-box',
            borderTop: `2px solid ${TEXT}`,
            padding: '20px 32px 0 0',
            ...enter(live, 360 + i * 90),
          }}
        >
          <div style={{ display: 'flex', gap: 14, fontSize: 22, color: MUTED }}>
            <span style={{ fontFamily: MONO }}>{n}</span>
            <span style={{ fontWeight: 600, color: TEXT }}>{k}</span>
          </div>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: '104px', letterSpacing: '-0.02em' }}>{v}</div>
          <div style={{ fontSize: 26, lineHeight: 1.5, color: BODY }}>{d}</div>
        </div>
      ))}

      <Footer n={3} total={TOTAL} />
    </div>
  );
};

export default [Cover, Data, Closer];
```
