---
name: 珊瑚晨光
description: 浅色效率工具风格：暖白点阵画布、一抹珊瑚红晨光、细描边加暖色柔影的 macOS 浮窗命令面板、墨色终端、研发流水线、立体键帽，适合工程效率与研发流程。
mode: light
---

# 珊瑚晨光

改编自 open-slide 官方主题 Command Bar（MIT），已汉化并重做，只用系统字体，不加载任何外部字体和图片。

一句话：**像 Raycast / Linear 官网浅色截图一样的 deck**。每一页都有一个用 CSS / SVG 画出来的「产品界面」当主体（命令面板浮窗、流水线、键帽），浮在暖白纸面上，珊瑚红像清晨的第一缕光，从主体背后晕开一片暖色。

## 配色

| 角色        | 色值                         | 用途                                                       |
| ----------- | ---------------------------- | ---------------------------------------------------------- |
| bg          | `#F7F3EE`                    | 暖白纸面画布                                               |
| surface     | `#FFFFFF`                    | 卡片、眉标胶囊、提示条、命令面板                           |
| surfaceHi   | `#F2ECE5`                    | 面板里选中的行、小标签和未选中图标的底色                   |
| border      | `#E3DBD1`                    | 所有面板和卡片的 1px 描边、分隔线                          |
| text        | `#1C1917`                    | 标题、选中行、大数字                                       |
| body        | `#57524C`                    | 正文、副标题、未选中的图标；**正文不许比它更浅**           |
| muted       | `#6B645D`                    | 元信息：等宽副标题、序号、耗时、页脚路径（字号 ≥ 20px）    |
| accent      | `#FF6363`                    | 珊瑚红：光晕、输入光标、选中条、进度条、亮起的键帽（只做填充，不做小字） |
| accentInk   | `#C93636`                    | 深珊瑚：浅底上的珊瑚色文字（「进行中」胶囊、进行中的命令）  |
| accentSoft  | `rgba(255, 99, 99, 0.12)`    | 低透明度强调底色（「进行中」胶囊）                         |
| ink         | `#1C1917`                    | 墨色底：终端窗口、安装命令条（全页唯一的深色块）           |

- 次一级的深字（未选中行的标题、提示条文字）用 `#3F3A36`，介于 text 和 body 之间。
- `accent` 在白底上对比度只有 2.9，**珊瑚色的字一律用 `accentInk`**（白底 5.2:1、accentSoft 底 4.6:1）；墨色底上的 `$` 提示符可以直接用 `accent`（6:1）。
- 墨色终端里的文字：正文 `#D6D3D1`，标题栏 / 次要信息 `#A8A29E`，描边 `#2E2A27`，标题栏底 `#26221F`。
- 珊瑚红只表达「当前 / 正在发生」：选中的命令、进行中的工序、按下去的那颗键。已完成用中性暖灰 `#A8A29E` / `muted`，等待中用 2px 虚线描边 `#CFC5B9`。
- 投影一律用暖棕色 `rgba(122,62,40,…)`，不要用纯黑投影；强调元素（进行中卡片、亮起的键帽）用珊瑚色柔影 `rgba(255,99,99,…)` 代替暗色版的发光。
- 唯一允许的「多色」是 macOS 窗口左上角的红黄绿三点（透明度 0.85）。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 无衬线：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。
- 等宽：`"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace`，凡是路径、命令、键帽、序号、耗时、页码都用等宽。
- 字重：标题、命令标题、大数字 600；正文 400；键帽 500。
- 中文字距 `0.01em`（标题）或默认，**不用负字距、不用斜体**。等宽眉标字距 `0.08em`。
- 字号：
  - 封面大标题：104 px，行高 1.15（两行，每行不超过 7 个字）；结尾页大标题 96 px 居中。
  - 页面标题：64 px，行高 1.2（一行，不超过 14 个字）。
  - 正文 / 导语：28–30 px，行高 1.6，颜色 `body`；导语用 `<br />` 手动断成两行，别让一个词被折断。
  - 卡片标题：40 px；命令面板：输入框 32 px，结果标题 26 px，结果副标题 20 px 等宽。
  - 大数字：52 px，下面配 22 px 的 `muted` 说明。
  - 眉标、标签、序号、耗时：20 px；页脚：22 px 等宽。**任何文字不小于 20 px。**
  - 键帽：行内 36–44 px 见方；大号立体键帽 220–240 px 见方。

