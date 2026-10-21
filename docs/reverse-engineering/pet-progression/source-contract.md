# 幻兽出征与成长源合同

## verified
- `frame_9/DoAction.as:2416,2514–2578`：默认上限2、首个空槽、对象身份绑定；召回先解除inOne，再清battle、关闭相同对象面板。任务系统2210:536可解锁3，当前不虚构解锁入口。
- `frame_9/DoAction_2.as:181–185,1637,1766`：三面板分别绑定map.huanShou1..3，maxBattleNum独立保存恢复。
- `DefineSprite_4556/frame_1/DoAction.as:10–95`：面板刷新属性、非合体时body.battle，合体时reBattle；close隐藏/清对象；死亡和领先10级不能用球；单颗2000。
- `__Packages/HuanShouMC.as:27–107,433–518`：身体显示/生死与battle分离；expUp全部阈值、上限循环、顿悟恢复旧等级不再检查领先限制、升级回满。
- `DefineSprite_2181_使用经验球/frame_1/DoAction.as`：选择非出征对象先召回第一槽，再出征；取消分配不撤销已发生的出征；确认时重查目标；使用成功才扣1球。
- `__Packages/RoleMC.as:1161–1183`：所有开放面板增加attackFire；仅合体才加攻击防御。4556的评分floor(allFen/100)，额外铃铛属于活动槽，不由背包持有推断。
- `DefineSprite_4536/frame_1/DoAction.as:2831–2847`：三身体分别初始化隐藏，并在地图帧循环Activities；跟随阈值60/60、90/30、30/90。HuanShouMC:145–175依据与人物距离决定奔跑。所有物种走相同身体类。

## design
原生Phaser随行标识显示物种、等级、生死，位置按槽位排列随人物移动，跨图重建、召回移除。此为现代呈现，不宣称原版步速、动画或像素复刻；战斗/技能不在此包。HUD仍使用既有原4556资源。

现代存档扩展保存三个槽的收藏索引，恢复为同一对象引用；收藏排序不改变底层顺序，释放后索引重新捕获。life/inOne/nowExp/maxExp属于各幻兽，maxBattleNum独立原字段；旧版缺life的首个出征记录承接旧petVitals，其余按构造回满。不明属性拒绝操作，保留原字段；铃铛装备和合体入口留给后续，不凭持有加收益。

## 独立验证
`tests/pet-progression.test.mjs`直接执行源expUp和battle，与现代规则对照；浏览器真实UI和导入验证见validation.md。源文件哈希在source.json。
