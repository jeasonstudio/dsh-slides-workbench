# 演示文稿工作区（open-slide）

这个目录是 [open-slide](https://open-slide.dev/docs) 的工作区，由 DeepSeek Harness 的
**演示文稿工作台** 插件创建和维护。

- `slides/<id>/index.tsx` —— 一个 deck：默认导出一组 React 组件，每页一个 1920×1080 画面。
- `slides/<id>/assets/` —— 这个 deck 的图片 / 视频 / 字体。
- `themes/` —— 跨 deck 复用的设计系统（markdown）。
- `assets/` —— 全局素材，`@assets/...` 引用。

## 怎么用

正常情况不需要手动敲命令：打开 DSH 侧栏的「演示文稿」，或者在会话里让 AI
「帮我做一个关于 X 的演示文稿」，工作台会自己起 dev server，并把页面实时嵌进面板。

想单独用浏览器打开也可以：

```bash
npm install      # 首次
npm run dev      # http://localhost:5173
npm run build    # 静态站 → dist/
```

## 谁在写这个目录

- AI（通过 DSH 的 `slides_*` 工具）负责写 `slides/<id>/index.tsx`。
- 面板负责预览、演示和导出。
- `package.json`、`open-slide.config.ts` 由工作台管理，**不要手动改**；
  `.agents/skills/` 由 `open-slide sync:skills` 同步。