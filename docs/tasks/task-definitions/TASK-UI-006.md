# TASK-UI-006 · 首页直接进入可交互游戏

## 目标
npm run dev 后首页直接显示可交互城郊；移除示范页的标题、说明侧栏与页脚。

## 输入
- [地图与移动证据](../../reverse-engineering/first-slice/source-contract.md)
- [礼包证据](../../reverse-engineering/npc-reward/source-contract.md)
- index.html、src/journey-main.ts、src/adapters/reward-view.ts。

## 范围
默认新建玩家男战士进入城郊，背包与对话在舞台内操作，原新建流程保留 ?setup 入口。此次入口与HTML面板布局为design，不宣称已经复原原版完整HUD。保留既有规则边界，不捏造未取证的玩法。

## 输出
游戏首页、入口样式、默认冷启动浏览器检查及运行说明。

## 验收
npm run typecheck、npm test、npm run test:browser、npm run check:harness。默认首页无示范侧栏，真实键盘移动、老兵对话与背包可用，关闭面板后可继续操作；既有地图和动作对照通过。

## 停止与拆分
原版完整HUD、战斗和后续地图需要独立证据与后续合同；不能将本任务描述为完整游戏复刻。实际缺少输入才阻塞。
