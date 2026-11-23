---
name: 霓虹终端
description: 深色开发者终端海报风：全等宽字体、霓虹绿 + 青色两级高亮、终端窗口 / TUI 面板 / 日志流做视觉主体，闪烁光标与 CRT 扫描线。
mode: dark
---

# 霓虹终端

改编自 open-slide 官方主题 Neon Terminal（MIT），已汉化，只用系统字体，不加载任何外部字体和资源。

目标不是「黑底上放几行字」，而是一张精致的终端 / TUI 海报（参考 Warp 的窗口、Charm 的 TUI、btop 的面板）：**每页都有一个用 CSS 画出来的终端物件做视觉主体**——带红黄绿圆点的终端窗口、嵌标题的 TUI 面板、日志流、进度条和柱状迷你图、像素块大字。

## 配色

| 角色    | 色值      | 用途                                                       |
| ------- | --------- | ---------------------------------------------------------- |
| bg      | `#06080b` | 页面近黑底                                                 |
| surface | `#0c1117` | 终端窗口正文底色、状态栏、键帽                             |
| bar     | `#111821` | 终端窗口标题栏                                             |
| text    | `#e6edf3` | 米白正文、命令                                             |
| green   | `#39ff88` | 霓虹绿：提示符、光标、OK / HMR 标签、关键数字、主要高亮    |
| cyan    | `#5cd0ff` | 辅助青色：路径、文件名、键名、INFO 标签、第二级信息        |
| amber   | `#ffb454` | 琥珀：只给 WARN、异常值、第三个面板标题，一页最多一两处    |
| muted   | `#8b9b96` | 注释、时间戳、元信息。**不能再暗**，投影仪上也要读得清     |
| line    | `#223041` | 窗口 / 面板 1px 边框、分隔线                               |
| track   | `#1f3a2c` | 进度条未填满的格子                                         |

- 信息分三级：**绿**＝此刻最重要的一件事（每页 1～3 处）；**青**＝可点、可输入的东西（路径、命令参数、键名）；**米白 / 灰绿**＝正文和说明。琥珀是唯一的「警示」色，别拿来装饰。
- 红黄绿 `#ff5f57 / #febc2e / #28c840` 只用于终端窗口标题栏的三个圆点。
- 发光只用两层 `text-shadow`（下面的 `GLOW`），小于 32px 的文字不加发光，免得糊。

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。全篇一套等宽栈：`"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace`。中文没有等宽字形，会落到苹方 / 微软雅黑，和等宽西文放一起不突兀。
- 字重：大标题 700，页面标题 600，正文 400；标签 700。
- 字号（1920×1080 画布）：
  - 封面大标题 128 px（`$` + 不超过 5 个汉字 + 光标，一行）；结尾标题 112 px。
  - 页面标题 64 px。
  - 大数字 96 px（仪表盘里的主指标）。
  - 正文 / 命令 / 日志 / 键值表：**不小于 26 px**；路径大字 32 px。
  - 眉标 24 px，状态栏 / 面板标题 / 元信息：**不小于 20 px**。
- 中英混排对齐：
  - 一个汉字约 1.67ch，不成整数倍，**不要用空格对齐列**。需要对齐的列（时间戳、级别、命令、键名）用 flex，西文列用 `ch` 定宽（`width: '26ch'`），中文放在最后一列自然流动。
  - 中文与西文、数字之间留一个半角空格，如「第 01 期」「试试 man open-slide」。
  - 中文不用负字距、不用斜体：标题 `letterSpacing: 0`，眉标 `0.05em`。
- 文案：提示符（`$`、`>`、`~/deck`）、命令、路径、日志级别保留英文；标题、说明、注释用自然的中文。注释以 `#` 或 `//` 开头，符号本身染绿。

## 版式

