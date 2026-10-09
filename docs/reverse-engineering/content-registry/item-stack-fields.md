# 物品数量字段

完整46个物品数值字段记录由tools/build-item-field-rules.mjs生成到src/content/item-field-rules.ts，包含初次读取值、缺失或NaN写入策略及源位置。除数量外45个字段的完整setter体必须严格符合已审核的无额外副作用模式；异常输入有保留旧值和写零两类，按字段逐项记录，不统一猜测默认值。数量的额外显示与容量写入见下文。

ThingMC.number写入NaN时改为0；小于2时num显示为空串，否则num保留输入。每次赋值将maxNum设99，再编码数量，不裁剪直接写入的数量。因此数量100时room返回-1，数量0时room直接返回0，而非99。

addNumber先计算maxNum-number；参数或余量NaN则返回0。参数不超过余量时直接加到数量、返回0，否则把数量设maxNum并返回未装入余量。负数没有被拒绝，会减少数量。tools/item-field-semantics.test.mjs组合执行原数量getter/setter、room与addNumber，验证以上分支；原46字段的编解码测试仍保留。
