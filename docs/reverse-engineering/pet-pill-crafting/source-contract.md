# 幻化师转世丹制作源合同

verified：4312/frame1 cmd117完整列出三配方118–120：10灵魂晶石/1灵魂礼包各1丹，1灵魂王2丹。统一条件xxx_ms>1000（严格大于）；先backPack.useThing成功，再createThing一次或两次，最后扣1000魔石，发布获得消息。余额恰为1000不消费材料，不创建产物。无随机成败。

verified：backPack.accountThing/useThing按type且name相同或槽name未定义匹配。number0/undefined计1，其余有效数量计实际值；先统计，再从低到高整格或部分扣除。三配方不会消费其他具名宝石。createThing('幻兽转世丹')构造number1、salePrice2000；依源setThing优先堆叠，继而空格，最后掉落。灵魂王配方两次独立创建，满包两次独立掉落，随机调用顺序沿用已冻结背包/掉落oracle。

verified：城三NPC51幻兽幻化师位置(380,300)，cmd111导向117。素材/命中来自043源合同，未修改源素材或SWF。此任务无新动作时间轴，pivot沿用城三已验证资源。

design：点击NPC直接显示完整三配方选择，追加清晰的确认/取消；保留未实现的幻化/社交说明，不开放虚假操作。会话、map和revision拒绝旧确认。无有效数值的材料保存且拒绝消费。瞬时确认不保存，产物/材料/魔石/幻兽成长复用现有完整存档所有者。
