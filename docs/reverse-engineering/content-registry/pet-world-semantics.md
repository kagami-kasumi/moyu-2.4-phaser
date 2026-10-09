# 幻兽与世界数值 · 模块语义合同

由人工审查的 tools/lib/pet-world-coverage.mjs 模块合同生成；原表达式、逐分支条件和有序调用见 pet-world-coverage.json，原索引的历史 semanticStatus 不作为本合同的认证标记。review=declarative-source-contract 表示声明与调用边界，只有具名纯规则模块可以被执行；不加载或运行 ActionScript。

## pet-core（618 条）

输入：类型种子、当前/最高成长率、评分、代数、转世数、等级、元素和铃铛。

条件：initialize按type；checkUp按各评分分支；四项成长各自检查max*Fen；出征铃铛才加成。

缺省和异常：编码setter忽略NaN，life先上限后下限；reset只恢复源指定字段；未知类型不编造种子。

输出和次序：派生生命/攻防、评分、旧等级记录、转世/代数与属性加成。

边界：复用初始化/评分/成长/重置已验证规则；声明目录保留输入表达式，不执行原类。

正式模块：`src/content/pet-initialization-rules.ts`、`src/content/pet-attribute-rules.ts`、`src/content/pet-score-rules.ts`、`src/content/pet-generation-rules.ts`、`src/content/pet-reset-rules.ts`、`src/content/pet-numeric-accessor-rules.ts`。

专项源对照：`tests/pet-initialization-source.test.mjs`、`tests/pet-attribute-source.test.mjs`、`tests/pet-score-source.test.mjs`、`tests/pet-generation-source.test.mjs`、`tests/pet-reset-source.test.mjs`、`tests/pet-numeric-accessors-source.test.mjs`、`tests/pet-vital-accessors-source.test.mjs`。

## pet-combat（126 条）

输入：huanShou、role战斗力、from、attack、随机整数、出征/存活。

条件：受击先拒绝死亡/NaN；闪避后仍处理四元素；经验要求出征、非零生命、等级领先<10。

缺省和异常：全防御无飞行减半；无怪物当前生命伤害上限；铃铛仅在正伤害分支抽random(100)<5。

输出和次序：伤害返回值与扣血写入分离，铃铛反弹/冰冻3、目标和死亡；经验可顿悟还原旧等级。

边界：反弹输出事件不递归执行；动作/追踪保留声明，不开放战斗。

正式模块：`src/content/pet-world-combat-rules.ts`、`src/content/pet-experience-rules.ts`。

专项源对照：`tests/pet-world-combat-source.test.mjs`、`tests/pet-experience-source.test.mjs`。

## monster-combat（119 条）

输入：怪物实例、角色战斗力、攻击方暴击/元素、随机。

条件：是否活着/NaN；闪避严格小于；非闪避分支给XP即使伤害<=0。

缺省和异常：战斗力比较用role而非from；正伤害先截到当前生命再round；life setter有上下限。

输出和次序：扣血/返回值、XP充能、死亡经验levels*expRate+baseExp及装备spiritUp(1)。

边界：共享scalar只有incoming-damage-rules一处；怪物策略不套用角色飞行状态。

正式模块：`src/content/pet-world-combat-rules.ts`。

专项源对照：`tests/pet-world-combat-source.test.mjs`。

## pet-fusion（215 条）

输入：主副幻兽、needFen、草开关、库存、随机、称号数组。

条件：副兽同种或奇异兽；分数/20或30级/转世上限逐个拒绝；副分数>=needFen。

缺省和异常：needFen最小100否则向下到10；超过成长上限仍有增量；称号无匹配仍成功；price=100未扣。

输出和次序：四成长增量、>3000且元素非零时1%雷变；删副兽→turned→checkUp；称号倒序匹配+50上限。

边界：普通幻化、转世幻化和称号/元素进化各分开；源收费失败仍进化明确保留。

正式模块：`src/content/pet-fusion-rules.ts`、`src/content/world-effect-rules.ts`。

专项源对照：`tests/pet-fusion-source.test.mjs`、`tests/world-effect-source.test.mjs`。

## pet-panel（121 条）

输入：打开面板、幻兽实例、item.bell、消耗品、role生命储备。

条件：生命为0拒绝经验球；等级<role+10；药品生命>0；各药水门槛按逐分支声明。

