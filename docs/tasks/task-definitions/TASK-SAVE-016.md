# TASK-SAVE-016 · 完整进度保存与继续游戏

## 目标
玩家保存当前完整进度，刷新或关闭重开后从开始菜单继续游戏。

## 输入
- 直接依赖 TASK-ENTRY-021；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- 019全量字段/恢复矩阵、020目录和021新建入口；源保存槽位/保存时机/全部保存恢复函数，激活时补齐精确位置；现有全部领域状态与原版HUD指定。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
实现版本化schema/codec、浏览器存储适配器及真实保存/继续入口。全量已实现状态恢复，未实现内容无损保留；恢复后重算派生属性且奖励不重复。首次交付即包含有效档保护、读取校验、保存失败反馈和新建覆盖确认；备份管理、导入导出及跨版本迁移交022。存储方案标design，不承诺Flash .sol兼容。

## 输出
逐字段持久化覆盖矩阵、版本化codec、存储适配器、保存/继续UI、完整往返与真实操作验证报告；与Phaser对象解耦。

## 验收
无probe新建→正常操作改变位置/场景、货币、背包、装备槽/开孔/魔魂/品质、技能/幻兽记录、领取标记→保存→刷新/关闭重开→继续，逐项恢复并仍能游玩。全部注册ID及未实现内容完整集合自动往返检查。无档/坏档/无效引用/未知版本/保存失败均不得损坏有效档，新建与覆盖取消不写档；不重复发放、不重置强化、不产生恢复重复事件。执行 npm run check:content-registry、npm run typecheck、npm test、npm run build、npm run test:browser，检查保存/恢复/失败截图。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分
### Ready有界输入（2026-10-08）

- 选择理由：021已交付两职业开始/命名/新建入口及城郊到城内旅程，当前可观察缺口是刷新后恢复进度；按既定基础线顺序执行016，不提前做022管理功能。
- 已完成输入：`docs/reverse-engineering/character-entry/source-contract.md`/`validation.md`、019的`persistence-schema.md`/`restore-matrix.json`/`persistence-coverage.json`、020正式registry；代码为`src/content/persistence-schema.ts`、`persistence-types.ts`、`preserved-value.ts`、`src/content/character-entry.ts`与`src/domain/journey.ts`/`npc-reward.ts`/`inventory.ts`/`equipment-sockets.ts`。资源含男战士、mage和character-entry-ui清单。
- 源精确入口：根`frame_3/DoAction.as:12–16`读档入口；`DefineSprite_4233/frame_1/DoAction.as:3–39`槽位显示/读取saved标记/保存，`:40–55`原删除确认（删除管理不必在016开放）；根`frame_8/DoAction.as:1–12`用存档职业/姓名设置isRead并进入游戏；`frame_9/DoAction_2.as:367–1686`saveGame、`:1687–2129`readGame；地图`DefineSprite_4536/frame_2/DoAction.as:124–140`区分初始化/恢复及debug尾调用。019已有完整字段及有序恢复证据，不重新全量扫源。
- 直接差异：当前只有新建，继续按钮禁用；无存储适配器。Journey.start有随机戒指/发物品/凯恩/技能/主任务和debug副作用，**恢复不能调用该流程后补几个字段**。应有独立恢复用例，原子校验后组装角色manifest/地图/输入/面板与领域状态。
- 当前映射必须覆盖：Journey姓名/职业/initialState/地图与位置/旅程完成状态；NpcReward全部背包槽、pets、货币、credit/titleLevel、cmd/nextCmd/claimedPack及需保留掉落；Inventory装备/英勇/功勋/军功；EquipmentSockets及打造已取出/未取出物品所有权；人物和幻兽vitals。临时输入、DOM/Phaser引用、时钟墙钟起点、旧对话按钮回调不直接序列化。原字段持久与现代新增持久/瞬态取舍逐项标design，不能漏掉暂存物品造成复制或丢失。
- 019的653字段模板和尚未实现内容须实例化/无损保留并给精确覆盖；不能把021的initialState或可玩子集当全量schema。姓名debug的新建保留原奖励，但现代恢复不再触发debug发奖；此项按019 design执行。
- 专项验收：两职业普通/debug姓名，各种打造暂存状态与穿戴、领取/兑换、幻兽孵化、两地图、位移和货币的完整往返；全部注册身份/未实现字段保留；重复读取不重复奖励/掉落/技能/随机戒指；无档/坏档/高版本/存储拒绝与覆盖取消保护有效档；实际正常UI保存/刷新/继续及截图。合同原四项运行命令与综合目录门禁保持要求。

2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。

### 验收实例化说明（2026-10-08）

执行时核实原wudi让两种新角色货币均封顶，当前已开放UI没有支出操作，因此“正常操作改变货币”不能通过现有UI产生数值变化。保持原规则，实际UI执行收入操作并检查封顶值保存；非封顶、零及原访问器允许的负余额改由领域往返验证，不临时增加无证据支出入口。其余正常新建/移动/打造/装备/技能/孵化/领取/刷新继续照原合同执行。具体证据与未实现源字段预留策略见 `docs/reverse-engineering/save-game/source-contract.md`，不将此说明当作未运行检查的替代。
