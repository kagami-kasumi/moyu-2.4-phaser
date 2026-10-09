# 完整持久字段与恢复合同 · TASK-DATA-019

本任务关闭**数据表示与恢复语义合同**。653个源键模板全部有正常类型、缺省依据、初始化阶段配方、保存条件、读取条件、恢复语句、访问器语义、后续副作用和现代保留政策。`persistence-survey.json` 是可追溯字典；正式消费者使用 `src/content/persistence-registry-data.ts`，不依赖本地原始提取物。字段表达式是描述数据，禁止eval。

`default`表示该字段注明的阶段（类声明、构造器、生成器、内容模板），`finalInitialization`说明进入新游戏前后还要应用哪些步骤；`restorePlan`保留精确源语句与条件，`postRestoreEffects`指出稍后可能覆盖它的模块。**缺存档键绝不等同于新建默认值。** 不同职业、随机装备、debug名字不能强行合成一个默认数值。

## 源范围与证据

- verified：SWF8/AVM1的源saveGame/readGame（frame_9/DoAction_2.as:367–2132）、frame8职业/姓名预读、文件选择sprite4233、实际绑定类与访问器。独立词法扫描对账653个模板及每个读写位置，734脚本外部读取扫描沿用既有检查。
- `restore-matrix.json`包含按源行排序的完整字段读取、全部readGame源体（包括不读取键的调用/控制）、6个无readGame恢复的字段及13个恢复阶段。没有把源循环局部变量当成业务字段。
- `persistence-coverage.json`关闭018移交的927个ID：840个字段映射，20个选择UI临时项、2个预读路由项、56个临时控制项、1个日常目标重建项、2个地图入口派生项、6个旧版本商店调整项。不是927种持久键。
- 数值/构造器的既有独立源oracle继续使用017/018成果；新增恢复测试直接执行有界AS函数/访问器，验证顺序产生的结果。测试替身不声称提供AVM1运行环境；重复对象键不在JavaScript中模拟。

## 初始化与最终状态

| 所属 | 新建最终配方与缺省 | 恢复区别 |
| --- | --- | --- |
| 元信息/全局 | frame3版本1.8、计时0、随机playID；新建清readTimes；saved/saveTime在保存时生成；upLevelPrize/taskTime初始1；daoshi/useRecord/mainBoss初始0 | usedTimer/upLevelPrize/taskTime有defined守卫；readTimes保存值+1；saved/saveTime只供选择界面；当前versions不从存档覆盖 |
| 角色 | RoleMC构造器→地图frame1姓名/职业成长率→装备属性刷新→isAlive填满生命魔力→root initData→frame2新建幻兽/技能/主任务/物品→wudi货币各1亿、声望500/称号10→入口坐标→debug条件分支 | 构造值不是缺字段替换表；精确xxx_写入口；数值NaN通常忽略，普通字段可变undefined。debug源分支在新建和读取后都执行；现代读取不发新奖励（design） |
| 槽位/装备 | 空槽及容量独立；角色包、原生成器和delivery依type赋值；随机戒指不重抽；快捷栏第5格是职业技能图标 | 存type为空/undefined不写条目；load setThing空槽不清全部旧字段。现代新实例消除显示对象残留，原始字段仍保留。技能图标按名字建立现代引用是design，不把skill数字铃铛字段误用于技能对象 |
| 幻兽 | 新建使用凯恩种子并出战；构造可选默认→种族initialize→rareFen下限→checkUp→life=maxLife；nextLvRate取随机值，显式0保留 | 保存最多huanShou.number只；源没有当前life/battle/inOne键。现代保留所有实例与现代当前状态，源旧档只能使用构造恢复配方 |
| 建筑/商店 | 六个注册种子；initData仅重设建筑levels/prizeLv；商店各owner初始开放数见字典 | 当前表长度逐索引恢复；needMainLevels升级可变却不在源保存中，不能靠levels唯一推回 |
| NPC/关系 | 60个FriendClass种子、缺省jobLevels可undefined；friend.initData清关系数组、lover、计数/容量，页面状态不清 | NPC先恢复，朋友后按nTitle查找。addFriend容量/去重/关系回调可能改变投影；原始重复/悬空关系必须仍可保存 |
| 任务 | 注册主/支/挑战/日常初始标记；新建按职业nextMainTask；日常need按定义，接任务时可生成新目标 | flags先；仅活动日常恢复need；紫水晶/兽王/幻兽炼狱/荣誉保留need[0]身份，只写number；其他重建数组，好友委托另读explain |
| 技能 | 全表默认未学/0；新建战士斩魂、法师火球术；读取不能重新调用新建赠送 | 源addSkill搜名字、先检查当前等级+1上限、reLv非NaN才直接写（0有效），否则加1；effect改角色字段，afterAdd排序。现代按名字恢复学习记录，不按排序后索引重新发奖励（design） |
| 地图/首领/XP/称号/PK | 注册首领成长；新建地图卡萨诺城郊区entry3；产权/幻境false；XP初值0/3/false；称号计数3；PK false | 地图坐标成对恢复，否则entry1；源XP能量/满标记/可用标记/六格显隐独立写；旧值不因“应当一致”被删 |

## 恢复次序与覆盖

源顺序是：版本检查（注意在getLocal目标槽之前）→元信息→人物→幻兽→全部物品容器→建筑/商店→NPC→任务→技能→朋友→首领/地图/坐标→XP/称号/PK→旧版本调整→装备刷新/任务显示；地图frame2随后changeDepth、gotoAndStop、debug。

