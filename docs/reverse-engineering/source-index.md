# 原文件索引与启动链确认

本报告完成 TASK-RE-001 的有界静态调查，日期 2026-10-05。只确认启动脚本、显示列表、一个玩家样本和后续动作入口；**不代表原游戏已运行、可完整游玩或全游戏行为已还原**。机器入口为 [source-index.json](source-index.json)。

## 文件身份与提取复现

- 原文件：根目录 `魔域2.4.swf`，SHA-256 `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`。
- 工具：JPEXS Free Flash Decompiler 26.0.0；Node 24.6.0；Java 1.8.0_461。先实际核对 `-help`、`-help export`、`-help swf2xml`。
- 新建目录 `local-resources/moyu/source-index/`，原文件只读；未覆盖已有原始提取物，没有创建游戏工程或复制全量位图。
- AS 导出 734 个脚本，P-code 导出另存独立目录，二者日志均以 `OK` 结束。`source.xml` 是 FFDec XML 2.1；`tags.txt`/`scripts.txt` 是辅助索引。CLI 控制台中文有编码损失，中文名称以 UTF-8 XML、脚本及原始标签字节为准。
- `extraction-manifest.json` 保存所有提取文件的相对路径、字节数及 SHA-256。大文件留本地忽略目录；本报告和 JSON 可用于重新提取定位，后续运行资源不能依赖此目录。

以下为本次使用的命令形态；重提取必须使用新的空输出目录，避免覆盖证据。`$out` 在本次为 `local-resources/moyu/source-index`。

```powershell
$ffdec = 'C:\Program Files (x86)\FFDec\ffdec-cli.exe'
& $ffdec -help
& $ffdec -help export
& $ffdec -help swf2xml
& $ffdec -onerror abort -export script "$out/as" '魔域2.4.swf'
& $ffdec -format script:pcode -export script "$out/pcode" '魔域2.4.swf'
& $ffdec -dumpSWF '魔域2.4.swf' > "$out/tags.txt"
& $ffdec -dumpAS2 '魔域2.4.swf' > "$out/scripts.txt"
& $ffdec -swf2xml '魔域2.4.swf' "$out/source.xml"
```

下面 `S/` 均指 `local-resources/moyu/source-index/as/scripts/`，`P/` 指相同目录下 `pcode/scripts/`。脚本行号针对本次导出；JSON 同时保存函数/语句锚点。结构定位使用 `source.xml` 根 `tags` 下 `DefineSpriteTag(spriteId)` 的 `subTags`；从 1 开始逐个 ShowFrame 计帧，不能把 XML 的标签序号当帧号。所有 verified 均限于所述静态代码或文件结构。

## 启动链（verified：静态控制流）

| 位置 | 源行为 | 复查入口 |
| --- | --- | --- |
| 根帧 1 | 初始化 `_global.bridge`，调用 AS2 4399 Bridge 单例 | `S/frame_1/DoAction.as:1`；桥接类见外部依赖段 |
| 根帧 2「加载页面」 | 调用 Mochibot；随后直接设置 `canBeginGame=true`、`nextFrame()` | `S/frame_2/DoAction.as:1–63`；不存在等待 loader 完成的条件 |
| 根帧 3「开始」 | `stop()`；`newBtn.onRelease` 跳「选择角色」并 `play()` | `S/frame_3/DoAction.as:1–11`；newBtn 是 4181，depth 4 |
| 根帧 4「选择角色」 | `b.onRelease` 跳「战士信息」；`a` 分支为法师 | `S/frame_4/DoAction.as:21–30`；b 是 4198，depth 3 |
| 根帧 5「战士信息」 | 非空姓名写入 `beginName` 与 `begingVocational="战士"`，跳「游戏」 | `S/frame_5/DoAction.as:6–15`；selectBtn 是 4217，depth 9 |
| 根帧 9「游戏」 | map 被放置为 4536（depth 1）；脚本停止根帧并让 map 从 1 播放 | `S/frame_9/DoAction_2.as:1–2`；另有同帧 `DoAction.as` 定义函数，不可遗漏 |
| map/4536 帧 1 | 放置 role/3106，depth 202；按职业给 role 赋男/战士；安装 Activities 与 onEnterFrame | `S/DefineSprite_4536/frame_1/DoAction.as:233–347,2802–2828,2840–2853` |
| map 帧 2 | 新游戏分支调用 initData、initNewGame；后者设 nextMap「卡萨诺城郊区」、nextEntry「entry3」；最后 gotoAndStop(nextMap) | `S/DefineSprite_4536/frame_2/DoAction.as:81–99,117–138` |
| map 帧 8「卡萨诺城郊区」 | allowJumpMap 接收此地名，设置入口和 NPC；ground/2807 位于 depth 2，entry3/4247 位于 depth 21 | `S/DefineSprite_4536/frame_8/DoAction.as:1–32`，XML 对应帧 |

