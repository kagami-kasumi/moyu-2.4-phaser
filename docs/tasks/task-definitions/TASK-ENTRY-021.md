# TASK-ENTRY-021 · 开始菜单与全部角色新建入口

## 目标
玩家从开始菜单选择源职业、命名并以正确角色进入游戏。

## 输入
- 直接依赖 TASK-DATA-020；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- 020完整目录与019初始化合同；源 frame_3 newBtn/readBtn、frame_4 战士/法师分支、frame_7/8 role_vocational/role_myName、DefineSprite_4536/frame_2 initNewGame；TASK-UI-007原版HUD指定。激活时补齐各职业资源锚点。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
完成选择/命名/确认/返回/取消、全部源角色选项的必要呈现和初始化；不得法师列名实际生成男战士。只补齐正常进入和既有移动所需呈现，不扩展各职业战斗技能。继续存档入口由016接通，未接通时不得伪装可用；新建过程不写入或清除已有存档。

## 输出
源角色入口合同、开始/选择UI、初始化用例、各职业必要资源及实际浏览器截图报告。

## 验收
无probe从开始→每个源职业→命名→新建→游戏可用；名称/职业/初值/显示正确，返回/取消不污染状态或已有存档；既有HUD与输入不回归。执行 npm run typecheck、npm test、npm run build、npm run test:browser，实际检查各职业及取消/返回截图。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分

### Ready有界输入（2026-10-08）

- 选择理由：020综合注册与既有消费者门禁已完成，按基础线进入角色入口，不提前执行存档或成长包。
- 正式输入：`docs/reverse-engineering/content-registry/integration-validation.md`、`integration-coverage.json`、019的`persistence-schema.md`/`restore-matrix.json`、正式registry及role/pet规则；现有`src/journey-main.ts`、`src/domain/journey.ts`、`src/content/slice-manifest.ts`、`src/adapters/original-hud.ts`和`public/assets/first-actor/manifest.json`。
- 入口锚点修正：源`frame_3/DoAction.as:7–16`为新建/读档菜单；`frame_4/DoAction.as:21–35`选择法师/战士和返回；**frame_5与frame_6**的`:2–19`分别设置默认名玩家、10字符、非空确认、beginName/begingVocational及返回。frame_7/8属读档/存档表面，不作为新建职业赋值真值。
- 源角色全集：`DefineSprite_4536/frame_1/DoAction.as:2802–2828`按战士给男、五项系数15/5/.2/1.8/.3，另一分支为女法师12/9/.8/1.6/.2；不能虚构四个性别职业组合。角色实例仍是role/3106→playAction/3101。
- 资源有界入口：本次只读原SWF标签与显示列表确认3101的1/2帧标签女法师地上左/右，资源2893；5/6帧女法师向左跑/右跑，资源2917。男战士15–18帧及2986/3007已验证复用。021内补女法师子时间轴、矩阵、透明边界、动作时钟及独立FFDec基准后转换；不能复用男战士贴图冒充女法师，也不能用15FPS声明替代时序检查。现有离线入口`tools/lib/first-actor.mjs`和`tools/convert-first-actor.mjs`可扩展或复用。
- 初始化锚点：地图frame2 `initNewGame:81`起，`:88–97`凯恩/出征/职业技能/快捷键/任务，后续随机戒指与无条件wudi；`debug:1`及`wudi:39`分开验证。老兵`DefineSprite_4312/frame_1/DoAction.as:206–242`存在两职业装备分支；女法师衣服分支没有相邻upDataWeapon调用，按源取证，不能照搬战士流程。当前Inventory职业限制和战士系数只是既有子集，需在021调整到所选职业；无已实现技能攻击的法师不得触发男战士斩魂呈现。
- 实际差异：当前默认自动男战士、setup也只创建男战士，完整初始化/原debug效果尚未接入；新入口需统一显式职业状态，保留原HUD指定。菜单可现代设计；存档按钮在016接通前明确不可用，新建/取消不动已有存储。
- 专项验收在021内新增并执行：两职业源初始化oracle（含普通/debug名、wudi顺序、技能/物品与任务分支）、女法师双向待机/跑动独立图像及时序；无probe两职业新建/返回/取消/空名/10字符边界与移动、现有领取/装备职业回归。原合同四项命令及实际截图检查全部保留；未完成的存储往返留016。

2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。
