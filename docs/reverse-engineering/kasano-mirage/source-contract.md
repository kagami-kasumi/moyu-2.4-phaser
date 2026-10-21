# 卡萨诺幻境源合同

## verified

冻结fixture的独立XML、Action与AS/P-code共同定义4536/frame11。背景4328、地面2803/2802，与城二共享原资源；唯一传送实例entry6在(294.95,317.6)，没有entry1。原afterJumpMap读取this[nextEntry]坐标，而道具和随机入场指定entry1；死亡末怪显示entry1，frame11隐藏entry6。这些引用不一致是源事实；未运行原Flash，不猜测AVM1最终呈现坐标。

四只5级幻影龙怪，位置(60,300)/(155,380)/(320,400)/(245,290)，base0，生命51×20×5=5100；攻击/防御系数沿用2.75/2.55，attackFire=20+2×5=30，随机攻击范围与朝向按initMonster顺序。attackTypeNum2，可普通攻击和技能；沿用已独立核验的龙怪run14/attack10/skill7帧及命中活动顺序（实际技能长度以现有dragon manifest和测试为准）。

每次死亡先catch实名与怪物，再声望+1，dropItemX(0)。maxArr[0]=4，random4的0/1无奖励、2九朵玫瑰、3极品玉石。最后一只再SuperHS(20)：random100<20后random4选择蝴蝶牛/乖乖虎/嘻哈牛/玲珑虎。SuperHS未绑定fX/fY，createThing→throwGoods明确将undefined坐标回落角色位置；此回落不是新增设计。物品工厂与地面随机偏移沿用原机制。

城二每次真正进入执行Math.random()<intoV且elapsed>300000，成功先更新intoTime再跳图；随后首次赠门。intoV默认0.05、debug名0.5。frame2新建intoTime=-10000000，读档intoTime=getTimer()。其他幻境尚未启用。afterJumpMap每次清ownMap=false，因此幻境无幸运之门的资源20倍。

## design

修复缺失入口/出口：卡萨诺幻境使用真实entry6落点，四怪清空后显示entry6回城；保留源位置、目的地和四怪清空条件。存档记录四怪生命/位置，出口从当前四怪状态派生，不另存可失配布尔；恢复不重发末怪奖励。

随机进入计时是会话内活跃时长，系统暂停不累计；新建立即具备源随机资格，读档重置等待，按源严格阈值，不因恢复地图重跑抽签。纯领域未绑定随机端口时采用不触发值，网页显式绑定Math.random，源对照测试注入精确阈值。这是依赖装配，不改变网页概率。

现代界面提示剩余数量和出口解锁。原音乐未接入。六个其他幻境、自然终局装备来源、原播放器动态异常表现不随本任务关闭。
