# TASK-GROWTH-014 · 经验球人物升级闭环

## 目标
玩家使用已有普通经验球为人物获得经验并升级，看到等级/经验条/攻防/生命魔力更新；无材料、死亡或达到源等级上限时明确拒绝且不误扣。

## 输入
- 2026-10-06按用户新主线后移，2026-10-07拆分后直接依赖TASK-SAVE-022；全部原验收保留。基础交付后按全量注册结果评估合并为成长机制包，迁移本合同全部要求后再调整编号，不能以合并视为完成。
- TASK-ITEM-013及现有背包、穿戴属性、HUD；冷启动已有999个普通经验球（src/content/original-start.ts），尚无人物升级用例。
- `local-resources/moyu/source-index/as/scripts/frame_9/DoAction.as` useItem经验球分支（275）只打开useExpball。
- `DefineSprite_2181_使用经验球/frame_1/DoAction.as` 的open/setMainHuanShou/useExpball：默认人物目标，背包accountThing检查后调用rolePanel.setThing({type:"经验球"})，成功才useThing扣一个；`DefineButton2_2174/BUTTONCONDACTION on(release).as` 为确认入口。
- `DefineSprite_4591/frame_1/DoAction.as` useExpball/setThing（22–43）：普通球授予2000经验，死亡/满级拒绝；不要混入超级经验球的永久百分比加成。
- `__Packages/RoleMC.as` constructor（116）、levels/maxLevels setter（670–706）、expUp（2159）、flashAttribute；expUp逐级扣经验、更新阈值，升级后重算并回满生命魔力，最高级getter和setter必须一并取证。以上AS及对应P-code存在。
- 背包accountThing/useThing已有veteran-exchange冻结证据可复用；原按背包计数/扣除顺序与直接消耗当前选中槽的区别需确认。
- 选择理由：装备品质与魔魂已可成长，人物仍停留1级；现有经验球提供真实可玩的升级入口，也为后续装备等级需求打基础。

## 范围
有界逆向、独立冻结源期望、普通经验球人物分配/确认、经验和等级阈值、升级重算及HUD反馈。保留源开启面板与确认消费的语义，界面可design并明确当前仅支持人物。幻兽分配/出征、超级经验球、转世/成神、战斗经验、任务等级奖励和存档不扩展；未实现的相邻分支不得伪装成原版不存在。

## 输出
`docs/reverse-engineering/player-experience/` 源合同、冻结函数/阈值基准、验证报告；纯领域升级/消费用例及背包/HUD界面接入、逻辑和浏览器测试。

## 验收
- 无probe冷启动打开普通经验球分配面板，确认用于人物，消费一个并按源2000经验连续升级；重复使用、关闭不消费、重新打开与实际等级/经验条/人物属性一致。
- 独立源oracle覆盖初始1级/9经验阈值、一次跨多级、14/15、29/30、59/60、89/90、99/100、109/110、119/120、129/130、139/140及149/150边界；按levels setter/最大等级源语义核对临界剩余经验，不自行猜测截断方式。
- 验证无球/零数量单件/多堆叠扣除顺序、死亡/已满级拒绝、连续确认与过期动作、无升级时生命魔力保持、升级时重算回满；已穿装备/英勇/戒指的属性正确，背包和槽物不受升级意外改变。
- 可见面板输入隔离、切图及保存/刷新读档保留成长与材料、新建重置；正常和受控边界截图实际检查。
- `npm run typecheck`、`npm test`、`npm run build`、`npm run test:browser`，保持既有44动作及地图/背包/领取/拾取/兑换/开孔/魔魂/品质回归。只在源解析器或素材变化时追加对应源门禁。
- 更新覆盖台账和任务状态，生成下一项合同与调度，`npm run generate:harness`、`npm run check:harness`通过。

## 停止与拆分
先核对完整消费链、等级setter与expUp、重算和回满顺序，再实现；核心未知继续精确AS/P-code取证。仅真实外部依赖可阻塞，不按技术阶段或上下文长度拆分。

### 基础线关闭后的有界输入（2026-10-09）

- 选择理由：015—022完成注册、入口、完整存档与恢复后，下一可玩缺口仍是人物没有经验/等级成长。保留014全部验收，以共享人物经验、阈值、等级写入、属性刷新和回满机制为交付；普通经验球是现有可操作入口，不逐个经验来源另拆task。
- 复用017/018正式规则：`src/content/role-experience-rules.ts`、`role-progression-rules.ts`、`role-attribute-rules.ts`及`tests/role-experience-source.test.mjs`、`role-progression-source.test.mjs`。已确认经验球人物分支授予2000，RoleMC最大等级150，expUp内部没有直接cap判断；仍须在任务内核对完整setter/循环终止及最大等级剩余经验，不把概览当独立oracle。
- 精确源输入仍为上面的2181/4591/RoleMC链；本次激活窄读2181的open/setMainHuanShou/useExpball与4591:19–43，确认面板选人物→accountThing→setThing成功→useThing扣一个的调用顺序。原始文件/P-code可用，无需重扫全SWF。
- 集成边界：`src/domain/inventory.ts`、`hud.ts`、`journey.ts`与`src/adapters/reward-view.ts`/`original-hud.ts`；成长新增用例应由纯领域模块实现。保存继续使用`extensions.game.vitals`及现有角色源字段映射，检查`save-game.ts`/`save-source.ts`对升级后的字段所有权；不以“存档不扩展”为理由漏掉成长持久化验收。
- 022提供`src/adapters/save-recovery.ts`、`save-manager.ts`，导入文件仍是schema v1，新本地库是容器v2。后续成长需保持新建/继续、备份/导出/恢复保留成长状态，不新增无需要的schema版本，也不重做022。
- 本次只补齐Ready输入，不实施成长。幻兽成长、超级经验球、转世/成神及其他奖励入口继续留在后续机制包，完整游戏仍未完成。
