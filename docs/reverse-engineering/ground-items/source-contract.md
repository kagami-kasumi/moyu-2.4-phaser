# 地面拾取源合同

## 来源与冻结
源 SWF 身份沿用 `docs/reference/swf-inventory.json`；原提取物只读。`source-functions.json` 由 `node tools/freeze-ground-items.mjs` 首次冻结，拒绝覆盖；包含 AS 函数、空格分支和对应 AS/P-code SHA-256。测试单独执行冻结函数与现代实现对照，不以现代代码生成 expected；这是有界显示对象替身，不是 Flash 动态运行。

## verified
- `DefineSprite_148_地面物品/frame_1/DoAction.as` pickUp：先 accountThing(空格)，无空格则提示“你的背包没有空格了”并返回 false，即使现有同类堆叠未满也不例外。有空格则 setThing 后提示“获得  ”加 thingName。onRelease 成功才移除；没有距离条件。
- 同文件 flashPic：四类装备显示品质+名称，幸运符和三类铃铛显示品质+类型；戒指、书、药品、宝石显示名称，其余显示类型。
- `DefineSprite_4253/frame_1/DoAction.as` autoPickUp：从 allGoods 末项向前，要求可见、abs(dx)<100、abs(dy)<50；成功才移除并 splice，失败继续遍历。clearGoods 移除可见对象并清空数组。点击移除留下的原引用因不可见不能再拾取。
- 根 `frame_9/DoAction_2.as` case32 调用 map.goods.autoPickUp(role._x,role._y)；还含复活入口，本任务没有死亡/复活系统。
- 根帧9 setThing 先按包格升序补堆叠，再找首个空格；ThingMC.addNumber 使用 maxNum（当前包格99），余量继续传递。原始超99单槽已有物品不是本任务新增规则。物品属性通过现有存放能力复制。

## design
现代领域以仍在 drops 中的对象引用代表活物品，成功立即移除引用；拒绝伪造、过期、空格和技能图标对象。场景以同一引用维护交互标记，切图/新建销毁旧标记。标记沿用现代文字样式，不声称原版图像。HTML 面板可见时禁用场景拾取和空格，避免 UI 穿透；一次 keydown 对应一次拾取，忽略系统 repeat。规则、范围和顺序仍按源合同。

## 边界
没有新增掉落生成、战斗、商店、主动丢弃、存档或复活。显示列表、pivot 和动画时序不适用于新增现代文字标记；既有44动作投影仍单独回归。
