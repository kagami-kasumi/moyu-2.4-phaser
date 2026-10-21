# TASK-WORLD-064 验证记录

2026-10-15：野外一运行时现已接入Journey/Phaser。用户授权连续3项，本项为第1项，合同验收完成。以下为实际执行证据。

## 逻辑与来源

- `npm run typecheck`及`npm run build`通过；构建仍有既有大chunk提示。
- `npm test`全量通过，日志`.evidence/first-combat/logic-tests-final.log`。全量含受击归属、产权收益、范围保存等集成修复。随后增加对缺失灵性字段的保守保护，并补齐对应fixture；最新集成9项及效果1项专项再通过（live-latest.log），不将之前全量当成此最后小修后的重跑。
- 集成检查：两职业第11帧结束后命中；单次击杀收益；保存死怪与已发奖状态；安全区清除旧combat扩展；重入六怪；合体单接收者；反弹同步升级回血后元素伤害；六杀全掉落/满包、预警和龙怪、旧会话取消；死亡存取、暂停、城二backPoint复活；新手任务六杀与单次逆序领奖；旧boss/XP字段迁移。`.evidence/first-combat/integration-current.log`为21项（集成7+save14）通过的日志。
- `combat-effects.test.mjs`执行原2874/2878的frame1脚本对照1/3/5秒，检查2帧冰冻与15帧破防的末循环。
- `check:first-combat`通过：18 XML/二进制时间轴、17 Action、源哈希、50独立FFDec PNG；49像素一致，2808地面平均差0.00326896。还验证了Journey实际使用的first-slice野外地图/图片、mage攻击11张PNG与原基准一致。日志`source-current.log`、`assets.json`。
- `check:save`通过653字段、60NPC种子与14测试；`check:source`通过5测试与原SWF清单；`check:harness`通过14测试和检查；`git diff --check`通过（存在既有换行提示）。

## 浏览器

`.evidence/first-combat/browser-regression.log`五项通过：两职业无probe野外首次击杀/经验/拾取、真实保存导出/刷新继续/返回；两职业相邻城一购物/返回NPC/存档导入；受控真实文件导入死亡复活、六杀任务领奖、满包拒拾后腾格拾取、暂停预警和提前生成龙怪。

`browser-latest.log`另有三项通过；`browser-controlled-final.log`两项通过。最终`browser-natural-six.log`两职业均无probe完成六杀、正常开礼包填满背包、任务武器掉地、学习腾格、拾取并装备、真实导出/继续/回城/重入，2项通过（2.9分钟）。不以最后一条系统提示代替拾取结果，测试直接确认地面武器及实际背包/装备。截图含`warrior-entry.png`、`warrior-combat.png`、`mage-combat.png`、`revived.png`和`boss.png`；真实导出为`warrior-battle.json`、`mage-battle.json`；受控导入档明确以controlled前缀命名，不冒充自然达到的状态。

## 关闭范围与限制

首战范围的源、运行时、存档、真实收益使用和浏览器验收已完成，评审见review.md。重伤源run读取未解析form，当前未补造攻击者，不能称该被动完整可用。原任务全组分派并未由首战计数器替代；更远区域和完整任务线继续未开放。

存档取消瞬时动作/效果、首个主线中途计数扩展、首次未入城死亡回城、预警随暂停均明确标为design，见source-contract.md。后续沿野外二/三与新手训练二/三继续，未宣布完整游戏复刻完成。

`check:first-slice`已通过旧郊区/城一独立XML和PNG回归；新增野外图使用独立COMBAT_SHAPES集合，由check:first-combat核验，不扩大旧fixture的身份集合。
