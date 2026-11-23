import { type Page, useIsActivePage } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

const styles = `
@keyframes cb-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cb-caret { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0; } }
@keyframes cb-glow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes cb-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes cb-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.6); opacity: 0; } }
@keyframes cb-press { 0%, 100% { transform: translateY(0); } 45%, 60% { transform: translateY(8px); } }
`;

// 只用系统字体，不加载任何外部字体
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", SFMono-Regular, Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace';

const BG = '#F7F3EE';
const SURFACE = '#FFFFFF';
const SURFACE_HI = '#F2ECE5';
const BORDER = '#E3DBD1';
const TEXT = '#1C1917';
const BODY = '#57524C';
const MUTED = '#6B645D';
const ACCENT = '#FF6363';
const ACCENT_INK = '#C93636';
const ACCENT_SOFT = 'rgba(255, 99, 99, 0.12)';
const INK = '#1C1917';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// 浮窗：1px 描边 + 两层暖色柔影（远处大而淡，近处小而实）
const WINDOW_SHADOW =
  '0 1px 0 rgba(255,255,255,0.9) inset, 0 40px 100px rgba(122,62,40,0.16), 0 12px 28px rgba(122,62,40,0.10), 0 2px 4px rgba(28,25,23,0.05)';

const abs = (left: number, top: number, width?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
});

// live 为 false（缩略图、非当前页）时不挂动画，直接显示最终状态
const enter = (live: boolean, delay = 0, dur = 800) =>
  live ? `cb-fadeUp ${dur}ms ${EASE} ${delay}ms both` : undefined;

const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: BG,
  color: TEXT,
  boxSizing: 'border-box',
  fontFamily: SANS,
  position: 'relative',
  overflow: 'hidden',
};

const Title = ({ children, size = 104, align = 'left' }: { children: ReactNode; size?: number; align?: 'left' | 'center' }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      margin: 0,
      color: TEXT,
      textAlign: align,
    }}
  >
    {children}
  </h1>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: SANS,
      fontSize: 64,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
      margin: 0,
      color: TEXT,
    }}
  >
    {children}
  </h2>
);

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px 10px 18px',
      borderRadius: 999,
      border: `1px solid ${BORDER}`,
      background: SURFACE,
      boxShadow: '0 4px 14px rgba(122,62,40,0.06)',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.08em',
      color: BODY,
    }}
  >
    <span
      aria-hidden
      style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: '0 0 0 4px rgba(255,99,99,0.2)' }}
    />
    {children}
  </div>
);

const Kbd = ({ children, size = 40 }: { children: ReactNode; size?: number }) => (
  <kbd
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: size,
      height: size,
      padding: `0 ${Math.round(size * 0.28)}px`,
      boxSizing: 'border-box',
      fontFamily: MONO,
      // ⌘ ↵ 这类符号在等宽字体里偏小，放大一档
      fontSize: Math.round(size * (children === '⌘' || children === '↵' ? 0.6 : 0.5)),
      fontWeight: 500,
      color: TEXT,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F0EA 100%)',
      border: '1px solid #D9D0C5',
      borderRadius: Math.round(size * 0.2),
      boxShadow: 'inset 0 1px 0 #FFFFFF, 0 2px 0 #D9D0C5',
    }}
  >
    {children}
  </kbd>
);

