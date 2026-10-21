# TASK-GEM-038 · 高级宝石融合与三类圣石

## 目标
玩家把杂货商解锁后的高级宝石融合提升，或组合为三类圣石，取回后可进入既有镶嵌系统；两融合槽跨图、保存、刷新和导入保持独立物品归属。

## 输入
依赖TASK-SHOP-037。选择理由：满级杂货已提供四类高级宝石，而圣石的镶嵌/拆取已经实现，融合正好补齐获取链。frame_9/DoAction.as:4840起castleStone.setThing/notice/flashInfo/beginRefine/yesButton；frame_9/DoAction_2的castleStone持久字段；已注册宝石参数和src/domain/equipment-gems.ts。

## 范围
四种高级宝石同类提升、战斗力与另外三类双向融合、全部阈值/声望费用/消费和字段重建；双槽独占、取回/满包落地、过期操作、切图/新建、raw推广。现代背包入口属于design，遵循既有打造UI方式，不冒充原城堡入口。无城堡经营、幻兽培养或额外商店扩展。

## 输出
独立冻结源函数、融合领域和UI、两槽持久字段消费者、全分支源oracle、两职业正常购买融合及保存旅程、截图与覆盖报告。

## 验收
- 独立oracle比较四类全部阈值前后、主副顺序、声望刚好/不足、错误宝石和主材料叠数；精确输出val1/val2、售价、消息和消费槽。
- 两职业无probe升级杂货、购买、同类提升与异类圣石，取回查看、保存刷新/真实导入；受控全部拒绝、满包、旧回调、切图和新建。
- 两槽占用存档及旧raw均不复制/丢弃物品；未实现字段保持原样。
- npm run typecheck、npm test、npm run build、npm run test:browser、npm run check:save、generate:harness/check:harness；实际查看截图。

## 停止与拆分
四类融合与三圣石是同一完整能力，不按宝石类型拆分。原版异常阈值按源记录，不默默修正；仅缺失必要源输入或用户裁决才阻塞。
