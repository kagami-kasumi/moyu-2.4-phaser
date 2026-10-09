# 幻兽成长和进度字段

HuanShouClass的27个字段见src/content/pet-numeric-accessor-rules.ts，涵盖经验、攻击范围、转生次数、元素/称号、当前/最高成长率、百分比加成、主属性最高评分及旧进度。每个setter仅以isNaN拒绝输入，其他值直接编码保存；getter解码返回。字段本身不取整、不夹取、不校验元素枚举、不使其他字段同步，也不刷新派生属性。

tests/pet-numeric-accessors-source.test.mjs执行全部54个访问器，用可观察的编码包装替身验证输入原样传递与getter解包，覆盖零、负小数、正小数、大数以及NaN/undefined保留旧状态。该替身只隔离访问器控制流，不是实际编码算法实现，也不证明所有这些输入都能在正常游戏产生。
