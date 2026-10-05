# TASK-RE-002 · 单角色动作端到端交付（取证、转换、工程与验收）

## 目标

交付一个可冷启动、可构建、可与源基准对比的男战士动作验收工程；同一任务内完成动作取证、资源转换、Phaser 工程与实际验证。保留 TASK-RE-002 编号以维持已有证据引用，原 TASK-ENG-003 的未执行范围合并于此。

## 输入

- TASK-RE-001 的 [源索引](../../reverse-engineering/source-index.md) 与 [结构 JSON](../../reverse-engineering/source-index.json)。源 SHA-256 为 `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`；本地提取在 `local-resources/moyu/source-index/`，含 `source.xml`、`as/scripts/`、`pcode/scripts/` 和哈希清单。缺失时按源索引重提取到新目录。
- [证据协议](../../workflow/reverse-engineering-protocol.md)、[源清单](../../reference/swf-inventory.json)。
- 样本固定为新游戏男战士：`_root.map(4536).role(3106).playAction(3101)`；角色由时间轴放置，`角色.as` 的 DoInitAction 注册 `RoleMC`。
- 地面待机：3101 帧 15/16「男战士地上左/右」→ 2986（声明 1 帧）；地面跑动：帧 17/18「男战士向左/右跑」→ 3007（10 帧）；基础攻击：帧 19/20「男战士左/右斩魂」→ 3031（11 帧）。右向帧只更新原放置变换，不能解释为 characterId=0 的新资源。这些是结构帧数，不是已验证持续时间。
- 行为入口（均相对 `as/scripts/`）：`__Packages/RoleMC.as` 的 `站立`、八向跑动函数、`斩魂`、`autoAttack`、`斩魂效果`；`__Packages/MonsterMC.as` 的 `onPress`；`DefineSprite_4536/frame_1/DoAction.as` 的 `role.Activities` 和 `onEnterFrame`；`DefineSprite_3031/frame_11/DoAction.as` 写入「使用技能结束」。P-code 同路径、扩展名 `.pcode`。

- [技术决策](../../architecture/technology-decision.md)、[代码边界](../../architecture/src-boundaries.md)、[质量门禁](../../workflow/quality-gates.md)。

## 范围

只分析选定角色和这些动作直接依赖的片段。闭合时间轴帧、持帧、脚本跳转、注册点、裁剪偏移、左右变换及适用的动作事件。几何与碰撞/命中语义分开取证。

沿 2986/3007/3031 的子标签窄查 shape/bitmap、矩阵链及显示列表继承；不能把 XML 中缺省 scaleX=0 当实际缩放。八向移动使用的地面左右跑动动画属于本样本，空中状态、女法师、其他技能、宠物及全地图不纳入。斩魂作为源中目标点击调用的基础攻击，必须确认末帧状态写入与下一次 Activities 消费的先后，不能凭 11 帧推算命中时间。原场景静态入口为 map 帧 8「卡萨诺城郊区」，不是已运行基准。

建立一个范围有限的离线转换脚本与固定样本，不做通用 Flash VM。以源本身或可追溯的源渲染方法获得对比基准；FFDec 静态帧不能单独证明动态脚本时序。

按三个内部里程碑连续推进，不在里程碑之间关闭任务或要求用户再次执行：

1. 完成上述动作取证，落盘 verified manifest、独立源基准、允许误差和关键未知项结论。
2. 完成可重复转换及 fixture 校验；关键证据通过后才进入工程实现。
3. 创建最小 Phaser + TypeScript + Vite 工程，锁定版本，保留 harness 命令。用一个场景消费已验证的原角色/动作；逻辑时钟与显示投影分离，提供受控动作切换、左右朝向、暂停/恢复和重置，以便验收。

工具型控制界面需明确标为验收工具，不能拿它代替原版 UI。动作外的战斗、地图、成长、存档暂不实现；不得交付普通几何 demo 后称原动作已复刻。

## 输出

- `docs/reverse-engineering/first-actor/` 中的动作 manifest、字段约定、提取命令、验证报告、未决项和小型证据。
- 可重复生成选定动作纹理与元数据的工具。大型中间资源留本地；本任务运行必需数据纳入正式目录。
- `src/`、正式运行资源、版本锁文件、运行/构建命令，以及时间轴/坐标/事件测试和浏览器视觉比对记录。运行资源不能依赖本地提取目录。
- 更新 [本线覆盖](../feature-line-coverage/LINE-FOUNDATION.md)，记录动作误差和全部验收结果。

## 验收

- `npm run check:source`、`npm run check:harness` 通过；为新转换工具创建并运行真实 fixture 检查，名称写入报告。
- 源帧数量、顺序、时长、原点和正反朝向均有定位；manifest 有 schema/校验与关键 unresolved 列表。
- 基准来自原始源材料，不能用现代生成器同时生成 expected 和 actual。
- 影响动作试点的未知项必须解决；暂未涉及的完整伤害规则明确排除，不称其已还原。

- 当次实际新增并执行 `typecheck`、单元测试、`build` 与浏览器运行验收，同时 `npm run check:harness` 通过。
- 原舞台坐标下核对持帧、裁剪/注册点、镜像、状态切换、暂停/恢复；说明误差与允许条件。
- 逻辑不依赖渲染回调结算事件；不同渲染帧率的观察序列一致，掉帧不会漏或重复逻辑事件。
- 冷启动运行不依赖 SWF、FFDec、本地证据目录或参考项目路径。
- 若实际引擎缺陷阻碍合同，产出最小案例和技术决策修订；未解决之前不称试点通过。

具体证据、字段及允许误差见 [动作合同](../../reverse-engineering/first-actor/action-contract.md)，实际验证和复现命令见 [验证报告](../../reverse-engineering/first-actor/validation.md)。

## 停止与拆分

激活前输入必须具体化。动态脚本导致静态导出不足时先做有界源验证；不要用 Ruffle 补上运行链。选定动作直接依赖的额外资源或行为分支在本任务内补证；只有发现可独立验收的新玩家能力或无关系统时才修订范围并拆分，不扩成所有角色或自制完整时间轴解释器。没有源基准或关键动作数据时留在本任务补证，不以占位图补齐；证据、转换或工程任一里程碑完成均不能单独将任务设为 Done。