## 版式

- 画布 1920 × 1080，主体元素用 `abs(left, top, width)` 绝对定位。左右边距 120，页脚 `bottom: 56`。
- 三页三种结构，不要雷同：
  1. **封面 · 左文右窗**：左列（x 120，宽 820）垂直居中放眉标、大标题、两行导语、一条细线隔开的三个大数字；右侧放命令面板浮窗（x 1000，y 268，宽 800），它背后斜上方叠一扇墨色终端窗口（x 1180，y 112，宽 640）制造前后层次——白色面板压在深色终端上，明暗对比就是层次。
  2. **内容 · 流水线**：顶部左边眉标 + 页面标题，右边（x 1180）两行补充说明；中部一条进度轨道（y 392）加五张工序卡（y 452，宽 304，间距 40，高 300），卡片和轨道之间用短竖线连接；底部通栏键位提示条（y 812，高 104）。
  3. **结尾 · 居中键帽**：两颗 236 px 立体键帽 `⌘ + K` 居中（y 176），亮起的 K 键整颗是珊瑚红、背后是光晕；下面依次是 96 px 居中大标题、一句导语、一条墨色底的可复制安装命令。
- 背景三层，从下往上：`bg` 纯色 → `DotGrid` 暖灰点阵（以主体为圆心淡出）→ `Glow` 珊瑚红色场（圆心落在主体背后或下方，在纸面上晕出一片淡淡的桃色）→ 主体。光晕绝不压在大标题后面。
- 浮窗质感：1 px `border` 描边 + 两层暖棕柔影（`WINDOW_SHADOW`，远处大而淡、近处小而实）。命令面板用它；已完成的工序卡、提示条用更轻的同色投影；等待中的卡片透明底、不加投影、用虚线描边。
- 圆角：浮窗 14–18，卡片 18，行 12，小标签 8，眉标 999。不要直角卡片。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去。

### 关键帧、字体、色板与辅助函数

每页放一次 `<style>{styles}</style>`。

```tsx
import { type Page, useIsActivePage } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

const styles = `
@keyframes cb-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cb-caret { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0; } }
@keyframes cb-glow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes cb-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes cb-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.6); opacity: 0; } }
@keyframes cb-press { 0%, 100% { transform: translateY(0); } 45%, 60% { transform: translateY(8px); } }
`;

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';

const MONO = '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';
const BG = '#F7F3EE';
const SURFACE = '#FFFFFF';
const SURFACE_HI = '#F2ECE5';
const BORDER = '#E3DBD1';
const TEXT = '#1C1917';
const BODY = '#57524C';
const MUTED = '#6B645D';
const ACCENT = '#FF6363';
const ACCENT_INK = '#C93636';
const ACCENT_SOFT = 'rgba(255, 99, 99, 0.12)';
const INK = '#1C1917';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// 浮窗：1px 描边 + 两层暖色柔影（远处大而淡，近处小而实）
const WINDOW_SHADOW =
  '0 1px 0 rgba(255,255,255,0.9) inset, 0 40px 100px rgba(122,62,40,0.16), 0 12px 28px rgba(122,62,40,0.10), 0 2px 4px rgba(28,25,23,0.05)';

const abs = (left: number, top: number, width?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
});

// live 为 false（缩略图、非当前页）时不挂动画，直接显示最终状态
const enter = (live: boolean, delay = 0, dur = 800) =>
  live ? `cb-fadeUp ${dur}ms ${EASE} ${delay}ms both` : undefined;

const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: BG,
  color: TEXT,
  boxSizing: 'border-box',
  fontFamily: SANS,
  position: 'relative',
  overflow: 'hidden',
};
```

### Title（大标题）/ Heading（页面标题）

```tsx
const Title = ({ children, size = 104, align = 'left' }: { children: ReactNode; size?: number; align?: 'left' | 'center' }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      margin: 0,
      color: TEXT,
      textAlign: align,
    }}
  >
    {children}
  </h1>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: SANS,
      fontSize: 64,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
      margin: 0,
      color: TEXT,
    }}
  >
    {children}
  </h2>
);
```

### Eyebrow（带珊瑚圆点的胶囊眉标）