缺省和异常：面板flashAttribute清零四贡献；bell.type只与空格比较，没有undefined守卫。

输出和次序：min/maxAttack/defense直接贡献、floor(allFen/100)+bell.grade+1；药品和储备数值写入。

边界：出征/inOne选择属于角色汇总的输入，汇总仍归017；面板刷新和效果执行分开。

正式模块：`src/content/pet-world-combat-rules.ts`。

专项源对照：`tests/pet-world-combat-source.test.mjs`。

## pet-hatch-use（167 条）

输入：物品类型、幻兽容量、随机、现有幻兽。

条件：根useItem中幻兽孵化分支和幻兽专用物品门槛；生成后由addHuanShou判容量。

缺省和异常：蛋价格/堆叠权威仍在017；不把宠物种子评分当物品售价。

输出和次序：具体孵化种子或成长/元素改写；返回值交回原库存消费入口。

边界：使用已注册宠物生成域，保留条件和调用次序；不实现孵化UI。

正式模块：`src/content/pet-initialization-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/pet-registration-source.test.mjs`、`tests/pet-initialization-source.test.mjs`。

## pet-roster（96 条）

输入：allHuanShou、容量、最大出征数、前三面板、页号。

条件：重复/容量、battle/inOne及种类资格；重置/删除各自范围。

缺省和异常：数组对象身份和源循环方向保留，不凭字符串同名去重。

输出和次序：名单、分页、battle/inOne标志与面板选择。

边界：管理语义声明，不新增未开放的幻兽玩法。

正式模块：只保留惰性声明/排除理由，不开放玩法。

专项源对照：逐值/条件/补充调用由 pet-world-catalog-source.test.mjs 核对；不声称有完整行为执行测试。

## enemy-spawn（1147 条）

输入：怪物定义、beginNum/endNum、角色等级、地图基数。

条件：inclusive槽位循环且slot<7；每次坐标序号从1开始；encounter按place分派。

缺省和异常：end小于begin仍返回true；不补下限守卫；attackLength/Height/朝向各次独立随机。

输出和次序：生命=life*(levels+baseLevels)，攻击0.8/1.2倍，防御同基数，floor(fire+levels*2)；地图和encounter种子。

边界：生成器边界到initMonster/地图注册；动作属性/坐标保留，不推定每帧时间。

正式模块：`src/content/enemy-initialization-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/enemy-initialization-source.test.mjs`、`tests/enemy-registration-source.test.mjs`、`tests/enemy-reference-source.test.mjs`。

## world-drops（90 条）

输入：死亡名称/类别、坐标、level、role职业/等级、随机、地图进度。

条件：monsterDeath先记具体名和怪物任务各1，再分派；概率比较符保持原样；dropItem各类独立分支。

缺省和异常：level==undefined时用role等级；无匹配类别走错误提示；多个if独立抽样。

输出和次序：生成器调用次数/顺序、掉落请求、boss推进、声望、预警/后继遭遇。

边界：物品值与五族装备公式仍归017；本组只管资格、频率、进度；生成器可能消耗随机，必须同步组合。

正式模块：`src/content/world-drop-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/world-drop-source.test.mjs`、`tests/bell-registration-source.test.mjs`、`tests/enemy-reference-source.test.mjs`。

## world-navigation（220 条）

输入：入口、当前/下一地图、进度、敌人、生命、随机。

条件：允许跳图/危险状态/死亡复活与各地特殊门槛按源顺序。

缺省和异常：未知入口不生成新目的地；当前地图标志不等同于永久解锁。

输出和次序：toMap/toEntry、入口可见、遭遇状态、复活生命/坐标及状态恢复。

边界：数值与路由契约；165标签地图注册为身份权威；不开放新增地图。

正式模块：`src/content/registry-data.ts`。

专项源对照：`tests/enemy-reference-source.test.mjs`。

## npc-dispatch（1634 条）

输入：NPC当前cmd/nextCmd/prevCmd、任务/角色/背包/好友/地图、随机。

条件：command..command4的switch case及嵌套if原样保留；确认框只登记回调，不能提前执行。

缺省和异常：未命中分支按源返回/默认；提示中数字不是实际奖励；失败不自动退款。