// 大号立体键帽：顶面 + 侧壁 + 落地投影；lit 时整颗染成珊瑚红，投下珊瑚色柔影
const KeyCap = ({ children, size = 220, lit = false }: { children: ReactNode; size?: number; lit?: boolean }) => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size,
      borderRadius: size * 0.18,
      background: lit ? 'linear-gradient(180deg, #FF7B72 0%, #F4554F 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #EEE7DE 100%)',
      border: `1px solid ${lit ? '#E04848' : '#DDD4C9'}`,
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.7)',
        `0 ${size * 0.06}px 0 ${lit ? '#C93636' : '#D5CBBE'}`,
        `0 ${size * 0.06}px 0 1px ${lit ? '#B83030' : '#CFC4B6'}`,
        lit ? '0 50px 90px rgba(255,99,99,0.38)' : '0 50px 80px rgba(122,62,40,0.18)',
        '0 16px 24px rgba(28,25,23,0.08)',
      ]
        .filter(Boolean)
        .join(', '),
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: size * 0.07,
        borderRadius: size * 0.13,
        background: lit ? 'linear-gradient(180deg, #FF6A64 0%, #FF8A7C 100%)' : 'linear-gradient(180deg, #F6F1EB 0%, #FFFFFF 100%)',
        boxShadow: lit
          ? 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(150,30,30,0.2)'
          : 'inset 0 1px 2px rgba(122,62,40,0.08), inset 0 -1px 0 #FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: size * 0.42,
        fontWeight: 500,
        color: lit ? '#FFFFFF' : TEXT,
        textShadow: lit ? '0 2px 0 rgba(150,30,30,0.25)' : 'none',
      }}
    >
      {children}
    </div>
  </div>
);

