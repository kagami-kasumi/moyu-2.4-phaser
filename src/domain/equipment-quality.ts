import type {Item} from './npc-reward.ts';
import {ITEM_REFINEMENT_RULES} from '../content/item-numeric-rules.ts';
/** Grade 0 has an empty source label; “普通” is the modern display label. */
export const QUALITY_NAMES=['普通','良品','上品','精品','极品','神品','上神品'] as const;
export const qualityName=(grade:unknown)=>QUALITY_NAMES[Number(grade)]??'未知品质';
export const QUALITY_STONE='灵魂晶石';
export function qualityPlan(item:Item|null,stone:Item|null){
 if(!item||!['武器','衣服','头盔','鞋'].includes(item.type)||stone?.type!=='宝石'||stone.name!==QUALITY_STONE)return {ok:false,cost:0,shortage:false,reason:'请选择四类装备和灵魂晶石。'};
 const grade=Number(item.grade??0);
 if(!Number.isInteger(grade)||grade<0||grade>=4)return {ok:false,cost:0,shortage:false,reason:'灵魂晶石最高提升至极品，当前品质无法继续提升。'};
 const cost=ITEM_REFINEMENT_RULES.gradeMaterials[grade]!;
 if(Number(stone.number??0)<cost)return {ok:false,cost,shortage:Number(stone.number??0)>0,reason:`材料不足：需要${cost}个灵魂晶石。`};
 return {ok:true,cost,shortage:false,reason:`${qualityName(grade)} → ${qualityName(grade+1)}，消耗${cost}个灵魂晶石。`};
}