```tsx
const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px 10px 18px',
      borderRadius: 999,
      border: `1px solid ${BORDER}`,
      background: SURFACE,
      boxShadow: '0 4px 14px rgba(122,62,40,0.06)',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.08em',
      color: BODY,
    }}
  >
    <span
      aria-hidden
      style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: '0 0 0 4px rgba(255,99,99,0.2)' }}
    />
    {children}
  </div>
);
```

### Kbd（行内键帽）

白色渐变顶面、1px 描边和 2px 暖灰底边的小键帽。正文、面板、提示条里都用它，`size` 取 32–44。

```tsx
const Kbd = ({ children, size = 40 }: { children: ReactNode; size?: number }) => (
  <kbd
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: size,
      height: size,
      padding: `0 ${Math.round(size * 0.28)}px`,
      boxSizing: 'border-box',
      fontFamily: MONO,
      // ⌘ ↵ 这类符号在等宽字体里偏小，放大一档
      fontSize: Math.round(size * (children === '⌘' || children === '↵' ? 0.6 : 0.5)),
      fontWeight: 500,
      color: TEXT,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F0EA 100%)',
      border: '1px solid #D9D0C5',
      borderRadius: Math.round(size * 0.2),
      boxShadow: 'inset 0 1px 0 #FFFFFF, 0 2px 0 #D9D0C5',
    }}
  >
    {children}
  </kbd>
);
```

### KeyCap（大号立体键帽）

结尾页的主体。外壳是侧壁（底部 6% 的实色投影就是键帽的「厚度」），里面再嵌一个略凹的顶面；普通键是象牙白，`lit` 的那颗整颗染成珊瑚红、白字，投下珊瑚色柔影。

```tsx
// 大号立体键帽：顶面 + 侧壁 + 落地投影；lit 时整颗染成珊瑚红，投下珊瑚色柔影
const KeyCap = ({ children, size = 220, lit = false }: { children: ReactNode; size?: number; lit?: boolean }) => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size,
      borderRadius: size * 0.18,
      background: lit ? 'linear-gradient(180deg, #FF7B72 0%, #F4554F 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #EEE7DE 100%)',
      border: `1px solid ${lit ? '#E04848' : '#DDD4C9'}`,
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.7)',
        `0 ${size * 0.06}px 0 ${lit ? '#C93636' : '#D5CBBE'}`,
        `0 ${size * 0.06}px 0 1px ${lit ? '#B83030' : '#CFC4B6'}`,
        lit ? '0 50px 90px rgba(255,99,99,0.38)' : '0 50px 80px rgba(122,62,40,0.18)',
        '0 16px 24px rgba(28,25,23,0.08)',
      ]
        .filter(Boolean)
        .join(', '),
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: size * 0.07,
        borderRadius: size * 0.13,
        background: lit ? 'linear-gradient(180deg, #FF6A64 0%, #FF8A7C 100%)' : 'linear-gradient(180deg, #F6F1EB 0%, #FFFFFF 100%)',
        boxShadow: lit
          ? 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(150,30,30,0.2)'
          : 'inset 0 1px 2px rgba(122,62,40,0.08), inset 0 -1px 0 #FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: size * 0.42,
        fontWeight: 500,
        color: lit ? '#FFFFFF' : TEXT,
        textShadow: lit ? '0 2px 0 rgba(150,30,30,0.25)' : 'none',
      }}
    >
      {children}
    </div>
  </div>
);
```

### Glow（珊瑚红色场）与 DotGrid（点阵底纹）

光晕用多段径向渐变，不用 `filter: blur`；浅底上它是一片桃色色场而不是发光，`opacity` 取 0.2–0.32，再高纸面会发粉。点阵用遮罩以主体为圆心淡出，边缘不要出现生硬的网格。

```tsx
const Glow = ({
  x,
  y,
  size = 1100,
  opacity = 0.22,
  live = false,
}: {
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  live?: boolean;
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(255,99,99,${opacity}) 0%, rgba(255,99,99,${opacity * 0.35}) 30%, transparent 62%)`,
      pointerEvents: 'none',
      animation: live ? 'cb-glow 5s ease-in-out infinite' : undefined,
    }}
  />
);

