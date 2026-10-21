# 质量门禁

## 边关城市与边境幻境门禁

`check:border-city`独立核对三地图、刺虫人6选择器/12帧跑/9帧攻击、Action/AS/P-code和20张FFDec重建PNG。源测试执行生成、12奖励分支/超级幻兽及工厂、首赠与严格入侵计时、药店数量不变和共用巧匠绑定。领域/碰撞验证三地点、部分战斗、清场出口、旧字段、非法档、死亡/幸运homeCity及旧回调。原entry1不在幻境显示列表，现代entry6入场/清场是明确design修正，不声称原AVM1落点精确。双职业浏览器分别验证城市服务/合成产物消费、受控高阶装备实际战斗和奖励消费/存取，另测满包、暂停、死亡与关闭入口。见[border-city源合同](../reverse-engineering/border-city/source-contract.md)。

## 南城野外五门禁

`check:south-field`独立比对五野外地图、两个完整怪物家族/技能、Action/AS/P-code和40张重建PNG。源测试运行frame63、flashBoss、bossLevelsUp、行踪useItem、三个头目及四野外完整掉落，明确初始/随机攻击公式和升级先于护卫。领域/碰撞检查独立计数、每波/预警/宝箱存取、135/270上限、死亡/暂停/跨图/旧回调及raw地图名。双职业浏览器明确使用受控装备完成真实战斗、开箱/精准拾取/返城出售/导出导入，另有满包和死亡/幸运返回。见[south-field源合同](../reverse-engineering/south-field/source-contract.md)。

## 南城劫狱门禁

`check:south-rescue`独立对照六地图、四怪物家族选择器/全部动作、Action/AS/P-code和78张FFDec PNG。source测试逐字段运行原地图与flashBoss/initMonster，执行监狱死亡、catchThing/getPrize及10000个宝箱抽签。逻辑/碰撞覆盖四野外、三波、任务接取/拒绝/领奖、城堡门槛、兑换、未知命令、暂停/死亡/旧回调、满包和旧档。浏览器分别记录081自然存档公爵接取与受控强队真实战斗、返城奖励消费和城堡往返，不冒充自然养成。详见[south-rescue源合同](../reverse-engineering/south-rescue/source-contract.md)；野外五独立头目循环、边关和社交扩展另包。

## 南城第5军团门禁

`check:south-battle`对照六地图、三魔军家族20选择器/七动作、Action/AS/P-code和52张独立FFDec PNG。south-battle源/掉落/碰撞/领域与south-quest源测试覆盖60/62/65级、主将三份幻兽基础值、副将零停顿、随机顺序、任务10/11及共享oldCity。浏览器必须使用078两职业真实home档正常清四个有敌人的战区并访问五区；完整领取并消费20万资源要先真实腾出容量，不能以封顶余额充当消费证明。受控左区、满包、暂停、死亡/幸运返回、旧档及部分清场存取单独记录。南城城市/幻境与独立NPC业务不由此门禁关闭。详见[south-battle源合同](../reverse-engineering/south-battle/source-contract.md)。

## 沼泽城市幻境门禁

`check:swamp-city`独立对照两地图、绿魔精八选择器及12/9/8帧动作、Action/AS/P-code和22张PNG。源测试执行原函数逐字段及随机顺序比较；领域覆盖城市首赠、七项药店、侵入、奖励、回城和旧档。自然双职业浏览器与受控全部奖励消费、满包、死亡/幸运返回分开记录，见[源合同](../reverse-engineering/swamp-city/source-contract.md)及验证记录。

## 沼泽第6军团门禁

`check:swamp-battle`独立对照六地图、三魔军家族20选择器、Action/AS/P-code与53张FFDec PNG。swamp-battle源、掉落、碰撞、领域及swamp-quest-source测试覆盖50/52/55级生成覆盖顺序、全部随机掉落工厂、可消费路径、国王准入、五旗、主线9/10与逆序奖励、旧字段和部分战斗存取。浏览器使用075两职业实际导出档，以正常输入完成四个有敌人的战区、奖励消费、军需官往返、刷新及文件导入；受控五区视觉、暂停、死亡、幸运返回和满包拾取独立记录。范围与design见[源合同](../reverse-engineering/swamp-battle/source-contract.md)。城市/幻境和独立NPC业务不得据此宣称完成。

## 幸运之门挑战门禁

`check:lucky-gate`验证独立XML/Action/哈希及152图，明确150独立重建与2原图完整性。lucky-gate源/领域/碰撞测试覆盖12物种、30轮、动态等级、掉落顺序、逐波保存与宝箱幂等。浏览器分为067真实奖励进入/战斗/回城和高阶受控装备的两职业30轮真实输入；不以kill替代战斗，也不宣称高阶装备自然获取已经验证。详见[源合同](../reverse-engineering/lucky-gate/source-contract.md)与[验证记录](../reverse-engineering/lucky-gate/validation.md)。

## 元帅爵位与军衔任务门禁

`check:marshal-quests`核验独立Action及AS/P-code哈希；`marshal-quests.test.mjs`执行原菜单、接取、catch/getPrize/功绩函数，覆盖66资格组合、支线优先计数、两种领奖顺序、满包随机顺序、旧档迁移、高爵位不降级、真实战斗和存取。浏览器两职业自然接取→行踪→头目与跨波五精英→晋升→风元素打造，另测满包、死亡和旧回调。相邻回归为palace与kasano-finale；幸运之门挑战另属068。详见marshal-quests/source-contract.md。

## 皇宫抽奖箱门禁

- `tests/palace-lottery.test.mjs`独立执行原抽样100000组合，39种完整工厂字段，两职业40槽和满包随机/扣除顺序；新建免等待、读档严格大于300000毫秒、取消与旧确认、跨图和codec不重抽。
- `tests/browser/palace-lottery.spec.mjs`两职业正常拆灵魂礼包、走到皇宫抽奖并使用奖品、刷新/文件导入后等待拒绝；受控40槽满包掉落与等待到期。截图在`.evidence/palace-lottery`。见[源合同](../reverse-engineering/palace-lottery/source-contract.md)。
- 参数化高级宝石使用源默认数值，无额外随机属性；其他NPC的三种抽奖活动不由本门禁关闭。

## 皇宫与元帅捐献门禁

- `npm run check:palace`比对完整FFDec XML显示列表、NPC/地面子时间轴、Action与AS/P-code哈希、七张独立PNG和正式转换资源（含国王frame33/4275及额外保留公主图）。
- `tests/palace.test.mjs`与`tests/palace-source.test.mjs`覆盖完整源菜单66组合、七类型七品质六余额、三档魔石与缺款/封顶、独立碰撞、所有权/过期确认、五地图codec、显式旧军衔与原始战斗力字段。
- `tests/browser/palace.spec.mjs`覆盖两职业正常勋章资格、跨区、取消/确认、晋升、整件消费、五地点刷新和真实导入；受控低等级/不足/未知/零奖励。截图位于`.evidence/palace`。源与design边界见[源合同](../reverse-engineering/palace/source-contract.md)。
- 国王任务、东宫、花园、PK和抽奖不由此门禁宣称开放；显式旧军衔优先于军功余额推断，未知军衔拒绝并保留档案。

