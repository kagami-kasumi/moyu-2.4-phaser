# 城二验证

已通过：typecheck、npm test、build、check:save、check:source、check:first-slice、check:city-second和check:harness。完整浏览器回归99/99通过；新增的受控城二出口/仓库输入隔离另跑1/1通过。后补的独立NPC/碰撞专项与既有城二测试合计5/5通过。

专项源检查：frame10完整显示列表、2803子时间轴、四个NPC标签、两段Action字节与AS/P-code哈希；五图独立FFDec对照。4328/4255/4261/4285预乘RGBA误差为0，2802平均0.012691887845636022，边缘最大63，沿用轮廓抗锯齿均值阈值0.03，几何坐标严格相等。新背景无显式MoveTo，转换器补SVG默认起点(0,0)，原14图回归不变。

专项逻辑：24组首次标记/随机阈值/计时边界；源四NPC坐标和四出口枚举；绕数算法独立检查城二碰撞网格；首次奖励、满包掉落、两方向落点、非法目标零修改、旧raw标记恢复、三地图codec往返以及新建重置通过。

两职业无probe专项浏览器均通过：城郊→城一→城二→城一→城郊，军团NPC打开仓库、存入取回英雄令，三个地点分别保存刷新并真实下载/导入；再入城二不重复发放幻境道具。实际查看warrior-city-second.png、mage-warehouse.png、mage-import-citySecond.png：地图、四NPC、女法师落点、物品栏和仓库可见，无遮挡关键仓库操作。

日志与截图位于`.evidence/city-second/`。存档字段cityVisit单独拥有并映射原始回城位置/一次性奖励字段；恢复不执行入图奖励。未实现幻境、邻接地区、军团战斗、城堡与挑战者服务采用明确design拒绝，范围见源合同。
