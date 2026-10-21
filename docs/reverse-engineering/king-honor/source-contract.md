# 国王荣誉任务源合同

verified：4536/frame13国王仅在接应国王.isComplete为true出现，位置320,250；frame1国王cmd9511。4308第33帧国王图4275，复用palace既有独立XML/FFDec基线，不新增动作或碰撞。首次接应奖励尚未领取也已满足出现条件。

verified：4312的9511依isDoing/isComplete分三菜单。9512执行setHonorTask(true)，仅非进行中时归零need怪物0/100并清complete；9513/14/15先setHonorTask(false)再给予当前声望×200魔石、×20000资源或20声望，关闭对话。setHonorTask(false)只清isDoing，保留number100与complete。每日任务名称不代表有定时重置；完成后可立即再次接受。

verified：2210任务levels1，怪物计数使用既有catchThing链和100封顶。RoleMC货币上限100000000；声望上限500，写入时titleLevel只向上更新为floor(credit/50)。三种奖励互斥，按领取时声望计算。源菜单是资格边界，现代直接API也检查资格。

design：国王DOM对话显示进度及三奖；生命周期/revision/所有权防旧回调。打开系统时暂停交互，恢复不重放奖励。直接NPC接受时清理既有荣誉询问提示，避免重复弹问。所有计数/资金/称号沿用现有存档字段，不新增每日时钟。

fixture为冻结原菜单、命令、任务函数、角色setter及AS/P-code哈希；测试执行这些原函数，独立对照新领域结果。源中其他国王或社交业务不在本任务。
