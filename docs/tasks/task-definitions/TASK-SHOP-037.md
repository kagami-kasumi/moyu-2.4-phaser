# TASK-SHOP-037 · 杂货商升级任务与全货品解锁

## 目标
玩家在卡萨诺城一杂货商处接受并资助2–5级升级任务，解锁对应商品，领取各阶段奖励，跨地图和保存继续保持任务、商人等级和库存。

## 输入
依赖TASK-WORLD-036。选择理由：两地区往返已连通，但普通商店仍只开放初始4项；按同一升级机制一次覆盖四阶段任务，可把已注册的16件商品转为自然可购买，而非继续受控测试解锁。源DefineSprite_4536/frame_1:172注册奈奈安jobLevels1/jobMaxLevels5/cmd71；DefineSprite_4312/frame_1 case71/8400/8401/8402；frame_9/DoAction_2的shop.levelNum/jhLevelsUp；DefineSprite_2210_任务系统/frame_1/DoAction_2:57–60四个branchTask；同sprite DoAction.as getPrize、领取按钮、任务展示与状态收尾。持久化含npcState对应jobLevels、四任务isDoing/isComplete/need数量和shop.openNumber。

## 范围
四阶段受理、资助、升级库存、任务状态可见、独立领取奖励与一次性保护；全16货品可见/购买、费用不足、满包奖励掉落、声望封顶、跨场和存取。冻结并区分资助完成与领取奖励的时点，不按说明文字猜测发放数量。复用现有杂货交易，不开放其他商人升级、全局任务链或社交。

## 输出
四任务源枚举/独立oracle、杂货商任务领域与UI、已注册源字段消费者、两职业正常全阶段和边界测试、截图、覆盖台账。

## 验收
- 对照全部四阶段价格、解锁索引、接受/完成/领取标记、奖励对象与数量、消息、随机调用与满包行为；所有条件阈值前后、声望封顶与重复领取。
- 两职业无probe从初始店到满级店，真实购买末级商品并查看使用边界，领取四阶段奖励、往返、刷新及真实导入；受控不足/满包与过期回调。
- 任务待领取/已领取分别保存；旧raw可迁入并保留未实现任务/其他NPC状态，不用商店货位数反推伪造完成任务。
- npm run typecheck、npm test、npm run build、npm run test:browser、npm run check:save和generate:harness/check:harness；实际查看截图。

## 停止与拆分
本项是完整杂货升级机制，不拆单阶段或单奖励。原版状态不一致应按证据明确恢复策略，不以猜测替代源；需要真实外部输入时才阻塞。其他商人、社交与全主线任务另排。