## 幻兽孵化与收藏门禁

- `tests/pet-hatching.test.mjs`覆盖全部49固定变体/三个构造抽签、奇迹龙四分支和量化、39/40容量、原随机顺序、失败不扣蛋、旧槽和真实codec无重抽；浏览器两职业末级商店正常购买孵化与实际导入，另有40容量导入专项。
- `tests/pet-collection.test.mjs`独立运行原排序、四格显示与身份删除；验证空集合/末页/同分/未知评分、取消旧确认、原始附加字段随存活对象及三次存取。收藏浏览器覆盖正常批量购买、分页、释放、再孵化与导入。
- 释放保护battle=true，召回未开放；排序仅投影，结构性删除的raw字段归属见[收藏合同](../reverse-engineering/pet-collection/source-contract.md)。

## 幻兽属性详情门禁

- `tests/pet-details.test.mjs`：完整AS类独立oracle，25物种/49固定种子共21,600组合；世代、元素、称号、等级、评分、零分母及未知输入，旧档raw推广和真实codec往返。明文与混淆数值半整数舍入差异有单独测试。
- `tests/browser/pet-details.spec.mjs`：两职业无probe城三购买/领奖/孵化、切换详情、关闭旧按钮、跨图、刷新和真实导入及新建重置；截图`.evidence/pet-details`。详见[源合同](../reverse-engineering/pet-details/source-contract.md)。
- 详情只读，不将铃铛持有、初始battle标记或展示评分等同于已开放战斗/合体/出征能力。

## 幻兽商升级门禁

- `tests/pet-shop-upgrades.test.mjs`：四阶段独立任务索引、两职业64组合费用/满包/声望/随机调用源对照、领奖清零与NPC索引2/任务20..23旧档推广。
- `tests/browser/pet-shop-upgrades.spec.mjs`：两职业正常四次升级、独立领奖、高阶购买与奖励孵化，待领取和已领取的真实存取；受控不足/满包/旧按钮。见[源合同](../reverse-engineering/pet-shop-upgrades/source-contract.md)。

## 幻兽商店门禁

- `tests/pet-shop.test.mjs`：20货位独立目录/工厂/绑定、180组购买与160组整格出售源对照、五档锁定、三商店隔离和旧档推广。
- `tests/browser/pet-shop.spec.mjs`：两职业无probe购买/固定种子孵化/出售/跨图/刷新/真实导入；受控全货位、满包不足、奇迹龙未开放反馈与旧回调。见[源合同](../reverse-engineering/pet-shop/source-contract.md)。

## 城三区旅程门禁

- `npm run check:city-third`：独立FFDec XML完整frame12显示列表、Action、NPC34/37/51与2805子时间轴；五图临时重建对照独立PNG和正式资源。
- `tests/city-third.test.mjs`：frame12完整副作用、独立世界坐标镜像轮廓、六段双向落点、非法目标原子拒绝、四地点完整codec及源地图名。
- `tests/browser/city-third.spec.mjs`：两职业无probe四地图往返、导师兑换/分解、未开放区域/NPC、四地点保存刷新/真实导入。截图在`.evidence/city-third`，见[源合同](../reverse-engineering/city-third/source-contract.md)。

## 装备回收门禁

- `tests/equipment-recycle.test.mjs`：196组七类型经验兑换、26880组四装备分解完整源工厂/顺序对照、满包源掉落、正数量源异常与现代拒绝、替换/旧回调、三铃铛持有及连续转换存档归属。
- `tests/browser/equipment-recycle.spec.mjs`：两职业无probe礼包装备→经验球→升级，另一装备分解→材料提升鞋等级；三阶段实际保存/刷新/文件导入。受控品质6无产物、满包取回、正数量拒绝、取消/切图旧确认。截图在`.evidence/equipment-recycle`，见[源合同](../reverse-engineering/equipment-recycle/source-contract.md)。

## 军团三类打包门禁

- `tests/legion-packing.test.mjs`：独立七源分支枚举，240组完整扣除/堆叠/满包/消息/随机调用对照，取消/旧按钮/切图/新建与保存归属。
- `tests/browser/legion-packing.spec.mjs`：两职业无probe拆三礼包、城二打包、存仓/取回、刷新/真实文件导入后拆包；受控不足和满包掉落。军团NPC菜单继续提供仓库，城二专项同步回归。截图在`.evidence/legion-packing`，见[源合同](../reverse-engineering/legion-packing/source-contract.md)。

## 城二区旅程门禁

- `npm run check:city-second`：完整frame10显示列表/Action、NPC标签和轮廓与独立FFDec XML对照；五图临时重建对照独立PNG及正式文件。背景及NPC像素一致，2802轮廓平均预乘RGBA差小于0.03。
- `tests/city-second.test.mjs`：独立源脚本副作用、24组随机/计时/标记条件、独立绕数碰撞、非法目标原子拒绝、首次物品/满包/三地点保存与旧raw恢复。
- `tests/browser/city-second.spec.mjs`：两职业无probe城郊→城一→城二→城一→城郊、军团仓库存取、三地点刷新与真实导入；受控未开放出口和面板隔离。截图在`.evidence/city-second`，源与design边界见[源合同](../reverse-engineering/city-second/source-contract.md)。

## 杂货商升级门禁

- `tests/shop-upgrades.test.mjs`冻结四阶段完整定义及资助/领奖函数，比较64组两职业/满包/声望组合、费用边界、消息/随机调用和领奖清零，另检查全部四档一次性与旧档NPC编号。
- `tests/browser/shop-upgrades.spec.mjs`验证两职业无probe四阶段升级、独立领奖、末级商品购买/用途、跨图、待领取与已领取的真实导出导入；受控不足/满包和旧按钮。
- 商人等级、任务标记与货位分别拥有状态；不以货位推测旧档任务完成。现代任务数量扩展与原版未保存数量的区别见[源合同](../reverse-engineering/shop-upgrades/source-contract.md)。

## 老兵等级奖励门禁

- `npm test`包含`tests/veteran-level-rewards.test.mjs`：2430组源对照、严格等级边界、九发奖分支、满包/封顶、计数先行、连续补领与持久字段推广。
- `tests/browser/veteran-level-rewards.spec.mjs`覆盖两职业正常成长领取/宝盒开孔、保存刷新/真实导入以及旧raw/备份恢复；高等级与满包单独受控，不冒充正常战斗成长。
- cmd13资源原文字与实际数值差异须保留证据，现代说明与实际发放一致。见[030报告](../reverse-engineering/veteran-level-rewards/validation.md)。

## 戒指打造门禁

