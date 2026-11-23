---
name: 紫夜微光
description: 深夜发布会风格：近黑画布配点阵纹理、紫色光晕、渐变描边的圆角卡片与产品窗口、等宽元信息，每页一个发光的视觉主体，适合版本发布与技术架构。
mode: dark
---

# 紫夜微光

改编自 open-slide 官方主题 Aurora（MIT），已汉化，只用系统字体，不加载任何外部字体、图片或其它外部资源。目标是 Linear / Vercel / Raycast 发布会那种精致的暗色 deck：**每页一个用 CSS / SVG 画出来的视觉主体**（终端窗口、架构图、代码 diff、指标卡），光晕和纹理都围着主体走。

## 配色

代码里统一用 `C.xxx` 引用，不要散写色值。

| 角色        | 色值                          | 用途                                                       |
| ----------- | ----------------------------- | ---------------------------------------------------------- |
| bg          | `#09090B`                     | 近黑画布                                                   |
| surface     | `#111114`                     | 卡片底色（渐变的下端）                                     |
| surfaceHi   | `#18181C`                     | 卡片底色（渐变的上端）、架构图普通节点                     |
| line        | `rgba(255,255,255,0.10)`      | 卡片内分隔线、窗口标题栏下边线                             |
| text        | `#FAFAFA`                     | 标题、大数字、命令、关键值                                 |
| body        | `#BDBDC6`                     | 正文、副标题、卡片说明                                     |
| meta        | `#A1A1AA`                     | 元信息：眉标以外的等宽标签、路径、页脚。**文字不能比它更暗** |
| faint       | `#52525B`                     | 只用于装饰：行号、页码分母、休眠图例，不承载要读的内容     |
| accent      | `#A78BFA`                     | 紫色：光晕、圆点、`$` `✓` 提示符、数据流线、sparkline      |
| accentHi    | `#C4B5FD`                     | 浅紫：眉标文字、指标标签、高亮节点副标题、链接             |
| accentSoft  | `rgba(167,139,250,0.14)`      | 低透明度紫色填充：diff 新增行、标签底                      |

只有一种强调色。不用红绿表示增删，diff 里删除行用划线 + `meta` 色，新增行用 `accentSoft` 底 + 左侧 3px 紫条。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 无衬线：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。
- 等宽：`"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace`。凡是在说文件、路径、命令、版本号、日期、标签的地方都用等宽。
- 字重：标题、大数字、按钮 600；正文 400。
- 中文不用负字距、不用斜体；标题字距 `0.01em`。只有纯数字的大数字（`4.2×`、`92ms`）用 `-0.03em`。
- 页面根节点设 `fontVariantNumeric: 'tabular-nums'`。
- 字号（不要再往下压，黑底上小字会发闷）：
  - 封面 / 结尾大标题：112 px，行高 1.15，**白到淡紫灰的竖向渐变字**（见 `Title`），每行不超过 7 个字。
  - 页面标题：60 px，行高 1.2，一行不超过 18 个字。
  - 副标题 / 正文：30 px（封面、结尾），卡片说明 26 px，行高 1.5–1.6。**正文 ≥ 26 px。**
  - 终端 / 代码：26 px 等宽，行高 1.8。
  - 大数字：72 px（指标卡）、48–52 px（浮动小卡 / 图内标注）。
  - 眉标、元信息、页脚：20 px 等宽。**元信息 ≥ 20 px。**

## 版式

- 画布 1920×1080，内边距左右 120 px、上下 100 px（结尾页上边 80）。页脚固定在底部 52 px。
- 每页只有一个视觉主体，占画面 40%–60% 面积；文字区和主体之间要么左右分栏，要么上下堆叠，不要文字只占左上角、剩下一片空黑。
- 三种页型各不相同，按需复用：
  1. **封面（左右分栏）**：左列 = 眉标 + 大标题 + 两行副标题 + 一条分隔线下的三组元信息（日期 / 通道 / 兼容）；右列 820 px 宽的终端窗口，左下角压一张浮动指标小卡（`left: -64, bottom: -96`），制造前后层次。光晕放在窗口右上方。
  2. **内容页（标题 + 主体 + 侧栏）**：上方眉标 + 60 px 标题；下方一行，左边 1100×620 的架构图卡（网格底纹，高亮节点发光），右边三张等高指标卡竖排。
  3. **结尾页（居中）**：眉标 + 大标题 + 一句副标题居中，下面 960 px 宽的代码 diff 窗口，再下面一个白底按钮 + 等宽链接；底部一道紫色「地平线光弧」，页脚落在弧线下方的黑色里。
