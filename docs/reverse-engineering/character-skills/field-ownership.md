# 024 技能字段所有权

| 字段 | 所有者/恢复策略 |
| --- | --- |
| extensions.game.inventory.skills | 名称→等级；新建对应职业初始技能1级，其余未学 |
| inventory.bravery | 旧v1兼容字段，始终与skills.英勇一致；不额外累加 |
| inventory.xpEnabled / XPPower_isUsed | 独立布尔；学习震/怒首次置true；恢复不调用addSkill |
| allSkills{n}name / levels | 新存档按注册顺序写名称/等级；旧source按名称解析，兼容源sortSkills排序 |
| role_heavyDamage / frost / skillAttack / heavyHit / nonDefense / skillDefense / skillLife / skillMp | 九被动规则中的八个已存源字段，按当前等级与职业率派生写回 |
| skillAddFire | 英勇派生；原始保存没有独立键，不制造role_skillAddFire |
| XPPower_nowPower / nowExp / 六格visible | 仍为未实现raw，不受学习与恢复重算影响 |
| XPPower_maxPower / isFull | 023活动字段；学习不修改 |

schema v1 / vault v2保持。旧存档缺少skills时从有序槽里的名字解析，旧bravery拥有英勇兼容值；缺少xpEnabled时读取source的XPPower_isUsed，未定义使用false。新档对每个等级、技能身份、XP布尔和英勇一致性验证。属性只重算最大值，当前生命/魔力保存原值。升级、装备、超级球统一消费技能属性。
