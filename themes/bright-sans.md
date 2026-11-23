---
name: 晴窗
description: 明快友好的产品发布：纯白画布、干净的无衬线黑体、蓝红黄绿四色点缀、柔和的圆角卡片。
mode: light
---

# 晴窗

改编自 open-slide 官方主题 Bright Sans（MIT），已汉化，只用系统字体，不加载任何外部字体。

## 配色

四色点缀体系：蓝色是主色；另外三种每种只出现一次，绝不在同一个标题里同时出现。

| 角色     | 色值      | 用途                         |
| -------- | --------- | ---------------------------- |
| bg       | `#ffffff` | 纯白画布                     |
| surface  | `#f7f9fc` | 浅色内嵌卡片                 |
| text     | `#202124` | 近黑墨色                     |
| accent   | `#1a73e8` | 主蓝，默认的强调色           |
| accent2  | `#ea4335` | 红，用于强调或警示           |
| accent3  | `#fbbc04` | 黄，用于提示标注             |
| accent4  | `#34a853` | 绿，用于确认、上线等正向信息 |
| muted    | `#5f6368` | 次要文字、说明               |
| hairline | `#e8eaed` | 分隔线、卡片描边             |

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 标题与正文统一用一套无衬线：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`。
  - 原作用的是几何无衬线 Inter Tight / Inter。系统字体里最接近的是 SF Pro（西文、数字）配苹方（中文）：同样字面开阔、笔画均匀、没有装饰。保留原作的「清爽感」靠的是克制的字重（标题 600，正文 400）、大量留白和整页只用这一套字体，而不是字形本身。
  - 标题字重 600（苹方最粗为 Semibold），字距 `0.01em`。中文不要用负字距。
  - 正文字重 400，强调用 500–600。
- 字号：
  - 封面大标题：132 px，行高 1.15（一行最多约 12 个字；需要两行时在语义处断开，不要让末行只剩两三个字）。
  - 页面标题：56 px，字重 600，行高 1.2。
  - 卡片标题：34 px，字重 600。
  - 正文：封面 32 px，内容页 24–30 px，行高 1.6。
  - 眉标：20 px，字重 600，字距 `0.04em`，放在胶囊里。
  - 页脚：20 px。

## 版式

- 内边距：左右 120 px，上下 100 px。
- 左对齐，留白宽松。正文宽度上限 `max-width: 1180 px`（约 36 个 32 px 的汉字）。
- 卡片圆角 24 px，内边距 36 px。不加投影，只用 1 px 的 `hairline` 描边。
- 内容页四张卡片排成 2 × 2 网格，间距 24 px；每张卡片：一个 28 px 的彩色圆角方块、标题、一到两行正文。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去（`import type { ReactNode } from 'react';`）。

```tsx
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
```

### Title（封面大标题）

```tsx
const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 132,
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      margin: 0,
      color: '#202124',
    }}
  >
    {children}
  </h1>
);
```

### Footer（页脚）

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = ({
  dotColor = '#1a73e8',
  label = '春季产品更新',
}: {
  dotColor?: string;
  label?: string;
}) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: SANS,
        fontSize: 20,
        color: '#5f6368',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <span
          aria-hidden
          style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor }}
        />
        {label}
      </span>
      <span>
        {current} / {total}
      </span>
    </div>
  );
};
```

### Eyebrow（眉标胶囊）

主色的胶囊标签。次要色（`accent2`–`accent4`）偶尔用来换换节奏；`accent` 主蓝留给封面。眉标写成简短的中文词组（如「新功能」「今天上线」），不要套用英文的全大写写法。

```tsx
const Eyebrow = ({
  children,
  tone = 'blue',
}: {
  children: ReactNode;
  tone?: 'blue' | 'red' | 'yellow' | 'green';
}) => {
  const fill =
    tone === 'red'
      ? '#ea4335'
      : tone === 'yellow'
        ? '#fbbc04'
        : tone === 'green'
          ? '#34a853'
          : '#1a73e8';
  const ink = tone === 'yellow' ? '#202124' : '#ffffff';
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 20px',
        borderRadius: 999,
        background: fill,
        color: ink,
        fontFamily: SANS,
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  );
};
```

### 页面底座

```tsx
const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#ffffff',
  color: '#202124',
  padding: '100px 120px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  WebkitFontSmoothing: 'antialiased',
};
```

## 动效

- 原则：轻柔。
- 可复用的关键帧：

```css
@keyframes bs-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

用在封面的主标题区，以及内容页的每张卡片上（`bs-fadeUp 500ms ease-out both`，卡片依次延迟 `i * 80ms`）。页脚保持静止。

## 气质

一次友好的产品更新：明亮的纯白，充足的呼吸感，整套 deck 只用一套平静的无衬线字体，四种原色在各页之间省着用。卡片圆角柔和但是扁平（没有投影）。避免：渐变、发光、深色模式、投影、与功能无关的装饰性 emoji、打破白色画布的摄影图片。如果这一页放在一个干净的产品官网首屏也毫不违和，那就对了。

## 示例

```tsx
const Cover: Page = () => (
  <div
    style={{
      ...pageBase,
      justifyContent: 'center',
      gap: 40,
      animation: 'bs-fadeUp 500ms ease-out both',
    }}
  >
    <Eyebrow tone="blue">春季更新 · 2026</Eyebrow>
    <Title>为每个重要时刻而生。</Title>
    <p style={{ fontSize: 32, lineHeight: 1.6, color: '#5f6368', maxWidth: 1180, margin: 0 }}>
      四个小功能，让接下来八个月的工作轻松一点。
    </p>
    <Footer />
  </div>
);
```
