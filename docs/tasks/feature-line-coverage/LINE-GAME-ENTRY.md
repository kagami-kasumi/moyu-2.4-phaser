# 直接进入游戏 · 覆盖合同

关闭条件：默认首页直接进入城郊，去除示范页外壳，场内对话/背包可操作，真实浏览器验证通过。布局是design，原图与已确认规则延用现有证据。完整原版HUD与未实现玩法不在本次完成声明内。

## 验收结果

默认首页直接进入地图；真实键盘移动、老兵交互、背包开关和Esc检查通过。typecheck、23项逻辑测试、build通过。最终代码的浏览器全量运行10项通过，剩余满包用例因旧步骤未关闭模态面板失败；补上真实Esc操作后定向重跑通过（npx playwright test tests/browser/npc-reward.spec.mjs --grep "full backpack"）。地图投影、44动作投影和11图标对照保留独立源期望。截图：.evidence/game-entry/default.png、.evidence/npc-reward/pack-1.png。

当前仍是两张地图与礼包交互；到达城一后的流程、完整原版HUD、战斗和存档未完成。下一开发范围应以原版界面证据补齐实际游戏功能。
