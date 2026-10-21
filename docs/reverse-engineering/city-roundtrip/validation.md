# 城郊城内往返验证

2026-10-09：双向注册AS/P-code哈希、12次连续双向源落点和60步城内源移动对照通过。两方向隐藏/透明/远程/错误地图/错误entry和两个未开放出口拒绝；失败不修改任何progress。原首段7项领域测试保留全部几何/时钟/方向验收，仅撤销“城内不许返回”的旧范围断言。

转场清地面物品、关闭领域面板、旧商店回调拒绝；背包、装备、打造持有物、爵位、产权和两店货位保留；两地点保存恢复complete=true仍可移动和返回。typecheck、npm test与check:save通过。

两职业无probe完成勋爵产权→步行入城→杂货和药店购买→城内键盘移动→保存刷新→鼠标返回→管理员产权和老兵礼包→城郊保存→多次Q往返→真实文件导入继续；专项和旧旅程共6/6通过。全量回归及最终复验均已覆盖两地点文件各自导入。受控按键释放、repeat拒绝、面板阻断、失效购买按钮、掉落清理、未开放出口和新建验证通过。

实际查看`.evidence/city-roundtrip/`两职业city/returned/imported与unavailable截图；未开放提示和地区文字重叠已修正为有拒绝提示时只显示拒绝提示，保存的complete不变。npm run test:browser -- --workers=2为87/87通过（browser.log）；最终重新build后，往返与旧旅程6/6复验通过（final-focused.log），再次查看unavailable截图确认重叠消失。npm run check:source、typecheck、check:harness亦通过，日志在同目录。

仅开放现有两地区；本次不是野外/城二区/战斗实现。保留原始资源和既有保存格式。
