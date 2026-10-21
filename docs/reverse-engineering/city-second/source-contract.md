# 城二源合同

verified：4536/frame9 entry2→城二entry1，frame10 entry1→城一entry2。独立FFDec XML冻结完整frame10显示列表，2803→2802行走轮廓，背景4328；城二落点(42,411.6)，城一返回点(542,411.6)。所有入口仍受角色命中、visible、alpha和目标一致性约束，非法目标先拒绝再更改领域状态。

verified：frame10四个appear为指挥官(265,285)、军团管理员(130,320)、城堡管理员(390,300)、挑战者(510,350)。npcPic4308标签1/48/19/17分别对应4255/4285/4261/4259；npc01/npc04的实例Y缩放为65512/65536。4312 cmd151提供仓库cmd153，153关闭对话后打开仓库及背包，无条件费用或军团身份门槛。

verified：frame9令homeCity为城二，frame10令homeCity为nowMap；地图安全，播放back.mp3。frame10随机条件严格为Math.random()<0.05且getTimer()-intoTime>300000，读档初始化intoTime=getTimer()；新游戏初始化intoTime=-10000000（069补证），成功先更新intoTime再转幻境entry1。随后若卡萨诺城获得幻境!=true，createThing({type:'卡萨诺幻境'})并置true。源工厂默认number=1、salePrice=280，既有createThing/store规则负责满包掉落；不因满包撤销一次性标记。

design：尚未实现随机幻境进入，保留上述完整源条件但不执行随机传送、不伪更新其计时。幻境道具保留并明确显示未开放；沼泽、皇宫、城三入口拒绝，指挥官/城堡/挑战者服务显示未开放。军团管理员直接打开仓库与背包，现代省略仅导航用途的151菜单；不开放军团/战斗/打包按钮。音乐尚无运行时播放器，不声称复现原音轨。

design：cityVisit拥有homeCity与mirageGranted，并映射原map_homeCity/map_卡萨诺城获得幻境；旧档缺少现代字段时从raw推广，未知地区homeCity按字符串保留。恢复坐标仅恢复状态，不重跑地图奖励；换图后处理首次奖励且只发一次。complete继续表示曾到达城一。

独立证据：source-fixture.json来自既存FFDec source.xml；source-functions.json冻结AS/P-code哈希、源函数与脚本。baseline五图由FFDec单独导出；check-city-second从只读SWF临时重建，与XML轮廓/矩阵/Action及FFDec像素比较，运行时仅消费正式资源。
