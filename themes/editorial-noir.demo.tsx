import { type Page, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import { type CSSProperties, type ReactNode, useId } from 'react';

const STYLE_ID = 'osd-styles-theme-editorial-noir';
const KEYFRAMES = `
@keyframes en-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes en-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes en-draw { from { transform: scaleX(0) } to { transform: scaleX(1) } }
`;

if (typeof document !== 'undefined') {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== KEYFRAMES) style.textContent = KEYFRAMES;
}

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const SERIF = '"Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", SimSun, Georgia, serif';

const BG = '#14110e';
const TEXT = '#f3ead9';
const BODY = '#cfc5b3';
const MUTED = '#9a8f7e';
const ACCENT = '#d6a64b';
const RULE = '#3a3229';

const X0 = 120;
const W = 1680;

const abs = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
  height,
});

// 进场动画：只在页面激活时播放，缩略图直接显示终态
const rise = (live: boolean, delay = 0): CSSProperties =>
  live ? { animation: `en-rise 700ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms both` } : {};
const fade = (live: boolean, delay = 0, dur = 1200): CSSProperties =>
  live ? { animation: `en-fade ${dur}ms ease-out ${delay}ms both` } : {};

const root: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: BG,
  color: TEXT,
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
};

// 纸张颗粒 + 暗角：每页最底层铺一次
const Paper = () => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <svg
        aria-hidden="true"
        width={1920}
        height={1080}
        style={{ ...abs(0, 0), opacity: 0.07, mixBlendMode: 'screen', pointerEvents: 'none' }}
      >
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
      </svg>
      <div
        style={{
          ...abs(0, 0, 1920, 1080),
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </>
  );
};

const Eyebrow = ({ children, color = ACCENT }: { children: ReactNode; color?: string }) => (
  <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: '0.24em', color }}>
    {children}
  </div>
);

const Title = ({ children, size = 156 }: { children: ReactNode; size?: number }) => (
  <h1
    style={{
      margin: 0,
      fontFamily: SERIF,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.18,
      letterSpacing: '0.02em',
      color: TEXT,
    }}
  >
    {children}
  </h1>
);

// 超大卷号 / 章节号：琥珀色宋体数字，作为构图主体。outline 为描边空心字
const Numeral = ({
  children,
  size,
  outline = false,
  style,
}: {
  children: ReactNode;
  size: number;
  outline?: boolean;
  style?: CSSProperties;
}) => (
  <div
    aria-hidden="true"
    style={{
      fontFamily: SERIF,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 0.8,
      letterSpacing: '-0.02em',
      color: outline ? 'transparent' : ACCENT,
      WebkitTextStroke: outline ? `2px ${ACCENT}` : undefined,
      userSelect: 'none',
      ...style,
    }}
  >
    {children}
  </div>
);

// 页边竖排小字
const SideNote = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <div
    style={{
      ...abs(x, y),
      writingMode: 'vertical-rl',
      fontFamily: SANS,
      fontSize: 20,
      letterSpacing: '0.32em',
      color: MUTED,
    }}
  >
    {children}
  </div>
);

// 刊头：上下双线夹住刊名，左右是卷期信息
const Masthead = ({ left, right }: { left: ReactNode; right: ReactNode }) => (
  <div style={abs(X0, 56, W)}>
    <div style={{ borderTop: `1px solid ${RULE}` }} />
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 96,
        fontSize: 22,
        letterSpacing: '0.2em',
        color: MUTED,
      }}
    >
      <span style={{ width: 480 }}>{left}</span>
      <span
        style={{
          fontFamily: SERIF,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: '0.6em',
          marginRight: '-0.6em',
          color: TEXT,
        }}
      >
        暗夜季刊
      </span>
      <span style={{ width: 480, textAlign: 'right' }}>{right}</span>
    </div>
    <div style={{ borderTop: `3px solid ${TEXT}` }} />
    <div style={{ borderTop: `1px solid ${TEXT}`, marginTop: 5 }} />
  </div>
);

// 内页书眉：一条细线，左栏目名、右刊名
const RunningHead = ({ section }: { section: ReactNode }) => (
  <div
    style={{
      ...abs(X0, 64, W),
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: 18,
      borderBottom: `1px solid ${RULE}`,
      fontSize: 22,
      letterSpacing: '0.2em',
    }}
  >
    <span style={{ color: ACCENT, fontWeight: 600 }}>{section}</span>
    <span style={{ color: MUTED }}>暗夜季刊 · 第 04 卷 · 二〇二六 冬</span>
  </div>
);

