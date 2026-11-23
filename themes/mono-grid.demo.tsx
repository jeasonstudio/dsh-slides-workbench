import { type Page, useIsActivePage } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO =
  '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

const BG = '#F4F3EF';
const TEXT = '#0A0A0A';
const BODY = '#3D3D3D';
const MUTED = '#5E5E5E';
const GRID = '#DCDAD3';
const FRAME = '#B5B3AC';
const MARK = '#8C8A84';
const ACCENT = '#FF4F00';
const DIM = '#9A9A9A';

// 栅格：120 px 正方形模块，16 × 9。内容区 x 120–1800、y 120–960（14 列 × 7 行）
const U = 120;
const COLS = 16;
const ROWS = 9;

const KEYFRAMES = `
@keyframes mg-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mg-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mg-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes mg-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
`;

const abs = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
  width: w,
  height: h,
});

// live 为 true 时进场；缩略图（非当前页）直接显示最终状态
const enter = (live: boolean, delay = 0, name = 'mg-fadeUp', ms = 700): CSSProperties =>
  live ? { animation: `${name} ${ms}ms cubic-bezier(0.2, 0, 0, 1) ${delay}ms both` } : {};

const root: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: BG,
  color: TEXT,
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
  WebkitFontSmoothing: 'antialiased',
};

const GridField = () => {
  const xs = Array.from({ length: COLS - 1 }, (_, i) => (i + 1) * U);
  const ys = Array.from({ length: ROWS - 1 }, (_, i) => (i + 1) * U);
  const edge = (v: number, max: number) => v === U || v === max - U;
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      {xs.map((x) => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={1080} stroke={edge(x, 1920) ? FRAME : GRID} />
      ))}
      {ys.map((y) => (
        <line key={`h${y}`} x1={0} y1={y} x2={1920} y2={y} stroke={edge(y, 1080) ? FRAME : GRID} />
      ))}
      {/* 顶部刻度：每 60 px 一短刻，每 120 px 一长刻 */}
      {Array.from({ length: 29 }, (_, i) => U + i * 60).map((x, i) => (
        <line key={`t${x}`} x1={x} y1={U} x2={x} y2={U - (i % 2 ? 6 : 14)} stroke={MUTED} />
      ))}
      {/* 十字对位标记：每个交点一个 */}
      {xs.flatMap((x) =>
        ys.map((y) => (
          <path key={`c${x}-${y}`} d={`M${x - 7} ${y}H${x + 7}M${x} ${y - 7}V${y + 7}`} stroke={MARK} />
        )),
      )}
      {/* 列号与行号 */}
      {xs.slice(0, -1).map((x, i) => (
        <text key={`n${x}`} x={x + 8} y={U - 22} fill={MUTED} fontFamily={MONO} fontSize={20}>
          {String(i + 1).padStart(2, '0')}
        </text>
      ))}
      {ys.slice(0, -1).map((y, i) => (
        <text key={`r${y}`} x={U - 16} y={y + 30} fill={MUTED} fontFamily={MONO} fontSize={20} textAnchor="end">
          {String.fromCharCode(65 + i)}
        </text>
      ))}
    </svg>
  );
};

const Header = ({ right }: { right: string }) => (
  <div
    style={{
      ...abs(U, 36, 1680),
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.04em',
      color: MUTED,
    }}
  >
    <span>
      <span style={{ color: TEXT }}>ATLAS</span>　边缘运行时 4.0
    </span>
    <span>{right}</span>
  </div>
);

const Footer = ({ n, total }: { n: number; total: number }) => (
  <div
    style={{
      ...abs(U, 1000, 1680),
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.04em',
      color: MUTED,
    }}
  >
    <span>基础设施团队 · 技术发布</span>
    <span>
      <span style={{ color: TEXT }}>{String(n).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
    </span>
  </div>
);

const Eyebrow = ({ index, label }: { index: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, color: MUTED }}>
    <span style={{ fontFamily: MONO, color: TEXT }}>{index}</span>
    <span style={{ width: 40, height: 1, background: MUTED }} />
    <span style={{ fontWeight: 600, letterSpacing: '0.12em' }}>{label}</span>
  </div>
);

// 超大数字：用 SVG text 按基线精确落在栅格线上
const BigNumber = ({
  x,
  y,
  size,
  anchor = 'start',
  children,
}: {
  x: number;
  y: number;
  size: number;
  anchor?: 'start' | 'end';
  children: ReactNode;
}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={TEXT}
      fontFamily={SANS}
      fontWeight={700}
      fontSize={size}
      letterSpacing={-size * 0.045}
    >
      {children}
    </text>
  </svg>
);