const Glow = ({
  x,
  y,
  size = 1100,
  opacity = 0.22,
  live = false,
}: {
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  live?: boolean;
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(255,99,99,${opacity}) 0%, rgba(255,99,99,${opacity * 0.35}) 30%, transparent 62%)`,
      pointerEvents: 'none',
      animation: live ? 'cb-glow 5s ease-in-out infinite' : undefined,
    }}
  />
);

// 点阵底纹：以主体为圆心淡出
const DotGrid = ({ x, y, r = 900 }: { x: number; y: number; r?: number }) => {
  const mask = `radial-gradient(${r}px circle at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.5) 45%, transparent 100%)`;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(87,82,76,0.22) 1.2px, transparent 1.6px)',
        backgroundSize: '36px 36px',
        backgroundPosition: '18px 18px',
        WebkitMaskImage: mask,
        maskImage: mask,
        pointerEvents: 'none',
      }}
    />
  );
};

const Footer = ({ pageNum, total, path }: { pageNum: number; total: number; path: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      right: 120,
      bottom: 56,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: MONO,
      fontSize: 22,
      letterSpacing: '0.04em',
      color: MUTED,
    }}
  >
    <span>{path}</span>
    <span>
      <span style={{ color: TEXT }}>{String(pageNum).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
    </span>
  </div>
);

// 线性小图标（24 × 24 视框）
const ICONS: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 2 4.5 5 4.5 9l-2 4h-5l-2-4C7.5 8 9 5 12 3z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M9.5 16l-2 4M14.5 16l2 4" />
    </>
  ),
  split: (
    <>
      <path d="M5 4v6a4 4 0 0 0 4 4h10" />
      <path d="M5 20v-6" />
      <path d="M16 11l3 3-3 3" />
    </>
  ),
  undo: (
    <>
      <path d="M8 6L4 10l4 4" />
      <path d="M4 10h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

const Icon = ({ name, size = 24, color = BODY }: { name: string; size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {ICONS[name]}
  </svg>
);

type Command = { icon: string; title: string; sub: string; kbd: string[] };

// 命令面板浮窗：输入行 + 分组标签 + 结果列表（首行高亮）+ 底栏
const CommandPalette = ({
  query,
  items,
  width = 800,
  live = false,
}: {
  query: string;
  items: Command[];
  width?: number;
  live?: boolean;
}) => (
  <div
    style={{
      width,
      borderRadius: 18,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFAF7 100%)',
      border: `1px solid ${BORDER}`,
      boxShadow: WINDOW_SHADOW,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '26px 30px',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Icon name="search" size={30} color={MUTED} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 500, color: TEXT }}>
        {query}
        <span
          style={{
            display: 'inline-block',
            width: 3,
            height: 34,
            borderRadius: 2,
            background: ACCENT,
            marginLeft: 6,
            animation: live ? 'cb-caret 1.1s steps(1) infinite' : undefined,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 20,
          color: BODY,
          padding: '6px 14px',
          borderRadius: 8,
          background: SURFACE_HI,
          border: `1px solid ${BORDER}`,
        }}
      >
        流水线
      </span>
    </div>
    <div style={{ padding: '14px 14px 10px' }}>
      <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, letterSpacing: '0.08em', padding: '8px 16px 12px' }}>
        建议 · {items.length} 条
      </div>
      {items.map((r, i) => {
        const on = i === 0;
        return (
          <div
            key={r.title}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 18px',
              borderRadius: 12,
              background: on ? SURFACE_HI : 'transparent',
              boxShadow: on ? `0 0 0 1px ${BORDER}` : 'none',
            }}
          >
            {on && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: -14,
                  top: 18,
                  bottom: 18,
                  width: 4,
                  borderRadius: 2,
                  background: ACCENT,
                  boxShadow: '0 2px 8px rgba(255,99,99,0.45)',
                }}
              />
            )}
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: on ? 'linear-gradient(135deg, #FF6363, #FF9B8B)' : SURFACE_HI,
                boxShadow: on ? '0 6px 18px rgba(255,99,99,0.35)' : `inset 0 0 0 1px ${BORDER}`,
              }}
            >
              <Icon name={r.icon} size={26} color={on ? '#FFFFFF' : BODY} />
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: on ? TEXT : '#3F3A36' }}>{r.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 20, color: MUTED }}>{r.sub}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.kbd.map((k) => (
                <Kbd key={k} size={36}>
                  {k}
                </Kbd>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 30px',
        borderTop: `1px solid ${BORDER}`,
        background: '#FAF7F3',
        fontSize: 20,
        color: BODY,
      }}
    >
      <span
        aria-hidden
        style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #FF6363, #FF9B8B)' }}
      />
      <span style={{ flex: 1, color: TEXT, fontWeight: 600 }}>研发台</span>
      <span>执行</span>
      <Kbd size={32}>↵</Kbd>
      <span style={{ width: 1, height: 22, background: BORDER, margin: '0 6px' }} />
      <span>更多操作</span>
      <Kbd size={32}>⌘</Kbd>
      <Kbd size={32}>K</Kbd>
    </div>
  </div>
);

// macOS 终端窗口：墨色底 + 红黄绿三点 + 标题 + 内容（全页唯一的深色块）
const MacWindow = ({ title, width, children }: { title: string; width: number; children: ReactNode }) => (
  <div
    style={{
      width,
      borderRadius: 14,
      background: INK,
      border: '1px solid #2E2A27',
      boxShadow: '0 40px 100px rgba(122,62,40,0.22), 0 12px 28px rgba(28,25,23,0.18)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 18px',
        borderBottom: '1px solid #2E2A27',
        background: '#26221F',
      }}
    >
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <span key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c, opacity: 0.85 }} />
      ))}
      <span style={{ flex: 1, textAlign: 'center', fontFamily: MONO, fontSize: 20, color: '#A8A29E', marginRight: 60 }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

const TOTAL = 3;

const coverCommands: Command[] = [
  { icon: 'rocket', title: '发布到预发环境', sub: 'workflow · deploy-staging', kbd: ['↵'] },
  { icon: 'split', title: '灰度发布到生产（10%）', sub: 'workflow · canary-release', kbd: ['⌘', 'P'] },
  { icon: 'undo', title: '回滚到上一个版本', sub: 'workflow · rollback', kbd: ['⌘', 'Z'] },
  { icon: 'clock', title: '查看最近的发布记录', sub: 'pipeline · history', kbd: ['⌘', 'H'] },
];

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={pageBase}>
      <style>{styles}</style>
      <DotGrid x={1400} y={540} r={1000} />
      <Glow x={1300} y={640} size={1700} opacity={0.3} live={live} />
      {/* 背后的终端窗口，制造前后层次 */}
      <div style={{ ...abs(1180, 112), animation: enter(live, 0, 900) }}>
        <MacWindow title="~/apps/checkout — zsh" width={640}>
          <div style={{ padding: '22px 26px', fontFamily: MONO, fontSize: 20, lineHeight: 1.75, color: '#D6D3D1' }}>
            <div>
              <span style={{ color: ACCENT }}>$</span> git push origin main
            </div>
            <div>✓ build 1m12s · ✓ test 2m40s</div>
            <div>→ waiting for deploy…</div>
          </div>
        </MacWindow>
      </div>
      <div style={{ ...abs(1000, 268), animation: enter(live, 160, 900) }}>
        <CommandPalette query="发布" items={coverCommands} width={800} live={live} />
      </div>

      <div
        style={{
          ...abs(120, 0, 820),
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
          animation: enter(live, 0, 700),
        }}
      >
        <div>
          <Eyebrow>研发效能 · 内部工具</Eyebrow>
        </div>
        <Title>
          整条研发流程，
          <br />
          都在键盘之下。
        </Title>
        <p
          style={{
            fontSize: 30,
            lineHeight: 1.6,
            color: BODY,
            margin: 0,
            maxWidth: 760,
          }}
        >
          提测、发布、回滚，全部收进一个命令面板。
          <br />
          不用切窗口，也不用翻文档。
        </p>
        <div style={{ display: 'flex', gap: 64, marginTop: 8, paddingTop: 36, borderTop: `1px solid ${BORDER}`, width: 700 }}>
          {[
            ['42', '条流水线已接入'],
            ['3.2', '分钟平均上线'],
            ['0', '次手工发布'],
          ].map(([n, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 52, fontWeight: 600, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
              <span style={{ fontSize: 22, color: MUTED }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <Footer pageNum={1} total={TOTAL} path="/developers" />
    </div>
  );
};

type Stage = { name: string; cmd: string; time: string; state: 'done' | 'running' | 'pending' };

const stages: Stage[] = [
  { name: '提交', cmd: 'git push', time: '0:08', state: 'done' },
  { name: '构建', cmd: 'cb build', time: '1:12', state: 'done' },
  { name: '测试', cmd: 'cb test --all', time: '2:40', state: 'done' },
  { name: '预发', cmd: 'cb deploy staging', time: '0:46', state: 'running' },
  { name: '灰度上线', cmd: 'cb canary 10%', time: '待触发', state: 'pending' },
];

const STAGE_W = 304;
const STAGE_GAP = 40;
const stageX = (i: number) => 120 + i * (STAGE_W + STAGE_GAP);

// 流水线一格：序号 + 状态 + 工序名 + 等宽命令 + 耗时
const StageCard = ({ s, i, live }: { s: Stage; i: number; live: boolean }) => {
  const running = s.state === 'running';
  const pending = s.state === 'pending';
  const status = { done: '已完成', running: '进行中', pending: '等待中' }[s.state];
  return (
    <div
      style={{
        ...abs(stageX(i), 452, STAGE_W),
        height: 300,
        boxSizing: 'border-box',
        padding: '28px 28px 26px',
        borderRadius: 18,
        background: running ? 'linear-gradient(180deg, #FFEFEC 0%, #FFFFFF 100%)' : pending ? 'transparent' : SURFACE,
        border: pending ? `2px dashed #CFC5B9` : `1px solid ${running ? 'rgba(255,99,99,0.6)' : BORDER}`,
        boxShadow: running
          ? '0 30px 70px rgba(255,99,99,0.22), 0 10px 24px rgba(122,62,40,0.08)'
          : pending
            ? 'none'
            : '0 18px 44px rgba(122,62,40,0.10), 0 2px 4px rgba(28,25,23,0.04)',
        display: 'flex',
        flexDirection: 'column',
        animation: enter(live, 120 + i * 90),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 20, color: MUTED }}>{String(i + 1).padStart(2, '0')}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 20,
            padding: '4px 12px',
            borderRadius: 999,
            color: running ? ACCENT_INK : pending ? MUTED : BODY,
            background: running ? ACCENT_SOFT : 'transparent',
            border: running ? 'none' : `1px solid ${BORDER}`,
          }}
        >
          {s.state === 'done' && <Icon name="check" size={18} color={BODY} />}
          {status}
        </span>
      </div>
      <div style={{ fontSize: 40, fontWeight: 600, color: pending ? BODY : TEXT, marginTop: 34 }}>{s.name}</div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 20,
          color: running ? ACCENT_INK : BODY,
          marginTop: 14,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: running ? ACCENT_INK : MUTED }}>$ </span>
        {s.cmd}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ height: 4, borderRadius: 2, background: '#ECE5DC', overflow: 'hidden' }}>
        <div
          style={{
            width: s.state === 'done' ? '100%' : running ? '64%' : '0%',
            height: '100%',
            background: running ? ACCENT : '#A8A29E',
            transformOrigin: 'left',
            animation: live ? `cb-grow 1200ms ${EASE} ${400 + i * 120}ms both` : undefined,
          }}
        />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, marginTop: 12 }}>
        {running ? '0:46 · 64%' : s.time}
      </div>
    </div>
  );
};

