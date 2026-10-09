# TASK-DATA-019 · 完整持久字段与恢复语义合同

## 目标
交付可供存档实现直接使用的完整字段schema、恢复次序和未实现内容保留合同。

## 输入
- 直接依赖 TASK-DATA-018；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- docs/reverse-engineering/content-registry/persistence-contract.md、persistence-survey.json、restore-remaining-fields.md；src/content/persistence-registry-*.ts、preserved-value.ts；源 frame_7/8、frame_9/DoAction_2.as 保存恢复链、ThingMC/RoleMC及源绑定的各对象访问器。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
逐字段确认类型、缺省、最终初始化值、条件、归属、引用、读写语义与setter副作用；划分临时/持久/派生状态，明确恢复次序与源异常的design修复。全量未实现内容保留方案及schema可表示性在此闭合；不开发存储适配器、选角色UI或新玩法。

## 输出
完整持久化字典、正式字段注册与数据表示类型、恢复矩阵、未来状态保留规则和验证报告，交给016。

## 验收
每个源持久键模板都有映射、默认依据与恢复策略，不把类型确认视为完成；未实现内容可表示且值往返无损，不能静默过滤。运行 npm run inspect:persistence、node --test tools/persistence-review.test.mjs tools/persistence-coverage.test.mjs tools/external-save-access.test.mjs、node --experimental-transform-types --test tests/preserved-value.test.ts、npm run typecheck、npm test。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分
2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。

### Ready有界输入（2026-10-08）

- 选择理由：018的数值和调用边界已经落盘，下一步是将完整持久字段及恢复语义闭合，之后才允许020统一接入；不跳到存储适配器或新玩法。
- 018移交 `pet-world-coverage.json` 中group=`persistence-handoff`的927条ID（含原898条及29条新增文件选择/预读记录），仅确认归属，不表示持久语义已通过。仍以 `persistence-survey.json` 的653个键模板及原始读写全集为字段范围；数值记录和键模板不是一对一。正式表达式不可eval，读取位置/源语句用于独立核验。
- 精确入口：`frame_9/DoAction_2.as:367 saveGame`、`:1687 readGame`；`:1638–1683`幻兽长度上限及字段写入，`:1768–1776`清空/重建幻兽，`:1772–1773`三次nextLvRate重复键；`:1478`建筑保存与`:1944`建筑恢复。`frame_8/DoAction.as`预读职业/姓名；`DefineSprite_4233/frame_1/DoAction.as`读取saved/saveTime并选择文件。相关P-code只读消歧，不按JS重复键规则推定AVM1。
- 已确认数值输入：017角色/物品模块与018幻兽/世界模块；幻兽构造先初始化种子/成长再checkUp并补满生命，源不从输入life恢复；评分/最大值与当前值写入顺序须在恢复矩阵中明确。建筑needMainLevels升级后变化却未在原save保存，源reset也不恢复它，现代保留政策须标design。
- 已知缺口：重复nextLvRate错误不能导致sd/qyg丢失；保留nextLvRate、sd、qyg各自键并明确导入/恢复策略。缺失、undefined、0、NaN、Infinity、空洞、未知内容及未来字段须覆盖往返，不能仅依赖已有读取类型审查。不得把018的form/空lover/建筑悬空路径异常算成已修复的新玩法。
- 现有 `preserved-value.ts` 及往返测试可复用但需按最终schema验收。该任务应同时明确综合注册门禁中恢复异常的处理，使020能够执行全量集成门禁。验收命令沿用本合同，新增恢复顺序/异常修复检查必须独立取源期望；不可只检查字段存在。
