# open-slide — 工作区规则

这个目录是 DeepSeek Harness「演示文稿工作台」插件管理的 open-slide 工作区。

## 硬规则

- 一个 deck 放在 `slides/<kebab-case-id>/`，入口是 `slides/<id>/index.tsx`。
- deck 的图片 / 视频 / 字体放在 `slides/<id>/assets/`；跨 deck 复用的素材放全局 `assets/`，用 `@assets/...` 引用。
- 不要改 `package.json`、`open-slide.config.ts`，也不要动别人的 deck。
- 不要新增依赖，只能用 `react`、`@open-slide/core` 和标准 Web API。
- 讲稿（speaker notes）写进 `index.tsx` 的 `notes` 导出，不要另建 markdown。

## 在 DeepSeek Harness 里

优先用插件的 `slides_*` 工具（`slides_status`、`slides_list`、`slides_create_deck`、
`slides_write_deck` …），并在写页面前先读 `slides-authoring` skill。
