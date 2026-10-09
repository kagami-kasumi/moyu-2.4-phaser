# 持久化字段合同 · 已闭合字段语义

TASK-DATA-019在既有逐字段证据上闭合完整schema与恢复合同。最终阶段配方、恢复矩阵、源异常设计处置、现代扩展与验证边界以 [完整持久合同](persistence-schema.md) 和 [验证报告](persistence-validation.md) 为准。本文件保留基础取证细节；早期“尚需”说明由019新增证据补齐，不等同于已经实现存储适配器。

## 已确认的物品字段语义

`item-field-semantics.json` 记录46个 ThingMC 数值属性的 getter、setter 和解码来源，以及原 SWF 中11个容器实例的槽位绑定。背包40格、快捷栏7格、仓库54格、6个装备位、3个幻兽铃铛位和各合成面板的物品槽均使用 sprite2049；`物品栏物品.as:1` 将该链接符号绑定到 ThingMC。

这些属性对应653个存储键模板中的323项。该数量包括不同容器使用的同名属性，并不代表323种不同属性。容器自身的 `number` 是容量，不属于物品数量 setter，已排除。

| 情况 | 原版行为 | 证据 |
| --- | --- | --- |
| 全新槽位、加密后备字段未赋值 | getter通过解码器返回0 | SecreteCodeMC.as:14；ThingMC中对应getter |
| 多数数值属性写入undefined或NaN | setter直接return，原值保留 | ThingMC中对应setter |
| number写入undefined或NaN | 写入0，并更新数量显示/堆叠上限 | ThingMC.as:57 |
| 合法数字或可转数字的字符串 | 乘法编码，再由getter解码为number | SecreteCodeMC.as:10与14 |
| 清空物品槽 | delivery先复制name/type/number/salePrice；type为空格时不进入原物品类别分支，不清除所有旧属性 | frame_9/DoAction.as:5；DefineSprite_2049_物品栏物品/frame_1/DoAction.as:1 |
| 保存空格或undefined类型 | 不写该槽位字段；saveGame先clear整个SharedObject | frame_9/DoAction_2.as:375、441及对应容器循环 |
| 读取缺失或空格type | 调用setThing({type:"空格"}) | frame_9/DoAction_2.as中对应readGame容器循环 |

因此不能把新实例的getter默认0直接用作每个存档缺失键的替换值。全新实例、复用槽位、对象属性不存在、显式undefined和合法0是不同状态。原版编码的负乘数可能使显式0解码为-0；原逻辑的数值比较不区分它们。

原版delivery不会删除所有旧属性，但保存按当前type选择字段，因此非当前类别的残留字段一般不写入。现代域对象不应依赖这种显示对象残留；需要在原版导入适配中按源分支恢复语义，再构造新的实例记录。此条是design，不是源行为。

## 角色与幻兽读取语义

`class-accessor-evidence.json`记录RoleMC与HuanShouClass的直接数值解码getter及别名链，连同完整setter函数体。已使用原getter执行样本验证；这证明读取类型是number，不证明完整构造后的默认值或setter副作用已核验。与物品字段及已单独核验的货币合计，当前365个键模板具有已确认数值读取类型。另有30个戒指属性选择器键确认属于string或undefined；其余字段已按具体归属补充类型证据，当前653项均有正常源状态的类型说明。新增NPC默认值从原FriendClass构造器逐条计算，保留缺省jobLevels；任务、角色、技能和地图的默认值按各自初始化入口记录。完整初始化后的值、恢复顺序及setter副作用仍需核验，不能据此宣布最终schema完成。

戒指mainType1/2与pairType1–4保存属性名，不保存属性数值。全局属性名表、生成器与delivery直接复制共同确定其含义。新手戒指从池中不放回抽取；结婚戒指主属性取决于14位对象，其中薇薇安、麦克、娜尔莎、兰斯的两项主属性相同，必须保留重复。默认值是源生成结果，加载时不得重新抽签；未赋选择器保留undefined，不能补成任意主属性。

保存属性与读取时写入的属性不一定同名。原版将`role_maxLife`从`role.maxLife`保存，却通过`role.xxx_maxLife`恢复；`role_militaryRank`保存`militaryRank`，恢复`xxx_militaryRank`。这些getter别名的公开setter可能只输出错误而不赋值，不能机械地用保存属性名调用setter。逐键load语句保留在persistence-survey.json。

