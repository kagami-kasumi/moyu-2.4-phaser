# 保存与继续 · TASK-SAVE-016

## 原版依据（verified）

只读源根：`local-resources/moyu/source-index/as/scripts/`。完整字段/有序恢复仍引用019的 `content-registry/persistence-schema.md`、`restore-matrix.json`，没有重新定义其事实。

| 定位 | 本次消费的事实 |
| --- | --- |
| `frame_3/DoAction.as:12–16`；`frame_8/DoAction.as:1–12` | 读档路由先取姓名/职业，再设置 isRead 进入地图。 |
| `DefineSprite_4233/frame_1/DoAction.as:3–39` | 槽位显示姓名、职业、等级、时间；saved 守卫；保存/读取是不同入口。 |
| `frame_9/DoAction_2.as:367–1686`；`:1687–2129` | 保存和有序恢复字段全集；653模板沿用019。 |
| 同文件`:439–443`、`:565–569`及仓库对应循环 | 背包/快捷栏/仓库是1开始的源槽编号；现代数组从0开始，映射时+1。 |
| 同文件`:795–799`、`:877–881` | 装备源顺序头盔/衣服/武器/鞋/幸运符/戒指从0开始；幻兽铃铛1–3。幸运符尚未开放，原数据保留。 |
| `DefineSprite_4536/frame_2/DoAction.as:81–140` | 新建发凯恩、职业技能、快捷栏5、主任务、物品、wudi；共同尾部debug会发奖励。现代读档不执行这些动作。 |
| `DefineSprite_2313_主城堡/frame_1/DoAction.as:8–18` | initData 保留住房 levels/prizeLv=3，其他建筑=0。 |
| `__Packages/RoleMC.as:198/232` 与既有 `role-state-rules.ts` | 货币上限一亿，写入无下限；新建wudi已经封顶。 |

`tests/save-game.test.ts`独立读取源循环/住房初始化，使用测试 VM 对全部动态键表达式做编号对照；运行时代码不执行AS、表达式或存档代码。源字段生成校验 `node --experimental-transform-types tools/build-save-fields.mjs --check` 将压缩运行时表与019完整注册逐条核对。

## 现代格式与归属（design）

- 一个浏览器本地槽，键 `moyu.progress.v1`；格式沿用 `moyu-state` / `schemaVersion:1` / `source` / `extensions`。不是Flash `.sol`，不承诺旧档兼容。新建不写存储；首次保存替换旧档必须确认；之后的显式保存使用一个 `setItem` 提交。浏览器拒绝/容量错误不会先删旧档。记录与开始/读取时不同则拒绝覆盖；这不是跨标签页强事务锁。
- `extensions.game`是当前可执行领域状态。`source`保存全部具体源键，未知键不筛除；当前已实现字段仅写自己的键。扩展模块和已知对象的未知子字段递归保留。背包、穿戴、打造、地面分别拥有物品，保存和恢复不跨容器搬物品。
- 新建将653模板展开为当前集合的具体键：普通角色样本9174键。朋友初始集合为空，所以其动态键有0实例；日常需求按注册的实际数组长度展开。新建的未激活/不适用源字段以显式undefined预留，这是design，不声称等同原SharedObject的条件写入结果。`field-coverage.json`逐模板记录域、数量、默认依据和映射。
- 原字段中没有当前现代实现的生成属性不编造数值，例如幻兽稀有度/下一代成长随机值；其未实例化数值以 `extensions.initialization.deferredSourceKeys`标记，普通凯恩的经验历史生成配方也保留在019。NPC缺省jobLevels本来可以undefined。已有档中的这些值始终原样保留，不会重新默认填充。此处完整保留不代表相关玩法已经实现。
- `source`与`extensions`使用PreservedValue，保留undefined、NaN、±Infinity、-0、稀疏数组、命名属性、重复实例和未来记录。读取禁止重复JSON键、重复记录键/索引、非法数组属性、未知tag/版本；限制文本4百万字符、深度、节点和数组长度。已实现投影另验证职业/地图/物品/技能/幻兽/装备槽身份、容量、数值、领取标记，未实现的raw payload不会执行。
- 先校验整份记录，再验证当前地图可行走坐标；构造无赠送的NpcReward/Inventory/EquipmentSockets，恢复角色manifest和地图入口，重算人物派生上限。当前生命/魔力、物品品质/魔魂/孔位不被回满或重置。女法师未刷新衣服等已有事实不通过读档擅自修补。未完成的动作/输入回到idle，时钟从当前时刻重新启动。

## 当前领域逐字段矩阵

| 持久所有者 | 保存字段 | 恢复/排除 |
| --- | --- | --- |
| Journey | name、profession、initialState全部记录、map、x/y、complete、transitions、facing | 根据职业选manifest；根据地图生成entries；tick/phase、按键、pointer、notice、actor事件/帧、墙钟起点是瞬态。 |
| 角色/当前幻兽 | vitals、petVitals全部 level/life/maxLife/mp/maxMp/exp/maxExp | 人物maxLife/maxMp依恢复装备重算；当前值最后保留；幻兽当前值保留，不重新出战/孵化。 |
| NpcReward | 40格bag及每个物品全部数据；pets全数组/出战标记；drops物品及x/y；ms/res、credit/titleLevel、cmd/nextCmd/claimedPack | 仅给白名单领域字段赋值；random方法/容量常量不反序列化；open/words/answers/revision/messages为瞬态。 |
| Inventory | 五装备槽、bravery、exploit、militaryExploit | reward/vitals依赖重新绑定；stats派生；不重放use/unequip。 |
| EquipmentSockets | item、stone全部字段，无论窗口是否打开 | 重建引用；open/revision/feedback和当前模式为瞬态；不调用select/take/forge。 |
| 未实现内容 | 全部source键、未拥有extensions及未知子字段 | 不执行，不删除，不用当前可玩子集过滤；911注册payload经过实际codec测试。 |
| UI/Phaser/Clock | 不保存对象、DOM、回调、纹理、句柄、时钟起点 | 通过正常页面加载与领域组装重新生成。 |

源码字段的完整653行矩阵另见 [field-coverage.json](field-coverage.json)。

## 验收边界澄清

原合同“正常操作改变货币”受已实现玩法限制：两职业新建都由wudi封顶，当前UI只开放收入，没有魔石/资源支出入口。无probe浏览器验收实际执行礼包使用并验证封顶值保存恢复；领域测试将货币置为-100、0、127、456及上限验证精确往返与原访问器行为。没有为了截图改变源新建余额或临时增设无证据消费入口。

022继续负责备份、导入/导出、旧版本迁移、恢复管理；本任务只交付正常现代完整保存与读取、首次有效档保护。
