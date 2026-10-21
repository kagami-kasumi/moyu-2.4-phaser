# 卡萨诺野外终章源合同

verified：4536/frame4野外四四只龙怪精英，level8、base0、HP51×4×8=1632，位置125/385、475/355、115/265、245/290；蓝色名称6724095，警戒200/100，移动4/2。完整精英掉落共享鹿角兽精英分支。entry2返回野外三entry1；entry1指野外五entry1但XML alpha=0，jumpToMap拒绝透明入口。保留关闭，不能以地图相邻推断可走入。

verified：根frame9的使用函数中龙怪头目行踪，在当前地图不是野外五时直接传送野外五entry1，再number减1，≤0清槽；同图无效不消费。源UI物品2049提示双击使用。完整来源为普通/精英怪5%附加掉落，未实现的元帅军衔支线不冒充已开放。本包接通该现有掉落的消费入口。

verified：野外五4536/frame3只有entry1(539,406.6)返回野外四entry1。初始头目level L=ledger.bossLevel、scale=L+5：L<30时HP51×8×scale，攻击(.65+.8+.65×2)×scale，防御(.6+.75+.6×2)×scale，jook5，attackFire=2L；L≥30时HP51×11×scale，攻击(.65+.8×1.1+.65×2×1.1)×scale，防御(.6+.75×1.5+.6×2×1.5)×scale，jook5，attackFire=floor(moreFire+2L)。该初始头目不同于其他图随机头目10倍HP/1.5攻击/jook15。

verified：头目死亡catchThing/声望+1/勇士勋章/bossLevelsUp/完整头目掉落后，野外五预警10秒鹿角护卫，再dropSoul10%；护卫死亡catchThing/声望+1/完整头目掉落/10秒龙王/dropSoul10%；龙王同序但10秒宝箱。只有首头目推动boss成长，新后继读取成长后的等级和moreFire。

护卫与龙王flashBoss：scale=ledger.level+5、HP51×12×scale、speed8/4、stop150、guard400/150、jook15；护卫鹿角兽动画、红名，攻击(.65+.8+.65×2×1.1)×1.5×scale、防御(.6+.75×1.1+.6×2×1.1)×scale、attackFire=floor(moreFire+10+level×2)。龙王龙怪动画、16763955名，攻击(.65+.8×1.1+.65×2×1.1)×1.5×scale，防御同护卫，attackFire加20。均原初始化随机距离/朝向。

verified：flashBs仅本包宝箱调用；原`if(bs.type = "宝箱")`为赋值，npc06在回调时角色位置appear。4312 cmd21→22执行完整luckyBoss后disappear，不能重复领取。普通宝箱外观4308/frame23→4263，继承4312 npcPic矩阵。奖励全部throw在宝箱位置，创建和地面偏移随机同步：先random3选灵魂晶石/魔魂之心/幻魔之心，再random2选9朵玫瑰/极品玉石；25%选五高级奖，25%选五宠物，5%选五稀有奖。该高级减伤害宝石val1=5，与通用工厂8不同；保留调用参数。

verified：mainTask6（两职业共享）四龙怪精英，奖50极品玉石+50束9朵玫瑰，源领奖逆序且循环逐件createThing，不把50当一次构造。完成激活mainTask7消灭强盗，远区仅保存旗标。

design：15Hz及暂停沿用064，10秒预警150逻辑tick；保存明确波次kind/初始化参数/预警目标及宝箱坐标/已开启，取消动画命中暂态但不重发奖励。背包为行踪与地上物品提供明确使用/拾取按钮，与原鼠标入口等价。未开放邻区和技能继续明确说明。原透明入口不改为可见普通出口。

存档design补充：当前combat快照完整拥有bossKind/moreFire、预警目标、宝箱状态；在保留其他未知扩展时，不能递归继承旧战斗快照中已经消耗的字段。连续读取预警→出现后继→再保存以及离开终章回到普通波次均进行真实封装往返验证。
