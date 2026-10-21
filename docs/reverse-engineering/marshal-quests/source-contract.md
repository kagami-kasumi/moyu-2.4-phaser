# 元帅两任务源合同

## verified

- `DefineSprite_4312/frame_1/DoAction.as` cmd171仅在chaw/militaryRank为0时显示177/178；179/180仅检查isDoing，不重置进度或complete。180创建一个龙怪头目行踪。正常领奖使对应爵位/军衔至少1，接取入口消失；不把原函数改写为凭complete拒绝。
- 异常旧档若同时保存complete=true、doing=false、对应爵位/军衔=0，原菜单仍能接取既有已完成任务；本实现保留这个原版可达性，不凭空添加完成标志限制。正常旅程及重复旧回调不会产生这种组合。
- `DefineSprite_2210_任务系统/frame_1/DoAction_2.as` branchTask0为军衔：等级1、1龙怪头目、1000军功+幸运之门；branchTask1为爵位：等级1、5龙怪精英、1000功勋+风元素。
- allTask=[dailyTask,mainTask,branchTask,dareTask]，catchThing逆序扫描，首次符合后立即return。因此两支线优先于训练四，精英击杀不能双计。getPrize逆序发奖（先物品后功绩），支线领奖保留complete、清doing；原档不保存need.number。
- RoleMC.exploitUp/militaryExploitUp累计阈值、封顶、仅晋升不降级。xxx_chaw给勋爵3战斗力；xxx_militaryRank非零分支只更改名称，不凭军衔杜撰额外战斗力。
- 已接通FirstCombat的catch事件作为玩家/幻兽击杀共同入口；来源由first-combat源合同及冻结战斗脚本定义。护卫、龙王、普通龙怪均不能匹配这两个目标。

## design

现代确认有会话revision与角色所有权保护，离开皇宫、取消、新建、恢复使旧确认失效。任务栏可跨图领奖，死亡拒绝。部分数量保存于marshalQuests扩展，原doing/complete写回branchTask0/1；旧档已完成恢复完整数量，未完成只能恢复0，不猜测历史击杀。原有高军衔爵位保留。

幸运之门仅持有保存，使用给明确未开放提示且不消费。风元素走既有正式打造。新图、其他支线、社交不在本交付内。
