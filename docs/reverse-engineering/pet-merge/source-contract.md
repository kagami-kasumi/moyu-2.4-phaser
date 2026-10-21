# 幻兽合体源合同

## verified
- frame_9/DoAction.as:2514–2578 完整 battle/inOne：召回先解除合体，再关闭出征；inOne 对 life<=0 强制 false，否则取反。合体本身不改变 battle、生命或魔力。
- DefineSprite_4556/frame_1/DoAction.as:10–69、346–363：仅出征按钮显示合体入口；flashView 先重算幻兽/面板属性，再依 inOne 隐藏或显示身体。面板三属性来自幻兽（包含槽位铃铛）；评分和铃铛额外战斗力不受合体影响。
- RoleMC.as:1120–1183：人物基础、装备、百分比及取整完成后，逐一消费三个开放面板。inOne 增加 minAttack/maxAttack/defense；所有开放面板增加 attackFire。不增加生命、魔力上限。
- HuanShouMC.as:90–107、422–432：reBattle 只隐藏身体；死亡先调用 inOne，再设置非存活，仍保留出征。正常受击在 life<=0 时调用死亡入口。

## design / 边界
收藏详情提供合体/分离；回调检查面板会话、所选对象和 revision。属性通过实时槽位读取，成长/称号/铃铛改变无缓存过期。
旧档 inOne=true/life<=0 不在加载时擅自清除：源属性循环仍按 inOne 叠加，显式点击则按源清除；未出征的 inOne 保留但不产生收益。身份重复/槽位归属未知拒绝切换。领域死亡入口仅供后续真实伤害链调用，本任务不开放模拟战斗。
随行标识是现代设计，合体隐藏；战斗伤害转移与技能不在此合同。哈希见 source.json；源函数独立执行见 tests/pet-merge.test.mjs。
