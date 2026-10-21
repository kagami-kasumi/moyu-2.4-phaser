# TASK-SHOP-074验证

- `tests/gobi-pet-merchant.test.mjs`：200组双职业/金额/容量的原菜单命令和原工厂对照通过；五卡全部孵化、满幻兽栏不消耗、恢复及旧回调、shop状态隔离通过。
- `.evidence/gobi-pet-merchant-browser.log`：7 passed，包括073四项相邻边界、两职业自然五卡购买孵化出征与刷新文件导入、一项受控不足资金/满背包地面拾取/满幻兽栏重试。
- 视觉发现已有save-message遮盖新商人标题，加入打开商人时隐藏提示的CSS。最终构建见`.evidence/gobi-pet-merchant-build-final.log`；重跑专项`.evidence/gobi-pet-merchant-browser-final.log`：3 passed。已查看warrior-merchant.png，五项价格/标题/关闭按钮清晰，无遮挡。
- `.evidence/gobi-pet-merchant-save.log`：check:save 14项通过；`.evidence/gobi-pet-merchant-types.log`类型检查退出0；`.evidence/gobi-pet-merchant-harness.log`通过。
- 自然输入是073实际`*-home.json`，没有购买/孵化探针；输出`.evidence/gobi-pet-merchant/{warrior,mage}-home.json`包含五只新幻兽和真实出征状态。边界夹具明确标controlled。
- 完整npm test退出0，见`.evidence/gobi-pet-merchant-unit.log`。本轮累计完成2/3。

不包含35/45星商人、NPC关系/装备师服务，也不表示全游戏完成。
