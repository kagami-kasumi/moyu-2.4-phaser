# 质量门禁

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
