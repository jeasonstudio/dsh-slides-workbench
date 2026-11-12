// dsh-slides-workbench 模型侧 skill 与 system prompt 注册。
//
// skills / systemPrompt 都是可选服务：ctx.get(...) 拿不到时安静跳过，
// 不 import 任何 @deepseek-ai/* 包，也不改变其他插件的提示词。
import { readFileSync } from 'node:fs'

/**
 * system prompt 里给模型的最短提示（115 字）。
 * 路径不写死：主机路径可能很长，且契约要求模型用 slides_status 查当前工作区。
 */
const PROMPT_TEXT = '工作区状态用 slides_status 查询；deck 是 slides/<id>/index.tsx，写页面前先加载 slides-authoring skill、用 slides_* 工具，不要改 package.json。'

/** 两个 skill 的元数据；正文从 skills/*.md 读，便于单独迭代文案。 */
const SKILL_SOURCES = [
  {
    name: 'slides-authoring',
    description: 'open-slide 页面写作技术参考：文件契约（export default [...] satisfies Page[]、meta、notes）、1920×1080 画布与垂直预算、字号尺度、配色与 design token、常用布局、Steps 分步揭示、SlideTransition 转场、MorphElement 变形、assets 与 webfont、反模式、写完自检清单。',
    whenToUse: '准备新建或修改 slides/<id>/index.tsx 里的任何页面时先读：加页/改布局/换配色/调字号/写讲稿 notes/加分步揭示或转场/导入图片字体。',
    file: new URL('../skills/slides-authoring.md', import.meta.url),
  },
  {
    name: 'slides-create-deck',
    description: '在 DSH 里从零做一份 open-slide 演示文稿的工作流：一次问清主题/受众/页数/视觉方向 → 定 kebab-case id → slides_create_deck → 用 slides_write_deck 一次写完整 index.tsx → 按自检清单检查 → slides_present 预览或演示。',
    whenToUse: '用户要新建一份演示文稿、deck、slides 或 PPT，或要从零起草整套页面时先读；已有 deck 的页面细节改动看 slides-authoring。',
    file: new URL('../skills/slides-create-deck.md', import.meta.url),
  },
]

/**
 * 注册两个 slides skill（技术参考 + 工作流）。
 * @param {object} ctx - Cordis 上下文。
 */
export function registerSkills(ctx) {
  const skills = ctx.get('skills')
  if (!skills || typeof skills.register !== 'function') return
  for (const source of SKILL_SOURCES) {
    let content
    try {
      content = readFileSync(source.file, 'utf8')
    } catch (error) {
      ctx.logger?.warn?.(`slides-workbench: 读取 skill ${source.name} 失败：${errorText(error)}`)
      continue
    }
    if (!content.trim()) {
      ctx.logger?.warn?.(`slides-workbench: skill ${source.name} 正文为空，已跳过`)
      continue
    }
    try {
      skills.register({
        name: source.name,
        description: source.description,
        whenToUse: source.whenToUse,
        content,
        source: 'custom',
      })
    } catch (error) {
      ctx.logger?.warn?.(`slides-workbench: 注册 skill ${source.name} 失败：${errorText(error)}`)
    }
  }
}

/**
 * 注册一段简短的 system prompt：工作区怎么查、deck 是什么、写页面前先读 skill。
 * @param {object} ctx - Cordis 上下文。
 * @param {{workspace?: object}} [deps] - Host 模块实例；签名由 host.js 固定，提示里不写死路径。
 */
export function registerPrompt(ctx, deps = {}) {
  const prompt = ctx.get('systemPrompt')
  if (!prompt || typeof prompt.section !== 'function') return
  // deps.workspace 由 host.js 传入，保留以固定调用签名；路径本身按契约交给 slides_status 查。
  void deps
  prompt.section({
    name: 'plugin:slides-workbench',
    order: 500,
    text: PROMPT_TEXT,
  })
}

/** 把异常转成可读的一句话。 */
function errorText(error) {
  if (error instanceof Error) return error.message
  return String(error ?? '未知错误')
}