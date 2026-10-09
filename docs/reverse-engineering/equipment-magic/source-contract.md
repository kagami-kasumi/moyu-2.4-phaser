# 装备魔魂强化源合同

## verified
- 根 `frame_9/DoAction.as` 的 make.flashInfo（3118附近）、makeItem（3672附近）：魔魂晶石只在 mhdj<19 时调用 useGem((mhdj+1)*2)，消耗成功后加一级；魔魂之心在 mhdj<19，或 grade==5且mhdj<38，或 grade==6且mhdj<50 时先加一级再 useGem()。无概率分支。P-code 分支定位 loc137b8、loc1383b、loc13896、loc13911；比较和调用顺序一致。
- useGem（3356）：默认消耗1；正数不足发“宝石数量不足！”且不扣，正数足够减去需求、归零清槽；非正数量按单件，仅需求1时清槽成功。晶石需求至少2，因此零数量不能强化。
- yesButton（3343）只在 makeItem 返回 true 后调用 item.upData；材料清空才发“装备打造成功”。upDataWeapon（5232）重算基础攻防和魔魂攻防：武器/鞋 mMinAttack、mMaxAttack分别为 ceil(mhdj*基础攻击/20)，衣服/头盔 mDefense=ceil(mhdj*defense/20)。基础值由职业、等级、品质确定。元素值保留较高值或升至源元素底值；其他孔、宝石、附加、战魂字段保持。
- 售价由品质1/2/3/4加80/240/560/1360（品质5/6此项为0），元素1–4加500或5加2000，孔1/2/3加400/2400/10400，另加等级×4及魔魂×10。
- equipment.flashAttribute 的独立冻结版本位于 inventory/source-functions.json：四件均有魔魂时取最小魔魂等级计入装备战斗力；魔魂攻防叠加到人物攻防。单件强化不保证增加战斗力，也可能因向上取整而暂不增加攻防。
- setThing/notice/closePanel 生命周期沿用 equipment-sockets 的冻结源：替换返还旧物，关闭/切图保有槽位，满包取回掉落可回收。

## design 与范围
沿用打造双槽，共享装备和材料所有权，增加背包“魔魂强化”入口。模式切换保留槽物，材料不匹配时明确拒绝；按钮选择代替拖放，revision 拒绝旧操作。界面显示魔魂、攻防、售价和预计消耗，上限拒绝不扣料。仅四类规范化装备，戒指和幸运符不开放；不新增品质升级、等级升级、镶嵌、战斗、存档或素材。

## 独立基准
`node tools/freeze-equipment-magic.mjs` 以 wx 新建冻结源全文与 AS/P-code SHA256；测试执行冻结 makeItem/useGem/yes 和 upDataWeapon，比较完整对象、材料与消息。源公式运行于有界显示对象替身，不等于运行 Flash。原材料保持只读，无新源解析器/资源转换。