- `tests/ring-forge.test.mjs`：4800组十材料全字段/消费/消息源对照，两职业副属性消费者、共享十级上限、错误类型、满包与旧raw推广。
- `tests/browser/ring-forge.spec.mjs`：两职业无probe礼包之心/品质/穿戴/持有保存/刷新/真实导出导入，受控八材料与灵魂王、旧按钮/不足/满包/切图/新建。
- 精炼原始字段不等于当前人物收益，必须显示激活主副属性；四装备模式不可误处理戒指。

## 宝石镶嵌与拆取门禁

- `tests/equipment-gems.test.mjs`：11类别与6336镶嵌、420拆取源对照，七类属性、注册参数变体、满包旧输出回收与raw推广。
- `tests/browser/equipment-gems.spec.mjs`：两职业无probe开孔/采购/镶嵌/装备/拆取/再用/刷新/导入导出，受控费用不足、旧按钮、满包、切图与新建。
- `splitStone`四独占槽完整持久化；经验/减伤聚合进入人物属性，当前无战斗结算不虚构伤害或奖励。验证记录见[028报告](../reverse-engineering/equipment-gems/validation.md)。

## 装备等级提升门禁

- `tests/equipment-level.test.mjs`：冻结makeItem/useGem/yes与两职业四类1120组合、名称/属性/价钱全字段、材料与上限边界、所有权/满包取回及共享人物上限保存和经验源对照。
- `tests/browser/equipment-level.spec.mjs`：两职业无probe购买晶石/升级/等级拒绝/经验成长/装备/礼包之心/保存导入；受控150与120上限、缺材、过期按钮、掉落、切图和新建。
- 当前最高等级由Inventory.maxLevel拥有，经验球、打造、UI、raw.role_maxLevels同步；未实现其他打造机制不能据本门禁关闭。

## 城内药店门禁

- `tests/pharmacy.test.mjs`：七种药品独立目录/绑定/哈希和工厂字段、源购买全矩阵、开放档位、两商店隔离及raw.drugShop迁移。
- `tests/browser/pharmacy.spec.mjs`：两职业无probe采购/使用/逐格出售/刷新/真实导入；受控缺血缺魔、七项目录、满包不足与跨商店旧按钮。
- NPC需遵守面板输入隔离，避免HTML按钮触发背后NPC；原杂货浏览器回归共同验证。

## 城内杂货交易门禁

- `tests/ordinary-shop.test.mjs`：16条独立源数组、AS/P-code哈希、SWF/XML绑定、工厂全字段、数量/空槽/扣款顺序/出售/封顶和旧档推广。
- `tests/browser/ordinary-shop.spec.mjs`：两职业正常入城、购买晶石→强化→出售余料→存档/导入/备份，以及受控全目录、满包、不足、取消/旧按钮。
- 商人职业升级及其他商店属于后续。

## 人物技能学习门禁

- `tests/character-skills.test.mjs`：21书与21技能源枚举、AS/P-code冻结oracle、职业/等级/封顶/整槽扣除、九被动组合、XP首次启用、名称恢复与raw保留。
- `tests/browser/character-skills.spec.mjs`：两职业无probe学习英勇和正常技能面板/存档往返，manual全部目录/拒绝/切图/新建；截图和范围见[024验证](../reverse-engineering/character-skills/validation.md)。
- 主动施放、战斗触发、快捷键编排与其他区域商店尚属后续范围。

## 人物消耗品门禁

- `tests/character-consumables.test.mjs`：11条独立源集合、AS/P-code、冻结函数oracle、全部药品与幻兽优先级、储备顺序/边界、超级球与能量上限、源字段推广和重复保存。
- `tests/browser/character-consumables.spec.mjs`：两职业原版debug命名入口无probe消费、属性/HUD、真实保存导入备份；manual验证药品/不足储备/能量封顶和切图。实际截图与边界见[023验证](../reverse-engineering/character-consumables/validation.md)。
- 不代表其他区域商店、受伤战斗、安全区储备自动充能、幻兽出征/合体已经开放。

## 人物经验成长门禁

- `npm test`包含`tests/player-experience.test.mjs`：独立冻结AS/P-code、默认人物面板与完整确认链、全部等级分段/150级余数、装备/英勇/戒指重算、扣除顺序、无球/死亡/满级/旧回调、成长源字段与codec往返。
- `tests/browser/player-experience.spec.mjs`：两职业无probe冷启动确认/关闭/重复使用、HUD与属性、保存刷新/真实导出导入/备份恢复、新建重置；manual验证边界及切图。实际查看`.evidence/player-experience/`画面。
- 旧背包回归的经验球占位断言改为打开分配后关闭、不扣材料。源与设计区分见[源合同](../reverse-engineering/player-experience/source-contract.md)，检查结果见[验证报告](../reverse-engineering/player-experience/validation.md)。不包含幻兽成长、超级球、转世/成神和战斗经验。

## 完整进度保存门禁

- `npm run check:save`：运行时653字段映射与019注册一致；完整codec/独立源编号、领域往返、所有打造归属组合、911内容payload、坏档/越界/存储异常与重复恢复检查。
- `npm test`同时包含保存领域测试；`npm run test:browser`包含两职业无probe新建、打造/技能/幻兽/领取/移动、保存/刷新/关闭页面重开继续，以及新建/覆盖取消、确认覆盖、失败保护、坏档/未知版本/拒绝读取。正常货币已在新建封顶，非封顶/负值测试边界见[源合同](../reverse-engineering/save-game/source-contract.md)。
- 实际检查`.evidence/save-game/`保存、恢复、异常截图。完整结果见[验证报告](../reverse-engineering/save-game/validation.md)；备份、迁移、导入导出交022，不能据本门禁关闭基础线。

## 角色新建入口门禁

- `npm run check:character-entry`：独立FFDec XML矩阵/标签/子时间轴、11张女法师RGBA基准与正式资源重建；两职业普通/debug初始化、随机奖励与源顺序、任务分支、职业装备、名称原子校验、动作时钟及称号源oracle。
- `npm test`包含角色入口专项；`npm run test:browser`包含无probe两职业菜单/命名/返回/取消/10字符边界/不动已有存储/移动到城内/职业装备，以及22组女法师双向源投影。其余男战士、HUD、背包和打造回归保留。见[021验证报告](../reverse-engineering/character-entry/validation.md)。
- 原版HUD补充清单与现代菜单分开；未实现法师攻击必须拒绝，不能复用男战士斩魂。存储完整性仍由016门禁负责，入口测试不代表存档可用。

本文件约束 harness、源证据转换及当前单角色动作工程；各门禁只证明其实际检查范围。

## 当前门禁

- `npm run check:harness`：检查 [AGENTS.md](../../AGENTS.md)、[agent-protocol.md](agent-protocol.md)、[.agents/harness.json](../../.agents/harness.json) 与 [docs/tasks/state.json](../tasks/state.json) 的入口和状态关系。
- `npm run check:source`：检查源 SWF、`swf-inventory.json` 的存在、哈希和基本元数据。

