# TASK-NPC-005 · 首次奖励源合同

> 初始数据勘误：本报告的四件/货币0仅为initNewGame前缀；TASK-UI-007核实末尾无条件wudi调用并修正为36格。TASK-DATA-015进一步核实RoleMC setter：wudi写入各10亿，但实际余额被限制为各1亿。以[原版UI源合同](../original-ui/source-contract.md)及[当前存档字段合同](../content-registry/persistence-contract.md)为准；完整新建oracle已补齐wudi和货币setter。

源：只读 `魔域2.4.swf`，SHA256 `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`。下述脚本相对 `local-resources/moyu/source-index/as/scripts/`；同路径 P-code 和 source.xml 标签交叉核对。独立冻结输入为 `behavior-source.json`、`source-fixture.json` 和 FFDec 直接导出的 baseline；生产代码不读取它们。

## verified：入口、对话、一次性状态

- 4536/frame1:186 老兵状态为 `{nTitle:"老兵",name:"",cmd:1}`，getNpc 返回该状态；4312/frame1:86–89 的 npcPic.onRelease 直接 command，无距离检查。appear:106 将 nextCmd 指向 npc.cmd。
- command1:195 欢迎，唯一答案转2；command2:199 三个选择转3/4/5，同时 nextCmd 重置为 myID.cmd。因此关闭选包页后点击老兵从欢迎重开。PanelMC.closePanel 只隐藏，不重置命令；setCommand(-1) 关闭并返回。
- command3–5:207–258 均先改 myID.cmd=6，再创建物品，末尾 nextCmd=6。对话替换成只有“谢谢”的结果页。再次点击 NPC 进入 command6，不提供首次礼包。原 setCommand 本身没有防重复授权检查，正常 UI 通过 talking.init 隐藏旧答案、open 更新可见答案的 command；2217 的 onPress 读取当前 command。现代规则只接受当前可见答案，拒绝已失效事件（design 防过期事件），不声称源任意脚本调用具有幂等保护。
- command6 原文是两个勇士勋章换月光宝盒，选项7/8/-1。兑换和等级奖励超出范围；现代界面保留原文及“不想要”关闭，并明确这两项尚未开放，不设置假按钮。

## verified：获得内容与容量

- root frame9:4308 createThing 只是构造并 backPack.setThing；幻兽类型分支不会调用 huanShou.addHuanShou。礼包一是莎菲蛋×1（售价500）和四件战士装备；礼包二是雪瑞蛋×1（2800）、灵魂礼包×1（2000）；礼包三是圣天使雷斯蛋×1（1000）、圣天使奈丽蛋×1（1000）。没有自动开蛋或打开灵魂礼包。幻兽40容量已满也不影响领取蛋。
- 礼包一四件都调用 upDataWeapon（5232起）。等级1、无元素/孔/附加/魔魂；长军刀品质2、魔魂等级9，攻击2–21、魔魂攻击1–10、售价334；锁环甲品质1、魔魂等级3，防御3、魔魂防御1、售价114；蓝色深邃同品质/魔魂，防御1、魔魂防御1、售价114；野蛮行径同品质/魔魂，攻击1–6、魔魂攻击1–1、售价114。其余攻击/防御字段及元素、孔、宝石、附加、魔魂属性归零。构造字面量的武器18/9会被重算成21/10。
- backPack.number=40；setThing:1593 先按槽序合并同 type 且名字相同（或槽 name 为 undefined）的正数量物品，ThingMC.MAXNUM=99；剩余放首个空格。装备没有正 number，不堆叠；可见单件计数1，内部槽 number=0（ThingMC 的 number setter 将 NaN 归零）。新空格复制源 number，不再次拆成99。
- 满背包逐件调用 goods.throwGoods 并显示“背包已满，物品掉落在地上了”，返回true；不会撤销已入包的部分或 cmd6。4253/frame1:2 随机偏移 x=75-random(150)、y=25-random(50)，ground.hitTest 失败回落角色坐标；delivery 复制物品后尝试清空 target。礼包的普通对象没有 setThing，AS2 未定义调用为无效果，不视作JS异常。
- 换地图4536:418 clearGoods 清掉地面物品。此次最小实现显示掉落记录/坐标和地图标记，不扩展拾取、丢弃、交易系统；正常冷启动最多9格，不会触发容量失败。异常路径由注入完整容量状态验收，不能添加普通玩法的“填满背包”按钮。
- root frame9:2415 幻兽容量40；addHuanShou 满时返回false并提示，:2614 setThing 是鼠标命中四个可见幻兽槽后的委派，不能把“四格显示”误认为总容量。首次领取不走这两个函数；开蛋与战斗不属于本闭环。

## verified：新建直接前置

- map4536/frame2:81–119 初始化 useItem({type:"凯恩"})，加入凯恩并 battle(allHuanShou[0])；这不是背包中的凯恩蛋。保存凯恩初始记录：level1、zs0/maxZs225、element0、titleNum0、生命成长16.5、攻击成长1–2.5、防御成长0.3；标记battle=true。HuanShouClass.flashAttribute:1309 给出初始生命99、攻击6–15、防御2；战斗/成长/跟随不在此任务实现。
- 初始背包依序为富豪礼包×1售价20000、英雄令×1售价2000、英勇技能书（公共/等级1/售价5000）、新手戒指（grade0/mhdj0/售价10）。初始资源和魔石均0。初始包格不是空包。
- 新手戒指随机不重复抽取2个主属性、4个副属性名。固定属性：攻击10、防御5、生命50、魔力50、otherFire2、reduceDamage5、burst5、jook5；四种 more 属性初始0，选中的主属性按 ringMainValue 的 grade0除5设值：攻击1、防御3、生命1、魔力2。副属性字段仅记录随机选择，不改变固定数值。随机算法/种子不声称与旧播放器一致，抽样规则是verified，现代 RNG 为design。

## verified：显示资源链

根帧9 talking→2293、backPack→2074、huanShou→2482；XML冻结保留完整面板层和矩阵。2293 npcHead/roleHead→2292标签老兵/男战士，2074包格1–40→2049→物品2047；2049.flashPic 使用品质+等级+职业+类型选择装备标签，其他物品用类型或名称。2482幻兽格1–4→2479.headPic→2477凯恩。选中标签、shape、bounds、位图矩阵和原FFDec图像全部独立冻结并与二进制转换对照。

## design / unknown / 未覆盖

网页侧栏对话、可折叠背包明细/幻兽初始记录、状态提示为现代HTML布局；原图标/头像保持原尺寸。首次礼包完成标志与已有城一到达标志分别显示；城一仍是移动切片终点。记录只展示已实现范围，不能用“出征”标记暗示已有战斗或跟随。

原播放器的双事件实际墙钟、窗口层叠与字体像素、声音、非本旅程其他初始UI未动态验证（unknown）。未实现开蛋、礼包使用、装备穿戴/战斗结算、幻兽成长/战斗、存档、后续勋章和等级奖励。范围内不依赖这些后续系统；源脚本的静态/离线语义测试不冒充执行原Flash播放器。
