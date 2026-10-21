# 杂货商升级源合同

证据等级：以下原版规则 verified；现代 HTML 任务状态、生命周期 revision 和存档扩展为 design。独立输入及 AS/P-code 哈希见 source-functions.json，冻结命令为 `node tools/freeze-shop-upgrades.mjs`；原始文件只读。

## 状态与物品

4536/frame1 奈奈安 jobLevels=1、jobMaxLevels=5、cmd71；4312/frame1 command 的71入口，command2 的8400/8401/8402处理受理与资助。2210/frame1/DoAction_2 的 branchTask 索引16–19是完整四阶段：200、500、2000、5000魔石；frame9/DoAction_2 的 shop.levelNum=[0,4,7,10,13,16]。

8401只设isDoing；8402先spendMs，成功后need[0].number=needNumber、isComplete=true，再提高jobLevels和openNumber，不发奖励。费用不足发“你的魔石不足”，状态不变。下一阶段可先受理，不要求领取此前奖励。

getPrize要求isDoing和isComplete；从prize末尾向前发放。声望先+1，RoleMC setter封顶500，并只提高titleLevel到floor(credit/50)。物品调用完整createThing，number字段控制调用次数，工厂重建每件：二级为2经验球、2中级战斗力宝石；三级为3经验球、1初级月光宝盒；四级为5经验球、2初级月光宝盒；五级为电浆药水。奖励本身无随机选择；满包经既有throwGoods每次调用random(150)、random(50)。测试逐项比较背包、掉落、随机参数和消息顺序。

这四个branchTask的type是“日常任务”，领奖后need.number归0、isComplete=false、isDoing=false。商人等级保留，不能按isComplete=false重新提供低等级任务。现代按钮还拒绝离城、关闭、换角色及过期revision。

## 持久化与恢复

原版frame9/DoAction_2只保存这四个branchTask的isDoing/isComplete，不保存branchTask need数量；jobLevels独立保存于npcState，shop保存openNumber。现代扩展保存全部四任务数量与标记。旧raw提升时从完成标记恢复number=cost或0，从奈奈安jobLevels恢复等级，绝不依据货位数伪造任务。商人等级与货位分别保留，下一次正常资助按源等级表更新货位；尚未实现的任务/NPC字段保持opaque。

已结束且标记归零的历史阶段不能通过原raw区分“领过奖励”和外部修改，界面只作商人阶段状态展示，不额外发放补偿。不存在“源原版存储branchTask数量”的结论。

完成标记却没有受理标记、完成阶段高于商人等级或现代数量与完成状态矛盾的存档被校验拒绝；不自动发奖修复。这是design恢复保护。货位与商人等级不一致可独立保留，货位本身不作为完成证据。

## 展示边界

任务概览随杂货商对话展示，领取独立于资助；保留现有商品面板和背包查看/使用边界。社交、其他商人、全局任务界面不在本项。坐标、动作与原版UI外观未新增像素复刻主张。