const Content: Page = () => {
  const live = useIsActivePage();
  const nodeY = 392;
  const firstX = stageX(0) + STAGE_W / 2;
  const runX = stageX(3) + STAGE_W / 2;
  const lastX = stageX(4) + STAGE_W / 2;
  return (
    <div style={pageBase}>
      <style>{styles}</style>
      <DotGrid x={1150} y={600} r={1100} />
      <Glow x={runX} y={620} size={1000} opacity={0.2} live={live} />

      <div style={{ ...abs(120, 108), animation: enter(live, 0, 700) }}>
        <Eyebrow>研发流程</Eyebrow>
      </div>
      <div style={{ ...abs(120, 178, 1000), animation: enter(live, 60, 700) }}>
        <Heading>从提交到上线，一条命令走完。</Heading>
      </div>
      <p
        style={{
          ...abs(1180, 176, 620),
          margin: 0,
          fontSize: 28,
          lineHeight: 1.6,
          color: BODY,
          animation: enter(live, 120, 700),
        }}
      >
        每道工序都是面板里的一条命令，
        <br />
        跑到哪、卡在哪，一眼看清。
      </p>

      {/* 进度轨道 */}
      <div style={{ ...abs(firstX, nodeY - 1, lastX - firstX), height: 2, background: '#D9D0C5' }} />
      <div
        style={{
          ...abs(firstX, nodeY - 1, runX - firstX),
          height: 2,
          background: `linear-gradient(90deg, #A8A29E, ${ACCENT})`,
          transformOrigin: 'left',
          animation: live ? `cb-grow 1400ms ${EASE} 200ms both` : undefined,
        }}
      />
      {stages.map((s, i) => {
        const cx = stageX(i) + STAGE_W / 2;
        const running = s.state === 'running';
        const size = running ? 18 : 14;
        return (
          <div key={s.name} style={{ ...abs(cx - size / 2, nodeY - size / 2), width: size, height: size }}>
            {running && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: ACCENT,
                  animation: live ? 'cb-pulse 1.6s ease-out infinite' : undefined,
                  opacity: live ? undefined : 0,
                }}
              />
            )}
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                boxSizing: 'border-box',
                background: s.state === 'pending' ? BG : running ? ACCENT : MUTED,
                border: s.state === 'pending' ? '2px solid #CFC5B9' : 'none',
                boxShadow: running ? '0 0 0 6px rgba(255,99,99,0.2), 0 4px 14px rgba(255,99,99,0.5)' : 'none',
              }}
            />
          </div>
        );
      })}
      {/* 卡片与轨道之间的短竖线 */}
      {stages.map((s, i) => (
        <div
          key={`stem-${s.name}`}
          style={{
            ...abs(stageX(i) + STAGE_W / 2, nodeY + 14),
            width: 1,
            height: 452 - nodeY - 14,
            background: s.state === 'running' ? 'rgba(255,99,99,0.6)' : '#D9D0C5',
          }}
        />
      ))}
      {stages.map((s, i) => (
        <StageCard key={s.name} s={s} i={i} live={live} />
      ))}

      {/* 键位提示条 */}
      <div
        style={{
          ...abs(120, 812, 1680),
          height: 104,
          boxSizing: 'border-box',
          borderRadius: 18,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 18px 44px rgba(122,62,40,0.08), 0 2px 4px rgba(28,25,23,0.04)',
          display: 'flex',
          alignItems: 'center',
          animation: enter(live, 600),
        }}
      >
        {[
          { keys: ['⌘', 'K'], label: '唤起命令面板' },
          { keys: ['⌘', '↵'], label: '跑下一道工序' },
          { keys: ['⌘', 'Z'], label: '一键回滚到上一版' },
        ].map((h, i) => (
          <div
            key={h.label}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
              height: 56,
            }}
          >
            {h.keys.map((k) => (
              <Kbd key={k} size={44}>
                {k}
              </Kbd>
            ))}
            <span style={{ fontSize: 26, color: '#3F3A36', marginLeft: 12 }}>{h.label}</span>
          </div>
        ))}
      </div>
      <Footer pageNum={2} total={TOTAL} path="/developers/pipeline" />
    </div>
  );
};

