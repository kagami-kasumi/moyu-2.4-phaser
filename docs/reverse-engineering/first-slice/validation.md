# TASK-SLICE-004 验证报告

## 交付

默认首页为新建男战士 → 卡萨诺城郊区 → 卡萨诺城一 entry1 的可玩旅程；`/actor.html` 保留男战士动作验收。正式资源位于 `public/assets/first-actor/` 与 `public/assets/first-slice/`，dist 不读取源 SWF、FFDec、证据目录，也不访问外部服务。

规则在 `src/domain/journey.ts`；独立时钟在 `src/application/journey-clock.ts`；Phaser 场景负责呈现/输入。输入改变时保留固定15Hz步进、8方向的源优先级与候选滑移顺序。鼠标与Q/Ctrl均可完成旅程。到达城一结束本切片，刷新可重新新建。

## 源与独立基准

详见 [源合同](source-contract.md)、[冻结XML](source-fixture.json)、[冻结源行为](behavior-source.json)、[基准来源与哈希](baseline/provenance.json)。只读原 SWF 的二进制转换和独立 FFDec PNG/XML 交叉对比；不会从 actual 生成 expected。

```powershell
& 'C:\Program Files (x86)\FFDec\ffdec-cli.exe' -onerror abort -selectid 2804,2806,4323,4326,4238,4240,4242,4257,4259,4269,4281,4295,4305,4307 -format shape:png -export shape <new-empty-directory> '魔域2.4.swf'
```

首次冻结脚本 `tools/freeze-first-slice.py`、`tools/freeze-first-slice-behavior.mjs` 拒绝覆盖既有fixture；通常只需运行 `npm run check:first-slice`，无需重建expected。它校验14张图、XML显示列表/几何、Action字节哈希、AS/P-code哈希及临时重建和正式资源一致性。

- 两张背景和七张NPC图像：预乘像素误差0。
- 三张JPEG3传送点：最大预乘通道差<1/255，记录解码/反预乘舍入差。
- 城郊/城一地面：平均预乘通道误差0.000105、0.015777/255，差别限于描边抗锯齿。边顶点、描边宽度和矩阵单独严格匹配XML。
- 行为expected直接执行冻结的源函数片段（受限离线JavaScript），生产规则不参与expected。唯一语法语义适配是AS2对undefined目标取属性返回undefined，在JS中使用可选访问；时间轴作用域的nextMap/nextEntry/nowMap映射到map属性。平台显示对象用独立解析几何替身，不声称运行了原Flash播放器。
- 入口形状/舞台比例的逐像素边缘命中、旧播放器真实墙钟抖动没有原播放器动态trace，保留为unknown；当前验收是源代码语义、源几何及独立离线基准。现代系统字体和入口HTML布局是design。

## 实际验收

- `npm run typecheck`：严格检查通过。
- `npm test`：14项通过（7项原动作、7项旅程）。其中方向/边界序列循环为2地图×9起点×14输入×8步=2016次，另扫描城一斜边周围的解析碰撞点，逐步对比冻结源函数。名字非空/长度、首帧/换向、15/30/60/144Hz、长帧与暂停后台时间均覆盖。
- `npm run check:first-slice`：原始二进制→临时重建通过，未改写expected。
- `npm run check:first-actor`：既有动作资源与源回归通过。
- `npm run build`：生成含首页与动作页的dist；保留Phaser包体大于500kB的提示。
- `npm run test:browser`：Edge冷启动5项通过。含44组旧动作源画面、三处新旅程画面、键盘步进/松开/Q/Ctrl、入口隐藏/透明、停留不自动传送、到达后不重复、鼠标捕获、失焦释放、停止渲染但逻辑继续，以及无probe真实鼠标旅程连续冷启动两次。
- 三处580×500场景与独立Canvas2D+冻结PNG/XML投影对比：平均RGB差分别0.275（出生）、0.276（出口）、0.148（城一），均<0.5/255；字体区域因属于系统字体设计单独排除。该排除不覆盖角色或主要NPC图像。
- `npm run check:source`：原SWF身份与结构通过。
- `npm run generate:harness` / `npm run check:harness`：状态派生视图与14项harness测试通过。

本地截图与数值报告位于 `.evidence/first-slice/`：`spawn-actual/expected.png`、`at-exit-actual/expected.png`、`arrival-actual/expected.png`、`journey.png`、`source-check.json`、`behavior-trace.json`、`browser-report.json`。旧动作报告仍在 `.evidence/first-actor/`。

## 发现并修复

真实鼠标验收曾失败：window pointerup先清掉按下标记，而Phaser在后续输入处理才检查入口onRelease条件。已将窗口清理限于画布外松开；画布内释放交给场景，真实鼠标连续两次旅程通过。新增NPC原图像素命中消费输入，避免点击尚未开放的NPC对话位置穿透到地面移动。

## 边界与下一步

本次只是首个切片。旧新建流程的装备、背包、初始幻兽、任务UI、随机NPC、战斗、存档和外部音频不包含；NPC常驻图像可见但不能对话。map frame2 的nextMainTask在任务系统2210:82起设置isDoing与showTask，未给移动设置前置锁；不将该指引界面冒充已复现。后续独立旅程从已定位的老兵command 1–5首次礼包领取扩展，详见下一合同，不在本次继续实现。

