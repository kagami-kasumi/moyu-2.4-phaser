# TASK-NPC-067 自审

- 取证：独立XML Action与AS/P-code冻结；完整171资格矩阵与179/180接取执行，catch/getPrize/功绩函数作为oracle，未从现代实现生成expected。
- 发现并修正：branchTask优先返回，不能与训练四双计；初版任务栏继承guide的pointer-events:none，真实浏览器暴露后修复。
- 状态：任务数量与doing/complete单一所有者；接受确认由元帅revision保护，跨图/新建/恢复绑定到旧inventory的回调失效；领奖可跨图，角色死亡拒绝。
- 回归调整：商店两测试原以branchTask0作为“未开放字段”保留样本，现改用仍未实现的branchTask2；未知字段保留断言不删减。
- 边界：原档无部分数量，不从累计击杀推断；高爵位/军衔不降级。幸运之门保持可保存、未开放不消费；不冒充挑战已经交付。

本记录是主agent代码自审，不声称独立评审员执行。真实命令与浏览器结果见validation.md。
