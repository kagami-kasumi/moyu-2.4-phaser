# 装备使用等级提升源合同

verified来源：frame9/DoAction.as 的makeItem、useGem、yesButton、upDataWeapon；沿用 [独立冻结函数](../equipment-magic/source-functions.json)，不重写历史。source-reference.json 固定其SHA256，补充RoleMC AS/P-code哈希与八组两职业装备名称表。测试1120组合使用冻结函数作expected，现代模块作actual。

## 执行规则

makeItem:3704–3754：幻魔晶石在装备levels==1时先升15，再useGem()一颗；低于120时useGem(levels)成功才加15；120及以上且小于人物maxLevels时useGem(levels)成功加1；否则失败。幻魔之心三个分段相同，每次一颗。原flashInfo:3150的“失败等级不变”只是旧文案，执行路径没有random，不能添加随机失败。

useGem:3356：参数NaN默认1；正数量不足返回false并发“宝石数量不足！”；正数量扣至0清槽；非正/未定义数量视作单件，仅需求1可清槽成功。yesButton:3343仅makeItem成功时调用item.upData，材料槽清空才播放成功提示。现代四装备选择限制继承共享打造边界；无效目标、错材、关闭/旧revision不改拥有者。

1→15以及levels<120的+15分支不预先检查人物maxLevels；因此119、上限120可升134，下一次才封顶。该边界保留，不能擅自改成min(下一级,上限)。自然生成装备通常按15级分档；受控119用来区分分支。

## 重算与显示

upDataWeapon:5360以后负责两职业四类基础攻防、魔魂增量、元素值、名称和售价重算；名称索引floor(min(levels,120)/15)，高于120沿用120级名称。grade/mhdj/holes/holeN/gemN/val参数和其余合法物品字段保留；源明确重算的字段采用新值。完整物品对象与源oracle精确比较。武器/衣服/头盔/鞋均可升级；戒指/幸运符不套用这套等级规则。

取回以后继续使用Inventory既有职业/人物等级门槛，不能因打造成功自动装备或提高人物等级。低级角色可打造高级装备，穿戴仍需成长。

## 人物最高等级与保存

RoleMC:119初始xxx_maxLevels=150；686–708 setter最高150、getter用于人物成长和打造。现代Inventory.maxLevel为共同运行时所有者，game.inventory.maxLevel→raw.role_maxLevels。旧现代档缺字段时从raw推广，真正缺失才默认150。可播放档范围1..150整型是design验证，非法档明确拒绝，原raw其他字段无损。

PlayerExperience和等级面板均使用当前maxLevel，避免装备与人物各用一个上限；现有150默认行为不变。source-oracle验证降低上限后角色已经超限的经验处理，仍按源消耗经验、保留当前等级。完整存档保存打造槽装备/余料及角色上限；刷新/导入不重新打造。新建恢复默认150和空打造槽。

UI“等级提升”及四按钮布局是design。初始礼包、商店采购、正常经验球均使用已确认来源；测试控制台只用于边界，正常两职业旅程无probe。

不包含神品品质来源、元素打造、镶嵌/拆取、幸运符或戒指升级，也不代表战斗实现。