缺少脚本时不得自行假定其通过，也不得为通过而临时创建假的结果。当前门禁不证明 Phaser、时间轴、碰撞、动作手感或完整游戏行为。

## 动作工程门禁

- `npm run typecheck`：严格 TypeScript 检查；`src/content/manifest.ts` 定义并校验运行清单字段、帧序列与事件位置。
- `npm test`：动作末帧与下一 Activities、循环、切换、镜像保持帧、暂停/恢复、重置、15/30/60/144 Hz 和长停顿的确定性检查。
- `npm run check:first-actor`：需本地只读原 SWF；独立原始标签对冻结 FFDec XML、22 个 FFDec PNG 基准和正式资源；临时重建后比较，绝不重写 expected。
- `npm run build`：构建可独立部署的 dist；不读取原 SWF 或提取目录。
- `npm run test:browser`：先 build，使用本机 Edge，冷启动 dist；44 组原舞台双向逐帧画面、暂停/单步/恢复/重置和停止渲染后的逻辑事件；检查无远程资源或 SWF 依赖。基准为 FFDec PNG 和独立冻结矩阵，报告位于 `.evidence/first-actor/`。

新增门禁必须有独立输入和明确失败输出；不得只检查文件存在或源码字符串。

## 数据与变更边界

原始 SWF 与原始提取物只读保存；派生清单可以用有记录的确定性命令更新，旧证据需要更正时保留来源和变更依据。转换器输出与运行时资源分目录。规则层、内容 manifest、渲染适配器和 Phaser 场景分层，业务事件不能由渲染回调反推。任何假设都写入 `inferred` 或 `unknown`，不修改源文件来消除缺口。

## 结果表述

门禁通过只表示对应检查通过。没有独立源基准、逐帧比较和命中/时序证据时，报告只能说“脚手架可检查”或“资源已提取”，不能说“动作已复现”或“像素/命中时序一致”。

## 首个旅程门禁

- `npm test` 同时检查原动作与旅程；旅程expected由冻结AS函数和独立解析几何提供，含八向、混合输入、松开、滑移、入口可见/alpha、合法目标、固定步进、后台时钟和首帧保持。
- `npm run check:first-slice` 直接从原SWF临时转换，与冻结XML显示列表/轮廓、14张FFDec PNG、行为AS/P-code哈希及正式资源对照；不更新expected。
- `npm run test:browser` 先build再在Edge验收两个页面；既有44动作投影，加旅程三处独立投影、键鼠、异常入口、失焦与两次无probe冷启动。旅程报告在 `.evidence/first-slice/`。
- `index.html` 是有界旅程，`actor.html` 是动作工具；两者都用正式资源。系统字体/现代新建布局是design，独立图像对照不声称完整原屏幕一致。

## 老兵首次奖励门禁

- `npm run check:npc-reward` 从只读SWF临时转换，与冻结FFDec XML显示列表/标签、10段Action哈希、AS/P-code哈希、16张原图及正式资源独立对照；不重写expected。15图严格像素一致，戒指JPEG3仅允许有记录的解码舍入差，alpha不放宽。
- `npm test` 增加冻结源函数oracle，对三个礼包、初始物品/随机戒指、一次性标记顺序、对话生命周期、堆叠/部分入包和地面溢出验证；不把测试替身视为Flash动态执行。
- `npm run test:browser` 增加三次无probe冷启动领取、真实属性查看/重开/连点、注入满包异常和领取后切图，以及11张已显示图像的独立像素对比。报告在 `.evidence/npc-reward/`；保持已有动作与地图回归。

## 游戏首页门禁

- 默认 `/` 自动新建玩家男战士并进入地图；`/?setup` 保留有名字校验的新建流程。自动进入和场内HTML面板为design。
- `tests/browser/game-entry.spec.mjs` 检查默认无说明页外壳、真实移动、老兵对话、背包开关与Esc；截图在 `.evidence/game-entry/default.png`。
- 地图独立像素回归直接读取Phaser canvas的像素，避免新场内HTML面板混入地图投影；完整页面另截图验收。既有原图期望和误差阈值不变。

## 原版主界面门禁

- `npm run check:original-ui`：直接从SWF解析146个UI角色的显示列表/RECT及8个Action哈希，与独立FFDec XML对照；校验12张完整sprite原图基准与冻结脚本，在临时目录重提正式叶片资源并比较。运行资源导出通过FFDec，浏览器没有Flash依赖。
- `npm test` 增加HUD源初值检查，并将完整无条件wudi调用接入新建oracle。原来的“4件/货币0”前缀不再作为完整新建期望。
- `tests/browser/original-ui.spec.mjs` 验证X/C/Esc、40格背包/原位置、真实物品与货币、面板不穿透输入、满包溢出、状态条随领域数值变化；对完整角色sprite基准做浏览器组合对照。源几何严格核对，栅格化差异与文本边界见[源合同](../reverse-engineering/original-ui/source-contract.md)。
- 完整屏幕截图在 `.evidence/original-ui/`。这些检查不证明未开放系统已实现，也不声称整屏像素精确。

## 背包使用与装备门禁

- `npm test` 增加 inventory 源函数对照：32种装备组合、物品消耗与礼包、幻兽容量、英勇上限、功勋军功上限及非法操作。源哈希复核需要本地AS/P-code提取物。
- `tests/browser/inventory.spec.mjs` 冷启动真实操作背包和装备，验证属性、孵化/学习、关闭重开、键盘隔离、切图保持与新建重置。画面与边界见[验证报告](../reverse-engineering/inventory/validation.md)。

## 地面物品拾取门禁

- `tests/ground-items.test.ts` 以独立冻结 AS 函数核验点击、快捷倒序、严格距离、空格门槛、堆叠及名称，校验 AS/P-code 哈希；另验证换装属性守恒与过期引用。
- `tests/browser/ground-items.spec.mjs` 冷启动制造真实礼包与使用掉落，验证点击/空格回收、失败恢复、面板隔离；受控满包卸下装备验证远程点击、无移动、切图和新建清理。截图在 `.evidence/ground-items/`。

## 老兵勋章兑换门禁

- `tests/veteran-exchange.test.ts` 将冻结 command case6/7 与 accountThing/useThing 接入独立源 oracle，核对数量、跨槽顺序、扣除腾格、满包堆叠/掉落、消息及对话生命周期；复核 AS/P-code 哈希。
- `tests/browser/veteran-exchange.spec.mjs` 无 probe 冷启动验证领取后兑换、49次连续付费兑换与不足、满包掉落回收、旧按钮重放和新建重置；manual 模式验证切图保留兑换结果。截图位于 `.evidence/veteran-exchange/`，必须实际查看。宝盒开孔/等级奖励不属于本门禁。

## 月光宝盒开孔门禁

