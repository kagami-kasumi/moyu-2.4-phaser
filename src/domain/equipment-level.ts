import type {Item} from './npc-reward.ts';
export const LEVEL_STONES=['幻魔晶石','幻魔之心'] as const;
/** Verified makeItem, not its outdated failure prose. No random call exists. */
export function equipmentLevelPlan(item:Item|null,stone:Item|null,maxLevel:number){
 const invalid={ok:false,cost:0,next:0,shortage:false,reason:'请选择四类装备和幻魔晶石或幻魔之心。'};
 if(!item||!['武器','衣服','头盔','鞋'].includes(item.type)||stone?.type!=='宝石'||!LEVEL_STONES.some(n=>n===stone.name))return invalid;
 const level=Number(item.levels),crystal=stone.name==='幻魔晶石';
 if(!Number.isFinite(level)||level<1||!Number.isFinite(maxLevel))return invalid;
 const next=level===1?15:level<120?level+15:level<maxLevel?level+1:0;
 if(!next)return {...invalid,reason:`装备使用等级已达人物最高等级 ${maxLevel}。`};
 const cost=crystal?(level===1?1:level):1,shortage=(stone.number??0)>0?stone.number!<cost:cost!==1;
 return {ok:!shortage,cost,next,shortage,reason:shortage?`材料不足：需要${cost}个${stone.name}。`:`使用等级 ${level} → ${next}，消耗${cost}个${stone.name}。`};
}
