# 戈壁第7军团源合同

## verified

独立FFDec XML/AS/P-code冻结在source-fixture.json，原文件只读。地图4536/frame33、127至131；魔军士兵选择器3860八帧，跑3841十二帧、普通3850九帧、技能3859九帧；副将3886六选择器，跑3876十二帧、攻击3885九帧；主将3912六选择器，跑3902十二帧、攻击3911八帧。各动作末帧原Action已通过独立资源与CombatSession对照验证。

五战场入口在depth44至68，不能沿用普通地图depth<22过滤。左区backPoint在depth56，390,256。上区ground2673位移y32.4，下区2671位移y2.4；其余左2669/右2667，中区和郊区2807。地面叶形状2666/2668/2670/2672/2806，背景4371/4493/4373/4495/4497/4498。军需官NPC4308标签8使用4255，而非按名称猜造新图片。

郊区任务进行且未完成触发5秒warning；encounter设置下一图左区entry2并gotoAndStop后设置left=false、其余四旗true。原初始五旗都是false，故首次左区无敌人；左区设置oldCity=homeCity、homeCity=nowMap。副将死亡后当前旗false；主将死亡后五旗false，但不会强行杀掉同图尚存士兵。重入依旗决定是否重新生成。

普通四区士兵35/base0，右区士兵30/base0；先生成四只，再用35/base5将领覆盖monster1，总共四只。副将fire0+35*2、jook25，主将fire5+35*2、jook35。士兵生命51*3*level，将领51*12*40；原数值和15次随机顺序已执行原initMonster独立断言。

士兵仅普通dropItem，没有鹿角兽额外行踪或刷头目预警。副将仅头目dropItem，没有声望或dropSoul；主将声望1、头目dropItem、dropSoul10%，不递增全局bossLevels。击杀在奖励分支前按实名与“怪物”计数。

接应国王mainTask8实际levels1、need魔军主将1，完成即推进mainTask9进入沼泽，不必先领奖。逆序奖励为超级经验球、接荣誉任务确认、功勋1000、军功1000、资源100000。setHonorTask接受后荣誉任务重置100怪计数，拒绝设置isDoing=false；普通getPrize不允许荣誉远程领奖，提示前往国王。军需官51菜单52药店/53 reLife/54 oldCity backPoint；reLife补满人物生命魔力和三个已打开出征幻兽生命。

## design / 范围

保留现有15Hz逻辑与暂停、保存部分战斗/预警；读档不重放奖励或入场副作用。五旗关掉不抹除当前活怪，离图/重入按原旗重建。原来不同城市均可作为oldCity；本次仅允许已经开放的卡萨诺城二/树心城，未知原字段继续保留，不强制回卡萨诺。原root frame9保存1593–1596/恢复2073–2075仅包含nowMap/homeCity/oldCity，不保存五旗或nowRegion。五旗/部分战斗/预警属于现代extension设计，不能伪造原raw键。地图、oldCity和主线/荣誉原有字段同步raw；荣誉为dailyTask11、计数键need_number，仅进行中同步，后续城市服务未开放。

源oracle、53张独立PNG、六图碰撞、自然战斗及受控边界证据见validation.md；审查与修复见review.md。
