# 幻兽商升级源合同

verified：2210/frame1/DoAction_2的branchTask索引20..23为2/3/4/5级幻兽商。实际费用300/500/2000/4000；5级说明文字写3000，need[0].needNumber为4000，4312 command2 cmd8402直接消费needNumber，以4000为执行真值。

verified：cmd8401置isDoing；8402成功先消费魔石、记录需求数量、置完成、提高jobLevels、调用huanShouShop.hsLevelsUp。hsLevelsUp按levelNum选11/14/17/20货位。领取getPrize倒序处理prize；声望先行，经验球逐个工厂发放，再是蛋或晶石，最后清isDoing/isComplete/需求数量。奖品：莎菲+2球+1声望；4灵魂晶石+3球+1声望；圣天使奈丽+5球+1声望；吉祥噜噜+1声望。满包走既有createThing掉落，正常收费不回滚。声望封顶500，爵位按源推进。

verified：SAVE_NPCS及4536初始化中的幻兽商为npcState索引2，原字段npcState2jobLevels；四任务写branchTask20..23 isDoing/isComplete。raw.huanShouShop独立保存货位，不据货位猜等级。旧未知字段及其他NPC/任务保留。

design：复用已验证杂货商任务用例，配置来自独立幻兽商定义；现代对话中独立接受/资助/领奖，保留待领取而不因升级自动领奖。现代扩展持有任务需求数量，原存档不持久化数量，缺少现代字段时依据完成标记恢复已满足需求。切图/新建/旧按钮拒绝，三商店与两升级链互不覆盖。好友/随机孵化/幻化/战斗仍未实现。
