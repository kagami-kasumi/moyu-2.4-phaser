# 验证记录

TASK-PET-048，2026-10-12，已完成。

- typecheck、npm test、build、check:save通过；结构性删除最终改动后另跑check:save及收藏领域3项通过。日志`.evidence/pet-collection-{typecheck,tests,build,save-final,domain}.log`。
- 独立原排序/四格显示/对象身份删除覆盖0/1/4/5/39/40、同分、未知评分、末页删除、取消、重复和旧确认/旧取消、保护初始出征；同物种不同记录的未知raw后缀、三次保存恢复及重新孵化归属通过，999号未知占位不误删。
- 相关浏览器首轮14项回归通过；收藏2项因测试误把单颗新手蛋当堆叠失败。改为无probe真实城三购买6颗后战士通过，法师需与已有商店测试一样等待切图输入生效；修正等待后通过。
- 最终构建上的完整收藏3项全部通过（两职业正常购买/五次孵化/四格分页/取消/旧确认/释放/再孵化/刷新/实际文件导入，另有40→39→40容量及再次孵化拒绝）。日志`.evidence/pet-collection-final-browser.log`。此前14项详情/孵化/商店/升级/背包相关回归见`pet-collection-browser.log`，失败过程保留而非记为首轮全通过。
- 已查看warrior-released.png和mage-restored.png：页数、对象选择、释放反馈和恢复均对应实际记录。详情面板可滚动显示全部分项；布局为design。
- generate:harness/check:harness及git diff --check通过。battle=true暂不能释放，召回未开放是明确design限制；未宣称敌人战斗、跟随、合体或成长已完成。