- 面板：一律用 `Panel`（圆角 20、上亮下暗的 1px 渐变描边、顶部 1px 内高光、深色投影）。主角卡片加 `glow`，描边变紫并带一圈紫色外发光；同一页最多一个 `glow`。
- 纹理：封面和结尾用 `DotGrid` 点阵，遮罩中心对准光晕；架构图卡内部用 40 px 线网格，同样用径向遮罩淡出边缘。纹理只是质感，透明度不要再调高。
- 光晕：`Glow` 放在主体背后或旁边（封面右上、内容页高亮节点附近），和主体呼应，绝不压在大段文字后面。
- 中文三列 / 侧栏说明一行写完（≤ 17 个字）或用 `\n` 在逗号处手动断行并加 `whiteSpace: 'pre-line'`，避免末行只剩一两个字。
- 等宽字体里中英混排宽度不稳定，终端 / 列表里「左文字、右数值」一律用 `display: flex; justifyContent: space-between`，不要靠空格对齐。

## 固定组件

原样复制进 deck。下面这段从 `styles` 到 `Window` 是一个整体（`import { type Page, useIsActivePage, useSlidePageNumber } from '@open-slide/core';`、`import type { CSSProperties, ReactNode } from 'react';`）。

- `styles`：关键帧，放进每页的 `<style>{styles}</style>`。
- `C`：配色表。`rise(live, delay)`：进场动画，`live` 为 false 时返回空对象。
- `pageBase`：页面底座。
- `DotGrid`：点阵纹理，`x / y` 是遮罩中心（对准光晕）。
- `Glow`：紫色光晕，`opacity` 默认 0.32，传 `live` 才会呼吸。
- `Panel`：渐变描边卡片，`glow` 为主角卡。
- `Title` / `Heading` / `Eyebrow` / `Footer`：大标题（渐变字）/ 页面标题 / 胶囊眉标（紫色描边 + 发光圆点）/ 页脚（`aurora` 紫色前缀 + 路径 + 页码）。
- `Window`：产品窗口，60 px 标题栏 + 三个灰色圆点 + 居中等宽标题，自带 `glow`。

```tsx
const styles = `
@keyframes au-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes au-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes au-glow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes au-flow { from { stroke-dashoffset: 48; } to { stroke-dashoffset: 0; } }
@keyframes au-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
`;

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

const C = {
  bg: '#09090B',
  surface: '#111114',
  surfaceHi: '#18181C',
  line: 'rgba(255,255,255,0.10)',
  text: '#FAFAFA',
  body: '#BDBDC6',
  meta: '#A1A1AA',
  faint: '#52525B',
  accent: '#A78BFA',
  accentHi: '#C4B5FD',
  accentSoft: 'rgba(167,139,250,0.14)',
};

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// 所有动画都以 live 为开关：缩略图里 live 为 false，直接显示最终状态
const rise = (live: boolean, delay = 0): CSSProperties =>
  live ? { animation: `au-rise 800ms ${EASE} ${delay}ms both` } : {};

const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: C.bg,
  color: C.text,
  padding: '100px 120px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
  position: 'relative',
  overflow: 'hidden',
};

// 点阵纹理：从光晕处向四周淡出
const DotGrid = ({ x = '50%', y = '40%' }: { x?: string; y?: string }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1.2px, transparent 1.2px)',
      backgroundSize: '32px 32px',
      maskImage: `radial-gradient(ellipse 60% 70% at ${x} ${y}, #000 0%, transparent 100%)`,
      WebkitMaskImage: `radial-gradient(ellipse 60% 70% at ${x} ${y}, #000 0%, transparent 100%)`,
      pointerEvents: 'none',
    }}
  />
);