- 画布 1920×1080，左右边距 100 px，内容区宽 1720 px。所有块用绝对定位（`abs(x, y, w)`），状态栏固定在 `y = 994`。
- 每页一个视觉主体，三种页型不要雷同：
  - **封面**：左半（x 100–860）眉标 → 大标题 + 光标 → `//` 副标题 → 虚线分隔的键值表（speaker / when / length）；右半（x 1000–1820）一个终端窗口，里面是 `open-slide dev` 的启动日志、进度条、统计行、带光标的下一条命令。左列顶部和窗口顶部对齐（y 150），键值表底部和窗口底部对齐。
  - **内容页（仪表盘）**：顶部眉标 + 64 px 标题，右上角一小段运行状态；下面 2×2 的 TUI 面板网格：大面板放主内容（树形列表 `├─ └─`），旁边放指标面板（大数字 + 柱状迷你图 + 进度条），底部一条日志流面板 + 一个快捷键面板。面板间距 40 px。
  - **结尾**：左上像素块大字（如 `EOF`），右侧大标题 + 光标 + 一句致谢；下方通栏终端窗口，`history | tail -3` 回顾三条要点，最后一行 `$ logout` + 光标。
- 背景：近黑 + 48 px 极淡青色网格 + 主体背后一团很淡的绿色径向微光 + 最上层 4 px 周期的 CRT 扫描线。网格和扫描线都要「几乎看不见」，只提供质感。
- 留白有意图：窗口和面板把画面撑满，标题区、主体、状态栏三段分明；不要出现半屏空黑。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去。

```tsx
import { type Page, useIsActivePage } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// 只用系统字体，不加载任何外部字体；中文会落到苹方 / 雅黑
const MONO = '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

const C = {
  bg: '#06080b',
  surface: '#0c1117',
  bar: '#111821',
  text: '#e6edf3',
  green: '#39ff88',
  cyan: '#5cd0ff',
  amber: '#ffb454',
  muted: '#8b9b96',
  line: '#223041',
  track: '#1f3a2c',
};
const GLOW = '0 0 6px rgba(57, 255, 136, 0.55), 0 0 18px rgba(57, 255, 136, 0.25)';

const styles = `
@keyframes nt-blink { 50% { visibility: hidden; } }
@keyframes nt-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes nt-line { from { opacity: 0; } to { opacity: 1; } }
@keyframes nt-pixel { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
`;

// 只在当前页播放；缩略图 / 非当前页直接是最终状态
const anim = (live: boolean, value: string): CSSProperties => (live ? { animation: value } : {});
// 逐行出现：第 i 行在 i * step 毫秒后瞬间亮起
const lineIn = (live: boolean, i: number, step = 160, base = 200): CSSProperties =>
  anim(live, `nt-line 1ms steps(1, end) ${base + i * step}ms both`);
```

### Stage（页面底板）

每页的根节点。`glow` 指定绿色微光的中心，放在这一页视觉主体的背后。

```tsx
// 页面底板：近黑 + 极淡网格 + 主体背后的绿色微光 + CRT 扫描线
const Stage = ({ children, glow = '70% 45%' }: { children: ReactNode; glow?: string }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: C.bg,
      color: C.text,
      fontFamily: MONO,
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    <style>{styles}</style>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(92, 208, 255, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(92, 208, 255, 0.045) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(900px 620px at ${glow}, rgba(57, 255, 136, 0.09), transparent 70%)`,
      }}
    />
    {children}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.11) 0 1px, transparent 1px 4px)',
      }}
    />
  </div>
);

