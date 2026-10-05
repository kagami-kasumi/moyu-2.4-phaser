# TASK-RE-001 · 原文件索引与启动链确认

## 目标

让后续 agent 无需重新全盘搜索，就能定位游戏的启动、首个可控场景、一个角色及其动作资源。此次只做源研究和索引，不创建游戏工程。

## 输入

- 根目录 `魔域2.4.swf`（只读）；先用 `npm run check:source` 确认与 [机器清单](../../reference/swf-inventory.json) 一致。
- [源文件概要](../../reference/source-summary.md)、[证据协议](../../workflow/reverse-engineering-protocol.md)、[技术选型](../../architecture/technology-decision.md)。
- 已安装 FFDec CLI（概要列出本机路径）。使用前核对帮助和版本；参数以实际工具支持为准。

## 范围

一个工作包：建立受控离线提取目录 `local-resources/moyu/source-index/`，记录命令/工具版本/源哈希，导出所需脚本和结构索引。根据结果窄查根帧 Action、初始化动作、按钮/实例与帧跳转，定位启动链与一个玩家实例的创建/输入路径。

检查实际存在的外部加载调用，区分广告/论坛链接与必需资源。不要跟踪每个游戏系统，也不要把所有位图复制到运行目录。可并行只读复核启动链或资源关联，主 agent 单独写状态。

## 输出

- `docs/reverse-engineering/source-index.md`：提取环境、启动调用链、脚本定位、首个场景/角色标识、外部依赖和未知项。
- `docs/reverse-engineering/source-index.json`：源哈希、根帧/实例/characterId 定位、证据等级与文件路径。字段以实际证据命名，不预设 AS3 类。
- 更新 [机制索引](../../reverse-engineering/mechanics-index.md) 与 [本线覆盖](../feature-line-coverage/LINE-FOUNDATION.md)，用真实角色/动作路径具体化 [TASK-RE-002](TASK-RE-002.md)。

## 验收

1. `npm run check:source` 与 `npm run check:harness` 通过。
2. 报告中每个 verified 结论均能从源哈希 + 脚本/帧/实例位置复查；提取材料未覆盖原文件。
3. 一名可控角色及后续需要搜索的动作位置有明确证据；如果源本身采用其他控制形态，先据实修订下个合同，禁止硬造角色。
4. 外部加载是否阻碍后续已有证据判断。静态调查未覆盖运行行为时明确写 unknown，不把“能反编译”称为“能完整游玩”。
5. 此任务的 JSON 是结构索引，不能标作全游戏行为真值；把未确认项交给明确的下一步。

## 停止与拆分

FFDec 不可用时先复用本机已有工具并记录情况；确需新安装复杂工具且不能继续时列明具体依赖。源受保护、缺外部包或入口不明确且影响后续时保留 Blocked 及证据，不伪造完成。遇到多套角色/场景只选一个明确样本，其他记索引，不扩大为全游戏逆向。
