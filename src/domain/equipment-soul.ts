import type {Item} from './npc-reward.ts';
export const SOUL_MATERIAL='魔之魂';
export const SOUL_FIELDS=['','attack','defense','maxLife','maxMp','moreAttack','moreDefense','moreLife','moreMp','burst','jook'] as const;
export const SOUL_LABELS=['仅战斗力','攻击','防御','生命上限','魔力上限','攻击加成','防御加成','生命加成','魔力加成','暴击','闪避'];
export function hasSoul(item:Item){return !Number.isNaN(Number(item.val1))&&!Number.isNaN(Number(item.val2));}
export function soulDescription(item:Item){return hasSoul(item)?`魔之魂：${SOUL_LABELS[Number(item.val1)]??'未识别属性'} ${item.val2}${Number(item.val1)>=5&&Number(item.val1)<=10?'%':''} · 战斗力 +5`:'魔之魂：无';}
export function soulPlan(item:Item|null,stone:Item|null){
 if(!item||!['武器','衣服','头盔','鞋'].includes(item.type)||stone?.type!=='宝石'||stone.name!==SOUL_MATERIAL)return {ok:false,reason:'请选择四类装备和魔之魂；野外一的龙怪头目有机会掉落魔之魂。'};
 const effective=hasSoul(stone)?stone:{val1:1,val2:1,type:stone.type};
 return {ok:true,reason:`${soulDescription(effective)}。消耗1个材料，覆盖装备原有魔之魂。`};
}
export function soulBonuses(items:readonly (Item|null)[]){
 const out={soulFire:0,attack:0,defense:0,maxLife:0,maxMp:0,moreAttack:0,moreDefense:0,moreLife:0,moreMp:0,burst:0,jook:0};
 for(const item of items){if(!item||!hasSoul(item))continue;out.soulFire+=5;const kind=item.val1;if(typeof kind==='number'&&Number.isInteger(kind)&&kind>=1&&kind<=10){const key=SOUL_FIELDS[kind]! as Exclude<typeof SOUL_FIELDS[number],''>;out[key]+=Number(item.val2);}}
 return out;
}
