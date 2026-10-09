# TASK-ENTRY-021 验证报告

2026-10-08。交付开始菜单→两种源职业→命名→进入城郊→移动到城内，以及返回/取消、原版职业HUD、初始化与老兵职业装备。原版事实、现代设计和后续边界见 [source-contract.md](source-contract.md)。

## 实际检查

| 命令 | 结果与范围 |
| --- | --- |
| `npm run check:character-entry` | 通过：独立XML对矩阵/子时间轴/标签/补充HUD，11张FFDec RGBA逐像素零差异，正式资源与临时重建一致；6项源初始化/奖励/职业装备/原子提交/时钟/声望称号专项。 |
| `npm run check:first-actor` | 通过：既有30放置、23shape、动作字节与22张男战士独立基准，扩展转换器未造成漂移。 |
| `npm run typecheck` | 通过。 |
| `npm test` | 79/79通过，保留现有源oracle；日志 `.evidence/character-entry/logic.log`。 |
| `npm run build` | 通过，亦由全量浏览器命令重新执行；保留既有大chunk提示。 |
| `npm run test:browser` | 32/32通过，Edge冷启动dist；日志 `.evidence/character-entry/browser.log`。 |
| `npm run check:source` | 5/5解析器测试与原SWF清单/哈希检查通过。 |

全量浏览器中新增5项：菜单/返回/取消/空名/10字符/既有存储保护；普通男战士完整入口；普通女法师完整入口；debug名可见结果；22组女法师双向逐帧投影。两职业无probe用真实按键与鼠标移动、领取礼包、穿戴武器/衣服，再走右侧传送点到城内。原44组男战士投影、地图独立画面对照、HUD、背包、地面物品、勋章兑换、开孔/魔魂/品质等原有27项全部保留。

女法师逐帧浏览器expected来自冻结FFDec PNG与独立XML矩阵；actual来自Phaser画布，不共用运行清单生成expected。结果 `.evidence/character-entry/browser-comparison.json`，沿用原投影容差：RGB均值误差<.03/255、单通道差>16的像素<60。转换层要求严格RGBA一致。alpha bounds记录于 `conversion.json`，不当作pivot或碰撞盒。

## 实际画面复核

实际打开16张本轮截图，分四张contact sheet `.evidence/character-entry/review-1.png`—`review-4.png`：

- menu、selection、mage-name、cancel：菜单清晰，角色选项完整，名字编辑/返回/取消可见，继续入口明确禁用。
- warrior-idle/left/right/equipment、mage-idle/left/right/equipment：两职业贴图与头像不同，法师火球术图标、男战士斩魂图标正确；跑动没有裁边或注册点跳位；职业装备和属性可见，HUD保留。
- ten-character-mage、debug-mage、warrior-city、mage-city：10字符名显示、debug等级100/满包/掉落、两职业城内落点与场景正确。

源贴图外观较粗糙，依用户指定保留原HUD；菜单为design。debug新增未有图标的物品沿用现有文字badge，未用男战士头像/斩魂图标冒充法师。地面掉落列表沿用可滚动面板。

## 发现与修正

- 原入口默认自动男战士改为必须菜单确认；既有浏览器用例调整为真实走菜单，刷新后也要新建，不增加隐式自动跳过入口。
- 补齐wudi声望500→称号10→属性刷新+20战斗力；旧测试的战斗力期望相应修正，并新增直接执行原credit setter及role.init的独立检查。
- debug源先wudi后debug，普通初值不会因为名称debug直接按100级重建；随机戒指、物品堆叠与7次掉落和独立源一致。新建取消不调用领域初始化、不访问存储。
- 法师旅者装的未刷新源分支保留，禁止统一生成逻辑偷偷重算该件装备。职业限制和后续打造仍工作。

## 边界与后续

本任务不实现存储IO、法师技能攻击、幻兽战斗、任务界面或其余地图。继续按钮待016接通；016须从019全字段合同、021实际可玩状态与initialState建立完整存储/恢复映射，恢复不能调用带奖励的新建流程，debug读取也不能重复发放。基础功能线保持Active。

收尾状态生成和harness检查记录在state.json的completion中；未提交、推送或发布。
