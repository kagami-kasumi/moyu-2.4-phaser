# TASK-DATA-020 · 注册迁移与综合验收

2026-10-08，范围为已经可玩的男战士旅程、领取/兑换、背包/装备与打造。没有新增角色入口、战斗、物品效果或存储IO。

## 覆盖与证据边界

`integration-coverage.json` 按精确ID连接017的2461条与018的7150条，互斥并集为9611条；018的927条持久移交逐条连接019的处置和653键模板。表现/控制排除、惰性声明、可执行模块、持久处置保持分别记录。verified表示各自声明范围经源核对，不表示全部玩法可用。

旧 `numeric-rule-index.json` 的8716条非reviewed-module标记与 `reference-audit.json` 的 classification-audit-in-progress 标签保留历史值。本次不改标签冒充完成，而是让综合命令实际执行身份全集、动态域、数值声明/源值/条件、持久恢复与异常处置专项，再检查精确集合和报告漂移。`--write`仅用于生成集成报告，不代表其他门禁通过。

综合负向测试覆盖遗漏、跨包重复、未知ID、改值、未审数值、持久移交遗漏/重复/未审、未知持久字段。源调查和各专项另外验证内容值、条件、补充调用及生成报告漂移。911条身份、2076候选与72动态域仍由015独立源枚举验收，未以数值集合替代身份覆盖。

## 运行时迁移

| 消费者 | 正式输入及迁移 |
| --- | --- |
| NpcReward | 初始凯恩改用ITEM_PETS注册种子；保留battle=true，不展开尚未实现的完整幻兽实例。初始物品、wudi赠送、戒指继续使用literalItem、ORIGINAL_START_GRANTS与RING_RULES。堆叠上限消费ITEM_STACK_RULES。 |
| 奖励装备 | 具名装备由统一equipment目录按职业/等级选择；奖励品质/魔魂配方集中到implemented-gameplay-rules，源为NPC command case3战士分支。 |
| Inventory礼包 | 三礼包的产物改用literalItem，移除重复物品价格；生成10次、先生成后消耗、满包掉落顺序不变。 |
| Inventory成长/汇总 | 英勇上限消费skill目录、效果消费passiveSkillValue；功勋/军功上限和爵位阈值消费MERIT_RULES/ROLE_PROGRESSION_RULES；人物最终属性消费roleAttributes与已取证战士职业系数。现有装备槽汇总仍是领域逻辑，未启用未实现的元素/战魂等效果。 |
| 装备刷新/打造 | refreshEquipmentAttributes仅保留equipment名称选择，数值委派refreshItemNumbers；开孔也使用同一刷新路径，删除重复售价公式；品质材料数量消费ITEM_REFINEMENT_RULES；魔魂参数集中到内容规则。 |
| HUD | 初始人物生命/魔力从同一战士系数计算，凯恩生命从注册种子计算；既有源初值oracle保留。 |
| 地图切换 | 复用015已经接入的slice-manifest校验：正式地图名称/帧须与目录一致；现有两地图路由与入口坐标仍由已冻结的首旅程合同和manifest控制，不开放其余注册地图。 |

新增常量模块只汇集已实现分支：map frame1:2807–2811；根frame9 useItem:1307–1358；NPC command case3/case7与makeItem魔魂分支。原奖励、兑换、背包和打造源oracle继续直接验证消费者；新增消费者组合测试检查三礼包路径与所有落地物品ID、种子实例隔离，并直接核对战士五项源系数。

运行时依赖位于src/content和public/assets；没有导入local-resources或.evidence。原SWF和原始提取物未改动。

## 实际验证

- `npm run check:content-registry`：通过；含源调查15+88、身份负向3、角色物品39、幻兽世界65、持久5+37与集成10项测试，以及各独立源/漂移检查。完整日志 `.evidence/data-020-registry.log`。
- `npm run typecheck`：通过。
- `npm test`：73/73通过；包含6384组装备名称/数值源对照、既有打造/背包/兑换源oracle和新增消费测试。日志 `.evidence/data-020-logic.log`。
- `npm run build`：通过（由test:browser先执行）；保留现有大chunk警告，未降低门禁。
- `npm run test:browser`：27/27通过，Edge冷启动，44动作投影、地图、原版HUD、领取、背包、掉落、兑换及三类打造回归。日志 `.evidence/data-020-browser.log`。
- `npm run generate:harness`、`npm run check:harness`：收尾执行结果登记于任务completion。

实际打开检查了7张本轮截图：`.evidence/game-entry/default.png`、`npc-reward/pack-1.png`、`npc-reward/pack-3.png`、`inventory/inventory-and-equipment.png`、`inventory/city-equipment.png`、`equipment-quality/four-equipped.png`、`equipment-quality/combined-forge.png`（后六项均在.evidence下）。确认原HUD、凯恩成长记录、礼包产物、品质标记、人物属性、打造反馈和切图后装备可见；无新增UI布局，未发现本次迁移造成的遮挡或文字缺失。截图中的原版HUD与现代场内面板沿用既有设计，不宣称完整原屏幕像素一致。

## 后续限制

幻兽重复nextLvRate键的AVM1动态结果仍unknown，现代三键分离仍design。018的form、空lover和建筑路径疑点没有被注册门禁改写为已修复玩法。完整角色初始化、源debug/wudi阶段、女法师呈现等由021执行；本次保持既有男战士可玩子集。完整持久合同可被后续消费，但存储IO、正常往返和迁移/异常恢复仍由016/022交付。基础功能线不能在020关闭。
