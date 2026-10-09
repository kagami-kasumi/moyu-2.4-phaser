# 幻兽转生与进化

lifeLv只读显示：nowLifeLv为1显示二代，2显示三代，大于2显示N代，其余空串。GodName在isGod==true时显示神使，其余空串。读取这两个标签不会推进代数或改变神属性。

HuanShouClass.as:1317 turned仅在zs<maxZs时增加转生次数。只有当前等级严格高于oldLevels，才替换旧等级、旧经验及旧阈值；同级不更新旧经验。随后等级置1、经验0、阈值floor(levels*9)。该函数本身不刷新生命和派生属性。

1333行lifeLvUp要求mainFen至少6000，奇迹龙豁免分数条件；nowLifeLv>=2一律拒绝。成功先增加代数，四项属性分别判断max*Fen是否正数：主属性的当前成长与最高成长乘nextLvMain、最大评分加1000；非主属性仅当前成长乘nextLvRate。之后调用turned，再增加maxZs 50和rareFen 500。因此已达到旧转生次数上限时，此次turned不加次数，随后才扩大上限。

正式规则src/content/pet-generation-rules.ts，源执行测试tests/pet-generation-source.test.mjs覆盖四项属性16种主副组合、奇迹龙低分豁免、分数不足/代数封顶拒绝，以及旧等级高于/等于/低于当前等级的记录策略。倍率取自实例字段，不将fixture的1.5和1.3误称为全部可能输入。属性setter和后续刷新仍按其各自证据范围处理。