const Footer = ({ label = '暗夜季刊 · 年度回顾' }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return (
    <div
      style={{
        ...abs(X0, 1000, W),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 22,
        letterSpacing: '0.18em',
        color: MUTED,
      }}
    >
      <span>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ width: 48, height: 1, background: ACCENT }} />
        <span style={{ color: TEXT }}>{pad2(current)}</span>
        <span>/ {pad2(total)}</span>
      </span>
    </div>
  );
};

// 首字下沉：占三行正文
const DropCap = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      float: 'left',
      fontFamily: SERIF,
      fontSize: 132,
      fontWeight: 700,
      lineHeight: 1,
      color: ACCENT,
      margin: '6px 18px 0 0',
    }}
  >
    {children}
  </span>
);

// 引言块：大号琥珀色引号 + 宋体引文 + 出处
const PullQuote = ({ children, cite }: { children: ReactNode; cite: ReactNode }) => (
  <figure style={{ margin: 0, position: 'relative', paddingLeft: 140 }}>
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: -6,
        top: -34,
        fontFamily: SERIF,
        fontSize: 220,
        fontWeight: 700,
        lineHeight: 1,
        color: ACCENT,
      }}
    >
      “
    </span>
    <blockquote
      style={{
        margin: 0,
        fontFamily: SERIF,
        fontSize: 48,
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        color: TEXT,
      }}
    >
      {children}
    </blockquote>
    <figcaption style={{ marginTop: 20, fontSize: 22, letterSpacing: '0.16em', color: MUTED }}>
      {cite}
    </figcaption>
  </figure>
);