- `tests/equipment-sockets.test.ts` 用完整冻结makeItem/useGem/按钮和upDataWeapon做192组独立源对照，核验三档孔数条件、四类装备、材料消耗、售价、拒绝类型、过期操作、关闭持有和满包回收；`tests/inventory.test.ts` 的源装备属性对照扩展到0–3孔。
- `tests/browser/equipment-sockets.spec.mjs` 冷启动正常领取/兑换/三级开孔/取回穿戴，受控满包掉落回收和切图/新建；实际检查 `.evidence/equipment-sockets/` 截图。新面板为design，不声称复刻原打造面板外观。

## 魔魂强化门禁

- `tests/equipment-magic.test.ts` 用独立冻结makeItem/useGem/yes/upDataWeapon进行840组源对照，核对四类、两材料、品质上限、数量边界、全字段重算、消息、过期操作及满包拾回；穿戴后用冻结装备与人物公式比对。
- `tests/browser/equipment-magic.spec.mjs` 冷启动无probe完成礼包→四件强化→穿戴与+19上限拒绝；manual验证晶石/之心零数量、品质5/6上限、旧按钮、满包拾回、切图和新建。实际查看 `.evidence/equipment-magic/` 十张截图；共享打造面板仍保持开孔回归。

## 灵魂晶石品质提升门禁

- `tests/equipment-quality.test.ts` 执行720组完整源分支对照（四类、五品质、数量和元素边界），检查全属性、材料与消息；组合品质→三档开孔→魔魂→穿戴，对照装备和人物公式。
- `tests/browser/equipment-quality.spec.mjs` 无probe冷启动四件极品、品质可见、继续魔魂与开孔；受控不足/零数量、旧按钮、满包拾回、切图和新建。实际查看 `.evidence/equipment-quality/` 十一张截图；品质徽标必须可见，不能只断言DOM中存在。

## 内容身份与引用门禁

- `npm run check:content-identities`：TASK-DATA-015身份范围的负向测试、原脚本/SWF核对、独立源身份枚举、逐类差异、动态域和报告漂移检查。报告在[身份验证报告](../reverse-engineering/content-registry/identity-validation.md)。
- `node --experimental-transform-types tools/check-content-identities.mjs --write`仅在审查源变化后更新派生覆盖报告；日常check只读并检查漂移。
- 不替代`check:content-registry`的全数值与持久化综合门禁；已知恢复异常仍阻断后者，后续由019处理、020集成验收。

## 角色与物品数值门禁

- `npm run check:role-item-rules`：只读检测017声明目录漂移、逐值原脚本对照、2461条精确归属和删除/改值负向测试；执行人物属性/技能、物品数值、五族生成及既有角色物品source专项。
- `npm run build:role-item-rules`：按已审查的精确范围生成`role-item-coverage.json`及`role-item-rule-data.ts`。原始SWF/提取物和旧索引reviewed-module标记不变。
- 数值规则模块与惰性表达式目录不等于开放游戏效果；浏览器回归只证明既有旅程没有回归。详见[017验证报告](../reverse-engineering/content-registry/role-item-validation.md)。

## 幻兽与世界数值门禁

- `npm run check:pet-world-rules`：65项源专项，核验幻兽/怪物受击差异、幻化、世界掉落调度、效果计数器、NPC兑换及复用模块；另检查逐值/条件/有序调用、9611条并集互斥覆盖及篡改/遗漏/重复负向测试。
- `npm run build:pet-world-rules`：生成018归属报告、正式惰性目录和人工审查的模块语义合同。1006条表现/控制排除逐条给理由，927条持久入口明确移交019，不提升为已完成恢复语义。
- 规则模块不导入Phaser；表达式不执行。只读源对照与动态绑定未知严格分开，详见[018验证报告](../reverse-engineering/content-registry/pet-world-validation.md)。

## 持久字段语义门禁

- `npm run check:persistence`：独立对账653源模板/全部读写位置、外部消费者、927移交ID；校验正式恢复矩阵与字段漂移，直接执行人物/幻兽/技能/关系/日常目标源片段；测试现代无损表示、具体键归属更新和源异常设计处置的负向用例。
- `npm run catalog:persistence`生成字典、恢复矩阵、移交覆盖和正式注册；不能替代只读检查。`npm run inspect:persistence`只读正式目录，不执行源表达式。
- schema完成不等同于存储实现。完整正常存取与浏览器操作由016完成，输入格式验证/迁移/备份由022完成；[019验证报告](../reverse-engineering/content-registry/persistence-validation.md)记录精确覆盖与限制。

## 注册综合与既有消费者门禁

- `npm run check:content-registry`串联源调查、身份、017数值、018数值、019持久专项和020精确集合/负向检查，检查`integration-coverage.json`漂移。旧数值审核与引用分类标签保留，不能以标签代替这些检查。
- `node --experimental-transform-types tools/check-content-registry.mjs --write`只生成已检查的集成映射，不能替代综合命令和运行时门禁。
- `npm test`保留独立源消费者回归并检查注册ID/实例隔离；`npm run test:browser`验证构建后的既有可玩旅程及原图。见[020验证报告](../reverse-engineering/content-registry/integration-validation.md)。注册完整不表示全部规则执行、全部角色或存档已完成。

## 存档迁移与异常恢复门禁

- `npm test`包含`tests/save-recovery.test.ts`：真实现代v1迁入容器v2、最多3份备份、单次提交失败零写入、旧键只读、删除/冲突/截断/版本边界以及653模板和911payload保留。
- `npm run test:browser`包含`tests/browser/save-recovery.spec.mjs`：两职业真实下载/导入/备份恢复、取消、配额失败、双页冲突、读取拒绝、完整库截断后外部文件恢复、debug掉落不重复及备份删除确认。原016两职业完整新建到城内继续旅程仍运行。
- 实际检查`.evidence/save-recovery/`截图和下载文件；源与现代策略、无法凭空恢复丢失字节的边界见[恢复合同](../reverse-engineering/save-game/recovery-contract.md)，结果见[验证报告](../reverse-engineering/save-game/recovery-validation.md)。本门禁关闭022，不代表完整游戏内容已实现。

## 装备元素门禁

- tests/equipment-elements.test.mjs：2240组七材料、两职业四装备、声望/品质/等级/数量/四随机分支完整源对照；混合和五套装与品质/魔魂/孔效果叠加，旧回调、保存和未知字段。
- tests/browser/equipment-elements.spec.mjs：两职业无probe四件雷套装、人物属性、刷新和真实导入；受控六材料/上限/满包/切图/新建。原版通用开局已有4雷元素，debug另送5；其他材料获取与元素战斗结算仍未开放。
- [源合同](../reverse-engineering/equipment-elements/source-contract.md)与实际截图位于.evidence/equipment-elements。

## 高阶装备重铸门禁

