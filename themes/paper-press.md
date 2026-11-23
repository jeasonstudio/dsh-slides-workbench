---
name: 铅印小册
description: 浅色印刷感的 deck：奶油色纸面、墨黑宋体大标题、一点朱红点睛，没有任何动效。
mode: light
---

# 铅印小册

改编自 open-slide 官方主题 Paper Press（MIT），已汉化，只用系统字体，不加载任何外部字体。

## 配色

| 角色    | 色值      | 用途                             |
| ------- | --------- | -------------------------------- |
| bg      | `#f6f1e7` | 奶油色，带一点暖意的纸张         |
| surface | `#ffffff` | 可选的内嵌块 / 卡片              |
| text    | `#141210` | 墨黑，主要文字                   |
| accent  | `#c43a1d` | 朱红，每页只用在一处             |
| muted   | `#8a8276` | 暖灰，说明文字和页码             |
| rule    | `#1a1815` | 细分隔线和虚线                   |

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 标题（衬线）：`"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif`，字重 700。宋体的横细竖粗最像铅字印刷，是这套主题的灵魂。
- 正文（无衬线）：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`，字重 400，强调偶尔用 600。
- 字号：
  - 封面大标题：140 px，行高 1.15，字距 `0.02em`（中文不用负字距）。一行最多 11 个字，超过就手动断行。
  - 页面标题：64 px 宋体，行高 1.25。
  - 正文：34 px 黑体，行高 1.7。
  - 说明 / 眉标：22 px 黑体，字距 `0.24em`。原版用全大写英文，中文没有大小写，靠拉开字距和朱红色来营造「印刷小标签」的感觉。

## 版式

- 内容边距：左右 140 px，上下 120 px。
- 对齐：左对齐，右侧留出宽松的空白，正文宽度绝不超过 `max-width: 1200px`（34 px 中文约 35 个字一行）。
- 网格：标题块和正文块之间用一条 1 px 的 `rule` 实线隔开，位于标题下方 80 px 左右。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去。

```tsx
const SERIF = '"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif';
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
```

### Title（大标题）

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: SERIF,
      fontSize: 140,
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '0.02em',
      margin: 0,
      color: '#141210',
    }}
  >
    {children}
  </h1>
);
```

### Footer（页脚）

上方一条虚线，像老式节目单。左边是刊名 + 期号，右边是页码。

```tsx
const Footer = ({ pageNum, total, section }: { pageNum: number; total: number; section?: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 140,
      right: 140,
      bottom: 80,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      fontFamily: SANS,
      fontSize: 20,
      letterSpacing: '0.2em',
      color: '#8a8276',
      borderTop: '1px dashed #1a1815',
      paddingTop: 20,
    }}
  >
    <span>铅印小册 · {section ?? '第 01 期'}</span>
    <span>
      第 {pageNum} 页 / 共 {total} 页
    </span>
  </div>
);
```

### Eyebrow（眉标）

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '0.24em',
      color: '#c43a1d',
    }}
  >
    {children}
  </div>
);
```

## 动效

- 原则：静止。没有动画，没有过渡。整份 deck 读起来就像一本印好的小册子。

## 气质

活字印刷遇上档案馆。奶油色纸张，一滴朱红油墨，页脚一条虚线，像一张老节目单。避免：渐变、发光、黑体标题、圆形或大于 2 px 的圆角、破坏纸张质感的照片。如果一页看起来能用两遍丝网印刷印出来，这页就对了。

## 示例

```tsx
const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#f6f1e7',
      color: '#141210',
      fontFamily: SANS,
      padding: '120px 140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 56,
    }}
  >
    <Eyebrow>工作室年度来信 · 2026</Eyebrow>
    <Title>慢一点，走得更远。</Title>
    <div style={{ height: 1, background: '#1a1815', maxWidth: 720 }} />
    <p style={{ fontSize: 34, lineHeight: 1.7, color: '#141210', maxWidth: 1200, margin: 0 }}>
      八封信，谈手艺、谈耐心，也谈我们一直在打磨的那些小产品。
    </p>
    <Footer pageNum={1} total={8} section="第 01 期" />
  </div>
);
```
