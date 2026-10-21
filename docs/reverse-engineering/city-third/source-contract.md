# 城三源合同

verified：4536/frame10 entry4→城三entry1；frame12 entry1→城二entry4，entry2→树心城郊区entry1。frame12完整脚本仅有allowJumpMap、入口赋值、安全区、三个appear、homeCity城二及back.mp3。无新增首次奖励或随机分支。落点城三(42,411.6)，返回城二(540,415.6)。

verified：frame12背景4329，ground实例2805→2804，矩阵[-1,0,0,1,580,0]，alpha77/256。必须对形状坐标逆变换判碰撞，对渲染应用同一实例矩阵。NPC按appear顺序为幻兽商(260,300)、幻兽幻化师(380,300)、经验导师(100,350)，4308标签37/51/34分别为4279/4291/4277。首NPC实例Y缩放65512/65536。

verified：4312 cmd161提供经验兑换162与分解163；后两者均关闭对话、打开giveThing和背包，无距离、费用或身份前置。回收规则继续消费042已确认合同。

design：导师点击直接打开已有合并回收面板及背包，省略导航菜单；保留两服务确认链及背包快捷入口。幻兽商、幻化师、树心地区显示未开放。音乐尚无播放器，不声称音轨复现。四地图恢复不重跑地图脚本；现代存档接受cityThird并输出源map_nowMap城三。

独立证据：source-fixture.json冻结FFDec XML完整显示列表、NPC帧、ground子时间轴和Action哈希；source-functions.json冻结AS/P-code。baseline由FFDec独立导出。check-city-third由原SWF临时重建与独立XML/PNG和正式产物比较，背景/NPC像素一致；轮廓抗锯齿平均预乘RGBA误差0.01578。
