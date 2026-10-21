# 088 验证记录

## 已通过

- 类型检查与构建；构建保留既有大chunk提示。
- 完整逻辑568项：`.evidence/ice-palace-city/logic.log`通过组342项；遇到幸运之门旧“冰宫未开放”样本后，修正并从该组继续，`logic-continuation.log`通过组197项；遇到087旧“冰宫入口关闭”断言后修正，`logic-final.log`通过组29项。失败组不计入，通过组无重复，共568。
- `check:save`14项及653字段、`check:source`、`check:ice-palace-city`、`check:ice-palace-battle`、`check:ice-battle`、执行中harness。
- `npx playwright test tests/browser/ice-palace-city.spec.mjs`当时3项全部通过（4.0分钟）：双职业真实旅程与受控满包/入侵/暂停/死亡/幸运回城。

## 玩家可见证据

`.evidence/ice-palace-city`两职业city、entered、cleared截图和city/bought/entered/tracking/picked/used/home真实导出。输入是`.evidence/ice-palace-battle/{warrior,mage}-home.json`，沿用087已说明的受控装备/队伍；本包没有注入战斗清场。按F实际作战，途中实际保存和导入，拾取最终神兽药水并通过幻兽进阶按钮消费，检查背包减1和全体幻兽sd总增1。城市采购共享药品，三个NPC保持身份和尚未开放提示。受控满包将首赠落地，腾出容量拾取；严格随机入侵、暂停、死亡和幸运返回冰宫另证。

## 修复与限制

首次浏览器断言错误地在进阶区域寻找成功文本，第二次误以为选中幻兽为pets[0]；均只修正断言位置/身份，复跑3项通过。完整逻辑中两处旧关闭范围断言随本包开放同步更新。截图发现ice前缀误匹配第4军团说明，已修复并另加实际导出显示专项；相邻浏览器与显示专项6项通过（3.4分钟）：086/087五区、暂停/死亡/军需官/幸运、087完成郊区商人和088双职业实际导出显示。最终状态harness另记下方。

原entry1引用/现代entry6修正、3531原图完整性限制和独立服务范围见source-contract.md。未验证自然养成到该阶段，不宣称全游戏完成。

最终状态generate:harness / check:harness通过，088关闭并调度089。
