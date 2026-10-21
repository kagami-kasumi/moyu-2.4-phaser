# TASK-WORLD-083 验证

`check:south-field`通过五野外完整XML/Action、AS/P-code散列、两个家族完整动作与40张独立重建PNG。生成源测试逐字段覆盖初始/随机/护卫/妖王、等级1/70/75/130/135、战斗力0/5/270与四随机端点；独立运行原bossLevelsUp及行踪useItem的先换图/后扣数和同图拒绝。完整头目/四野外掉落oracle比较事件、工厂全字段和穿插随机调用。领域5项/碰撞1项及082相邻4项通过。

完整`npm test`退出0，`.evidence/field-full-logic.log`496项、0失败。`typecheck`、`build`、`check:save`14项、`check:source`、`check:south-field`、`check:south-rescue`和harness通过。构建仍只有既有大chunk提示；没有原SWF/原始提取修改。

浏览器`.evidence/field-browser.log`3项全部通过，4.6分钟：两职业从082真实导出档，在明确受控装备/原rareFen100000队伍下实际UI消费行踪、同图拒绝、F与方向键打完初始炎女头目/恐兽护卫/妖王、预警保存及真实导入、开宝箱，按地面列表精确索引拾取本次宝箱的第二奖品，走回南城一并在药剂师商店实际整格出售，随后刷新/文件导入。首次只沿用082装备时战士死亡的失败已记录在review；通过调整受控测试装备重测，没有修改生产规则。

满包专项基于实际战斗生成的未开箱存档，验证开箱落地、满包拒绝、使用勇士勋章腾位、精准拾取与40格回存；已开启宝箱不重复发放。另验证死亡回南城一、幸运之门立即回原homeCity且独立头目计数不丢。082满包/未知城堡命令/死亡浏览器相邻回归1项通过，`.evidence/field-rescue-browser.log`。

已查看warrior-chest.png，原地图、地面奖品、宝箱与HUD位置正常；没有用截图代替战斗。两职业最终home均为southCity，southField={level:75,moreFire:0}、卡萨诺bossLevel保持原值，劫狱仍完成。原始地图名投影已对082/083往返断言。

限制：本任务不提供自然养成难度/通关证明；不开放南城产权、边关或社交。下一项为边关城市与边境幻境，不据队列进度宣称完整游戏完成。
