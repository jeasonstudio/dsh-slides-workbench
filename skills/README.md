# 技能（来自 open-slide）

这 5 个技能静态拷贝自 `@open-slide/core@2.3.2` 的 `skills/`（MIT，见 `LICENSE.open-slide`），
与上游的差异只有一处：

- `create-slide/SKILL.md` Step 8：交付时不让用户自己跑 `npm run dev`、不写死 `localhost:5173`，
  改为指向 DSH 侧栏的「演示文稿」面板（`slides_present`）。

技能原文写给「在工作区目录里直接读写文件」的 agent；DSH 会话不一定在工作区目录里，读写优先走 `slides_*` 工具。
两者的对应关系写在 `src/skills.js` 的 `ENVIRONMENT`（注册时拼在每个技能正文前面），技能正文不改。
`slide-authoring/references/*.md` 注册时附在该技能正文后面（DSH 的 skill 只有一段正文）。

升级 open-slide 时：把 `template/package.json` 里的 `@open-slide/core` 版本和这里一起改，
重新拷贝上游 `skills/`，再把上面这处差异补回去。
