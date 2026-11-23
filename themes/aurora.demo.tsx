import { type Page, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

const styles = `
@keyframes au-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes au-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes au-glow { 0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); } }
@keyframes au-flow { from { stroke-dashoffset: 48; } to { stroke-dashoffset: 0; } }
@keyframes au-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
`;

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

const C = {
  bg: '#FAF9FE',
  surface: '#F6F4FC',
  surfaceHi: '#FFFFFF',
  line: 'rgba(24,24,27,0.09)',
  text: '#18181B',
  body: '#3F3F46',
  meta: '#5C5C66',
  faint: '#A1A1AA',
  accent: '#7C3AED',
  accentHi: '#6D28D9',
  accentSoft: 'rgba(124,58,237,0.10)',
  fieldViolet: '#B9A2FF',
  fieldBlue: '#9CC4FF',
  fieldPink: '#FBB6E0',
  ink: '#111116',
  inkHi: '#1E1C28',
  inkText: '#FAFAFA',
  inkBody: '#C9C9D1',
  inkMeta: '#A1A1AA',
  inkAccent: '#C4B5FD',
  inkSoft: 'rgba(167,139,250,0.20)',
};

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// 所有动画都以 live 为开关：缩略图里 live 为 false，直接显示最终状态
const rise = (live: boolean, delay = 0): CSSProperties =>
  live ? { animation: `au-rise 800ms ${EASE} ${delay}ms both` } : {};

const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: C.bg,
  color: C.text,
  padding: '100px 120px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  fontVariantNumeric: 'tabular-nums',
  position: 'relative',
  overflow: 'hidden',
};

// 点阵纹理：淡墨紫色小点，从色场处向四周淡出
const DotGrid = ({ x = '50%', y = '40%' }: { x?: string; y?: string }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(rgba(76,29,149,0.18) 1.2px, transparent 1.2px)',
      backgroundSize: '32px 32px',
      maskImage: `radial-gradient(ellipse 60% 70% at ${x} ${y}, #000 0%, transparent 100%)`,
      WebkitMaskImage: `radial-gradient(ellipse 60% 70% at ${x} ${y}, #000 0%, transparent 100%)`,
      pointerEvents: 'none',
    }}
  />
);

