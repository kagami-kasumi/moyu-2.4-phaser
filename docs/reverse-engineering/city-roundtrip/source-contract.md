# 两地图往返源合同

verified：map4536/frame8中郊区entry2→城一entry1；frame9中城一entry1→郊区entry2。相应落点由已冻结XML矩阵独立确认：城内(42,306.6)，返郊区(539,306.6)。当前两地图没有等级/道具门槛；其他出口指向未开放的野外一和城二。

verified：jumpMap检查角色位于可见入口，jumpToMap拒绝alpha0，allowJumpMap只允许请求目的地一致的帧，afterJumpMap把角色放在目标入口并清空nextMap/nextEntry。转场清掉落、关闭面板；Activities继续处理移动，没有首段到达即冻结。旧first-slice独立oracle保留原始函数与独立几何，继续用于双向落点/城内移动对照。

design：complete仍表示“曾到达卡萨诺城一”，用于兼容旧档，不再阻止移动/返回。现代只开放已验证的这两个地图，目标与入口预先验证后才改变任何状态。键盘Q/Ctrl只在首次keydown触发，repeat不重放；转场释放键鼠与面板，避免持键穿场。鼠标需真实捕获地面按下并走到入口后松开，远程点击不传送。

design：通知改为当前地区探索提示，不再要求刷新重开领取礼包。存档map/x/y及complete原格式不变；非当前地面物品不持久跨图，装备、背包、产权、爵位、商店货位与持有打造物继续保留。城内保存complete=true的旧现代档恢复后也可以移动。
