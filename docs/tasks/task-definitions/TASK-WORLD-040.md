# TASK-WORLD-040 · 城二区往返与军团仓库入口

## 目标
玩家从卡萨诺城一进入城二区、在新地图移动并返回，通过军团管理员打开已经可用的仓库，保存和导入后继续三地图旅程。

## 输入
依赖TASK-BAG-039。选择理由：城一商店/融合/物品保管已连通，城二既有出口仍被拒绝；原军团管理员仓库入口在该区域，可以把新仓库接回自然地图旅程。源DefineSprite_4536/frame_9与frame_10/DoAction.as、frame_1的jumpMap/jumpToMap/allowJumpMap/afterJumpMap及intoV/intoTime/intoWait初值；DefineSprite_4312/frame_1 cmd151/153；原sprite4536第10帧显示列表、ground及npcPic标签。现有tools/lib/first-slice.mjs和city-roundtrip源证据可复用，不能覆盖原提取物。

## 范围
城一entry2↔城二entry1，城二背景/可行走轮廓/入口与四NPC的有据呈现，军团管理员仓库服务；三地图存档/旧档恢复/往返和UI隔离。必须枚举frame10副作用：homeCity、首次卡萨诺幻境道具及持久标记、随机幻境条件。首次道具按源执行和一次性保存；尚未实现的幻境/皇宫/沼泽/城三采用明确的未开放处理并标为design，不静默冒充原版完整区域。军团管理、指挥官战斗、城堡经营和晶石打包另排，不伪开放按钮。

## 输出
城二场景/几何/入口/NPC及首入副作用源合同，独立显示列表和FFDec基准，正式运行资源、三地图领域/持久化、军团仓库自然入口、两职业浏览器旅程及覆盖报告。

## 验收
- 原SWF与独立FFDec对照新地图资源、注册点、NPC/入口位置和碰撞；源函数对照全部双向入口条件，非法目的地不改位置/归属。
- 两职业无probe城郊→城一→城二→城一→城郊，真实移动、军团管理员存取，三地点保存刷新/真实导入；不重发首次道具。
- 冻结首入奖励/标记以及随机条件的源事实，明确未实现目的地的design边界；所有无效目的地可见拒绝。原两地图/商店/融合/仓库回归不得退化。
- npm run typecheck、npm test、npm run build、npm run test:browser、npm run check:save、npm run check:source和generate:harness/check:harness；新增资源独立源检查，实际查看截图。

## 停止与拆分
本项是一个区域往返与现有服务接入，不按取证/资源/实现阶段拆分。若地图独立基准缺失先补提；真实外部依赖才阻塞。未实现邻接目的地和战斗不冒充完成，也不借此吞掉地图进入的源副作用。
