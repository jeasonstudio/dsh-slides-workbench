// 首页灵感墙的静态内容：和本地 deck 无关，打包在扩展里。
//   cover   迷你幻灯片封面（纯 CSS/SVG 画的，缩放不糊，不占包体）→ 点一下给出主题
//   prompt  一句能直接用的需求 → 点一下给出主题
//   quote   演讲心法 → 叠加到已有的那句话后面
//   palette 配色 + 字体 → 叠加到已有的那句话后面
// 文案都是 {zh, en}；封面画面里只放和语言无关的短词和数字。
import React from 'react'

export const WALL = [
  { id: 'c-brand', kind: 'cover', art: 'brand', title: { zh: '品牌开场：一页只放名字', en: 'Brand opener: just the name' }, tag: { zh: '开场 · 1 页', en: 'Opener · 1 page' }, prompt: { zh: '做一份 6 页的工作台介绍：开场一页只放名字和一句口号，主色用暖橙，之后每页一个卖点，配讲稿。', en: 'A 6-page workbench intro: the opener shows only the name and a tagline in warm orange, then one selling point per page, with speaker notes.' } },
  { id: 'p-weekly', kind: 'prompt', rel: { zh: '周报', en: 'Weekly' }, title: { zh: '把 30 页的周报压成 5 页', en: 'Squeeze a 30-page report into 5' }, body: { zh: '只留结论和三张图，其余放进讲稿。', en: 'Keep the conclusions and three charts; the rest goes into the notes.' }, prompt: { zh: '把这周的工作汇报做成 5 页：第一页结论，中间三页各配一张图，最后一页下周计划；细节全部放进讲稿。', en: 'Turn this week’s report into 5 pages: conclusion first, three pages with one chart each, next week’s plan last; details go into speaker notes.' } },
  { id: 'c-kpi', kind: 'cover', art: 'kpi', title: { zh: '季度复盘：一个大数字开场', en: 'Quarterly review: open with one number' }, tag: { zh: '复盘 · 6 页', en: 'Review · 6 pages' }, prompt: { zh: '做一份季度复盘：开场一个大数字（活跃用户 +38%），然后讲增长来源、问题和下季度计划，6 页，蓝色系，带讲稿。', en: 'A quarterly review: open with one big number (active users +38%), then growth drivers, problems and next quarter’s plan. 6 pages, blue palette, speaker notes.' } },
  { id: 'q-one', kind: 'quote', title: { zh: '一页只讲一件事。', en: 'One idea per slide.' }, prompt: { zh: '每页只讲一件事', en: 'one idea per slide' } },
  { id: 'c-swiss', kind: 'cover', art: 'swiss', title: { zh: '产品发布：瑞士风网格', en: 'Product launch: Swiss grid' }, tag: { zh: '发布会 · 8 页', en: 'Launch · 8 pages' }, prompt: { zh: '做一份产品发布演示：瑞士国际主义风格，米白底、红色圆形做记忆点、粗黑无衬线大标题，8 页，克制、留白多。', en: 'A product launch deck in Swiss international style: off-white, a red circle as the motif, bold sans-serif headlines, 8 pages, restrained with lots of whitespace.' } },
  { id: 'pl-fog', kind: 'palette', colors: ['#dfe7ef', '#9fb3c8', '#52667a', '#f6f1e7'], title: { zh: '雾蓝 · 象牙白', en: 'Fog blue · ivory' }, font: { zh: '宋体标题 + 无衬线正文', en: 'Serif titles + sans body' }, prompt: { zh: '配色用雾蓝和象牙白，标题用宋体、正文用无衬线', en: 'use fog blue and ivory, serif titles with a sans-serif body' } },
  { id: 'c-editorial', kind: 'cover', art: 'editorial', title: { zh: '年度报告：杂志式排版', en: 'Annual report: magazine layout' }, tag: { zh: '报告 · 12 页', en: 'Report · 12 pages' }, prompt: { zh: '把年度报告做成杂志风格：衬线大标题、细分隔线、三栏正文、大量留白，12 页，每章一个跨页标题。', en: 'Make the annual report look like a magazine: serif headlines, hairline rules, three-column text, generous whitespace. 12 pages, a spread title per chapter.' } },
  { id: 'p-onboard', kind: 'prompt', rel: { zh: '入职', en: 'Onboarding' }, title: { zh: '新同学的第一周指南', en: 'A first-week guide for new teammates' }, body: { zh: '谁是谁、去哪找、第一件事做什么。', en: 'Who’s who, where things live, what to do first.' }, prompt: { zh: '给新同学做一份入职第一周指南：团队里谁负责什么、常用的地方去哪找、第一周要完成的三件事，8 页，轻松友好。', en: 'A first-week onboarding guide: who owns what, where to find things, three things to finish in week one. 8 pages, friendly tone.' } },
  { id: 'c-gradient', kind: 'cover', art: 'gradient', title: { zh: '主题演讲：极光渐变', en: 'Keynote: aurora gradient' }, tag: { zh: '演讲 · 10 页', en: 'Keynote · 10 pages' }, prompt: { zh: '做一份主题演讲：柔和的极光渐变背景（粉、紫、浅蓝），白色大字居中，每页一句话，10 页，适合大屏。', en: 'A keynote with soft aurora gradients (pink, violet, light blue), large centered white type, one sentence per page, 10 pages, big-screen friendly.' } },
  { id: 'q-conclusion', kind: 'quote', title: { zh: '先说结论，再给证据。', en: 'Conclusion first, evidence after.' }, prompt: { zh: '先说结论再给证据', en: 'state the conclusion before the evidence' } },
  { id: 'c-chart', kind: 'cover', art: 'chart', title: { zh: '数据洞察：每页一张图', en: 'Data story: one chart per page' }, tag: { zh: '分析 · 7 页', en: 'Analysis · 7 pages' }, prompt: { zh: '做一份数据洞察演示：每页一张图表加一句结论标题，柱状、折线、占比各用一次，7 页，干净的白底。', en: 'A data story: one chart per page with a one-line conclusion as the title; use a bar, a line and a share chart. 7 pages, clean white background.' } },
  { id: 'p-pitch', kind: 'prompt', rel: { zh: '电梯演讲', en: 'Pitch' }, title: { zh: '3 分钟电梯演讲', en: 'A 3-minute elevator pitch' }, body: { zh: '每页一句话，讲完就能拿到下一次会。', en: 'One line per page, enough to earn the next meeting.' }, prompt: { zh: '做一份 3 分钟的电梯演讲：问题、方案、为什么是我们、想要什么，每页一句话，6 页，大字。', en: 'A 3-minute elevator pitch: problem, solution, why us, the ask. One line per page, 6 pages, large type.' } },
  { id: 'c-timeline', kind: 'cover', art: 'timeline', title: { zh: '路线图：一条时间线讲完', en: 'Roadmap: one timeline' }, tag: { zh: '规划 · 5 页', en: 'Planning · 5 pages' }, prompt: { zh: '做一份明年的产品路线图：一页总览时间线（四个季度），之后每个季度一页讲目标和里程碑，5 页，薄荷绿。', en: 'Next year’s product roadmap: one overview timeline across four quarters, then one page per quarter with goals and milestones. 5 pages, mint green.' } },
  { id: 'pl-terra', kind: 'palette', colors: ['#c8553d', '#f28f3b', '#ffd5c2', '#588b8b'], title: { zh: '赤陶 · 杏 · 青灰', en: 'Terracotta · apricot · teal' }, font: { zh: '粗黑标题，温暖有力', en: 'Heavy sans titles, warm' }, prompt: { zh: '配色用赤陶、杏色和青灰，标题用粗黑体', en: 'use terracotta, apricot and teal with heavy sans-serif titles' } },
  { id: 'c-riso', kind: 'cover', art: 'riso', title: { zh: '设计分享：孔版印刷感', en: 'Design talk: risograph' }, tag: { zh: '分享 · 9 页', en: 'Talk · 9 pages' }, prompt: { zh: '做一份设计分享：孔版印刷（Riso）风格，黄粉蓝三色叠印的圆形、轻微错位，米色纸张底，9 页，活泼。', en: 'A design talk in risograph style: overprinted yellow, pink and blue circles slightly misregistered on cream paper. 9 pages, playful.' } },
  { id: 'q-blank', kind: 'quote', title: { zh: '留白，是给观众喘气。', en: 'Whitespace lets the room breathe.' }, prompt: { zh: '多留白、每页元素不超过三个', en: 'generous whitespace, no more than three elements per page' } },
  { id: 'c-code', kind: 'cover', art: 'code', title: { zh: '技术分享：代码当主角', en: 'Tech talk: code on stage' }, tag: { zh: '技术 · 10 页', en: 'Tech · 10 pages' }, prompt: { zh: '做一份技术分享：讲我们这次架构迁移，浅色代码块配高亮、前后对比和一张架构图，10 页，带讲稿。', en: 'A tech talk about our architecture migration: light code blocks with highlighting, before/after comparisons and an architecture diagram. 10 pages, speaker notes.' } },
  { id: 'p-paper', kind: 'prompt', rel: { zh: '组会', en: 'Lab meeting' }, title: { zh: '把一篇论文讲成组会汇报', en: 'Present a paper at lab meeting' }, body: { zh: '动机、方法、实验、局限，各一页。', en: 'Motivation, method, results, limits — a page each.' }, prompt: { zh: '把一篇论文做成组会汇报：研究动机、方法、关键实验、局限和我的想法，8 页，学术风，图表清楚。', en: 'Turn a paper into a lab-meeting talk: motivation, method, key experiments, limitations and my take. 8 pages, academic style, clear figures.' } },
  { id: 'c-mountain', kind: 'cover', art: 'mountain', title: { zh: '团队年会：层叠山景', en: 'Team offsite: layered hills' }, tag: { zh: '年会 · 8 页', en: 'Offsite · 8 pages' }, prompt: { zh: '做一份团队年会演示：层叠的山峦插画做背景，回顾这一年的高光时刻和明年的方向，8 页，温暖、有仪式感。', en: 'A team offsite deck with layered hill illustrations: this year’s highlights and next year’s direction. 8 pages, warm and celebratory.' } },
  { id: 'c-quote', kind: 'cover', art: 'quoteSlide', title: { zh: '演讲开场：一句引言', en: 'Talk opener: a single quote' }, tag: { zh: '演讲 · 6 页', en: 'Talk · 6 pages' }, prompt: { zh: '做一份以一句引言开场的演讲：赤陶色底、白色衬线大字，之后五页展开这句话背后的三个观点，6 页。', en: 'A talk that opens with a single quote: terracotta background, large white serif type, then five pages unpacking three ideas behind it.' } },
  { id: 'pl-mint', kind: 'palette', colors: ['#e9f6ef', '#9ad1b5', '#2fa36c', '#1e4d3a'], title: { zh: '薄荷 · 森林绿', en: 'Mint · forest green' }, font: { zh: '圆体，清爽亲和', en: 'Rounded sans, fresh' }, prompt: { zh: '配色用薄荷绿和森林绿，字体圆润一些', en: 'use mint and forest green with a rounded sans-serif' } },
  { id: 'c-mood', kind: 'cover', art: 'mood', title: { zh: '品牌提案：情绪板', en: 'Brand pitch: moodboard' }, tag: { zh: '提案 · 7 页', en: 'Pitch · 7 pages' }, prompt: { zh: '做一份品牌提案：先用一页情绪板（色块拼贴）定调，再讲品牌关键词、视觉方向和应用示例，7 页，自然色系。', en: 'A brand pitch: a moodboard page of color blocks sets the tone, then brand keywords, visual direction and applications. 7 pages, earthy palette.' } },
  { id: 'q-compare', kind: 'quote', title: { zh: '数字要有对比，才有意义。', en: 'A number means nothing without a comparison.' }, prompt: { zh: '每个数字都给出对比（同比、目标或竞品）', en: 'every number comes with a comparison (year over year, target or competitor)' } },
  { id: 'c-funnel', kind: 'cover', art: 'funnel', title: { zh: '增长复盘：漏斗拆解', en: 'Growth review: the funnel' }, tag: { zh: '增长 · 6 页', en: 'Growth · 6 pages' }, prompt: { zh: '做一份增长复盘：一页漏斗总览（曝光→点击→注册→付费），每一层一页讲转化率和优化动作，6 页，淡紫色。', en: 'A growth review: one funnel overview (impressions → clicks → sign-ups → paid), then one page per stage on conversion and actions. 6 pages, lavender.' } },
  { id: 'p-compete', kind: 'prompt', rel: { zh: '竞品', en: 'Competitors' }, title: { zh: '三家竞品，一张矩阵', en: 'Three competitors, one matrix' }, body: { zh: '矩阵定位置，最后一页说我们怎么赢。', en: 'A matrix to place them, a last page on how we win.' }, prompt: { zh: '做一份竞品分析：三家竞品各一页，一张二维定位矩阵，最后一页讲我们的差异化和打法，6 页。', en: 'A competitor analysis: one page per competitor, a 2×2 positioning matrix, and a closing page on our edge and plan. 6 pages.' } },
  { id: 'c-compare', kind: 'cover', art: 'compare', title: { zh: '方案评审：前后对比', en: 'Proposal review: before / after' }, tag: { zh: '评审 · 5 页', en: 'Review · 5 pages' }, prompt: { zh: '做一份方案评审：现状和新方案左右对比，讲清收益、成本和风险，最后给出建议，5 页，橙灰配色。', en: 'A proposal review: current state vs. the new plan side by side, benefits, costs and risks, and a recommendation. 5 pages, orange and gray.' } },
  { id: 'pl-dusk', kind: 'palette', colors: ['#ffb4a2', '#c3aed6', '#9bd3f7', '#fff6f0'], title: { zh: '黄昏粉 · 薰衣草', en: 'Dusk pink · lavender' }, font: { zh: '细体大字，轻盈', en: 'Light display type, airy' }, prompt: { zh: '配色用黄昏粉、薰衣草紫和天蓝的渐变，大字用细体', en: 'use a dusk-pink, lavender and sky-blue gradient with light display type' } },
  { id: 'p-story', kind: 'prompt', rel: { zh: '故事', en: 'Story' }, title: { zh: '用一个用户故事讲完需求', en: 'Tell the spec as one user’s story' }, body: { zh: '她遇到什么、试了什么、我们怎么帮她。', en: 'What she hit, what she tried, how we help.' }, prompt: { zh: '用一个用户故事讲产品需求：人物、遇到的问题、试过的办法、我们的方案、上线后的变化，7 页，插画感。', en: 'Tell a product spec as one user’s story: the person, the problem, what they tried, our solution and what changes after launch. 7 pages, illustrated feel.' } },
]

