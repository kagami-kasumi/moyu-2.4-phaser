# 树心路强盗验证

## 源与领域

check:shuxin-bandits通过独立XML、AS/P-code及Action哈希，正式地图/八方向/三动画，24张独立FFDec PNG。六项source测试包含18组初始生成、四道路标记、三次encounter、NPC菜单与普通/技能末帧命中；掉落456组完整原函数含随机工厂交错。bandit-quest原计数/领奖/nextMainTask对照覆盖两职业、0/1/19/20等级、数值阈值与满包；英雄令63组消费与原credit setter对照。曲线地面五万余稳定内外点匹配独立光栅基准。

领域检查覆盖75tick预警与暂停、三波部分受伤和清空存档、旧nextActive迁移、raw7/8字段、跨图取消、旧会话、死亡、满包掉落和一次领奖。typecheck、npm test、build、check:save、check:shuxin-bandits和check:city-third已通过。完整单元日志.evidence/shuxin-bandits-unit-final.log；check:save日志shuxin-bandits-save.log。最后声望cap修改后再次完整npm test通过，末组13项；最终typecheck和源检查再次通过。构建仅既有大包提示；LSP依赖biome缺失不替代命令行检查。

## 自然浏览器

输入为066真实warrior/mage-training-rewards-used.json；无journeyProbe，无注入任务完成或击杀。经皇宫、城二、城三实际出口到郊区，通过管理员复活、现有经验球正常培养和合体准备，再进入道路预警。两个职业均真实方向键/F完成三波六普通强盗与一首领；部分受伤档和完成待领奖档实际导出/导入。领取500功勋/500军功/英雄令，既有勇士勋章累积到1000完成爵位/军衔晋升，返城正常捐献，刷新继续及文件导入。道路清空后等待不重入，往返郊区/卡萨诺可用。

warrior最终自然通过在shuxin-bandits-browser-attempt3.log；mage最终自然通过在shuxin-bandits-browser-retry.log。两个home.json及波次/领奖/晋升/道路等导出位于.evidence/shuxin-bandits。英雄令最终双职业UI消费回归通过：正常点击使用，堆叠减一、声望上限500、raw字段一致，刷新及文件导入后保持已领取状态；reward-used.json为实际导出。

## 边界与失败记录

两项shuxin-bandits-boundaries浏览器通过：受控40格满包领奖、实际释放格子后拾取、重复和旧回调；预警中死亡/返回取消，以及无任务道路不触发战斗。受控fixture不称为自然完成。

首次未培养角色在后续波死亡，未计通过。第二次固定朝向导致无法击中背后/地形外敌人，主动停止该测试并改用正常转向，没有放宽地形或改变敌人数值。第三次战士通过；法师原存档幻兽已死亡，分配经验不会复活，修正准备顺序为管理员先复活再成长/合体，最终法师通过。一次相邻四蛋测试5秒初始加载超时，页面仍载入而未触及玩法断言；单独原测试重跑通过，不修改玩法或测试超时掩盖失败。

## 相邻与视觉

卡萨诺幻境两个受控回归均通过（四蛋UI拾取孵化、随机入场/死亡）；终章边界通过。城三两职业四图服务/存取回归本次通过。训练四法师玉石/玫瑰奖励消费回归通过，真实等待读档五分钟计时。战士第一次抵达殿外后点击早于宝箱可交互状态，面板未打开而超时；测试增加可见面板断言及有界正常点击重试，专项重跑完整通过（shuxin-bandits-training-retry.log，5.3分钟）；未改变游戏计时、地图或奖励规则。上述五项通过与一项失败完整记录于shuxin-bandits-consumers-regression.log，不能将该整次运行标为全通过。

已查看正常首波、清空道路、郊区与无任务道路截图：原地图、怪物、传送、角色和HUD可见。修复郊区/道路误用旧地图指引，最新法师截图显示正确区域及原文本/实际等级区别。最终generate:harness/check:harness通过14项，状态收尾后再次执行。最终英雄令消费截图也已查看，消息显示已使用及500上限。图像检查只确认本次范围，不宣称后续城市可玩。
