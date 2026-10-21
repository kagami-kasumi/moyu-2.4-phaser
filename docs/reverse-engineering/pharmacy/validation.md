# TASK-SHOP-026 验证

2026-10-09。规则/字段/边界见 [源合同](source-contract.md)。七项药品目录独立冻结并与真实SWF/XML实例核对；正常只开放2项。

## 检查结果

- `npm run typecheck`、`npm run build`通过，保留现有Vite大块体积提示。
- `npm test`129项通过（107+22），日志 `.evidence/pharmacy/logic.log`；七种药品各数量1/3/99×空槽0/1/40与源函数逐项对比，含落地/扣款、完整工厂字段、开放档位、两商店隔离及旧raw推广。
- `npm run check:save`653映射和14项通过，日志 `.evidence/pharmacy/save.log`。
- `npx playwright test tests/browser/pharmacy.spec.mjs tests/browser/ordinary-shop.spec.mjs`6项通过（1.5分钟）。两职业无probe真实入城→购买3个小型生命药→使用1个→分两格出售余下2个→买入并使用小型魔力药，最终余额99,999,970、药品清空；刷新和实际下载/上传导入后保持。受控超级药把生命/魔力补至上限，满包/不足均保留材料和余额。
- `npm run test:browser -- --workers=2`全量56项通过（3.1分钟），日志 `.evidence/pharmacy/browser.log`。
- `npm run check:harness`通过；状态收尾重新generate/check。

## 实际画面与修复

检查 `.evidence/pharmacy/warrior-bought.png`、`healed.png`、`all-stock.png`、`mage-restored.png`。完整七条目录可见、正常开放2条，药品单件占格符合源规则，恢复余额与物品一致。

首次回归发现HTML商店按钮的pointerup可触发背后药剂师；已给药剂师和杂货商加面板输入隔离，原杂货受控重复选择和药店全旅程共同复验通过。首次药店测试误把两个单件药品当一堆，已按源非堆叠语义分别出售，未为测试改变实现。

限制：旧文件中的外区4/6/7解锁仅受控验证，当前可达地图不新增解锁来源；未加入战斗/宠物用药/快捷栏/安全区恢复。原SWF与原提取物只读，没有提交、推送或发布。
