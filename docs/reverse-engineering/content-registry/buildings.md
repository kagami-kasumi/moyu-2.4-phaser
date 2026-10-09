# 城堡建筑数值与持久字段

正式数值说明见 `src/content/building-rules.ts`，六条初始数据在 building 注册表。`BuildingClass.as:11` 构造器调用 `setVal`；姓名缺省空串，五个数值字段缺省0。数值setter忽略NaN/undefined写入，读取使用SecreteCode解码，无等级上下界约束。

`DefineSprite_2313_主城堡/frame_1/DoAction.as:2` 起六个原始顺序为住房、主城堡、幻兽研究所、宝石生产厂、月光宝盒合成器、宝石精炼室。住房初始等级/奖励等级3，其余0；上限依次30、10、9、1、1、1；资源价格50000、0、200000、250000、500000、500000；初始主城堡要求-30、0、1、4、7、9。负的住房要求是源值，不改成0。

主城堡升级（82–101）：住房至少 `(当前等级+1)*3`，声望至少 `当前等级*5+50`；通过后等级和奖励等级各加1，不扣声望或资源。其他建筑（102–119）先检查主城堡等级，再调用 `map.role.spendRes(upPrice)`，仅返回false才中止；随后等级、奖励等级、主城堡要求各加1。价格不会随等级变化。

源函数没有 `maxLevels` 守卫；上限在 `flashInfo` 中隐藏按钮。直接调用升级函数越过上限的行为已通过原函数执行验证，不能把现代校验设计写成原版事实。

## 资源引用待确认

升级行112额外执行 `this._parent.role.res -= upPrice`，与已扣款调用的 `this._parent.map.role` 不同。P-code行575–582确认扣款经map.role.spendRes，601–619确认额外写入直接经_parent.role.res，确实少了map层，不是反编译格式化错误。

独立读取原SWF根第9帧：mainCastle为sprite2313，map为sprite4536，无根role实例；map第1帧内role为sprite3106。全脚本对直接role赋值的检索找到任务、面板中的局部引用，未找到根role赋值。由此将该路径记为 **inferred：悬空引用**；根帧静态实例缺失本身是verified，但不是任意动态执行下永远不存在同名属性的证明。RoleMC的res setter只输出trace，不改xxx_res。额外语句不能登记为第二次有效扣款，其AVM1最终运行效果仍未验证；保留源异常，不以JavaScript异常语义替代。测试记录独立stub目标收到的写入，仅验证表达式，不把stub视为真实时间轴绑定。建筑玩法未实现。

## 存取和重置

`frame_9/DoAction_2.as:1480` 保存各建筑的levels/prizeLv；`:1946` 按当前数组顺序写回，经过原数值setter，缺失或NaN保持已有值。循环的 `_loc4_ < 10` 中 `_loc4_` 被置0但未递增，不能据此声称只恢复前10个；实际由building.length控制。

源未保存升级过程中变化的needMainLevels，也未保存name/upPrice/maxLevels。`initData`（8–19）仅重置levels/prizeLv，不重置needMainLevels。于是同一实例重置与重新构造的结果可能不同；不能将所有字段一概描述为“恢复到初始表”。现代存档如何保留该变化需在TASK-SAVE-016明确design，同时保留源字段与缺失状态。

独立原类/原函数执行检查：六个构造种子逐字段与注册表对账、NaN/缺失写入、重置范围、声望和住房门槛、直接越界、资源不足与正好足够、成功后要求递增。未用这些测试证明未解析的时间轴引用。
