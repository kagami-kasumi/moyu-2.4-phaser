# 机制索引

仅记录本作证据，不能从“再续天庭”移植机制清单。当前已有启动与单角色结构索引，未验证完整运行行为。

| 问题 | 证据等级 | 当前依据 | 后续 |
| --- | --- | --- | --- |
| 文件/VM/舞台/帧率 | verified（仅文件结构） | [源概要](../reference/source-summary.md)、[机器清单](../reference/swf-inventory.json) | TASK-RE-001 确认脚本入口 |
| 启动链与外部加载 | verified（静态调用）；运行影响 unknown | [源索引](source-index.md)：菜单/职业/游戏入口、Mochibot、4399 LocalConnection、论坛跳转 | 后续适用的运行验证；下一项离线取证未发现外部资源阻塞 |
| 可控角色、场景、输入路径 | verified（脚本和标签）；运行到达 unknown | [结构 JSON](source-index.json)：map/4536、role/3106、卡萨诺城郊区；方向键/WASD、鼠标方向和目标点击入口 | TASK-SLICE-004 补首场景运行旅程与碰撞/出口 |
| 动作、注册点、持帧、事件 | verified（源帧、矩阵、AS2语义与现代比对）；完整伤害/实际原运行 unknown | [动作合同](first-actor/action-contract.md)、[验证报告](first-actor/validation.md)：待机/跑动/斩魂，末帧标记与下次Activities分离 | 可玩切片消费现有资源，完整碰撞/伤害另取证 |
| 完整玩法系统与内容量 | unknown | 用户认为本作动作简单；未做完整盘点 | 首个切片后按需扩展 |
| 四类装备魔魂强化与品质关联上限 | verified（AS/P-code及独立源函数对照） | [魔魂源合同](equipment-magic/source-contract.md)、[验证报告](equipment-magic/validation.md) | 品质升级/等级/其他打造另按合同推进；完整原运行未知 |
| 四类装备灵魂晶石品质提升 | verified（AS/P-code及独立源函数对照） | [品质源合同](equipment-quality/source-contract.md)、[验证报告](equipment-quality/validation.md) | 灵魂王另见高阶重铸合同；幸运符分支仍待实现 |
| 五元素附加、元素石与同系套装 | verified（AS/P-code及独立完整源对照） | [源合同](equipment-elements/source-contract.md)、[验证报告](equipment-elements/validation.md) | 材料自然获取与战斗结算另属后续 |
| 四装备高阶品质与等级重置 | verified（AS/P-code及独立完整源对照） | [源合同](equipment-reforge/source-contract.md)、[验证报告](equipment-reforge/validation.md) | 神力宝石可经杂货商升级购买；灵魂王自然获取未开放 |
| 魔之魂十类参数与属性叠加 | verified（AS/P-code及独立完整源对照） | [源合同](equipment-soul/source-contract.md)、[字段归属](equipment-soul/field-ownership.md) | 魔之魂获取、玄铁附加与战魂仍另列后续 |
| 城郊资源、两地图与50级券交易 | verified（AS/P-code和2548组源oracle） | [交易合同](outskirts-trade/source-contract.md)、[验证报告](outskirts-trade/validation.md) | 通行物使用、其他地区与赛事未开放 |
| 卡萨诺城产权与爵位资格 | verified（AS/P-code和216组源oracle） | [产权合同](outskirts-property/source-contract.md)、[验证报告](outskirts-property/validation.md) | 野外战斗资源收益与其他地区产权未开放 |
| 城郊与城内双向入口和持续移动 | verified（AS/P-code、独立几何与双向oracle） | [往返合同](city-roundtrip/source-contract.md)、[验证报告](city-roundtrip/validation.md) | 城二区、野外与战斗未开放 |
| 杂货商四阶段升级与独立领奖 | verified（AS/P-code、完整四任务与源oracle） | [升级合同](shop-upgrades/source-contract.md)、[验证](shop-upgrades/validation.md) | 其他商人和社交仍未开放 |
| 四高级宝石与三圣石融合 | verified（AS/P-code、9450组有序组合源oracle） | [融合合同](gem-fusion/source-contract.md)、[验证](gem-fusion/validation.md) | 现代背包入口为design，城堡经营未开放 |
| 54格仓库存取、堆叠余量与旧档保管 | verified（AS/P-code、432组源oracle） | [仓库合同](warehouse/source-contract.md)、[验证](warehouse/validation.md) | 现代背包入口为design，原军团管理员入口另排 |

