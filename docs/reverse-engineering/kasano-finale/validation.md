# TASK-WORLD-066 验证

交付野外四/五、共享训练四、龙怪头目行踪消费、首头目→鹿角护卫→龙王→宝箱完整旅程、源奖励与连续保存。原野外四透明出口保持关闭，进入野外五使用行踪。

## 源与逻辑

- `npm run check:kasano-finale`通过：两地图完整XML、地面/入口/宝箱时间轴、原Action和AS/P-code哈希；五张独立FFDec PNG。4236/4317背景及4263宝箱逐像素一致；2814/4117地面预乘RGBA平均误差0.01435326/0.02750616，最大69/45，为边缘抗锯齿差异。见`.evidence/kasano-finale/assets-check.log`及assets.json。两地面独立XML网格碰撞通过。
- 初始boss对照<30/≥30与各边界、后继使用成长后账本、全部数值和随机初始化。elite-drops、boss drops、chest执行原函数，对照完整奖励分支、同步随机调用与luckyBoss全部20个奖池项；高级减伤宝石使用原显式5。
- `npm test`最终全部通过（logic-complete.log），typecheck-final.log、build-final.log、save-final.log、source.log通过。构建保留既有大chunk提示。原SWF哈希与清单不变。
- 真实Journey测试覆盖行踪同图拒绝/消费/死者使用源行为/旧owner与无数量拒绝、训练四原计数/逆序逐件100次创建、全头目链/150tick暂停/满包/重复/旧回调、波次与原字段。连续带previous的保存链覆盖预警消耗、后继、宝箱与回到普通波次，修复递归合并复活旧warningTarget的问题；保存与恢复26项通过save-lifecycle.log。部分训练/完成未领/已领三态通过finale-lifecycle.log，且被最终完整套件包含。

## 浏览器

证据统一在`.evidence/kasano-finale/`，正式页面无journeyProbe，使用真实065导出并正常导入。两职业先正常孵化腾位、使用经验球提升，再普通攻击精英并随机取得行踪；战士13轮、法师4轮。没有注入击杀、掉落或宝箱奖励。

- 战士自然终章通过browser-warrior-sweep.log（1项，10.4分钟）；法师自然终章通过browser-second.log中的第3项（3.4分钟）。同一后者命令另两项失败，未当作整命令通过；它们的修复复验分别如下。
- 双职业完整三头目、未开箱导出/真实导入、开箱、拾取并使用勇士勋章、已开启导出/刷新继续、返回野外四及透明出口拒绝通过。真实文件warrior/mage-chest-unopened.json、chest-opened.json；截图four、five-entry、warning-*、chest-opened。
- 高等级35护卫、预警暂停11秒、满包40格开箱、重复旧回调、腾位拾取、未开/已开箱真实文件导入、死亡导出再导入并复活城二通过browser-boundaries-final.log（1项，39.1秒）。首次高等级保存失败定位并修复为旧预警字段合并问题；没有降低校验器门槛。截图high-guard、chest-unopened、controlled-chest、revived已查看。
- 训练二/三相邻回归双职业正常流程与受控边界均通过browser-rewards-regression.log。训练四奖励消费双职业均按真实读档等待超过5分钟后，分别在王子/公主箱消费1极品玉石/1束9朵玫瑰并导出，数量严格各减1。该组5项全部通过（10.6分钟），warrior/mage-training-rewards-used.json及training-jade/rose-used.png保留实际结果。

首次战士固定朝向攻击未跟随护卫位置而失败，后改为正常转向/移动通过。奖励回城脚本的连续鼠标操作不稳定，改用实际方向键穿过野外、Q入口，再保持城内已有路线；不改变地图碰撞或传送条件。失败日志保留，最终通过结果单独标识。

## 限制

mainTask7只保存已激活，不宣称强盗区域开放。全主动技能、其他世界头目与PK未实现。15Hz逻辑计时、暂停和保存取消动作暂态沿用064设计；旧原档未保存部分任务计数，现代扩展保存精确计数。幻兽身体仍为既有现代标识。两张地面不宣称逐像素完全一致。

最终generate:harness/check:harness通过（generate-final.log、harness-final.log，14项harness测试通过）；064/065/066为Done，067为Ready。新增源、验证、评审和任务文档已登记，未自动提交或推送。
