# 角色转世

RoleMC.as:2386 upGod按顺序拒绝已经转世、等级不足100、仍穿戴装备。通过后将等级置1、经验球计数和当前经验清零、阈值置9；七个基础字段翻倍（见正式规则），godFire设300，roleGod设true，再重置幻兽并调用expUp(maxExp)。因此方法成功结束的等级为2，经验0，阈值100，不能把中间的等级1当作最终状态。最后useRecord减1500，该函数没有余额检查。

正式规则src/content/role-rebirth-rules.ts；tests/role-rebirth-source.test.mjs组合执行原upGod与expUp，检查三条拒绝路径、七字段倍增、最终进度及操作顺序。幻兽reset内部行为和属性刷新内部公式不在此范围，测试使用记录调用的替身。