const Closer: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={pageBase}>
      <style>{styles}</style>
      <DotGrid x={960} y={400} r={900} />
      <Glow x={1110} y={420} size={1150} opacity={0.28} live={live} />

      <div
        style={{
          ...abs(0, 176, 1920),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 56,
        }}
      >
        <div style={{ animation: enter(live, 0, 900) }}>
          <KeyCap size={236}>⌘</KeyCap>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 64, color: MUTED, animation: enter(live, 120, 900) }}>+</span>
        <div style={{ animation: enter(live, 200, 900) }}>
          <div style={{ animation: live ? `cb-press 900ms ${EASE} 1300ms both` : undefined }}>
            <KeyCap size={236} lit>K</KeyCap>
          </div>
        </div>
      </div>

      <div
        style={{
          ...abs(0, 556, 1920),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          animation: enter(live, 300, 800),
        }}
      >
        <Title size={96} align="center">
          现在，按下它。
        </Title>
        <p style={{ margin: 0, fontSize: 30, lineHeight: 1.6, color: BODY, textAlign: 'center' }}>
          三分钟接入你的第一条流水线，剩下的交给命令面板。
        </p>
        <div
          style={{
            marginTop: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 22,
            padding: '18px 18px 18px 30px',
            borderRadius: 14,
            background: INK,
            border: '1px solid #2E2A27',
            boxShadow: '0 24px 60px rgba(122,62,40,0.20), 0 6px 16px rgba(28,25,23,0.12)',
            fontFamily: MONO,
            fontSize: 26,
            color: '#F5F5F4',
          }}
        >
          <span>
            <span style={{ color: ACCENT }}>$ </span>npx devflow init
          </span>
          <span
            style={{
              fontSize: 20,
              color: '#D6D3D1',
              padding: '6px 14px',
              borderRadius: 8,
              background: '#2E2A27',
              border: '1px solid #3A3532',
            }}
          >
            复制
          </span>
        </div>
      </div>
      <Footer pageNum={TOTAL} total={TOTAL} path="/developers/quickstart" />
    </div>
  );
};

export default [Cover, Content, Closer];
