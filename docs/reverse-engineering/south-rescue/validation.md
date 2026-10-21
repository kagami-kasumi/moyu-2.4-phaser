# TASK-QUEST-082 验证

源检查：`npm run check:south-rescue`通过独立XML显示列表/矩阵、Action字节、AS/P-code哈希、四家族选择器与动作结束标记、六地图和78张FFDec图片。其中77张重建像素对照；3285沿用原PNG，只做完整性核验。

源与规则：`south-rescue-source.test.mjs`5项通过，包含四野外/三监狱波次逐字段与RNG顺序、原始死亡分支、10000个宝箱抽样、原catchThing/getPrize和公爵命令。`south-rescue-drops.test.mjs`1项通过，七怪物名称、两职业、四等级、20随机端点、两种回调随机消费共2240组合，独立执行原dropItem及全部工厂/魔之魂。领域4项和独立PNG碰撞1项通过；新增严格波次/任务关联校验后领域4项复测通过。

工程：完整`npm test`退出0，日志`.evidence/rescue-full-logic.log`共484项、0失败；随后新增掉落专项1项独立通过。`npm run build`通过（仅有既有大chunk提示），`npm run typecheck`单独通过，`check:save`14项通过，`check:source`通过，`check:south-city`与`check:lucky-gate`通过，harness检查通过。

浏览器使用081两职业自然导出档，正常UI拒绝/接取；随后明确设置出征幻兽rareFen=100000作为受控强队，以实际方向键/F完成三波战斗，未调用kill、未使用probe。保存监狱与救人状态，回城领取职业书/两种储备容器、学习技能书、独立受控宝盒兑换、城堡领取/使用容器、真实刷新和文件导入。额外覆盖满包三奖掉落、未知宝箱命令拒绝及死亡回南城一。法师及满包/未知命令/死亡专项通过，日志`.evidence/rescue-browser.log`；修正返程脚本后战士整条旅程独立复跑通过（2.8分钟），日志`.evidence/rescue-warrior-browser.log`。080/081相邻11项中10项初次通过、条件家庭fixture修正后1项独立复跑通过，日志`.evidence/rescue-adjacent-browser.log`与`rescue-family-browser.log`。救人NPC即时显现截图和warrior-castle.png已实际查看。两职业最终`*-home.json`复核：南城二、任务完成且已领奖、儿女各1、dukeCmd9366、chestCmd4022，金刚/神圣各学到1级，homeCity南城一；出征兽rareFen100000仍明确标记为受控。

早期验收脚本曾点到宝箱上方透明像素，已用截图确认并修正真实落点；返程最短网格路线过贴碰撞边界，已恢复普通路线并仅对城堡入口使用有余量的绕行。旧080受控显示标记fixture已同步新拥有的任务完成状态。这些失败不计passed。

限制：这不是自然养成通关证据。野外五头目循环、边关、社交关系及南城产权业务未开放。原始SWF和原始提取只读，没有commit、push或发布。

