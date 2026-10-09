/** Bounded consumers of registered source rules, not an availability list for new gameplay.
 * Sources: map frame1:2807–2811; frame9 useItem:1307–1358;
 * NPC command case3:213–224, case7; makeItem magic branches. */
export const WARRIOR_RATES={rateLife:15,rateMp:5,rateMinAttack:.2,rateMaxAttack:1.8,rateDefense:.3} as const;
export const ITEM_PACKS:Record<string,string>={'灵魂礼包':'灵魂晶石','幻魔礼包':'幻魔之心','魔魂礼包':'魔魂之心'};
export const PACK_QUANTITY=10;
export const MEDAL_RULES={award:100,exchangeCost:2} as const;
export const REWARD_EQUIPMENT=[{type:'武器',grade:2,mhdj:9},{type:'衣服',grade:1,mhdj:3},{type:'头盔',grade:1,mhdj:3},{type:'鞋',grade:1,mhdj:3}] as const;
export const MAGIC_REFINEMENT={crystalMaximum:19,heartMaximum:{5:38,6:50},crystalCostMultiplier:2} as const;