const Glow = ({
  x = '50%',
  y = '50%',
  size = 1100,
  opacity = 0.32,
  live = false,
}: {
  x?: string;
  y?: string;
  size?: number;
  opacity?: number;
  live?: boolean;
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      background: 'radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(124,58,237,0.35) 30%, transparent 65%)',
      opacity,
      filter: 'blur(60px)',
      pointerEvents: 'none',
      animation: live ? 'au-glow 5s ease-in-out infinite' : undefined,
    }}
  />
);

// 渐变描边卡片：上亮下暗的 1px 边 + 顶部内高光
const Panel = ({
  children,
  style,
  glow = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  glow?: boolean;
}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 20,
      border: '1px solid transparent',
      background: `linear-gradient(180deg, ${C.surfaceHi}, ${C.surface}) padding-box, linear-gradient(180deg, ${
        glow ? 'rgba(196,181,253,0.55)' : 'rgba(255,255,255,0.18)'
      }, rgba(255,255,255,0.05) 60%) border-box`,
      boxShadow: glow
        ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px rgba(139,92,246,0.18), 0 30px 80px rgba(0,0,0,0.5)'
        : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.45)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

const Title = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 112,
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      margin: 0,
      color: C.text,
      backgroundImage: 'linear-gradient(180deg, #FFFFFF 35%, #B9B4D6 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      ...style,
    }}
  >
    {children}
  </h1>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: SANS,
      fontSize: 60,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
      margin: 0,
      color: C.text,
    }}
  >
    {children}
  </h2>
);

const Eyebrow = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 20px',
      borderRadius: 999,
      border: '1px solid rgba(167,139,250,0.35)',
      background: 'rgba(167,139,250,0.08)',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.12em',
      color: C.accentHi,
      ...style,
    }}
  >
    <span
      aria-hidden
      style={{ width: 8, height: 8, borderRadius: '50%', background: C.accent, boxShadow: `0 0 12px ${C.accent}` }}
    />
    {children}
  </div>
);

const Footer = ({ path = '/docs' }: { path?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 52,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: MONO,
        fontSize: 20,
        letterSpacing: '0.04em',
        color: C.meta,
      }}
    >
      <span>
        <span style={{ color: C.accent }}>aurora</span> {path}
      </span>
      <span>
        {String(current).padStart(2, '0')} <span style={{ color: C.faint }}>/ {String(total).padStart(2, '0')}</span>
      </span>
    </div>
  );
};

// 产品窗口：带三个圆点的标题栏，内容区放终端 / 代码
const Window = ({ title, children, style }: { title: string; children: ReactNode; style?: CSSProperties }) => (
  <Panel glow style={style}>
    <div
      style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: `1px solid ${C.line}`,
        background: 'rgba(255,255,255,0.02)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: '#3F3F46' }} />
        ))}
      </div>
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 20,
          color: C.meta,
        }}
      >
        {title}
      </span>
    </div>
    {children}
  </Panel>
);
```

### Node（架构图节点）

架构图的做法：卡片里放一个固定尺寸的相对定位容器（示例 1100×556），底下一层 `<svg>` 画连线，上面用绝对定位的 `Node` 放节点。坐标手算，连线端点正好落在节点左右边的中点。`tone="hero"` 是本页主角（紫色渐变底 + 发光），`tone="idle"` 是休眠节点（虚线边、灰字）。每条活跃连线画两层：底层 `rgba(255,255,255,0.18)` 实线，上层 `accent` 虚线 `strokeDasharray="10 14"`，`live` 时跑 `au-flow`；休眠连线只画底层。

```tsx
type NodeProps = { x: number; y: number; w: number; h: number; title: string; sub: string; tone?: 'hero' | 'idle' };

