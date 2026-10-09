# 幸运符生成种子

源 `DefineSprite_4312/frame_1/DoAction.as` 四处对象：450、457、2074、2081行。女性对象生成永恒幸运符，其他sex值生成真理幸运符；两种身份均保留四处带条件表达式的来源。grade和luckLevels初始0，isFirstLove从friend读取。

450、457行从已存lover读取sex与name，明确salePrice=100；2074、2081行从当前对话myID读取sex与name，没有salePrice字段。不能把前两处的价格默认填到后两处。物品接收器之后的默认值或属性计算不由此生成种子确认。

`tools/lib/lucky-charm-evidence.mjs` 独立枚举四处源对象，对女、男、未定义sex以及两种初恋标记逐字段执行对照，并确认源位置和表达式原文。`tests/lucky-charm-source.test.mjs` 检查给缺省价格补100会被拒绝。此范围不包括恋爱条件、背包容量和丢弃回退的完整流程。
