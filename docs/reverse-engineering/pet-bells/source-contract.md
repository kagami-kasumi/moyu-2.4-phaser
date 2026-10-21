# 三槽铃铛装备源合同

verified：frame_9/DoAction.as:2343–2413的三个setThing只接受庇护/翡翠/凤翼铃铛，旧槽先backPack.setThing返包（满包按既有规则掉落），再复制新物、刷新相同编号面板；notice清空槽后刷新，并执行body.life+=0钳制。装备替换本身不强行回满或钳制。delivery:84–99复制grade/三个attributeType、Val/skill/pure，装备时不执行upDataWeapon重算。

verified：DoAction_2:180–185绑定面板与同号装备/身体；881起保存huanShouItem1..3各字段，1844起恢复到bell.setThing。装备属于槽，与收藏身份分开；召回close不会清装备。

verified：HuanShouClass.moreAttribute只在battle且bell.type定义非空时叠加。循环槽1..3，grade-slot<-1停止，类型1防御、2双攻击、3生命；与元素加成相加，最终Math.round(rate*(level+5)*(1+bonus/100))。grade0/1/2..4最多激活1/2/3项；未定义类型无作用，源数值getter缺省为0。评分不随铃铛改变。4556.flashAttribute战斗力floor(allFen/100)+grade+1，只在相应面板开放时汇入人物。

verified：最大生命变化本身不钳制当前生命（HuanShouClass.life setter）。卸下notice明确life+=0才钳制；升级和管理员恢复用当前装备后的maxLife。技能skill1/2是战斗触发，本任务不开放。

design：收藏页显示三槽装备，可在空活动槽预装备（setThing无活动检查），受锁定槽也可保存装备但不产生出征收益。UI通过对象身份和revision拒绝旧回调。支持grade0..4和attributeType0..3，未知输入保存且拒绝执行。现代保留物品完整扩展字段；raw中未知槽标为reserved，不能覆盖。

现代来源限制：自然铃铛掉落尚未开放，浏览器使用明确受控入包种子，再通过正式UI装备/卸下/成长/治疗/存取，不伪装自然获取。

## 执行边界补充

铃铛正数量记录在旧拖放/整格返回中有堆叠别名风险，现代执行拒绝number>0，保留存档并显示数据无效；正常源铃铛为0/未定义。当前生命超过新上限的状态可原样保存，只有源明确setter动作（卸下、升级、治疗）才钳制。