- tests/equipment-reforge.test.mjs：3920组两职业四装备、两材料/品质/声望/数量对照，全对象和消息顺序；神品/上神品魔魂上限、元素保留、完整属性消费者和保存边界。
- tests/browser/equipment-reforge.spec.mjs：明确受控材料后，两职业四件上神品→魔魂50→重置1级→穿戴→刷新/真实导入；正常缺材、满包和回调生命周期。尚未开放自然获取。
- 四装备存档品质允许0–6，戒指仍0–4；不放宽未知物品执行边界。见[源合同](../reverse-engineering/equipment-reforge/source-contract.md)。

## 魔之魂附加门禁

- tests/equipment-soul.test.mjs：768完整打造源对照、104组全装备/人物属性组合、默认/0/未知类型、剩余材料变更、覆盖与独立字段保存；所有源哈希保留。
- tests/browser/equipment-soul.spec.mjs：两职业受控材料后真实四件附加/覆盖/穿戴/刷新与文件导入；十类目录和默认、旧回调、满包、切图和新建。无自然供应时如实说明。
- 原make_item缺val1/val2，现代完整对象扩展补足持有保存；spirit系列另标战魂。见[字段合同](../reverse-engineering/equipment-soul/field-ownership.md)。
## 城郊管理员交易门禁

- tests/outskirts-trade.test.mjs：独立7分支枚举和2548组源对照，比较余额、材料、入包/掉落、消息与随机调用顺序；保存raw和回调生命周期。
- tests/browser/outskirts-trade.spec.mjs：两职业无probe资源出售→正常礼包材料→地图/券→刷新和真实文件导入；受控不足/满包和切图。实际截图在.evidence/outskirts-trade。
- 来源与未开放使用边界见[交易合同](../reverse-engineering/outskirts-trade/source-contract.md)。
## 卡萨诺城产权门禁

- tests/outskirts-property.test.mjs：216组独立产权购买源对照，爵位与费用顺序、货币封顶、独立产权/爵位保存与旧档迁入、未实现地区保留。
- tests/browser/outskirts-property.spec.mjs：两职业真实使用勋章晋升、取消/确认/一次性交易、刷新和文件导入，受控不足/封顶/生命周期；实际截图.evidence/outskirts-property。
- 产权不代表野外收益已实现，见[源合同](../reverse-engineering/outskirts-property/source-contract.md)。
## 两地区持续往返门禁

- tests/city-roundtrip.test.mjs：双向源目标/落点、持续城内移动、错误目的地无部分修改，资产保留/掉落清理与两地点旧complete档继续。
- tests/browser/city-roundtrip.spec.mjs：两职业无probe城内商店→移动→返回管理员/老兵→两地保存与真实导入继续往返；repeat按键、受控过期回调/未开放出口/清理。实际截图.evidence/city-roundtrip。
- 首段到达不再冻结移动，旧测试只移除旧单向范围断言，保留原图/方向/碰撞/输入验证。见[源合同](../reverse-engineering/city-roundtrip/source-contract.md)。

## 高级宝石融合门禁

- `tests/gem-fusion.test.mjs`：9450组独立源函数对照、有序组合/阈值/声望/整槽消费及双槽raw归属。
- `tests/browser/gem-fusion.spec.mjs`：两职业无probe采购/同类提升/圣石、镶嵌入口、持有/取回存档与真实导入；受控满包/不足/旧回调/切图和新建。
- 原版阈值可越过上限显示值，不能无证据夹紧；现代背包入口不表示城堡经营完成。见[源合同](../reverse-engineering/gem-fusion/source-contract.md)。

## 仓库存取门禁

- `tests/warehouse.test.mjs`：432组独立源堆叠/空槽/余量对照、两职业取回掉落、54槽raw编号与未知占位、切图/新建/旧回调。
- `tests/browser/warehouse.spec.mjs`：两职业无probe存入/取回使用/跨图/保存/真实导入，受控满仓/满包及54槽旧档未知物品保留。
- 54格固定容量；现代入口和余量留在原背包的设计与原拖放明确区分。见[源合同](../reverse-engineering/warehouse/source-contract.md)。

## 幻兽出征成长门禁

- tests/pet-progression.test.mjs独立AS函数对照49变体、19经验边界、顿悟、2/3槽身份、评分消费者及旧档往返。
- tests/browser/pet-progression.spec.mjs两职业正常购买孵化/出征/经验/召回释放/刷新与实际导入，受控死亡和第三槽；截图.evidence/pet-progression已查看。
- 出征身体使用现代随行标识；原动画与战斗未开放。见[源合同](../reverse-engineering/pet-progression/source-contract.md)。

## 幻兽治疗复活门禁

- tests/pet-recovery.test.mjs：288源面板组合、2/3槽reLife、库存身份与codec；药品整格消费和生命储备容器保留分别断言。
- tests/browser/pet-recovery.spec.mjs：两职业正常采购治疗，受控死亡/储备/复活/成长与真实存取；管理员交易回归。源合同及截图见pet-recovery目录。

## 幻兽铃铛门禁

- tests/pet-bells.test.mjs：8,820原类属性组合、三装备槽源接受与顺序、五品质面板战斗力、满包掉落、生命钳制、旧raw保留与codec。
- tests/browser/pet-bells.spec.mjs：两职业受控入包后正式装备/召回换兽/成长/卸下/跨图/刷新与实际导入，另测满包旧回调；049/050浏览器共同回归。
- 装备属于出征槽，持有不会生效；最大生命变化不自动回满。源与设计边界见[铃铛合同](../reverse-engineering/pet-bells/source-contract.md)。

## 铃铛融合门禁
- tests/bell-fusion.test.mjs覆盖12,960组冻结源对照及双槽所有权、未知raw与会话边界；tests/browser/bell-fusion.spec.mjs覆盖两职业正式融合/装备/持有存取与满包。见[验证](../reverse-engineering/bell-fusion/validation.md)。

## 幻兽进阶门禁
- tests/pet-advancement.test.mjs覆盖4410组十道具原类对照和进化/随机/消费边界；浏览器专项覆盖两职业实际进阶和文件恢复。见[验证](../reverse-engineering/pet-advancement/validation.md)。

## 幻化师转世丹制作门禁
- tests/pet-pill-crafting.test.mjs独立源对照1152组完整配方/费用/扣料/满包/随机，浏览器两职业自然晶石礼包制作使用保存和受控灵魂王。见[验证](../reverse-engineering/pet-pill-crafting/validation.md)。

## 幻兽主属性幻化门禁

`tests/pet-main-fusion.test.mjs`对照2356完整面板与HuanShouClass，2940组合及评分/等级/随机、消费、归属和保存边界。`tests/browser/pet-main-fusion.spec.mjs`两职业正常购买孵化、确认、成长、跨图和真实存取，并受控高评分、满槽和异常旧数据。源NaN及缺失旧倍率保留并拒绝危险消费，见[源合同](../reverse-engineering/pet-main-fusion/source-contract.md)。

## 幻兽转世幻化门禁

`tests/pet-rebirth-fusion.test.mjs`2400源组合与部分消费/身份/存取；`tests/browser/pet-rebirth-fusion.spec.mjs`两职业自然材料和成长、受控部分消费及上限。经验球先于等级和晶石检查，确认预览必须显示可能耗球但失败，见[源合同](../reverse-engineering/pet-rebirth-fusion/source-contract.md)。

