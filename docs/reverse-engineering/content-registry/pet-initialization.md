# 幻兽构造与恢复配方

正式目录 `src/content/pet-initialization-rules.ts` 对应HuanShouClass构造器（82–175）。先复制等级、四类成长率、转世、转世上限、元素和称号编号；nowExp缺省0、maxExp缺省floor(当前等级×9)、oldLevels缺省1、oldNowExp缺省0、oldMaxExp缺省floor(当前等级×9)。**oldMaxExp的缺省公式使用当前等级，不是oldLevels。** 所有 `!= undefined` 分支保留显式0。

sd/qyg缺省0，nowLifeLv缺省0；nextLvRate类默认random(3)×0.1+1.3，传入值存在时覆盖。isGod使用源宽松true比较归一为布尔。构造器随后initialize重设种族稀有分和属性上限，输入rareFen只有更大时才能替换；checkUp计算评分和属性，最后生命填满到最大生命。构造参数中的life不参与恢复；battle和inOne初始false。

initialize末尾只对种族最高评分大于0的属性应用代数增长：最高成长率乘1.5^nowLifeLv，最高评分加nowLifeLv×1000。该函数另计算nextLvRate^nowLifeLv却没有使用结果，不能把它自行接入公式。checkUp的评分setter处理仍须按源访问器解释，不能把0除0简单填成任意评分。

离线oracle执行原构造器、所有原访问器、initialize、checkUp、moreAttribute及flashAttribute，无Flash运行层，未进入游戏运行时。49种字面道具模板×三种成长倍率共147组通过。另验证显式零、较高/较低rareFen、源泉世代参数和忽略输入生命。编码器使用固定合法BASE与倍率；编码/解码产生约1e-12浮点误差，模板标量比较使用1e-9容差，不声称原混淆编码与现代普通数值位级一致。奇迹龙随机种子生成边界不包含在这49种字面模板检查中。

原readGame构造对象的nextLvRate重复键异常见source-contract.md。现代持久化需分别保留nextLvRate/sd/qyg；本配方记录构造器收到正确字段时的行为，不声称已确定AVM1重复键求值结果，也不据此宣布完整幻兽系统实现。
