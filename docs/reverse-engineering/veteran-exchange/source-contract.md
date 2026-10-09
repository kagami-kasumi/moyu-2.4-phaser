# 老兵勋章兑换源合同

## verified
- `DefineSprite_4312/frame_1/DoAction.as` command case6/7：邀请回答7；每次先将 nextCmd 复位为 myID.cmd（6），useThing(勇士勋章,2) 成功才 createThing(初级月光宝盒)，提示“获得初级月光宝盒”，关闭并 return。不足显示原文与关闭回答。没有兑换次数上限或一次性标记。
- 同路径 P-code 1315–1379：Push 2 + 勇士勋章 → useThing → true 比较 → createThing → 消息 → closeDialog → Return，失败分支独立；与 AS 顺序相符。
- 根 `frame_9/DoAction.as` 1671–1726：accountThing 汇总类型及名称匹配项；零/缺失数量视作1；useThing 先检查总数，再从包格1至40扣除，耗尽清空。不足完全不改包。
- 同文件 createThing 4612–4614 定义 `{type:"宝石",name:"初级月光宝盒",number:1,salePrice:500}`，4830–4837 默认走 setThing。setThing 先堆叠再找空格，失败走既有地面散落。因此先扣勋章腾格时不会因兑换前满包而失败；未腾格又无宝盒堆叠空间时掉落。
- setCommand(-1) 只关对话；下次点击走已复位的6。首次领取入口继续采用 npc-reward 的独立基准。

## 独立基准
`source-functions.json` 冻结上述 command、accountThing/useThing 及两文件 AS/P-code 哈希；`tools/freeze-veteran-exchange.mjs` 只初次创建，不覆盖。测试用既有 source-reward-oracle 的冻结 createThing/setThing/throwGoods，加本次源函数替换 command 和背包消费方法；运行结果与正式领域对象比对。显示对象替身不是 Flash 动态运行。

## design 与边界
回答 revision/可见选项校验防止旧按钮重放；只暴露兑换及关闭，等级奖励仍未开放。界面沿用原对话框和现有物品图标，文本布局为现代 HTML；正文下移避开顶部标签/关闭按钮，等级奖励提示仅显示在兑换邀请页。宝盒使用不属于本次。保留原 SWF 与原始提取物不变，不增加源图资产或解析器。
