# TASK-UI-007 · 原版游戏主界面源合同

源为只读 SWF8/AVM1 `魔域2.4.swf`，SHA256 `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`。以下路径相对 `local-resources/moyu/source-index/as/scripts/`；P-code同路径交叉确认。独立显示列表与标签在 source-fixture.json；有界脚本在 behavior-source.json、details-source.json；原 sprite 的 FFDec 直接 PNG 在 baseline/。原提取物未覆盖。

## verified：常驻显示列表和初值

- 根时间轴帧9舞台580×500，map保持原矩阵。rolePanel/4591位于(0,2)，battleHuanShouPanel1/4556在(160,2)，后两栏在(300,2)、(440,2)；4556启动close隐藏，initNewGame只出征凯恩，因此仅第一栏显示。
- 4591的roleHead/2292选男战士，roleName读取角色名、roleLevels读取等级；hpBar(56.65,25.35)、mpBar(56.65,36.35)、expBar(56.7,46.4)。比例由changeHpMp设置为life/maxLife、mp/maxMp、nowExp/maxExp。颜色转换、子层矩阵均原样保留，不以矩形重新设计皮肤。
- RoleMC构造等级1、经验0/max9；map帧1给战士rateLife15、rateMp5，空装备时flashAttribute按(level+5)计算得到生命90、魔力30；isAlive=true填满。初始凯恩level1、生命99、经验0/max9。4556初始battleButton.nowState=true选择第二帧，合体false。记录标志不证明跟随/战斗已实现。
- XPPower/4603位于(70,66)，nowPower0、maxPower3、maxTopPower6、nowExp0、maxExp18，六个能量格启动全部隐藏。因此没有画六个始终可见的空格，也没有伪造XP增长。
- fastKey/4546位于(0,456)，保留原数字1/2/3/4/J/K/L与底图；第五格(165.5,4)放初始斩魂图标。源mover.setThing对技能图标追加“图标”，对应2047的“斩魂图标”，不是“斩魂”技能书图片。
- 地图底板4592在(0,440)，名称4593在(-39.9,442.9)，变量map.nowMap，原文字框的bounds使最终文字显示在舞台内。
- 底部七入口沿用根显示列表：人物装备(296.3,460.5)、背包(337.4,460.5)、幻兽(377.8,460.5)、技能(418.2,460.5)、好友(457.7,460.5)、任务(498.6,460.5)、系统(539.4,460.5)，精确缩放来自manifest与独立XML。

## verified：入口和面板

- 根帧9 DoAction_2键码88/X打开背包，67/C打开幻兽；27/Esc和192关闭全部。ButtonMC的nowState false/true选择帧1/3，悬停帧2，移出回当前状态。已实现入口保留此三态；键盘焦点显示悬停反馈属于design。
- 背包2074的运行openX/Y为(280,195)，不是原标签预放置的(283,200)。原皮肤295×243、closeButton(269.8,7.85)，40格为8列×5行，从(5,35)开始，横步36、纵步35，原物品图标32×32。魔石与资源显示真实库存状态；数量少于2不画数字，999按源number setter原样显示。
- 对话2293的运行坐标(95,135)，npcHead(10,10)、roleHead(10,120)、words(62,7)，答案从(64,120)按20px间隔。backMC在答案<=3时_height=180，超过3每项增加20；原图shape2211连描边高322，以对应缩放还原。关闭按钮(380,5)。原文本保持换行，文本字段为12px、leading2px。
- 幻兽记录入口使用原2482皮肤、运行位置(5,115)和原关闭坐标(196,6)。本次保留既有凯恩只读记录；不是整个幻兽管理系统的实现。属性明细的HTML可访问布局为design。

## 修正旧初始数据结论

TASK-NPC-005报告的“仅四件初始物品、货币0”只覆盖initNewGame调用wudi之前的前缀。完整AS和P-code明确无条件调用wudi（P-code:655–656）；本任务冻结完整函数并修正运行时与测试。以前oracle把wudi替身设为空，因此那条检查不能证明完整冷启动状态。

wudi向xxx_ms/xxx_res各写入1000000000，但RoleMC.as:198、232的setter将余额上限限制为100000000。TASK-DATA-015发现此前oracle使用普通字段、漏算setter，已补上真实冻结setter/getter并将运行时实际余额修正为各1亿。wudi还按源顺序直接backPack.setThing追加32件数据；36格被占用，其中经验球number999不会自动拆成99。直接setThing不同于createThing，不能补造源没有赋予的售价/属性。首次礼包一五件会填入余下四格、最后一件掉落；其他两个礼包能正常入包。旧证据文件保留，不覆盖当时的原始提取。

## 验证方法与声明边界

生产manifest使用二进制SWF显示列表/RECT/DefineEditText解析；原始shape PNG、静态字形与按钮SVG由FFDec有界导出，SVG通过sharp栅格化。浏览器只加载public正式资源，以DOM矩阵和sRGB颜色转换组合源图；Phaser仍负责地图和角色。

expected显示列表来自独立解析的FFDec XML，8个Action的原字节SHA独立核对；check:original-ui在临时目录重新导出比对正式资源。完整sprite原生PNG独立于生产的逐叶片导出/浏览器组合。角色框浏览器投影与原完整sprite比较，动态文本区域排除；保留平均通道误差<5/255、大于40的通道占比<3%的栅格化容差。小数坐标、原图预栅格化后再次组合与FFDec一次渲染会有差异；几何/颜色值另行严格对照XML，不借视觉容差更改它们。不能声称整屏像素完全一致。

系统中文字体替代旧文本渲染、面板焦点/无障碍控件、属性详情、未开放提示为design。未实现人物装备、好友、任务、系统、战斗快捷键和宠物控制的原入口仅保留原画面，明确标注尚未开放；无假存档/假战斗。移动、礼包逻辑及原地图终点边界保持原合同覆盖。声音、Flash宿主墙钟及完整游戏行为仍未验证。
