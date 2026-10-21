# TASK-WORLD-087 验证记录

独立源基准：check:ice-palace-battle通过六地图、三类魔军20选择器/7动画、XML/Action/AS/P-code。55张自制转换与独立FFDec PNG像素比对通过；冰柱4314直接使用独立提取原图并仅验证完整性，未把同源比对写成转换证明。基准完整56张。

原函数oracle逐字段核对80/82/85级五区所有生成及15随机、中区副将例外、完整掉落/工厂/消费、任务12/13计数/逆序奖励/封顶/满包。独立光栅碰撞及领域覆盖各区部分存取、五军团oldCity、入口拒绝原子性、共享库存15、完成后重复郊区往返、死亡/幸运/军需官、非法混合档和旧回调。完整npm test通过557项、0失败、退出0（.evidence/ice-palace-full-logic.log）；本包18项全通过。

最终typecheck/build通过，构建保留既有大chunk提示；check:save14项、check:source、086和085资源回归通过。日志分别为.evidence/ice-palace-typecheck-final.log、ice-palace-build-final.log、ice-palace-save.log、ice-palace-source-check.log、ice-palace-adjacent-assets.log、ice-palace-assets-final.log。

实际浏览器第一轮5项通过（6.7分钟，.evidence/ice-palace-browser.log）：受控五区视觉/部分导入47.9秒，暂停/死亡/军需官/幸运19.7秒，满包领奖腾位拾取与使用12.3秒；战士与法师各2.6分钟，从086真实home档经走廊/郊区预警入场，以实际方向键和F完成四个有敌人区，遍历全部五区、部分导入、领奖和经验球消费、回边关、刷新及真实文件恢复。实际页面无journeyProbe，领域kill只用于明确标记的受控边界。

两职业继承086受控高阶装备/队伍；不冒充自然成长。经验球已达150次上限，实际物品消耗且上限保留，不能宣称额外经验增益。功勋原38500上限保留、军功增加2000，两职业资源均完整增加200000。已查看战士郊区冰柱/NPC及主将区清场截图；军团与任务提示正确。

最终构建的消费/商人提示/085与086相邻回归9项全部通过，退出0（5.5分钟，.evidence/ice-palace-rewards-adjacent-final.log）。边关宝箱26.4秒，086五图35.9秒/暂停死亡17.8秒/满包11.5秒，087五图35.4秒/暂停死亡17.8秒/商人提示6.3秒；两职业各1.5分钟实际往返既有交易处、出售200000资源增加1700魔石、回边关、刷新和文件导入。已查看merchant-stock.png确认库存15和专属购买范围提示。最终home.json为消费后的真实导出，供088承接。harness生成与检查通过后关闭087。
