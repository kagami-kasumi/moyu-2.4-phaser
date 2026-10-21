# 产权验证

2026-10-09：冻结AS/P-code哈希与216组爵位/魔石/资源矩阵通过。source oracle比较产权、扣款、资源封顶和失败消息；另验证十次真实勇士勋章取得勋爵、购买、完整保存/恢复、同实例旧回调、切图和新建隔离。

旧档缺现代产权/爵位字段时提升raw，保留高于功勋阈值的原版爵位；其他地区产权与未来raw字段保留。非布尔产权和非法爵位拒绝。

两职业无probe正常失败→取消→使用10枚勋章→出售资源→确认购买→重复保护→保存导出→刷新→真实文件导入，3/3浏览器专项通过。受控99魔石失败、100魔石成功、资源封顶、关闭/切图和新建检查通过。实际查看`.evidence/outskirts-property/`两职业confirm/owned/restored与insufficient截图，布局、余额和资格可读。普通资产状态与未来野外收益边界明确显示。

npm run typecheck、npm test、npm run build、npm run check:save、npm run check:harness全部通过；npm run test:browser -- --workers=2为84/84通过。完整日志在.evidence/outskirts-property。此项不实现战斗资源收益、其他地区产权或幻兽复活。
