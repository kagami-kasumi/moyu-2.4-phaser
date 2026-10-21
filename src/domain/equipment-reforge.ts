import type {Item} from './npc-reward.ts';
import {ITEM_REFINEMENT_RULES} from '../content/item-numeric-rules.ts';
import {qualityName} from './equipment-quality.ts';
export const REFORGE_MATERIALS=['灵魂王','神力宝石'];
export function reforgePlan(item:Item|null,stone:Item|null,credit:number){
 const fail=(reason:string)=>({ok:false,cost:0,credit:0,reset:false,messages:[] as string[],reason});
 if(!item||!['武器','衣服','头盔','鞋'].includes(item.type)||stone?.type!=='宝石'||!REFORGE_MATERIALS.includes(stone.name??''))return fail('请选择四类装备和灵魂王或神力宝石；神力宝石可在5级杂货商购买。');
 if(stone.name==='神力宝石')return {...fail('消耗1个神力宝石，将使用等级重置为1；已有元素、魔魂和孔保留。'),ok:true,cost:1,reset:true};
 const grade=Number(item.grade);
 if(!Number.isInteger(grade)||grade<0||grade>=6)return fail('灵魂王最高提升至上神品。');
 const high=grade>=4?ITEM_REFINEMENT_RULES.gradeAbove4[grade as 4|5]:undefined;
 const cost:number=high?.materials??1,fee=high?.credit??0;
 if(credit<fee)return {...fail(`需要消耗${fee}点声望。`),cost,credit:fee,messages:[`需要消耗${fee}点声望。`]};
 if(Number(stone.number)>0?Number(stone.number)<cost:cost!==1)return {...fail(`材料不足：需要${cost}个灵魂王。`),cost,credit:fee,messages:[...(Number(stone.number)>0?['宝石数量不足！']:[]),...(grade>=4?[`需要${cost}个宝石。`]:[])]};
 return {ok:true,cost,credit:fee,reset:false,messages:grade===4?['合成神品装备']:grade===5?['合成终极装备－－上神品装备']:[],reason:`${qualityName(grade)} → ${qualityName(grade+1)}，消耗${cost}个灵魂王、${fee}点声望。`};
}
