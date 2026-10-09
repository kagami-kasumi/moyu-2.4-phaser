# 原数值编码

RoleMC与ThingMC继承SecreteCodeMC，幻兽数据类继承SecreteCode。SecreteCodeMC继承MovieClip，其编解码算术相同，但静态BASE属于另一个类，不能假设两个类共用同一次随机结果。测试逐字比较规范化后的两个方法，并用不同BASE证明MovieClip版本读取正确的静态字段。

编码后的零解码会得到负零（0除以负乘数），而缺失字段由显式return 0得到正零；测试分别断言这两条路径。

SecreteCode.as只有线性数值变换。每个实例SECRETECODE=-2-random(4)，取-2至-5；静态BASE=123456+random(500000)，取123456至623455。编码为val*SECRETECODE+BASE；解码对isNaN输入返回0，否则为(val-BASE)/SECRETECODE。

这解释了新对象尚未写入的编码字段为何读出0。小数经过双精度乘加减除可能有微小误差，不能一概声明严格相等。tests/numeric-codec-source.test.mjs执行源方法，覆盖四种乘数、BASE端点、整数精确往返、典型小数误差及缺失值/NaN。这里确认算术公式，不声称重新实现随机数生命周期或旧存档序列化。
