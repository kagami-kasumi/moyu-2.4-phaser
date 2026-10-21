# 024 验证

2026-10-09。21技能、21技能书独立冻结源枚举与正式注册精确对账，根消费/addSkill/effect和保存源AS/P-code哈希通过。

- npm test：107项旧回归、7项消耗品与6项技能检查全部通过（共120项）。覆盖两职业/全部书/书等级与职业门槛/数量0、1、7/死亡学习/整槽消耗/上限保留/旧引用、九被动属性与装备戒指超级球组合、XP独立状态、旧排序字段推广和重复恢复。
- npm run typecheck、npm run build、npm run check:save、npm run check:source通过；存档检查14项，原始清单未修改。
- npx playwright test tests/browser/character-skills.spec.mjs：4项通过；两职业无probe正常英勇学习、技能面板/属性、刷新继续、真实导出/导入/备份恢复；manual逐本21书、门槛/职业拒绝/封顶/死亡/旧按钮、切图与重置。
- npm run test:browser：全量50项通过（6.3分钟）；最后新增V键入口后重新typecheck/build，并重跑技能4项浏览器全部通过（44.9秒）。

截图在`.evidence/character-skills/`。实际查看warrior-learned、mage-learned、warrior-stats、mage-restored、warrior-catalog、mage-city六张；初次发现列表滚动会把标题/关闭控件带走，已改为列表内部滚动，并逐张复核新截图，标题/关闭按钮固定可见。面板外观为design；源描述文本不代表战斗施放/触发已开放，面板显式提示。

保留范围：没有增加主动施放、快捷键编排、购书或被动战斗命中；相应规则字段已备好，不以学习完成冒充战斗完成。
