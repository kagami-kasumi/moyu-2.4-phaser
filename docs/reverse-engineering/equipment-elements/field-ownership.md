# 字段归属

装备element/wind/fire/water/soil由原物品字段持有，打造槽→背包→穿戴所有权独占。credit由NpcReward持有，每次附加即时扣除。elementSet/elementFire和百分比加成为Inventory.stats派生值，不另存状态。

保存复用crafting、inventory.equipment、reward.credit和源raw映射，无新增schema；未知字段和未实现spirit/战魂值保留。随机使用NpcReward同一random端口，仅小元素石成功调用random(4)，拒绝不抽取。满包取回仍走既有掉落随机端口。
