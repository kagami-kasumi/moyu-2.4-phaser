# 树心城与幻境源合同

## verified

source-fixture.json独立冻结FFDec XML的4536/frame28/31/32、2773地面、NPC4308/4312、冰妖剑士3239与3229/3238。16张FFDec PNG单独保存并记录哈希，不覆盖原提取物。源AS/P-code包含原initMonster/monsterDeath/dropItemX/SuperHS、城市/幻境初始化、root useItem/保存和RoleMC/MonsterMC。

- 城市frame31 entry1→树心路entry2、entry2→心湖entry1、entry3→戈壁郊区entry1。homeCity更新树心城，药店openNumber至少4，首访一次给树心幻境，随机入场读取共享intoV/intoTime/intoWait且先抽签。地面2772、背景4369；backPoint在depth24，坐标300.4,352.65，不能被通用depth<22过滤丢掉。
- NPC4308标签2/26/57/29/36对应指挥官4255、爱神4265、技能导师4303、药剂师4269、巧匠4277；位置85,310 / 265,240 / 350,320 / 455,320 / 250,400。药店前四项为小型生命/魔力及中型生命/魔力药，价格10/10/30/30。
- 幻境frame32只存在entry6，源却用entry1入场/清空显示；回城为树心城backPoint。缺失entry1不能解释成确有该实例。
- 四只25级base0幻影冰妖剑士，生命51*20*25=25500；攻击(.65+.8+.65*3)*25并乘.8/1.2，防御(.6+.75+.6*2)*25；attackFire150，警戒290/145，速度4/2，attackTypeNum1，不是远程attackType。
- 冰妖剑士3239仅六选择器，左右站立、左右跑、左右攻击；3229跑动仅一帧，3238攻击八帧。第八帧将motion置“使用技能结束”；MonsterMC所有攻击/技能/远程都用此统一结束标记。attackTypeNum1使random(1)==1永远为假，不能创建不存在的额外技能动画或套用强盗八选择器。
- 死亡依序计实名/怪物、声望+1、dropItemX(1)。maxArr[1]=6，分支0/1空、2玫瑰、3玉石、4调用未定义的“月光宝盒”、5电浆药水；末怪先SuperHS(20)，再必得电浆药水并尝试显示entry1。SuperHS未传坐标沿用既有undefined→角色位置回落证据。
- root createThing 对“月光宝盒”没有case，走default return false，不生成物品也不调用throwGoods随机坐标；不能擅自映射“初级月光宝盒”。自然法师实战暴露正式literalItem抛错后，掉落oracle改为执行完整原createThing，而非假定每个创建都成功的stub；现代分支保留无掉落结果。
- roleRelive源为reLife后nextMap=homeCity、nextEntry=backPoint，不是固定卡萨诺。电浆药水现有消费者要求活着、30星以上、非雷幻兽，成功变雷，不为本次验收降低门槛。

## design 与验证

明确修复幻境入口/出口到原存在的entry6；记录为design，保留原异常。采用现有逻辑15Hz、暂停冻结、存档保存部分战斗，读档重置随机入场等待；同一个入场计时供卡萨诺和树心消费。

城市/幻境、完整六选择器、药店4库存、首访/随机进入、homeCity死亡和幸运之门回城、存档/raw字段现已接入。五项源oracle通过（六种生成随机、192组完整掉落、288组城市条件、NPC外观位置、八帧末帧命中及暂停），三项领域旅程/边界及独立曲线光栅碰撞通过；正式16张PNG对照、typecheck/build通过。2772复合填色/描边原始转换差0.3198，改用既有曲线分段路径后低于0.05，未放宽阈值。

浏览器第一次测试使用了不存在的shop-dialog选择器，已改为实际药店按钮；第二次两职业正常到达城市/药店/幻境，但未升级的1级装备在150战斗力敌人面前死亡，不计通过。三件装备正常升品质/60级/魔魂后，凯恩仅1战斗力，仍不足以承受150战斗力敌人；继续正常召回、选择原档自带38星嘻哈牛、分配经验球并合体，不注入数值或kill。测试误按下一页导致错过排序后的高星幻兽，已改为实际可见按钮。最终自然实战及真实清场档接续返城消费通过，详情见validation.md。

受控满包/电浆变雷/四蛋/随机入场/死亡及幸运回城三项浏览器均通过（shuxin-city-browser-attempt4.log）。首次满包提示断言误写“满”，实际为“没有空格”，修正测试文本后通过。已查看城市五NPC与43星受控奇迹龙使用掉落电浆变雷截图。

首次完整npm test发现arrive用可变entries验证动态幸运出口，会接受被修改的未知目标并抛异常；已改回正式MAP_LINKS白名单，只有幸运之门按homeCity生成明确目标，不信任可变入口。city-roundtrip及071领域共6项再次通过；完整npm test最终全通过（末组9项），check:save通过14项；日志分别shuxin-city-unit-final.log和shuxin-city-save.log。

TASK-WORLD-071已完成，本轮授权累计2/3。最终完整npm test末组10项通过；自然双职业和相邻浏览器结果/失败修复见validation.md。城市专属其他NPC服务及心湖/戈壁/野外不在本合同。
