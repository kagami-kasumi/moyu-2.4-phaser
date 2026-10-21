# 验证记录

TASK-PET-046，2026-10-12。

- typecheck、npm test（含新增4项、21,600个独立AS类组合）、build、check:save全部通过。日志`.evidence/pet-details-{typecheck,tests,build,save}.log`。
- 全116项浏览器：112直接通过，4项因旧面板“初始记录”文字断言和孵化状态说明失败。更新旧文字断言、恢复可见孵化状态，修正原绝对定位样式后，详情/背包/老兵10项复验全部通过。全量日志`.evidence/pet-details-full-browser.log`，复验`.evidence/pet-details-recheck.log`，没有把首次失败写成通过。
- 两职业真实城三购买、四次升级领奖、五幻兽选择、关闭旧按钮、切图、保存刷新、实际导入和新建重置通过，无probe路径。已查看warrior-details.png，选择区域不再覆盖属性；365高面板可滚动查看完整分项。
- 原类对照覆盖25物种/49固定种子、等级1/7/149/150、三世代、六元素和六称号；未知输入、源codec舍入差异及raw/扩展优先单列回归。
- generate:harness/check:harness通过。现代布局/明文数值差异见源合同；无新增战斗、出征、幻化或随机孵化能力。
