# 城三幻兽商店源合同

verified：frame_9/DoAction_2:186–191定义20商品，初始openNumber9，五档9/11/14/17/20。原root frame9实例huanShouShop绑定2089，与药店/杂货共用交易时间轴；独立FFDec XML及只读SWF绑定记于source-fixture。4312 cmd101提供购买入口102；102关闭对话、打开商店和背包。好友关系跳转及职业升级不属于本次交易能力。

verified：2089.onSell先检查商品和背包空槽，再检查总价；重复createThing(num)后扣款，部分满包会掉落，不退款。出售为floor(salePrice/2)乘整槽数量（<=0按1）；按源工厂生成物品，与价格目录分开核验。20项均为固定蛋物品，19项已有固定种子孵化；奇迹龙为随机生成种子，不在ITEM_PETS固定表中。

verified：旧源huanShouShop保存openNumber。现代petShop.openNumber独立拥有该字段；缺少扩展时从raw推广，校验0..20，未知扩展保留。恢复不开放面板/重放交易。切店、切图、关闭和新建拒绝旧回调。

design：幻兽商现代对话仅开放购买；货位以已恢复openNumber决定，不从货位猜商人等级。商人升级另交任务。复用现有商店面板/逐格出售，奇迹龙显示随机孵化暂未开放，不冒充固定种子。固定种子孵化只增加既有记录，未新增战斗/合体。
