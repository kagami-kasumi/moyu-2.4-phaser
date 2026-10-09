import {EQUIPMENT_RULES as rules} from './equipment-rules.ts';
import {RING_RULES} from './ring-rules.ts';
export type RuleItem={type:string;name?:string;vocational?:string;[key:string]:string|number|undefined};
/** Source upDataWeapon with explicit missing-value behavior. Mutates numeric fields
 * only. The registered equipment family supplies the display name in DATA-020. */
export function refreshItemNumbers(item:RuleItem):boolean {
 const n=(key:string)=>item[key] as number;
 if(item.type==='幸运符'){
  const value=n('luckLevels')+n('isFirstLove')+1;
  for(const [field,grade,multiplier] of [['moreExp',0,10],['moreLife',1,1],['moreMp',1,1],['moreDefense',2,1],['moreAttack',3,1],['resumeLife',4,1]] as const)item[field]=value*multiplier*Number(n('grade')>=grade);
  return true;
 }
 if(item.type==='戒指'){
  for(const selector of ['mainType1','mainType2']){const field=item[selector] as keyof typeof RING_RULES.mainValue;item[field]=RING_RULES.mainValue[field]?.[n('grade')]/(item.name==='新手戒指'?5:1);}
  item.salePrice=10;return true;
 }
 if(['凤翼铃铛','翡翠铃铛','庇护铃铛'].includes(item.type)){
  for(let i=1;i<=3;i++){if(n('grade')-i< -1)break;const coefficient=({1:5,2:3,3:4} as Record<number,number>)[n('attributeType'+i)];if(coefficient!==undefined)item['attributeVal'+i]=(n('grade')+2-i)*coefficient;}
  item.salePrice=(n('grade')+1)*100;return true;
 }
 if(!['头盔','衣服','武器','鞋'].includes(item.type))return false;
 for(const field of ['levels','grade','mhdj','minAttack','maxAttack','mMinAttack','mMaxAttack','defense','mDefense','element','wind','fire','soil','water','holes','additional'])if(item[field]===undefined)item[field]=field==='levels'?1:0;
 for(let i=1;i<=3;i++)if(item['hole'+i]===undefined){item['hole'+i]=0;item['gem'+i]=0;item['gem'+(10+i)]=0;}
 if(item.spirit===undefined){item.spirit=0;item.spiritVal=0;item.spiritLevels=0;item.spiritExp=0;}
 const profession=item.vocational==='战士'?'战士':'法师',rates=rules.professions[profession],base=n('levels')*1.5+5;
 if(item.type==='武器'||item.type==='鞋'){
  const rate=item.type==='武器'?rates.weapon:rates.shoes;const total=base*(rate[0]+n('grade')*rate[1]);
  item.minAttack=Math.round(total*rates.minimumAttackShare);item.maxAttack=Math.round(total*(1-rates.minimumAttackShare));
  item.mMinAttack=Math.ceil(n('mhdj')*n('minAttack')/20);item.mMaxAttack=Math.ceil(n('mhdj')*n('maxAttack')/20);
 }else{const rate=item.type==='衣服'?rates.clothe:rates.helmet;item.defense=Math.round(base*(rate[0]+n('grade')*rate[1]));item.mDefense=Math.ceil(n('mhdj')*n('defense')/20);}
 for(const [field,element] of rules.elementFields){const desired=n('element')===5?rules.elementPower[n('grade')]/2:n('element')===element?rules.elementPower[n('grade')]:0;item[field]=n(field)<=desired?desired:n(field);}
 item.salePrice=(rules.price.grade[n('grade')]??0)+([1,2,3,4].includes(n('element'))?500:n('element')===5?2000:0)+(rules.price.holes[n('holes')]??0)+n('levels')*4+(Number.isNaN(n('mhdj'))?0:n('mhdj')*10);
 return true;
}
export function itemSaleValue(price:number,quantity=1){return Math.floor(price/2)*(quantity<=0?1:quantity);}
/** The source advances at most once, discards overflow and does not reject NaN. */
export function advanceItemSpirit(item:RuleItem,gain=1):false|undefined {
 if(item.spirit===0||Number(item.spiritLevels)>=8)return false;
 if(['头盔','衣服','武器','鞋'].includes(item.type)){
  item.spiritExp=Number(item.spiritExp)+gain;
  if(item.spiritExp>=(Number(item.spiritLevels)+1)*10){
   item.spiritExp=0;
   if(Number(item.spiritLevels)<7){item.spiritLevels=Number(item.spiritLevels)+1;if([1,4,5].includes(Number(item.spirit)))item.spiritVal=Number(item.spiritVal)+1;else if([2,3].includes(Number(item.spirit)))item.spiritVal=Number(item.spiritVal)+2;}
   else{item.spiritLevels=8;const final=({1:10,2:20,3:20,4:8,5:8} as Record<number,number>)[Number(item.spirit)];if(final!==undefined)item.spiritVal=final;}
  }
 }
}
export const ITEM_REFINEMENT_RULES={
 gradeMaterials:[2,4,8,16,32,64,128,256],ringMagicMaximum:10,
 ringMagic:{高级攻击宝石:['attack',10],高级减伤害宝石:['reduceDamage',1],高级经验宝石:['defense',4],幻魔之心:['maxLife',80],魔魂之心:['maxMp',80],高级战斗力宝石:['otherFire',1],玄铁矿:['burst',2],紫水晶:['jook',2]},
 gradeAbove4:{4:{materials:5,credit:20},5:{materials:10,credit:50}},
 level:{initial:1,first:15,step:15,stepBoundary:120,highStep:1,cap:'role.maxLevels',crystalCost:'old level except level 1 costs default one',heartCost:1},
 elements:{风元素:1,火元素:2,水元素:3,地元素:4,雷元素:5},elementCredit:[0,10,10,10,10,25],
 elementStone:{minimumGrade:4,guard:'all four element values strictly below item.levels',small:'one random(4) field +1',large:'all four +1'},
 fusion:{高级战斗力宝石:{limit:15,step:1,freeBelow:8,credit:'old val1 - 6'},高级攻击宝石:{limit:25,step:2},高级减伤害宝石:{limit:13,step:1},高级经验宝石:{limit:35,step:2}},
 anomalies:['level 119 becomes 134; limit checked before increment','heart upgrades write before unchecked useGem','陨铁矿 consumes material before rejecting additional=0','additional equipment bonus references missing thisallItem','gradeSuccess is a material-count table, not a probability table'],
} as const;