// 点阵底纹：以主体为圆心淡出
const DotGrid = ({ x, y, r = 900 }: { x: number; y: number; r?: number }) => {
  const mask = `radial-gradient(${r}px circle at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.5) 45%, transparent 100%)`;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(87,82,76,0.22) 1.2px, transparent 1.6px)',
        backgroundSize: '36px 36px',
        backgroundPosition: '18px 18px',
        WebkitMaskImage: mask,
        maskImage: mask,
        pointerEvents: 'none',
      }}
    />
  );
};
```

### Footer（页脚）

左边是等宽路径，右边是页码，当前页码用 `text` 色，总页数用 `muted`。

```tsx
const Footer = ({ pageNum, total, path }: { pageNum: number; total: number; path: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      right: 120,
      bottom: 56,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: MONO,
      fontSize: 22,
      letterSpacing: '0.04em',
      color: MUTED,
    }}
  >
    <span>{path}</span>
    <span>
      <span style={{ color: TEXT }}>{String(pageNum).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
    </span>
  </div>
);
```

### Icon（线性小图标）

24 × 24 视框、1.8 px 圆头描边。只画需要的几个，不要堆图标库。

```tsx
// 线性小图标（24 × 24 视框）
const ICONS: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 2 4.5 5 4.5 9l-2 4h-5l-2-4C7.5 8 9 5 12 3z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M9.5 16l-2 4M14.5 16l2 4" />
    </>
  ),
  split: (
    <>
      <path d="M5 4v6a4 4 0 0 0 4 4h10" />
      <path d="M5 20v-6" />
      <path d="M16 11l3 3-3 3" />
    </>
  ),
  undo: (
    <>
      <path d="M8 6L4 10l4 4" />
      <path d="M4 10h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

const Icon = ({ name, size = 24, color = BODY }: { name: string; size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {ICONS[name]}
  </svg>
);
```

### CommandPalette（命令面板浮窗）

主题的招牌。输入行（放大镜 + 查询词 + 珊瑚红光标 + 右侧范围标签）→ 分组标签 → 结果列表 → 底栏。第一行是选中态：`surfaceHi` 底色、1 px `border` 描边、左侧一根带珊瑚柔影的珊瑚红竖条、图标方块换成珊瑚红渐变。

```tsx
type Command = { icon: string; title: string; sub: string; kbd: string[] };

// 命令面板浮窗：输入行 + 分组标签 + 结果列表（首行高亮）+ 底栏
const CommandPalette = ({
  query,
  items,
  width = 800,
  live = false,
}: {
  query: string;
  items: Command[];
  width?: number;
  live?: boolean;
}) => (
  <div
    style={{
      width,
      borderRadius: 18,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFAF7 100%)',
      border: `1px solid ${BORDER}`,
      boxShadow: WINDOW_SHADOW,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '26px 30px',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Icon name="search" size={30} color={MUTED} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 500, color: TEXT }}>
        {query}
        <span
          style={{
            display: 'inline-block',
            width: 3,
            height: 34,
            borderRadius: 2,
            background: ACCENT,
            marginLeft: 6,
            animation: live ? 'cb-caret 1.1s steps(1) infinite' : undefined,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 20,
          color: BODY,
          padding: '6px 14px',
          borderRadius: 8,
          background: SURFACE_HI,
          border: `1px solid ${BORDER}`,
        }}
      >
        流水线
      </span>
    </div>
    <div style={{ padding: '14px 14px 10px' }}>
      <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, letterSpacing: '0.08em', padding: '8px 16px 12px' }}>
        建议 · {items.length} 条
      </div>
      {items.map((r, i) => {
        const on = i === 0;
        return (
          <div
            key={r.title}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 18px',
              borderRadius: 12,
              background: on ? SURFACE_HI : 'transparent',
              boxShadow: on ? `0 0 0 1px ${BORDER}` : 'none',
            }}
          >
            {on && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: -14,
                  top: 18,
                  bottom: 18,
                  width: 4,
                  borderRadius: 2,
                  background: ACCENT,
                  boxShadow: '0 2px 8px rgba(255,99,99,0.45)',
                }}
              />
            )}
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: on ? 'linear-gradient(135deg, #FF6363, #FF9B8B)' : SURFACE_HI,
                boxShadow: on ? '0 6px 18px rgba(255,99,99,0.35)' : `inset 0 0 0 1px ${BORDER}`,
              }}
            >
              <Icon name={r.icon} size={26} color={on ? '#FFFFFF' : BODY} />
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: on ? TEXT : '#3F3A36' }}>{r.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 20, color: MUTED }}>{r.sub}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.kbd.map((k) => (
                <Kbd key={k} size={36}>
                  {k}
                </Kbd>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 30px',
        borderTop: `1px solid ${BORDER}`,
        background: '#FAF7F3',
        fontSize: 20,
        color: BODY,
      }}
    >
      <span
        aria-hidden
        style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #FF6363, #FF9B8B)' }}
      />
      <span style={{ flex: 1, color: TEXT, fontWeight: 600 }}>研发台</span>
      <span>执行</span>
      <Kbd size={32}>↵</Kbd>
      <span style={{ width: 1, height: 22, background: BORDER, margin: '0 6px' }} />
      <span>更多操作</span>
      <Kbd size={32}>⌘</Kbd>
      <Kbd size={32}>K</Kbd>
    </div>
  </div>
);
```

### MacWindow（macOS 终端窗口）

墨色底、带红黄绿三点和居中标题的终端窗口壳，放在白色命令面板背后当「第二层」，不降透明度——靠明暗对比拉开前后。

```tsx
// macOS 终端窗口：墨色底 + 红黄绿三点 + 标题 + 内容（全页唯一的深色块）
const MacWindow = ({ title, width, children }: { title: string; width: number; children: ReactNode }) => (
  <div
    style={{
      width,
      borderRadius: 14,
      background: INK,
      border: '1px solid #2E2A27',
      boxShadow: '0 40px 100px rgba(122,62,40,0.22), 0 12px 28px rgba(28,25,23,0.18)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 18px',
        borderBottom: '1px solid #2E2A27',
        background: '#26221F',
      }}
    >
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <span key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c, opacity: 0.85 }} />
      ))}
      <span style={{ flex: 1, textAlign: 'center', fontFamily: MONO, fontSize: 20, color: '#A8A29E', marginRight: 60 }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);
