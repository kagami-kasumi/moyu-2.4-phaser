# 029 戒指打造源合同

## verified

`frame_9/DoAction.as:3383–3511`：戒指品质用灵魂晶石按gradeSuccess[grade]消费2/4/8/16，或单颗灵魂王，grade<4提升一次；八种精炼均先判断mhdj<10，useGem成功后mhdj+1，并分别增加attack10、reduceDamage1、defense4、maxLife80、maxMp80、otherFire1、burst2、jook2。十级是所有材料共用，不按属性分别计数。没有随机失败。

`upDataWeapon:5227–5269`：打造后只重算mainType1/mainType2指定的四种百分比属性，新手戒指除5，其他戒指除1；salePrice始终10。八种精炼的原始字段保留，不被主属性重算抹去。属性数值只有被戒指当前品级解锁的pairType1..grade引用才进入人物属性；未被选为副属性的数值可以精炼，但不会产生当前人物收益。

`equipment.flashAttribute:2209`依次聚合两主属性和已解锁副属性。品质本身+1战斗力；mhdj不单独加戒指战斗力。`DoAction.pcode:13800–14390`为make戒指分支，`ringMainValue`及upDataWeapon20036–20215复核主属性数组索引、divisor和salePrice；独立冻结AS/P-code哈希。

## design

背包戒指打造模式；显示共享精炼等级和主/已激活副属性。未激活字段明确提示，不制造即时收益。复用make独占item/stone；四装备的开孔/镶嵌/升级/魔魂操作继续拒绝戒指。扩展现有存档边界以允许make.item持有戒指。

## 范围限制

正常UI可得新手戒指、debug婚戒、礼包幻魔之心/魔魂之心和灵魂晶石。灵魂王及其他精炼材料用源目录受控测试；不虚构商店或掉落。幸运符、结婚关系、矿洞及材料获取不属于本任务。
