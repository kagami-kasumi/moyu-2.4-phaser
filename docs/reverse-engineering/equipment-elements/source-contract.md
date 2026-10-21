# 装备元素源合同（TASK-EQUIP-031）

verified：SWF8/AVM1。冻结与哈希见 source-functions.json；打造消费复用既有 equipment-magic 冻结，不改原提取物。完整 equipment.init/flashAttribute 独立冻结用于源 oracle。

- frame_9/DoAction.as:3779–3910：风/火/水/地首次附加各10声望，雷25；element须为0。小/大石 grade>=4，四项元素值均严格小于levels。小石一次 random(4)，顺序火/风/地/水；大石全部+1。元素石不要求已有元素。随机在消费前，成功按钮最后重算。数量0按源单件语义消耗。
- P-code约15245起：Push 4 / RandomNumber，四分支 Add2 后 useGem；大石四次加1，四个Greater/Not门槛与AS一致。五附加分支分别检查和扣除xxx_credit。
- 2050–2078、2182、2230–2255：每件普通元素+1战斗力，雷+2；四件同元素触发套装。风闪避15；火攻击30%；水暴击15；地防御50%；雷闪避10、攻击25%、暴击10、防御40%、生命和魔力30%。单件四项数值聚合，品质最低值由upDataWeapon维护且不降低更高值。
- DefineSprite_4536/frame_2/DoAction.as:54通用wudi赠送4雷元素，:32 debug另送5。纠正原合同“普通新建缺材”假设。其他六材料已注册但未新增获取；受控测试不冒充自然获取。
- 法师礼包旅者装缺少element等字段；保留原对象，真实UI用魔魂之心成功重算后再附加。不将undefined擅自等同于0。

design：复用共享打造槽和版本化回调；现代文案按执行门槛显示极品（原flashInfo文字与执行条件不一致）。人物面板展示元素、套装、暴击、闪避。战斗结算未实现，不宣称已验证元素伤害。