const abs = (left: number, top: number, width?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
});
```

### Cursor（方块光标）

只用 `step-end` + `visibility` 闪烁，并且**只在当前页闪**：缩略图 / 非当前页不挂动画，光标常亮，截图里一定看得见。

```tsx
// 方块光标：step-end + visibility，只在后半秒隐藏；非当前页不闪，常亮
const Cursor = ({ live, h = '1em' }: { live: boolean; h?: string }) => (
  <span
    aria-hidden
    style={{
      display: 'inline-block',
      width: '0.55em',
      height: h,
      marginLeft: '0.15em',
      background: C.green,
      boxShadow: '0 0 14px rgba(57, 255, 136, 0.6)',
      verticalAlign: '-0.12em',
      ...anim(live, 'nt-blink 1s step-end infinite'),
    }}
  />
);
```

### Eyebrow（眉标）

```tsx
const Eyebrow = ({ children, color = C.green }: { children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.05em', color }}>
    <span style={{ color: C.muted }}>[ </span>
    {children}
    <span style={{ color: C.muted }}> ]</span>
  </div>
);
```

### TermWindow（终端窗口）

macOS 式标题栏 + 红黄绿圆点 + 居中标题；1px 边框、圆角 14、内发光、柔和投影。正文 26 px。窗口里第一行通常是 `~/deck $ 命令`。

```tsx
// 终端窗口：标题栏 + 红黄绿圆点 + 1px 边框 + 内发光 + 柔和投影
const TermWindow = ({
  title,
  children,
  style,
  bodyStyle,
}: {
  title: string;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow:
        'inset 0 0 0 1px rgba(255, 255, 255, 0.03), inset 0 0 80px rgba(57, 255, 136, 0.05), 0 0 0 1px rgba(57, 255, 136, 0.08), 0 40px 100px rgba(0, 0, 0, 0.6), 0 0 60px rgba(57, 255, 136, 0.08)',
      ...style,
    }}
  >
    <div
      style={{
        position: 'relative',
        height: 56,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 22px',
        background: C.bar,
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <span key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
      ))}
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 20,
          color: C.muted,
          pointerEvents: 'none',
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ flex: 1, padding: '30px 36px', fontSize: 26, lineHeight: 1.75, ...bodyStyle }}>{children}</div>
  </div>
);
```

### Panel（TUI 面板）

btop 风格：直角 1px 细框，左上 `┤ 标题 ├` 嵌在边框上，右上可放灰色元信息。面板底色和页面底色一致（`C.bg`），这样嵌在边框上的标题才能「切开」边框。标题色按信息层级选：绿 / 青 / 琥珀。

```tsx
// TUI 面板：直角细框，标题嵌在上边框里（btop 风格）
const Panel = ({
  title,
  meta,
  color = C.green,
  children,
  style,
}: {
  title: string;
  meta?: string;
  color?: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      position: 'absolute',
      background: C.bg,
      border: `1px solid ${C.line}`,
      boxShadow: 'inset 0 0 40px rgba(57, 255, 136, 0.03)',
      padding: '40px 36px 28px',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: -16,
        left: 24,
        padding: '0 12px',
        background: C.bg,
        fontSize: 22,
        lineHeight: '32px',
        color,
      }}
    >
      ┤ {title} ├
    </div>
    {meta && (
      <div
        style={{
          position: 'absolute',
          top: -16,
          right: 24,
          padding: '0 12px',
          background: C.bg,
          fontSize: 20,
          lineHeight: '32px',
          color: C.muted,
        }}
      >
        {meta}
      </div>
    )}
    {children}
  </div>
);
```

### AsciiBar（进度条）与 Spark（柱状迷你图）

进度条保留终端的 `[ ]` 括号，格子用 CSS 画（`█ ░` 字符在不同字体里会有缝）。迷你图里最大值自动染琥珀，提示异常。

```tsx
// 进度条：方括号 + 一格 1ch 的方块单元（用 CSS 画，不用 █ 字符，避免字形之间的缝）
const AsciiBar = ({ value, width = 20, color = C.green }: { value: number; width?: number; color?: string }) => {
  const n = Math.round((value / 100) * width);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'pre' }}>
      <span style={{ color: C.muted }}>[</span>
      {Array.from({ length: width }, (_, i) => (
        <span
          key={i}
          style={{
            width: 'calc(1ch - 3px)',
            marginRight: 3,
            height: '0.8em',
            background: i < n ? color : C.track,
            boxShadow: i < n ? `0 0 10px ${color}55` : undefined,
          }}
        />
      ))}
      <span style={{ color: C.muted }}>]</span>
    </span>
  );
};

// 柱状迷你图：每根柱子一个 div，高度按数值
const Spark = ({ data, color = C.green, height = 96 }: { data: number[]; color?: string; height?: number }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, borderBottom: `1px solid ${C.line}` }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: v === max ? C.amber : color,
            opacity: v === max ? 1 : 0.55 + (v / max) * 0.45,
          }}
        />
      ))}
    </div>
  );
};
```

### Tag 与 LogLine（日志行）

时间戳（灰）+ 反色级别标签（6ch 定宽）+ 消息。消息里路径染青，结论染绿。

```tsx
// 级别标签：反色小块，固定 6ch
const LEVEL: Record<string, string> = { OK: C.green, INFO: C.cyan, HMR: C.green, WARN: C.amber };
const Tag = ({ level }: { level: keyof typeof LEVEL | string }) => (
  <span
    style={{
      display: 'inline-block',
      width: '6ch',
      flexShrink: 0,
      textAlign: 'center',
      fontSize: '0.85em',
      fontWeight: 700,
      lineHeight: 1.5,
      color: C.bg,
      background: LEVEL[level] ?? C.muted,
      borderRadius: 3,
    }}
  >
    {level}
  </span>
);

