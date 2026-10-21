# 幻兽评称验证

- `tests/pet-titles.test.mjs`：49固定种子加奇迹龙×4名额×3评分边界×2既有称号，共1200组与完整源类及2327函数逐字段对比；原始25种名额索引独立从AS声明枚举。五次同种、不同种、无/重复匹配源异常、零费用、生命保留、取消/旧回调/跨图/新建、三次真实codec与未知raw保留均通过（4测试）。
- 两职业无probe正常低分拒绝，受控五只高分幻兽依次5/4/3/2/2称号及上限+50，期间取消、重复按钮、保存/刷新/真实导入，旧档异常名额保留并拒绝操作，4浏览器测试通过。
- `.evidence/pet-titles`保存截图与真实导出文件；已目视检查至尊结果、异常名额反馈，无裁切或遮挡。高分输入明确为受控fixture，未宣称通过自然掉落取得。
- typecheck和build通过；构建仅现有大chunk提示。完整测试、存档和相关回归结果以任务completion为准。

源规则与现代入口/未知名额策略见source-contract.md。评称快捷入口不表示冰宫或白衣圣兽师社交旅程已经实现。

最终`npm test`、`npm run check:save`通过；转世/详情浏览器联合6项通过；typecheck、build、git diff --check与generate:harness/check:harness通过。
