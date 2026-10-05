# 文件职责

| 路径 | 权威内容 | 更新时机 |
| --- | --- | --- |
| [AGENTS.md](../../AGENTS.md) | 项目约束、阅读路由 | 用户约束/协作规则变化 |
| [CLAUDE.md](../../CLAUDE.md) | Claude 入口链接 | 入口路径变化，不复制规则 |
| [.agents/harness.json](../../.agents/harness.json) | 需要验证的文档清单 | 新增/移除受管文档 |
| [TASK_OUTLINE.md](../../TASK_OUTLINE.md) | 项目阶段目标 | 方向变化，不写当前任务状态 |
| [技术决策](../architecture/technology-decision.md) | 引擎选择及改选条件 | 证据推翻选择时 |
| [state.json](../tasks/state.json) | 任务、功能线、治理执行项状态与依赖 | 激活、完成、阻塞、拆分 |
| [task-board.md](../tasks/task-board.md)、[execution-queue.md](../tasks/execution-queue.md) | 自动派生视图 | `generate:harness`，禁止手改 |
| [任务合同目录](../tasks/task-definitions/) | 目标、输入、范围、输出、验收、停止条件 | 任务创建/有据收窄 |
| [功能线覆盖目录](../tasks/feature-line-coverage/) | 范围、缺口、关闭证据 | 当前 task 获得新证据/完成时；不重复调度状态 |
| [执行协议](agent-protocol.md)、[任务生成](task-generation.md) | 执行、交接、调度规范 | 工作流维护 |
| [证据协议](reverse-engineering-protocol.md) | 事实来源与确认等级 | 逆向方法变化 |
| [质量门禁](quality-gates.md)、[评审协议](review-protocol.md) | 检查与验收边界 | 可执行检查实际变化 |
| [代码边界](../architecture/src-boundaries.md) | 未来现代代码职责 | 经过试点证明需调整时 |
| [源文件概要](../reference/source-summary.md)、[SWF 清单](../reference/swf-inventory.json) | 文件结构、哈希、工具环境 | 原源文件或解析器变化 |
| [机制索引](../reverse-engineering/mechanics-index.md) | 已发现机制与未知项 | 正式逆向任务产出后 |
| [治理日志](governance-log.md) | harness 本身的变更记录 | harness 维护完成 |

完成任务保留在 state.json 中，completion 指向结果和证据；不用再抄到一份任务历史。当前仓库较小，不预建问题库、方法实验、资源族全集或框架模板。

大型原始导出放 `local-resources/`，截图/trace 放 `.evidence/`，均为本地材料。已确认、供实现消费的小型证据与转换规则放 `docs/reverse-engineering/`；未来游戏运行资源放正式工程目录。不要让运行时导入被忽略的证据目录。