| 幻兽全物种属性/评分与世代基准 | verified（完整原类21600组合；明文舍入差异为design） | [属性合同](pet-details/source-contract.md)、[验证](pet-details/validation.md) | 无战斗或出征操作 |
| 全固定变体与随机奇迹龙孵化 | verified（原useItem和构造独立对照） | [孵化合同](pet-hatching/source-contract.md)、[验证](pet-hatching/validation.md) | 不等于成长/幻化开放 |
| 幻兽收藏排序、分页与身份释放 | verified（原排序/显示/删除对照；稳定排序和出征保护为design） | [收藏合同](pet-collection/source-contract.md)、[验证](pet-collection/validation.md) | 出征召回仍未开放 |

后续每行链接正式证据与其未决项，不在这里重复一份数值、坐标或任务状态。实现状态统一见 [调度状态](../tasks/state.json)。

## 幻兽活动槽、恢复与铃铛

- [出征成长](pet-progression/source-contract.md)：两槽默认/第三槽旧档、对象身份、普通经验球与顿悟；原生随行标识为design。
- [治疗复活](pet-recovery/source-contract.md)：指定药品整格消费、生命储备、管理员免费恢复人物与活动幻兽。
- [三槽铃铛](pet-bells/source-contract.md)：装备属于活动槽，属性与战斗力、换兽留槽、卸下生命钳制及未知旧档保留。

铃铛双槽融合：verified，见[源合同](bell-fusion/source-contract.md)和[验证](bell-fusion/validation.md)；技能仅保存展示。

幻兽十进阶道具及代际进化：verified，见[源合同](pet-advancement/source-contract.md)、[验证](pet-advancement/validation.md)。

幻化师转世丹三配方：verified，见[源合同](pet-pill-crafting/source-contract.md)、[验证](pet-pill-crafting/validation.md)；自然灵魂王来源未开放。

主属性幻化（2356，TASK-PET-055）：[源合同](pet-main-fusion/source-contract.md)，含副兽身份删除、成长率、经验恢复和原NaN边界。

转世幻化（2344，TASK-PET-056）：[源合同](pet-rebirth-fusion/source-contract.md)，包括自动经验球在失败前消费。
幻兽评称（2327，TASK-PET-057）：[源合同](pet-titles/source-contract.md)，包括25种原序名额及旧档未知保留。

元帅爵位与军衔任务（067）：[源合同](marshal-quests/source-contract.md)，支线优先消费击杀，逆序发奖、功绩晋升与旧档限制见[验证](marshal-quests/validation.md)。

幸运之门（068）：[源合同](lucky-gate/source-contract.md)、[验证](lucky-gate/validation.md)，含30轮与高阶受控验收边界。

卡萨诺幻境（069）：[源合同](kasano-mirage/source-contract.md)，包含四怪奖励、随机进入、原入口缺失及明确现代修复。

边关野外与三头目（085）：[源合同](border-field/source-contract.md)，含独立bossLevels5、提风技能、剌虫人行踪及五地图存档。

冰宫城市与幻境（088）：[源合同](ice-palace-city/source-contract.md)，含四只125级幻影死神战将、13分支掉落、首赠/入侵、神兽药水消费与冰宫回城。

黑渊入口与第2军团（089）：[源合同](black-abyss-battle/source-contract.md)，含六地图、90/92/95生成、任务13/14与转世计数、六军团存取隔离。

黑渊野外（090）：[源合同](black-abyss-field/source-contract.md)，含混合精英、预警覆盖、独立bossLevels8、暗黑格拉斯10帧技能和原行踪。
