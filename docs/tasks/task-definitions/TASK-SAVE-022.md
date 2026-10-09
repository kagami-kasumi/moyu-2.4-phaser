# TASK-SAVE-022 · 存档迁移、备份与异常恢复

## 目标
玩家能通过真实界面导入导出、备份恢复，版本或存储异常时保住有效进度。

## 输入
- 直接依赖 TASK-SAVE-016；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- 016正式schema/codec和存储适配器、019字段保留合同及实际存档样本；版本与备份策略属于design。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
完成旧版本迁移策略和有依据的版本fixture、备份管理、导入/导出及异常恢复UI；强化可靠写入、坏档/截断/容量不足/存储拒绝/未知版本保护。没有历史版本时用明确标design的迁移测试fixture，不虚构旧版兼容；不扩展游戏内容或Flash旧档兼容。

## 输出
版本迁移和异常恢复实现、备份/导入导出UI、故障测试及截图报告；基础功能线最终关闭证据。

## 验收
真实UI完成导出→导入、备份→损坏→恢复；无效字段/引用、未知版本、旧版本迁移、截断、容量不足、存储拒绝、保存失败与覆盖取消有测试。失败不得覆盖最后有效档，取消不写入；恢复保留未实现内容和全部现有进度。运行 npm run check:content-registry、npm run typecheck、npm test、npm run build、npm run test:browser；实际检查异常/恢复截图并核对整条新建到继续旅程。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分
### 下一项有界输入（2026-10-08）

- 选择理由：016交付正常完整保存/继续；当前用户可观察缺口是只有浏览器单槽，没有可下载副本、导入或坏档后的备份恢复。按既定基础顺序推进022，基础线尚不能关闭。
- 输入实现：`src/application/save-codec.ts`、`save-game.ts`、`save-source.ts`、`save-types.ts`，`src/adapters/save-storage.ts`和`src/domain/journey.ts`的独立restore；已有键`moyu.progress.v1`，schema `moyu-state` v1，完整raw保留及可玩投影`extensions.game`。领域类型未来搬动以真实路径为准。
- 输入证据：`docs/reverse-engineering/save-game/source-contract.md`、`field-coverage.json`、`validation.md`；`tests/save-game.test.ts`、`tests/browser/save-game.spec.mjs`；016实际往返样本`.evidence/save-game/{warrior,mage}-roundtrip.json`。样本由真实UI生成，正式迁移fixture应复制去时间/随机依赖并标来源，不引用未保存的本机状态。
- 源精确锚点：`frame_9/DoAction_2.as:1687–1700`原高版本拒绝及打开槽的顺序；`:2116–2129`原旧版本商店调整；`DefineSprite_4233/frame_1/DoAction.as:3–55`槽位显示、保存/读取、删除确认。仅用于说明原行为与现代修复，不把Flash版本1.8当现代schemaVersion。
- 直接差异：目前没有自动备份、备份选择、文件导出/导入或迁移链；一个setItem只保证单键写入异常不先清旧值，expected字符串检查不等于跨页锁。022应定义备份容量/提交顺序、损坏主档仍能找到有效备份、失败/取消零写入，以及多页冲突的可见处置。
- 真实历史只有016的现代v1。若新增v2，必须把本次v1实际结构作为输入fixture；若无产品需要升级schema，用显式design fixture测试迁移框架，不能虚构曾发布v0或宣称.sol可导入。
- 不重跑源全量枚举，不改原SWF；沿用653模板/911payload保留测试并覆盖迁移前后、未知扩展、打造托管、debug奖励、防止重复发放、两个职业/地图及取消/故障。用真实UI导出→导入和损坏→备份恢复，检查下载文件与最终截图；满级英勇/货币访问器边界保持016证据。
- 关闭前核对LINE-GAME-FOUNDATIONS全部关闭条件，再按既定路线激活成长任务014；只生成其Ready合同，不自动开发后续完整游戏。

2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。
