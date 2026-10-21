# 030 等级奖励归属

`NpcReward.upLevelPrize`拥有下一待领档（默认1），`GameProgress.reward.upLevelPrize`保存，并同步原raw.upLevelPrize。旧现代扩展缺失时只从raw推广；raw也缺失才用1，非正整数拒绝，未知字段保持原位。

人物等级来自Journey.vitals的只读回调，避免在奖励对象中保存另一份等级。首次礼包cmd/claimedPack与等级领奖独立；只有首次礼包后的cmd6菜单开放cmd8，nextCmd仍归一为6保存。临时offeredPrize和revision不持久化。

提交奖励先推进upLevelPrize，后由既有store或货币setter发放；满包不回滚计数、不重发物品。关闭、切图和新建使旧选择无效。备份恢复对应整个存档状态，不把已领取标记与旧货币/背包跨存档拼接。
