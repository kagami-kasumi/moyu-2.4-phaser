# 魔之魂字段与保存

val1=属性类型，val2=属性数值，归装备或材料实例。不是spirit/spiritVal战魂字段，也不是魔魂等级mhdj。覆盖只改两参数；消耗后仍有剩余材料时，源默认化的1/1必须写回材料。

魔之魂战斗力与十类合计为Inventory.stats派生结果，不单独保存。完整现代crafting/inventory对象扩展无损保存参数；不增加版本、不重放附加。原源raw：backPack/equipment和make_stone具有val1/val2，make_item没有这两个键。本次不伪造原字段，现代扩展保存原格式遗漏的打造槽参数。未实现字段和未来raw键保留；持有与穿戴来回导入均已验证。
