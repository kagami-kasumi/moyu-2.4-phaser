# 质量门禁

本文件约束 harness、源证据转换及当前单角色动作工程；各门禁只证明其实际检查范围。

## 当前门禁

- `npm run check:harness`：检查 [AGENTS.md](../../AGENTS.md)、[agent-protocol.md](agent-protocol.md)、[.agents/harness.json](../../.agents/harness.json) 与 [docs/tasks/state.json](../tasks/state.json) 的入口和状态关系。
- `npm run check:source`：检查源 SWF、`swf-inventory.json` 的存在、哈希和基本元数据。

缺少脚本时不得自行假定其通过，也不得为通过而临时创建假的结果。当前门禁不证明 Phaser、时间轴、碰撞、动作手感或完整游戏行为。

## 动作工程门禁

- `npm run typecheck`：严格 TypeScript 检查；`src/content/manifest.ts` 定义并校验运行清单字段、帧序列与事件位置。
- `npm test`：动作末帧与下一 Activities、循环、切换、镜像保持帧、暂停/恢复、重置、15/30/60/144 Hz 和长停顿的确定性检查。
- `npm run check:first-actor`：需本地只读原 SWF；独立原始标签对冻结 FFDec XML、22 个 FFDec PNG 基准和正式资源；临时重建后比较，绝不重写 expected。
- `npm run build`：构建可独立部署的 dist；不读取原 SWF 或提取目录。
- `npm run test:browser`：先 build，使用本机 Edge，冷启动 dist；44 组原舞台双向逐帧画面、暂停/单步/恢复/重置和停止渲染后的逻辑事件；检查无远程资源或 SWF 依赖。基准为 FFDec PNG 和独立冻结矩阵，报告位于 `.evidence/first-actor/`。

新增门禁必须有独立输入和明确失败输出；不得只检查文件存在或源码字符串。

## 数据与变更边界

原始 SWF 与原始提取物只读保存；派生清单可以用有记录的确定性命令更新，旧证据需要更正时保留来源和变更依据。转换器输出与运行时资源分目录。规则层、内容 manifest、渲染适配器和 Phaser 场景分层，业务事件不能由渲染回调反推。任何假设都写入 `inferred` 或 `unknown`，不修改源文件来消除缺口。

## 结果表述

门禁通过只表示对应检查通过。没有独立源基准、逐帧比较和命中/时序证据时，报告只能说“脚手架可检查”或“资源已提取”，不能说“动作已复现”或“像素/命中时序一致”。
