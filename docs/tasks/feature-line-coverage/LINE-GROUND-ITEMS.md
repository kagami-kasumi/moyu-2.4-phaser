# 地面掉落拾取 · 覆盖合同

范围为 [TASK-ITEM-009](../task-definitions/TASK-ITEM-009.md)，状态唯一来源为 [state.json](../state.json)。

关闭条件：满包产生的物品可以按已核验原规则点击/快捷拾取，属性与数量守恒，失败可恢复，场景和背包同步；重复操作、容量和范围边界、切图清理有独立源测试及真实浏览器证据。未覆盖战斗掉落、主动丢弃、商店和存档。

关闭依据：[源合同](../../reverse-engineering/ground-items/source-contract.md)、[验证报告](../../reverse-engineering/ground-items/validation.md)、6项拾取逻辑测试与2项浏览器专项；最终38项逻辑、18项全量浏览器回归通过，截图已检查。保留点击无距离与空格严格范围/倒序/空格门槛差异，已覆盖失败恢复、堆叠、重复与清理。
