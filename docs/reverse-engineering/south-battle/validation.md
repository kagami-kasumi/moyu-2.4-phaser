# TASK-WORLD-079 验证

2026-10-18：typecheck、npm test（包含南城16项）、build、check:save、check:source、check:south-battle、check:swamp-battle、check:swamp-city、check:swamp-artisan和check:harness均实际通过。build仅有既有bundle体积提示。

自然两职业从078真实home导入，经真实键鼠访问五区并清四个有敌人的战区、击败主将、消费超级经验球、军需官往返和刷新/文件导入；无journeyProbe。south-battle.spec.mjs两项通过。另三项受控浏览器检查五地图/全部魔军家族和部分存档、暂停/死亡/幸运返回、满包奖励拾取消费，共5项通过（7.8分钟）。截图复核人物、怪物、传送点，发现并修正南城引导回退早期郊区的文案。

初始法师资源封顶，未将首次封顶领奖作为资源消费证明。south-battle-rewards.spec.mjs从各职业实际right-cleared档接续：军需官返回沼泽、走到卡萨诺郊区出售50万腾出容量，完整领取20万并实际兑换两次10万为1700魔石，再返回沼泽保存/刷新/文件导入。两项通过，最终home覆盖为完整消费后的真实档。

076军团边界3项、077城市边界5项、078巧匠边界2项，与两项资源消费共12项浏览器全部通过（3.0分钟）。记录.evidence/south-battle/browser-regression.log；逻辑及构建/source日志同目录。自然/受控截图和导出按warrior/mage或controlled名称区分。

源oracle验证五区全部生成字段、15次随机、encounter跳图先于旗标、三类掉落与完整工厂、主线10/11和逆序奖励。领域额外验证三个军团共享oldCity、受控左区生成、重复死亡/领奖、旧实例、非法档及部分/清空保存。52张独立FFDec PNG与转换资源比较通过。

限制：南城城市/幻境和独立NPC业务尚未开放，由080及后续负责；不据此宣布完整游戏完成。