const Node = ({ x, y, w, h, title, sub, tone }: NodeProps) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 6,
      padding: '0 22px',
      background:
        tone === 'hero'
          ? 'linear-gradient(180deg, rgba(167,139,250,0.22), rgba(167,139,250,0.06))'
          : tone === 'idle'
            ? 'transparent'
            : C.surfaceHi,
      border:
        tone === 'hero'
          ? '1px solid rgba(196,181,253,0.7)'
          : tone === 'idle'
            ? '1px dashed rgba(255,255,255,0.22)'
            : '1px solid rgba(255,255,255,0.14)',
      boxShadow:
        tone === 'hero'
          ? '0 0 60px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
    }}
  >
    <span style={{ fontSize: tone === 'hero' ? 30 : 26, fontWeight: 600, color: tone === 'idle' ? C.meta : C.text }}>
      {title}
    </span>
    <span style={{ fontFamily: MONO, fontSize: 20, color: tone === 'hero' ? C.accentHi : C.meta }}>{sub}</span>
  </div>
);
```

### 地平线光弧（结尾页）

一个比画布宽得多的黑色椭圆，顶边 2px 浅紫描边，向上投两层紫色柔光。顶边放在 y≈850，保证内容在弧线上方、页脚在弧线下方的黑色里，弧线不穿过任何文字。

```tsx
{/* 地平线光弧：一个巨大的黑色椭圆，顶边发紫光 */}
<div
  aria-hidden
  style={{
    position: 'absolute',
    left: '50%',
    top: 850,
    width: 3200,
    height: 1600,
    transform: 'translateX(-50%)',
    borderRadius: '50%',
    background: C.bg,
    borderTop: '2px solid rgba(196,181,253,0.85)',
    boxShadow: '0 -24px 80px rgba(139,92,246,0.55), 0 -120px 240px rgba(124,58,237,0.35)',
    ...(live ? { animation: 'au-fade 1.2s ease-out both' } : {}),
  }}
/>
```

## 动效

- 风格：克制但有生命感。
- **所有动画都以 `useIsActivePage()` 为开关**：每页开头 `const live = useIsActivePage();`，用 `rise(live, delay)` 或 `live ? { animation: ... } : {}`。缩略图里 `live` 为 false，元素直接停在最终状态。
- 关键帧（已在 `styles` 里）：
  - `au-rise`：文字区和主体进场，800 ms `cubic-bezier(0.22, 1, 0.36, 1)`；主体比文字晚 120–150 ms，侧栏卡片依次再晚 100 ms。
  - `au-fade`：终端逐行出现（每行间隔 160 ms，从 400 ms 开始）、地平线光弧淡入。
  - `au-glow`：光晕 5 s 呼吸。
  - `au-flow`：架构图虚线数据流，1.6 s 线性循环，每条错开 0.2 s。
  - `au-blink`：终端末行的光标闪烁。

## 气质

凌晨两点的发布会大屏：近黑画布上一层若有若无的点阵，一束紫光从主体背后透出来；主体是一扇做工精细的产品窗口或一张发光的架构图，1px 的渐变边像玻璃的切面。文字白、正文浅灰、元信息等宽，层次靠亮度和字号拉开，而不是靠颜色种类。每页都有东西可看，留白是为了衬主体，不是因为没做完。

避免：浅色背景、多种强调色、红绿 diff、照片和外部图片、装饰性 emoji、直角卡片、中文斜体和负字距、比 `#A1A1AA` 更暗的可读文字、小于 26 px 的正文、内容只堆在左上角。

## 示例

以下三页就是模板预览本身，可以整页照抄后替换文案。

### 封面