输出和次序：有序货币/任务/关系/地图改写、函数参数、创建物品/怪物请求、命令跳转。

边界：逐分支声明与已验证quest/friend/merit定义组合；原对话可达性、动画与完整任务链不在本包。

正式模块：`src/content/quest-dispatch-rules.ts`、`src/content/quest-generator-rules.ts`、`src/content/friend-relation-rules.ts`、`src/content/merit-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/quest-dispatch-source.test.mjs`、`tests/quest-generator-source.test.mjs`、`tests/friend-relation-source.test.mjs`、`tests/merit-source.test.mjs`。

## npc-helpers（89 条）

输入：交付装备/幻兽、品质、孔数、魔魂、旧生命之源等级、随机。

条件：四装备/三铃铛接受域；分解仅四装备；献祭类型和分数检查。

缺省和异常：异常品质捐赠军功0仍清槽；分解魔魂之心实际最多7，提示可能更大；低档nimFen写入保留。

输出和次序：经验球数量、军功、分解有序物品、删宠后lifeSourseLevels++、彩票/PK辅助返回。

边界：内部货币/经验进阶不重复定义；彩票与命令的回调边界保留。

正式模块：`src/content/npc-exchange-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/npc-exchange-source.test.mjs`。

## wedding-ring（35 条）

输入：配偶名称、随机、不重复副属性池。

条件：按14个配偶名选择两主属性，再连续从池splice四次。

缺省和异常：未匹配姓名的主属性保持undefined；四副属性不重复，不补默认职业。

输出和次序：原始结婚戒指数值及upDataWeapon刷新请求。

边界：戒指刷新权威归017；这里只登记NPC生成初值和随机域。

正式模块：`src/content/ring-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/ring-registration-source.test.mjs`。

## quests（187 条）

输入：主/支/挑战/每日任务、当前任务、目标对象/数量、角色等级、随机。

条件：倒序寻找首个满足项；negative/zero数量未统一拒绝；奖励倒序；荣誉任务拒绝面板领取。

缺省和异常：空目标列表完成；未定义或0物品数量当1；溢出留输入；工厂失败不回滚。

输出和次序：目标计数/完成/进行标志、生成目标/奖励、好友总等级分档、3宠出征上限。

边界：生成域和派发分别消费已有模块；任务串联/UI未实现。

正式模块：`src/content/quest-dispatch-rules.ts`、`src/content/quest-generator-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/quest-dispatch-source.test.mjs`、`tests/quest-generator-source.test.mjs`。

## friends（124 条）

输入：NPC关系/等级/上限、增量、名单、容量、恋人。

条件：正增量且>=3级且恰等于上限拒绝；容量检查先于对象身份去重；删除倒序按名。

缺省和异常：负关系不降级/无零下限；单次只升一级；解除5级恋人后又读空lover的源异常保留。

输出和次序：关系截断、人数/页数、恋人/配偶/拒绝计数、赠礼/邮寄/传送。

边界：普通路径已有oracle；空lover动态绑定结果仍unknown，不转换为现代JS异常或静默修复。

正式模块：`src/content/friend-field-rules.ts`、`src/content/friend-relation-rules.ts`、`src/content/friend-capacity-rules.ts`。

专项源对照：`tests/friend-fields-source.test.mjs`、`tests/friend-relation-source.test.mjs`。

## buildings（105 条）

输入：六建筑等级、住房、主城堡、声望、资源、奖励等级。

条件：主城堡需住房(旧等级+1)*3、声望旧等级*5+50；其他先主城堡要求再spendRes。

缺省和异常：upBuilding无maxLevels守卫；额外_parent.role.res路径疑点保留，不能算第二次有效扣款。

输出和次序：等级/prizeLv递增，其他建筑needMainLevels递增；经验球提取/研究所开放数。

边界：缺省/编码字段与建筑注册表权威复用；持久恢复交019。

正式模块：`src/content/building-rules.ts`、`src/content/registry-data.ts`。

专项源对照：`tests/building-source.test.mjs`。

## effect-counters（37 条）

输入：times、伤害、enemy/from、buff秒数、外部form。

条件：times>0才扣计数/生效；run对NaN伤害或时长拒绝。

缺省和异常：frost val*15且每次脚本扣2，不推断真实秒数；重伤读取form经P-code确认。

