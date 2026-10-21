# 野外一首战源合同（TASK-WORLD-064，进行中）

## verified：地图与敌人初始化

独立 `source-fixture.json` 来自 FFDec source.xml；`tools/check-first-combat.mjs` 对照只读 SWF 二进制显示列表、矩阵、标签与 Action 哈希。`source-functions.json` 冻结 AS/P-code 哈希和函数位置。4536/frame7 地图背景4321、地面2809→2808，地面原点(0,70)；entry1(42,411.6)去野外二entry2，entry2(542,411.6)回郊区entry1。进入设置dangerous(true)，郊区frame8入口反向连接。

六只1级鹿角兽坐标依次为(80,300)、(155,380)、(320,400)、(220,305)、(470,320)、(495,250)。initMonster顺序按1..6，每只独立抽取攻击横范围150+random(20)-10、纵范围30+random(10)-5、朝向random(2)。初始化生命/攻防使用原基数表达式，不能以关卡等级直接代替基础数值。

## verified：怪物活动与目标选择

`monster-behavior.ts` 对应 MonsterMC.Activities/lockTarget，`tests/monster-behavior.test.mjs` 独立执行冻结源位置的函数进行对照。活动顺序为存活/动作中守卫→结束命中与停顿→stopTime递减→随机停顿→目标更新→移动→动作启动。移动与攻击资格使用移动前的dx/dy；重选目标后也不重新计算这两个局部值。

源目标表为人物、出征槽1、2、3，倒序遍历；距离实际计算sqrt(dx*dy)，异号产生NaN不入选，同距离后遍历者覆盖，既有目标未在lockTarget开始清空。重选阈值比较dx>abs(length*2)及dy>abs(height*2)，并非abs(dx)/abs(dy)。这些异常保持原语义。

结束命中先检查矩形范围，不先检查目标存活；接收方byAttack负责死亡守卫。伤害抽取minAttack+random(maxAttack-minAttack+1)。普通攻击/技能分别随机选择，但两者使用同一命中公式。死亡立即隐藏，无鹿角兽独立死亡动画；原toDeath依次抽死亡文字、isAlive=false、装备spiritUp(1)、人物priseExp(level*3+15)、monsterDeath掉落/任务更新、站立。

## verified：动作标记与两职业入口

4116鹿角兽层playAction→3147，父矩阵(0.79998779296875,0,0,0.79998779296875,-45.2,-119.15)。3147左右移动使用3126；左右攻击使用3135；左右技能使用3146。两种攻击子时间轴均9帧，仅第9帧Action写祖父motion=使用技能结束，之后Activities结算。人物斩魂3031与法师地上施法2943均11帧，第11帧写同类结束标记。帧数与命中回调次序来自脚本及时间轴，不仅来自文件15 FPS声明；实际现代调度与暂停边界仍需集成验证。

RoleMC.autoAttack战士严格abs(dx)<150、abs(dy)<30启动斩魂；法师严格abs(dx)<400、abs(dy)<40启动火球术。火球术consumeMp(1)不检查返回值，先定位400×30目标发射视觉火球，结束效果再按400×40重新选目标。点击对象不是强制命中归属。RoleMC.lockTarget按朝向、范围及最近横距离筛选，倒序同距离保持先找到者。

## design 与未完成验收

纯规则使用稳定目标ID及事件输出，渲染不能独占命中回调。测试中只为AS undefined属性读取建立空对象哨兵；这不是浏览器SWF执行层。

已完成32张原版资源离线转换与独立FFDec PNG对照，正式文件位于public/assets/first-combat；31张位图完全一致，2808地面平均预乘RGBA差0.00326896、最大28，差异为抗锯齿。动画保留重复帧：鹿角兽run16帧、attack9帧、skill9帧；不将连续相同图像去重后缩短动作。

纯规则还包括人物选目标/基础攻击、合体承担伤害、幻兽活动、六怪/头目初始化与完整鹿角兽掉落分派，分别由对应独立源函数测试。人物受击按槽1→3选择首个open且life>0且inOne，使用人物防御、闪避、减伤，伤害和元素写入同一承担者，不溢出；承担者铃铛反弹时攻击方属性仍是人物。宠物普通攻击立即标记结束，下一Activities才命中，不能借用鹿角兽9帧。合体不可见时Activities直接返回。25物种movement/range已从initialize转换，完整独立函数执行验证。

鹿角兽monsterDeath先catchThing鹿角兽/怪物各1，再普通怪奖池和四种地图/参赛券分支。所有生成器与地面回调必须同步消费随机；最后无存活怪且random(10000)>9000触发龙怪头目5秒预警。4581使用1000ms interval，点击可提前timesUp，跨图close清除；预警并非普通物品掉落。头目生成、成长和奖励已接入FirstCombat。

