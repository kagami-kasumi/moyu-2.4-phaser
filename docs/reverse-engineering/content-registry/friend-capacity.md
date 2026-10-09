# 好友容量与等级汇总

证据：`DefineSprite_2381_朋友/frame_1/DoAction.as` 的 `levelsUp`（154行）与 `getAllLevels`（218行），verified；正式记录为 `src/content/friend-capacity-rules.ts`。

`levelsUp(lv)` 在参数与 undefined 宽松相等时读取角色等级，容量为 `ceil(lv / 10) + 1`，超过14则设为14；角色 `roleGod == true` 时直接设为14。没有下限、整数输入或 NaN 检查。最后调用 `upData()`；本合同不把该调用内部行为视为已核验。

`getAllLevels()` 从0开始，按数组逆序累加所有 `allFriends` 元素的 `levels`，没有恋人、关系等级或好友标记筛选。空数组返回0。此前任务奖励公式中的好友等级合计以此函数为来源；这里没有再做取整或封顶。

原函数测试覆盖等级容量边界、默认参数、神化覆盖、负数和 NaN，以及包含不同关系标记的等级汇总。测试使用数值等级；不把 JavaScript 对异常类型的行为当作 AVM1 的完整证明。未实现好友系统。
