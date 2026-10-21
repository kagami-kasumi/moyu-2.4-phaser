import type {Item} from './npc-reward.ts';
import {ITEM_REFINEMENT_RULES} from '../content/item-numeric-rules.ts';
export const ELEMENT_NAMES=['无','风','火','水','地','雷'];
export const ELEMENT_MATERIALS=[...Object.keys(ITEM_REFINEMENT_RULES.elements),'小元素石','大元素石'];
export const ELEMENT_FIELDS=['fire','wind','soil','water'] as const;
export function elementPlan(item:Item|null,stone:Item|null,credit:number){
 const fail=(reason:string)=>({ok:false,element:0,cost:0,reason});
 if(!item||!['武器','衣服','头盔','鞋'].includes(item.type)||stone?.type!=='宝石'||!ELEMENT_MATERIALS.includes(stone.name??''))return fail('请选择四类装备和元素材料；尚未放入元素材料。');
 const element=ITEM_REFINEMENT_RULES.elements[stone.name as keyof typeof ITEM_REFINEMENT_RULES.elements]??0;
 if(element){
  if(item.element!==0)return fail('装备已有元素，不能再次附加。');
  const cost=ITEM_REFINEMENT_RULES.elementCredit[element]!;
  return {ok:credit>=cost,element,cost,reason:credit>=cost?`附加${ELEMENT_NAMES[element]}元素，消耗${cost}点声望和1个材料。`:`需要消耗${cost}点声望。`};
 }
 if(Number(item.grade)<4)return fail('元素石需要极品或更高品质。');
 if(ELEMENT_FIELDS.some(k=>Number(item[k])>=Number(item.levels)))return fail('四项元素数值都必须低于装备等级。');
 return {ok:true,element:0,cost:0,reason:stone.name==='小元素石'?'随机一项元素数值 +1。':'四项元素数值各 +1。'};
}
export function elementBonuses(items:readonly (Item|null)[]){
 const out={elementSet:0,elementFire:0,wind:0,fire:0,water:0,soil:0,burst:0,jook:0,moreAttack:0,moreDefense:0,moreLife:0,moreMp:0};
 for(const item of items){if(!item)continue;const e=Number(item.element);out.elementFire+=e===5?2:e>=1&&e<=4?1:0;for(const k of ELEMENT_FIELDS)out[k]+=Number(item[k]??0);}
 const e=Number(items[0]?.element??0);if(items.length===4&&e>0&&items.every(i=>Number(i?.element)===e))out.elementSet=e;
 switch(out.elementSet){case 1:out.jook=15;break;case 2:out.moreAttack=30;break;case 3:out.burst=15;break;case 4:out.moreDefense=50;break;case 5:Object.assign(out,{jook:10,burst:10,moreAttack:25,moreDefense:40,moreLife:30,moreMp:30});}
 return out;
}
