# 人物经验与普通经验球源合同

## verified：调用与扣除

- `frame_9/DoAction.as:275` 的经验球分支仅调用 `useExpball.open()`；打开或关闭不扣当前槽。
- `DefineSprite_2181_使用经验球/frame_1/DoAction.as` 的 `open/setMainHuanShou/useExpball`：默认人物；确认先 `accountThing({type:"经验球"}) >= 1`，再 `rolePanel.setThing({type:"经验球"})`，成功才 `useThing(...,1)`。2174确认按钮调用此函数。
- `DefineSprite_4591/frame_1/DoAction.as:19–43`：生命为0拒绝；等级小于 `maxLevels` 才调用 `expUp(2000)`。满级拒绝。传入临时对象没有number，故setThing成功返回true。超级经验球是另一分支，不混入本次。
- 背包行为复用 `../veteran-exchange/source-functions.json`：匹配type且name未指定；从槽1向40计数/扣除。number为0或未定义按单件计数，先清前面的单件再消耗后面堆叠。点击槽只负责打开面板，并不锁定材料槽。

## verified：等级、阈值、回满

- RoleMC构造初始等级1、经验0、阈值9。`levels` setter（670）拒绝高于 `xxx_maxLevels` 的值；`xxx_maxLevels` setter封顶150；`maxLevels` getter读前者，而它自身的setter无效。
- `expUp`（2159）先累加经验；循环扣当前阈值、尝试等级+1，然后依新等级重算阈值。分段为：小于15乘10；小于30乘20；小于60乘60；小于90乘100；小于100乘150；小于110/120/130/140/150分别20000/25000/30000/35000/50000。源成神乘5分支保留于冻结函数，但本次角色成神机制未开放。
- 150没有匹配分支，保持上一次阈值。循环没有直接cap判断：149级阈值50000、经验0、授予150007时，最终150级、经验7、阈值50000。不能简单在150级break或把剩余经验置0。
- 只要循环执行，最后一次性flashAttribute重算、生命魔力回满；不升级时保持当前生命魔力（源life+=0及changeDepth属于刷新）。不改装备、打造持有物或英勇等级。
- 新角色第一颗球结果为17级、331/340；独立AS函数执行对照覆盖每一处分段两侧，并执行真实level/maxLevel访问器。

## design：现代边界

- `PlayerExperience`是纯领域面板会话；revision拒绝旧确认回放；关闭、切图、重新开始及读档后清理会话。面板保持开启以便连续确认，每次确认消耗一颗。
- HTML面板明确当前分配给人物，显示实时等级/经验/库存与反馈；不复刻原粗糙面板、不宣称源像素一致。Phaser沿用既有HUD投影与输入隔离。
- `grantExperience`复用正式阈值注册、人物属性与150上限；当前只接普通球。源音效/升级光环/好友通知不是本次可玩能力；不伪装已实现。
- design异常保护：导入的非正经验阈值/非有限累加值拒绝且不扣球；150级后重复扣同一阈值批量取余，避免极大有限经验值导致循环卡死。正常整数余数由冻结源循环对照。
- 保存沿用schema v1与存档库v2。`extensions.game.vitals`持有成长，`updateSource`同步role_levels/role_nowExp/role_maxExp/life/mp/maxima；无需新增格式或覆盖未实现raw字段。

## 证据与限制

原SWF版本与SHA-256见[源清单](../../reference/swf-inventory.json)。`source-functions.json`冻结精确AS函数及5对AS/P-code的SHA-256；复用装备/背包冻结函数。`tests/source-experience-oracle.mjs`执行独立源函数，只替身化显示/声音与数值编码，不是Flash动态执行。原SWF及提取物只读，时间轴/pivot不适用于此纯数值能力。

幻兽分配/出征、战斗经验、任务奖励、转世/成神、超级经验球永久加成继续属于后续机制包。本次不证明完整游戏复刻。
