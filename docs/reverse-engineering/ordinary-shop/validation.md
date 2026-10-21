# TASK-SHOP-025 验证

2026-10-09：交付16条杂货完整目录、当前开放4条、真实奈奈安入口、购买/整格出售、已有强化联动、原始shop持久字段推广。规则和设计边界见 [源合同](source-contract.md)。

## 已执行

- `npm run typecheck` 通过。
- `npm test` 125项通过（107基础+18扩展）；随后新增满包可堆叠门槛/锁定商品/多堆出售专项，`node --experimental-transform-types --test tests/ordinary-shop.test.mjs` 6项全部通过。详见 `.evidence/ordinary-shop/logic.log` 与测试命令输出。
- `npm run build` 通过；Vite现有大块体积提示仍在，不是构建失败。
- `npm run test:browser` 53项通过（6.7分钟），日志 `.evidence/ordinary-shop/browser.log`。两职业无probe采购10个魔魂晶石→衣服+3到+4消耗8个→出售余下2个收入10，余额99,999,510。保存/刷新、实际下载再上传导入、备份恢复均一致；强化装备仍由打造槽持有，无重复。
- `npm run check:save` 653映射与14存档专项通过。杂货专项另验旧raw.shop推广、非法范围、未实现raw保留、新建重置和恢复关闭交易。
- `npm run check:source` 5项解析测试与原SWF清单通过。
- `npm run check:harness` 14项与文档检查通过；关闭后再生成校验派生视图。

## 画面与边界

实际检查 `.evidence/ordinary-shop/warrior-bought.png`、`warrior-crafted.png`、`mage-restored.png`、`full.png`、`all-stock.png`。交易标题、价格、数量、反馈、背包余额和强化结果可见，完整目录可滚动。修复了继续游戏提示条覆盖商店标题的问题，以及旧数量回调可能改变新选择数量的问题；最终商店浏览器专项重跑3项全部通过（53.4秒），更新后的mage-restored截图已复核，提示不再覆盖标题。

原始SWF/XML绑定、AS/P-code哈希、16条各1/3/99数量与0/1/40空槽，覆盖成功/余额不足/部分入包与落地/全额扣款；销售测试覆盖无售价、0价、0数量、装备、多堆选择、封顶。数量NaN保持、上下界夹取、小数取整、重复选择99、取消重选1及旧回调拒绝都有验证。

限制：无完整Flash动态执行；oracle为离线冻结AS函数的有界替身，和真实原SWF标签/脚本哈希交叉核对。未开放商人职业升级、外区商店或未实现商品效果。没有提交、推送或发布。
