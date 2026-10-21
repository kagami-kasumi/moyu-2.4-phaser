# TASK-NPC-067 验证记录

## 已执行

- `npm run typecheck`：通过。
- `npm test`：通过（新增元帅五组测试；含完整旧逻辑回归）。首次运行商店旧opaque样本冲突，换到尚未开放的branchTask2后通过。
- `npm run build`：通过；已有大包体积提示仍在。
- `npm run check:save`：653字段与14项保存测试通过。
- `npm run check:marshal-quests`：原AS/P-code及独立Action通过。
- `npm run generate:harness` / `npm run check:harness`：通过；状态按本次完成归并；后续068接续。
- 浏览器受控满包接取/领奖、死亡、高阶旧档与旧按钮通过，截图在`.evidence/marshal-quests`，已实际查看full-tracking/full-prizes。

## 浏览器结果

- 两职业正常旅程重跑通过，日志`.evidence/marshal-retry.log`：从065真实导出正常成长后回皇宫，取消旧确认、同时接取、使用任务行踪、真实攻击头目、跨波五精英、部分/待领/已领导出、两种领奖、幸运之门不消费、风元素打造鞋并装备、刷新与真实导入。导出和截图为`.evidence/marshal-quests/{warrior,mage}-*`。
- 完整组合首次运行中，边界1项、palace3项、kasano-finale两职业2项全部通过；元帅正常2项因测试路线入口错误失败，修正后单独重跑2项通过，未将首次组合的退出码称为通过。相邻回归日志`.evidence/marshal-browser.log`。
- 样式复核发现任务栏与消息重叠，移到独立位置；修复后满包/高阶/死亡边界再跑通过，日志`.evidence/marshal-boundaries-final.log`。

原SWF、提取物与源解析器未修改，不额外扫描原始源。新冻结文件存独立目录；不自动提交或发布。幸运之门挑战由068负责，此任务仅持有与明确未开放提示。

最终正常导出布局复核两职业通过（marshal-final-layout.log），已查看warrior-final-layout与mage-final-stats：任务栏不再叠消息，勋爵/少尉、元素战斗力1可见。
