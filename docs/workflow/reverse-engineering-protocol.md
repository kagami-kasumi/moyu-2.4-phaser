# SWF 逆向证据协议

本文约束本项目如何把 `魔域2.4.swf` 转成可供未来实现消费的证据。它只处理证据、提取和交接，不把旧项目的 RegiMA、AS3、AIR、EVB 或问题治理规则带入本项目。

## 已知源范围

- 源文件是 SWF8、AVM1（AS1/AS2），舞台 `580×500`、`15 FPS`。
- 已确认的 9 个根帧是根时间轴帧，不等同于 9 个 character frame。
- 源清单和当前哈希入口为 [docs/reference/swf-inventory.json](../reference/swf-inventory.json)；源 SWF 与运行时资源必须分开记录。
- 未来技术选型为 Phaser `4.2.1`、TypeScript、Vite；离线 FFDec 用于提取，运行时不引入 Ruffle。

## 证据等级

每个结论标记为 `verified`、`inferred` 或 `unknown`；现代架构决定单独标记为 `design`。`verified` 需要可重现的源定位和独立检查，`inferred` 必须写出推导依据，`unknown` 必须记录后续验证入口。未解决的关键项禁止伪装成已验证。

## 每个资源的最小记录

manifest 或报告包含适用的源哈希、sprite/shape/frame 标识、Action 或脚本定位、父子层级、pivot/注册点变换、帧持续时间、状态集合和原版基准引用。不适用字段写明原因，文件结构索引不要求伪造动作字段。资源提取的中间文件可以留在本地证据目录；供运行时加载的资源必须进入正式工程的资源目录，不能让运行时依赖证据目录。

几何、可见边界和碰撞形状分别记录。图片裁剪边界不能替代 pivot，碰撞盒不能从渲染 bounds 默认为同一数据。涉及时间轴时，必须保留 root frame、嵌套 sprite frame、hold、循环和 Action 触发的区别。

## 实现交接

证据交接只说明可观察事实和未知项，不规定 AS1/AS2 类到现代类的一对一翻译。未来实现应通过纯规则层和渲染适配层消费 manifest；游戏事件由规则层产生，不能依赖渲染回调作为业务事实。没有源证据时，不宣称像素精确、命中时刻精确或动作时序精确。

## 验证闭环

expected 必须来自 SWF/FFDec 或独立冻结的源基准，actual 必须来自新提取器、时间轴播放器或渲染探针；禁止同一生成过程同时制造 expected 和 actual。每个状态至少验证帧选择、父子关系、pivot 变换和持续时间；视觉验证还要保留原版基准与差异说明。

当前 harness 或合同变化运行 `npm run check:harness`；源清单或解析器变化再运行 `npm run check:source`，普通文档修订不要求反复扫描源文件。未来加入实现后，必须另行加入类型检查、单元测试、构建和视觉测试；未实际验证的内容不得宣称完成。