## 幻兽评称门禁

`tests/pet-titles.test.mjs`1200源组合及25种原序名额、异常旧raw和三次存取；`tests/browser/pet-titles.spec.mjs`两职业自然低分拒绝与受控连续五称号/名额保存。收藏快捷入口为design，冰宫及原NPC社交未开放；见[源合同](../reverse-engineering/pet-titles/source-contract.md)。

## 幻兽合体门禁

- tests/pet-merge.test.mjs：600组两职业/全种子/三槽/铃铛源对照，死亡/召回/异常归属及真实codec。
- tests/browser/pet-merge.spec.mjs：两职业正常合体/分离/成长/跨图/文件存取、旧按钮与受控三槽。源与现代边界见 pet-merge/source-contract.md。

## 安全区域恢复门禁

- tests/safe-recovery.test.mjs：四帧安全入口、512组完整源函数、无每帧回血/读档回放、非法跳图和未知输入原子性。
- tests/browser/safe-recovery.spec.mjs：正常成长跨图补充储备、三槽生死与实际存取；城内和复活回归。

## 全队自动治疗门禁

- tests/party-healing.test.mjs：648组九恢复品从真实Inventory进入，源优先级/MP先行/储备/扣除，平局、稀疏槽、召回、未知数据与三次codec。
- tests/browser/party-healing.spec.mjs：两职业正常采购使用和受控三槽药品/储备共享、合体/死亡/未出征及真实存取；药店、指定治疗和合体回归。


## 皇宫与王室区域门禁

TASK-WORLD-061/NPC-062/WORLD-063的源合同及验证分别在palace、palace-lottery、royal-wings证据目录。新增check:palace/check:royal-wings对照独立XML、Action和FFDec PNG；四个新地面额外校验逐边填色/描边与全图网格碰撞。王室源码奖池对照覆盖全部20000个随机整数，两职业首次礼物、重复消费/满包/等待/旧命令与九地图codec；浏览器必须完成两职业自然旅程、全部地点刷新和文件导入、奖品实际使用以及两类完整重复奖池。相关修改执行typecheck、npm test、build、check:save、专项浏览器及皇宫/抽奖回归。解析器变动另执行check:source。


## 卡萨诺野外一首战门禁

- `check:first-combat`独立核对18时间轴、17Action、50张PNG及正式地图/法师攻击实际消费资源；`monster-behavior`、`combat-targeting`、`base-player-strike`、`first-combat-drops`、`first-boss-drops`及幻兽规则执行源函数对照。
- `first-combat-live.test.mjs`覆盖实际Journey所有者、两职业命中、奖励仅一次、六怪/龙怪、满包、合体/死亡、暂停/旧会话、产权资源、装备灵性、初始任务源消费与领奖、战斗保存/原字段迁移；`combat-effects.test.mjs`验证真实frame1脚本节拍。
- `tests/browser/first-combat.spec.mjs`两职业无probe六怪首战与任务奖励装备、保存/继续/往返重入；受控导入死亡、领奖、满包与暂停预警。相邻回归为city-roundtrip两职业自然旅程。
- 源与design边界见`docs/reverse-engineering/first-combat/source-contract.md`，结果见同目录validation.md。不据此宣称野外二及之后区域或完整技能库可用。

## 卡萨诺野外二三与训练后续门禁

`check:kasano-training`核对两图完整XML/Action/AS/P-code、地面子时间轴及四张独立FFDec PNG。`kasano-training-spawn/drops`执行原初始化与完整奖励分支，`kasano-training.test.mjs`对照三阶段完成/解锁/领奖并验证危险区域、普通龙怪分类、波次/旧档、死亡、暂停和跨图失效。浏览器两职业从真实064导出继续四精英/六龙怪，装备头盔/鞋、保存/刷新/导入及边界；相邻首战回归包含战斗中背包操作。源与design分界见kasano-training/source-contract.md。

## 卡萨诺野外终章门禁

`check:kasano-finale`核对两图完整XML/Action/AS/P-code、地面与宝箱时间轴及五张独立FFDec PNG；独立XML网格验证野外五多段地面。终章spawn/drops/elite-drops/chest测试执行原初始与后继分支、同步随机奖励和完整奖池；live测试覆盖行踪消费、透明通道、共享训练四、成长后后继、150tick预警、满包宝箱、防重复、旧回调和连续previous存档链。浏览器两职业从真实065导出经正常掉落/攻击到三头目及宝箱，再实际消费玉石与玫瑰；受控高等级、暂停、满包、死亡与真实导入，065相邻流程回归。执行typecheck、npm test、build、check:save、check:source及harness检查。证据与明确限制见kasano-finale/source-contract.md和validation.md。

## 戈壁第7军团门禁

072执行check:gobi-battle，独立XML/Action/AS/P-code、53张FFDec PNG、三家族20选择器/七动画、六地图全部深层入口/backPoint与位移地面；五区完整生成及15次随机、三类死亡掉落/旗标、主线和荣誉确认以原函数为expected。源、领域、六图独立光栅碰撞和实际浏览器分别覆盖五区/部分存档/死亡/补给/暂停/满包/旧回调。两职业必须从071真实导出进行自然副将和主将战斗，领取并使用超级经验球，真实腾出资源容量再领取消费，军需官离场和刷新/文件导入。运行typecheck、npm test、build、check:save、专项资源/浏览器和071/070相邻回归；五旗现代extension不伪造为原保存字段。

## 树心城与幻境门禁

071的check:shuxin-city必须对照独立XML/Action/AS/P-code、六选择器/一帧跑动/八帧攻击、16张FFDec PNG及保留depth24回城点。源oracle覆盖城市首赠/药店/共享随机计时、完整四怪数值、192种掉落和工厂随机交错、NPC外观/位置与末帧命中；曲线地面使用独立光栅内外样本。领域与浏览器验证双职业自然通关、药品购买消费、奖励出售和受控电浆变雷/四蛋、满包、死亡/幸运之门回城、部分与清空战斗存取。最终执行typecheck、npm test、build、check:save、专项源/浏览器及强盗/卡萨诺幻境/幸运之门相邻回归；不把未开放城市专属NPC服务算完成。

## 树心路强盗门禁

070的check:shuxin-bandits对照独立XML/AS/P-code/Action、正式地图及八选择器/三动画、24张FFDec PNG。源函数测试覆盖18次初始生成、道路条件与预警、456组完整掉落随机顺序、原任务计数/逆序领奖/爵位军衔、英雄令直接使用及500声望上限；曲线碰撞对照独立光栅样本。领域与浏览器分别验证暂停/跨图取消、部分波次/旧档迁移、死亡、满包/重复领奖与两职业自然三波、奖励实际消费、晋升捐献、返城和刷新/导入。相邻卡萨诺幻境、训练四与城三实际回归；运行typecheck、npm test、build、check:save与harness。源事实/design与具体限制见shuxin-bandits/source-contract.md。