// 日志行：时间戳 + 级别标签 + 消息（列宽用 ch 定死）
const LogLine = ({
  time,
  level,
  children,
  style,
}: {
  time: string;
  level: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5ch', whiteSpace: 'nowrap', ...style }}>
    <span style={{ color: C.muted, width: `${time.length}ch`, flexShrink: 0 }}>{time}</span>
    <Tag level={level} />
    <span style={{ minWidth: 0 }}>{children}</span>
  </div>
);
```

### StatusBar（状态栏）

tmux 风格，每页都有：绿色页码块 + 章节 + 路径，右侧编码和页码。

```tsx
// 底部状态栏（tmux 风格）：左边绿色模式块 + 章节，右边路径与页码
const StatusBar = ({ page, total, section }: { page: number; total: number; section: string }) => (
  <div
    style={{
      ...abs(100, 994, 1720),
      height: 46,
      display: 'flex',
      alignItems: 'center',
      fontSize: 20,
      background: C.surface,
      border: `1px solid ${C.line}`,
      color: C.muted,
    }}
  >
    <span style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', padding: '0 18px', background: C.green, color: C.bg, fontWeight: 700 }}>
      {String(page).padStart(2, '0')}
    </span>
    <span style={{ padding: '0 18px', color: C.text }}>{section}</span>
    <span style={{ color: C.line }}>│</span>
    <span style={{ padding: '0 18px', color: C.cyan }}>~/deck</span>
    <span style={{ marginLeft: 'auto', padding: '0 18px' }}>utf-8 · zsh</span>
    <span style={{ padding: '0 18px', color: C.text, borderLeft: `1px solid ${C.line}` }}>
      {String(page).padStart(2, '0')}/{String(total).padStart(2, '0')}
    </span>
  </div>
);
```

### PixelWord（像素块大字）

用 5×7 点阵画大号英文字（结尾的 `EOF`、封面的短代号等），每个点是一个发光绿块，下面垫一层错位的青色阴影。需要别的字母时按同样格式在 `GLYPHS` 里补点阵。

```tsx
const GLYPHS: Record<string, string[]> = {
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
};

// 像素块标题：每个点是一个发光方块，下面垫一层青色错位阴影
const PixelWord = ({ word, cell = 40, gap = 6, live }: { word: string; cell?: number; gap?: number; live: boolean }) => {
  const step = cell + gap;
  const glyphW = 5 * step;
  let k = 0;
  return (
    <div style={{ position: 'relative', width: word.length * (glyphW + step) - step, height: 7 * step }}>
      {word.split('').map((ch, gi) =>
        GLYPHS[ch].flatMap((row, y) =>
          row.split('').map((bit, x) => {
            if (bit !== '1') return null;
            const left = gi * (glyphW + step) + x * step;
            const top = y * step;
            const delay = 150 + (k++ % 40) * 22;
            return (
              <div key={`${gi}-${x}-${y}`} style={{ position: 'absolute', left, top, width: cell, height: cell }}>
                <div style={{ position: 'absolute', left: 10, top: 10, width: cell, height: cell, background: 'rgba(92, 208, 255, 0.5)' }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: C.green,
                    boxShadow: '0 0 18px rgba(57, 255, 136, 0.45)',
                    ...anim(live, `nt-pixel 260ms ease-out ${delay}ms both`),
                  }}
                />
              </div>
            );
          }),
        ),
      )}
    </div>
  );
};
```

## 动效

- 原则：像终端在运行。全部以 `useIsActivePage()` 为开关（`anim(live, …)`、`lineIn(live, …)`），非当前页没有动画，直接是最终状态。
- 光标闪烁：`nt-blink 1s step-end infinite`，只在后半秒隐藏。
- 标题逐字打出：`nt-type 700ms steps(6, end) both`（clip-path 从左往右揭开），步数≈字数 + 1。
- 日志 / 历史命令逐行出现：`lineIn(live, i, step, base)`，每行间隔 160–220 ms，整页在 2 秒内放完。
- 迷你图从左往右揭开（`nt-type`），像素大字逐块弹出（`nt-pixel`）。
- 不要做整页闪烁、抖动、彩色故障效果。

## 气质

深夜工位上一台调教得很好的终端：深色、安静、精确，信息密度高但层次清楚。像 Warp 的窗口、Charm 的 TUI、btop 的面板那样有「产品级」的完成度——细边框、准确的对齐、一点点霓虹发光。终端窗口可以有圆角和柔和投影，TUI 面板保持直角。避免：衬线字体、照片和外部图片、马卡龙色、大面积渐变、看不清的暗灰注释、只有一行字的空页面、中文斜体和中文负字距。如果这一页截出来能当一个开发工具的官网海报，它就对味了。

## 示例

封面（终端窗口做主体）：

```tsx
const TOTAL = 3;

