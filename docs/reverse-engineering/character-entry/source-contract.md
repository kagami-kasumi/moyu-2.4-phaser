# 角色新建入口合同 · TASK-ENTRY-021

源为只读 SWF8/AVM1 `魔域2.4.swf`，SHA-256 `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`。脚本根为 `local-resources/moyu/source-index/as/scripts/`。本合同不声称执行过原游戏播放器。

## verified：入口、职业与初值

- 根 `frame_3/DoAction.as:7–16` 新建/读取；`frame_4/DoAction.as:21–35` 法师/战士选择与返回；`frame_5`、`frame_6/DoAction.as:2–19` 默认“玩家”、10字符、非空确认及重新选择。保留原样姓名，不擅自 trim 空格。两职业全集由这两个入口和地图职业赋值分支共同确定，没有四种性别组合。
- `DefineSprite_4536/frame_1/DoAction.as:2802–2833` 设置姓名、性别与职业。男战士 life/mp/minAttack/maxAttack/defense 成长为 15/5/.2/1.8/.3，baseBurst/baseJook 为3；女法师为12/9/.8/1.6/.2，后两项为1。装备属性刷新后 `isAlive=true` 填满生命/魔力。普通新建为等级1、生命90/72、魔力30/54、经验0/9。
- 地图 `frame_2/DoAction.as:81–123` 新建：目的地城郊 entry3；导师级/使用记录/魔军主将转世归零；凯恩出征；战士斩魂或法师火球术；快捷格5引用首技能；推进主任务；货币归零；富豪礼包、英雄令、英勇及随机新手戒指；最后无条件 `wudi()`。
- 根 `frame_9/DoAction.as:2748` 的 addSkill 将源0级技能提升到1级、设置studied并刷新。任务 `DefineSprite_2210_任务系统/frame_1/DoAction.as:82–97` 首次按职业激活 mainTask[0]/[1]。新建记录保存技能与任务状态，尚未开放战斗或任务面板。
- 地图 `frame_2:39–76` 的 wudi 写两货币10亿；`RoleMC.xxx_ms/xxx_res` 各截到1亿。声望500经 `RoleMC.xxx_credit:509–524` 将称号升至10；属性刷新时称号贡献20战斗力（RoleMC.init:1117–1118）。旧子集遗漏的称号贡献在本次补入。
- 地图 `frame_2:124–140` 新建/读取分支之后执行 debug。`debug:1–38` 忽略大小写，仅名称debug触发；顺序为新建+wudi→到达地图→debug。追加随机结婚戒指、货币（仍被截在1亿）、声望、等级至少100和11次物品投递。正常背包36格，debug为40格并有7次掉落；随机戒指选择顺序和满包随机落点逐项与独立源执行比较。
- `RoleMC.levels:670–683` 只更新等级编码，不自动重算生命、魔力或经验阈值。因此debug刚进入时等级100，仍保留前面1级初始化的生命/魔力上限和经验阈值9；后续穿戴触发属性刷新会按当前等级计算，当前生命不会自动填满。不能把这段源行为误改成普通升级。
- 老兵 `DefineSprite_4312/frame_1/DoAction.as:206–242` 礼包一按职业生成四件装备。法师武器蛇杖、头盔紫色占卜、鞋虚幻圆舞走upDataWeapon；旅者装保留原字面对象（防御2、魔魂防御1），该分支未调用upDataWeapon。后续打造按既有刷新规则处理。纯规则与独立原command比较完整背包字段。

## verified：女法师地面资源与时序

独立 FFDec XML 冻结在 `mage-fixture.json`；原始二进制转换在 `tools/convert-first-actor.mjs` 的 mage 参数下完成。FFDec Java独立导出11帧PNG至 `baseline/`，provenance保存命令和逐文件哈希；两条流程不互读图像。

| 状态 | selector帧 / sprite | 子帧 | 源矩形 | 左矩阵 | 右矩阵 |
| --- | --- | --- | --- | --- | --- |
| 地上待机 | 1/2 → 2893 | 1 | 115×155 | [1,0,0,1,0,0] | [-1,0,0,1,115,0] |
| 跑动 | 5/6 → 2917 | 10 | 145×195 | [1,0,0,1,-13.05,-34.05] | [-1,0,0,1,123,-34] |

role/3106→playAction/3101父矩阵为 `[52428/65536,0,0,52428/65536,-44.45,-101.5]`。保留左右跑动y偏移的0.05像素原始差异；图像不裁透明边缘，offset=[0,0]，可见alpha边界另记在转换报告，collision仍为null。

2893与2917各ShowFrame仅有一个位图shape，没有嵌套sprite、DoAction、ClipActions、stop/play、跳帧或独立计时器；SoundStreamHead2未形成另一时钟。结合RoleMC.站立/八向移动的同一 `sex+vocational` gotoAndStop选择逻辑和地图onEnterFrame的Activities入口，确认采用源名义15Hz子时间轴tick。并非仅依据SWF头的15FPS。保持同动作换向子帧，动作切换从帧1开始；不声称旧播放器墙钟性能。测试覆盖15/30/60/144Hz、暂停、恢复、镜像和禁止法师进入未实现attack。

## verified：原版HUD补充

`2292` 的女法师标签→shape2227；`2047` 的火球术图标标签→shape290、偏移(2,2)。独立XML冻结 `ui-fixture.json` 核对标签帧、层、矩阵和bounds，单独转换到 `public/assets/character-entry-ui/`，加载时补充既有原版HUD清单。既有原始提取物和男战士基准不覆盖；未宣称整个HUD新增像素精确证明。

## design与边界

开始/职业/命名菜单为现代DOM界面；返回、取消、Escape只改草稿页面，提交有效名称时才创建领域实例。继续入口禁用且标明未开放；本任务没有localStorage/sessionStorage写入。战斗、幻兽跟随、任务推进、完整世界与存档仍属于后续任务，图标可见不表示对应玩法可用。

`Journey.initialState` 保存本次新建的姓名/职业/性别、初始技能/快捷键、主任务分支、声望称号、debug入侵系数及根计数器；实际可玩状态在Journey/NpcReward/Inventory/EquipmentSockets。019全量字段表示继续交016初始化持久状态并做恢复映射，不用本次可玩子集代替653字段全集。`intoV`记录原值但未开放敌人入侵；debug保留源奖励和当前已实现属性效果，不虚构未实现世界行为。
