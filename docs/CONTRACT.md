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
- Host 注册 agent tools + skill，让模型能在 DSH 会话里建 deck、写页面、加讲稿、构建导出。

## 目录与文件归属

| 文件 | 归属 | 说明 |
| --- | --- | --- |
| `package.json` `cordis.patch.yml` `scripts/build.mjs` | Lead（已写） | 打包与安装 |
| `locale/*.json` `icon.svg` `README.md` `template/**` | Lead | 显示元数据、工作区模板 |
| `src/host.js` `src/workspace.js` `src/decks.js` `src/preview.js` `src/env.js` | Lead | HTTP 路由、工作区、deck 解析、dev server 守护 |
| `src/tools.js` `src/skills.js` `skills/*.md` | **teammate: tools-skills** | agent 工具与 skill |
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
全在后台跑，面板轮询 `/state` 看 `workspace.install`。deck 增删后 Host 会 `dev.restart()`
让 dev server 重新扫 `slides/`（open-slide 的清单是启动时生成的）。

`open-slide.config.ts` 由工作台维护（`ensureConfig()` 会按模板覆盖），里面把 `base` 指到
`/slides-workbench/app/`；`workspace.build()` 构建期间临时换成 `/`，结束后恢复，
保证 `dist/` 能部署在静态托管根路径。

## Agent 工具与 skill（tools-skills）要求

`src/skills.js`：`export function registerSkills(ctx)`，用 `ctx.get('skills')?.register({...})`
注册两个 skill（optional service，缺失时安静跳过）：

- `slides-authoring`（技术参考，必读）—— 从 `skills/slides-authoring.md` 读正文：1920×1080 画布、
  file contract（`export default [...]`、`meta`、`notes`）、常用布局与类型尺度、`Steps/Step`、
  `MorphElement`、transition、assets、webfonts、反模式、自检清单。
- `slides-create-deck`（工作流）—— 从 `skills/slides-create-deck.md`：先问 2–4 个关键问题（主题、
  受众、页数、视觉方向）→ 定 id → `slides_create_deck` → 用 `slides_write_deck` 一次写完整文件 →
  自检 → 告诉用户可以 `slides_present`。

`src/tools.js`：`export function registerTools(ctx, { workspace, decks, dev })`，注册（全部带
`output.schema` 与 `output.render`，返回纯文本；`parameters` 是 JSON Schema 对象）：

| 工具 | 参数 | 行为 |
| --- | --- | --- |
| `slides_status` | `{}` | 工作区路径、依赖是否装好、dev server URL、deck 列表摘要 |
| `slides_list` | `{ "full"?: boolean }` | deck 列表（id/title/pages/updatedAt） |
| `slides_read_deck` | `{ "id": string }` | 返回 `index.tsx` 全文 |
| `slides_create_deck` | `{ "title": string, "id"?: string }` | 建 deck，返回 id 与文件路径 |
| `slides_write_deck` | `{ "id": string, "source": string }` | 覆盖写，返回页数/校验告警 |
| `slides_delete_deck` | `{ "id": string }` | 删除（移到 .trash） |
| `slides_present` | `{ "id"?: string }` | 确保 dev server 在跑，返回预览 URL 与面板提示 |
| `slides_build` | `{}` | 构建静态站，返回 dist 路径 |

另注册一段 system prompt（`ctx.get('systemPrompt')?.section({ name:'plugin:slides-workbench',
order: 0 … })`，order 用 `getSectionOrder` 拿不到就写 `500`）：工作区在哪、deck 是 open-slide 的
`slides/<id>/index.tsx`、写页面前先看 `slides-authoring` skill、不要碰 `package.json`。

## 构建与验证

```bash
npm install                 # 只为装 esbuild
npm run build               # → dist/client.js
node -e "import('./src/host.js').then(m=>console.log(Object.keys(m)))"   # host 语法自检
node --test test/*.test.js  # 有测试就跑
```
安装/验证由 Lead 通过 `plugin_manager install_bundle` 完成，不要自己跑 pnpm/install_bundle。
## Agent 桥（编辑器里的 Agent 面板 = DSH）

