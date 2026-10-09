# TASK-UI-007 · 验证报告

2026-10-05，本任务还原默认580×500游戏主界面的原资源与显示列表，并接上已有背包、幻兽记录和老兵对话。自动直接进入游戏的默认入口保持可用。

## 真实检查

- `npm run typecheck`：通过。
- `npm test`：25/25通过；包括既有动作/移动/奖励、补齐wudi后的完整新建、HUD初值与状态条边界。
- `npm run test:browser`：完整运行13/13通过（Edge，42.2秒）。冷启动/移动/切图、44组角色投影、三个礼包与旧图标、原版HUD/原键位/面板输入隔离/满包掉落/动态状态条均覆盖。不是仅重跑失败项的完成记录。
- `npm run check:original-ui`：146个UI角色、8个Action、12个FFDec完整sprite基准与临时重提的正式资源通过；冻结有界脚本片段亦匹配。
- `npm run check:first-actor`、`npm run check:first-slice`、`npm run check:npc-reward`：通过，原基准未重写。
- `npm run build`：通过；仍有Phaser大包体提示。
- `npm run check:harness`：14/14测试与文档/状态检查通过。

## 完成审计

| 要求 | 当前证据 |
| --- | --- |
| 原版角色/凯恩状态栏、底栏、地图信息、XP可见性 | 独立XML与AS/P-code、source-contract.md；默认运行截图native-hud.png。XP源初值0且全部隐藏 |
| 真实动态状态绑定 | src/domain/hud.ts、OriginalHud读取领域状态；浏览器将生命改为45/90，实际条宽比例0.5并恢复 |
| 原版按钮/键位与已有入口 | 源ButtonMC帧1/2/3和根键码；X/C/Esc、原图标点击与关闭操作，保留尚未实现提示 |
| 原版背包40格与对话位置 | 2074/2293显示列表、root openX/Y脚本；native-backpack.png/native-dialog.png，已人工查看 |
| 当时的冷启动验证 | oracle不再屏蔽wudi；36格、999经验球和礼包一最后一件掉落经真实UI验证。当时记录的各10亿货币漏算RoleMC setter上限，TASK-DATA-015已勘误为各1亿，见content-registry/persistence-contract.md |
| 输入隔离、已有流程回归 | 原版UI面板点击不移动；既有键鼠/失焦/冷启动/切图/礼包浏览器回归通过 |
| 独立原图对照 | 角色完整sprite来自独立FFDec PNG；浏览器组合mean4.457/255，635/24126通道差值>40（2.632%），符合记录的栅格化容差；变换/颜色参数另行严格核对 |
| 正式运行独立性 | dist只加载public资源；既有冷启动检查无SWF/FFDec/local-resources/外网依赖 |

截图和机器报告在 `.evidence/original-ui/`。生产图片为独立叶片，完整sprite expected未参与运行时资源生成；未因浏览器误差改写expected。

## 限制

这不是完整游戏复刻。装备使用、战斗、幻兽跟随/成长、好友、任务系统、存档等尚未实现；其入口不会伪装成功。初始凯恩的出征记录与状态栏按源显示，不等同于实现跟随。幻兽记录明细和物品属性详情仍为可访问HTML布局；动态中文字体与浏览器栅格化不声明原播放器像素一致。城一仍是当前移动流程终点。

下一开发能力尚未排入队列；可按用户目标继续城一往返与地图推进或战斗闭环，不将未授权系统自动纳入本任务。
