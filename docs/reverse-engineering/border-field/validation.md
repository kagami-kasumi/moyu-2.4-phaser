# TASK-WORLD-085 验证记录

`check:border-field`通过：五地图、两个完整家族的独立XML/Action/AS/P-code、38张独立FFDec PNG；`border-field-source`四项通过，包括初始/随机/护卫/王全字段及随机顺序、bossLevels[5]、行踪原调用顺序、两方向提风技能末帧后命中与暂停。`spawn`四野外全字段；`drops`三头目完整工厂/魔之魂/同步落点随机；`random`四常规/精英、清场与未清场、全部工厂与额外奖励对照均通过。独立PNG碰撞通过。

领域七项通过，两职业每波及预警/宝箱存取、旧档bossLevels5迁移与未知字段、所有普通地图部分清场保存、非法档、独立升级、死亡/暂停/旧回调、同图行踪数量、满包和宝箱幂等。早期测试暴露Inventory入口未注册和kill计数允许集合遗漏，已修复后重跑通过。领域命令日志`.evidence/border-field-domain.log`。

`typecheck`、`build`、`check:save`、`check:source`、084相邻资源均通过；构建仍有既有大chunk提示。第一次资源转换在写manifest时遭临时UNKNOWN文件错误，重跑退出0，随后资源基准通过，不把首次失败记通过。

实际浏览器三项全部通过：战士2.2分钟、法师2.0分钟、满包/死亡/幸运返回28秒，见`.evidence/border-field-browser.log`。从084真实home档保留队伍，明确受控高阶装备和两张行踪，实际UI从边关经郊区进入野外一，再使用行踪进野外五；方向键/F打完头目、护卫、王，各波保存、预警实际文件导入继续。真实开箱、精准拾取奖品、经全部野外返边关药店出售，刷新及导出导入保持状态；无probe/kill。受控满包开箱、拒取、腾位拾取、幂等存档、死亡回边关与幸运返回均通过。已查看warrior-chest.png，显示正常。不宣称受控装备/队伍是自然养成通关。

最终完整npm test退出0，521项零失败，日志.evidence/border-field-full-logic-final.log。首轮只有084遗留“野外关闭”断言失败，更新为085开放入口并保留冰封关闭后重跑完整套件通过。类型/构建/save/source/资源/实际浏览器及harness均通过，085可关闭。

084相邻浏览器最终3项通过（3.8分钟），日志.evidence/border-field-adjacent-browser.log；check:lucky-gate亦通过，补充确认提风新增技能资源未破坏幸运之门既有子集。已查看mage-chest.png，两职业截图均显示正常。
