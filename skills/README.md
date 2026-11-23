# 技能（来自 open-slide）

这 5 个技能静态拷贝自 `@open-slide/core@2.3.2` 的 `skills/`（MIT，见 `LICENSE.open-slide`），
与上游的差异只有一处：

- `create-slide/SKILL.md` Step 8：交付时不让用户自己跑 `npm run dev`、不写死 `localhost:5173`，
  改为指向 DSH 里的演示文稿工作台（新 deck 几秒内自动出现）。

这些技能只在 `slides-workbench` agent preset 里可见（`cordis.patch.yml` 把这个目录加进
`dsh-skill-filesystem` 的 `customSkillDirs`），工作台 Agent 面板里的对话都用这个 preset。
会话 cwd 就是 open-slide 工作区，技能原文「在工作区目录里直接读写文件」的说法原样成立；
`references/*.md` 由模型按需用文件工具读。

升级 open-slide 时：把 `template/package.json` 里的 `@open-slide/core` 版本和这里一起改，
重新拷贝上游 `skills/`，再把上面这处差异补回去。
