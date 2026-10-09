# 缺少工厂定义的原版引用

月光礼包、月光宝盒、30点声望均有原版createThing调用，但createThing没有对应case。`tools/lib/missing-factory-evidence.mjs`检查三个调用锚点及工厂拒绝结果，背包和掉落两种入口均返回false且不发出物品。正式注册的verified只表示引用和缺陷已核实；availability仍为registered，不代表可用。

源锚点分别为DefineSprite_4536/frame_30/DoAction.as:13、DefineSprite_4536/frame_1/DoAction.as:81、DefineSprite_4312/frame_1/DoAction.as:4849。最后一处下一行另有role.xxx_credit += 30；不能因创建“30点声望”失败就宣称整个兑换没有增加声望。初级、中级、高级月光宝盒是其他已定义的名称，不替代无前缀的“月光宝盒”。

测试 `tests/missing-factory-source.test.mjs` 同时拒绝给缺失物品擅自增加价格字段。未知的预期物品效果保留为未确认，不为补齐目录臆造行为。
