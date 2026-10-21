# TASK-EQUIP-028 验证（2026-10-09）

完成11命名类别镶嵌、七种孔效果、四装备三孔及拆取四槽闭环。独立源冻结未覆盖历史证据；原SWF和提取物只读。

## 实际检查

- `node --experimental-transform-types --test tests/equipment-gems.test.mjs`：8项通过；6336组完整镶嵌字段/材料对照，420组拆取孔位/阈值/余额对照，22注册参数组合，两职业七种属性与源人物公式、旧输出满包原背包oracle、旧raw推广及未知对象保留。
- `npm test`：通过（原134项加初始6项宝石测试；其后新增2项通过上述最终专项执行）。
- `npm run typecheck`、`npm run build`、`npm run check:save`：通过，保存注册653字段与14项原保存回归通过。
- `npm run test:browser -- --workers=2`：62项全部通过，包含3项宝石测试。
- 两职业无probe：领取→开孔→采购中级经验宝石→镶嵌→穿戴15%经验→约克拆取→再次镶嵌→拆取槽保存→刷新→真实下载导入。受控1100费用边界、旧按钮、满包回收掉落、切图、新建通过。
- 实际打开复核`.evidence/equipment-gems/warrior-split.png`、`mage-equipped.png`、`mage-restored.png`、`full.png`。首版拆取面板底部需滚动，已缩减留白后复核按钮和提示完整可见。目录另含两职业装备/拆取/恢复截图及真实导出JSON。

## 限制

其他材料获取和战斗结算尚未实现；验证受控数据不冒充可达渠道。背包快捷入口、约克直达拆取与面板外观是design，未复刻友好分支。装备经验百分比不会改变源固定经验球2000。构建仅有既有大包提示。
