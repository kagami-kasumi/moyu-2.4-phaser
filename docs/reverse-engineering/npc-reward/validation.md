# TASK-NPC-005 验证报告

2026-10-05 完成老兵首次礼包领取闭环。默认首页可新建男战士、点击老兵、选择三个互斥礼包之一，在背包查看实际物品/属性与初始凯恩记录；关闭、重开、连点和再次交互不会再次领取。原城郊→城一旅程和动作验收页保留。

## 交付与证据

- 纯规则：[npc-reward.ts](../../../src/domain/npc-reward.ts)。新建四格初始物品、随机戒指属性、40格堆叠/溢出掉落、标记改变顺序与对话状态。
- 视图：[reward-view.ts](../../../src/adapters/reward-view.ts) 和现有 Phaser 场景。真实地图NPC命中进入对话，HTML背包展开属性，幻兽蛋留在物品背包；地面掉落具有地图标记、坐标和内容记录，切图清空。现代侧栏/展开控件/掉落文字属于 design。
- [源合同](source-contract.md)、[冻结行为](behavior-source.json)、[初始记录源片段](initial-source.json)、[XML显示列表/Action字节](source-fixture.json)、[FFDec图像来源](baseline/provenance.json)。AS/P-code全文件哈希回查，只冻结本任务用到的函数和显示链，不把生产代码当expected。
- 正式运行资源：`public/assets/npc-reward/`；从原二进制提取，浏览器不加载原SWF、源脚本、fixture或FFDec。

## 实际检查

| 命令 | 结果与范围 |
| --- | --- |
| `npm run typecheck` | 通过，严格TypeScript |
| `npm test` | 23项通过：原14项 + 奖励9项 |
| `npm run build` | 通过，构建首页与动作页；仍有既有Phaser包体超过500kB提示 |
| `npm run test:browser` | Edge 10项通过，包含既有5项与新增5项 |
| `npm run check:npc-reward` | 16张独立FFDec原图、6组面板/子对象显示列表、16个资源标签、10段Action字节哈希、AS/P-code哈希和临时重建对照通过 |
| `npm run check:first-slice` | 原地图/角色/NPC/入口资源与源行为回归通过 |
| `npm run check:first-actor` | 原30个placement、23个shape、22帧独立图像回归通过 |
| `npm run check:source` | 原SWF身份与结构校验、5项解析测试通过 |
| `npm run generate:harness` / `npm run check:harness` | 派生状态生成与14项harness测试通过 |

### 行为基准

离线oracle直接执行冻结的 command1–6、createThing、upDataWeapon、initNewGame、backPack.setThing、ThingMC.addNumber 和 throwGoods。显示对象/全局名字表/物品槽是有界替身；初始凯恩记录从冻结useItem分支提取。JS对普通对象未定义方法会抛错，而AS2为无效果，因此掉落目标提供no-op setThing。没有运行Flash播放器，也没有实现完整AVM1虚拟机。

三个礼包分别与源期望逐字段对比，涵盖初始戒指120种随机种子样本、选包关闭/重开、过期答案拒绝、入包前已改cmd6、0/1/2/4空格时逐件部分入包与掉落、98/99堆叠边界、同类型不同名字、40只幻兽时仍能收到蛋、掉落地面边界回退、切图清空掉落。现代随机源不声称与旧播放器相同随机序列。

### 浏览器与图像

三个礼包各用无probe真实新建/鼠标点击/背包展开流程冷启动。断言内容、数量、品质和属性可见；再次点击老兵只能进入后续话题，首次按钮消失。满包仅在手工测试模式注入，五件奖励均出现地面记录，标记不回滚；正常领取后切图保留背包与领取状态。无运行时错误、远程请求或证据目录依赖。

原有44组双向动作画面、3处地图画面、暂停/单步/恢复、移动/松开、鼠标/Q/Ctrl入口、失焦和连续两次真实冷启动移动旅程继续通过。

新图标 bitmap fillStyle=0x43（不平滑裁剪），对半缩放须取目标像素中心对应的源像素，不能沿用平滑SVG缩放。15张图预乘通道误差为0。新手戒指2046是JPEG3：FFDec Java JPEG与libvips解码/反预乘舍入差异的平均误差0.011369/255、最大1.874510/255，alpha严格一致；检查只对这一张允许平均<0.02、最大<2，不放宽其他图。浏览器额外对11张实际显示头像/图标做独立FFDec像素投影：10张差异0，戒指平均0.012370/255、最大1/255。该对比验证原图像素，不声称HTML布局等同原Flash窗口。

截图和报告在 `.evidence/npc-reward/`：`pack-1.png`、`pack-2.png`、`pack-3.png`、`full-backpack.png`、`pack-*-report.json`、`browser-pixels.json`、`source-check.json`。

## 发现与修正

- 奖励一源码的18点最大攻击在upDataWeapon后变为21；已用源函数而非原字面量断言。
- 幻兽奖励是背包物品，不自动孵化；初始凯恩单独显示为初始记录。
- 重复打开相同NPC内容也会改变对话版本；视图缓存键包含版本，避免按钮持有过期版本后无法操作。
- 连点礼包一的第二次点击可能命中更新后的“谢谢”而直接关窗。这符合当前按钮更新语义；验收检查不会重复发奖，并兼容结果页已关闭，未用延迟/禁点假装原版节流。
- 本机Biome LSP未安装；未依赖它作完成依据，实际TypeScript/逻辑/构建/浏览器门禁均已运行。

## 边界与后续

本任务只覆盖首次奖励存放与查看。开蛋、物品使用、装备穿戴/战斗、幻兽战斗/成长/跟随、拾取/丢弃、存档与后续老兵兑换尚未实现；页面明确范围。新建最多9格，普通旅程不会出现人为满包。

覆盖合同的四项关闭条件已满足。本线关闭后当前任务队列没有已排定下一项；若继续扩展，可依据已定位的root frame9 useItem幻兽分支和huanShou.addHuanShou另立“使用幻兽蛋并查看新增幻兽”的完整能力合同，再调度执行。本次未擅自继续该能力。
