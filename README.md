# 魔域 Flash 现代化

《魔域 2.4》的原生浏览器重写项目。当前已交付首个可玩切片：新建男战士，在卡萨诺城郊区移动/停步，通过右侧entry2进入卡萨诺城一entry1。原资源地图和常驻NPC可见；战斗、NPC对话、背包、幻兽和存档尚未开放。

## 运行

Node.js >=22.12.0（本机验证 24.6.0）。

```powershell
npm ci
npm run dev
```

浏览器打开终端显示的本地地址。首页为旅程：方向键/WASD或按住地面移动，松开停止，在右侧传送点按Q/Ctrl或走近后点击。到达城一后本切片结束，刷新重走。`/actor.html` 保留待机、跑动、斩魂的动作验收工具。正式运行资源已在 `public/assets/first-actor/` 与 `public/assets/first-slice/`，安装、构建和运行不需要原 SWF、Java、FFDec 或 `local-resources/`。

```powershell
npm run typecheck
npm test
npm run build
npm run test:browser
```

浏览器检查默认使用本机 Microsoft Edge；需要该浏览器可用。`npm run preview` 可查看已构建的 dist。构建含完整 Phaser 引擎，当前有大包体提示。

## 证据与工具

采用精确锁定的 Phaser 4.2.1、TypeScript、Vite。规则和时钟独立于呈现，不依赖动画完成回调结算事件。见 [旅程源合同](docs/reverse-engineering/first-slice/source-contract.md)、[旅程验证报告](docs/reverse-engineering/first-slice/validation.md)、[动作合同](docs/reverse-engineering/first-actor/action-contract.md)、[验证报告](docs/reverse-engineering/first-actor/validation.md) 和 [技术决策](docs/architecture/technology-decision.md)。

| 命令 | 用途 |
| --- | --- |
| `npm run task:next` | 当前唯一任务 |
| `npm run generate:harness` | 从 state.json 生成看板与队列 |
| `npm run check:harness` | 调度负向测试、合同/链接/派生视图一致性 |
| `npm run check:source` | 原 SWF 身份与结构检查（需本地源文件） |
| `npm run convert:first-actor` | 从只读原 SWF 重建正式动作资源与 manifest |
| `npm run convert:first-slice` | 从只读原SWF重建地图/NPC/传送点与碰撞清单 |
| `npm run check:first-slice` | 与冻结XML/源行为哈希/FFDec图像和正式资源比较 |
| `npm run check:first-actor` | 从原 SWF 临时重建，与独立 FFDec 基准及正式资源比较 |

离线转换命令需要根目录原 `魔域2.4.swf`；不需要 Flash 播放器。基准 PNG 已冻结，转换器不读取或改写它们。FFDec 只在重新获取源基准时使用；复现命令在验证报告中。

## 协作入口

下次对 agent 说“执行下一任务”，它将读取 [AGENTS.md](AGENTS.md) 和 `task:next` 指定的独立合同。

- [唯一调度状态](docs/tasks/state.json)、[生成看板](docs/tasks/task-board.md)、[执行队列](docs/tasks/execution-queue.md)。
- [项目路线](TASK_OUTLINE.md)、[质量门禁](docs/workflow/quality-gates.md)、[代码边界](docs/architecture/src-boundaries.md)。

原 SWF 和原始提取物保持只读；不引入 Ruffle、Flash 播放层或运行时源文件解析。参考项目未作修改。