上述组件现已接入Journey/Phaser：野外一入口开放，人物按F或点击范围内敌人使用基础攻击。人物与幻兽共享生命、属性、经验和收益所有者。两职业已有无probe首战、拾取、保存、继续与回城检查；完整首战合同验收见validation.md。

## 后续取证与调度组件

`boss-fixture.json`独立补充3188/3167/3178/3187、2874/2878/2881和4581的XML显示列表及Action；原fixture未覆盖。龙怪run14帧、攻击10帧、技能7帧，后两者各自最后一帧写结束标记。新增18张龙怪PNG全部与FFDec像素一致，现在共50张（49张完全一致，地面差异如上）。0x42镜像bitmap fill的FFDec整数采样与SVG像素中心有1像素差，转换仅修正位图栅格采样，manifest原矩阵不变；该修正不应用于0x43。

`firstBossDrops`完整对应野外一龙怪头目分支：catch两种目标→creditUp(1)→勇士勋章→bossLevelsUp→头目掉落（独立两次高级石头池）→10%魔之魂；魔之魂使用root/frame9的min/maxSoul差值，等级上限300，独立Math.random扰动0.9..1.1，向上取整。并不加minSoul。`advanceFirstBoss`保留level1→5、之后+5至135、其后moreFire+5至270；源初始龙怪头目生成并不消费moreFire。

`CombatSession`已消费人物、幻兽、怪物状态和命中端口，按源槽位顺序驱动Activities及嵌套结束标记；暂停、分段推进及命中回调中跨图取消均有测试。现代关闭会取消人物/幻兽的瞬时动作与旧目标，属于design。Journey现提供真实生命、收益与输入端口，Phaser只投影状态，不负责命中。

效果时间轴补充：冰冻2874为2帧，仅frame1扣2计数；破防2878和重伤2881为15帧，仅frame1扣1，不能一概每个游戏tick扣计数。重伤run仍读取未解析的`form`，不能静默换成`from`。CombatEffects分别推进两种已确认时间轴，含run即时frame1与零计数末循环；独立执行源frame1脚本对照。live受击端口在反伤后重新读取生命及上限，使同步击杀升级回血先于剩余元素伤害。重伤未解析的form保持不补造攻击者，尚不能将该被动描述为完整可用。


## 现代持久化与首战接入

- `FirstCombat`拥有本区波次、实时人物/幻兽端口、XP能量和击杀收益；`CombatSession`依原角色→三个幻兽槽→六怪顺序执行。`CombatView`读取原parent/selector/frame矩阵，显示鹿角兽及龙怪。幻兽文本标识仍为design投影，位置改为实际战斗位置。
- `GameProgress.combat`是design扩展：保存敌人位置/朝向/生命和头目预警剩余tick，恢复不复播已经发放的奖励；待命中动作、目标、AI停顿、附加效果取消，恢复为idle。离图删除战斗实例和其扩展，重入重新生成六怪。人物/幻兽生命沿现有保存字段持久化，死亡档可恢复。
- `combatLedger`中bossLevel/bossMoreFire、overflowExp、nowPower/nowExp映射原有raw字段；缺扩展的旧档从原字段迁移。总击杀计数是design统计，不冒充全部原任务系统。当前新手任务0/1消费鹿角兽计数，6只完成后依nextMainTask开启2/3；倒序发放100魔石、衣服、武器，满包按原仓储端口掉地，重复领取拒绝。原保存模板未存主线中途need.number，因此`firstQuest.number`明确属于design扩展，旧档仅由已完成标志推为6，否则0；不伪造raw计数字段。
- 复活恢复人物生命/魔力及出征幻兽，返回城二原backPoint(300.4,352.65)。原homeCity初始空字符串不能提供可靠目的地；首次未入城即死亡的回城目的地明确design为城二。首次到城二仍获得幻境道具，危险区进入不触发安全恢复。
- 系统菜单、保存对话框及浏览器失焦暂停现代游戏时钟。头目预警采用75个逻辑tick，随暂停停止；原4581为真实1000ms interval，此暂停策略是design差异。按钮可提前触发，离图清除。
- 目前开放两职业正常攻击、幻兽普通攻击与合体承伤、冰冻/破防触发、铃铛反弹/冰冻。完整主动技能库、其他任务线和其他野外区域没有据此宣称开放。

装备没有声明灵性字段时，现代边界保留缺失，不凭空产生NaN灵性记录；已有灵性仍按原spiritUp推进并刷新属性。战斗保存还保留生成时的攻击范围；幻兽瞬时坐标在恢复后重置到人物位置，属于design恢复策略。郊区产权按原priseExp增加经验×20资源。
