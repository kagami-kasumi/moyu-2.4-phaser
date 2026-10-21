# 高阶重铸字段归属

grade与levels仍归装备实例；crafting.item、背包格、inventory.equipment之间只转移所有权。声望归reward.credit。神力宝石不改人物等级上限；品质提升不清除魔魂、孔、元素及未来字段。

保存校验将四装备grade范围从0–4扩到源定义0–6，戒指仍0–4；不更改文件版本或增加新字段。未修改raw的其他字段。负向验证grade7装备/grade5戒指被拒绝，grade6可在持有和穿戴状态往返。
