# Claude Code 入口

本项目规则和阅读路由统一由 [AGENTS.md](AGENTS.md) 定义，不在客户端维护第二份规则。

- 普通“执行/继续”：`npm run task:next`，再按返回路径读取合同。
- 状态源：[docs/tasks/state.json](docs/tasks/state.json)。修改后 `npm run generate:harness`。
- 协作与完成规则：[执行协议](docs/workflow/agent-protocol.md)。
- 维护 harness 后：`npm run check:harness`。
- 专用角色适配定义见 [.claude/agents/](.claude/agents/)，它们不持有任务状态，也不授予额外操作权限。

目前仅有 harness 和离线源文件清单，没有游戏运行工程。
