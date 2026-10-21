# TASK-ITEM-060 · 全队药品与储备自动分配

## 目标
玩家在背包使用七类药品或两类储备时，人物与三个真实出征幻兽按原版优先级接受治疗，库存和储备与存档一致。

## 输入
依赖TASK-WORLD-059。frame9 useItem药品与储备完整分支、4591人物setThing、4556幻兽setThing及HuanShouMC/Class生命绑定和setter；023冻结source-functions及source-consumables-oracle；现有applyMedicine/useReserve纯规则、PetProgression三槽与合体/铃铛，实际Inventory.use目前未传幻兽面板。选择理由：恢复储备已接通，背包消费仍只作用人物，补齐现有治疗旅程的真实全队消费。

## 范围
全部七种药品、生命之源、魔力源泉；人物与1/2/3槽、同缺口优先级、合体/死亡/召回/空槽/铃铛/两职业；先MP再HP、原首匹配扣除、储备顺序与不足、不消费容器。保持指定幻兽整格治疗独立，保留旧档，未知归属拒绝消费，旧按钮/新建/跨图隔离。

## 输出
有界源合同、运行时全队目标绑定与正式消费反馈、独立oracle矩阵、两职业浏览器和真实文件存取证据。

## 验收
全九项与源useItem对照、平局/严格大于/死人物正MP拒绝/先MP副作用、三槽顺序、原库存扣除、死亡未出征无治疗、铃铛上限、合体不改状态；无probe正常采购使用与跨图补充，受控受伤三槽真实存取；typecheck、npm test、build、check:save、专项和药店/治疗/合体浏览器回归，截图检查，generate:harness/check:harness。

## 停止与拆分
不增加假战斗或自动喝药循环；不得将纯规则既有测试代替真实Inventory接线验证。未知对象归属保留原字段并拒绝，不用猜测完成。
