# TASK-NPC-010 · 老兵勋章兑换闭环

## 目标
首次礼包后，玩家可把两枚勇士勋章交给老兵换取初级月光宝盒；不足时保留物品，满包时能回收掉落，重复对话不能免费复制奖励。

## 输入
- 前置 TASK-ITEM-009 的拾取、TASK-ITEM-008 的背包及 TASK-NPC-005 的老兵对话。
- `local-resources/moyu/source-index/as/scripts/DefineSprite_4312/frame_1/DoAction.as` command case6/7、setCommand：case7 先 useThing(勇士勋章,2)，成功 createThing(初级月光宝盒)并关对话，失败呈现不足提示。
- 根 `frame_9/DoAction.as` backPack.accountThing/useThing/setThing 与 createThing 初级月光宝盒分支；对应 P-code 已存在。
- 选题原因：领取后的老兵已显示兑换邀请，但当前没有兑换选项；初始背包有勇士勋章，可直接连接现有对话、物品及满包回收能力。

## 范围
任务内完成有界源取证、冻结独立期望、兑换领域用例和对话接入、浏览器与视觉验证。只开放勋章兑换；等级奖励、宝盒使用、战斗、商店和存档不在本任务范围。兑换次数、消耗顺序、满包行为和对话生命周期按原证据核验，不猜测。

## 输出
`docs/reverse-engineering/veteran-exchange/` 源合同、冻结基准、验证报告；领域和对话改动、逻辑及浏览器测试。

## 验收
- 冷启动领取首次礼包，再兑换；背包准确扣两枚勋章，宝盒属性与源一致，对话和提示同步。
- 独立源期望覆盖0/1/2/多枚、跨槽扣除、满包是否因扣除腾格、溢出拾取、重复/过期回答、关闭重开、切图和新建；失败不扣物品，成功不重复发放。
- `npm run typecheck`、`npm test`、`npm run build`、`npm run test:browser`，保留并实际检查截图；保持现有拾取、装备、地图和44动作回归。
- 状态更新执行 `npm run generate:harness` 和 `npm run check:harness`；源资源或解析器改变时执行相应源检查。

## 停止与拆分
关键规则未知先查精确AS/P-code；仅真实外部依赖构成阻塞，不因取证阶段、耗时或压缩拆任务。完成后自主落实下一项合同与调度。
