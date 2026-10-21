# TASK-NPC-030 验证（2026-10-09）

已接入老兵等级奖励菜单、三档九种发奖分支、逐档领取计数及旧raw/现代存档恢复。严格超过档位等级才能领取；150级可补领至140档，不能领取150档。

## 实际验证

- `tests/veteran-level-rewards.test.mjs`五项通过：2430组两职业、索引1..15、门槛上下各一点、三种选择、空包/满包/堆叠及三种余额与冻结源oracle对照，其中810组实际发奖。比较完整背包、掉落、货币、计数、对话生命周期和消息。
- 额外覆盖150级连续补领14档、旧回调、改变等级/计数、取消与切图；确认满包发两个宝盒之前计数已推进，地面拾取不重复。
- `npm test`、`npm run typecheck`、`npm run check:save`通过；保存门禁覆盖653字段、14项保存测试。旧raw计数推广、坏计数拒绝及未知字段保留通过。
- 浏览器两职业正常入口（无probe）：领取礼包、经验球成长、领取宝盒开孔、继续成长补领、刷新和真实导出/导入恢复。受控验证60/61门槛、中档资源实际50,000、满包两个宝盒、旧按钮、150级上限、切图和新建；真实旧raw导入及手动备份恢复通过。
- 已实际打开`.evidence/veteran-level-rewards/warrior-offer.png`、`mage-restored.png`、`overflow.png`、`backup.png`：三选一数量、下一档门槛、两件落地宝盒与恢复后计数说明可读，无遮挡操作。
- 首轮69项浏览器检查为66通过、3失败；三个首次礼包用例均发现旧`talk-later`“等级奖励尚未开放”提示遮住第三选项。已删除HTML节点、适配器旧显示分支及过期CSS，未修改测试绕过点击；修正后类型检查和构建再次通过。

## 证据与限制

AS与P-code共同确认cmd13实际发放50,000资源，虽然原版文字写100,000；现代界面按实际数值展示并标为design，不改变原数值。完整函数与原文件哈希见`source-functions.json`。

正常成长验证采用既有经验球路径；受控高等级不冒充完整战斗成长。此任务不扩展战斗、远区或其他NPC。原SWF及已有原始提取物未改写。

最终浏览器复验：修正后全量 `npm run test:browser -- --workers=4` 为68通过、1失败，全部老兵用例通过；唯一失败为法师宝石流程点击杂货商后未打开对话、90秒超时。随后同一构建运行 `npx playwright test tests/browser/equipment-gems.spec.mjs tests/browser/npc-reward.spec.mjs tests/browser/veteran-level-rewards.spec.mjs --workers=1`，12项全部通过。未修改测试/强制点击掩盖失败；四路并发下一次未复现的输入失败作为测试稳定性限制保留，不宣称全量一次通过。最后重看修正后warrior-offer.png，显示正常。
