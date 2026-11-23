import { type Page, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

const styles = `
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
`;

// 只用系统字体，不加载任何外部字体。
// 展示字体优先用系统自带的圆体西文（macOS 上的 SF Pro Rounded），中文落到苹方 / 雅黑。
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const DISPLAY = `ui-rounded, "SF Pro Rounded", ${SANS}`;

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

const items: { tone: 'pink' | 'purple' | 'yellow'; label: string; body: string; tilt: number }[] = [
  {
    tone: 'pink',
    label: '小胜利',
    body: '一个两行的补丁，每周给团队省下一整个下午。',
    tilt: -2,
  },
  {
    tone: 'purple',
    label: '支线任务',
    body: '周末顺手写的小工具，后来成了我们做演示的标准姿势。',
    tilt: 1.5,
  },
  {
    tone: 'yellow',
    label: '纯属好玩',
    body: '一个玩具项目，教会我们的缓存知识比哪份文档都多。',
    tilt: -1,
  },
];

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 40 }}>
    <style>{styles}</style>
    <Dot size={36} color="#ffd24c" top={80} right={140} delay={200} />
    <Sticker tone="purple" tilt={-2}>
      我们做了什么
    </Sticker>
    <h2
      style={{
        fontFamily: DISPLAY,
        fontSize: 64,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        margin: 0,
        color: '#2d1b4e',
        maxWidth: 1300,
      }}
    >
      三件让我们会心一笑的小事。
    </h2>
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
        marginTop: 6,
      }}
    >
      {items.map((it, i) => (
        <li
          key={it.label}
          style={{
            background: '#ffe6d3',
            border: '2px solid #2d1b4e',
            borderRadius: 24,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            boxShadow: '6px 6px 0 0 #2d1b4e',
            transform: `rotate(${i % 2 === 0 ? -0.6 : 0.6}deg)`,
          }}
        >
          <div style={{ width: 164, flexShrink: 0, display: 'flex' }}>
            <Sticker tone={it.tone} tilt={it.tilt}>
              {it.label}
            </Sticker>
          </div>
          <p style={{ fontSize: 30, lineHeight: 1.5, color: '#2d1b4e', margin: 0 }}>{it.body}</p>
        </li>
      ))}
    </ul>
    <Footer />
  </div>
);

const Closer: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 40 }}>
    <style>{styles}</style>
    <Dot size={48} color="#ff4d8d" top={140} right={220} delay={0} />
    <Dot size={24} color="#6d4cff" top={240} right={150} delay={400} />
    <Dot size={36} color="#ffd24c" bottom={240} left={160} delay={800} />
    <Dot size={20} color="#ff4d8d" bottom={320} left={260} delay={1200} />
    <Sticker tone="yellow" tilt={3}>
      就这些啦
    </Sticker>
    <Title>用心做的。</Title>
    <p style={{ fontSize: 30, lineHeight: 1.6, color: '#2d1b4e', maxWidth: 1100, margin: 0 }}>
      喜欢什么尽管拿去用，这些圆点算我们请客。
    </p>
    <Footer />
  </div>
);

export default [Cover, Content, Closer];
