---
name: 蜜桃贴纸
description: 俏皮的粉彩手账风：蜜桃色纸面、亮粉色标注、粗壮圆润的大字、歪歪贴上的贴纸和跳动的圆点。
mode: light
---

# 蜜桃贴纸

改编自 open-slide 官方主题 Sticker Pop（MIT），已汉化，只用系统字体，不加载任何外部字体。

## 配色

| 角色     | 色值      | 用途                               |
| -------- | --------- | ---------------------------------- |
| bg       | `#fff2e8` | 暖蜜桃色纸面                       |
| surface  | `#ffe6d3` | 更深一点的蜜桃色，用于卡片和徽章   |
| text     | `#2d1b4e` | 深葡萄紫，主要文字                 |
| accent   | `#ff4d8d` | 亮粉——全场的主角                   |
| accent2  | `#6d4cff` | 电光紫，次要标注                   |
| accent3  | `#ffd24c` | 阳光黄，高亮和圆点                 |
| muted    | `#9a8aa8` | 说明文字、淡化的标记               |
| ink      | `#2d1b4e` | 手绘描边，与 text 同色             |

## 字体

- 只用系统字体，**不要**引入 Google Fonts 或任何外部字体文件。
- 展示字体（标题、贴纸、页码）：`ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`，字重 700。
  - 原作用的是圆胖的几何展示体 Outfit 800。系统里没有通用的中文圆体，所以西文和数字优先取系统自带的圆体（macOS 上的 SF Pro Rounded，取不到就回落到普通无衬线），中文统一落到苹方 / 微软雅黑。
  - 「圆胖」的气质靠这几件事保住：字重拉到 700（苹方最粗为 Semibold），字号放大，字距放宽到 `0.02em` 让字块显得松软；再配上贴纸的倾斜、2 px 深紫描边和硬投影。中文不要用负字距。
- 正文字体：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`，字重 500。
- 字号：
  - 封面大标题：152 px，行高 1.12（两行，每行不超过 6 个字，在逗号处断行）。
  - 页面标题：64 px，字重 700，行高 1.2。
  - 正文：封面 34 px，内容页 30 px，行高 1.5–1.6。
  - 眉标 / 贴纸：24 px，字重 700，字距 `0.06em`。写成简短的中文口语（如「第一章」「就这些啦」），不要用英文式的全大写。
  - 页脚：20 px，字重 600。

## 版式

- 内边距：左右 110 px，上下 90 px。
- 左对齐，但贴纸带一点小角度（`-3deg` / `+2deg`），像是随手贴上去的。
- 卡片和胶囊用大圆角（24–999 px）。封面常在右上角放几颗大圆点。
- 内容页的列表卡片：`surface` 底色，2 px 深紫描边，`6px 6px 0 0 #2d1b4e` 硬投影，相邻两张分别旋转 `-0.6deg` / `0.6deg`。贴纸放进一个固定 164 px 宽的列（够放四个字的贴纸），右侧正文才能对齐。
- 贴纸设 `whiteSpace: 'nowrap'` 和 `flexShrink: 0`，中文标签绝不折行。

## 固定组件

可以直接粘贴。用这个主题写 deck 时原样复制进去（`import type { CSSProperties, ReactNode } from 'react';`）。

```tsx
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const DISPLAY = `ui-rounded, "SF Pro Rounded", ${SANS}`;
```

### Title（封面大标题）

```tsx
const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: DISPLAY,
      fontSize: 152,
      fontWeight: 700,
      lineHeight: 1.12,
      letterSpacing: '0.02em',
      margin: 0,
      color: '#2d1b4e',
    }}
  >
    {children}
  </h1>
);
```

