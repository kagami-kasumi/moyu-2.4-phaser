# 资源扣除与声望增加

RoleMC.as的spendMs、spendRes、consumeMp先用isNaN检查参数，再以余额>=参数决定是否扣除。足额返回true，不足返回false；魔石/资源遇NaN返回undefined，魔力遇NaN返回false。没有取整和负数检查，因此小数可扣除，负数会增加余额；属性setter后续上限规则另见角色状态合同。consumeMp不足时另发消息。

creditUp将val==undefined的输入改为1，通过isNaN检查后直接增加xxx_credit并记录消息；不取整，无显式返回值。正式规则在src/content/resource-consumption-rules.ts。源执行测试覆盖足额、不足、零、负数、小数、NaN和缺省声望。测试使用普通字段隔离方法逻辑，不将其结果视为绕过原版setter后的最终余额。
