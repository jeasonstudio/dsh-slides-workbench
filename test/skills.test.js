// open-slide 官方技能：5 个都能注册，正文带环境映射，slide-authoring 附上 references/。
import assert from 'node:assert/strict'
import test from 'node:test'
import { ENVIRONMENT, loadSkill, parseSkill, registerSkills, SKILL_NAMES } from '../src/skills.js'

test('frontmatter 拆成 name / description / 正文', () => {
  const skill = parseSkill('---\nname: demo\ndescription: does things\n---\n\n# Body\n')
  assert.deepEqual(skill, { name: 'demo', description: 'does things', body: '\n# Body\n' })
})

test('5 个技能都注册上：description 来自 frontmatter，正文前面是环境映射', () => {
  const registered = []
  registerSkills({ get: name => (name === 'skills' ? { register: def => registered.push(def) } : undefined) })
  assert.deepEqual(registered.map(s => s.name), SKILL_NAMES)
  for (const skill of registered) {
    assert.ok(skill.description.length > 40, skill.name)
    assert.ok(skill.content.startsWith(ENVIRONMENT), skill.name)
    assert.ok(!skill.content.slice(ENVIRONMENT.length).trimStart().startsWith('---'), `${skill.name} 不要把 frontmatter 带进正文`)
    assert.doesNotMatch(skill.content, /AiWork/, skill.name)
  }
})

test('slide-authoring 把 references/*.md 附在正文后面', () => {
  const { content } = loadSkill('slide-authoring')
  for (const name of ['assets', 'design-system', 'morph', 'page-numbers', 'steps', 'transitions', 'webfonts']) {
    assert.match(content, new RegExp(`## references/${name}\\.md`))
  }
})
