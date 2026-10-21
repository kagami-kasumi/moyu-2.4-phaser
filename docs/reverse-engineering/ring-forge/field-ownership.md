# 戒指打造字段归属

`make.item`由既有EquipmentSockets.item拥有，现允许戒指；make.stone仍为宝石。无需新增另一个戒指副本。品质grade、共享精炼mhdj、八数值字段在源useGem成功后更新；主属性通过既有数值注册表重算，未选中副属性也必须保存。

当前GameProgress.crafting与raw.make_item_*同步，codec允许已注册戒指占item；其他四装备打造规则继续做类型限制。旧现代档已经持有的装备、raw未知字段不迁移重置。穿戴后装备槽拥有戒指，移入打造前需卸下。旧UI回调由revision拒绝。

Inventory派生值只聚合两主属性和pairType1..grade，含生命、魔力、防御、攻击、战斗力、减伤、暴击、闪避。精炼不改变主副选择，品质开放下一个已有副属性。源表与字段见source-functions.json和source-contract.md。
