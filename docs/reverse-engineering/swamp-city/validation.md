# 沼泽城市与幻境验证

## 已完成检查

typecheck、全量npm test、build、check:save、check:source、check:swamp-city、check:swamp-battle、check:gobi-city、check:lucky-gate全部退出0。追加成长入口后再次全量测试退出0，最后本包13项通过，日志.evidence/swamp-city/npm-test-final.log；构建仅既有bundle大小提示。

六个源测试执行原frame53/54、initMonster、dropItemX、monsterDeath、SuperHS及createThing，对照完整数值、每次随机调用、320组掉落情景、NPC位置、共享侵入阈值与最后帧。领域六项覆盖两职业首赠/药店、部分与清场存取、四次实名计数、满包、死亡/幸运/军团返回、旧raw标记、失效旧药店回调和非法档案拒绝。碰撞测试独立FFDec稳定内外像素通过。

## 自然成长准备

076真实home档缺少衣服。使用同轮真实warrior-down-cleared和mage-right-cleared导出，正常拾取精锐之铠/魔导装；战士正常重打最后右区、两职业领取任务奖励、使用超级经验球、军需官返城。loot-home.json是这一自然分支导出，非修改属性的合成档。

swamp-city-prepare.spec.mjs通过正常仓库、商店、融合、开孔、拆取与镶嵌，将衣服和头盔各三颗高级减伤害宝石提升至13，面板减伤78%。武器/鞋保留战斗力宝石。两职业准备流程最终2项通过，输出prepared.json与defensive.png；没有开启journeyProbe或直接赋值。

失败尝试保留：第一次测试误把铠甲存仓；第二次尝试武器减伤镶嵌被原规则拒绝；第三次错误期望新手戒指未激活的减伤字段加入总值。修正测试输入/断言，没有放宽游戏规则。

首次自然战斗两职业死亡；检查真实导出发现无药品。诊断确认购买按钮回调未触发：数量失焦更新总价使按钮移位。ShopView改为输入时更新总价，测试补上购买成功断言，并缩短接敌移动步长、选择最近目标。这些失败不计自然通过。

购药修复后首次接敌仍死亡，未计通过。随后swamp-city-power.spec.mjs正常购买高级战斗力宝石，将十二孔火力提升至15，并把头盔/衣服与13减伤宝石合成战斗减伤害圣石；实际声望消耗420、面板总战斗力战士443/法师439、减伤78%。两职业正常界面流程2项通过，输出powered.json、power.png。

仅升级宝石仍不足：原战斗力差导致敌人高闪避，药品耗尽后战败。追加已有技能系统的原价英勇购书入口，真实往返树心城学习；33级训练仍耗尽药品，最终按原50级上限购入49本、逐本学习，两职业训练通过，最终战斗力战士688/法师684。全部购书花费245000魔石，无直接修改技能或战斗属性。

## 浏览器最终结果

最终自然训练及幻境4项全部通过（4.9分钟），日志.evidence/swamp-city/natural-cap.log。战士43轮、法师39轮正常攻击清场，部分受伤存档实际导出/导入后继续；购买30瓶超级药并真实使用，最后拾取奇异果用于原玲珑虎，按entry6回沼泽，刷新及实际文件导入一致。输出两职业trained/city/mirage-cleared/reward-used/home.json，普通路径未开启journeyProbe。

受控沼泽5项及相邻戈壁4项、第6军团3项共12项通过，日志browser.log；该轮随后两项自然失败已单独修复并由上述最终4项取代，不能把整份旧日志称全通过。覆盖所有奖励分支、四蛋孵化、药水进阶、灵魂礼包与果实、玫瑰/玉石出售、满包、随机侵入、死亡与幸运回城。

目视检查战士city.png、warrior-power.png、法师training.png与mage-cleared.png：城市NPC、角色、原地面、战斗状态/出口/掉落可见；原源标注与现代面板边界明确。typecheck、最终build、check:save、check:swamp-city与check:harness通过，其他独立源/相邻资产检查此前通过。

范围限制：完整技能书店和导师社交、巧匠/指挥官/圣兽师独立业务、南城与海岛未完成。英勇单商品训练库存及entry6修复均为明确design。

