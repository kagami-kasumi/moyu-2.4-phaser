# TASK-ITEM-009 · 地面掉落拾取闭环

## 目标
玩家能回收礼包或换装满包产生的地面物品，看到背包与场景同步变化，失败不丢物品、重复操作不复制物品。

## 输入
- 前置 TASK-ITEM-008 的掉落、背包存放与装备能力；选题原因：当前满包产生的物品只有显示没有拾取，直接阻断现有物品旅程。
- `local-resources/moyu/source-index/as/scripts/DefineSprite_148_地面物品/frame_1/DoAction.as` 的 pickUp/onRelease/flashPic。
- `DefineSprite_4253/frame_1/DoAction.as` 的 throwGoods/autoPickUp/clearGoods，以及根 `frame_9/DoAction_2.as` 的 case32（空格键）。路径均相对同一提取目录。
- 根帧9 backPack.accountThing/setThing、ThingMC 的堆叠语义；既有 NPC/物品源合同和实际运行代码。

## 范围
任务内部完成有界取证、实现、逻辑/浏览器与视觉验证。支持点击地面物品及原空格快捷拾取，覆盖范围、遍历顺序、空格门槛、容量失败、堆叠、场景物品移除与切图清理。原脚本显示点击没有距离门槛，快捷范围为横向小于100、纵向小于50；实现前冻结并独立核验，不擅自统一两种入口。不实现战斗掉落生成、商店、存档或背包主动丢弃。呈现可沿用现有地面标记或现代化设计。

## 输出
`docs/reverse-engineering/ground-items/` 下可消费源合同、冻结基准和验证报告；领域拾取用例、场景输入/移除适配、键盘入口、逻辑与浏览器回归。

## 验收
- 冷启动制造真实满包礼包/使用/换装掉落，腾出空间后通过点击和空格回收；场景标记、背包内容及提示一致。
- 独立源期望覆盖满包但可堆叠、边界距离、多个物品顺序、重复点击/重复按键、不合法或已删除对象、切图与新建清理；数量与物品属性守恒。
- 面板操作不误触拾取/移动，卸下或使用腾格后可再次拾取；既有装备、礼包、地图与44动作投影回归通过，保留截图并实际检查。
- `npm run typecheck`、`npm test`、`npm run build`、`npm run test:browser`，有源资源变更时运行对应资源检查；状态更新执行 `npm run generate:harness` 和 `npm run check:harness`。

## 停止与拆分
未知规则先查精确脚本/标签，不猜测。只在真实缺文件或外部依赖时记录阻塞；不因上下文压缩或耗时中止。完成后按任务生成协议自主落实下一项。