// 极光色场：紫 / 蓝 / 粉三团柔光叠成的网格渐变，放在主体背后
const Glow = ({
  x = '50%',
  y = '50%',
  size = 1100,
  opacity = 0.85,
  live = false,
}: {
  x?: string;
  y?: string;
  size?: number;
  opacity?: number;
  live?: boolean;
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size * 0.8,
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(closest-side at 34% 42%, ${C.fieldViolet}, transparent), radial-gradient(closest-side at 70% 34%, ${C.fieldBlue}, transparent), radial-gradient(closest-side at 58% 72%, ${C.fieldPink}, transparent)`,
      opacity,
      filter: 'blur(48px)',
      pointerEvents: 'none',
      animation: live ? 'au-glow 6s ease-in-out infinite' : undefined,
    }}
  />
);

// 白色玻璃卡片：渐变描边 + 顶部内高光 + 带紫调的柔和投影
const Panel = ({
  children,
  style,
  glow = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  glow?: boolean;
}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 20,
      border: '1px solid transparent',
      background: `linear-gradient(180deg, ${C.surfaceHi}, ${C.surface}) padding-box, ${
        glow
          ? 'linear-gradient(135deg, #A78BFA, #93C5FD 50%, #F9A8D4) border-box'
          : 'linear-gradient(160deg, rgba(124,58,237,0.28), rgba(24,24,27,0.08) 45%, rgba(24,24,27,0.10)) border-box'
      }`,
      boxShadow: glow
        ? 'inset 0 1px 0 #FFFFFF, 0 2px 6px rgba(24,24,27,0.04), 0 36px 80px -24px rgba(124,58,237,0.38)'
        : 'inset 0 1px 0 #FFFFFF, 0 1px 3px rgba(24,24,27,0.05), 0 24px 60px -24px rgba(76,29,149,0.22)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

const Title = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 112,
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      margin: 0,
      color: C.text,
      backgroundImage: 'linear-gradient(180deg, #18181B 30%, #5B21B6 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      ...style,
    }}
  >
    {children}
  </h1>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: SANS,
      fontSize: 60,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
      margin: 0,
      color: C.text,
    }}
  >
    {children}
  </h2>
);

const Eyebrow = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 20px',
      borderRadius: 999,
      border: '1px solid rgba(124,58,237,0.30)',
      background: 'rgba(255,255,255,0.75)',
      boxShadow: '0 6px 20px -8px rgba(124,58,237,0.35)',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.12em',
      color: C.accentHi,
      ...style,
    }}
  >
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: C.accent,
        boxShadow: '0 0 0 4px rgba(124,58,237,0.16)',
      }}
    />
    {children}
  </div>
);

const Footer = ({ path = '/docs' }: { path?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 52,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: MONO,
        fontSize: 20,
        letterSpacing: '0.04em',
        color: C.meta,
      }}
    >
      <span>
        <span style={{ color: C.accent, fontWeight: 600 }}>aurora</span> {path}
      </span>
      <span>
        {String(current).padStart(2, '0')} <span style={{ color: C.faint }}>/ {String(total).padStart(2, '0')}</span>
      </span>
    </div>
  );
};

// 产品窗口：全页唯一的深色元素，60 px 标题栏 + 三个圆点，渐变描边 + 紫色投影
const Window = ({ title, children, style }: { title: string; children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 20,
      border: '1px solid transparent',
      background: `linear-gradient(180deg, ${C.inkHi}, ${C.ink}) padding-box, linear-gradient(135deg, rgba(196,181,253,0.9), rgba(255,255,255,0.10) 45%, rgba(249,168,212,0.55)) border-box`,
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 24px -8px rgba(17,17,22,0.25), 0 48px 100px -28px rgba(91,33,182,0.55)',
      overflow: 'hidden',
      color: C.inkText,
      ...style,
    }}
  >
    <div
      style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.03)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: '#3F3F46' }} />
        ))}
      </div>
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 20,
          color: C.inkMeta,
        }}
      >
        {title}
      </span>
    </div>
    {children}
  </div>
);

/* ---------------- 封面：左文案 + 右侧终端窗口 ---------------- */

const termLines: { kind: 'cmd' | 'out' | 'ok' | 'link'; text: string; value?: string }[] = [
  { kind: 'cmd', text: 'npm i aurora@3.0.0' },
  { kind: 'out', text: '已添加 1 个包', value: '0.8s' },
  { kind: 'cmd', text: 'aurora dev' },
  { kind: 'ok', text: '运行时 v3.0.0 就绪', value: '92ms' },
  { kind: 'ok', text: '迁移检查：破坏性变更', value: '0 处' },
  { kind: 'ok', text: '空闲内存基线', value: '−38%' },
  { kind: 'link', text: 'http://localhost:3000' },
];

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={{ ...pageBase, flexDirection: 'row', alignItems: 'center', gap: 72 }}>
      <style>{styles}</style>
      <DotGrid x="30%" y="45%" />
      <Glow x="74%" y="46%" size={1500} live={live} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, position: 'relative', ...rise(live) }}>
        <Eyebrow>版本发布 · v3.0</Eyebrow>
        <Title>
          不声不响，
          <br />
          经得起长跑。
        </Title>
        <p style={{ fontSize: 30, lineHeight: 1.6, color: C.body, margin: 0, maxWidth: 760 }}>
          本季度落地三项架构改进：
          <br />
          没有一项惹眼，每一项都在承重。
        </p>
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 16,
            paddingTop: 32,
            borderTop: `1px solid ${C.line}`,
            fontFamily: MONO,
          }}
        >
          {[
            ['发布日期', '2026.11.18'],
            ['通道', 'stable'],
            ['兼容', 'v2 全部 API'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 20, color: C.meta, letterSpacing: '0.08em' }}>{k}</span>
              <span style={{ fontSize: 26, color: C.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 820, position: 'relative', ...rise(live, 150) }}>
        <Window title="~/aurora — zsh">
          <div
            style={{
              padding: '32px 40px 64px',
              fontFamily: MONO,
              fontSize: 26,
              lineHeight: 1.85,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {termLines.map((l, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: l.kind === 'cmd' && i > 0 ? 14 : 0,
                  ...(live ? { animation: `au-fade 300ms ease-out ${400 + i * 160}ms both` } : {}),
                }}
              >
                <span>
                  {l.kind === 'cmd' && <span style={{ color: C.inkAccent }}>$ </span>}
                  {l.kind === 'ok' && <span style={{ color: C.inkAccent }}>✓ </span>}
                  {l.kind === 'link' && <span style={{ color: C.inkAccent }}>→ </span>}
                  <span
                    style={{
                      color: l.kind === 'cmd' ? C.inkText : l.kind === 'link' ? C.inkAccent : C.inkBody,
                      paddingLeft: l.kind === 'out' ? 30 : 0,
                    }}
                  >
                    {l.text}
                  </span>
                  {l.kind === 'link' && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 30,
                        marginLeft: 12,
                        verticalAlign: -5,
                        background: C.inkText,
                        animation: live ? 'au-blink 1.1s step-end infinite' : undefined,
                      }}
                    />
                  )}
                </span>
                {l.value && <span style={{ color: l.kind === 'ok' ? C.inkText : C.inkMeta }}>{l.value}</span>}
              </div>
            ))}
          </div>
        </Window>

        {/* 浮在窗口左下角的白色指标小卡，压在深色窗口上制造前后层次 */}
        <Panel
          glow
          style={{
            position: 'absolute',
            left: -64,
            bottom: -96,
            width: 320,
            padding: '22px 26px',
            ...(live ? { animation: `au-rise 800ms ${EASE} 600ms both` } : {}),
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 20, color: C.meta, letterSpacing: '0.08em' }}>冷启动 P50</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 52, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>92ms</span>
            <svg width="120" height="48" viewBox="0 0 120 48" aria-hidden>
              <defs>
                <linearGradient id="au-spark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 8 L20 12 L40 10 L60 22 L80 30 L100 36 L120 40 L120 48 L0 48 Z" fill="url(#au-spark)" />
              <path
                d="M0 8 L20 12 L40 10 L60 22 L80 30 L100 36 L120 40"
                fill="none"
                stroke={C.accent}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Panel>
      </div>
      <Footer path="/docs/release-notes" />
    </div>
  );
};

/* ---------------- 内容页：架构图 + 指标列 ---------------- */

type NodeProps = { x: number; y: number; w: number; h: number; title: string; sub: string; tone?: 'hero' | 'idle' };

const Node = ({ x, y, w, h, title, sub, tone }: NodeProps) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 6,
      padding: '0 22px',
      background:
        tone === 'hero'
          ? 'linear-gradient(135deg, #6D28D9, #4F46E5 60%, #7C3AED)'
          : tone === 'idle'
            ? 'rgba(255,255,255,0.5)'
            : C.surfaceHi,
      border:
        tone === 'hero'
          ? '1px solid rgba(255,255,255,0.35)'
          : tone === 'idle'
            ? '1px dashed rgba(24,24,27,0.28)'
            : '1px solid rgba(24,24,27,0.12)',
      boxShadow:
        tone === 'hero'
          ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 8px rgba(124,58,237,0.10), 0 24px 50px -12px rgba(124,58,237,0.55)'
          : tone === 'idle'
            ? 'none'
            : '0 1px 2px rgba(24,24,27,0.05), 0 10px 24px -12px rgba(76,29,149,0.20)',
    }}
  >
    <span
      style={{
        fontSize: tone === 'hero' ? 30 : 26,
        fontWeight: 600,
        color: tone === 'hero' ? '#FFFFFF' : tone === 'idle' ? C.meta : C.text,
      }}
    >
      {title}
    </span>
    <span style={{ fontFamily: MONO, fontSize: 20, color: tone === 'hero' ? '#EDE9FE' : C.meta }}>{sub}</span>
  </div>
);

const stats = [
  { n: '4.2×', label: '冷启动', body: '拉起到可接流量，不到 100 毫秒。' },
  { n: '−38%', label: '内存占用', body: '空闲 Worker 主动归还闲置内存。' },
  { n: '0', label: '破坏性变更', body: 'v2 公开 API 原样可用，零改动。' },
];

const Content: Page = () => {
  const live = useIsActivePage();
  const flow = (delay: number): CSSProperties | undefined =>
    live ? { animation: `au-flow 1.6s linear ${delay}s infinite` } : undefined;
  return (
    <div style={{ ...pageBase, gap: 48 }}>
      <style>{styles}</style>
      <Glow x="38%" y="66%" size={1300} opacity={0.75} live={live} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', ...rise(live) }}>
        <Eyebrow>架构 · 运行时</Eyebrow>
        <Heading>一次请求，在 v3 里这样走完。</Heading>
      </div>

      <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
        {/* 架构示意图 */}
        <Panel glow style={{ width: 1100, height: 620, flexShrink: 0, ...rise(live, 120) }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(76,29,149,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(76,29,149,0.07) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 70% 70% at 55% 55%, #000 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 55% 55%, #000 30%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              borderBottom: `1px solid ${C.line}`,
              fontFamily: MONO,
              fontSize: 20,
              color: C.meta,
            }}
          >
            <span>runtime.topology</span>
            <span style={{ display: 'flex', gap: 28 }}>
              <span>
                <span style={{ color: C.accent }}>●</span> 活跃
              </span>
              <span>
                <span style={{ color: C.faint }}>○</span> 休眠
              </span>
            </span>
          </div>

          <div style={{ position: 'relative', height: 556 }}>
            <svg width="1100" height="556" style={{ position: 'absolute', inset: 0 }} aria-hidden>
              {[
                'M228 278 L284 278',
                'M484 278 L540 278',
                'M770 278 C 805 278, 805 112, 840 112',
                'M770 278 L840 278',
                'M770 278 C 805 278, 805 444, 840 444',
              ].map((d, i) => (
                <g key={d}>
                  <path d={d} fill="none" stroke="rgba(24,24,27,0.16)" strokeWidth="2" />
                  {i !== 4 && (
                    <path
                      d={d}
                      fill="none"
                      stroke={C.accent}
                      strokeWidth="2.5"
                      strokeDasharray="10 14"
                      strokeLinecap="round"
                      style={flow(i * 0.2)}
                    />
                  )}
                </g>
              ))}
            </svg>
            <div style={{ position: 'absolute', left: 40, top: 40, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 20, color: C.meta, letterSpacing: '0.08em' }}>端到端 p99</span>
              <span style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                18<span style={{ fontSize: 28, color: C.meta, marginLeft: 6 }}>ms</span>
              </span>
            </div>
            <Node x={40} y={236} w={188} h={84} title="客户端" sub="HTTP/3" />
            <Node x={284} y={236} w={200} h={84} title="边缘网关" sub="鉴权 · 限流" />
            <Node x={540} y={204} w={230} h={148} title="调度器" sub="新 · 预热池" tone="hero" />
            <Node x={840} y={64} w={220} h={96} title="Worker A" sub="运行中 · 42%" />
            <Node x={840} y={230} w={220} h={96} title="Worker B" sub="运行中 · 37%" />
            <Node x={840} y={396} w={220} h={96} title="Worker C" sub="休眠 · 已归还" tone="idle" />
            <div
              style={{
                position: 'absolute',
                left: 40,
                bottom: 36,
                fontFamily: MONO,
                fontSize: 20,
                color: C.meta,
              }}
            >
              <span style={{ color: C.accent }}>+</span> 预热池让新 Worker 免冷启动，直接接流量
            </div>
          </div>
        </Panel>

        {/* 指标列 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {stats.map((s, i) => (
            <Panel
              key={s.label}
              style={{
                flex: 1,
                padding: '26px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 12,
                ...rise(live, 240 + i * 100),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 72, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.12em', color: C.accentHi }}>
                  {s.label}
                </span>
              </div>
              <div style={{ fontSize: 26, lineHeight: 1.5, color: C.body }}>{s.body}</div>
            </Panel>
          ))}
        </div>
      </div>
      <Footer path="/docs/architecture" />
    </div>
  );
};

/* ---------------- 结尾页：居中标题 + 代码 diff ---------------- */

const diff: { no: string; sign: ' ' | '-' | '+'; code: string; indent?: boolean }[] = [
  { no: '12', sign: ' ', code: '"dependencies": {' },
  { no: '13', sign: '-', code: '"aurora": "^2.9.4",', indent: true },
  { no: '13', sign: '+', code: '"aurora": "^3.0.0",', indent: true },
  { no: '14', sign: ' ', code: '}' },
];

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={{ ...pageBase, alignItems: 'center', paddingTop: 80 }}>
      <style>{styles}</style>
      <DotGrid x="50%" y="30%" />
      <Glow x="50%" y="58%" size={1500} opacity={0.6} live={live} />
      {/* 晨光地平线：一个巨大的浅色椭圆，顶边紫色细线，向上投紫 / 蓝 / 粉三层彩色柔光 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 850,
          width: 3200,
          height: 1600,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: C.bg,
          borderTop: '2px solid rgba(124,58,237,0.65)',
          boxShadow:
            '0 -16px 50px rgba(167,139,250,0.75), 0 -80px 160px rgba(147,197,253,0.6), 0 -180px 280px rgba(249,168,212,0.5)',
          ...(live ? { animation: 'au-fade 1.2s ease-out both' } : {}),
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          position: 'relative',
          textAlign: 'center',
          ...rise(live),
        }}
      >
        <Eyebrow style={{ alignSelf: 'center' }}>开始升级</Eyebrow>
        <Title>先读升级文档。</Title>
        <p style={{ fontSize: 30, lineHeight: 1.6, color: C.body, margin: 0 }}>
          只改一行依赖版本，其余优化，等你有空再慢慢做。
        </p>
      </div>

      <Window title="package.json" style={{ width: 960, marginTop: 44, ...rise(live, 150) }}>
        <div style={{ padding: '18px 0', fontFamily: MONO, fontSize: 26, lineHeight: 1.8 }}>
          {diff.map((l, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                padding: '0 32px',
                background: l.sign === '+' ? C.inkSoft : l.sign === '-' ? 'rgba(255,255,255,0.03)' : 'transparent',
                boxShadow: l.sign === '+' ? `inset 3px 0 0 ${C.inkAccent}` : undefined,
              }}
            >
              <span style={{ width: 56, color: C.inkMeta, opacity: 0.6 }}>{l.no}</span>
              <span style={{ width: 36, color: l.sign === '+' ? C.inkAccent : C.inkMeta }}>{l.sign}</span>
              <span
                style={{
                  whiteSpace: 'pre',
                  marginLeft: l.indent ? 32 : 0,
                  color: l.sign === '+' ? '#EDE9FE' : l.sign === '-' ? C.inkMeta : C.inkBody,
                  textDecoration: l.sign === '-' ? 'line-through' : undefined,
                  textDecorationColor: 'rgba(161,161,170,0.6)',
                }}
              >
                {l.code}
              </span>
            </div>
          ))}
        </div>
      </Window>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 36, position: 'relative', ...rise(live, 300) }}>
        <span
          style={{
            padding: '16px 32px',
            borderRadius: 12,
            background: C.text,
            color: '#FFFFFF',
            fontSize: 26,
            fontWeight: 600,
            boxShadow: '0 14px 30px -10px rgba(76,29,149,0.45)',
          }}
        >
          阅读升级指南 →
        </span>
        <span style={{ fontFamily: MONO, fontSize: 22, color: C.meta }}>aurora.dev/docs/upgrade · 约 5 分钟</span>
      </div>
      <Footer path="/docs/upgrade" />
    </div>
  );
};

export default [Cover, Content, Closer];