## 元帅任务、幸运之门与卡萨诺幻境门禁

067的marshal-quests源对照与两职业自然领奖验证支线优先计数、逆序奖励、爵位/军衔差异及旧档迁移。068的check:lucky-gate及独立oracle覆盖12物种、30轮/165击杀、动态角色等级、全部奖励、三头目与最终宝箱；自然道具首战和高阶受控30轮真实输入分别记录，不能宣称自然终局装备取得。

069的check:kasano-mirage对照frame11独立XML/Action、缺失entry1与现存entry6、两张既有FFDec基准；源函数oracle对照四怪数值、128种死亡奖励组合、48种随机入场阈值。领域与碰撞测试覆盖满包、四蛋孵化容量、死亡、重复回调、地产资源隔离、部分与清空存档。浏览器两职业必须用既有自然档真实输入四怪通关、拾取/消费奖励、回城及刷新/导入；受控四蛋和新建随机进入独立标明。相邻回归为城二与幸运之门存取。执行typecheck、npm test、build、check:save、专项源/浏览器与harness检查；入口修复和暂停计时属于design。

## 戈壁城与幻境门禁

`check:gobi-city`比对独立FFDec XML、Action/AS/P-code哈希、完整八选择器与27张PNG。`gobi-city-source.test.mjs`执行原生成、城市及完整工厂掉落函数，验证最终战斗力320、九帧攻击/技能与随机顺序；领域与碰撞测试覆盖部分/清空存档、首赠、满包、死亡/幸运/战场oldCity、旧回调与非法档案。两职业浏览器从072完成档使用已有物品成长后实战，受控边界单独记录。源异常与design修复见[gobi-city源合同](../reverse-engineering/gobi-city/source-contract.md)。

## 戈壁幻兽商

TASK-SHOP-074：`tests/gobi-pet-merchant.test.mjs`执行独立原命令/工厂并验证完整五卡/旧回调/持久化；`tests/browser/gobi-pet-merchant.spec.mjs`覆盖073双职业完成档真实购买孵化出征/刷新导入及受控资金/容量边界。配合完整类型、逻辑、构建、save与073浏览器边界回归。

## 国王荣誉任务

TASK-QUEST-075：`tests/king-honor.test.mjs`独立原菜单/任务函数/RoleMC setter执行对照；`tests/browser/king-honor.spec.mjs`双职业真实100怪、三选一奖励/重接/继续计数/刷新文件导入，受控三奖封顶和NPC资格。运行check:palace复核既有国王图4275独立基线；配合类型、完整逻辑、构建、save与074回归。


## 沼泽巧匠门禁

078的check:swamp-artisan核对八个菜单/配方命令、AS/P-code哈希和复用独立肖像。源oracle覆盖七配方等级/声望/缺料优先级、无名宝石重叠匹配和顺序消费；不得擅自修正原后续消费返回值忽略行为。领域与浏览器验证七配方全部产物消费、满包落地拾取、陈旧回调、换图与存取；双职业从077真实home经仓库/商店取料和原装备界面消费五种产物。运行类型、完整逻辑、构建、save、专项源和077相邻浏览器，最后harness。

## 南城城区与幻境门禁

080执行check:south-city：三地图独立XML/Action/AS/P-code、六选择器、10帧跑动/9帧攻击、22张FFDec PNG。源oracle覆盖全部11个普通奖池分支与SuperHS阈值、未识别月光宝盒无产物、两城区首赠/家/库存10/劫狱条件；三图独立光栅碰撞。自然双职业城区往返、药店购买和真实存取，与明确受控队伍的原数值四怪实战、部分存档、掉落消费、返城分开记录。禁止用受控队伍宣称自然成长通关；练级/配队/平衡不作为本包门槛。受控边界另覆盖全奖池、满包、死亡、幸运回城、暂停与NPC可见条件。最终运行类型、完整逻辑、构建、save、source、专项资源及079/077相邻浏览器和harness。

## 南城幻兽商门禁

081的south-pet-merchant源测试执行10300–10305与原createThing，覆盖五售价边界、两职业、满包/旧回调、孵化和存取。孵化全字段由pet-hatching全ITEM_PETS oracle覆盖。浏览器从080自然城区档实际购买五卡、孵化出征与刷新导入；受控不足资金、满包落地拾取和40宠重试单独记录。复用check:south-city的4279独立肖像，配合类型、完整逻辑、构建、save、074/080相邻浏览器与harness。

## 边关野外与头目循环门禁

085执行`check:border-field`：五地图独立XML/Action/AS/P-code、提风八选择器/刺虫人六选择器及38张独立FFDec PNG。源oracle分别执行frame73与flashBoss、bossLevels[5]、行踪、四类常规/精英及三头目完整掉落和工厂随机交错；提风九帧技能末帧、双方向和暂停须验证。领域/碰撞覆盖五图往返、每波及宝箱存取、部分清场、90至135/270边界、跨图旧回调、暂停死亡、满包与非法混合档。两职业从084实际导出经UI野外入口与行踪、真实三头目战斗、开箱拾取出售、回边关和刷新/文件导入；受控装备与队伍明确标记。执行类型、完整逻辑、构建、save、source、专项源/浏览器和084相邻回归，证据见border-field目录。

## 冰封走廊与反攻军团门禁

086执行`check:ice-battle`独立对照六地图、三类魔军20选择器/7动画、54张FFDec PNG及Action/AS/P-code。源oracle验证70级入口与任务levels1区别、70/72/75级全生成/随机、全部掉落工厂、主线11/12和逆序奖励。领域/浏览器覆盖五区部分存取、四军团oldCity、暂停死亡/幸运/军需官、满包和非法混合档。双职业085真实导出必须用实际输入完成四个有敌人战区、五区往返、奖励真实消费与刷新导入；沿用受控装备/队伍须如实标记。平台边缘敌人用合法可攻击位置导航，不改原值或用kill替代。执行类型、完整逻辑、构建、save/source、专项与085/084相邻回归，结果见ice-battle验证。

## 冰宫郊区与进入冰宫军团门禁

087执行`check:ice-palace-battle`，六图/三类魔军20选择器/7动画、XML/Action/AS/P-code及56张FFDec资产（55独立转换像素比对，冰柱4314直接原图完整性）。源oracle须覆盖80/82/85级、frame135中区副将特殊攻击/闪避、15随机、全部掉落工厂、任务12/13及满包封顶。领域/浏览器覆盖反攻门槛、库存15/冰柱、五军团oldCity、各区部分存取、暂停死亡/幸运/军需官和旧回调。两职业从086实际档真实按键完成四有敌人区、领取/消费奖励、回城刷新文件导入；保留受控队伍与经验球上限说明。运行类型、完整逻辑、构建、save/source、专项和086/085相邻回归，结果见ice-palace-battle验证。
