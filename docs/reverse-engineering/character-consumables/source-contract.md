# 人物消耗品源合同

TASK-ITEM-023，原始材料只读。`source-functions.json` 冻结根 useItem、人物/幻兽 setThing、生命/魔力 setter，记录 AS 和 P-code SHA256。oracle 执行冻结源函数，不引用正式消费实现。

## verified

- frame_9/DoAction.as createItem 定义七种药品：小/中/大生命药 200/500/1000 HP，小/中/大魔力药 100/250/500 MP，超级药 1500 HP + 1000 MP。另有生命之源、魔力源泉、超级经验球、能量药水，共11个注册身份。
- 根 useItem:275–337：药品先加人物 MP（正值且人物死亡则立即拒绝），再以人物生命缺口为起点，严格大于才改选三个打开且存活的幻兽。比较 huanShou，写 body。相等保留前目标；选中目标死亡拒绝；HP setter 忽略 NaN 并按上限/零钳制。成功恢复后才调背包 useThing，按槽从前向后扣除匹配物；扣除失败清空当前槽，不回滚已恢复数值。
- DefineSprite_4591:52–148：超级球在 expBallNum < levels 时加次数和五项各2并 flashAttribute；达到上限仍扣道具。未检查死亡，不恢复当前生命/魔力。能量药水 maxPower < 6 才加1、清 isFull 并扣除，初值3；不改变 isUsed 或任何技能。
- 储备使用不扣道具。人物存活才恢复；不足用尽储备，充足扣生命/魔力缺口。生命之源随后按三个幻兽 body 顺序共享人物 lifeSourse；幻兽 setThing 没有 isOpen 判断。魔力源泉在幻兽没有恢复分支。储备 setter 不钳制，最大生命/魔力或储备等级 setter 重算容量，升级容量随属性更新。
- RoleMC 初始储备等级1、当前储备读取0；DefineSprite_4536 dangerous(false):459–479 在安全地图回满储备。当前有界旅程尚未实现区域危险状态/安全恢复调度，本任务不伪造充能入口；正常初始库存来自既有新建源链，受伤及非零储备使用受控验收。

## design / 边界

纯函数接受最多三个显式幻兽面板输入，用于保留选择和共享储备规则；当前未开放出征/合体控制，因此游戏人物消费入口不伪造幻兽 body。面板在显示层反馈当前/上限、储备和超级球次数。旧按钮通过对象身份拒绝过期引用。

schema v1 / 存档库v2不变。在 inventory.consumables 保存已活动的次数、五种永久加成、储备等级/余额、XP容量和满值标记。对应 role_* 与 XPPower_maxPower/isFull 由活动状态写回；容量由属性乘等级派生。旧档没有该对象时从 source 同名字段恢复，缺失才使用源初值；其余 XP 字段、格可见性、未实现 raw 保持原样。不重放消费。