### 货币勘误与已验证规则

RoleMC.as:198、232的xxx_ms/xxx_res setter先拒绝NaN，再把超过100000000的值限制为100000000，更新防篡改镜像、编码数值和格式化文本。没有下限判断。get函数从编码读取；防篡改镜像多次不一致时会返回0，这属于原版运行时校验，不是现代存档字段。

map frame2的wudi将两者写为1000000000，但有效新游戏余额为各100000000。此前测试替身使用普通对象字段，漏掉了这一层；TASK-DATA-015修正了运行时、离线oracle和浏览器余额断言。金钱袋奖励在余额达到上限时仍按原useItem流程消耗，余额不会超过上限。

验证使用`role-currency-source.json`冻结的原setter/getter与源码哈希；覆盖负数、0、上限前/等于/超过上限、开局写入、NaN和Infinity，并执行实际背包使用奖励流程。现代代码将上限和开局写入值放在role-state-rules.ts；不移植原版数值混淆和镜像防篡改副作用，此为design。

## 未实现内容的保留规则（design）

存储记录将内容身份和实例数据分开：稳定contentId是可选关联，原type/name/vocational与原始字段保留。注册条目尚未实现、当前版本不认识该ID、或原版引用没有工厂定义时，记录保持不可执行，但不得删除、替换成普通物品、发放补偿或默认转成0。

解码后的原始记录与可运行的投影视图分开。只有拥有明确语义的模块可以更新自己负责的字段；重新保存必须合并回未被修改的其他字段，包括未知字段和未来版本字段。重复物品、顺序、空槽位置、数量0与字段缺失均不得通过去重或真值判断丢失。地图/任务/幻兽引用同样保留，不因当前区域尚未实现而改写为新手地图或初始任务。

原始值采用显式类型表示，允许记录undefined、NaN、正负Infinity与数组空洞；不要依赖JSON.stringify对这些值的隐式处理。对象原型和方法不是持久数据，运行时句柄、Phaser对象与显示对象不能进入保存记录。后续存档实现必须为这些保留规则执行往返测试，并在版本迁移中显式记录发生的字段转换。

源恢复幻兽对象重复nextLvRate键的问题见source-contract.md。现代合同分别保留nextLvRate、sd、qyg；不能把原版重复键错误当作删除后两字段的依据。

## 原类型阶段的缺口与019闭合

019新增finalInitialization、restorePlan、postRestoreEffects与restore-matrix，覆盖角色setter、技能后写、任务need数组、动态NPC关系、幻兽初始化和显示状态；不能套用ThingMC默认值。详见完整持久合同；类型观察本身仍不构成恢复语义证据。

## readGame 之外的读取

对全部734个源脚本补查 `moyu_so.data` 字面访问，字典以externalAccess保留额外消费者。saved和saveTime虽不由readGame赋给游戏状态，仍由DefineSprite_4233存档选择面板读取；frame_8预读role_vocational和role_myName以选择加载路径。因此“没有readGame读取”不等于无用字段。

背包/快捷栏/仓库容量和npcState_length有源保存，没有发现对应直接读取；源恢复循环使用当前容器或表长度。现代存档仍应保留这些原值，并将现代容量恢复政策标为design。扫描不将未分析的动态别名推断为不存在，也不据此宣告全schema完成。

## 现代无损值表示（design）

`src/content/preserved-value.ts`实现独立的数据表示转换，不是游戏存储适配器。显式undefined、缺失键、NaN、正负Infinity、负零、稀疏数组空洞，以及数组上的命名属性均可经过JSON往返。补充命名属性是为避免把AS关联数组误当作纯数字数组后丢数据。对象键以自有数据属性恢复，包括__proto__，不会赋给对象原型。

所有911条注册内容的payload经过转换往返测试；这证明内容可表示，不证明游戏状态提取、旧档迁移或存储可靠性。循环引用须使用显式内容ID；类实例、函数、符号和访问器不静默丢弃，转换会报错。恢复函数接收已符合PreservedValue模型的数据，外部文件的结构、尺寸、重复键及版本验证留给TASK-SAVE-016，不应直接把未验证导入文件传入此函数。
