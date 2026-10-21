# TASK-WORLD-078 验证

## 独立源与逻辑

check:swamp-artisan对照八分支、AS/P-code哈希、地图/NPC和077独立肖像基线通过。源oracle执行原accountThing/useThing/createThing与命令，覆盖252组等级/声望/数量组合和42组无名宝石重叠情况；产物、材料、消息、声望与失败优先级一致。领域测试覆盖两职业七配方所有产物实际装备消费、满包、重复回调、暂停/死亡/地图/新游戏所有权及codec。

最终npm test退出0，50组共443项全部通过（.evidence/swamp-artisan/npm-test.log）；typecheck、build、check:save的14项和check:swamp-artisan通过。最后面板所有者缓存重置与城市提示调整后重新typecheck/build并进行最终浏览器验证。未修改SWF或源解析器，不额外全源扫描。

## 自然旅程与边界

自然起点为077真实.evidence/swamp-city/{warrior,mage}-home.json，通过普通页面进入，无journeyProbe。卖出剩余药品/高级战斗力宝石释放槽位，仓库取现存灵魂与礼包，战士拆3包、法师拆4包；沿真实入口回卡萨诺城购买两类晶石各12，再返回沼泽合成。两职业均合成魔魂之心2、幻魔之心2、灵魂王2、小元素石1及大元素石1，完成五种产物实际消费：铠甲魔魂+1、等级提升、品质升极品、元素总增5，重新装备、导出、刷新与文件导入一致。made/home/restored导出及recipes/consumed截图位于.evidence/swamp-artisan。

受控UI独立覆盖全部七配方最终材料与声望余额，满包落地/腾位拾取、99级拒绝、陈旧关闭/重复点击/地图离开回调拒绝与导入。另跑077五项浏览器边界，确保奖励消费、四蛋、随机入场/死亡/幸运返回和工厂物品保持有效。

此前失败保留：swamp-artisan-natural.log入口坐标错误；browser.log的总量断言只统计首堆，以及法师实际灵魂库存较少。修复测试路径/统计/正常取料流程，没有注入缺少材料或改变配方。最终browser-final.log为9 passed（3.4m），含两职业自然2项、七配方/边界2项和077相邻5项。

## 限制

配方布局是design，保留原即时合成和满包掉落语义。源无名宝石的后续消费异常保留verified。树心巧匠、沼泽其他NPC、南城区域及完整游戏尚未完成。
