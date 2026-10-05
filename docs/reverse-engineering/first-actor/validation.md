# TASK-RE-002 验证报告

日期：2026-10-05。范围为男战士地面待机、跑动、斩魂动作的端到端交付。依据 [动作合同](action-contract.md)；不宣称完整战斗、场景流程或原游戏运行已经验证。

## 交付与复现

- `tools/lib/first-actor.mjs`：只读、有界 SWF8 标签、矩阵、形状边和索引 RGBA 解码；不执行 AVM1。
- `tools/convert-first-actor.mjs`：三组22帧原资源及JSON元数据；刀光在帧8/9按源矢量叠加。
- `public/assets/first-actor/manifest.json`：源hash、sprite、selector帧、父子矩阵、位图/形状ID、帧序列、hold、原点/offset、结束标记与collision=null。字段schema及可执行校验在 `src/content/manifest.ts`。
- `src/domain/actor.ts`、`src/application/clock.ts`：纯状态与独立时钟；`src/adapters/phaser/actor-view.ts`、`src/scenes/actor-scene.ts`：原资源投影与薄场景；正式运行不读取本地证据。
- `source-fixture.json` 与 `baseline/`：冻结FFDec XML小片段和22 PNG。大份原XML、SVG导出及AS2参考PDF留在 `local-resources/moyu/`。

基准导出到新的空目录，勿覆盖原提取物：

```powershell
& 'C:\Program Files (x86)\FFDec\ffdec-cli.exe' -onerror abort -selectid 2986,3007,3031 -format sprite:png -export sprite <new-empty-directory> '魔域2.4.swf'
```

对应源XML从先前TASK-RE-001导出按2986/3007/3031、3101帧15–20、3106/playAction和23个形状窄取。`check:first-actor` 直接读原始SWF验证这些字段，不依赖XML生成器。原文件hash仍为 `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9`。

## 实际结果

| 检查 | 结果与证据范围 |
| --- | --- |
| `npm run typecheck` | 严格类型检查通过 |
| `npm test` | 7项通过：帧轨迹、动作切换/换向、攻击重入、不同采样节拍及掉帧、暂停/恢复/重置、无渲染时钟、清单负向校验 |
| `npm run check:first-actor` | 30处放置、23形状、末帧Action字节与22帧通过；正式资源与重复转换一致 |
| `npm run build` | dist构建通过；Phaser完整包约1.38 MB、gzip约360 KB，Vite有大块提示，无构建错误 |
| `npm run test:browser` | Microsoft Edge / WebGL，冷启动dist；44组逐帧双向比较及按钮生命周期、停止渲染后的时钟事件 |
| `npm run check:source` | 5项测试和原SWF清单/hash复验通过 |
| `npm run check:harness` | 14项调度测试及项目检查；收尾状态以该命令最终结果为准 |

20个纯位图帧与独立FFDec Java PNG完全相同。两个刀光帧每帧291像素有差异（0.4081%），预乘RGBA均值误差0.019804/255，满足≤1% / ≤0.1的边缘栅格约束。不得将此表述为全部像素精确。

浏览器基准使用冻结FFDec图与手工核查的原矩阵，经独立Canvas2D在580×500舞台绘制；actual为Phaser WebGL截图。44组最大每通道均值误差0.003484/255，最大10个像素的通道差大于16。门禁为均值<0.03且大于16的差异像素<60；矩阵、帧和持续时间另作精确检查，不能靠放宽截图容差掩盖错帧或偏位。

事件证据以子动画首帧建立为tick0，10时末帧结束标记，11时一次效果请求并站立。浏览器停止整个渲染循环，独立时钟仍产生同样的两条事件；15/30/60/144 Hz采样及单次2秒掉帧也保持相同逻辑结果。暂停的墙钟时间不追赶，恢复保留半帧余量。

本地详细产物：`.evidence/first-actor/conversion.json`、`browser-comparison.json`、`workbench.png`、`actual-left/right.png`、`expected-left/right.png`；可由上述命令重建。画面人工检查：角色完整、脚下与身体没有裁切，控制区无遮挡，状态和工具边界清晰。

## 修复与限制

首轮类型检查发现CSS导入类型缺失，已补Vite类型。浏览器初轮请求审计将测试内嵌图片和Phaser同源blob误判为外部请求，修订为排除data并精确检查URL origin；没有放过异源网络请求。画面对比未因此改变。

不运行Flash播放器，不伪造原游戏运行trace。动态先后由原字节/P-code/AS与Adobe AS2语义共同取证；原播放器真实墙钟延迟、进入地图流程、完整伤害、碰撞、音频和非选定动作不在验收范围。浏览器验收当前覆盖本机Edge/WebGL，未声明所有平台像素相同。
