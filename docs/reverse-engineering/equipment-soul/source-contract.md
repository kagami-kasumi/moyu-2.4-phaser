# 魔之魂十属性源合同

verified：frame_9/DoAction.as:3915–3927，材料val1或val2任一isNaN即同时设为1（包括仍有剩余数量的材料），再覆盖装备val1/val2、useGem、返回成功，按钮最后重算。没有声望或品质门槛、没有随机。0/0不等于缺失，不触发默认值；未知数字类型仍写入。

2115–2157：装备两参数不是NaN即soulFire+=5，即使val1=0或未知数字。val1=1..10依次作用于attack/defense/maxLife/maxMp/moreAttack/moreDefense/moreLife/moreMp/burst/jook。attack加到最小和最大攻击；百分比在人物最终公式消费；四装备独立叠加。材料参数val2原数值，不新增钳制/随机或阈值。

P-code15660起两个isNaN调用及短路分支、两SetMember默认1、复制两参数后useGem，与AS一致。完整装备消费者复用equipment-elements冻结，打造复用equipment-magic冻结。工厂4645将默认参数设0/0、售价5000；不是一颗固定+1攻击的材料。

design：现代魔之魂附加模式、属性文字和无供应说明。此系统用val1/val2；spirit系列是另一个“战魂”系统，纠正旧UI把spirit标成魔之魂的名称混淆。不实现玄铁附加/战魂/战斗结算，不将受控材料试验记为自然获取。
