# 背包使用与装备 · 源合同

源为只读魔域2.4.swf（哈希沿用原清单）。定位均相对 `local-resources/moyu/source-index/as/scripts/`。冻结源函数和 AS/P-code 哈希见 `source-functions.json`；离线 JavaScript oracle 使用显示对象替身，不冒充原 Flash 动态运行。

## verified
- 根帧9 useItem:196：背包中的四类装备、幸运符、戒指交 equipment.setThing；成功后才清源槽。装备槽物品在背包打开时回包，满包可掉落。equipment.setThing:1863 先验证四类装备职业和等级，戒指无等级/职业门槛；旧装备先 backPack.setThing，再装新件，最后清源槽。因此满包换装不能提前清源槽来避免掉落。
- equipment.flashAttribute:1987：四类装备基本/魔魂攻击防御叠加；全四件魔魂均正才计套装最低魔魂战斗力。品质战斗力为 grade+1。戒指只计两个主属性和前 grade 个副属性，grade0 不启用 attack10 等副属性。RoleMC.flashAttribute:1120 在成长基础与装备平值后乘百分比并四舍五入；男战士成长为生命15、魔力5、攻击0.2–1.8、防御0.3（原UI details-source 的 warrior）。
- useItem:350–362 货币袋/富豪礼包增加 salePrice 魔石，然后扣一份。1317–1358 三种礼包先逐个 createThing 十次，再扣礼包；产物分别是灵魂晶石/幻魔之心/魔魂之心，createThing:4585–4607 为宝石、number1、售价100/200/150。满包仍消耗，已入包与掉落均保留。
- useItem:363–615 的普通幻兽蛋将字面量初始记录加入幻兽背包；容量40失败不扣蛋，成功扣一份。初始wudi裸物品number被旧槽归零，扣后<=0仍正常移除。新孵化不自动出征，初始凯恩仍出征。
- 技能书:936 先验职业公共/本职业与等级；roleSkills.addSkill:2748 重复学习提升等级，达到maxLevels才拒绝。英勇max50，每级skillAddFire=5；初始斩魂已学，英勇未学。
- 勇士勋章:1307 先增加功勋100和军功100，再扣一份。RoleMC.exploitUp/militaryExploitUp 上限38500/36000，晋阶阈值见冻结函数；爵位每阶战斗力3，军衔setter只设置称号，不能臆加战斗力。

## design / 边界
使用按钮、装备栏、属性卡采用现代HTML，并沿用原HUD与现有图标。未开放的地图、打造、经验分配、社交等道具提示原因且不消耗。装备外观动画、技能施放、幻兽跟随和战斗不由本任务假造。使用事件携带原物品身份，拒绝过期按钮；这属于现代输入保护。原始提取物不改写。
