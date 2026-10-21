# 023 活动字段所有权

本表扩展016的历史映射，不改写其完成记录。schema v1 / vault v2保留。

| 源键 | 活动所有者 | 恢复/保存 |
| --- | --- | --- |
| role_expBallNum | inventory.consumables.expBallNum | 直接恢复，不执行超级球 |
| role_moreExpFire/Life/Mp/Attack/Defense | inventory.consumables 同名字段 | 五项分别保留，不能由次数推算覆盖 |
| role_lifeSourseLevels / role_mpSourseLevels | inventory.consumables | 独立等级 |
| role_lifeSourse / role_mpSourse | inventory.consumables | 余额不钳制到容量 |
| role_maxLifeSourse / role_maxMpSourse | vitals最大值 × 对应储备等级 | 随属性派生，符合源最大值setter覆盖顺序 |
| XPPower_maxPower / XPPower_isFull | inventory.consumables | 容量提升只清满值，不启用技能 |
| XPPower_isUsed / nowPower / nowExp / 六格visible | source raw | 本任务不接管、不重置 |

新保存写extensions.game.inventory.consumables与对应source；旧extensions缺少该对象时读取source，只有undefined缺项补源初值。数值和容量/布尔类型由codec校验。消费不会写入静态目录或未实现source字段。

后续024接管XPPower_isUsed到inventory.xpEnabled；nowPower/nowExp/六格visible仍保持raw，详见人物技能字段映射。
