# TASK-WORLD-073 · 戈壁城与幻境往返

## 目标

承接072真实两职业完成档，从已解锁的戈壁郊区进入戈壁城，使用城市药店/首赠幻境，真实完成四幻影守卫魔战斗、消费奖励并返回正确homeCity，保存/刷新/导入形成闭环。

选择理由：接应国王完成后现有戈壁城市入口仍关闭，是当前玩家旅程的直接缺口；优先城市及同城幻境，不跳到无关物品或未到达的沼泽。

## 输入

072两职业.evidence/gobi-battle/*-home.json或reward-used.json。原AS/P-code/XML在local-resources/moyu/source-index：4536/frame39戈壁、frame40戈壁幻境、frame1 monsterDeath/dropItemX/SuperHS；4116守卫魔选择器、4312药剂师与城市NPC；root城市首赠、随机侵入、homeCity及保存恢复。071同类城市链和072战场homeCity作为相邻回归输入。

有界调查已确认frame39回郊区entry3，药店库存至少6、huanShouShop2.openNumber=5（独立第二宠物商店，不能写到旧shop1）；城市设homeCity、共享随机侵入计时、一次首赠戈壁幻境。frame40四守卫魔45级、base0、基础生命51*20，attackFire基础230，选择器/技能须进一步独立核对。原脚本隐藏并配置entry6回城，但清场monsterDeath打开entry1，且随机入口使用entry1；必须核对XML实际实例/运行原语义，不猜测用出口替代。每怪声望1/dropItemX(2)，清场SuperHS(20)+英雄令。

## 范围

两地图/连接/原素材碰撞，四守卫魔全部动作与命中、普通与清场全部奖励、首赠/物品入口/随机侵入、药店六商品、homeCity及跨战场oldCity/幸运/死亡返回、所有新增持久字段与旧档。戈壁指挥官、幻兽装备师、独立第二幻兽商的交易业务及野外/地产/国王荣誉领取另包；本次明确显示服务未开放并保留原状态，不假称shop2交易已实现。这些独立服务可单独验收，不删去本次城市战斗奖励或返程要求。

## 输出

独立源合同/fixture/FFDec基线、check:gobi-city；正式地图/战斗/药店/存档实现；源函数、领域与浏览器验证、评审、覆盖台账。原素材只读。

## 验收

先证明entry1/entry6源冲突、地图/所有动作/数值/随机调用/末帧、奖励及原工厂行为；必要现代修复标design，不能写verified。独立XML/PNG检查地面和碰撞。两职业从072档正常成长和输入打完四怪，真实拾取并使用英雄令/其他奖励，回城、刷新、实际文件导入；不能注入战力或kill。受控覆盖满包、首赠只一次、共享计时、锁出口、部分/清空保存、死亡/幸运/战场oldCity、重复和旧回调、旧档与非法拒绝。执行typecheck、npm test、build、check:save、check:gobi-city、专项浏览器及072/071相邻回归；解析器变更再check:source，generate:harness/check:harness。

## 停止与拆分

源/工具实际不可用或必须用户裁决才Blocked。入口脚本不一致先取证；明确源缺陷时做最小可追溯现代闭环修复，不默默猜造原行为。取证/转换/实现/测试在同合同内，不因耗时或上下文拆分；独立城市服务后续合同承接，不宣称全戈壁完成。
