# 铃铛生成种子

`DefineSprite_4536/frame_1/DoAction.as` 有三种铃铛各三处生成对象，共九处。庇护铃铛attributeType1=1、attributeVal1=5；凤翼铃铛为2、3；翡翠铃铛为3、4。种子均pure=1、skill=0、salePrice=200。

1991–1999行和2534–2542行使用random(10)>=5时grade=1，否则0；2008–2016行使用random(10)>=7时grade=2，否则0。这里是已经进入该生成分支后的品质选择，不是怪物掉落概率。后续装备属性计算与铃铛效果另行取证。

`tools/lib/bell-registration-evidence.mjs`独立枚举源文件中的九个对象，对每个对象执行random(10)全部十种结果，并与正式注册中的字面字段、原表达式、源位置逐项比较。`tests/bell-registration-source.test.mjs`另检查篡改初始属性会被拒绝。正式记录的verified仅覆盖此范围。
