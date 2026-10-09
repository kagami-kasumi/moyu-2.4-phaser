# TASK-DATA-017 · 角色与物品数值规则包

## 目标
交付角色、装备及物品的完整数值规则目录和可消费规则模块。

## 输入
- 直接依赖 TASK-DATA-015；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- docs/reverse-engineering/content-registry/numeric-rule-index.json、source-bindings.json、role-*.md、resource-consumption.md、item-field-semantics.json；src/content/role-*-rules.ts、equipment-rules.ts、ring-rules.ts；源 RoleMC、ThingMC 与根物品/装备工厂。激活时按索引补齐精确函数锚点。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
覆盖角色等级/属性/货币/转世/XP、装备等级品质强化、戒指及其他物品生成、价格/消耗/概率与相关技能数值。验证常量、表、公式输入条件输出及边界；不开放升级、战斗或新物品效果。幻兽/敌人/任务/地图/NPC/建筑/关系数值归018，持久读写归019。跨域共享公式只定义一次并登记消费者。

## 输出
角色/物品规则模块、分类语义报告及独立源oracle；给020迁移和后续机制包消费。

## 验收
本域索引记录逐条有语义归属，常量与动态表达式不混淆；生成族、等级阈值、概率端点、访问器限幅和源异常有独立期望。不得把全部索引批量标 reviewed-module。激活时列明本域记录集合和对应 tests/*-source.test.mjs 专项命令；执行 npm run check:registry-survey、npm run typecheck、npm test；报告本域剩余项与跨域归属。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分
2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。

### 激活输入与有界调查（2026-10-07）

- 015交付：docs/reverse-engineering/content-registry/identity-validation.md、identity-coverage.json及正式911条目录。角色/物品身份无需重新全量取证。
- 精确入口：__Packages/RoleMC.as:190/287生命魔力访问器、:670等级、:1120 flashAttribute、:2159 expUp；__Packages/ThingMC.as:125等级访问器；frame_9/DoAction.as:196 useItem、:4308 createThing、:5232 upDataWeapon。根函数中的幻兽分支只交018，不在017实现。
- 差异清单以numeric-rule-index.json中source+scope+semanticStatus为准：RoleMC当前720条中236已reviewed-module、484待复核；ThingMC153条中149已reviewed-module、4待复核。根frame_9混有角色/物品和其他域，执行时按函数/分支精确分配，不能整文件认领；保存读取函数归019，纯表现记录单列排除理由。此处计数是激活快照，不是全域完成率。
- 复用已核验role-*.md、item-field-semantics.json及装备/戒指证据；优先补角色派生属性和物品公式消费者的语义缺口。017负责共享规则定义，018负责其幻兽/世界调用条件，不复制公式。
- 角色专项命令：node --experimental-transform-types --test tests/role-experience-source.test.mjs tests/role-progression-source.test.mjs tests/role-vital-source.test.mjs tests/role-rebirth-source.test.mjs tests/resource-consumption-source.test.mjs tests/xp-energy-source.test.ts；物品专项：node --experimental-transform-types --test tests/item-field-registry-source.test.mjs tests/parameter-item-source.test.mjs tests/ring-registration-source.test.mjs tests/bell-registration-source.test.mjs tests/lucky-charm-source.test.mjs tests/content-registry.test.ts。新增语义需增加独立源期望，已有测试不等于整个域已完成。

### 本次执行集合（2026-10-08）

- 精确归属与生成入口：`tools/lib/role-item-coverage.mjs`、`docs/reverse-engineering/content-registry/role-item-coverage.json`。认领2461条索引（RoleMC 720、ThingMC 153及精确根函数/物品/角色面板/五族装备生成记录），另登记2389条控制、返回、调用和增减语句；没有将原索引批量标为reviewed-module。
- 分支边界：根useItem的幻兽孵化/幻兽药品与地图分支交018；createThing中的幻兽蛋**物品价格**仍属017。地图frame1只认领角色初值和装备/物品生成函数，frame2敌人基数bLife等不认领。存取赋值归019。
- `npm run check:role-item-rules` 汇总上述专项与六个新增source测试文件，检查逐值源对账、模块行为、生成族随机调用序列、材料/阈值边界及源异常。声明目录可供后续实现消费；其中表达式不可eval，不代表未开放效果已经实现。
- 分类结论、消费边界与验证结果见 `docs/reverse-engineering/content-registry/role-item-validation.md`。
