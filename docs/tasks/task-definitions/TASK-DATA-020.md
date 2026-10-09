# TASK-DATA-020 · 既有玩法注册迁移与基础集成验收

## 目标
完成既有玩法对统一目录的迁移，关闭全量注册基础的综合验收。

## 输入
- 直接依赖 TASK-DATA-019；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- 015/017/018/019的目录、规则、持久字段与报告；现有 src/content、src/domain、场景及 tests/browser，旧015检查点保留的迁移成果。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
只迁移现有物品、装备属性、赠送/兑换、地图切换和已实现数值，复用已迁移部分；运行时不引用 local-resources 或 .evidence。整合覆盖差异和规则消费者；不新增物品效果、战斗、职业入口或存档。

## 输出
现有实现统一目录接入、完整注册覆盖及浏览器/视觉验证报告；允许下一阶段角色与存档消费。

## 验收
原015的全量门禁由本项承接：npm run check:content-registry、npm run typecheck、npm test、npm run build、npm run test:browser；实际检查受影响画面，既有行为回归、ID/别名/引用及全部数值/持久字段合同均通过。综合门禁失败定位到原归属修复，不降低门禁或掩盖未知项。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分

### Ready有界输入（2026-10-08）

- 选择理由：019已关闭653个键模板与927移交ID的持久语义；按主线下一步仅集成既有玩法与完整注册门禁，不提前开发角色入口或存档。
- 精确输入：`persistence-schema.md`、`persistence-validation.md`、`persistence-survey.json`、`restore-matrix.json`、`persistence-coverage.json`；正式`persistence-registry-data.ts`、`persistence-schema.ts`、`persistence-repairs.ts`。019的42项专项与71逻辑通过，恢复异常设计处置已接入`tools/check-content-registry.mjs`。
- 实测综合差异：直接运行上述checker返回exit1：旧`numeric-rule-index.json`仍有8716/9611条非reviewed-module；`reference-audit.json`标签为classification-audit-in-progress。应消费017的2461条和018的7150条互斥并集，再以019的927条精确ID处置闭合持久部分；用独立集合与负向测试确认全覆盖，不能仅把旧索引或审计标签改完成。
- 现有迁移有界入口：`src/domain/npc-reward.ts:33`仍内联凯恩种子；同文件已消费literalItem、ORIGINAL_START_GRANTS和货币/戒指规则。`src/domain/inventory.ts`已消费ITEM_PETS，`equipment-attributes.ts`已消费EQUIPMENT_RULES/contentOfKind，`slice-manifest.ts`已消费contentNamed。从这些实际消费者追踪剩余重复常量/ID引用，复用已迁移结果，不重做全部内容。
- 源锚点：frame_9/DoAction.as的delivery、物品工厂、equipment.flashAttribute与roleSkills.effect；地图frame2的initNewGame/wudi；RoleMC.flashAttribute；019完整readGame矩阵。沿用各模块独立source oracle，补实际迁移的消费者测试。
- 验证：原验收全部保留；新增`npm run check:persistence`；结合`check:role-item-rules`、`check:pet-world-rules`和`check:content-identities`证明综合映射不弱化既有证据，实际检查受影响浏览器截图。build大chunk警告是现有非失败提示，未作为019完成缺口。
- 范围边界：幻兽重复键源行为仍unknown，现代分离三键是design；018的form/空lover/悬空建筑路径不因通过注册门禁而变成已修复玩法。完成后补齐021角色入口合同并置Ready。

2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。
