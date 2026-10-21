# 023 验证

2026-10-09。独立源枚举11种与注册精确一致，AS/P-code哈希复核；7项消费专项覆盖七药/三面板严格优先级、当前槽与跨堆扣除失败、死亡/满值、储备不足/恰好/溢出、超级球封顶仍扣除、装备/英勇组合、XP3→6封顶保留、字段推广/重复恢复/新建重置。

- npm run typecheck：通过。
- npm test：107项既有回归与7项新增专项全部通过（共114项）。
- npm run build：通过，保留既有大chunk提示。
- npm run check:save：653映射/60NPC种子与14项保存检查通过。
- npm run check:source：5项解析检查与只读SWF清单通过。
- npx playwright test tests/browser/character-consumables.spec.mjs：3项通过；两职业通过真实菜单的原版debug命名入口取得超级球，无probe；普通默认库存没有超级球。首轮测试误以为默认库存有球已纠正，不补造奖励。
- npm run test:browser：全量46项通过（5.3分钟）。

实际查看 `.evidence/character-consumables/` 的 warrior-stats、mage-stats、mage-restored、medicine、reserve-insufficient、energy-cap、city 共7张。人物属性、当前HP/MP、余额、容量与反馈可读。两职业导出文件在同目录，经真实导入及备份恢复检验。普通经验球与既有打造回归保持。

限制：原版安全地图的储备回满属于区域状态调度，当前未开放；幻兽生命目标/储备顺序在纯领域有独立源对照，未开放完整出征/合体/战斗。药品、能量药水及非零储备通过明确manual受控输入测试，不当作现有商店或战斗已可玩。外观为现代文字面板，未声称复刻原版整屏。
