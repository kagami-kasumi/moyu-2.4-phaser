# 接应国王与戈壁战场验证

## 独立源与资源

原SWF及已有原提取物只读。source-fixture.json冻结原AS/P-code/XML；baseline保存53张独立FFDec PNG及来源。check:gobi-battle验证六地图、三魔军家族20选择器、矩阵与Action，正式转换结果与独立PNG差异小于既有0.05阈值。碰撞测试直接使用独立PNG内部/外部像素，不拿正式路径生成expected；包含上/下区位移地面。

gobi-battle-source四项执行原initMonster/地图/monsterDeath函数，验证五区生成15次随机与首槽将领覆盖、数值、旗标、20选择器七动作末帧、镜像和暂停。drops两项覆盖456组原掉落函数与交错随机，另60组执行完整原createThing及物品生成器，对比正式FirstCombat奖励。king-quest-source覆盖384组接取/推进/逆序奖励与12组荣誉接受/拒绝/已有任务。领域三项覆盖两职业五区往返、部分/清空保存、预警取消、死亡、homeCity、旧回调、满包及非法/旧档；碰撞一项。全部12项通过，不用测试替身直接设置击杀来声称自然战斗。

## 浏览器证据

自然链输入为071真实双职业home.json：正常跨图到卡萨诺郊区出售资源腾出奖励容量，再回树心进入戈壁；不注入属性或kill，不启用journeyProbe。军需官实际购药、复活；中区真实击杀副将及士兵，右区真实击杀主将及士兵；领取接应国王奖励，接受荣誉，使用超级经验球，军需官离场，实际消费100000奖励资源，刷新及文件导入。输出位于.evidence/gobi-battle，两职业funded/center-cleared/right-cleared/awarded/home/reward-used均是实际导出。

attempt3日志中的两职业自然测试均通过，三个受控边界中仅暂停手动推进测试失败。失败是关闭系统面板后同轮测试advance早于渲染同步暂停标记；测试先render再advance，不改变正式暂停规则。最终.evidence/gobi-browser-final.log全部12项通过：五区视觉/部分伤害导入、暂停/死亡/军需官/幸运返回、满包真实拾取消费/拒绝荣誉，以及070/071九项相邻回归。最终.evidence/gobi-natural-final.log两职业均通过（7.2分钟），包含真实受伤部分档导入后继续实战；.evidence/gobi-unit-final2.log完整npm test退出0，末组12项全过。最终typecheck、check:save与check:gobi-battle也再次通过。

受控fixture与自然链明确分离：五区全素材、满包、概率和死亡边界可控制输入，不能代替真实打怪。检查gobiUp.png与full-reward-used.png确认原背景/怪物/入口和新地图标题正确，奖励消费结果可见；五地图均生成独立截图。

## 失败与修复

- 最初浏览器取不存在的trade-feedback，修正为现有trade-panel；未改变交易行为。
- 军需官菜单误挂pointer-events:none的guide导致画布截获点击；移动到正式main独立交互面板并加层级，正常购药/复活/离场通过。
- 新地图沿用旧卡萨诺标题，改为戈壁实际地区说明，最新五图截图验证。
- 首次全量单元发现旧档迁移无条件插入false任务字段破坏往返相等性；只在原raw/现有任务真实激活时推广，保存相关23项及后续全量npm test通过。
- 幸运返回对未开放homeCity不能静默改到城二；受支持目的地白名单授权，未知值保留且出口不开放，领域相邻测试通过。

## 检查与限制

typecheck、build、check:save（14项）、check:gobi-battle、check:shuxin-city、check:shuxin-bandits通过。完整npm test日志为.evidence/gobi-unit-final.log；最终版本重跑日志为.evidence/gobi-unit-final2.log。构建仅既有bundle大小提示。原解析器未变更，不额外扫描SWF。

五旗/部分战斗/预警为现代存档扩展，原raw没有这些字段；不伪造原保存键。荣誉计数与接受/拒绝可用，但原国王领取服务未开放。戈壁城/野外/地产及独立NPC服务不在072范围，不能据本任务声称完整游戏完成。
