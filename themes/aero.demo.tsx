import {
  type DesignSystem,
  type Page,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#4B1DFF', text: '#FFFFFF', accent: '#D8FF2E' },
  fonts: {
    display:
      '"Avenir Next Condensed", "DIN Condensed", "Arial Narrow", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  typeScale: { hero: 460, body: 30 },
  radius: 0,
};

const INK = '#0B0A14';
const CORAL = '#FF4A3D';
const DEEP = '#2A0FA3';
const LAV = '#D3CAFF';
const WHITE_A = (a: number) => `rgba(255,255,255,${a})`;

const THEME_ID = 'theme-aero';
const STYLE_ID = `osd-styles-${THEME_ID}`;
const KEYFRAMES = `
@keyframes ae-run { from { transform: translateX(0) } to { transform: translateX(calc(var(--tile) * -1)) } }
@keyframes ae-in { from { opacity: 0; transform: translateX(-56px) } to { opacity: 1; transform: none } }
@keyframes ae-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ae-pace { to { stroke-dashoffset: -1000 } }
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

const ANGLE = 12;
const T = Math.tan((ANGLE * Math.PI) / 180);
const SKEW = `skewX(-${ANGLE}deg)`;

const cut = (h: number) => {
  const d = (h * T).toFixed(2);
  return `polygon(${d}px 0, 100% 0, calc(100% - ${d}px) 100%, 0 100%)`;
};

const BAND_RATIO = 12;
const BAND_PCT = ((T / BAND_RATIO) * 100).toFixed(4);
const BAND_CLIP = `polygon(${BAND_PCT}% 0, 100% 0, ${(100 - Number(BAND_PCT)).toFixed(4)}% 100%, 0 100%)`;

const SNAP = 'cubic-bezier(0.16, 1, 0.3, 1)';

type Tone = 'uv' | 'volt' | 'ink';

const TONES: Record<Tone, { bg: string; fg: string; dim: string; hi: string; hiFg: string }> = {
  uv: { bg: 'var(--osd-bg)', fg: 'var(--osd-text)', dim: LAV, hi: 'var(--osd-accent)', hiFg: INK },
  volt: {
    bg: 'var(--osd-accent)',
    fg: INK,
    dim: 'rgba(11,10,20,0.66)',
    hi: INK,
    hiFg: 'var(--osd-accent)',
  },
  ink: {
    bg: INK,
    fg: 'var(--osd-text)',
    dim: 'rgba(255,255,255,0.6)',
    hi: 'var(--osd-accent)',
    hiFg: INK,
  },
};

// 中文标题保持正体；斜体只给英文和数字（LEAN / NUM），中文单位用 UNIT 扶正
const DISPLAY: CSSProperties = {
  fontFamily: 'var(--osd-font-display)',
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '0.02em',
  margin: 0,
};

const LEAN: CSSProperties = { fontStyle: 'italic', fontWeight: 800 };

const NUM: CSSProperties = {
  ...DISPLAY,
  ...LEAN,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.015em',
  lineHeight: 0.9,
};

const UNIT: CSSProperties = {
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '0.42em',
  letterSpacing: 0,
  marginLeft: '0.06em',
};

const LABEL: CSSProperties = {
  fontFamily: 'var(--osd-font-body)',
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: '0.12em',
  lineHeight: 1.2,
};

const BODY: CSSProperties = {
  fontFamily: 'var(--osd-font-body)',
  fontSize: 30,
  fontWeight: 500,
  lineHeight: 1.4,
  margin: 0,
};

const abs = (left: number, top: number, extra?: CSSProperties): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  ...extra,
});

const pad = (n: number) => String(n).padStart(2, '0');

const Title = ({
  children,
  size = 132,
  x = 116,
  y = 160,
  style,
}: {
  children: ReactNode;
  size?: number;
  x?: number;
  y?: number;
  style?: CSSProperties;
}) => <h2 style={{ ...DISPLAY, ...abs(x, y), fontSize: size, ...style }}>{children}</h2>;

const Footer = ({
  tone,
  brand = '疾风',
  title = '赛季计划',
  meta = '2027 · 内部资料',
}: {
  tone: Tone;
  brand?: string;
  title?: string;
  meta?: string;
}) => {
  const { current, total } = useSlidePageNumber();
  const t = TONES[tone];
  return (
    <div
      style={{
        ...LABEL,
        position: 'absolute',
        left: 120,
        right: 120,
        top: 1004,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        fontSize: 17,
        color: t.dim,
        zIndex: 5,
      }}
    >
      <span
        style={{
          ...NUM,
          width: 64,
          height: 32,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: t.hi,
          color: t.hiFg,
          clipPath: cut(32),
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        {pad(current)}
      </span>
      <span style={{ fontVariantNumeric: 'tabular-nums', marginLeft: -8 }}>/ {pad(total)}</span>
      <span style={{ color: t.fg, marginLeft: 14 }}>{brand}</span>
      <span>{title}</span>
      <span style={{ marginLeft: 'auto' }}>{meta}</span>
    </div>
  );
};

const Stage = ({
  tone = 'uv',
  footer = true,
  children,
}: {
  tone?: Tone;
  footer?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      background: TONES[tone].bg,
      color: TONES[tone].fg,
      fontFamily: 'var(--osd-font-body)',
    }}
  >
    {children}
    {footer && <Footer tone={tone} />}
  </div>
);

const Kicker = ({
  tag,
  children,
  tone = 'uv',
  x = 120,
  y = 104,
}: {
  tag: string;
  children: ReactNode;
  tone?: Tone;
  x?: number;
  y?: number;
}) => {
  const t = TONES[tone];
  return (
    <div
      style={abs(x, y, { ...LABEL, display: 'flex', alignItems: 'center', gap: 18, color: t.fg })}
    >
      <span
        style={{
          ...LABEL,
          height: 32,
          padding: '0 18px',
          display: 'inline-flex',
          alignItems: 'center',
          background: t.hi,
          color: t.hiFg,
          clipPath: cut(32),
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        {tag}
      </span>
      {children}
    </div>
  );
};

const Mark = ({ color, h = 34 }: { color: string; h?: number }) => (
  <div style={{ display: 'flex', gap: h * 0.16 }}>
    <div style={{ width: h * 0.3, height: h, background: color, transform: SKEW }} />
    <div style={{ width: h * 0.3, height: h, background: color, transform: SKEW, opacity: 0.7 }} />
    <div style={{ width: h * 0.3, height: h, background: color, transform: SKEW, opacity: 0.4 }} />
  </div>
);

const Wordmark = ({
  x,
  y,
  brand = '疾风',
  color = 'var(--osd-text)',
  mark = 'var(--osd-accent)',
}: {
  x: number;
  y: number;
  brand?: string;
  color?: string;
  mark?: string;
}) => (
  <div style={abs(x, y, { display: 'flex', alignItems: 'center', gap: 18, zIndex: 4 })}>
    <Mark color={mark} />
    <span style={{ ...DISPLAY, fontSize: 44, letterSpacing: '0.06em', color, lineHeight: 1 }}>
      {brand}
    </span>
  </div>
);

const Streak = ({
  y,
  h,
  tile,
  dash,
  color,
  dur,
  shift = 0,
  live,
}: {
  y: number;
  h: number;
  tile: number;
  dash: number;
  color: string;
  dur: number;
  shift?: number;
  live: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: -80,
      top: y,
      width: 2080,
      height: h,
      overflow: 'hidden',
      transform: SKEW,
    }}
  >
    <div
      style={
        {
          '--tile': `${tile}px`,
          width: 2080 + tile,
          height: h,
          backgroundImage: `linear-gradient(90deg, ${color} 0 ${dash}px, transparent ${dash}px)`,
          backgroundSize: `${tile}px ${h}px`,
          backgroundRepeat: 'repeat-x',
          backgroundPosition: `${shift}px 0`,
          animation: live ? `ae-run ${dur}s linear infinite` : undefined,
        } as CSSProperties
      }
    />
  </div>
);

const VoltBand = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: w / BAND_RATIO,
      background: 'var(--osd-accent)',
      clipPath: BAND_CLIP,
    }}
  />
);

const CutBar = ({
  x,
  y,
  w,
  h,
  color,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: color,
      clipPath: cut(h),
    }}
  />
);

const SkewRule = ({
  x,
  y,
  h,
  w = 6,
  color = 'var(--osd-accent)',
}: {
  x: number;
  y: number;
  h: number;
  w?: number;
  color?: string;
}) => (
  <div
    style={abs(x, y, {
      width: w,
      height: h,
      background: color,
      transform: SKEW,
      transformOrigin: '0 100%',
    })}
  />
);

const Chip = ({
  children,
  bg = CORAL,
  fg = INK,
  h = 34,
}: {
  children: ReactNode;
  bg?: string;
  fg?: string;
  h?: number;
}) => (
  <span
    style={{
      ...LABEL,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.1em',
      height: h,
      padding: '0 16px',
      display: 'inline-flex',
      alignItems: 'center',
      background: bg,
      color: fg,
      clipPath: cut(h),
    }}
  >
    {children}
  </span>
);

const SpecChip = ({ children }: { children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 22 }}>
    <span style={{ width: 4, height: 22, background: 'var(--osd-accent)', transform: SKEW }} />
    {children}
  </span>
);

const COVER_STREAKS = [
  { y: 152, h: 6, tile: 560, dash: 300, color: DEEP, dur: 2.6, shift: 0 },
  { y: 184, h: 2, tile: 380, dash: 140, color: WHITE_A(0.3), dur: 1.7, shift: -90 },
  { y: 236, h: 16, tile: 920, dash: 560, color: DEEP, dur: 3.4, shift: -300 },
  { y: 310, h: 3, tile: 460, dash: 180, color: WHITE_A(0.22), dur: 2.1, shift: -200 },
  { y: 372, h: 28, tile: 1180, dash: 720, color: DEEP, dur: 4.2, shift: -520 },
  { y: 462, h: 3, tile: 340, dash: 120, color: WHITE_A(0.3), dur: 1.5, shift: -40 },
  { y: 512, h: 10, tile: 760, dash: 380, color: DEEP, dur: 3, shift: -610 },
  { y: 590, h: 2, tile: 300, dash: 90, color: WHITE_A(0.36), dur: 1.3, shift: -150 },
  { y: 628, h: 20, tile: 980, dash: 520, color: DEEP, dur: 3.8, shift: -120 },
  { y: 880, h: 8, tile: 640, dash: 260, color: DEEP, dur: 2.4, shift: -330 },
  { y: 958, h: 14, tile: 840, dash: 420, color: DEEP, dur: 3.2, shift: -700 },
];

const Cover: Page = () => {
  const live = useIsActivePage();
  const enter = (delay: number): CSSProperties =>
    live ? { animation: `ae-in 0.8s ${SNAP} ${delay}s both` } : {};
  return (
    <Stage footer={false}>
      {COVER_STREAKS.map((s) => (
        <Streak key={s.y} {...s} live={live} />
      ))}

      <Wordmark x={120} y={92} />
      <div style={abs(1100, 104, { ...LABEL, width: 700, textAlign: 'right', color: LAV })}>
        合作伙伴与管理层
      </div>

      <h1
        style={{
          ...DISPLAY,
          ...abs(96, 156),
          fontSize: 'var(--osd-size-hero)',
          lineHeight: 1,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          ...enter(0.05),
        }}
      >
        开跑 <span style={{ ...NUM, color: 'var(--osd-accent)' }}>27</span>
      </h1>

      <VoltBand x={60} y={700} w={1800} />
      <div
        style={abs(196, 700, {
          height: 150,
          width: 1528,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: INK,
          ...enter(0.18),
        })}
      >
        <span style={{ ...DISPLAY, fontSize: 92, lineHeight: 1 }}>赛季计划</span>
        <Mark color={INK} h={64} />
        <span style={{ ...DISPLAY, fontSize: 92, lineHeight: 1 }}>
          <span style={LEAN}>2027</span> 春季
        </span>
      </div>

      <div
        style={abs(120, 920, {
          ...LABEL,
          fontSize: 22,
          display: 'flex',
          gap: 40,
          color: 'var(--osd-text)',
          fontVariantNumeric: 'tabular-nums',
        })}
      >
        <span>4 次发售</span>
        <SpecChip>6 座赛事城市</SpecChip>
        <SpecChip>38 个市场</SpecChip>
        <SpecChip>1 条产品线</SpecChip>
      </div>
      <div style={abs(1380, 896, { width: 420, textAlign: 'right' })}>
        <div style={{ ...LABEL, fontSize: 17, color: LAV }}>开跑日</div>
        <div style={{ ...NUM, fontSize: 64, fontWeight: 800, marginTop: 6 }}>09·04·27</div>
      </div>
    </Stage>
  );
};

const Content: Page = () => (
  <Stage>
    <Kicker tag="市场">我们的位置</Kicker>
    <div style={abs(1300, 102, { width: 500, display: 'flex', justifyContent: 'flex-end' })}>
      <Chip>领先计划</Chip>
    </div>

    <div style={abs(120, 176)}>
      <div style={{ ...NUM, fontSize: 300 }}>2.6×</div>
      <p style={{ ...BODY, marginTop: 26, color: LAV, width: 560 }}>
        三个赛季，品类规模翻了 2.6 倍。
      </p>
    </div>
    <SkewRule x={830} y={176} h={300} />
    <div style={abs(980, 176)}>
      <div style={{ ...NUM, fontSize: 300 }}>
        ¥130<span style={UNIT}>亿</span>
      </div>
      <p style={{ ...BODY, marginTop: 26, color: LAV, width: 640 }}>
        本季零售规模，增速还在加快。
      </p>
    </div>

    <div style={abs(120, 604, { ...LABEL, color: LAV })}>我们的品类份额</div>

    <div style={abs(120, 650, { height: 115, display: 'flex', alignItems: 'center' })}>
      <div>
        <div style={{ ...NUM, fontSize: 52, fontWeight: 800 }}>2026</div>
        <div style={{ ...LABEL, fontSize: 15, color: LAV, marginTop: 4 }}>现在</div>
      </div>
    </div>
    <CutBar x={300} y={650} w={753} h={115} color={DEEP} />
    <div style={abs(1088, 650, { height: 115, display: 'flex', alignItems: 'center' })}>
      <span style={{ ...NUM, fontSize: 104 }}>6%</span>
    </div>

    <div style={abs(120, 795, { height: 115, display: 'flex', alignItems: 'center' })}>
      <div>
        <div style={{ ...NUM, fontSize: 52, fontWeight: 800, color: 'var(--osd-accent)' }}>
          2027
        </div>
        <div style={{ ...LABEL, fontSize: 15, color: LAV, marginTop: 4 }}>目标</div>
      </div>
    </div>
    <VoltBand x={300} y={795} w={1380} />
    <div
      style={abs(340, 795, {
        height: 115,
        width: 1290,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: INK,
      })}
    >
      <span style={{ ...LABEL, fontSize: 18, fontWeight: 700 }}>+5 个百分点 · 2027 年底</span>
      <span style={{ ...NUM, fontSize: 104 }}>11%</span>
    </div>
  </Stage>
);

const StartLane = ({ i }: { i: number }) => (
  <div
    style={abs(i * 240, 800, {
      width: 3,
      height: 300,
      background: WHITE_A(0.45),
      transform: SKEW,
      transformOrigin: '0 0',
    })}
  />
);

const StartNum = ({ n }: { n: number }) => (
  <div
    style={abs((n - 1) * 240 + 60, 880, {
      ...NUM,
      width: 120,
      textAlign: 'center',
      fontSize: 120,
      color: n === 4 ? 'var(--osd-accent)' : WHITE_A(0.9),
    })}
  >
    {n}
  </div>
);

const LANES = [1, 2, 3, 4, 5, 6, 7, 8];

const Closer: Page = () => {
  const live = useIsActivePage();
  const enter = (delay: number): CSSProperties =>
    live ? { animation: `ae-in 0.8s ${SNAP} ${delay}s both` } : {};
  return (
    <Stage footer={false}>
      <Wordmark x={120} y={92} />
      <Title size={180} x={112} y={176} style={enter(0.05)}>
        起跑线上，
        <br />
        不见不散。
      </Title>
      <div style={abs(120, 610, { ...enter(0.18) })}>
        <div style={{ ...DISPLAY, fontSize: 48, lineHeight: 1 }}>林嘉禾</div>
        <div style={{ ...BODY, color: LAV, marginTop: 14 }}>
          市场负责人 · linjiahe@example.com
        </div>
      </div>
      <div style={abs(1380, 610, { width: 420, textAlign: 'right' })}>
        <div style={{ ...LABEL, fontSize: 17, color: LAV }}>开跑日</div>
        <div
          style={{
            ...NUM,
            fontSize: 72,
            fontWeight: 800,
            marginTop: 6,
            color: 'var(--osd-accent)',
          }}
        >
          09·04·27
        </div>
      </div>

      <div style={abs(0, 800, { width: 1920, height: 280, background: DEEP })} />
      {LANES.map((n) => (
        <StartLane key={n} i={n} />
      ))}
      {LANES.map((n) => (
        <StartNum key={n} n={n} />
      ))}
      <div style={abs(-40, 770, { width: 2000, height: 34, background: 'var(--osd-accent)' })} />
    </Stage>
  );
};

export default [Cover, Content, Closer] satisfies Page[];
