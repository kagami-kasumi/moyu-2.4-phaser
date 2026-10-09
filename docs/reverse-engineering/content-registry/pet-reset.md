# 幻兽重置

HuanShouClass.as:1392 reset依次将oldLevels、oldNowExp、oldMaxExp清零，levels设1、nowExp设0、maxExp设floor(levels*9)，然后flashAttribute并把life设为刷新后的maxLife。与新建幻兽默认值不同，重置后的旧等级和旧经验阈值明确是0。

frame_9/DoAction.as:2601的huanShou.reset按索引正序重置allHuanShou中的每个对象，随后刷新集合视图和三个出战面板。不是仅重置出战幻兽，也不移除集合成员。该函数没有显式修改种类、转世次数、成长率、稀有度或出战标记。

正式规则：src/content/pet-reset-rules.ts。tests/pet-reset-source.test.mjs执行原函数，检查所有直接写入、生命恢复发生在属性刷新之后，以及多于三个幻兽的全体遍历。属性刷新与界面内部行为使用替身，不在该证据范围内。
