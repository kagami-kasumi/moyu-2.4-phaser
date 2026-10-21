# TASK-EQUIP-027 验收

2026-10-09完成。两职业四类装备、幻魔晶石/之心提升和人物上限共享已交付，证据见[source-contract](source-contract.md)及[source-reference](source-reference.json)。

- `npm run typecheck`、`npm run build`通过；构建仍有既有大chunk提示。
- `npm test`通过134项（107+27）。新增5项等级测试包含1120组冻结源函数全物品字段、扣材与消息对照，并验证非法输入、旧按钮、满包回收、存档及人物成长上限。
- `npm run check:save`通过653字段检查和14项测试。
- `npm run test:browser -- --workers=2`全量59项通过（2.4分钟），其中新增3项。两职业正常UI采购晶石→装备升15→低等级拒绝穿戴→经验球成长→穿戴，幻魔礼包→之心连续升级→刷新与实际文件导入恢复通过。
- 受控覆盖材料不足、150封顶、满包落地/拾取、旧按钮、切图、新建、上限120保存恢复及经验面板共同上限。
- 实际复核 `.evidence/equipment-level/` 中warrior-crystal、mage-heart、cap、shared-cap截图；四按钮、材料、装备等级与上限文本可见。逻辑、保存、浏览器日志同目录。

验证过程中修复测试oracle缺少法师高等级名称表的问题，expected改由独立冻结源名称表补全；受控测试填满背包会覆盖经验球，改为显式补入该边界测试道具。正常旅程没有使用probe。最终全量验证均通过。

状态收尾执行generate:harness/check:harness。此交付不包含元素、宝石镶嵌拆取、戒指/幸运符升级或完整战斗。
