# 全队恢复品源合同

## verified
frame9 useItem药品分支完整顺序：人物MP正值先处理，人物死亡提前拒绝；以人物缺血为起点，三个打开面板依次严格大于时替换目标，死幻兽跳过；给body加HP，成功后由backPack.useThing先匹配扣一份，失败清当前槽且不回滚恢复。纯魔力药也走HP选择，hpVal为0。
生命之源调用4591人物setThing然后4556三个setThing；共用人物储备，按人物、槽1、2、3顺序，跳过死亡，容器不消耗；魔力源泉只恢复人物魔力。4556.close清空huanShou和body绑定；无活动绑定的槽没有恢复目标。
HuanShouMC.life/maxLife将body转发给同一huanShou；HuanShouClass.life setter按0..maxLife钳制。合体只隐藏身体，仍拥有绑定，药品选择不检查inOne。铃铛通过幻兽重算上限参与缺口。
冻结完整AS/P-code哈希沿用character-consumables/source-functions.json；本次source.json另冻结body/幻兽setter和面板关闭原文件。独立oracle复用source-consumables-oracle并安装冻结pet生命setter，不引用正式恢复函数。

## design
Inventory通过实时provider获得当前PetProgression对象绑定，首次进入及restore都重新连接。所有参与目标有效后才开始恢复；未知数值/身份返回失败，不让MP先变化再因现代数据错误丢失物品。正式成功反馈包含每个出征槽当前生命，物品说明解释自动目标与共享顺序。背包旧按钮在关闭、换对象、新建后拒绝，指定幻兽整格治疗保留独立入口。无每帧喝药、无新伤害入口；受伤条件用明确标注的受控导入验证。
