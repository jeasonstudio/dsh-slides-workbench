// dsh-slides-workbench 模型侧 skill 与 system prompt 注册。
//
// skill 正文是 open-slide 官方技能（skills/<name>/SKILL.md，与上游的差异见 skills/README.md）。
// skills / systemPrompt 都是可选服务：ctx.get(...) 拿不到时安静跳过，
// 不 import 任何 @deepseek-ai/* 包，也不改变其他插件的提示词。
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { skillsDir } from './env.js'

/**
 * system prompt 里给模型的最短提示。
 * 路径不写死：主机路径可能很长，且契约要求模型用 slides_status 查当前工作区。
 */
const PROMPT_TEXT = '工作区状态用 slides_status 查询；deck 是 slides/<id>/index.tsx，写页面前先加载 slide-authoring skill（从零做 deck 按 create-slide）、用 slides_* 工具，不要改 package.json。用户在演示文稿编辑器的 Agent 面板里说「这一页 / 这个 / 当前 deck」时，先调 slides_context 看他正在看哪个 deck、第几页、选中了什么。'

/** 注册顺序；名字与 skills/<name>/SKILL.md 的目录一致。 */
export const SKILL_NAMES = ['slide-authoring', 'create-slide', 'create-theme', 'apply-comments', 'current-slide']

/**
 * 环境映射：官方技能写给「在工作区目录里直接读写文件」的 agent，DSH 会话不一定在那里。
 * 拼在每个技能正文前面，技能原文不改。
 */
export const ENVIRONMENT = `> 在 DSH 里使用这份 open-slide 技能时的环境映射（优先于正文里的文件操作说法）：
> - 工作区根目录是 \`slides_status\` 返回的路径；正文里的相对路径（\`slides/<id>/index.tsx\`、\`themes/\`、\`node_modules/.open-slide/…\`）都相对它。
> - 读 \`slides/<id>/index.tsx\` → \`slides_read_deck\`；写或改 → \`slides_write_deck\` 整份写回（读全文、在内存里改好、整份写回）。新建 deck → 先 \`slides_create_deck\` 再写。扫描「所有 \`slides/*/index.tsx\`」→ \`slides_list\` 后逐个读。
> - 读 \`node_modules/.open-slide/current.json\` → \`slides_context\`（返回里附原文）。
> - 列出 / 读取 \`themes/\` → \`slides_themes\`；写 \`themes/<id>.md\` 和 \`themes/<id>.demo.tsx\` → \`slides_write_theme\`。
> - \`AskUserQuestion\` → DSH 的提问工具。
> - dev server 由工作台负责：不要自己启动、不要跑 \`npm\` 命令；需要预览地址用 \`slides_present\`。
> - 不要修改 \`package.json\`、\`open-slide.config.ts\`。
`

/**
 * 拆 SKILL.md：frontmatter 里的 name / description + 正文。
 * @param {string} text - SKILL.md 全文。
 * @returns {{name: string|null, description: string, body: string}} 解析结果。
 */
export function parseSkill(text) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!match) return { name: null, description: '', body: text }
  const field = key => (new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(match[1])?.[1] ?? '').trim()
  return { name: field('name') || null, description: field('description'), body: text.slice(match[0].length) }
}

/**
 * 读一个技能，返回要注册的定义；references/*.md 附在正文后面。
 * @param {string} name - 技能目录名。
 * @param {string} [root] - skills/ 目录。
 * @returns {{name: string, description: string, whenToUse: string, content: string}} 技能定义。
 */
export function loadSkill(name, root = skillsDir()) {
  const dir = join(root, name)
  const { description, body } = parseSkill(readFileSync(join(dir, 'SKILL.md'), 'utf8'))
  let refs = []
  try {
    refs = readdirSync(join(dir, 'references')).filter(file => file.endsWith('.md')).sort()
  } catch {
    // 没有 references/
  }
  const parts = [ENVIRONMENT, body.trim()]
  if (refs.length) {
    parts.push('---\n\n# 附：references/\n\n正文里提到的 `references/<name>.md` 就是下面对应的小节。')
    for (const file of refs) parts.push(`## references/${file}\n\n${readFileSync(join(dir, 'references', file), 'utf8').trim()}`)
  }
  return { name, description, whenToUse: description, content: `${parts.join('\n\n')}\n` }
}

/**
 * 注册 open-slide 官方技能。
 * @param {object} ctx - Cordis 上下文。
 */
export function registerSkills(ctx) {
  const skills = ctx.get('skills')
  if (!skills || typeof skills.register !== 'function') return
  for (const name of SKILL_NAMES) {
    let skill
    try {
      skill = loadSkill(name)
    } catch (error) {
      ctx.logger?.warn?.(`slides-workbench: 读取 skill ${name} 失败：${errorText(error)}`)
      continue
    }
    try {
      skills.register({ ...skill, source: 'custom' })
    } catch (error) {
      ctx.logger?.warn?.(`slides-workbench: 注册 skill ${name} 失败：${errorText(error)}`)
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
