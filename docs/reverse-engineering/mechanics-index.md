# 机制索引

仅记录本作证据，不能从“再续天庭”移植机制清单。当前已有启动与单角色结构索引，未验证完整运行行为。

| 问题 | 证据等级 | 当前依据 | 后续 |
| --- | --- | --- | --- |
| 文件/VM/舞台/帧率 | verified（仅文件结构） | [源概要](../reference/source-summary.md)、[机器清单](../reference/swf-inventory.json) | TASK-RE-001 确认脚本入口 |
| 启动链与外部加载 | verified（静态调用）；运行影响 unknown | [源索引](source-index.md)：菜单/职业/游戏入口、Mochibot、4399 LocalConnection、论坛跳转 | 后续适用的运行验证；下一项离线取证未发现外部资源阻塞 |
| 可控角色、场景、输入路径 | verified（脚本和标签）；运行到达 unknown | [结构 JSON](source-index.json)：map/4536、role/3106、卡萨诺城郊区；方向键/WASD、鼠标方向和目标点击入口 | TASK-SLICE-004 补首场景运行旅程与碰撞/出口 |
| 动作、注册点、持帧、事件 | verified（源帧、矩阵、AS2语义与现代比对）；完整伤害/实际原运行 unknown | [动作合同](first-actor/action-contract.md)、[验证报告](first-actor/validation.md)：待机/跑动/斩魂，末帧标记与下次Activities分离 | 可玩切片消费现有资源，完整碰撞/伤害另取证 |
| 完整玩法系统与内容量 | unknown | 用户认为本作动作简单；未做完整盘点 | 首个切片后按需扩展 |

后续每行链接正式证据与其未决项，不在这里重复一份数值、坐标或任务状态。实现状态统一见 [调度状态](../tasks/state.json)。
