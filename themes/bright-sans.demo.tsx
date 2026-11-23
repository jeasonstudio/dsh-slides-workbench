import { type Page, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

const styles = `
@keyframes bs-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';

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

const Cover: Page = () => (
  <div
    style={{
      ...pageBase,
      justifyContent: 'center',
      gap: 40,
      animation: 'bs-fadeUp 500ms ease-out both',
    }}
  >
    <style>{styles}</style>
    <Eyebrow tone="blue">春季更新 · 2026</Eyebrow>
    <Title>为每个重要时刻而生。</Title>
    <p style={{ fontSize: 32, lineHeight: 1.6, color: '#5f6368', maxWidth: 1180, margin: 0 }}>
      四个小功能，让接下来八个月的工作轻松一点。
    </p>
    <Footer />
  </div>
);

type Card = {
  tone: 'blue' | 'red' | 'yellow' | 'green';
  fill: string;
  title: string;
  body: string;
};

const cards: Card[] = [
  {
    tone: 'blue',
    fill: '#1a73e8',
    title: '智能草稿',
    body: '在哪儿冒出的想法，都能回到同一个地方接着写完。',
  },
  {
    tone: 'red',
    fill: '#ea4335',
    title: '更少打扰',
    body: '十七类通知合并成四类，重要的消息不再被淹没。',
  },
  {
    tone: 'yellow',
    fill: '#fbbc04',
    title: '更快回复',
    body: '推荐回复会读懂你的语气，而不只是复述收件箱。',
  },
  {
    tone: 'green',
    fill: '#34a853',
    title: '更准搜索',
    body: '凭记得的内容就能找到文档，不必记住它叫什么。',
  },
];

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 40 }}>
    <style>{styles}</style>
    <Eyebrow tone="blue">新功能</Eyebrow>
    <h2
      style={{
        fontFamily: SANS,
        fontSize: 56,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        margin: 0,
        color: '#202124',
        maxWidth: 1300,
      }}
    >
      四个功能，一次安静的发布。
    </h2>
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 24,
        marginTop: 8,
      }}
    >
      {cards.map((c, i) => (
        <li
          key={c.title}
          style={{
            background: '#f7f9fc',
            border: '1px solid #e8eaed',
            borderRadius: 24,
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            animation: `bs-fadeUp 500ms ease-out both`,
            animationDelay: `${i * 80}ms`,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: c.fill,
            }}
          />
          <h3
            style={{
              fontFamily: SANS,
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: '0.01em',
              margin: 0,
              color: '#202124',
            }}
          >
            {c.title}
          </h3>
          <p
            style={{
              fontSize: 24,
              lineHeight: 1.6,
              color: '#5f6368',
              margin: 0,
            }}
          >
            {c.body}
          </p>
        </li>
      ))}
    </ul>
    <Footer />
  </div>
);

const Closer: Page = () => (
  <div
    style={{
      ...pageBase,
      justifyContent: 'center',
      gap: 36,
      animation: 'bs-fadeUp 500ms ease-out both',
    }}
  >
    <style>{styles}</style>
    <Eyebrow tone="green">今天上线</Eyebrow>
    <Title>按你的节奏推开。</Title>
    <p style={{ fontSize: 30, lineHeight: 1.6, color: '#5f6368', maxWidth: 1180, margin: 0 }}>
      这里的每项功能都可以按需开启：先给一个团队，再给下一个，最后覆盖所有人。
    </p>
    <Footer dotColor="#34a853" label="今天上线" />
  </div>
);

export default [Cover, Content, Closer];
