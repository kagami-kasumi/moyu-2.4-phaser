# TASK-WORLD-073 验证记录

## 已通过

- typecheck、build；check:gobi-city、check:gobi-battle、check:shuxin-city：独立XML/Action/PNG对照通过。
- `.evidence/gobi-city-unit-fixed.log`：完整npm test退出0，末组新增11项全通过。
- `.evidence/gobi-city-save-fixed.log`：check:save 14项通过，653字段与60 NPC种子一致。
- `.evidence/gobi-city-browser-attempt3.log`：9项通过，2项自然实战失败。通过内容是072三项受控回归、073四项受控边界（药水变雷/满包，四蛋孵化，随机/死亡/幸运，普通全部有效产物消费出售）、071两职业真实清场档返城消费与刷新导入。没有将失败的自然实战计入通过。
- 已查看warrior-city.png：原城市背景、四NPC及人物、入口可见，无缺图；首次图的状态文字覆盖仍沿用现有HUD。

## 自然实战迭代

1. 直接072档进入，战斗力不足，两职业死亡。
2. 使用原档已有经验球与勋章成长，但选择未出征幻兽分经验会召回第一槽，实际只带一只合体幻兽，死亡。
3. 正常重新出征第二幻兽；购99药时受每瓶占一格影响，大部分落地，实战携带不足，失败。
4. 升级脚本按可见“卸下”文本查找装备名，未匹配aria-label，实际仍60级；已用真实aria-label并添加120级断言修正。仅出售有价格物品无法腾空无价格道具；改用正式仓库存入，保留原物品。
5. 120级装备后仍有朝向与过量喝药问题；之后按原系统给三件装备开满孔、装九枚高级战斗力宝石，并依据HUD真实缺血量喝药。失败日志保留，不计通过。
6. 战士最终真实击败四怪，清场导出成功，但荣誉提示遮挡背包点击。修复CSS遮挡后，从该真实清场档接续，拾取/使用英雄令、返城、刷新、文件导入通过。
7. 法师从正常准备城市档独立完成四怪战斗、英雄令消费、回城与持久化，全程通过。

## 最终通过证据

- `.evidence/gobi-city-browser-warrior-final.log`：四怪真实清场；随后点击遮挡失败，不把整次运行标为通过。
- `.evidence/gobi-city-browser-warrior-return.log`：真实战士清场档接续，1 passed。
- `.evidence/gobi-city-browser-mage-final.log`：法师完整自然战斗到回城，1 passed。
- `.evidence/gobi-city-build-final.log`：最终CSS修复后build退出0；浏览器实际拾取验证通过。
- `.evidence/gobi-city/{warrior,mage}-home.json`、`*-mirage-cleared.json`保存真实链；city/cleared/home截图完成视觉检查。
- 未注入战力、kill或改敌人数据。准备均使用072已有物品、原商店、装备/幻兽系统。受控边界与自然链分开记录。

TASK-WORLD-073验收完成。本轮连续授权累计1/3；完整游戏、独立戈壁NPC业务和其他区域仍未完成。