```tsx
const termLines: { kind: 'cmd' | 'out' | 'ok' | 'link'; text: string; value?: string }[] = [
  { kind: 'cmd', text: 'npm i aurora@3.0.0' },
  { kind: 'out', text: '已添加 1 个包', value: '0.8s' },
  { kind: 'cmd', text: 'aurora dev' },
  { kind: 'ok', text: '运行时 v3.0.0 就绪', value: '92ms' },
  { kind: 'ok', text: '迁移检查：破坏性变更', value: '0 处' },
  { kind: 'ok', text: '空闲内存基线', value: '−38%' },
  { kind: 'link', text: 'http://localhost:3000' },
];

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={{ ...pageBase, flexDirection: 'row', alignItems: 'center', gap: 72 }}>
      <style>{styles}</style>
      <DotGrid x="76%" y="45%" />
      <Glow x="78%" y="30%" size={1300} live={live} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, position: 'relative', ...rise(live) }}>
        <Eyebrow>版本发布 · v3.0</Eyebrow>
        <Title>
          不声不响，
          <br />
          经得起长跑。
        </Title>
        <p style={{ fontSize: 30, lineHeight: 1.6, color: C.body, margin: 0, maxWidth: 760 }}>
          本季度落地三项架构改进：
          <br />
          没有一项惹眼，每一项都在承重。
        </p>
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 16,
            paddingTop: 32,
            borderTop: `1px solid ${C.line}`,
            fontFamily: MONO,
          }}
        >
          {[
            ['发布日期', '2026.11.18'],
            ['通道', 'stable'],
            ['兼容', 'v2 全部 API'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 20, color: C.meta, letterSpacing: '0.08em' }}>{k}</span>
              <span style={{ fontSize: 26, color: C.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 820, position: 'relative', ...rise(live, 150) }}>
        <Window title="~/aurora — zsh">
          <div
            style={{
              padding: '32px 40px 64px',
              fontFamily: MONO,
              fontSize: 26,
              lineHeight: 1.85,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {termLines.map((l, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: l.kind === 'cmd' && i > 0 ? 14 : 0,
                  ...(live ? { animation: `au-fade 300ms ease-out ${400 + i * 160}ms both` } : {}),
                }}
              >
                <span>
                  {l.kind === 'cmd' && <span style={{ color: C.accent }}>$ </span>}
                  {l.kind === 'ok' && <span style={{ color: C.accent }}>✓ </span>}
                  {l.kind === 'link' && <span style={{ color: C.accent }}>→ </span>}
                  <span
                    style={{
                      color: l.kind === 'cmd' ? C.text : l.kind === 'link' ? C.accentHi : C.body,
                      paddingLeft: l.kind === 'out' ? 30 : 0,
                    }}
                  >
                    {l.text}
                  </span>
                  {l.kind === 'link' && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 30,
                        marginLeft: 12,
                        verticalAlign: -5,
                        background: C.text,
                        animation: live ? 'au-blink 1.1s step-end infinite' : undefined,
                      }}
                    />
                  )}
                </span>
                {l.value && <span style={{ color: l.kind === 'ok' ? C.text : C.meta }}>{l.value}</span>}
              </div>
            ))}
          </div>
        </Window>

        {/* 浮在窗口左下角的指标小卡，制造前后层次 */}
        <Panel
          style={{
            position: 'absolute',
            left: -64,
            bottom: -96,
            width: 320,
            padding: '22px 26px',
            ...(live ? { animation: `au-rise 800ms ${EASE} 600ms both` } : {}),
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 20, color: C.meta, letterSpacing: '0.08em' }}>冷启动 P50</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 52, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>92ms</span>
            <svg width="120" height="48" viewBox="0 0 120 48" aria-hidden>
              <defs>
                <linearGradient id="au-spark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 8 L20 12 L40 10 L60 22 L80 30 L100 36 L120 40 L120 48 L0 48 Z" fill="url(#au-spark)" />
              <path
                d="M0 8 L20 12 L40 10 L60 22 L80 30 L100 36 L120 40"
                fill="none"
                stroke={C.accent}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Panel>
      </div>
      <Footer path="/docs/release-notes" />
    </div>
  );
};
```

### 内容页

开头的 `Node` 与上文「Node（架构图节点）」是同一份代码，deck 里只保留一份。

