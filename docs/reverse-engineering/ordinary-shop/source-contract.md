# 普通杂货交易源合同

证据等级：下列交易规则为 verified；HTML 面板、按钮代替拖动、回调 revision/归属校验属于 design。原 SWF 只读。冻结输入、AS/P-code SHA256 和实例矩阵见 source-functions.json，独立复验见 tests/ordinary-shop.test.mjs。

## 实例与入口

根时间轴 frame9：shop / depth2201 / character2089；buyNumber / depth3890 / character167。原始 SWF timeline 解析与 FFDec XML PlaceObject2 characterId=2089 name=shop 双重核对，因此 2089 的函数不是按名称猜测套用。4536/frame1:172 的奈奈安位于卡萨诺城一，jobLevels=1/cmd71；4312/frame1 case71→72 打开 shop 与背包。只接交易和退出分支，好友关系、商人升级任务没有伪开放；老兵分支不变。

## 交易顺序

2089/frame1 open 只展示 min(number,openNumber) 条；杂货完整目录为 frame9/DoAction_2:199 的16条，初始4，等级表[0,4,7,10,13,16]。当前不会替玩家解锁。

sell 保存 buyNumber；167 open 初次数量1，同一物品且数量框仍可见时改99。输入 NaN 保持旧值；Math.round 后夹到1..99。取消仅关闭，不扣款。

onSell 先确认条目，再要求背包至少一空槽（即使已有同类未满堆），再比较余额≥店面标价×数量。依次 createThing，全部调用后才扣款、关闭数量框。逐件工厂生成并入包；部分可入、其余落地，仍收全额。现代层拒绝旧回调、换角色和离开城内交易。

setThing 出售整个背包格，须 type 与 truthy salePrice；收入 floor(salePrice/2)×(number≤0?1:number)，NaN收入不加钱但源仍清格。ThingMC.as:57 数量 setter 把 NaN/undefined 归0；delivery(frame9/DoAction.as:5) 经 setter 赋值。源货币 setter 最大100,000,000，NaN忽略；复用既有验证模块。

## 工厂与字段

createThing(frame9/DoAction.as:4308) 用药品/技能书/宝石的 name，其余 type；只有宝石接收 val1/val2 参数，缺省0。绝不直接复制商店条目入包。中级减伤害宝石店面val1=2，工厂固定5；中级战斗力店面50，工厂salePrice=100；魔魂晶石店面50，工厂10；幻魔晶石店面50，工厂20。高级四宝石的非零val1覆盖默认；这些货品没有val2，不能擅造字段。

完整目录覆盖：小幻化草、魔魂晶石、幻魔晶石、中级经验宝石、中幻化草、中级攻击宝石、中级减伤害宝石、中级战斗力宝石、高级经验宝石、大幻化草、幸运幻化草、高级攻击宝石、高级减伤害宝石、高级战斗力宝石、电浆药水、神力宝石。测试按独立冻结源数组顺序对每条工厂输出精确比较；每条再测数量1/3/99×空槽0/1/40。

## 持久归属

现代 game.shop.openNumber → 原始 shop（frame9/DoAction_2:1485/1951）；旧现代档无该字段时从 raw.shop 推广，缺失才默认4，非法范围拒绝。背包全字段/落地物/货币沿原所有者保存；未实现 raw 字段保留。对话、数量、选中项、revision 不保存，恢复不重放交易。新建重置开放数4。

药店、书店、幻兽店、资源币商店、职业升级和未实现的商品使用效果仍是后续能力。
