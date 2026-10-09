# 幻兽评分

allFen与levels访问器另有排序镜像：有效输入先写sortFen/sortLevels，再编码；NaN不改变镜像或编码值。这里没有自动计算星级或战斗力的调用。源测试检查镜像写入先于编码，避免将两个存储字段误当成独立状态。

mainFen、lifeFen、minAttackFen、maxAttackFen、defenseFen、rareFen、zsFen、elementFen、titleFen的setter均拒绝isNaN输入，保留之前的编码值；其他值直接交给setSecreteCode，没有本地取整或上下限裁剪。getter交给getSecreteCode解码。源测试用恒等编解码替身确认NaN保留旧值及负小数传递，未把该替身当作真实编码算法证据。

HuanShouClass.as:1189 checkUp。四项成长评分写入公式均为maxScore*(rate-maxRate/2)/(maxRate/2)，主评分为四项之和，转生评分zs*10。元素0得0，1至4各150，5得300。称号2/3/4/5分别300/500/700/900，名称与简称见src/content/pet-score-rules.ts。

未知元素没有default分支，保留旧元素分数和名称；未知称号则清零并恢复“无”。刷新属性之后，总分写为主评分+稀有评分+转生评分+元素评分+称号评分，并返回总分。测试执行全部元素与称号组合，另验证两个未知分支的不同处理。这里核验函数写入，属性评分setter对边界值的处理不由普通字段测试替代。
