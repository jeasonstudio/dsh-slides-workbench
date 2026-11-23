import type { OpenSlideConfig } from '@open-slide/core';

// 工作台管好这个文件，不要手改：
// - dev server 的端口由 DSH 插件用 --port 传入；
// - base 让页面挂在 DSH 的同源路径 /slides-workbench/app/ 下，面板才能直接嵌它、
//   并往页面里注入样式（隐藏 open-slide 自带的左侧导航）；
// - agent 后端关掉：Agent 面板的外壳照旧，内容由工作台换成 DSH 原生对话（不走 open-slide 自带的 claude / codex）。
const openSlideConfig: OpenSlideConfig = {
  base: '/slides-workbench/app/',
  agent: { enabled: false },
};

export default openSlideConfig;
