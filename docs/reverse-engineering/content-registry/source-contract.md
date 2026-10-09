# 全量注册源调查 · TASK-DATA-015

本文件保留拆分前调查历史，旧数量/进度描述不作为当前调度依据。2026-10-07身份与引用的最新验收见[身份验证报告](identity-validation.md)及[逐类覆盖](identity-coverage.json)。状态唯一来源为任务state.json；数值语义、持久字段与运行时迁移分别由017/018/019/020继续承担。

## 范围与证据

- 原SWF SHA-256：`f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`，AVM1/AS2。源脚本根为`local-resources/moyu/source-index/as/scripts/`；对应P-code根为`local-resources/moyu/source-index/pcode/scripts/`。
- **verified**：734个原导出AS脚本哈希逐一与原`extraction-manifest.json`一致。`object-census.json`是跨全部脚本的对象候选清点，不是物品表；包含任务、怪物、UI事件及测试物体，必须分类。
- **verified**：地图sprite4536的165个原SWF FrameLabel与AS的allowJumpMap名称、帧号逐项一致；前两帧为初始化，不当作地图。由`node tools/check-registry-source-survey.mjs`直接读原SWF验证。
- **verified**：物品工厂位于根frame_9/DoAction.as的createThing，156个赋值分支、185个case名称。静态默认值由此前独立冻结的inventory/source-functions.json中的完整函数oracle核对。相邻case不总是别名：转世水晶/幻兽转世水晶共用同一结果，地图卷轴则保留各自type。
- **verified**：任务定义位于DefineSprite_2210_任务系统/frame_1/DoAction_2.as，共33主线、24支线容器记录、9挑战、14日常容器记录；以实际数组归属为准，不能用描述中的type代替容器归属。同名新手任务拥有职业奖励分支，不能去重。
- **verified（数量）**：map初始化npcState有60项、root roleSkills.allSkills有21项。当前独立检查核对表声明数量；不据此声称所有动态分支数值已解释。
- **design**：注册ID含类别与源身份，任务保留源数组组名及索引；内容注册与功能可用性分开，所有新记录初始仅registered。原type/name字段保留，ID解析不修改原序列化值。

## 已发现的源异常

1. **verified（静态重复键）**：frame_9/DoAction_2.as:1772的幻兽恢复对象连续三次使用nextLvRate键，后两次值来自存档sd/qyg。P-code:16109–16139同样有三个`Push "nextLvRate"`，故不是仅AS格式化错误。具体AVM1重复键覆盖行为尚不在本次静态核对声明内。现代存档应分别保留nextLvRate、sd、qyg，作为design修复，不能无说明照搬字段损失。清点器将此对象保存在unparsed及原文本中，绝不静默丢弃。
2. **verified（源引用/工厂不匹配）**：地图frame30调用createThing(月光礼包)，map frame1:81引用月光宝盒，NPC frame1:4849调用createThing(30点声望)，但createThing无这些case。注册记录标记referenced-without-factory-case，不能擅自等同初级月光宝盒或发放声望。其调用语义和最终处置仍需分类审计。
3. 装备不全部经createThing生成。两职业各4个9名数组共72个装备名称，以及戒指、幸运符、铃铛等直接对象生成，必须作为独立来源纳入。随机属性保留表达式/生成条件，不取一次随机结果当固定数值。

## 当前工具与限制

- survey-content-registry.mjs：定向表/工厂/地图/怪物初始化和存读档访问点调查；source-survey.json保留未求值表达式。
- census-content-objects.mjs：全部734脚本的独立遍历入口，记录2076个身份对象候选及1个重复键对象；结构值解析与survey共享工具，不能冒充独立数值oracle。
- build-content-registry.mjs：生成正式src/content/registry-data.ts；当前911个记录中165个地图静态记录已逐字段对照原SWF/源码，标verified并明确evidenceScope；另159条静态声明（60 NPC、6建筑、21技能、72装备名称）经独立执行原声明逐字段对账后确认；其余587个仍标inferred，不能整体提升。地图验证覆盖身份、帧号、字面出口与NPC引用，不代表通行条件或玩法完成。已包括建筑、首领成长、任务目标和奖励指令。
- registry.ts：稳定身份查找、原type/name兼容解析及仅限字面工厂模板的构造；不会执行原AS表达式。原始源和调查文件不由运行时导入。
- `npm run inspect:content`提供只读统计；可加`-- --kind pet --name 奇异兽`或`-- --id quest:mainTask:0`查询完整记录、来源与可用性。精确名称允许多个结果，避免隐藏同名任务分支；找不到返回非零退出码。该入口只读正式目录，不要求本地SWF文件。
- 当前赠送/兑换字面模板已接入，地图资源清单核对注册的名称和帧；装备名称及属性规则已迁移，49种字面幻兽蛋初始化从注册表读取，奇迹龙的随机初始化仅注册，不扩大现有可用操作。其余数值、数据迁移和引用核验仍待完成。
- audit-content-references.mjs：2076个对象候选已分类；动态名称按源位置和表达式匹配生成域，无未分类或缺失目标。数值生成边界仍需另行验证，身份解析通过不等于机制完整。
- catalog-numeric-rules.mjs：9611条赋值/返回记录保留输入、函数和分支，仍为逐模块语义核验索引，不是最终数值合同。
- catalog-persistence.mjs：653个持久键模板已按所属对象记录正常源状态的类型证据，包含可缺省字段；这不是损坏存档的输入验证结论，也不能将构造器种子当成最终默认值。ThingMC的46个数值属性对应323个存储键，已结合SWF槽位绑定及原getter/setter确认缺失值语义。其余副作用与默认值继续核验，详见[persistence-contract.md](persistence-contract.md)。
- 角色货币开局实际值勘误为各1亿：源wudi写入10亿经RoleMC setter限幅，原测试替身漏算setter，现已接入冻结的原访问器核对。
- 新手戒指种子改为消费注册模板，抽样池与主属性数值进入ring-rules.ts。20160种抽样组合逐一与独立冻结initNewGame/upDataWeapon比对；结婚戒指登记14位对象的主属性对、允许重复的4个分支、随机副属性的上下界及源生成条件，并验证28个端点实例。未知配偶分支仍标为源未赋主属性，不能伪造默认搭配。debug中的随机结婚戒指与正常婚姻生成器分别保留规则。

## 已实际执行的阶段检查

- `npm run check:registry-survey`：结构解析、访问器语义和持久字段核验9项通过，加上源全集对账。
- `node tools/check-registry-source-survey.mjs`：734脚本哈希、165地图标签帧、任务/NPC/技能声明数量通过。
- `node --experimental-transform-types --test tests/content-registry.test.ts`：7项通过，含独立冻结工厂oracle、同名任务分支、6384组装备边界组合、货币setter和戒指生成域。
- `npm run typecheck`通过；最新`npm test`65项全部通过，包括49种已支持幻兽蛋与冻结useItem比对。
- 源解析工具新增后`npm run check:source`5项和原SWF清单检查通过。
- 最新npm run test:browser完成构建并27/27通过；实际查看.evidence/original-ui/native-backpack.png，两项货币均为100,000,000，布局正常。修正了货币旧断言与兑换回收用例中随机鞋子和宝盒重叠的不稳定测试条件。上述检查不证明全量数值语义、持久化字典或任务完成，后续迁移仍需按改动复验。