const Cover: Page = () => {
  const live = useIsActivePage();
  const boot: [string, string, ReactNode][] = [
    ['0.004', 'INFO', '启动 open-slide 运行时'],
    ['0.012', 'OK', <>读取配置 <span style={{ color: C.cyan }}>config.ts</span></>],
    ['0.041', 'OK', <>挂载主题 <span style={{ color: C.cyan }}>neon-terminal</span></>],
    ['0.087', 'OK', <>监听目录 <span style={{ color: C.cyan }}>slides/</span></>],
    ['0.093', 'WARN', <>讲者咖啡余量 <span style={{ color: C.amber }}>32%</span></>],
    ['0.118', 'OK', <>开发服务器 <span style={{ color: C.cyan }}>:5173</span></>],
  ];
  return (
    <Stage glow="72% 50%">
      <div style={abs(100, 156)}>
        <Eyebrow>技术分享 · 第 01 期</Eyebrow>
      </div>
      <h1
        style={{
          ...abs(100, 262),
          margin: 0,
          fontSize: 128,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: C.green, textShadow: GLOW, marginRight: '0.35em' }}>$</span>
        <span style={{ display: 'inline-block', ...anim(live, 'nt-type 700ms steps(6, end) both') }}>系统启动中</span>
        <Cursor live={live} h="0.9em" />
      </h1>
      <p style={{ ...abs(100, 440, 760), margin: 0, fontSize: 32, lineHeight: 1.6, color: C.muted }}>
        <span style={{ color: C.green }}>//</span> 用十五分钟走一遍运行时、通信协议，以及我们至今还不放心的那几处。
      </p>
      <div style={{ ...abs(100, 690, 760), fontSize: 26, lineHeight: 1.9 }}>
        {[
          ['speaker', '林一 · 前端基础设施组'],
          ['when', '2026.11.16 14:00'],
          ['length', '15 min · 3 段'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', borderTop: `1px dashed ${C.line}` }}>
            <span style={{ width: '10ch', flexShrink: 0, color: C.cyan }}>{k}</span>
            <span style={{ color: C.text }}>{v}</span>
          </div>
        ))}
      </div>

      <TermWindow title="boot — open-slide@2.3.2" style={{ ...abs(1000, 150, 820), height: 690 }} bodyStyle={{ lineHeight: 1.85 }}>
        <div style={{ color: C.muted }}>
          <span style={{ color: C.green }}>~/deck</span> <span style={{ color: C.text }}>$ open-slide dev</span>
        </div>
        <div style={{ height: 14 }} />
        {boot.map(([t, lv, msg], i) => (
          <LogLine key={t} time={t} level={lv} style={lineIn(live, i)}>
            {msg}
          </LogLine>
        ))}
        <div style={{ height: 26 }} />
        <div style={{ ...lineIn(live, boot.length), display: 'flex', gap: '1.5ch', whiteSpace: 'nowrap' }}>
          <span style={{ color: C.text }}>编译页面</span>
          <AsciiBar value={92} width={22} />
          <span style={{ color: C.green, textShadow: GLOW }}>92%</span>
        </div>
        <div style={{ ...lineIn(live, boot.length + 1), display: 'flex', gap: '3ch', color: C.muted }}>
          <span>pages <span style={{ color: C.text }}>03</span></span>
          <span>hmr <span style={{ color: C.green }}>38ms</span></span>
          <span>errors <span style={{ color: C.text }}>0</span></span>
        </div>
        <div style={{ height: 26 }} />
        <div style={lineIn(live, boot.length + 2)}>
          <span style={{ color: C.green }}>~/deck</span> <span style={{ color: C.text }}>$ open-slide present</span>
          <Cursor live={live} />
        </div>
      </TermWindow>
      <StatusBar page={1} total={TOTAL} section="开场" />
    </Stage>
  );
};
```

内容页（TUI 仪表盘）：

```tsx
const HMR_MS = [32, 41, 30, 66, 44, 35, 31, 52, 40, 33, 112, 45, 34, 30, 41, 36, 70, 33, 31, 42, 35, 30, 58, 38];

