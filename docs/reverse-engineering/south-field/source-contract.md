# 南城野外五与炎女头目源合同（083）

## verified

源SWF哈希与082一致。独立FFDec XML、Action字节、AS/P-code及源文本冻结在source-fixture.json，40张独立FFDec PNG及命令/散列在baseline。两个怪物家族沿用原选择器，恐兽技能仍8帧，炎女attackTypeNum=1只普通攻击9帧。

4536/frame63为南城野外五，entry2返回南城野外四entry1；只有行踪道具可直接进入，原useItem设置entry2，进入成功才扣数，原number=0作为单件消费后清空，同地图拒绝。四野外清场在普通掉落及四个独立额外roll后，random(10000)>9000预警5秒生成炎女头目。

bossLevels[4]初始level70/max135/moreFire0，与卡萨诺bossLevels[0]独立。头目死亡catch自身/怪物、声望+1、勇士勋章、bossLevelsUp、头目掉落；仅野外五预警10秒恐兽护卫；最后dropSoul(10)。等级1变5，低于135加5，达到135后moreFire小于270时加5。护卫和妖王使用已提升的等级与moreFire。护卫死亡声望+1、头目掉落、10秒预警妖王、魔之魂；妖王死亡对应10秒宝箱。flashBs原代码使用赋值比较，但本包唯一消费者为宝箱，保留可观察宝箱结果，不声称修复原脚本。

初始头目attack=.65+.8×1.5+.65×2×1.5，jook=5；随机flashBoss头目attack=(.65+.8×1.2+.65×2×1.2)×1.5，jook=15；护卫/妖王将幻兽份数改3。defense=.6+.75×1.2+.6×份数×1.2。全为baseLevels5、life=51×12×(level+5)，坐标240,370；attackFire=floor(moreFire+level×2+护卫10/妖王20)。距离150/30再按源顺序随机，速度8/4、stopRate150。

宝箱使用既有原luckyBoss完整奖池，生成在人物位置；真实奖品与地面落点随机顺序复用已验证finaleChestDrops。未开启、已开启、预警与各波保存是现代持久扩展，不在重载时重抽。

## design 与边界

新增独立southField状态和每波生成种类/冻结moreFire，原存档bossLevels4levels/moreFire按字段迁移；未知原始数据继续opaque保留。规则时钟、命中与呈现解耦。离场取消未结算回调；重载保留生命与随机距离但取消瞬时动作。

不扩展南城产权、边关或社交；不把其他区域产权当成南城资源收益。083接通082曾明确封闭的四野外清场头目消费者，082当时的限制属于历史交付边界。
