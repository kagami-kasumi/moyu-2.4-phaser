# 54格仓库源合同

verified：frame9/DoAction.as:1725起wareHouse.number=54及setThing/notice/initData；ThingMC的number/room/addNumber；frame9/DoAction_2保存wareHouse_number及每格字段，恢复按固定wareHouse.number循环，并未读取保存的wareHouse_number扩容。完整函数与AS/P-code哈希见source-functions.json。

入仓：当target.number>0，按1到54顺序查找同type且room>0、name相同或目的格name缺省的格；依次addNumber，未装完更新target.number。room仅在现有number>0时为99−number，否则0。合并结束后仍有余量，则放第一个空格。满仓返回false，已经发生的部分合并不会回滚，target保留余数。数量0物品不合并。空格接收整件对象和全部已登记字段，不按名称重新造物；notice才清除来源格。

原拖放使用mover持有中间物；仓库拒绝时余量仍在mover。design：现代整格存入按钮将该余量保留在原背包格，消除不可见游标物品，同时保留数量守恒和源合并顺序。取回按钮复用已验证backPack.setThing：先堆叠/空格，满背包按源throwGoods落地，不暗中销毁。背包直接入口为现代design，原入口4312/frame1 cmd153位于军团管理员，不声称对应地图已经开放。

持久化：54槽独占。已实现物品由已注册wareHouse动态字段迁入，并回写同一编号1–54；固定容量54。已知但非法字段拒绝恢复。未识别的旧物品不变成可执行Item，以reserved索引占据原仓格，UI显示“未实现物品（保留）”，不可存入覆盖或取出执行，原raw字段保持不变。未知额外字段照旧保留。此保留/校验策略为design。

关闭/切图不清库；新建清库。现代revision、物品身份和角色所有权防止重复/过期回调。世界战斗、仓库扩容、军团与全局拖放均不在此证据范围。

补充恢复隔离：只把仓库items/reserved及融合stone1/stone2赋给运行时所有者，不把未知扩展键整体Object.assign到实例。新增字段可以保留，但不能替换reward、available、show或open；此设计用实际构造的未来元数据往返测试验证。
