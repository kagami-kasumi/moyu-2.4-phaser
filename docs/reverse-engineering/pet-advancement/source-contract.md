# 幻兽进阶道具源合同

verified：4556/frame1 setThing的十个进阶分支完整冻结。电浆要求life>0、allFen>=3000、非雷元素，先变雷并按旧maxLife钳制再刷新。水晶maxZs+1；转世丹增加min(10,maxZs-zs)，差额<=0拒绝。这两种无死亡限制，不钳制生命。

verified：神兽药水sd上限[1,2,3]、罕见+500；奇异果qyg上限[50,100,200]、罕见+50。四元素内丹要求非神使且对应属性为副属性：风最小攻击/火最大攻击/水生命/地防御；isGod=true、罕见+200、对应率Math.round(rate*(1.5+Math.random()/2)*10000)/10000。这六类均刷新后life+=0，无存活限制。

verified：雷内丹调用原类lifeLvUp；mainFen>=6000或奇迹龙、nowLifeLv<2。主成长乘1.5、副成长乘记录nextLvRate；turned在未达maxZs时zs+1，若当前等级高于oldLevels则记录当前等级/经验，然后等级1、经验0/9。最后maxZs+50、罕见+500，checkUp/刷新后钳制当前生命，不回满、不清sd/qyg。评分和上限按新代际重新派生。原声明nextLvRate随机取1.3/1.4/1.5，已保存数值为准；缺失不重新抽签。

verified：上述十类成功仅扣一个：number>1减1并返回false以保留拖动对象，否则返回true清槽。失败不扣。源码SHA256与完整函数见source-functions.json；完整AS类独立oracle保留setter、评分与属性消费者。

design：在收藏详情中选择出征幻兽并二次确认使用，明确作用和消耗；旧面板/角色/选择/物品回调拒绝。未知关键字段保留并拒绝执行。正常现有商店电浆可购买，其余浏览器受控输入明确标注；合体、双兽幻化及自然掉落仍独立后续。无需新持久字段，既有完整PetRecord与raw字段负责保存。
