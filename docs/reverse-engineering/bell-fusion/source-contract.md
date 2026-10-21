# 铃铛融合源合同

verified：frame_9/DoAction.as:4003–4144完整makeBell函数已冻结到source-functions.json。三类型均可放入任一槽或替换，旧槽先返包，满包遵循原背包掉落行为。notice只清指定槽。grade相等且主槽小于4才成功，无货币费用。

verified：成功先增加主grade，仅同类型累加pure。新grade2按主类型抽一次random(2)选择第二属性；新grade4补第三属性。之后仅grade4、pure严格等于16、skill严格等于0才random(2)+1。清副槽一次，再由yesButton调用2049物品栏upData，进入upDataWeapon:5479–5503；激活属性按类型1/2/3分别乘5/3/4，值为(grade+2-属性序号)*倍率，售价(grade+1)*100。其余字段保留。预览不抽签。

verified：DoAction_2:943–971、1859–1873保存恢复makeBell_item1/item2各字段。三槽装备独立，由051负责。源哈希包含完整函数、保存脚本及2049脚本；不涉及时间轴动画，几何/pivot不适用。

design：现代独立双槽面板，revision和会话身份拒绝旧按钮；关闭/切图保留物品。无效或未知输入保存并拒绝融合，未知旧raw占槽保护。完整扩展物品字段随对象保存，不从上一槽继承。自然掉落与技能战斗触发尚未开放；浏览器通过明确受控存档提供铃铛，再用正式UI执行。
