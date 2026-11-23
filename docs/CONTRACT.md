# dsh-slides-workbench — 内部契约（实现前先读）

DSH（DeepSeek Harness 0.2.2-rc.1）插件，Host + 浏览器两半片。把 [open-slide](https://open-slide.dev/docs)
的演示文稿能力搬进 DSH：**AI 写 `slides/<id>/index.tsx`，侧栏工作台里实时预览、演示、导出**。

open-slide 是一个给 agent 用的 slide 框架：每个 deck 是 `slides/<kebab-id>/index.tsx`，默认导出
一个 React 组件数组（每页一个 1920×1080 页面），跑在 Vite dev server 里，自带编辑器 / inspector /
present 模式 / HTML·PDF·PPTX 导出。我们**不重写渲染**，而是：

- Host 在 `$DSH_HOME/slides-workbench` 维护一个真正的 open-slide 工作区（`npm install` 装
  `@open-slide/core`），按需起 `open-slide dev`；
- 浏览器侧工作台把 dev server 的页面用 iframe 嵌进 DSH 面板（干净预览路由 / 完整编辑器路由），
  自己只做 deck 列表、页面导航、演示、导出这些外框；
- 插件带一个 `slides-workbench` agent preset（open-slide 技能 + 工作区规则），工作台里的对话会话用它建 deck、写页面、加讲稿。

## 目录与文件归属

| 文件 | 归属 | 说明 |
| --- | --- | --- |
| `package.json` `cordis.patch.yml` `scripts/build.mjs` | Lead（已写） | 打包与安装 |
| `locale/*.json` `icon.svg` `README.md` `template/**` | Lead | 显示元数据、工作区模板 |
| `src/host.js` `src/workspace.js` `src/decks.js` `src/preview.js` `src/env.js` | Lead | HTTP 路由、工作区、deck 解析、dev server 守护 |
| `cordis.patch.yml` 里的 preset、`skills/**`、`template/AGENTS.md` | **teammate: tools-skills** | agent preset、skill 与工作区规则 |
| `client/index.jsx` `client/*.jsx` `client/*.js` `client/styles.css` | **teammate: client-ui** | 面板 UI |
| `dist/client.js` | 构建产物 | `npm run build` |

**不要**修改别人的文件；需要接口变更时先告诉 Lead。

## 硬约束（会决定是否上线）

- 纯 JavaScript（ESM），无 TypeScript 编译步骤；不要 `import` 任何 `@deepseek-ai/*` 包，
  不读其他插件的 DOM/源码，不新增依赖（client 侧构建期依赖只有 esbuild，React 由宿主提供）。
- Host 侧只用 Node 内置模块（`node:fs`、`node:child_process` 等）。
- 所有可见文案走 client 侧 i18n（zh 默认 / en 兜底），不要硬编码中文到组件里。
- 样式只用 DSH 主题 token（`--dsw-alias-*`，可先用 `cordis_inspect_query` 的 `Theme.listTokens`
  确认名字），字面色仅用于装饰性图形。所有 class 用 `sw-` 前缀。
- client 入口必须 `export const inject = ['slots']` + `export function apply(ctx)`，用
  `ctx.slots.inject(() => ctx.slots.register(...))` 注册，禁止写 `document.body`。
- 面板 key/id 统一 `slides-workbench`。

## Host HTTP API（client 只能通过它拿数据）

所有请求同源、前缀 `/slides-workbench`。GET 读、POST 写（JSON body）。

`GET /slides-workbench/state` →
```json
{
  "workspace": { "path": "/Users/x/.dsh/slides-workbench", "scaffolded": true, "installed": true,
                 "install": { "status": "idle|running|done|error", "log": ["..."], "error": null } },
  "server": { "status": "stopped|starting|running|error", "url": "http://localhost:5174",
              "port": 5174, "error": null, "log": ["last 40 lines"] },
  "decks": [ { "id": "q2-launch", "title": "Q2 launch", "pages": 6, "notesCount": 6,
               "theme": null, "createdAt": 1770000000000, "updatedAt": 1770000000000,
               "bytes": 12345, "assets": 2, "error": null } ],
  "version": "0.2.3.2"
}
```

- `POST /slides-workbench/setup` `{}` → 立即返回同 state；`workspace.install.status` 会从 `running`
  走到 `done`，client 轮询 `/state`。既负责人工触发，也可在首次打开时自动调一次。
- `POST /slides-workbench/server` `{ "action": "start" | "stop" }` → state
- `POST /slides-workbench/deck/create` `{ "title": "Q2 launch", "id": "q2-launch"? }` → `{ "deck": … }`
- `POST /slides-workbench/deck/delete` `{ "id": "q2-launch" }` → `{ "ok": true }`
- `GET /slides-workbench/deck/source?id=q2-launch` → `{ "id": "q2-launch", "source": "…" }`
- `POST /slides-workbench/build` `{}` → `{ "ok": true, "outDir": "…/dist", "log": ["…"] }`
- 401/403：鉴权不过时返回 `{"error": "未授权"}`，body 里不要放敏感路径。

iframe 地址（client 自己拼，不要经过 Host 代理）：
- 单页干净预览：`${server.url}/s/${deckId}/preview?p=${pageNo}`（`p` 从 1 开始；dev-only 路由）
- 完整编辑器：`${server.url}/s/${deckId}?p=${pageNo}`
- 首页（deck 浏览）：`${server.url}/`
- 注意 dev server 只监听 `localhost`（IPv6 `::1`），**必须用 `http://localhost:<port>`，不能用 127.0.0.1**。

## Host 模块 API（tools 侧可用）

`src/workspace.js`
```js
export class Workspace {
  constructor(root)               // root 默认 resolveWorkspaceRoot(config)
  get root(); get slidesDir(); get themesDir(); get distDir(); get binPath()
  async status()                  // { path, scaffolded, installed, version }
  async scaffold()                // 写模板文件（幂等），返回 { created: [相对路径] }
  async ensureInstalled()         // 需要时装依赖；返回 status
  install(onLog)                  // 后台装依赖，this.install = { status, log, error }
  async build()                   // open-slide build → { ok, outDir, log }
}
```

`src/decks.js`
```js
export class Decks {
  constructor(workspace)
  async list()                    // Deck[]（无 index.tsx 的目录跳过；解析失败带 error 字段）
  async get(id)                   // Deck + { source }；不存在抛 status 404 的 Error
  async create(title, id?)        // 新建目录 + index.tsx 起始页，返回 Deck
  async write(id, source)         // 校验后落盘，返回 { deck, warnings: string[] }
  async remove(id)                // 移到 <workspace>/.trash/<id>-<ts>，返回 { ok }
  isValidId(id)                   // /^[a-z0-9]+(?:-[a-z0-9]+)*$/
}
```

`src/preview.js`
```js
export class DevServer {
  constructor(workspace)
  status()                        // { status, url, port, error, log: string[] }
  async start()                   // 幂等；端口被占时自增寻找
  async stop()
}
```

## 浏览器侧（client）—— 已按最终产品决定收敛

**面板不自己画 deck UI，把 open-slide 的页面铺满；首页那列 open-slide 自带左侧导航要隐藏。**

- 三种过渡态：安装中（进度 + 日志，自动开始）/ dev server 启动中或失败（日志 + 重试）/
  就绪后 `<iframe src="/slides-workbench/app/?v=<startedAt>">` 铺满。
- 同源 URL 是前提：Host 把 dev server 反代在 `/slides-workbench/app/`（HTTP）、
  `/slides-workbench/app/` 与 `/slides-workbench/app`（HMR WebSocket）、以及 open-slide 客户端
  直接打根路径的 `/__*` 接口（`/__agent`、`/__folders`、`/__edit`、`/__notes`、`/__comments`、
  `/__server-status`、`/__restart-server`、`/__update-check`、`/__update-package`）上。
- iframe `onLoad` 时往 `contentDocument` 注入 `client/embed.js` 里的样式（首页外壳的导航列、
  内容区那层 `md:rounded-[10px]` 大圆角卡片一起去掉）：
  `div.h-dvh > div.hidden.md\:block:has(> aside.group\/side) { display: none !important; }`
  —— 只命中首页外壳那一列导航；deck 编辑器（`/s/<id>`）的 PAGES 缩略图列是另一套结构，必须保留。
- 右下角两个低透明度小按钮：重新加载 iframe、在浏览器里打开（用真实
  `http://localhost:<port>/slides-workbench/app/`，不经反代）。
- 外观同步（`client/appearance.js`）：DSH 用 `body[data-ds-dark-theme]` 表示暗色，
  iframe `onLoad` 和该属性变化时把 `html.dark` + `color-scheme` 写进 open-slide
  （next-themes 的 class 模式，实测背景 `oklch(0.99)` ↔ `oklch(0.175)`）；
  语言用同源共享的 localStorage `open-slide:locale`（`zh-CN` / `en`），写进去后 reload 一次
  让 open-slide 的 locale-store 重新初始化（DSH 语言变化时同样处理）。
- 文件：`client/index.jsx`（注册/分发）、`client/app.jsx`（iframe 外壳）、`client/embed.js`
  （同源路径常量 + 样式注入）、`client/setup.jsx`、`client/api.js`、`client/ui.jsx`、
  `client/i18n.js`、`client/styles.css`。侧栏只有一行 `slides-workbench`（order 6）。

## Host 自动引导（不需要手动初始化）

`apply()` 里调用 `bootstrap()`：`scaffold()` / `ensureConfig()` → 缺依赖就 `installDeps()`，
全在后台跑，面板轮询 `/state` 看 `workspace.install`。deck 增删后（接口或模型直接写文件）Host 会 `dev.restart()`
让 dev server 重新扫 `slides/`（open-slide 的清单是启动时生成的）。

`open-slide.config.ts` 由工作台维护（`ensureConfig()` 会按模板覆盖），里面把 `base` 指到
`/slides-workbench/app/`；`workspace.build()` 构建期间临时换成 `/`，结束后恢复，
保证 `dist/` 能部署在静态托管根路径。

## Agent 侧：`slides-workbench` agent preset

插件**不注册**任何全局工具、skill 或 system prompt。模型侧能力全部在 `cordis.patch.yml` 声明的
`slides-workbench` agent preset 里（`@deepseek-ai/dsh-agent-preset`），只有用这个 preset 的会话能看到：

- preset 是 DSH standard preset 的整份拷贝（preset 没有继承，DSH 升级时对照
  `dsh-web-app/presets/standard.patch.yml` 同步），只多一处：`dsh-skill-filesystem` 的 `customSkillDirs`
  加上本包的 `skills/`（open-slide 官方 5 个技能，原文几乎不改，见 `skills/README.md`）。
- 会话 cwd 就是 open-slide 工作区，模型用 standard 的文件工具直接读写 `slides/<id>/index.tsx`、
  `themes/`、`node_modules/.open-slide/current.json`。
- 工作区规则在工作区的 `AGENTS.md`（`template/AGENTS.md`），由 `dsh-agent-instructions` 读入。
  老工作台写的、还在提 `slides_*` 工具的 AGENTS.md 由 `workspace.ensureAgents()` 换成模板版本。
- 客户端建对话会话时传 `agentPreset: 'slides-workbench'`（`client/session.js` 的 `AGENT_PRESET`）；
  记下的会话跑的不是这个 preset（列表项 `projectionValues.agentPreset`）就换一段新的。
- 模型直接建 / 删 `slides/<id>/` 不经过接口，Host 每 1.5s 看一次 `slides/` 下带 `index.tsx` 的目录集合，
  变了就清 deck 缓存并让 dev server 重扫（接口里的建 / 删走同一个 `syncSlides()`，只重启一次）。

另有 `POST /slides-workbench/themes/sync`（内置官方模板合并进工作区）和 `POST /slides-workbench/reveal`
（在系统文件管理器里打开工作区）。

## 构建与验证

```bash
npm install                 # 只为装 esbuild
npm run build               # → dist/client.js
node -e "import('./src/host.js').then(m=>console.log(Object.keys(m)))"   # host 语法自检
node --test test/*.test.js  # 有测试就跑
```
安装/验证由 Lead 通过 `plugin_manager install_bundle` 完成，不要自己跑 pnpm/install_bundle。
## Agent 面板 = DSH 原生对话流（open-slide 的外壳，DSH 的内容）

早期版本把 open-slide 的 `/__agent/*` 整段接管、翻译成 DSH 会话（`src/agent-bridge.js`），已删除。
现在 open-slide 编辑器里的 Agent 面板外壳照旧（工具栏按钮 `[data-agent-ui]`、快捷键 A、停靠栏 `[data-agent-dock]` 的开合与拖宽），
面板内容换成 DSH 原生对话：

- **渲染**：照 DSH 子代理侧栏对话（`dsh-client-ui-subagent` 的 `sidebar-chat`）。`main` slot 的面板 entry 声明会话作用域子 slot
  `children: { 'slides.chat.conversation': { kind: 'single', scope: 'session' } }`，拿到 `renderSlot` 与 `SessionProvider`；
  `<SessionProvider session={reference}>{renderSlot('slides.chat.conversation')}</SessionProvider>`；这个子 slot 的 entry
  （`client/chat.jsx` 的 `ChatConversation`）渲染 DSH 的可复用对话工厂
  `renderFactorySlot('conversation.content', { variant: 'embedded', phase, hero }, { slots: { views } })`，视图固定在 Chat。
- **位置**：DSH 的组件、样式、弹层都在外层文档，不能塞进 iframe（会和 open-slide 的页面样式互相污染、弹层定位错乱），
  所以对话渲染在外层，精确盖在 iframe 里 `[data-agent-dock] > .sidebar-swap` 的可见区域上（让出左侧 6px 拖宽条），
  MutationObserver / ResizeObserver / 开合动画逐帧测量跟随；open-slide 原来的面板内容 `visibility: hidden`。
  面板开着时编辑器右边缘那列小按钮让到面板左边。
- **不用 hero**：`conversation.content` 一律按 `phase: 'active', hero: false` 渲染（历史加载中为 `settling`），空白会话也是消息区 + 贴底输入框。
- **主题**：测量停靠栏时一并读 iframe `html` 上 open-slide 的 shadcn 变量（`--sidebar`/`--background`/`--muted`/`--border`/`--primary`…，
  `--sidebar` 取停靠栏实际背景色），在 `.sw-chat` 上覆盖 DSH 的语义 token（`--dsw-alias-bg-base`、`--dsw-specific-input-major`、
  `--dsw-specific-bubble`、`--dsw-alias-button-info-fill`、`--dsw-alias-label-*`、`--dsw-alias-border-l*` 等，见 `dshTokens()`），
  只作用于这棵子树；html 的 class 变化（明暗）会触发重读。
- **尺寸**：`.sw-chat` 上覆盖 `--dsh-content-font-size`（12.5px）及其派生的 delta / secondary（DSH 在 body 上已算好，必须一起覆盖）、
  `--dsw-radius-*`（8px / 5px 体系）；消息区与输入框边距用后代选择器覆盖 `_embeddedBody` 上的 `--dsh-chat-content-width` /
  `--dsh-composer-side-clearance` / `--dsh-composer-card-max-width`，去掉 `_scrollBody` 的滚动条槽位；轮间距 12px、用户消息 88% 宽。
- **默认宽度**：第一次进编辑器前把 `open-slide:agent-panel-width` 设成 Format / Design 的宽度（`open-slide:editor-panel-width`，默认 320），
  用 `slides-workbench.agent-width-seeded` 标记只做一次。
- **会话**（`client/session.js`）：每个 deck 一段会话，deck → 会话 id 存在 localStorage。`ctx.workspaces.create({ path })`
  把工作区登记成 Workspace（幂等；只有 cwd 的会话输入框会要求先选 Workspace），`ctx.sessions.create({ workspaceId })` 建会话并
  `rename(deck 标题)`；首页提交时 `using(...).ready` → `session.prompt([{ type: 'text', text }], 'queue')`，并预先写
  `localStorage['open-slide:agent-dock'] = '1'` 让编辑器打开时面板开着；渲染期间 `ctx.sessions.retain(id, { source: 'slidesChat' })`。
- 缺 `sessions` / `workspaces` 服务时面板里只显示一句说明。open-slide 自带 agent 后端：`open-slide.config.ts` 里 `agent: { enabled: false }`
  （只影响 `/__agent/status` 的 enabled，按钮和停靠栏照常渲染），`/__agent` 原样转发给 dev server。
