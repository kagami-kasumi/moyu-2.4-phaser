# 魔魂强化验证

2026-10-06，TASK-ITEM-012。

## 源与逻辑
- `npm test`：53/53通过。新增5项魔魂检查，其中840组 = 四类装备 × 品质2/5/6 × 魔魂0/18/19/37/38/49/50 × 两种材料 × 五种数量。执行独立冻结makeItem/useGem/yes及upDataWeapon，比较完整装备对象、剩余材料、消息；包含两孔/已镶嵌字段、元素底值与较高元素值、附加和战魂守恒。
- 所有冻结AS/P-code SHA256与只读提取物一致；P-code loc137b8至loc1398c核对晶石先消费、之心先加级、品质门槛及返回值。
- 单独覆盖非法装备/材料/空槽、旧revision和关闭拒绝、替换返还、取回重放、满包落地与拾回。四件强化后取回穿戴，equipment.flashAttribute和角色源公式独立比较攻防、生命/魔力上限与战斗力。
- 首轮人物攻防测试中的手写期望有误，改为执行冻结角色公式核对；未据此改变实现或源基准。

## 浏览器与画面
- `npm run test:browser`：两次全量25/25通过，含魔魂新增2项，原44组动作投影和开孔/兑换/拾取/背包/地图/HUD回归。
- 布局和提示最后调整后，`npx playwright test tests/browser/equipment-magic.spec.mjs tests/browser/equipment-sockets.spec.mjs` 的4项专项复验全部通过。
- 无probe冷启动：领取礼包一→学习/装备腾格→魔魂礼包→之心材料→四类强化→取回穿戴；再卸下武器升至+19拒绝、切换开孔模式拒绝错料不误扣。人物战斗力20（包含已学1级英勇和新手戒指）。
- manual受控：晶石37不足38、38恰好消费，零数量晶石拒绝与之心单件，品质5的37→38、品质6的49→50与拒绝；旧按钮回放不重复消费；满包取回强化武器→学习英勇腾格→地图点击拾回→穿戴；切图保留9颗之心，新建清空槽。受控装备初值由源upDataWeapon规范化，不用于冒充正常获取高品质装备的旅程。
- 实际查看 `.evidence/equipment-magic/` 的10张截图：`cold-upgrade.png`、`four-equipped.png`、`normal-cap.png`、`crystal-shortage.png`、`grade-5-cap.png`、`grade-6-cap.png`、`full-return.png`、`recovered-equipped.png`、`city-held.png`、`fresh.png`。首轮发现反馈落到滚动区域下方，压缩间距并将取回按钮放在槽标题旁；复验后魔魂/攻防/消耗/结果均可阅读。去除重复拒绝提示，重开不展示陈旧反馈。

## 门禁与限制
- `npm run typecheck`、`npm run build`通过。构建仍有引擎大chunk提示，无构建失败。
- 本次未改源SWF、资源提取物、源解析器或图像资源；不触发check:source或重新转换美术。
- 强化和开孔共享双槽；领域实现不依赖Phaser。受控注入仅在既有manual模式探针中，默认页面无probe。
- HTML打造界面为design，未声称原界面像素复刻或Flash动态执行。品质升级、装备等级、戒指/幸运符打造、镶嵌、战斗与存档未包含；高品质强化边界有受控证据，正常可玩路径为现有礼包装备。

任务收尾状态与harness检查结果见state.json的completion；后续合同为TASK-ITEM-013灵魂晶石装备品质提升。