const TOTAL = 3;

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <style>{KEYFRAMES}</style>
      <GridField />
      <Header right="发布会 / 2026.11" />

      <div style={{ ...abs(U, 160), ...enter(live, 0) }}>
        <Eyebrow index="01" label="技术发布" />
      </div>
      <h1
        style={{
          ...abs(U, 240),
          margin: 0,
          fontSize: 112,
          fontWeight: 700,
          lineHeight: '120px',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          ...enter(live, 80),
        }}
      >
        边缘运行时，
        <br />
        终于就绪。
      </h1>
      <p style={{ ...abs(U, 520, 600), margin: 0, fontSize: 30, lineHeight: 1.6, color: BODY, ...enter(live, 160) }}>
        三条没有妥协的约束，
        <br />
        以及为守住它们交付的整套技术栈。
      </p>

      {/* 左下：规格表，预告下一页 */}
      <div style={{ ...abs(U, 720, 480), ...enter(live, 240) }}>
        {[
          ['冷启动', '50ms'],
          ['客户端运行时', '0kb'],
          ['覆盖区域', '32'],
          ['可用性', '99.99%'],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${FRAME}`,
              fontSize: 26,
            }}
          >
            <span style={{ color: BODY }}>{k}</span>
            <span style={{ fontFamily: MONO, color: TEXT }}>{v}</span>
          </div>
        ))}
      </div>

      {/* 右侧：超大版本号，基线压在 y=840 */}
      <div style={{ position: 'absolute', inset: 0, ...enter(live, 120, 'mg-fade', 900) }}>
        <BigNumber x={1800} y={840} size={640} anchor="end">
          4<tspan fill={ACCENT}>.</tspan>0
        </BigNumber>
      </div>
      {/* 版本号下方：一整行实心墨块，基线正好压在它的顶边 */}
      <div
        style={{
          ...abs(840, 840, 960, 120),
          boxSizing: 'border-box',
          background: TEXT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          fontFamily: MONO,
          fontSize: 22,
          color: DIM,
          ...enter(live, 200, 'mg-fade', 600),
        }}
      >
        <span>
          v3.2 → <span style={{ color: BG }}>v4.0</span>
        </span>
        <span style={{ color: BG }}>2026.11.16 正式可用</span>
      </div>

      <Footer n={1} total={TOTAL} />
    </div>
  );
};

// 刻度尺：0–400 ms 映射到 x 120–1800，轴线在 y=888
const SCALE_MAX = 400;
const sx = (ms: number) => U + (ms / SCALE_MAX) * 1680;

const Data: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <style>{KEYFRAMES}</style>
      <GridField />
      <Header right="指标 / 冷启动" />

      <div style={{ ...abs(U, 160), ...enter(live, 0) }}>
        <Eyebrow index="02" label="约束一" />
      </div>
      <h2 style={{ ...abs(U, 200), margin: 0, fontSize: 56, fontWeight: 700, lineHeight: 1.2, ...enter(live, 60) }}>
        冷启动，压到 50 毫秒以内。
      </h2>

      <div style={{ position: 'absolute', inset: 0, ...enter(live, 120, 'mg-fade', 900) }}>
        <BigNumber x={U - 24} y={720} size={560}>
          50
          <tspan fontSize={180} dx={36} letterSpacing={-4}>
            ms
          </tspan>
        </BigNumber>
      </div>

      {/* 右栏：实测分位数 */}
      <div style={{ ...abs(1320, 360, 480), ...enter(live, 200) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, height: 60 }}>实测 · 全球 32 个区域</div>
        {[
          ['P50', '18ms'],
          ['P90', '31ms'],
          ['P99', '47ms'],
          ['最慢区域', '49ms'],
        ].map(([k, v], i) => (
          <div
            key={k}
            style={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${FRAME}`,
            }}
          >
            <span style={{ fontSize: 26, color: i === 2 ? TEXT : BODY, fontWeight: i === 2 ? 600 : 400 }}>{k}</span>
            <span style={{ fontFamily: MONO, fontSize: 32, color: TEXT }}>{v}</span>
          </div>
        ))}
        <p style={{ margin: '28px 0 0', fontSize: 26, lineHeight: 1.6, color: BODY }}>
          从收到请求计时，到返回首字节。
          <br />
          连续 30 天，每分钟采样一次。
        </p>
      </div>

      {/* 底部：对比刻度尺 */}
      <div style={{ ...abs(U, 776), fontFamily: MONO, fontSize: 20, color: MUTED }}>P99 冷启动 / 毫秒</div>
      {[
        { ms: 340, y: 820, color: '#A8A69F', label: '340ms　v3.2' },
        { ms: 47, y: 848, color: ACCENT, label: '47ms　v4.0' },
      ].map((b, i) => (
        <div key={b.label}>
          <div
            style={{
              ...abs(U, b.y, sx(b.ms) - U, 12),
              background: b.color,
              transformOrigin: 'left',
              ...enter(live, 300 + i * 150, 'mg-grow', 800),
            }}
          />
          <div
            style={{
              ...abs(sx(b.ms) + 16, b.y - 7),
              fontFamily: MONO,
              fontSize: 20,
              lineHeight: '26px',
              color: i ? TEXT : MUTED,
              whiteSpace: 'nowrap',
              ...enter(live, 700 + i * 150, 'mg-fade', 400),
            }}
          >
            {b.label}
          </div>
        </div>
      ))}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <line x1={U} y1={888} x2={1800} y2={888} stroke={TEXT} />
        {Array.from({ length: SCALE_MAX / 20 + 1 }, (_, i) => i * 20).map((ms) => (
          <line
            key={ms}
            x1={sx(ms)}
            y1={888}
            x2={sx(ms)}
            y2={ms % 100 ? 896 : 906}
            stroke={ms % 100 ? MUTED : TEXT}
          />
        ))}
        {[0, 100, 200, 300, 400].map((ms) => (
          <text
            key={ms}
            x={sx(ms)}
            y={936}
            fill={MUTED}
            fontFamily={MONO}
            fontSize={20}
            textAnchor={ms === 0 ? 'start' : ms === SCALE_MAX ? 'end' : 'middle'}
          >
            {ms}
          </text>
        ))}
      </svg>

      <Footer n={2} total={TOTAL} />
    </div>
  );
};

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <style>{KEYFRAMES}</style>
      <GridField />
      <Header right="上线 / 现在" />

      <div style={{ ...abs(U, 160), ...enter(live, 0) }}>
        <Eyebrow index="03" label="上线" />
      </div>
      <h2
        style={{
          ...abs(U - 8, 220),
          margin: 0,
          fontSize: 240,
          fontWeight: 700,
          lineHeight: '240px',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          ...enter(live, 60),
        }}
      >
        上线吧。
      </h2>
      <p style={{ ...abs(1320, 240, 480), margin: 0, fontSize: 30, lineHeight: 1.6, color: BODY, ...enter(live, 160) }}>
        一条命令就够了。
        <br />
        不提工单，不排值班表。
      </p>

      {/* 命令行：占满一整行模块 */}
      <div
        style={{
          ...abs(U, 540, 1680, 120),
          boxSizing: 'border-box',
          background: TEXT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          fontFamily: MONO,
          ...enter(live, 240),
        }}
      >
        <span style={{ fontSize: 48, color: BG, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: DIM, marginRight: 28 }}>$</span>
          atlas deploy --prod
          <span
            style={{
              display: 'inline-block',
              width: 26,
              height: 52,
              marginLeft: 14,
              background: ACCENT,
              ...(live ? { animation: 'mg-blink 1s steps(1) infinite' } : {}),
            }}
          />
        </span>
        <span style={{ fontSize: 22, color: DIM }}>↵ 回车即上线</span>
      </div>

      {/* 四步：每格 3.5 个模块宽 */}
      {[
        ['01', '构建', '0.8s', '增量构建，只编译改动的路由'],
        ['02', '分发', '×32', '产物同时推到 32 个边缘区域'],
        ['03', '预热', '1.6s', '每个区域先拉起一个实例'],
        ['04', '生效', '4.2s', '切换流量，旧版本随时回滚'],
      ].map(([n, k, v, d], i) => (
        <div
          key={n}
          style={{
            ...abs(U + i * 420, 720, 420, 240),
            boxSizing: 'border-box',
            borderTop: `2px solid ${TEXT}`,
            padding: '20px 32px 0 0',
            ...enter(live, 360 + i * 90),
          }}
        >
          <div style={{ display: 'flex', gap: 14, fontSize: 22, color: MUTED }}>
            <span style={{ fontFamily: MONO }}>{n}</span>
            <span style={{ fontWeight: 600, color: TEXT }}>{k}</span>
          </div>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: '104px', letterSpacing: '-0.02em' }}>{v}</div>
          <div style={{ fontSize: 26, lineHeight: 1.5, color: BODY }}>{d}</div>
        </div>
      ))}

      <Footer n={3} total={TOTAL} />
    </div>
  );
};

export default [Cover, Data, Closer];
