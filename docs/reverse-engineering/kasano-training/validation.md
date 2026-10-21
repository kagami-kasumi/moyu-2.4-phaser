# TASK-WORLD-065 验证

已交付野外二/三、四精英/六龙怪、三阶段训练的连续计数与领奖、头目分支、产权与成长收益、区域存档及死亡回城。野外四仍关闭。

## 源与逻辑

- `npm run check:kasano-training`通过：两图完整XML显示列表、地面2811/2813子时间轴、原Action和AS/P-code哈希。四张独立FFDec PNG：4318/4320背景逐像素一致；2810/2812地面预乘RGBA平均误差0.003081/0.012681，边缘抗锯齿最大56/61。记录`.evidence/kasano-training/assets.json`、assets-check.log。
- `npm test`全部通过，日志logic-all.log。新增五项源初始化/完整掉落/任务与live测试，后续独立碰撞两项通过collision.log。原初始化对照精英612HP、龙怪255HP、名字色、坐标与随机序列；完整奖励分支枚举两个职业、七等级、阈值和同步随机消费。
- 任务测试执行原catchThing/taskComplete/nextMainTask/getPrize，覆盖两职业、每段领奖/全部做完再领，逆序奖品与共享mainTask6激活。危险图不回血、普通龙怪不冒充boss、旧session无效、暂停、死亡、codec和064档迁移已通过。最后补充非法raw旗标拒绝与首战回归共12测试通过live-final.log。
- typecheck、build、check:save、check:source、check:first-combat通过，对应typecheck.log、build-final.log、save.log、source.log、first-combat-source.log。原SWF哈希/清单保持不变。构建仍有既有大chunk提示。

## 浏览器

`npx playwright test tests/browser/kasano-training.spec.mjs tests/browser/first-combat.spec.mjs`最终6项通过，browser-fixed.log，8.3分钟。此前一次首战因背包全量重建导致按钮消失，已修复并完整重跑，不把失败作为通过证据。

两职业从真实064首战导出导入，以正常戒指/经验球使用提升后，经正常移动/攻击消灭四精英和六龙怪；未领奖导出再导入，分别领取和装备头盔/鞋，再保存、刷新和真实文件导入、往返重入。没有probe注入人物/杀敌。受控档明确命名controlled-*，覆盖满包奖励落地、释放空位拾取装备、暂停预警/头目、跨图及死亡导出/导入后复活。

截图和真实导出均位于`.evidence/kasano-training/`：warrior/mage-two-entry、two-fought、three-fought、imported，two-unclaimed.json、three-claimed.json，以及controlled-boss/controlled-revived.png、death-export.json。已查看新图精英与法师训练三截图：原身体/蓝色名、图层和训练操作栏正常。

## 限制

旧主线无部分need计数，仅依据原完成旗标迁移为0或目标数；现代扩展保留准确进度和当前波次。计时/暂态取消沿用064 design。此验收不代表完整技能库、野外终章或全任务面板完成。
