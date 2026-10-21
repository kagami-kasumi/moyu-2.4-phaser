# 031 验证记录 · 2026-10-09

- npm run typecheck、npm test（107+50通过）、npm run build、npm run check:save（14通过）。构建仍有既有大包提示，无构建错误。
- 元素专项4通过：2240组独立源打造oracle比较完整物品、材料、声望、消息和随机调用；24组职业/套装/混合属性与完整源消费者一致。失败分支不抽随机；单件小石事件次序random→consume→refresh。
- 浏览器专项3通过：两职业无probe debug开局，正常孵化腾包、领取四装备、附加雷、穿戴、人物数值、保存刷新与真实下载文件导入；受控其余六材料、旧回调、等级临界、满包、切图和新建。
- 实际打开检查 warrior-stats.png 和 mage-1.png：元素战斗力8、四项40和雷套装可见；打造单件元素/声望/材料和职业装备一致。截图、真实存档、全量日志位于 `.evidence/equipment-elements/`。
- 初次浏览器失败是debug满包导致礼包装备掉落，以及法师衣服缺字段；旅程改为真实孵化腾包、魔魂之心重算，没有注入物品冒充无probe旅程。源对象仍保留缺字段语义。

限制：其他六材料只覆盖受控目录；通用开局4雷、debug另5已纠正合同。装备元素数值和人物属性完成，元素战斗伤害未实现。

全量 npm run test:browser -- --workers=2：72通过（3.1分钟）；generate:harness/check:harness通过。