```

### StageCard（流水线工序卡）

三种状态：`done`（白卡、暖灰进度条满格、打勾胶囊）、`running`（珊瑚红描边、浅桃渐变底、珊瑚色柔影、进度 64%）、`pending`（透明底、虚线描边、无投影、标题降为 `body`）。一页里只能有一个 `running`。

```tsx
type Stage = { name: string; cmd: string; time: string; state: 'done' | 'running' | 'pending' };

const STAGE_W = 304;

const STAGE_GAP = 40;

const stageX = (i: number) => 120 + i * (STAGE_W + STAGE_GAP);

// 流水线一格：序号 + 状态 + 工序名 + 等宽命令 + 耗时
const StageCard = ({ s, i, live }: { s: Stage; i: number; live: boolean }) => {
  const running = s.state === 'running';
  const pending = s.state === 'pending';
  const status = { done: '已完成', running: '进行中', pending: '等待中' }[s.state];
  return (
    <div
      style={{
        ...abs(stageX(i), 452, STAGE_W),
        height: 300,
        boxSizing: 'border-box',
        padding: '28px 28px 26px',
        borderRadius: 18,
        background: running ? 'linear-gradient(180deg, #FFEFEC 0%, #FFFFFF 100%)' : pending ? 'transparent' : SURFACE,
        border: pending ? `2px dashed #CFC5B9` : `1px solid ${running ? 'rgba(255,99,99,0.6)' : BORDER}`,
        boxShadow: running
          ? '0 30px 70px rgba(255,99,99,0.22), 0 10px 24px rgba(122,62,40,0.08)'
          : pending
            ? 'none'
            : '0 18px 44px rgba(122,62,40,0.10), 0 2px 4px rgba(28,25,23,0.04)',
        display: 'flex',
        flexDirection: 'column',
        animation: enter(live, 120 + i * 90),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 20, color: MUTED }}>{String(i + 1).padStart(2, '0')}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 20,
            padding: '4px 12px',
            borderRadius: 999,
            color: running ? ACCENT_INK : pending ? MUTED : BODY,
            background: running ? ACCENT_SOFT : 'transparent',
            border: running ? 'none' : `1px solid ${BORDER}`,
          }}
        >
          {s.state === 'done' && <Icon name="check" size={18} color={BODY} />}
          {status}
        </span>
      </div>
      <div style={{ fontSize: 40, fontWeight: 600, color: pending ? BODY : TEXT, marginTop: 34 }}>{s.name}</div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 20,
          color: running ? ACCENT_INK : BODY,
          marginTop: 14,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: running ? ACCENT_INK : MUTED }}>$ </span>
        {s.cmd}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ height: 4, borderRadius: 2, background: '#ECE5DC', overflow: 'hidden' }}>
        <div
          style={{
            width: s.state === 'done' ? '100%' : running ? '64%' : '0%',
            height: '100%',
            background: running ? ACCENT : '#A8A29E',
            transformOrigin: 'left',
            animation: live ? `cb-grow 1200ms ${EASE} ${400 + i * 120}ms both` : undefined,
          }}
        />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, marginTop: 12 }}>
        {running ? '0:46 · 64%' : s.time}
      </div>
    </div>
  );
};
```

## 动效

- 风格：克制但有生命感。所有关键帧见上面的 `styles`。
- **每个动画都以 `useIsActivePage()` 为开关**：页面组件里 `const live = useIsActivePage();`，入场统一用 `enter(live, delay, dur)`，其余动画写成 `animation: live ? '...' : undefined`。`live` 为 false 时不挂动画，缩略图和导出直接显示最终状态；进行中节点的扩散圈在非活动页设为 `opacity: 0`。
- 入场：文字块 `cb-fadeUp` 700 ms；浮窗、卡片 800–900 ms，依次错开 90–160 ms。
- 光标：输入框里的珊瑚红光标跑 `cb-caret 1.1s steps(1) infinite`。
- 光晕：`cb-glow 5s ease-in-out infinite`，只做明暗呼吸，不移动。
- 流水线：进度轨道和每张卡的进度条用 `cb-grow`（`transformOrigin: 'left'`）从左往右长出来；进行中的节点叠一层 `cb-pulse` 扩散圈。
- 结尾页：亮起的 K 键在入场后用 `cb-press` 被「按下」一次。

## 气质

一个清晨的开发者工具发布页。画面像精致的 macOS 效率工具浅色截图：暖白的纸面上铺着若隐若现的点阵，一扇白色浮窗带着暖棕柔影悬在那里，身后压着一扇墨色终端，珊瑚红的晨光从它背后晕开。叙述用无衬线，凡是在说文件、路径、命令、按键的地方都用等宽；命令副标题保留英文标识符（`workflow · deploy-staging`），像真实工具里的命令 ID。

每页必须有一个**界面式**的视觉主体（面板、流水线、键帽、终端……），文字只占画面一侧或一层，不要只放一行标题加一团光。层次靠描边、暖色投影、墨色终端的明暗对比和光晕的位置拉开，而不是靠更多颜色。

避免：纯黑投影和只在暗底上成立的发光（`0 0 24px` 一类的珊瑚外发光）、浅灰小字、珊瑚色 `#FF6363` 直接做文字、多色配色、照片和外部图片、装饰性 emoji、直角卡片、中文斜体与负字距、低于 20 px 的字、比 `#57524C` 更浅的正文、紫色 / 蓝色的极光式大面积渐变（那是另一个主题的语言）。

