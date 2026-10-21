# TASK-PET-058 · 幻兽合体状态与人物属性

## 目标
玩家在收藏详情切换出征幻兽的合体/分离，人物攻击防御即时按原规则变化，幻兽随行显隐和存档状态一致。

## 输入
依赖TASK-PET-057。frame9 DoAction.as huanShou.inOne/battle与flashHuanShouView；4556/frame1 inOneButton、flashView/flashAttribute、close/toDeath；RoleMC.flashAttribute约1161..1183三槽合体属性叠加；HuanShouMC.battle/reBattle与死亡入口；已实现PetProgression三槽、铃铛、成长和完整存档。选择理由：养成服务和称号已贯通，inOne原字段已保存但玩家不能操作，补齐出征到人物属性收益的独立可观察能力。

## 范围
全部注册物种与三活动槽；出征/死亡/召回的合体前置及解除顺序；合体只加源minAttack/maxAttack/defense，战斗力仍按全部开放槽计算，不能重复叠加。装备铃铛、成长、复活和称号更新后重算；现代随行标识合体隐藏/分离恢复；两职业人物属性视图、跨图、新建、旧按钮和存档。按源核对旧档inOne与battle/life不一致的边界，不默默修复未知数据。伤害转移、幻兽攻击和敌人战斗属于后续战斗能力，本任务不开放假战斗入口。

## 输出
完整有界源合同/独立oracle、合体纯领域及人物属性消费端、正式切换界面、两职业浏览器/存档证据及验证记录。

## 验收
源完整相关函数对照全物种、两职业、1/2/3槽、死亡/召回/重复切换和铃铛加成；属性叠加在人物自身倍率处理之后，不重复计战斗力；生命魔力上限不凭合体增加。无probe正常出征/合体/分离/成长/跨图及实际存取，受控三槽和旧档异常。typecheck、npm test、build、check:save、专项及出征/成长/评称回归、截图检查、generate:harness/check:harness。

## 停止与拆分
完整状态和属性旅程不按技术阶段拆分。战斗伤害链为可独立交付后续能力，不把当前按钮/属性通过写成战斗完成；关键对象归属未知时保留并拒绝危险操作。
