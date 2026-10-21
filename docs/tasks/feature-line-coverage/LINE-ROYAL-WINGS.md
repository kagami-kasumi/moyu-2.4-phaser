# 皇宫侧区与王室宝箱覆盖

TASK-WORLD-063覆盖东宫、殿外、花园、观天亭四地图和两王室宝箱首次/重复奖励、随机NPC位置、原始命令迁移与九地点保存。

源覆盖：4536/frame13–17、4308/frame23/24/54/56、四个地面逐边样式、11张独立FFDec图像、4312的8个命令与luckyDraw2/3全部20000种随机输入。正式代码见map-layout、royal-chests、Journey、Save codec和对应adapter。验证详情见[记录](../../reverse-engineering/royal-wings/validation.md)。

关闭条件：两职业无probe自然往返、真实使用宝箱材料、全部九地点刷新/文件导入、领取状态不重置；受控全10奖品、满包/材料不足/严格等候与未知旧命令，以及全部合同门禁通过。王室社交与PK战斗仍属后续；下一地区战斗不计入本线完成范围。
