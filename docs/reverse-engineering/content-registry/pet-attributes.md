# 幻兽派生属性

生命setter先忽略NaN，编码写入后比较是否超过maxLife，否则才比较是否低于0。maxLife单独变化不会夹取现有生命；负maxLife会暴露上述分支顺序，不能直接替换为通用clamp。maxLife、burst、jook、wind、soil、fire、water、reduceDamage、minAttack、maxAttack、defense均仅拒绝NaN并编码，没有本地上下限或取整。tests/pet-vital-accessors-source.test.mjs以恒等编解码替身核验这些控制流；不声称验证实际编码算法。

HuanShouClass.as:1255 moreAttribute每次先清零四项百分比加成，再按element赋值。完整元素表见src/content/pet-attribute-rules.ts，列顺序为生命、最小攻击、最大攻击、防御。未知元素不匹配任何分支，保持零。

铃铛仅在battle为真、type非undefined且非“空格”时生效。最多处理三个槽，槽号从1开始，grade-slot<-1即停止；通常品质0/1/2分别生效1/2/3槽。属性类型1加防御，2同时加最小与最大攻击，3加生命。加成与元素相加，无额外百分比上限。

1309行flashAttribute先调用moreAttribute，再按round(rate*(levels+5)*(1+bonus*0.01))计算生命上限、最小攻击、最大攻击及防御。测试覆盖全部六种元素、五档品质、出战/未出战组合，以及小数成长的取整结果。下游setter内部行为与实际战斗伤害不在该验证范围内。
