# 男战士地面动作合同

范围为 role/3106 的 playAction/3101；待机 2986、跑动 3007、斩魂 3031。源哈希、精确标签和形状见 [冻结 XML 片段](source-fixture.json)，运行清单由原始二进制独立转换到 `public/assets/first-actor/manifest.json`。本合同确认源程序语义与静态画面，不声称已运行原游戏。

## 证据与时间

- **verified（源结构）**：待机 1 帧、跑动 10 帧、斩魂 11 帧；每个 ShowFrame 对应一帧。选定三个 sprite 没有子 sprite、跳帧、stop/play、定时器或 ClipActions；每帧是矩形位图，斩魂 8、9 帧另有 shape/3024。SoundStreamHead2 没有对应音频数据块，不是额外动作时钟。
- **verified（源脚本）**：RoleMC.as:1185 的站立、1198–1400 的八向移动用 gotoAndStop 选择左右动作，1402 的斩魂在存活且不处于技能中时选择攻击，并设置 motion/skillEffect。上、下移动依当前朝向选左右跑动。不同方向仍消费相同地面资源；场景碰撞和移动距离属于下一可玩切片。
- **verified（指令交叉检查）**：3031 第 11 帧的原始 Action 字节与 XML/P-code 相同，仅执行 `_parent._parent.motion = "使用技能结束"`。没有 stop，因此若不运行 Activities，子时间轴会继续循环；现代任务不能把最后一帧永久冻结当作原行为。
- **verified（源控制流与平台语义）**：map/4536 帧 1 的 onEnterFrame 调用 Activities；Activities:239 在技能中返回，243 检查结束状态、调用斩魂效果，291 清除 skillEffect 并站立。Adobe《ActionScript 2.0 Language Reference》PDF 第 915 页规定 onEnterFrame 在该帧脚本之前运行：[原厂文档镜像](https://luis.leiva.name/asfl/docs/as2-langref.pdf)。本地原文保留于 `local-resources/moyu/first-actor-reference/as2-langref.pdf`。因此第 11 帧脚本写入后，下一次 Activities 才能消费，不在写入当次提前伤害。
- **design（可复验时间原点）**：验收以选定子动作首帧已经建立为 tick 0，不把鼠标到达或宿主调度延迟算入。tick 0–9 是攻击帧 1–10；tick 10 是帧 11 并产生结束标记；tick 11 的 Activities 产生一次效果请求，恢复待机。15 Hz 是这些无额外时钟的时间轴的名义节拍，每帧 1000/15 ms；实际旧播放器墙钟延迟未测量，不作等时性能保证。
- **design**：现代纯规则层发出 `attack-ended` 与 `effect-requested`，后者只代表源中效果函数的调用点，不代表一定命中。完整 lockTarget、暴击、数值、目标生命和伤害不在本次范围。

## 几何、帧和转换

使用未裁剪源矩形：待机 148×153，跑动 250×150，攻击 310×230。透明边缘保留，offset=[0,0]。原点是源矩形左上角；不以 alpha bounds 当注册点或碰撞盒。collision=null 表示本合同不提供碰撞真值。

矩阵单位为像素，格式 `[a,b,c,d,tx,ty]`。role→playAction 为 `[52428/65536,0,0,52428/65536,-44.45,-101.5]`，精确保留 SWF FIXED 位。

| 动作 | 左侧 selector→sprite | 右侧 selector→sprite |
| --- | --- | --- |
| 待机 | `[1,0,0,1,-49.55,0.45]` | `[-1,0,0,1,167.45,0.45]` |
| 跑动 | `[1,0,0,1,-69.55,4]` | `[-1,0,0,1,180.45,4]` |
| 斩魂 | `[1,0,0,1,-93.7,-49.65]` | `[-1,0,0,1,206.3,-49.65]` |

完整坐标为 stage锚点 + parent × selector × 像素点。验收锚点 (290,340) 属于工具设计，不冒充地图出生点。右侧是保持 character 的矩阵更新；同动作换向保留子帧。动作类型切换替换子 sprite，重新从首帧开始。未实现整张 selector 时间轴或通用 AVM1。

## 独立基准和允许误差

[基准清单](baseline/provenance.json) 的 22 PNG 是 FFDec Java sprite 导出；现代转换工具直接解压源 DefineBitsLossless2、重建显示列表并解析 shape 边，不读取这些 expected PNG。20 个纯位图帧必须逐像素完全一致。刀光帧允许 Java2D 与 libvips 的边缘覆盖差：预乘 RGBA 均值误差 ≤0.1/255，差异像素 ≤1%，不得漏层或整块偏位。允许误差针对绘制器差异，不放宽帧选择、注册点和时序。

运行时浏览器按 580×500 原舞台比较两朝向的全部帧。Phaser 投影与独立 Canvas2D 按冻结源矩阵绘制的结果对比，额外记录 GPU/Canvas 采样误差。暂停、恢复、重置是验收工具的 design 操作，不宣称原版有这些按钮。

## 未决项

本样本关键帧结构、矩阵与动作结束→效果调用先后已有源依据。原游戏实际启动到达、鼠标输入相对于帧周期的墙钟相位、宿主性能、完整伤害与地图碰撞仍 unknown，分别留给首个可玩旅程和适用的后续任务；本次不输出伪造的原运行 trace。
