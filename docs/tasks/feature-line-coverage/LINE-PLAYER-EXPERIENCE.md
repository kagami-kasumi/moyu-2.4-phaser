# 经验球人物升级 · 覆盖合同

范围为 [TASK-GROWTH-014](../task-definitions/TASK-GROWTH-014.md)，状态唯一来源为 [state.json](../state.json)。

关闭条件：普通经验球的人物分配确认→扣除→经验/升级→HUD和属性反馈形成正常可玩路径；源阈值、满级/死亡/数量和生命周期边界有独立期望与浏览器证据。幻兽分配、超级经验球、转世/成神、战斗经验、等级奖励和新存档格式不在范围；人物成长通过现有完整存档的保存/继续及备份恢复属于验收。

关闭证据（2026-10-09）：[源合同](../../reverse-engineering/player-experience/source-contract.md)、[验证报告](../../reverse-engineering/player-experience/validation.md)。默认人物分配、逐级阈值/150余数、单件与前向扣除、装备/英勇/戒指重算和回满、HUD及两职业完整保存/导入/备份恢复均已覆盖。107逻辑与43浏览器检查通过，10张画面实际检查。

本线要求已满足；后续人物消耗品与储备资源交[TASK-ITEM-023](../task-definitions/TASK-ITEM-023.md)，幻兽成长、转世/成神和战斗经验仍未开放，不算完整游戏完成。