输出和次序：stopTime5/0、重伤调用、nonDefense显示状态；buff每50ms计时且end同时清anger/fly。

边界：时钟绑定和异常form解析不在纯数值规则内；禁止擅自改为from。

正式模块：`src/content/world-effect-rules.ts`。

专项源对照：`tests/world-effect-source.test.mjs`。

## legion（12 条）

输入：jobFire、militaryRank、旧militaryRankFire。

条件：新值不同才触发角色属性刷新。

缺省和异常：baseFire=50；无额外rank上下限。

输出和次序：floor((50+jobFire)*rank*2/100)。

边界：角色总和仍归017，本组只生产军衔贡献。

正式模块：`src/content/world-effect-rules.ts`。

专项源对照：`tests/world-effect-source.test.mjs`。

## world-setup（305 条）

输入：根初始化、地图基数、NPC/商店/宠物种子、计时器、输入姓名。

条件：初始化/新建/调试/设置的源分支分别保留。

缺省和异常：初始化赋值不是保存恢复；不把debug/wudi结果混入普通默认值。

输出和次序：全局/世界初值、shop容量、名称上限、运行计时和世界开关。

边界：角色/装备已有017归属优先；持久键语义交019；地图基数作为enemy-spawn输入。

正式模块：`src/content/registry-data.ts`。

专项源对照：`tests/static-registration-source.test.mjs`、`tests/profession-registration-source.test.mjs`。

## mail-transfer（25 条）

输入：物品槽、发送者/接收者、数量、回调。

条件：给予/邮寄/邮收门槛和回调返回值；不吞掉失败数量。

缺省和异常：源使用对象引用，不推断异步网络或自动存档。

输出和次序：槽位数量/转移请求、接收对象、提示与传送目标。

边界：物品字段与堆叠沿用017，关系受益按friends定义。

正式模块：只保留惰性声明/排除理由，不开放玩法。

专项源对照：逐值/条件/补充调用由 pet-world-catalog-source.test.mjs 核对；不声称有完整行为执行测试。

## numeric-codec（27 条）

输入：数字、密钥、基数、编码数组。

条件：按原编码方法变换；访问器自己的NaN门槛另列。

缺省和异常：不把混淆编码当现代存档格式；字符串格式化只负责显示。

输出和次序：数值编码/解码或显示字符串。

边界：复用既有codec；持久化格式由019裁决。

正式模块：`src/content/numeric-codec-rules.ts`。

专项源对照：`tests/numeric-codec-source.test.mjs`。

## ground-items（25 条）

输入：物品对象、坐标、目标、空槽、原数量。

条件：拾取门槛/距离、地面列表倒序和数量拆分按原入口。

缺省和异常：生成后不代表成功入包；掉落数组是临时地图状态。

输出和次序：地面创建/删除/拾取与数量转交。

边界：沿用现有地面实现和oracle；不重写物品数值权威。

正式模块：`src/content/registry-data.ts`。

专项源对照：逐值/条件/补充调用由 pet-world-catalog-source.test.mjs 核对；不声称有完整行为执行测试。

## presentation-control（699 条）

输入：显示对象、文本、鼠标、页号、动作标签。

条件：显示/隐藏、点击与帧脚本条件保留。

缺省和异常：文本中的数字不作为奖励/伤害公式；动作结束标签不是伤害时刻。

输出和次序：坐标/颜色/比例/字符串/按钮/动作调度支持状态。

边界：明确排除为表现或控制记录；含计时/伤害副作用的脚本独立分组，不以文件名一概排除。

正式模块：只保留惰性声明/排除理由，不开放玩法。

专项源对照：逐值/条件/补充调用由 pet-world-catalog-source.test.mjs 核对；不声称有完整行为执行测试。

## persistence-handoff（927 条）

输入：SharedObject或原存读档/文件选择入口。

条件：保存/恢复/索引键条件见源记录。

缺省和异常：本包不关闭恢复异常，不宣称字段类型和恢复顺序已完成。

输出和次序：逐ID移交019的原表达式、条件和位置。

边界：仅归属覆盖；019负责持久语义、恢复矩阵和design修复。

正式模块：`src/content/persistence-registry-data.ts`。

专项源对照：逐值/条件/补充调用由 pet-world-catalog-source.test.mjs 核对；不声称有完整行为执行测试。
