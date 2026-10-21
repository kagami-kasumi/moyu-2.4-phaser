import type {Item} from './npc-reward.ts';
import {ITEM_REFINEMENT_RULES} from '../content/item-numeric-rules.ts';
import {qualityName} from './equipment-quality.ts';
export const RING_MATERIALS=['灵魂晶石','灵魂王',...Object.keys(ITEM_REFINEMENT_RULES.ringMagic)];
export const RING_FIELD_LABELS:Record<string,string>={attack:'攻击',reduceDamage:'减伤害',defense:'防御',maxLife:'生命上限',maxMp:'魔力上限',otherFire:'战斗力',burst:'暴击',jook:'闪避',moreAttack:'攻击加成',moreDefense:'防御加成',moreLife:'生命加成',moreMp:'魔力加成'};
export function ringActiveFields(item:Item){return ['mainType1','mainType2',...Array.from({length:Math.max(0,Math.min(4,Number(item.grade)))},(_,i)=>'pairType'+(i+1))].map(k=>String(item[k]));}
export function ringPlan(item:Item|null,stone:Item|null){
 const fail=(reason:string)=>({ok:false,cost:0,quality:false,field:'',amount:0,shortage:false,reason});
 if(item?.type!=='戒指'||stone?.type!=='宝石'||!RING_MATERIALS.includes(stone.name??''))return fail('请选择戒指和戒指打造材料。');
 const grade=Number(item.grade),mhdj=Number(item.mhdj);
 if(!Number.isInteger(grade)||grade<0||grade>4||!Number.isInteger(mhdj)||mhdj<0)return fail('戒指参数无效。');
 const quality=stone.name==='灵魂晶石'||stone.name==='灵魂王';
 if(quality&&grade===4)return fail('戒指品质已达极品。');
 if(!quality&&mhdj>=10)return fail('戒指精炼已达共享上限10级。');
 const cost=stone.name==='灵魂晶石'?ITEM_REFINEMENT_RULES.gradeMaterials[grade]!:1;
 const shortage=Number(stone.number??0)>0?Number(stone.number)<cost:cost!==1;
 const pair=ITEM_REFINEMENT_RULES.ringMagic[stone.name as keyof typeof ITEM_REFINEMENT_RULES.ringMagic];
 const field=pair?.[0]??'',amount=pair?.[1]??0;
 if(!quality&&!Number.isFinite(item[field]))return fail('戒指属性字段无效。');
 const active=ringActiveFields(item).includes(field);
 return {ok:!shortage,cost,quality,field,amount,shortage,reason:shortage?`材料不足：需要${cost}个${stone.name}。`:quality?`${qualityName(grade)} → ${qualityName(grade+1)}，消耗${cost}个${stone.name}。`:`精炼 ${mhdj} → ${mhdj+1} / 10，${RING_FIELD_LABELS[field]} +${amount}。${active?'当前已激活。':'该字段未激活，当前人物属性不变。'}`};
}