export const KINDS = ['cover', 'prompt', 'quote', 'palette']

/** 迷你幻灯片：16:9，文字用 cqw 跟着卡片宽度缩放。 */
export function Art({ name }) {
  const Comp = ARTS[name]
  return <div className={`sw-art sw-art-${name}`}>{Comp ? <Comp /> : null}</div>
}

const lines = (n, cls = 'sw-art-line') => Array.from({ length: n }, (_, i) => <i key={i} className={cls} style={{ width: `${88 - ((i * 23) % 40)}%` }} />)

const ARTS = {
  brand: () => (
    <>
      <span className="sw-art-kicker">DSH</span>
      <b className="sw-art-big">Slides</b>
      <span className="sw-art-sub">one sentence → a deck</span>
    </>
  ),
  kpi: () => (
    <>
      <span className="sw-art-kicker">Q3 · ACTIVE USERS</span>
      <b className="sw-art-big">+38%</b>
      <div className="sw-art-bars">{[38, 46, 41, 58, 64, 72, 88].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
    </>
  ),
  swiss: () => (
    <>
      <i className="sw-art-disc" />
      <span className="sw-art-kicker">LAUNCH — 2026</span>
      <b className="sw-art-big">NEW<br />TOOLS</b>
      <i className="sw-art-rule" />
    </>
  ),
  editorial: () => (
    <>
      <span className="sw-art-kicker">ANNUAL REPORT · Nº 07</span>
      <b className="sw-art-big">The Quiet<br />Revolution</b>
      <i className="sw-art-rule" />
      <div className="sw-art-cols">{[0, 1, 2].map(c => <div key={c}>{lines(4)}</div>)}</div>
    </>
  ),
  gradient: () => (
    <>
      <b className="sw-art-big">Hello, future.</b>
      <span className="sw-art-sub">keynote · 2026</span>
    </>
  ),
  chart: () => (
    <>
      <span className="sw-art-kicker">WHERE GROWTH COMES FROM</span>
      <div className="sw-art-plot">{[[42, 0], [64, 1], [36, 2], [78, 0], [52, 3], [90, 1]].map(([h, c], i) => <i key={i} className={`c${c}`} style={{ height: `${h}%` }} />)}</div>
    </>
  ),
  timeline: () => (
    <>
      <span className="sw-art-kicker">ROADMAP</span>
      <b className="sw-art-big">2027</b>
      <div className="sw-art-track">{['Q1', 'Q2', 'Q3', 'Q4'].map(q => <span key={q}><i />{q}</span>)}</div>
    </>
  ),
  riso: () => (
    <>
      <i className="sw-art-dot y" /><i className="sw-art-dot p" /><i className="sw-art-dot b" />
      <b className="sw-art-big">DESIGN<br />WEEK</b>
    </>
  ),
  code: () => (
    <>
      <div className="sw-art-win"><i /><i /><i /></div>
      <div className="sw-art-lines">
        {[[['k', 12], ['f', 22], ['p', 30]], [['s', 8], ['v', 18], ['o', 36]], [['s', 8], ['k', 10], ['f', 28]], [['s', 16], ['v', 24], ['p', 20]], [['k', 14], ['o', 18]], [['s', 8], ['f', 34]]].map((row, r) => (
          <div key={r}>{row.map(([c, w], i) => <i key={i} className={c} style={{ width: `${w}%` }} />)}</div>
        ))}
      </div>
    </>
  ),
  mountain: () => (
    <svg viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9b8" /><stop offset="1" stopColor="#fff3e6" /></linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#sw-sky)" />
      <circle cx="118" cy="30" r="11" fill="#ffb37a" />
      <path d="M0 58 L22 40 L40 52 L62 30 L86 50 L104 38 L128 54 L160 36 V90 H0Z" fill="#9cc5c0" />
      <path d="M0 68 L26 54 L48 64 L74 48 L100 64 L124 52 L160 62 V90 H0Z" fill="#5f9e9a" />
      <path d="M0 80 L30 68 L58 78 L88 66 L118 78 L160 70 V90 H0Z" fill="#2f6f73" />
    </svg>
  ),
  quoteSlide: () => (
    <>
      <i className="sw-art-mark">“</i>
      <b className="sw-art-big">Less,<br />but better.</b>
    </>
  ),
  mood: () => (
    <>
      <i style={{ background: '#e9c9a6' }} /><i style={{ background: '#a3b18a' }} /><i style={{ background: '#588157' }} /><i style={{ background: '#dad7cd' }} /><i style={{ background: '#c97c5d' }} />
      <span className="sw-art-chip">MOOD</span>
    </>
  ),
  funnel: () => (
    <>
      <span className="sw-art-kicker">FUNNEL</span>
      <div className="sw-art-steps">{[[100, '120k'], [74, '38k'], [50, '9.6k'], [30, '2.1k']].map(([w, n]) => <i key={n} style={{ width: `${w}%` }}><span>{n}</span></i>)}</div>
    </>
  ),
  compare: () => (
    <>
      <div className="sw-art-side is-before"><span>BEFORE</span>{lines(3)}</div>
      <i className="sw-art-arrow">→</i>
      <div className="sw-art-side is-after"><span>AFTER</span>{lines(3)}</div>
    </>
  ),
}
