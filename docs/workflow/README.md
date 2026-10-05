# Harness 工作流

本层管理 agent 如何选择工作、读取证据、分工、验证和交接。它独立于游戏引擎，不负责游戏实现进度的第二份记录。

入口是 [AGENTS.md](../../AGENTS.md)，完整执行规则见 [agent-protocol.md](agent-protocol.md)。正式任务的状态只写入 [state.json](../tasks/state.json)，任务正文只写入其独立合同，看板由工具生成。

## 维护方式

1. 先确认改的是规则、任务状态、证据还是游戏代码；文件分工见 [document-map.md](document-map.md)。
2. 改规则时只更新权威文件，其他入口用链接引用。新增文档登记到 [.agents/harness.json](../../.agents/harness.json)。
3. 改调度时遵循 [task-generation.md](task-generation.md)，运行 `npm run generate:harness`。
4. 运行 `npm run check:harness`；记录实际结果到 [governance-log.md](governance-log.md)。仅本地证据检查另按任务触发。

本项目保留参考项目的渐进读取、单任务执行、独立合同和负向校验思想。任务状态改为一个 JSON，避免功能线、看板、推荐之间互相复制。治理队列初始为空；没有旧 PG/MO、宠物/关卡任务或复杂设计模式门禁。

`.claude/agents` 只是角色适配；Codex 等客户端按通用协作协议使用自己的子 agent 工具，不要求安装额外插件或绑定某个模型。