```tsx
type NodeProps = { x: number; y: number; w: number; h: number; title: string; sub: string; tone?: 'hero' | 'idle' };

const Node = ({ x, y, w, h, title, sub, tone }: NodeProps) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 6,
      padding: '0 22px',
      background:
        tone === 'hero'
          ? 'linear-gradient(180deg, rgba(167,139,250,0.22), rgba(167,139,250,0.06))'
          : tone === 'idle'
            ? 'transparent'
            : C.surfaceHi,
      border:
        tone === 'hero'
          ? '1px solid rgba(196,181,253,0.7)'
          : tone === 'idle'
            ? '1px dashed rgba(255,255,255,0.22)'
            : '1px solid rgba(255,255,255,0.14)',
      boxShadow:
        tone === 'hero'
          ? '0 0 60px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
    }}
  >
    <span style={{ fontSize: tone === 'hero' ? 30 : 26, fontWeight: 600, color: tone === 'idle' ? C.meta : C.text }}>
      {title}
    </span>
    <span style={{ fontFamily: MONO, fontSize: 20, color: tone === 'hero' ? C.accentHi : C.meta }}>{sub}</span>
  </div>
);

const stats = [
  { n: '4.2×', label: '冷启动', body: '拉起到可接流量，不到 100 毫秒。' },
  { n: '−38%', label: '内存占用', body: '空闲 Worker 主动归还闲置内存。' },
  { n: '0', label: '破坏性变更', body: 'v2 公开 API 原样可用，零改动。' },
];

const Content: Page = () => {
  const live = useIsActivePage();
  const flow = (delay: number): CSSProperties | undefined =>
    live ? { animation: `au-flow 1.6s linear ${delay}s infinite` } : undefined;
  return (
    <div style={{ ...pageBase, gap: 48 }}>
      <style>{styles}</style>
      <Glow x="36%" y="62%" size={1000} opacity={0.28} live={live} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', ...rise(live) }}>
        <Eyebrow>架构 · 运行时</Eyebrow>
        <Heading>一次请求，在 v3 里这样走完。</Heading>
      </div>

      <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
        {/* 架构示意图 */}
        <Panel style={{ width: 1100, height: 620, flexShrink: 0, ...rise(live, 120) }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 70% 70% at 55% 55%, #000 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 55% 55%, #000 30%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              borderBottom: `1px solid ${C.line}`,
              fontFamily: MONO,
              fontSize: 20,
              color: C.meta,
            }}
          >
            <span>runtime.topology</span>
            <span style={{ display: 'flex', gap: 28 }}>
              <span>
                <span style={{ color: C.accent }}>●</span> 活跃
              </span>
              <span>
                <span style={{ color: C.faint }}>○</span> 休眠
              </span>
            </span>
          </div>

          <div style={{ position: 'relative', height: 556 }}>
            <svg width="1100" height="556" style={{ position: 'absolute', inset: 0 }} aria-hidden>
              {[
                'M228 278 L284 278',
                'M484 278 L540 278',
                'M770 278 C 805 278, 805 112, 840 112',
                'M770 278 L840 278',
                'M770 278 C 805 278, 805 444, 840 444',
              ].map((d, i) => (
                <g key={d}>
                  <path d={d} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                  {i !== 4 && (
                    <path
                      d={d}
                      fill="none"
                      stroke={C.accent}
                      strokeWidth="2.5"
                      strokeDasharray="10 14"
                      strokeLinecap="round"
                      style={flow(i * 0.2)}
                    />
                  )}
                </g>
              ))}
            </svg>
            <div style={{ position: 'absolute', left: 40, top: 40, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 20, color: C.meta, letterSpacing: '0.08em' }}>端到端 p99</span>
              <span style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                18<span style={{ fontSize: 28, color: C.meta, marginLeft: 6 }}>ms</span>
              </span>
            </div>
            <Node x={40} y={236} w={188} h={84} title="客户端" sub="HTTP/3" />
            <Node x={284} y={236} w={200} h={84} title="边缘网关" sub="鉴权 · 限流" />
            <Node x={540} y={204} w={230} h={148} title="调度器" sub="新 · 预热池" tone="hero" />
            <Node x={840} y={64} w={220} h={96} title="Worker A" sub="运行中 · 42%" />
            <Node x={840} y={230} w={220} h={96} title="Worker B" sub="运行中 · 37%" />
            <Node x={840} y={396} w={220} h={96} title="Worker C" sub="休眠 · 已归还" tone="idle" />
            <div
              style={{
                position: 'absolute',
                left: 40,
                bottom: 36,
                fontFamily: MONO,
                fontSize: 20,
                color: C.meta,
              }}
            >
              <span style={{ color: C.accentHi }}>+</span> 预热池让新 Worker 免冷启动，直接接流量
            </div>
          </div>
        </Panel>

        {/* 指标列 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {stats.map((s, i) => (
            <Panel
              key={s.label}
              style={{
                flex: 1,
                padding: '26px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 12,
                ...rise(live, 240 + i * 100),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 72, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.12em', color: C.accentHi }}>
                  {s.label}
                </span>
              </div>
              <div style={{ fontSize: 26, lineHeight: 1.5, color: C.body }}>{s.body}</div>
            </Panel>
          ))}
        </div>
      </div>
      <Footer path="/docs/architecture" />
    </div>
  );
};
```