1. 人物源泉等级/容量/当前先写，上限随后重算容量；生命/魔力当前值按源先上限后下限比较，降低上限不再夹当前值。最终装备刷新再次重算上限/容量，因此源保存的上限不保证成为最终投影上限。
2. 军衔/爵位/职位/声望先触发setter，保存的加成/称号等级后写可以覆盖派生结果；保存的名称则可能被前述setter覆盖。
3. 幻兽先清数组，构造逐只初始化评分、属性并回满生命，再checkUp一次，最后afterAdd。输入rareFen仅高于种族默认才覆盖。保持三个独立字段nextLvRate/sd/qyg，不推定AVM1重复键保留哪个值。
4. 学习技能可能覆盖人物重伤、寒冰、技能攻防/生命/魔力并重新算属性；XP技能置isUsed，但后面的存档XPPower.isUsed又会覆盖。源addSkill会排序正在迭代的技能数组；现代按稳定技能名恢复，不复制这种索引依赖。
5. 好友addFriend不仅追加：拒绝容量超限/同对象重复，成功调用addRelation(NPC,0)，关系达到阈值仍可能升级并改关系名/上限。现代原始记录与可用朋友列表分开，不把投影去重写回原始列表。
6. 两坐标都defined才赋值并清nextEntry（0有效）；缺一项选择entry1。未知地图保留但不开放可玩路径，不回退覆盖原始地图。

## 现代schema与状态分类（design）

`PersistentState`包含固定schema标识/版本、`source`完整具体键对象、`extensions`现代领域状态对象。二者都用带标记的PreservedValue：缺字段通过无entry表达，undefined/NaN/±Infinity/-0各自显式表达；稀疏数组保留length、存在的索引和命名属性。实例顺序、重复内容、零数量、空字符串均保留；方法、句柄、循环、访问器拒绝而非静默忽略。

| 分类 | 保留规则 |
| --- | --- |
| 源持久状态（全部653模板） | `source`含实际key；类型是正常源状态说明，不授权删除异常值；包括saved/saveTime与容量等未由readGame写回的键 |
| 持久但会派生覆盖 | 人物上限/源泉容量、加成和名称等原值仍存source；投影视图根据恢复矩阵计算，不能反向覆盖未修改原值 |
| 现代新增持久状态 | extensions按模块自有命名空间保存：journey地图/角色选择与坐标、inventory槽位/未知物品、groundItems地面实例及位置、equipment装备、crafting面板托管物品与归属、pets实例当前生命/出战/合体、buildings.needMainLevels、world/quests/skills/relationships/XP的新增字段。每个模块只能改自己明确拥有的键/子记录；来源缺失必须显式记录 provenance |
| 派生可重建状态 | 装备合计、人物派生属性、幻兽评分、内容ID解析索引、UI文本/页码等从领域记录重建；源本来存的同名数据仍保留在source |
| 临时状态 | Phaser对象、对象方法、计时器句柄、按键、拖拽指针、对话回调、SharedObject引用、反作弊编码镜像、粒子/声音实例；不序列化。暂停菜单/面板关闭不代表托管物品归属消失 |

原始保留层允许所有未来字段和未实现内容，不将其当作可执行模块。未知类型/职业/NPC/任务/区域/幻兽只得到opaque记录；稳定contentId为可选关联，原type/name/vocational/nTitle及旧索引都保留。所有911条内容payload和653字段的特殊值已进入往返测试。

`editPersistentState`只接受显式拥有的具体key，每个key一次set或delete；没有出现在投影里的字段不删除。set(undefined)与delete不同；构造失败不改变原快照。嵌套模块记录更新也必须先保留它的未知子字段，禁止将只含已识别字段的UI模型整体替换原记录。此API不执行IO，也不接收未经验证的外部格式；016/022负责尺寸/结构/重复键/版本/备份与事务提交。

## 源异常的设计处置

`src/content/persistence-repairs.ts`登记修复政策：

- 幻兽三重复键：原语义仍unknown；现代legacyPetSeed按保存侧三键分别传给构造器，不改raw。若旧档已经丢失或损坏值，不编造恢复历史。
- 版本检查：先验证实际选中的记录；不能使用上一个SharedObject的版本。源旧版商店调整作为显式迁移运行一次。
- `equitment.initData`拼写/复用槽位残留：现代创建全新领域所有者，不复刻动态悬空路径。原代码不改，不宣称AVM1异常结果已确认。
- 建筑needMainLevels：现代快照显式保存；旧档缺失使用注册初始值作为投影fallback并标legacy-default，raw保持缺失。不用levels推算升级历史。
- 数组/容量：原保存幻兽会截断、原load多处使用当前长度；现代容量仅限制活动投影，不删超限或未来条目。旧档未保存的条目无法从空白恢复。
- 现代快照：构建依赖与派生值后再恢复现代当前状态扩展，禁止回满幻兽生命或重复新建赠送；正常完整往返由016实现。

综合门禁使用`persistenceCompletionIssues`和`acceptedPersistenceAnomaly`：历史异常记录仍保留，只有完整字段语义、独立三字段映射和保留政策同时满足才接受此处置。改status文字、把sd映射到nextLvRate、删初始化语义、换一个异常位置均不能通过。018的form、空lover以及建筑悬空扣款等玩法异常仍在原合同，不在此任务声称修复。

## 消费者与交接

020消费完整字段注册/覆盖及上述异常处置做综合门禁；021实现职业初始化；016实现当前全部领域状态的提取、存储、恢复与正常操作；022实现导入校验、迁移、备份和异常恢复。此次完成不表示已经可以在界面保存或继续游戏。
