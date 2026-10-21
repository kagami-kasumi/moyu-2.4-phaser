# 皇宫与元帅源合同

verified：4536/frame10 entry3→皇宫entry2；frame13 entry2→城二entry3。皇宫落点(42,411.6)，返回城二(527,108.5)。frame13完整脚本将区域设为安全区，设置东宫/花园出口；无homeCity赋值、音乐切换或首次奖励。碰撞为2801→2800，单位矩阵；背景4331。元帅(200,200)、PK报名官(430,300)、抽奖箱(100,350)，国王仅在接应国王任务isComplete=true时出现(320,250)。4308帧22/28/33/55分别投影4263/4267/4275/4299；56为公主4301，仅作为额外保留图像；npc01及npc04的Y缩放65512/65536。

verified：4312 cmd171依据chaw/militaryRank分别开放魔石/装备捐献，零等级提供爵位/军衔任务。社交关系提升分支优先于通常菜单；完整菜单冻结于source-functions.json。本任务不实现社交和任务，明确提示未开放。国王任务尚无可验证现代运行状态，原始任务字段继续由raw持有，不推测完成、不显示国王；国王图像4275保留供后续。

verified：cmd181/182/183先spendMs(200/1000/5000)，成功后exploitUp(100/500/2500)。达到功勋上限38500仍先扣魔石。testDonate/weaponDonate接受头盔、衣服、武器、鞋、庇护铃铛、翡翠铃铛、凤翼铃铛；品质0..4奖励50/100/150/200/400，品质5、6走default奖励0。确认后整件setThing为空格，包含正数量物品。军功达到36000仍消费装备。原军功/功勋提升函数四舍五入奖励、封顶、只升不降，已在上限时直接返回。等级晋升沿用MERIT_RULES累计阈值。

verified：RoleMC xxx_militaryRank设置名称，1..10不重写militaryRankFire，0/default清零；旧存档恢复最后会以保存的militaryRankFire覆盖setter。军衔有独立状态，不能因余额推断改写显式旧等级。

design：新PalaceDonation领域对象拥有会话与确认；候选装备始终保留背包原槽，确认核对对象身份和全字段指纹，取消、切图、新建、旧按钮不可扣款。未知类型/品质拒绝；已注册品质5/6保留原消费并明确零奖励。魔石增加确认步骤。现代菜单合并服务说明，不重制原始粗糙UI。

design：GameProgress.inventory拥有militaryRank/militaryRankFire，原始role_militaryRank/name/fire同步输出。旧extension缺字段时优先恢复raw显式军衔；仅raw缺失时根据既有军功恢复已实现勋章产生的晋升。原始军衔不在0..10时拒绝读取而保留文件。新建归零。其他未实现任务/社交原始字段不由本任务修改。现有爵位归属继续由nobilityRank/chaw消费；爵位战斗力沿用既有规则。

独立证据：source-fixture.json由FFDec source.xml枚举完整显示列表、NPC帧、ground子时间轴和Action哈希；source-functions.json冻结AS/P-code源哈希及原函数。baseline通过FFDec26独立导出；check:palace重新从SWF转换，验证正式产物与独立PNG，六图像素完全一致，地面抗锯齿平均预乘RGBA误差0.008465。转换器不执行AVM1。