const Content: Page = () => {
  const live = useIsActivePage();
  const watch = [
    { path: 'slides/', note: '你的演示文稿，一页一个组件', badge: '3 页' },
    { path: 'themes/', note: '视觉主题：配色、字体、固定组件', badge: '1 套' },
    { path: 'open-slide.config.ts', note: '各种配置开关，改完自动重启', badge: '12 项' },
  ];
  return (
    <Stage glow="30% 55%">
      <div style={abs(100, 80)}>
        <Eyebrow>02 · 运行时</Eyebrow>
      </div>
      <h2 style={{ ...abs(100, 128), margin: 0, fontSize: 64, fontWeight: 600, lineHeight: 1.25, letterSpacing: 0 }}>
        开发服务器时刻盯着的三处
      </h2>
      <div style={{ ...abs(1240, 150, 580), textAlign: 'right', fontSize: 22, color: C.muted, lineHeight: 1.7 }}>
        <span style={{ color: C.green, textShadow: GLOW }}>●</span> watching · pid 4127
        <br />
        uptime <span style={{ color: C.text }}>00:42:17</span>
      </div>

      <Panel title="watch" meta="3 paths" style={{ ...abs(100, 290, 1000), height: 400 }}>
        {watch.map((w, i) => (
          <div key={w.path} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: i < 2 ? 26 : 0 }}>
            <span style={{ width: '3ch', flexShrink: 0, color: C.muted, fontSize: 28, lineHeight: 1.4 }}>
              {i < 2 ? '├─' : '└─'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, lineHeight: 1.4, color: C.cyan }}>{w.path}</div>
              <div style={{ fontSize: 26, lineHeight: 1.5, color: C.muted }}>
                <span style={{ color: C.green }}>#</span> {w.note}
              </div>
            </div>
            <span style={{ fontSize: 22, lineHeight: '45px', color: C.green, whiteSpace: 'nowrap' }}>
              ● {w.badge}
            </span>
          </div>
        ))}
      </Panel>

      <Panel title="hmr" meta="最近 24 次" color={C.cyan} style={{ ...abs(1140, 290, 680), height: 400 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, color: C.green, textShadow: GLOW }}>38</span>
          <span style={{ fontSize: 30, color: C.text }}>ms</span>
          <span style={{ marginLeft: 'auto', fontSize: 22, color: C.muted }}>p50 · 单次热更新</span>
        </div>
        <div style={{ marginTop: 26, ...anim(live, 'nt-type 900ms steps(24, end) 200ms both') }}>
          <Spark data={HMR_MS} />
        </div>
        <div style={{ marginTop: 26, fontSize: 26, lineHeight: 1.7 }}>
          {[
            ['cache', 82, C.green],
            ['cpu', 23, C.cyan],
          ].map(([k, v, c]) => (
            <div key={k as string} style={{ display: 'flex', gap: '1.5ch', whiteSpace: 'nowrap' }}>
              <span style={{ width: '5ch', color: C.muted }}>{k}</span>
              <AsciiBar value={v as number} width={18} color={c as string} />
              <span style={{ color: C.text }}>{String(v).padStart(3, ' ')}%</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="log" meta="tail -f" color={C.amber} style={{ ...abs(100, 730, 1200), height: 228 }}>
        <div style={{ fontSize: 26, lineHeight: 1.65 }}>
          <LogLine time="14:02:07.381" level="INFO" style={lineIn(live, 0, 220, 500)}>
            检测到改动 <span style={{ color: C.cyan }}>slides/intro.tsx</span>
          </LogLine>
          <LogLine time="14:02:07.402" level="WARN" style={lineIn(live, 1, 220, 500)}>
            <span style={{ color: C.cyan }}>themes/neon.md</span> 未保存，先按旧版本渲染
          </LogLine>
          <LogLine time="14:02:07.419" level="HMR" style={lineIn(live, 2, 220, 500)}>
            <span style={{ color: C.green, textShadow: GLOW }}>每次保存都会热更新</span>
            <span style={{ color: C.muted }}> · 38ms</span>
            <Cursor live={live} />
          </LogLine>
        </div>
      </Panel>
      <Panel title="keys" style={{ ...abs(1340, 730, 480), height: 228 }}>
        <div style={{ fontSize: 26, lineHeight: 1.65 }}>
          {[
            ['r', '重启服务器'],
            ['o', '在浏览器打开'],
            ['q', '退出'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '1.5ch' }}>
              <span
                style={{
                  width: '3ch',
                  textAlign: 'center',
                  lineHeight: 1.35,
                  border: `1px solid ${C.line}`,
                  borderBottomWidth: 3,
                  borderRadius: 6,
                  color: C.green,
                  background: C.surface,
                }}
              >
                {k}
              </span>
              <span style={{ color: C.text }}>{v}</span>
            </div>
          ))}
        </div>
      </Panel>
      <StatusBar page={2} total={TOTAL} section="运行时" />
    </Stage>
  );
};
```

结尾页（像素大字 + 通栏窗口）：

```tsx
const Closer: Page = () => {
  const live = useIsActivePage();
  const recap = [
    ['open-slide dev', '先跑起来，改动即时可见', '14:02'],
    ['vim themes/*.md', '主题是一份规范，照着写就统一', '14:06'],
    ['git commit -m "ship"', '小步提交，随时能回到上一页', '14:13'],
  ];
  return (
    <Stage glow="28% 38%">
      <div style={abs(100, 80)}>
        <Eyebrow>EOF · 收尾</Eyebrow>
      </div>
      <div style={abs(110, 172)}>
        <PixelWord word="EOF" live={live} />
      </div>
      <h2
        style={{
          ...abs(1000, 208),
          margin: 0,
          fontSize: 112,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        会话结束
        <Cursor live={live} h="0.9em" />
      </h2>
      <p style={{ ...abs(1000, 364, 820), margin: 0, fontSize: 32, lineHeight: 1.6, color: C.muted }}>
        <span style={{ color: C.green }}>//</span> 感谢收看。还有疑问？试试{' '}
        <span style={{ color: C.cyan }}>man open-slide</span>
      </p>
      <div style={{ ...abs(1000, 462, 820), fontSize: 26, lineHeight: 1.9, color: C.muted }}>
        <div>
          <span style={{ color: C.green }}>exit</span> <span style={{ color: C.text }}>0</span> · 进程已正常退出
        </div>
      </div>

      <TermWindow title="zsh — history | tail -3" style={{ ...abs(100, 620, 1720), height: 310 }}>
        {recap.map(([cmd, note, time], i) => (
          <div key={cmd} style={{ display: 'flex', whiteSpace: 'nowrap', ...lineIn(live, i, 200, 900) }}>
            <span style={{ width: '5ch', flexShrink: 0, color: C.muted }}>{String(i + 1).padStart(3, ' ')}</span>
            <span style={{ width: '2ch', flexShrink: 0, color: C.green }}>$</span>
            <span style={{ width: '26ch', flexShrink: 0, color: C.cyan }}>{cmd}</span>
            <span style={{ color: C.muted }}>
              <span style={{ color: C.green }}>#</span> {note}
            </span>
            <span style={{ marginLeft: 'auto', color: C.muted }}>{time}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, ...lineIn(live, 3, 200, 900) }}>
          <span style={{ color: C.green }}>~/deck</span> <span style={{ color: C.text }}>$ logout</span>
          <Cursor live={live} />
          <span style={{ float: 'right', color: C.muted }}>
            3 条命令 · <span style={{ color: C.green }}>0 errors</span>
          </span>
        </div>
      </TermWindow>
      <StatusBar page={TOTAL} total={TOTAL} section="收尾" />
    </Stage>
  );
};

export default [Cover, Content, Closer];
```
