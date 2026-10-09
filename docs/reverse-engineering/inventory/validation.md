# 背包使用与装备 · 验证报告

2026-10-05，TASK-ITEM-008。

## 完成交付
X 打开背包，选择物品后可使用/孵化/学习/装备；E 或原人物按钮打开装备栏，可卸下并查看实时属性。货币袋、三类材料礼包、普通字面量幻兽蛋、英勇书、勇士勋章已接入；当前四类战士装备和戒指可穿戴/替换/卸下。关闭重开与切图保持，刷新按现有规则新建。

## 实际验证
- `npm run typecheck`、`npm test`（32/32）、`npm run build` 通过。
- `npm run test:browser`（16/16，Edge）通过。新三项覆盖冷启动真实点击货币包/材料包/孵化/英勇/戒指、老兵四件装备与卸下、关闭重开/键盘输入隔离、切图保持/重新开局重置。既有44动作投影、地图、NPC和原HUD画面对照保持通过。
- `npm run check:first-actor`、`npm run check:first-slice`、`npm run check:npc-reward`、`npm run check:original-ui` 均通过：源标签、Action、AS/P-code及独立FFDec图像和正式资源复核。
- 新源测试复核冻结AS/P-code哈希；32种装备子集对独立源属性函数；货币/三类材料礼包对源useItem；全部支持蛋记录对源字面量；英勇0至50级对源addSkill；勋章反复使用至双上限对源函数。另覆盖职业/等级拒绝、过期物品身份、满包换装/卸下、满幻兽容量、未开放道具不消耗。
- `.evidence/inventory/inventory-and-equipment.png`、`veteran-equipment.png`、`city-equipment.png` 保存浏览器画面；已视觉检查背包与装备并排、文字无溢出、四件装备及数值可读。缺失既有提取图标的材料用现代文字徽标，未误用空图标。

## 限制
只覆盖当前可取得装备的基础/魔魂与戒指属性，未实现打造后的孔/元素/附魔/幸运符体系。人物战斗力明确不含幻兽，未声明实际战斗结算。经验球分配、地图任务道具、打造/社交/培养仍提示未开放并保留物品。地面掉落沿用现有显示和切图清理，拾取未开放。新面板、E快捷键和文字徽标均为design，不宣称原UI像素一致。源函数替身测试不是原Flash运行。

构建仍保留既有Phaser大包提示；无新增运行时SWF依赖。未提交、推送或发布。

最终满包换装提示修正后，类型、32项逻辑与构建再次通过，`npx playwright test tests/browser/inventory.spec.mjs` 3/3通过。
