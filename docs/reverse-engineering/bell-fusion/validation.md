# TASK-PET-052 验证

- 冻结AS完整makeBell/upDataWeapon与三文件SHA256，12,960组有序类型、品质、纯度、属性/技能和随机分支对照通过。
- 领域测试覆盖无费用、失败零消费、旧确认、满包替换/取回掉落、双槽保存、raw推广、未知占槽、扩展字段不复活和会话隔离。
- typecheck、npm test、build、check:save通过，日志`.evidence/bell-fusion/npm-test.log`与`check-save.log`。
- 铃铛融合/装备/宝石融合浏览器9项通过。两职业受控铃铛经真实文件导入，正式UI融合、装备、跨图持有保存、刷新及再次导入；满包取回和关闭旧回调通过。
- 实际查看`.evidence/bell-fusion/战士-restored.png`，修正保存提示遮挡；补跑融合专项并检查新截图。外观为design；自然铃铛掉落和技能战斗触发未开放。