这是新游戏预定首场景的静态证据；实际到达、可见性与首个可接受输入时刻为 **unknown**。读档是另一条分支：根帧 7/8，`SharedObject.getLocal`，然后 map 帧 2 调用 readGame；本样本不覆盖读档。map 帧 2 末尾还调用 `debug()`，前部存在调试函数/奖励数据；不能据文件名或菜单版本推断这是未经修改的发行版，下一任务以源哈希为准。

## 玩家输入与动作入口

**verified**：`S/角色.as:1` 是 `Object.registerClass("角色",RoleMC)`；原始 DoInitAction 的 spriteId=3106，FFDec 标签文件偏移 `0x0071b17e`。`RoleMC` 是本 SWF 的 AS2 类，不是 AS3。实例由时间轴放置，不是需要寻找的动态 `attachMovie("角色")`。

- `S/DefineSprite_4536/frame_1/DoAction.as:233–347`：Activities 检查存活、技能状态、停顿计数；轮询 37/39/38/40 和 65/68/87/83，即方向键和 A/D/W/S，分发八向移动。相同文件 `:601–636` 计算鼠标方向并在 onMouseUp 清除 catchMouseDown。`S/__Packages/groundMC.as:8–11` 的 onPress 设置该标志。
- 同文件 `:2840–2853`：map 的 onEnterFrame 调用 role.Activities 等；这是该输入循环的回调依据，不能把整个游戏和嵌套动画一概当成每 1/15 秒执行一次。
- `S/__Packages/MonsterMC.as:500–503`：目标 onPress 调用 role.autoAttack(this)。`S/__Packages/RoleMC.as:1893–1930`：战士在距离条件满足时定向并调用「斩魂」，不满足时转交 ground.onPress。新游戏为战士添加「斩魂」（map 帧 2:90–93）。据此将其选为本试点基础攻击，不另造“普攻”动作。
- `S/__Packages/RoleMC.as:1185–1197,1284–1333,1402–1413`：站立、左右跑和斩魂设置 playAction 的标签；跑动另外调用 ground.hitTest 并更新坐标。完整碰撞与伤害规则未在本任务还原。

选择男战士地面样本是 **design（本任务取样）**；上述性别/职业赋值和资源关联是 **verified**。父子路径为 `_root.map(4536).role(3106).playAction(3101)`；role 自身 1 帧，playAction 是 30 帧状态选择器。

| 地面状态 | playAction 标签与帧 | depth 1 资源 | 子 sprite 声明帧数 |
| --- | --- | --- | --- |
| 待机左 / 右 | 男战士地上左 15 / 男战士地上右 16 | 2986；右帧只改放置变换 | 1 |
| 跑动左 / 右 | 男战士向左跑 17 / 男战士向右跑 18 | 3007；右帧只改放置变换 | 10 |
| 基础攻击左 / 右 | 男战士左斩魂 19 / 男战士右斩魂 20 | 3031；右帧只改放置变换 | 11 |

