# 保存与继续验证 · TASK-SAVE-016

2026-10-08。实现说明与逐字段决策见 [source-contract.md](source-contract.md)，653模板逐条覆盖见 [field-coverage.json](field-coverage.json)。

## 实际验证

- `npm run check:content-registry`通过：沿用全部身份、数值、字段与集成检查，日志`.evidence/save-game/content-registry.log`。
- `npm run typecheck`通过。
- `npm test`通过93项，含14项存档专项：两职业×普通/debug×两地图完整状态，装备/打造托管/幻兽/掉落/当前生命/货币/领取标记，重复恢复禁止随机调用和事件、原子拒绝越界地图坐标、派生属性重算。满级英勇50可保存，51拒绝；打造四种归属组合取回再保存不复制/丢失。
- 653模板分别实例化具体键并携带特殊值通过实际encode/decode；全部911条注册内容payload、未来字段、稀疏数组和重复实例通过实际codec及再次capture保留。运行时压缩字段表与019的逐条生成一致性检查通过。
- `npm run build`通过；Vite仍提示已有大chunk（Phaser/注册表），无构建失败。
- `npm run test:browser`最终重build后通过36项，日志`.evidence/save-game/browser-final.log`；此前存档专项4项也通过，日志`browser-save-final.log`。
- `npm run check:save`通过生成一致性及14项专项，日志`.evidence/save-game/save-check.log`。
- `npm run check:source`通过5项及原SWF清单核对。

## 正常UI操作

两职业均无journeyProbe：新建→使用礼包/学习英勇/功勋→领取老兵礼包/孵化莎菲→品质、魔魂、开孔→移动→保存→刷新→继续。保存前后直接比较存储中全部可玩字段；后续取回托管装备、穿戴、进入城内，关闭页面再新开页面继续，仍可查看/保存装备。截图与往返数据在`.evidence/save-game/{warrior,mage}-*`。

debug女法师包含40格与7个掉落；重复读取不重抽戒指、不再发debug奖。新建确认取消、覆盖取消保持原字符串；模拟QuotaExceededError保存失败后原debug档仍可读。最终确认覆盖新角色后返回菜单/继续也通过。无档、坏JSON、未知版本、无效地图引用、存储读取拒绝均有可见反馈，读取不写坏记录。

货币正常UI的封顶不变与领域非封顶往返分开记录，详见源合同“验收边界澄清”；没有把未发生的UI货币减少写成通过。

## 画面检查

已实际打开并检查7张：`warrior-restored-forge.png`（1孔/精品/+10/托管），`mage-reopened-city.png`（法师与穿戴/城内），`overwrite-confirm.png`（覆盖文案/取消），`save-failed.png`（失败及原档提示），`warrior-saved.png`（成功提示），`version-rejected.png`和`storage-denied.png`（菜单异常提示）。按钮可读、确认框未裁切，原HUD保持；存档界面外观属于design，未声称原版像素复刻。

源数据实例化中的不适用undefined和未实现生成属性预留均有明确政策，不等同于复原Flash历史档。跨版本迁移、备份和导入导出尚未开放，交022；未将整个基础功能线或完整游戏标为完成。