// 目录行：页码 · 标题 · 点线引导 · 作者
const TocRow = ({ num, title, by }: { num: string; title: string; by: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 28,
      padding: '18px 0',
      borderBottom: `1px solid ${RULE}`,
    }}
  >
    <span style={{ width: 56, fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: ACCENT }}>{num}</span>
    <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: TEXT }}>{title}</span>
    <span style={{ flex: 1, borderBottom: '2px dotted #5a4f42', transform: 'translateY(-8px)' }} />
    <span style={{ fontSize: 22, letterSpacing: '0.12em', color: MUTED }}>{by}</span>
  </div>
);

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <Paper />
      <Masthead left="第 04 卷 · 总第 16 期" right="二〇二六 · 冬季号" />
      <Numeral size={800} style={{ ...abs(1010, 236), ...fade(live, 100, 1600) }}>
        04
      </Numeral>
      <div
        style={{
          ...abs(1010, 852, 720),
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${RULE}`,
          paddingTop: 22,
          fontSize: 20,
          letterSpacing: '0.2em',
          color: MUTED,
          ...fade(live, 700),
        }}
      >
        <span>
          <span style={{ color: ACCENT, fontWeight: 600 }}>VOL. 04</span>　本卷 16 篇 · 对谈 3 场
        </span>
        <span>定价 ¥ 68</span>
      </div>
      <SideNote x={1846} y={260}>
        ANNUAL REVIEW · 年度回顾特刊
      </SideNote>
      <div style={{ ...abs(X0, 268), ...rise(live, 200) }}>
        <Eyebrow>年度回顾 · 编者特辑</Eyebrow>
      </div>
      <div style={{ ...abs(X0, 318), ...rise(live, 300) }}>
        <Title>
          安静之年
          <br />
          的轮廓。
        </Title>
      </div>
      <p
        style={{
          ...abs(X0, 712, 820),
          margin: 0,
          fontSize: 32,
          lineHeight: 1.7,
          color: BODY,
          ...rise(live, 450),
        }}
      >
        回望这一年里，那些我们没有声张、却认真交付的工作，以及被我们亲手划掉的那些。
      </p>
      <div
        style={{
          ...abs(X0, 852, 860),
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          borderTop: `1px solid ${RULE}`,
          paddingTop: 22,
          ...fade(live, 700),
        }}
      >
        {[
          ['02', '编者按', '少做一点'],
          ['14', '长清单', '没有上线的'],
          ['38', '对谈', '慢的价值'],
        ].map(([n, k, t]) => (
          <div key={n}>
            <div style={{ fontSize: 20, letterSpacing: '0.2em', color: MUTED }}>
              <span style={{ color: ACCENT, fontWeight: 600 }}>P.{n}</span>　{k}
            </div>
            <div style={{ marginTop: 6, fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: TEXT }}>{t}</div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

const EditorsNote: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <Paper />
      <RunningHead section="编者按 · EDITOR’S NOTE" />
      <SideNote x={52} y={180}>
        第 04 卷 · 二〇二六 · 编者按
      </SideNote>
      <Numeral size={240} style={{ ...abs(X0 - 8, 176), ...fade(live, 0) }}>
        01
      </Numeral>
      <div
        style={{
          ...abs(X0, 400, 100, 2),
          background: ACCENT,
          transformOrigin: 'left',
          ...(live ? { animation: 'en-draw 700ms ease-out 200ms both' } : {}),
        }}
      />
      <h2
        style={{
          ...abs(X0, 440, 460),
          margin: 0,
          fontFamily: SERIF,
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.36,
          letterSpacing: '0.02em',
          color: TEXT,
          ...rise(live, 150),
        }}
      >
        今年做的事
        <br />
        更少了，
        <br />
        但每一件都
        <br />
        更值得。
      </h2>
      <div style={{ ...abs(X0, 800, 440), fontSize: 22, lineHeight: 1.8, letterSpacing: '0.1em', color: MUTED }}>
        <div>
          文 / <span style={{ color: TEXT }}>林间</span>　本刊主编
        </div>
        <div>二〇二六年十二月 · 于杭州</div>
      </div>
      <div style={{ ...abs(620, 176, 1, 790), background: RULE }} />
      <div
        style={{
          ...abs(680, 176, 1120),
          columnCount: 2,
          columnGap: 72,
          columnRule: `1px solid ${RULE}`,
          fontSize: 28,
          lineHeight: 1.7,
          color: BODY,
          textAlign: 'justify',
          ...fade(live, 250, 900),
        }}
      >
        <p style={{ margin: 0 }}>
          <DropCap>去</DropCap>
          年冬天，我们在会议室的白板上写满了计划：十二个新功能、四次大版本、一场发布会。到了年底回头看，真正上线的还不到一半，白板早已擦过许多遍。
        </p>
        <p style={{ margin: '0.6em 0 0', textIndent: '2em' }}>
          可我们并不觉得这是失败。被划掉的每一行，都经过了一次认真的追问——它真的被需要吗，还是只让我们显得很忙？答案往往要等上几个星期，等热情退去，等用户的声音慢慢浮上来。
        </p>
        <p style={{ margin: '0.6em 0 0', textIndent: '2em' }}>
          这一期，我们把那张长长的清单原样印了出来，连同删改的痕迹。没有上线的，和上线了的一样，共同构成了这一年的
          <span style={{ color: ACCENT }}>轮廓</span>。愿你读完，也能在自己的清单上，安心地划掉一两行。
        </p>
      </div>
      <div style={{ ...abs(680, 700, 1120), borderTop: `1px solid ${RULE}`, paddingTop: 56, ...rise(live, 500) }}>
        <PullQuote cite="—— 摘自本期《长清单》，第 14 页">被划掉的每一行，都是一次认真的追问。</PullQuote>
      </div>
      <Footer />
    </div>
  );
};

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <Paper />
      <Numeral size={800} outline style={{ ...abs(80, 150), ...fade(live, 0, 1600) }}>
        05
      </Numeral>
      <div
        style={{
          ...abs(X0, 820, 780),
          border: `1px solid ${RULE}`,
          padding: '22px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          rowGap: 8,
          fontSize: 20,
          letterSpacing: '0.12em',
          color: MUTED,
        }}
      >
        <span>
          主编　<span style={{ color: BODY }}>林间</span>
        </span>
        <span>
          排印　<span style={{ color: BODY }}>宋体 · 深色印刷</span>
        </span>
        <span>
          出版　<span style={{ color: BODY }}>一年两期</span>
        </span>
        <span>
          印数　<span style={{ color: BODY }}>两千册 · 烛光下装订</span>
        </span>
      </div>
      <SideNote x={1846} y={150}>
        本期完 · 第 04 卷 · 二〇二六 冬
      </SideNote>
      <div style={{ ...abs(1040, 150), ...rise(live, 100) }}>
        <Eyebrow>本期完 · 下期预告</Eyebrow>
      </div>
      <div style={{ ...abs(1040, 200), ...rise(live, 200) }}>
        <Title size={136}>
          第五卷
          <br />
          再会。
        </Title>
      </div>
      <p
        style={{
          ...abs(1040, 540, 740),
          margin: 0,
          fontSize: 30,
          lineHeight: 1.7,
          color: BODY,
          ...rise(live, 300),
        }}
      >
        春天的时候，我们会带着新的一期回来。
        <br />
        在那之前，请慢一点读完这一本。
      </p>
      <div style={{ ...abs(1040, 690, 760), ...fade(live, 500) }}>
        <div style={{ fontSize: 20, letterSpacing: '0.24em', color: MUTED, marginBottom: 6 }}>下期要目</div>
        <TocRow num="01" title="留白的手艺" by="林间" />
        <TocRow num="02" title="一张没发出的海报" by="周遥" />
        <TocRow num="03" title="给新同事的信" by="编辑部" />
      </div>
      <Footer label="暗夜季刊 · 第五卷 · 二〇二七 春" />
    </div>
  );
};

export default [Cover, EditorsNote, Closer];
