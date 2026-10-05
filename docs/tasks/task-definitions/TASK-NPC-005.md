# TASK-NPC-005 · 老兵首次礼包领取闭环

## 目标

新建男战士，在城郊与老兵对话，选择一种首次礼包，查看实际获得的物品/幻兽记录；再次交互不得重复领取首次礼包。形成一个完整可验收的NPC奖励旅程。

## 输入

- [首个旅程源合同](../../reverse-engineering/first-slice/source-contract.md)、[验证报告](../../reverse-engineering/first-slice/validation.md)与现有地图/角色工程。
- 相对 `local-resources/moyu/source-index/as/scripts/`：`DefineSprite_4312/frame_1/DoAction.as` 的 npcPic.onRelease、appear、command case1–6、openDialog/closeDialog；`DefineSprite_4536/frame_1/DoAction.as` 中 getNpc/老兵初始cmd1；`frame_9/DoAction.as:1593` 的 backPack.setThing、`:2614` huanShou.setThing、`:4308` createThing，以及本奖励直接调用的upDataWeapon。
- 原根显示列表中 talking/2293、backPack/2074、huanShou/2482，按精确符号跟踪对应标签和脚本；同路径P-code、原XML和原始二进制交叉确认。
- [本线覆盖合同](../feature-line-coverage/LINE-NPC-REWARD.md)、证据协议与质量门禁。

## 范围

先冻结一次性标记myID.cmd、对话分支/关闭、奖励构造、背包/幻兽容量和失败处理的源证据，再实现对应旅程。三个首次礼包分支均属于同一选择能力；不可只做一个按钮后虚报全部。只实现奖励存放、查看及直接前置所需数据/资源，不扩展装备战斗结算、幻兽战斗/成长、存档、商城或后续勋章兑换。

新建时与本旅程容量/物品效果相关的初始状态须补证，不用空背包假设掩盖原流程。与当前城一到达结束点并存：保留已有一次切图回归，本任务完成点是首次奖励可查看且再次交互不重复首次奖励。若相邻系统是必要直接依赖，在本任务内补证和落实最小真实能力。

## 输出

可冷启动重走的老兵首次奖励旅程、奖励/对话源合同和独立基准、正式资源、纯规则层、浏览器与自动回归，以及未覆盖内容清单。

## 验收

- AS/P-code/标签交叉核对对话入口、三个奖励分支、标记改变顺序与容量异常；明确verified/inferred/unknown/design，关键事实未确认前不实现。
- 冷启动选择男战士，与老兵对话，逐一独立冷启动验证三个选项的原版expected物品与幻兽记录、数量、属性和一次性状态；关闭/重开对话、连续点击和背包容量异常都由源证据确定期望。
- 用户可在实际界面查看获得内容；不以日志或测试探针冒充奖励交付。原可见资源独立对照；新增现代布局须声明design。
- 实际运行 `npm run typecheck`、`npm test`、`npm run build`、`npm run test:browser`、`npm run check:first-slice`、`npm run check:first-actor`、`npm run check:harness`；修改源解析工具时另跑 `npm run check:source`。新增奖励检查在本任务建立并记录真实命令。
- 原移动、停步、入口保护、一次切图和动作画面对照继续通过。正式运行不依赖SWF执行层或证据目录。

## 停止与拆分

不因取证/转换/实现/测试阶段拆分。同一首次奖励的直接依赖继续落实；独立的战斗、存档、后续兑换另立任务。缺失源材料或必要外部裁决才登记具体阻塞，不能猜奖励或为通过检查虚填完成。
