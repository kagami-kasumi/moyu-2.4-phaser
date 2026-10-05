# 代码边界

当前已有男战士动作验收工程。`src/domain/actor.ts` 管理动作与事件，`src/application/clock.ts` 提供独立单调时钟，Phaser adapter 只读取状态进行投影。

目录职责为：

- `src/domain/`：纯规则、状态、事件和时间轴语义，不依赖 Phaser。
- `src/application/`：用例、调度和资源/状态端口，不持有渲染对象。
- `src/content/`：由 FFDec 证据转换出的 manifest、帧、pivot、持续时间和碰撞数据。
- `src/adapters/`：资源加载、时钟、输入、存档及渲染端口的实现。
- `src/adapters/phaser/`：Phaser 的纹理、显示对象、相机和输入适配；版本依据 [技术决策](technology-decision.md)。
- `src/scenes/`：薄场景壳，只组装 application 与 Phaser adapter，不承载玩法公式或时间轴真值。

纯规则层不得导入 Phaser。渲染适配器可以消费 manifest 并实现 pivot、嵌套矩阵、负 scale 和帧时钟，但不能成为业务事件的唯一来源。碰撞几何与可见资源分开消费；不要把图片 bounds、Phaser origin 或 spritesheet 单元格尺寸当作原版碰撞或注册点。

未来技术设计是 `Phaser 4.2.1 + TypeScript + Vite`，但引擎选择属于 `design`，不能反写成 SWF 原版事实。若 Phaser 无法表达某种 AVM1 时间轴语义，应扩展 adapter/TimelinePlayer，先保留规则层和 manifest 结构，再评估是否需要替换渲染实现。