**verified（XML 标签）**：右帧 PlaceObject2 的 hasCharacter=false，不能把 XML 的默认 characterId=0 当成新资源；负缩放/平移必须按原矩阵继承。完整变换、pivot、裁剪、持帧和视觉基准留给 TASK-RE-002。无 scale 字段时也不能把 XML 默认 scaleX=0 当有效缩放。

**verified（脚本写入）**：`S/DefineSprite_3031/frame_11/DoAction.as:1` 设置 `_parent._parent.motion="使用技能结束"`；map Activities 中才处理 `skillEffect`，调用 `斩魂效果()`。P-code 逐条显示 GetVariable/GetMember/SetMember。11 个子帧不等于已证实 11/15 秒命中；嵌套启动顺序、末帧持有/循环及反馈延迟均是下一任务的 **unknown**。

## 外部依赖与影响

1. **verified**：全体导出 AS 中，显式电影加载位于根帧 2 的 `__com_mochibot__`：构造 `http://mochibot.com/my/core.swf?...`，旧版本分支 loadMovieNum，新分支 createEmptyMovieClip 后 loadMovie；localWithFile 分支提前 return null。紧接调用的是无条件 nextFrame，无资源完成门槛。其统计用途为 **inferred**（命名、trk 参数和控制流）；没有下载或执行该 URL。
2. **verified**：根帧 1 使用内嵌 `__Packages/AS2_4399_API/Bridge.as`。其 `a5ce41e255a608030c`（:267–278）只将数字数组逐项 String.fromCharCode；本次机械解码成 `bridge-decoded.txt` 辅助审查，未执行源码。启动链 :177–208 建立 20ms 轮询，检测 root.opaqueBackground；:210–225 建立 LocalConnection，:257–262 向宿主发送消息，:230–244 可分发宿主回调。此类不是外部角色包下载器，宿主响应的运行影响仍 **unknown**。数字编码说明只搜 load/getURL 字面值不能证明全局无外部交互。
3. **verified**：`S/frame_9/DoAction_2.as:2137–2140` 定义 openBBS；`S/DefineSprite_4629/frame_1/DoAction.as:34–37` 的 lingURL.onRelease 调用它，打开论坛 `http://moyu2.5d6d.com/bbs.php`；菜单 quitBtn 使用 fscommand("quit")。它们是用户事件中的导航/退出，不是选定动作资产加载。
4. **verified**：原始标签复核没有 ImportAssets/ImportAssets2；选定角色及动作 sprite 都在当前 SWF 内。**inferred**：未发现阻碍下一项离线动作调查的缺失外部资源。**unknown**：无宿主/断网时整游戏是否能完整游玩；本任务没有运行验证，不声明网络独立性。

## 验证与交接边界

- `npm run check:source`：5 项测试通过，机器清单与原 SWF 一致，提取后再复验哈希。
- `node tools/check-source-index.mjs`：独立于 FFDec XML，直接用已有二进制标签解析器校验 6 个 sprite 的声明帧数、15 个帧标签、11 个放置关系、RoleMC 初始化标识及无 ImportAssets。expected 来自人工审阅的 FFDec XML/脚本，actual 来自原文件字节，未用同一生成器制造两端。
- P-code 交叉复查：根帧 3 的 GoToLabel/Play、新游戏 initNewGame 的 nextMap/nextEntry 赋值、RoleMC 的 autoAttack→斩魂，以及 3031 帧 11 的父级状态写入；对应 P/ 路径与 AS 相同（扩展名 .pcode）。这验证静态指令，不验证宿主调用和运行效果。
- `npm run check:harness`：14/14 测试及项目检查通过，完成记录写入 state.json；生成看板后 task:next 返回 Ready 的 TASK-RE-002。本任务只新增结构复核工具，没有修改原清单或源解析器。

下一项 TASK-RE-002 从 3101 帧 15–20、2986/3007/3031 及 RoleMC 指定函数开始，补齐逐帧素材、显示列表继承、矩阵链、持续时间、斩魂事件和独立基准；不扩大为所有职业/场景，不从声明帧数直接生成时间真值。运行画面、首场景实际交互和宿主缺席效果仍待适用的后续运行验证。