## 示例

完整的三页演示，结构各不相同，可以直接当起点改文案。

```tsx
const TOTAL = 3;

const coverCommands: Command[] = [
  { icon: 'rocket', title: '发布到预发环境', sub: 'workflow · deploy-staging', kbd: ['↵'] },
  { icon: 'split', title: '灰度发布到生产（10%）', sub: 'workflow · canary-release', kbd: ['⌘', 'P'] },
  { icon: 'undo', title: '回滚到上一个版本', sub: 'workflow · rollback', kbd: ['⌘', 'Z'] },
  { icon: 'clock', title: '查看最近的发布记录', sub: 'pipeline · history', kbd: ['⌘', 'H'] },
];

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={pageBase}>
      <style>{styles}</style>
      <DotGrid x={1400} y={540} r={1000} />
      <Glow x={1300} y={640} size={1700} opacity={0.3} live={live} />
      {/* 背后的终端窗口，制造前后层次 */}
      <div style={{ ...abs(1180, 112), animation: enter(live, 0, 900) }}>
        <MacWindow title="~/apps/checkout — zsh" width={640}>
          <div style={{ padding: '22px 26px', fontFamily: MONO, fontSize: 20, lineHeight: 1.75, color: '#D6D3D1' }}>
            <div>
              <span style={{ color: ACCENT }}>$</span> git push origin main
            </div>
            <div>✓ build 1m12s · ✓ test 2m40s</div>
            <div>→ waiting for deploy…</div>
          </div>
        </MacWindow>
      </div>
      <div style={{ ...abs(1000, 268), animation: enter(live, 160, 900) }}>
        <CommandPalette query="发布" items={coverCommands} width={800} live={live} />
      </div>

      <div
        style={{
          ...abs(120, 0, 820),
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
          animation: enter(live, 0, 700),
        }}
      >
        <div>
          <Eyebrow>研发效能 · 内部工具</Eyebrow>
        </div>
        <Title>
          整条研发流程，
          <br />
          都在键盘之下。
        </Title>
        <p
          style={{
            fontSize: 30,
            lineHeight: 1.6,
            color: BODY,
            margin: 0,
            maxWidth: 760,
          }}
        >
          提测、发布、回滚，全部收进一个命令面板。
          <br />
          不用切窗口，也不用翻文档。
        </p>
        <div style={{ display: 'flex', gap: 64, marginTop: 8, paddingTop: 36, borderTop: `1px solid ${BORDER}`, width: 700 }}>
          {[
            ['42', '条流水线已接入'],
            ['3.2', '分钟平均上线'],
            ['0', '次手工发布'],
          ].map(([n, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 52, fontWeight: 600, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
              <span style={{ fontSize: 22, color: MUTED }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <Footer pageNum={1} total={TOTAL} path="/developers" />
    </div>
  );
};
```

