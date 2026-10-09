# 军功与功勋晋升

RoleMC.as:2229 militaryExploitUp、2287 exploitUp。正式阈值表见src/content/merit-rules.ts。两者先Math.round奖励，旧余额已达到上限就返回false，包括负奖励也不再应用；否则累加奖励后选择最高达标等级，仅在现等级更低时赋值。阈值为累计门槛，不扣余额；达到最高门槛后余额截到上限。接受奖励后返回true，即使未晋升。负奖励能降低未封顶余额，但不降军衔或爵位。

tests/merit-source.test.mjs执行原函数，覆盖全部阈值的前一值、等值、后一值、取整边界、负奖励不降级及封顶提前返回。测试核对晋升setter收到的值，不替代setter自身战斗力/名称副作用取证。
