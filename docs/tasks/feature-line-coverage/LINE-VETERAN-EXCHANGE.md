# 老兵勋章兑换 · 覆盖合同

范围为 [TASK-NPC-010](../task-definitions/TASK-NPC-010.md)，状态唯一来源为 [state.json](../state.json)。

关闭条件：首次礼包后的老兵勋章兑换可实际操作，源规则、扣除/发放与满包回收守恒，失败和重复操作安全，对话生命周期有源对照与浏览器证据。等级奖励、宝盒使用、战斗与存档不在本线范围。

关闭证据：[源合同](../../reverse-engineering/veteran-exchange/source-contract.md)、[验证报告](../../reverse-engineering/veteran-exchange/validation.md)、冻结源函数和逻辑/浏览器测试。42项逻辑与21项完整浏览器通过；实际检查兑换邀请、属性、不足、满包回收和切图六张截图。付费可重复，旧回答不可重放；上述关闭条件均已覆盖。
