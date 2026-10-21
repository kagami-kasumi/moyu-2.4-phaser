# 人物技能学习源合同

## verified

frame_9/DoAction.as 的 useItem 技能书分支先职业（本职业或公共），再书本等级校验，调用 addSkill；成功清空整槽，不按数量减1。没有人物生命判断。

同文件21项 allSkills：12种主动/XP最大1级、8种被动最大10级、英勇最大50级。addSkill 搜索姓名，先拒绝旧等级+1超过上限，首次学习设置 studied/增加计数；震/怒首次学习将 XPPower.isUsed=true。随后写指定reLv或加1，执行 effect、刷新面板。不是调用主动施放。

九种 effect：重伤 heavyDamage=level，寒冰 frost=level，神圣 skillAttack=2×level，重击 heavyHit=2×level，破防 nonDefense=2×level，金刚 skillDefense=8×level，强健之术 skillLife=10×rateLife×level，智慧之术 skillMp=10×rateMp×level，英勇 skillAddFire=5×level；调用 flashAttribute，无当前生命/魔力回满。其他技能 effect 返回false，但addSkill仍成功。

DoAction_2.as:1567–1575 保存已学技能的名称/等级；原数组会按 studied/condition 排序，因此恢复须按保存名称而非假定槽索引代表固定技能。2034–2040 调用addSkill(name,reLv)，1724–1731先恢复八个技能数值；XP状态在之后独立恢复，不能把学习推导的isUsed覆盖已存状态。skillAddFire没有独立源保存键，来自英勇等级。

## design

inventory.skills按稳定技能名称持有等级；bravery兼容旧接口映射英勇。新建只学对应职业初始技能。inventory.xpEnabled持有XPPower.isUsed，首次学习震/怒置true；容量与充能/可见格保持独立。被动字段由等级和职业成长率派生，在属性规则接入；重伤/寒冰/重击/破防仅持有触发参数，战斗尚未接入。

技能面板采用现代列表，展示本职业和公共技能、等级/上限、技能用途及主动施放未开放提示，不提供假释放按钮。全部书的学习入口在背包。旧v1没有skills时按raw allSkills名称/等级推广（支持原版排序），初始技能/旧英勇值兼容；不重放学习、奖励或XP启用。未实现raw保留。

冻结源函数/21技能/21书与AS/P-code哈希在source-functions.json，oracle不调用正式技能实现。

DoAction_2.as:327–329 的键码86调用技能按钮；现代入口同步支持V键与Esc关闭，并阻止面板内移动穿透。
