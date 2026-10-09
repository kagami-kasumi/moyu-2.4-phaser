# 月光宝盒开孔源合同

## verified
- 根 frame_9/DoAction.as make.setThing(2882) 接收四类装备、幸运符、戒指、宝石。新对象进入 item 或 stone；原槽非空时先 backPack.setThing 返还旧物，再放新物。notice 清空被取走槽位。
- makeItem(3384) 外层将戒指、幸运符分开处理，两者没有月光宝盒分支；四类装备进入普通装备分支。3750起三档宝盒只接受 holes 为0/1/2；成功 holes 加1、新 holeN=0、useGem() 消耗一个；失败返回 false。
- useGem(3356)：正数量减1，归零清空；零数量单件也清空。yesButton(3343) 成功后 item.upData()；只有石槽已空才播放成功音并发“装备打造成功”。剩余堆叠时没有该原文消息。
- upDataWeapon(5232) 重算装备属性。孔数影响售价：1/2/3孔分别加400/2400/10400，另加品质价、元素价、等级×4和魔魂×10；当前原始礼包装备其他属性保持不变。
- equipment.flashAttribute 2081与2221：穿戴孔数加入 attackFire，空孔也每孔加1战斗力。
- PanelMC.closePanel 只隐藏面板，未返还或删除槽内物品。根 allBag 含 make，closeAllPanel 仅调用各面板 closePanel；切图调用 closeAllPanel。打造槽继续保有所有权；重新打开可取回。新建现代旅程重置所有游戏状态。
- 对应P-code根约15100–15177核验 holes比较、赋值、useGem、返回顺序；源AS/P-code哈希冻结在 source-functions.json。

## design
采用背包“装备开孔”入口和专用HTML面板，按钮选取代替原拖放；明确已穿戴装备需先卸下。保留两槽持有、替换先返还、关闭保留、手动取回和满包地面回收语义。仅开放四类装备与三档宝盒；其他原打造功能不开放。额外操作反馈显示孔数/消耗，不伪装成原文消息。revision 防止旧按钮重放。无新图像资源，不追求原打造面板外观复刻。

## 基准与边界
冻结完整makeItem/useGem/setThing/notice/flashInfo/按钮/关闭函数，测试直接执行源函数并在成功后执行已冻结upDataWeapon，独立比较物品与消费。AS显示槽用最小替身，不声称Flash动态执行。只对当前可获得并已由源规范化的装备承诺开孔；其他打造、镶嵌、战斗与存档仍未开放。
