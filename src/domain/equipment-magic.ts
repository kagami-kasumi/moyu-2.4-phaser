import type {Item} from './npc-reward.ts';
import {MAGIC_REFINEMENT as rules} from '../content/implemented-gameplay-rules.ts';
export const MAGIC_STONES=['魔魂晶石','魔魂之心'] as const;
export function magicPlan(item:Item|null,stone:Item|null){
 if(!item||!['武器','衣服','头盔','鞋'].includes(item.type)||stone?.type!=='宝石'||!MAGIC_STONES.some(n=>n===stone.name))return {ok:false,cost:0,reason:'请选择四类装备和魔魂晶石或魔魂之心。'};
 const level=Number(item.mhdj??0),grade=Number(item.grade??0),crystal=stone.name==='魔魂晶石';
 const cap=crystal?rules.crystalMaximum:rules.heartMaximum[grade as 5|6]??rules.crystalMaximum,cost=crystal?(level+1)*rules.crystalCostMultiplier:1;
 if(level>=cap)return {ok:false,cost,reason:`已达当前材料与品质的魔魂上限 +${cap}。`};
 if((stone.number??0)>0?stone.number!<cost:cost!==1)return {ok:false,cost,reason:`材料不足：需要${cost}个${stone.name}。`};
 return {ok:true,cost,reason:`魔魂 +${level} → +${level+1}，消耗${cost}个${stone.name}。`};
}

