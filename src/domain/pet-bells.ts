import type {Item} from './npc-reward.ts';
export const BELL_TYPES=['庇护铃铛','翡翠铃铛','凤翼铃铛'];
export function supportedBell(item:Item){
 if(Number(item.number??0)>0||!BELL_TYPES.includes(item.type)||!Number.isInteger(item.grade)||Number(item.grade)<0||Number(item.grade)>4)return false;
 for(let n=1;n<=3;n++){const type=item['attributeType'+n]??0,val=item['attributeVal'+n]??0;if(!Number.isInteger(type)||Number(type)<0||Number(type)>3||typeof val!=='number'||!Number.isFinite(val)||val<0)return false;}
 return true;
}
export function bellBonuses(item:Item|null|undefined){
 const bonus=[0,0,0,0];if(!item)return bonus;if(!supportedBell(item))return null;
 for(let n=1;n<=3;n++){if(Number(item.grade)-n< -1)break;const v=Number(item['attributeVal'+n]??0);switch(item['attributeType'+n]){case 1:bonus[3]!+=v;break;case 2:bonus[1]!+=v;bonus[2]!+=v;break;case 3:bonus[0]!+=v;}}
 return bonus;
}
