import type { Page } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// 只用系统字体，不加载任何外部字体
const SERIF = '"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif';
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';

const Title = ({ children }: { children: ReactNode }) => (
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

const Footer = ({
  pageNum,
  total,
  section,
}: {
  pageNum: number;
  total: number;
  section?: string;
}) => (
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

const Eyebrow = ({ children }: { children: ReactNode }) => (
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

const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#f6f1e7',
  color: '#141210',
  fontFamily: SANS,
  padding: '120px 140px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
};

const TOTAL = 3;

const Cover: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 56 }}>
    <Eyebrow>工作室年度来信 · 2026</Eyebrow>
    <Title>慢一点，走得更远。</Title>
    <div style={{ height: 1, background: '#1a1815', maxWidth: 720 }} />
    <p style={{ fontSize: 34, lineHeight: 1.7, color: '#141210', maxWidth: 1200, margin: 0 }}>
      八封信，谈手艺、谈耐心，也谈我们一直在打磨的那些小产品。
    </p>
    <Footer pageNum={1} total={TOTAL} section="第 01 期" />
  </div>
);

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 48 }}>
    <Eyebrow>第二封信 · 关于工作台</Eyebrow>
    <h2
      style={{
        fontFamily: SERIF,
        fontSize: 64,
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '0.02em',
        margin: 0,
        color: '#141210',
      }}
    >
      值得留下来的三样东西。
    </h2>
    <div style={{ height: 1, background: '#1a1815', maxWidth: 1200 }} />
    <ol
      style={{
        margin: 0,
        paddingLeft: 56,
        listStyleType: 'decimal',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        fontFamily: SANS,
        fontSize: 34,
        lineHeight: 1.7,
        color: '#141210',
        maxWidth: 1200,
      }}
    >
      <li>
        <span style={{ color: '#c43a1d', fontWeight: 600 }}>一件</span>趁手的工具，修过两次，还在用。
      </li>
      <li>一柜子没做完的方案，分门别类，好好存着。</li>
      <li>把「差一点就上线」的东西记下来的习惯。</li>
    </ol>
    <Footer pageNum={2} total={TOTAL} section="第二封信" />
  </div>
);

const Closer: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 48 }}>
    <Eyebrow>版权页</Eyebrow>
    <Title>本册完。</Title>
    <div style={{ height: 1, background: '#1a1815', maxWidth: 720 }} />
    <p style={{ fontSize: 28, lineHeight: 1.7, color: '#8a8276', maxWidth: 1100, margin: 0 }}>
      标题用宋体，正文用系统黑体。奶油色纸张，工作室自印，仅此一份。
    </p>
    <Footer pageNum={TOTAL} total={TOTAL} section="终" />
  </div>
);

export default [Cover, Content, Closer];