### 结尾页

```tsx
const diff: { no: string; sign: ' ' | '-' | '+'; code: string; indent?: boolean }[] = [
  { no: '12', sign: ' ', code: '"dependencies": {' },
  { no: '13', sign: '-', code: '"aurora": "^2.9.4",', indent: true },
  { no: '13', sign: '+', code: '"aurora": "^3.0.0",', indent: true },
  { no: '14', sign: ' ', code: '}' },
];

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={{ ...pageBase, alignItems: 'center', paddingTop: 80 }}>
      <style>{styles}</style>
      <DotGrid x="50%" y="30%" />
      {/* 地平线光弧：一个巨大的黑色椭圆，顶边发紫光 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 850,
          width: 3200,
          height: 1600,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: C.bg,
          borderTop: '2px solid rgba(196,181,253,0.85)',
          boxShadow: '0 -24px 80px rgba(139,92,246,0.55), 0 -120px 240px rgba(124,58,237,0.35)',
          ...(live ? { animation: 'au-fade 1.2s ease-out both' } : {}),
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          position: 'relative',
          textAlign: 'center',
          ...rise(live),
        }}
      >
        <Eyebrow style={{ alignSelf: 'center' }}>开始升级</Eyebrow>
        <Title>先读升级文档。</Title>
        <p style={{ fontSize: 30, lineHeight: 1.6, color: C.body, margin: 0 }}>
          只改一行依赖版本，其余优化，等你有空再慢慢做。
        </p>
      </div>

      <Window title="package.json" style={{ width: 960, marginTop: 44, ...rise(live, 150) }}>
        <div style={{ padding: '18px 0', fontFamily: MONO, fontSize: 26, lineHeight: 1.8 }}>
          {diff.map((l, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                padding: '0 32px',
                background: l.sign === '+' ? C.accentSoft : l.sign === '-' ? 'rgba(255,255,255,0.03)' : 'transparent',
                boxShadow: l.sign === '+' ? `inset 3px 0 0 ${C.accent}` : undefined,
              }}
            >
              <span style={{ width: 56, color: C.faint }}>{l.no}</span>
              <span style={{ width: 36, color: l.sign === '+' ? C.accent : C.meta }}>{l.sign}</span>
              <span
                style={{
                  whiteSpace: 'pre',
                  marginLeft: l.indent ? 32 : 0,
                  color: l.sign === '+' ? '#EDE9FE' : l.sign === '-' ? C.meta : C.body,
                  textDecoration: l.sign === '-' ? 'line-through' : undefined,
                  textDecorationColor: 'rgba(161,161,170,0.6)',
                }}
              >
                {l.code}
              </span>
            </div>
          ))}
        </div>
      </Window>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 36, position: 'relative', ...rise(live, 300) }}>
        <span
          style={{
            padding: '16px 32px',
            borderRadius: 12,
            background: C.text,
            color: C.bg,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          阅读升级指南 →
        </span>
        <span style={{ fontFamily: MONO, fontSize: 22, color: C.meta }}>aurora.dev/docs/upgrade · 约 5 分钟</span>
      </div>
      <Footer path="/docs/upgrade" />
    </div>
  );
};
```