open-slide 的 provider 是硬编码的 claude/codex（走各自 CLI），没有自定义入口。插件因此把
`/__agent/*` 在反代层整段接管（`src/agent-bridge.js`），协议按 open-slide 的
`AgentSession` / `AgentItem` / `AgentStreamEvent` 复刻：

| 端点 | 行为 |
| --- | --- |
| `GET /__agent/status` | 只报一个 provider：`id: claude`（类型限制）、`name: DeepSeek Harness`、`models: [{id:'default', label:'当前会话的模型'}]` |
| `GET /__agent/events` | 自己的 SSE：`: connected` → `session` / `item` / `session-removed`；15s 心跳 |
| `GET/POST /__agent/sessions` | 列表 / 新建：新建时用 `ctx.get('sessionController').create({ cwd: 工作区 })` 建一个真 DSH 会话 |
| `GET/DELETE /__agent/sessions/:id` | 读全量 items / 移除映射（打断在跑的 turn） |
| `POST /__agent/sessions/:id/messages` | 把 prompt + 工作台上下文写成 DSH 用户消息，`agent.followup()`；同一会话还在跑时返回 409 |
| `POST /__agent/sessions/:id/stop` | `agent.cancel({ kind: 'user' })` |
| `POST /__agent/sessions/:id/respond` | v1：把回答/权限结果当成一条普通消息发进去 |
| `POST /__agent/install` | 空操作 |

事件 → item 的映射（`toItem`）：`user/message`（source.kind === 'user'）→ user；
`assistant/message` → assistant；`tool/call` → tool(running) + `tool/result` → 同 id 打补丁
（done/error）；`turn/end` → result（aborted 标记）。轮询 `ctx.get('sessionQuery').observeSession()`
（900ms，只在有 SSE 连接时），按 seq 游标增量翻译，通过 SSE 推给面板。

会话映射：**一个 open-slide agent session ↔ 一个 DSH 会话**（用户选定），DSH 会话的 cwd 是
open-slide 工作区，所以侧栏可见、可继续、可搜索。依赖 `agents` / `sessionController` /
`sessionQuery` 三个 Host 服务；缺任意一个时 `status.enabled = false`，面板显示未连接而不是假装可用。

已接：
- **token 级流式**：`agent/assistant-stream` 的 `text-delta` 直接推成 open-slide 的 `delta`，
  面板里边生成边显示；`assistant/message` 落地时就地补完那条流式 item，不重复。
- **真实模型下拉**：`sessionController.modelCatalog()` → `models[]`（id 形如 `provider/model`），
  面板里选了就 `sessionController.selectModel()` 落到这个 DSH 会话上。
- **会话标题**：`sessionTitle.rename()`，侧栏一眼看出是哪个 deck 的对话。
- **失败/中断**：`turn/end` 的 `error` 变成 error item，`aborted` 变成带标记的 result。

- **提问 → 选项**：接管 `user-questions/request` 瀑布（属于本桥的会话才拦），把问题画成
  open-slide 的 `question` item 并挂起；面板的 `/respond` 把答案转成
  `{ answers: [{ id, selected }] }` 返回给 DSH，工具继续跑。
- **插话**：会话在跑时再发消息走 `agent.steer()`，不再是 409。
- **上下文常驻**：每次发消息都读 `<工作区>/node_modules/.open-slide/current.json`（deck /
  页码 / 选中）；创建会话时还给这个 agent 挂了 `systemPrompt.section`，说明这是工作台对话。
- **品牌图标**：open-slide 的 provider 图标按 id 写死（claude `viewBox="0 0 256 257"` /
  codex `100 100 411 411`）。iframe 里就地改这两个 SVG 的 viewBox 和子节点换成工作台图标
  （只改自身属性/子节点，不动 React 的节点身份），并用 MutationObserver 在重渲染后补上。

未接（有意）：DSH 的审批 / permission item —— 审批留在 DSH 自己的通道里更安全，面板不复制。
