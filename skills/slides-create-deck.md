# 从零做一份 open-slide 演示文稿

这份 skill 负责**工作流**；页面怎么写（文件契约、画布、字号、notes、动效）全部看 `slides-authoring` skill。写代码前必须加载它，不要凭记忆编 open-slide API。

## 0. 前置检查

1. `slides_status`：确认工作区路径、`installed` 为 true、dev server 状态。
2. 依赖没装：告诉用户在 DSH 侧栏「演示文稿」面板点「初始化工作台」，或调用 `slides_build` 触发安装；**不要**自己改 `package.json`、不要 `npm install`。
3. `slides_list`：看已有 deck，避免 id 撞车，也避免重复建同一份。

## 1. 一次问清（用 `ask_user_question`，一屏问完）

用户没给的信息，用 `ask_user_question` **一次调用里多问几项**（多 question 表单一屏提交），**不要一次只问一个问题**。

需要锁定的：
1. **主题与目标**：这份 deck 要回答什么问题、有没有已有大纲。用户已经说清楚就跳过，并在回复里复述你的理解让其纠正。
2. **受众**：管理层 / 客户 / 团队内部 / 公开分享——决定信息密度和语气。
3. **页数**：3–5（短）/ 6–10（标准）/ 11–20（深度）。
4. **视觉方向**：给 3 个针对本主题的具体方向（气质词 + 具体配色/字体/版式线索，能让人想象出画面），其中一个标「推荐」；不要只给「极简/商务」这种空标签。用户也可以选「不要预设，从零设计」。

仍不清楚才追加：是否需要讲稿（写进 `notes`）、是否有品牌色、是否有必须出现的真实图片（用 `<ImagePlaceholder>`）。已经明确的信息不要再问。

## 2. 定 deck id

kebab-case、短、描述性：`q2-launch`、`rust-intro`、`team-offsite-2026`。先用 `slides_list` 查重。

## 3. 建 deck

调用 `slides_create_deck`：`{ "title": "Q2 Launch", "id": "q2-launch" }`（`id` 可省略，会从标题生成）。
它会创建 `slides/<id>/index.tsx`（一页封面起始稿）和 `slides/<id>/assets/`。**以返回的 id 为准**（重名时可能变成 `q2-launch-2`），记住文件路径。

## 4. 规划页序

先列页面角色，再写代码。常用：封面 → 议程 → 章节页 → 内容页 ×N → 大数字/引用/对比 → 结尾 CTA。
一页一个观点；想放两个就拆成两页。页数要与第 1 步约定一致。

## 5. 一次写完整文件

- 先加载 `slides-authoring` skill，按它的文件契约和画布规则写。
- 在 `slides/<id>/index.tsx` 里写全：`import type { Page, SlideMeta }`、`export const design`、各页组件、`export const meta`（`createdAt` 用 Bash 取真实 ISO 时间）、`export const notes`（与页面一一对应）、`export default [...] satisfies Page[]`。
- 用**一次** `slides_write_deck` 写入整份源码（`{ "id": "...", "source": "..." }`）。不要分多次小改、不要写一半。
- 写入失败会返回校验错误：按错误改完整文件后重写；有 `warnings`（如 notes 没对齐）就修掉再交付。
- 不要创建其他文件（组件、README、讲稿 md 都不行），不要新增依赖，不要改 `package.json`。

## 6. 自检

按 `slides-authoring` 的「写完自检」清单逐条过，重点：

- `export default` 非空，页数符合约定；
- 每页根元素 100%×100%，内容不超出 1080px；
- 全篇一套配色、字号、padding；
- `notes` 条数 = 页数（`undefined` 允许）；`createdAt` 是真实时间；
- 只动了 `slides/<id>/` 下的文件。

## 7. 交付

调用 `slides_present`（传 deck id）拿到预览/编辑器 URL，然后告诉用户：

- deck id 与文件路径 `slides/<id>/index.tsx`；
- 可以在 DSH 侧栏「演示文稿」面板里选中它，直接**预览 / 演示 / 导出**（面板里也有完整编辑器）；
- 讲稿在 `notes` 导出里，演示者视图能看到；
- 需要静态产物时用 `slides_build`，或在工作台点「导出」。

## 8. 后续修改

1. `slides_read_deck` 拿当前全文；
2. 只改需要改的页，但**整体**重写文件（`slides_write_deck` 是覆盖写）；
3. 增删/重排页面时同步重排 `notes`；
4. 改完再自检一遍，必要时 `slides_present` 看效果。

## 9. 常见问题

- 「源码解析失败 / 没有找到 export default」：JSX 或括号不配对、或忘了 `export default [...]`；修好整体重写。
- 「notes 没有对齐」：`notes` 条数与页面数不一致，补齐或删掉多余的。
- 页面内容溢出：拆页，不要加 `overflow`、不要缩字号到 28px 以下。
- 用户只要「一页 / 一张」：只写一个 `Page`，仍然给完整文件契约。
- deck 不存在：用 `slides_list` 重新确认 id，不要猜；被删掉的 deck 在 `.trash/` 里可手动找回。