```tsx
const stages: Stage[] = [
  { name: '提交', cmd: 'git push', time: '0:08', state: 'done' },
  { name: '构建', cmd: 'cb build', time: '1:12', state: 'done' },
  { name: '测试', cmd: 'cb test --all', time: '2:40', state: 'done' },
  { name: '预发', cmd: 'cb deploy staging', time: '0:46', state: 'running' },
  { name: '灰度上线', cmd: 'cb canary 10%', time: '待触发', state: 'pending' },
];

const Content: Page = () => {
  const live = useIsActivePage();
  const nodeY = 392;
  const firstX = stageX(0) + STAGE_W / 2;
  const runX = stageX(3) + STAGE_W / 2;
  const lastX = stageX(4) + STAGE_W / 2;
  return (
    <div style={pageBase}>
      <style>{styles}</style>
      <DotGrid x={1150} y={600} r={1100} />
      <Glow x={runX} y={620} size={1000} opacity={0.2} live={live} />

      <div style={{ ...abs(120, 108), animation: enter(live, 0, 700) }}>
        <Eyebrow>研发流程</Eyebrow>
      </div>
      <div style={{ ...abs(120, 178, 1000), animation: enter(live, 60, 700) }}>
        <Heading>从提交到上线，一条命令走完。</Heading>
      </div>
      <p
        style={{
          ...abs(1180, 176, 620),
          margin: 0,
          fontSize: 28,
          lineHeight: 1.6,
          color: BODY,
          animation: enter(live, 120, 700),
        }}
      >
        每道工序都是面板里的一条命令，
        <br />
        跑到哪、卡在哪，一眼看清。
      </p>

      {/* 进度轨道 */}
      <div style={{ ...abs(firstX, nodeY - 1, lastX - firstX), height: 2, background: '#D9D0C5' }} />
      <div
        style={{
          ...abs(firstX, nodeY - 1, runX - firstX),
          height: 2,
          background: `linear-gradient(90deg, #A8A29E, ${ACCENT})`,
          transformOrigin: 'left',
          animation: live ? `cb-grow 1400ms ${EASE} 200ms both` : undefined,
        }}
      />
      {stages.map((s, i) => {
        const cx = stageX(i) + STAGE_W / 2;
        const running = s.state === 'running';
        const size = running ? 18 : 14;
        return (
          <div key={s.name} style={{ ...abs(cx - size / 2, nodeY - size / 2), width: size, height: size }}>
            {running && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: ACCENT,
                  animation: live ? 'cb-pulse 1.6s ease-out infinite' : undefined,
                  opacity: live ? undefined : 0,
                }}
              />
            )}
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                boxSizing: 'border-box',
                background: s.state === 'pending' ? BG : running ? ACCENT : MUTED,
                border: s.state === 'pending' ? '2px solid #CFC5B9' : 'none',
                boxShadow: running ? '0 0 0 6px rgba(255,99,99,0.2), 0 4px 14px rgba(255,99,99,0.5)' : 'none',
              }}
            />
          </div>
        );
      })}
      {/* 卡片与轨道之间的短竖线 */}
      {stages.map((s, i) => (
        <div
          key={`stem-${s.name}`}
          style={{
            ...abs(stageX(i) + STAGE_W / 2, nodeY + 14),
            width: 1,
            height: 452 - nodeY - 14,
            background: s.state === 'running' ? 'rgba(255,99,99,0.6)' : '#D9D0C5',
          }}
        />
      ))}
      {stages.map((s, i) => (
        <StageCard key={s.name} s={s} i={i} live={live} />
      ))}

      {/* 键位提示条 */}
      <div
        style={{
          ...abs(120, 812, 1680),
          height: 104,
          boxSizing: 'border-box',
          borderRadius: 18,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 18px 44px rgba(122,62,40,0.08), 0 2px 4px rgba(28,25,23,0.04)',
          display: 'flex',
          alignItems: 'center',
          animation: enter(live, 600),
        }}
      >
        {[
          { keys: ['⌘', 'K'], label: '唤起命令面板' },
          { keys: ['⌘', '↵'], label: '跑下一道工序' },
          { keys: ['⌘', 'Z'], label: '一键回滚到上一版' },
        ].map((h, i) => (
          <div
            key={h.label}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
              height: 56,
            }}
          >
            {h.keys.map((k) => (
              <Kbd key={k} size={44}>
                {k}
              </Kbd>
            ))}
            <span style={{ fontSize: 26, color: '#3F3A36', marginLeft: 12 }}>{h.label}</span>
          </div>
        ))}
      </div>
      <Footer pageNum={2} total={TOTAL} path="/developers/pipeline" />
    </div>
  );
};
```

```tsx
const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={pageBase}>
      <style>{styles}</style>
      <DotGrid x={960} y={400} r={900} />
      <Glow x={1110} y={420} size={1150} opacity={0.28} live={live} />

      <div
        style={{
          ...abs(0, 176, 1920),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 56,
        }}
      >
        <div style={{ animation: enter(live, 0, 900) }}>
          <KeyCap size={236}>⌘</KeyCap>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 64, color: MUTED, animation: enter(live, 120, 900) }}>+</span>
        <div style={{ animation: enter(live, 200, 900) }}>
          <div style={{ animation: live ? `cb-press 900ms ${EASE} 1300ms both` : undefined }}>
            <KeyCap size={236} lit>K</KeyCap>
          </div>
        </div>
      </div>

      <div
        style={{
          ...abs(0, 556, 1920),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          animation: enter(live, 300, 800),
        }}
      >
        <Title size={96} align="center">
          现在，按下它。
        </Title>
        <p style={{ margin: 0, fontSize: 30, lineHeight: 1.6, color: BODY, textAlign: 'center' }}>
          三分钟接入你的第一条流水线，剩下的交给命令面板。
        </p>
        <div
          style={{
            marginTop: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 22,
            padding: '18px 18px 18px 30px',
            borderRadius: 14,
            background: INK,
            border: '1px solid #2E2A27',
            boxShadow: '0 24px 60px rgba(122,62,40,0.20), 0 6px 16px rgba(28,25,23,0.12)',
            fontFamily: MONO,
            fontSize: 26,
            color: '#F5F5F4',
          }}
        >
          <span>
            <span style={{ color: ACCENT }}>$ </span>npx devflow init
          </span>
          <span
            style={{
              fontSize: 20,
              color: '#D6D3D1',
              padding: '6px 14px',
              borderRadius: 8,
              background: '#2E2A27',
              border: '1px solid #3A3532',
            }}
          >
            复制
          </span>
        </div>
      </div>
      <Footer pageNum={TOTAL} total={TOTAL} path="/developers/quickstart" />
    </div>
  );
};
```
