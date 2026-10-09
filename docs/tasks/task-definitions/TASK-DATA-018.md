# TASK-DATA-018 · 幻兽与世界数值规则包

## 目标
交付幻兽、敌人和世界内容的数值规则，补齐全量数值目录。

## 输入
- 直接依赖 TASK-DATA-017；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- docs/reverse-engineering/content-registry/numeric-rule-index.json、pet-*.md、quest-dispatch.md、buildings.md、friend-*.md、merit.md、miracle-dragon.md；src/content/ 中对应规则；源索引定位幻兽类、敌人初始化、任务生成/派发、地图/NPC及关系入口。激活时补齐精确锚点。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
覆盖幻兽初始化/成长/评分/重置、敌人和技能剩余数值、任务条件/奖励/概率、地图/NPC/建筑/关系及其他尚未归017的数值。只交付规则与语义，不实现战斗、幻兽界面、任务链或地图玩法。先按源模块列明剩余集合，不能因调用链无限吸收行为实现。

## 输出
幻兽/世界规则模块与独立oracle、全量数值语义覆盖报告；017与本项合并覆盖全部索引记录，排除非数值记录也须给理由。

## 验收
逐模块核对输入、条件、默认/异常、输出与生成边界；确认017/018归属并集无遗漏且交叉公式只有一个权威定义。运行 npm run check:registry-survey、npm run typecheck、npm test；源语义报告不可用结构数字清单代替。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分
2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。

### Ready有界输入（2026-10-08）

- 选择理由：017之后必须完成同一基础线的幻兽/世界数值，再进入019持久语义；不提前恢复逐物品玩法。
- 017移交：`role-item-coverage.json` 的deferred逐条ID（7150条；其中898条已识别持久赋值直接归019，其余6252条由018继续按模块细分，包括剩余表现/控制记录）。此数不是待实现玩法数量，不能整体标reviewed。017已认领2461条，018综合报告须与它互斥并覆盖原9611条索引。
- 精确源入口：`__Packages/HuanShouClass.as:1189 checkUp / :1309 flashAttribute / :1392 reset`；`__Packages/HuanShouMC.as:305 byAttack / :433 expUp`；`__Packages/MonsterMC.as:349 byAttack`；`DefineSprite_4536/frame_1/DoAction.as:491 initMonster / :635 monsterDeath / :1819 dropItem / :2546 encounter`，以及该地图frame2的bLife等敌人基数。根`frame_9/DoAction.as:363–935`幻兽孵化与`:1002–1306`地图使用分支。已有pet/quest/building/friend模块只补差异。
- 共享定义：017的`equipment-generation-rules.ts`定义五族物品生成数值；018只定义敌人调用条件/掉落频率。`role-skill-rules.ts`定义角色伤害数值，不得假定MonsterMC/HuanShouMC完全相同。codec沿用`numeric-codec-rules.ts`；面板传给角色的合体数值由018确认，不能复制角色总和公式。
- 已知异常：装备附加分支`thisallItem`经P-code确认是GetVariable路径，静态路径错误与有效AVM1结果分开记录；019的幻兽恢复异常仍未解决。018不能把它们隐式修复或关闭。
- 专项：`node --experimental-transform-types --test tests/pet-attribute-source.test.mjs tests/pet-score-source.test.mjs tests/pet-generation-source.test.mjs tests/pet-experience-source.test.mjs tests/pet-reset-source.test.mjs tests/pet-numeric-accessors-source.test.mjs tests/pet-vital-accessors-source.test.mjs tests/enemy-initialization-source.test.mjs tests/quest-generator-source.test.mjs tests/quest-dispatch-source.test.mjs tests/building-source.test.mjs tests/friend-fields-source.test.mjs tests/friend-relation-source.test.mjs`；再执行本合同既定门禁。新增数值语义仍需独立源期望。