### Footer（页脚）

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        right: 110,
        bottom: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: SANS,
        fontSize: 20,
        fontWeight: 600,
        color: '#9a8aa8',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-hidden
          style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4d8d' }}
        />
        <span
          aria-hidden
          style={{ width: 12, height: 12, borderRadius: '50%', background: '#6d4cff' }}
        />
        <span
          aria-hidden
          style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffd24c' }}
        />
        <span style={{ marginLeft: 8 }}>蜜桃贴纸</span>
      </span>
      <span
        style={{
          background: '#2d1b4e',
          color: '#fff2e8',
          padding: '6px 14px',
          borderRadius: 999,
          fontFamily: DISPLAY,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {current} / {total}
      </span>
    </div>
  );
};
```

### Sticker（眉标 / 贴纸胶囊）

```tsx
const Sticker = ({
  children,
  tone = 'pink',
  tilt = -3,
}: {
  children: ReactNode;
  tone?: 'pink' | 'purple' | 'yellow';
  tilt?: number;
}) => {
  const fill = tone === 'purple' ? '#6d4cff' : tone === 'yellow' ? '#ffd24c' : '#ff4d8d';
  const ink = tone === 'yellow' ? '#2d1b4e' : '#fff2e8';
  return (
    <span
      style={
        {
          alignSelf: 'flex-start',
          flexShrink: 0,
          display: 'inline-block',
          background: fill,
          color: ink,
          padding: '10px 22px',
          borderRadius: 999,
          border: '2px solid #2d1b4e',
          boxShadow: '4px 4px 0 0 #2d1b4e',
          fontFamily: DISPLAY,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          transform: `rotate(${tilt}deg)`,
          ['--sp-tilt' as string]: `${tilt}deg`,
          animation: 'sp-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
};
```

### Dot（装饰圆点）

```tsx
const Dot = ({
  size,
  color,
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  size: number;
  color: string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  delay?: number;
}) => (
  <span
    aria-hidden
    style={{
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      animation: `sp-bob 3.4s ease-in-out ${delay}ms infinite`,
    }}
  />
);
```

### 页面底座

```tsx
const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#fff2e8',
  color: '#2d1b4e',
  padding: '90px 110px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  fontWeight: 500,
  WebkitFontSmoothing: 'antialiased',
  position: 'relative',
  overflow: 'hidden',
};
```

## 动效

- 原则：丰富、活泼。
- 可复用的关键帧（每页放一个 `<style>{styles}</style>`）：

```css
@keyframes sp-pop {
  0%   { transform: scale(0.92) rotate(var(--sp-tilt, 0deg)); opacity: 0; }
  60%  { transform: scale(1.04) rotate(var(--sp-tilt, 0deg)); opacity: 1; }
  100% { transform: scale(1) rotate(var(--sp-tilt, 0deg)); }
}
@keyframes sp-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes sp-wiggle {
  0%, 100% { transform: rotate(-2deg); }
  50%      { transform: rotate(2deg); }
}
```

贴纸出现时用 `sp-pop`，装饰圆点用 `sp-bob`，`sp-wiggle` 只偶尔用在某一个不含 emoji 的小标记上。

## 气质

一本贴纸手账，粘在一张蜜桃色的孔版印刷纸上。柔和温暖的纸面，亮粉和葡萄紫负责所有的「标点」，用硬朗的深色描边和厚实的错位投影（`4px 4px 0 0 #2d1b4e`）代替柔和阴影。字要显得友好：圆润、粗大、微微歪着。避免：渐变、发光、摄影图片、毛玻璃、千篇一律的企业四宫格卡片、深色模式，以及中文伪斜体。如果这一页能直接丝网印到帆布袋上，那就对了。

## 示例

```tsx
const Cover: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 44 }}>
    <style>{styles}</style>
    <Dot size={64} color="#ffd24c" top={120} right={180} delay={0} />
    <Dot size={28} color="#6d4cff" top={220} right={120} delay={300} />
    <Dot size={42} color="#ff4d8d" bottom={170} left={180} delay={600} />
    <Sticker tone="pink" tilt={-4}>
      第一章
    </Sticker>
    <Title>
      大点子，
      <br />
      小小地做。
    </Title>
    <p style={{ fontSize: 34, lineHeight: 1.6, color: '#2d1b4e', maxWidth: 1200, margin: 0 }}>
      一趟轻松愉快的小旅行，看看我们最近冒出来的那些小想法。
    </p>
    <Footer />
  </div>
);
```
