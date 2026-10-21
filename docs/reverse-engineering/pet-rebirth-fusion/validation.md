# 转世幻化验证

- `tests/pet-rebirth-fusion.test.mjs`：49种子+奇迹龙×4等级×6状态×2球选项，2400组对照2344、4556、完整HuanShouClass及HuanShouMC.expUp，逐字段与背包对比；含死亡、上限、缺晶石、低人物等级及顿悟。
- 另外确认预览不变更真实数据、取消与跨图/新建旧回调无效、对象附加字段三次codec持续保留。全部3测试通过。
- typecheck/build通过；build仅现有大chunk提示。
- 两职业正常人物经验球成长、拆灵魂礼包、城三选择/预览/取消/确认、消耗两球一晶石、刷新与真实导入通过。受控缺晶石明确预览部分消费，确认后经验保留但转世不加；上限先于经验球验证通过。
- `npx playwright test tests/browser/pet-rebirth-fusion.spec.mjs tests/browser/pet-main-fusion.spec.mjs --workers=2` 8项通过，截图`.evidence/pet-rebirth-fusion`已目视核查成功/失败预览，没有裁切。

完整检查状态以任务completion为准；源顺序见source-contract.md。修正了消耗匹配必须同name或无name，避免消费未知命名的经验球，主属性专项也已回归通过。

最终`npm test`、`npm run check:save`、git diff --check、generate:harness/check:harness通过。
