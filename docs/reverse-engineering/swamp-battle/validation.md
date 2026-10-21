# 进入沼泽与第6军团验证

## 源与逻辑

六地图、三魔军家族20选择器、七动画、Action/AS/P-code以及53张独立FFDec PNG由check:swamp-battle通过；碰撞测试对照独立PNG内外稳定像素。原始SWF保持只读。

swamp-battle-source四项逐区执行原initMonster、地图、monsterDeath和动作终帧；数值、首槽覆盖、15次随机、等级和文字颜色均对照。swamp-battle-drops三项比较50/52/55级完整掉落随机与55级物品工厂，并将实际生成的各类物品经商店出售，魔之魂执行装备附加消费。玫瑰/玉石出售不代表赠礼系统开放。swamp-quest-source直接执行原任务及RoleMC函数，对照升级下一主线、逆序奖励、满包随机顺序与上限。

领域四项验证两职业五区往返、部分/清场存取、奖励消费、旧回调、国王准入原子拒绝、预警暂停/取消、死亡/幸运返回、满包、非法档案与mainTask9/10旧字段推广和未知原字段保留。全量npm test退出0，最后本包13项通过，日志.evidence/swamp-battle/npm-test.log。

## 实际浏览器

自然链使用075实际导出.evidence/king-honor/{warrior,mage}-home.json，未注入属性、击杀或启用journeyProbe。两职业正常回城二、进入郊区，5秒后进入左区；军需官购药与复活；中、上、下、右四个有敌人战区均正常攻击清场。受伤部分档实际导出/导入后继续，主将死后任务完成、进入南城激活；领取150000资源等原奖励并使用超级经验球；军需官返回卡萨诺城二，刷新及实际文件导入保持状态。2项通过，耗时8分钟，输出.evidence/swamp-battle/{warrior,mage}-{center,up,down,right}-cleared.json、awarded.json、home.json及截图。

军需官6种药品是继承075已开启档位，不能据此称本区域固定解锁6种。战士left.png已目视检查背景、角色、军需官、三个入口和第6军团文案。最终边界/相邻浏览器8项全部通过（3.4分钟），日志.evidence/swamp-battle/browser-boundaries.log：沼泽三项、戈壁三项、城二准入隔离一项、国王三奖励封顶/资格/重接一项。另目视swampUp.png确认原背景、52级副将和三士兵数值及入口；满包拾取/消费截图保留。

## 修复与边界

首次转换manifest遇到临时文件打开错误，重试成功；未改原始提取物。最初源测试误读原怪物颜色字段，改为原monsterName.textColor后全部对照通过。全量旧城二测试因新准入文案失败，更新为原国王条件并增加原子拒绝断言后完整测试通过。

幸运之门漏掉沼泽homeCity白名单、返城raw.oldCity跨军团旧值已修复并增加回归，见review.md。后者修复后构建用于边界回归，自然战斗本身此前已完成；不隐去验证顺序。

typecheck、build、check:save、check:source、check:gobi-battle、check:swamp-battle已通过。构建只有既有bundle大小提示。沼泽城市/幻境、野外/产权及随机NPC和独立服务仍未开放；五旗与部分战斗持久化属于现代设计。
