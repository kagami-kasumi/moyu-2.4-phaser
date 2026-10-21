# 028 字段归属

- `EquipmentSockets.item/stone`继续拥有make槽；镶嵌修改hole1..3、gem1..3、gem11..13，并按源upDataWeapon更新装备数值。物品只能存在于一个持有容器。
- `EquipmentGemRemoval.item/stone1/stone2/stone3`拥有splitStone四槽；`GameProgress.splitStone`保存它们，关闭不归还，新建清空。UI开关、revision、提示、计算价格不持久化。
- `Inventory.equipment`已穿戴装备派生七类孔效果，`roleAttributes`消费战斗力与百分比；人物面板显示经验、减伤。当前尚无战斗伤害/经验奖励结算，不制造战斗结果；经验球固定2000不乘孔加成。
- source-field注册中的`splitStone_*`已实现字段由当前槽同步，未知额外raw键不覆盖。旧现代存档没有splitStone时按注册键推广已识别合法物品；未知内容引用不进入可操作槽，其原始键保留，覆盖槽时由新物品取得所有权。
- raw推广完成后仍由通用codec验证物品引用和数据类型。导出/导入、备份与刷新复用既有原子存档库。
