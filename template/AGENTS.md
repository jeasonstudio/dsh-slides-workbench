# open-slide — 工作区规则

这个目录是 DeepSeek Harness「演示文稿工作台」插件管理的 open-slide 工作区。

## 硬规则

- 一个 deck 放在 `slides/<kebab-case-id>/`，入口是 `slides/<id>/index.tsx`。
- deck 的图片 / 视频 / 字体放在 `slides/<id>/assets/`；跨 deck 复用的素材放全局 `assets/`，用 `@assets/...` 引用。
- 不要改 `package.json`、`open-slide.config.ts`，也不要动别人的 deck。
- 不要新增依赖，只能用 `react`、`@open-slide/core` 和标准 Web API。
- 讲稿（speaker notes）写进 `index.tsx` 的 `notes` 导出，不要另建 markdown。

## 在 DeepSeek Harness 里

- 当前目录就是工作区，直接用文件工具读写 `slides/<id>/index.tsx`、`themes/`。
- 写页面前先加载 `slide-authoring` skill；从零做一个 deck 按 `create-slide`，做主题按 `create-theme`。
- 用户说「这一页 / 这个 / 当前 deck」时，先读 `node_modules/.open-slide/current.json`
  （他正在看的 deck、第几页、选中了什么），细节见 `current-slide` skill。
- dev server 由工作台负责：不要自己启动，不要跑 `npm` 命令。新建的 `slides/<id>/index.tsx`
  几秒内会自动出现在工作台里，写完告诉用户在工作台里看即可。
- 删 deck 先和用户确认，然后把目录移到 `.trash/`，不要直接删除。
