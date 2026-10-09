import {CHARACTERS} from '../content/character-entry.ts';
import {literalItem,contentNamed} from '../content/registry.ts';
import {ITEM_PACKS as packs,PACK_QUANTITY,MEDAL_RULES} from '../content/implemented-gameplay-rules.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
import {passiveSkillValue} from '../content/role-skill-rules.ts';
import {roleAttributes} from '../content/role-attribute-rules.ts';
import {QUALITY_STONE} from './equipment-quality.ts';
import {NpcReward,type Item} from './npc-reward.ts';
import type {Vitals} from './hud.ts';
import {ITEM_PETS} from '../content/item-pets.ts';
import {SOCKET_BOXES} from './equipment-sockets.ts';
import {MAGIC_STONES} from './equipment-magic.ts';
export const EQUIPMENT_SLOTS=['头盔','衣服','武器','鞋','戒指'] as const;
export type EquipmentSlot=typeof EQUIPMENT_SLOTS[number];
const number=(i:Item,k:string)=>Number(i[k]??0);
const money=['小魔石袋子','中魔石袋子','大魔石袋子','富豪礼包'];
export class Inventory {
 equipment:Record<EquipmentSlot,Item|null>={头盔:null,衣服:null,武器:null,鞋:null,戒指:null};
 bravery=0;exploit=0;militaryExploit=0;
 constructor(readonly reward:NpcReward,readonly vitals:Vitals){}
 action(item:Item){if(EQUIPMENT_SLOTS.includes(item.type as EquipmentSlot))return '装备';if(ITEM_PETS[item.type])return '孵化';if(item.type==='技能书'&&item.name==='英勇')return '学习';if(packs[item.type]||money.includes(item.type)||item.type==='勇士勋章')return '使用';return null;}
 unavailable(item:Item){return item.type==='宝石'&&item.name===QUALITY_STONE?'请点击背包上方的品质提升，选择装备和灵魂晶石':item.type==='宝石'&&MAGIC_STONES.some(name=>name===item.name)?'请点击背包上方的“魔魂强化”，选择装备和材料':item.type==='宝石'&&SOCKET_BOXES.some(name=>name===item.name)?'请点击背包上方的“装备开孔”，选择装备和宝盒':item.type==='经验球'?'经验球分配尚未开放':item.type==='宝石'||item.type.includes('内丹')||item.type==='极品玉石'?'此物品用于打造或培养，相关系统尚未开放':item.type==='英雄令'?'英雄令需要对应任务，任务系统尚未开放':'此物品对应的功能尚未开放';}
 private message(text:string){this.reward.messages.push(text);}
 private consume(index:number){const item=this.reward.bag[index]!;item.number=number(item,'number')-1;if(item.number<=0)this.reward.bag[index]=null;}
 use(index:number,expected:Item|null,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  const item=this.reward.bag[index];if(!item||item!==expected)return false;
  const action=this.action(item);if(!action){this.message(this.unavailable(item));return false;}
  if(action==='装备'){
   if(item.type!=='戒指'&&(number(item,'levels')>this.vitals.level||item.vocational!==this.reward.profession)){this.message('装备的职业或等级不符合');return false;}
   const slot=item.type as EquipmentSlot,old=this.equipment[slot],drops=this.reward.drops.length;if(old)this.reward.store(old,position,contains);
   this.equipment[slot]={...item};this.reward.bag[index]=null;this.refresh();this.message('已装备 '+(item.name??item.type)+(this.reward.drops.length>drops?'；背包已满，旧装备掉落在地上了':''));return true;
  }
  if(action==='孵化'){
   if(this.reward.pets.length>=this.reward.petCapacity){this.message('幻兽背包已经满了。');return false;}
   this.reward.pets.push({...ITEM_PETS[item.type]!,battle:false});this.consume(index);this.message('已孵化 '+item.type+'，可在幻兽记录中查看');return true;
  }
  if(action==='学习'){
   if(item.vocational!=='公共'&&item.vocational!==this.reward.profession){this.message('职业不符合。');return false;}
   if(number(item,'levels')>this.vitals.level){this.message('等级不够，无法学习技能。');return false;}
   if(this.bravery>=Number(contentNamed('skill','英勇')[0]!.data.maxLevels)){this.message('英勇已经达到最高等级');return false;}
   this.bravery++;this.reward.bag[index]=null;this.refresh();this.message('英勇提升至 '+this.bravery+' 级');return true;
  }
  if(money.includes(item.type)){this.reward.ms+=number(item,'salePrice');this.consume(index);this.message('获得'+number(item,'salePrice')+'魔石');return true;}
  if(item.type==='勇士勋章'){this.exploit=Math.min(MERIT_RULES.nobility.cap,this.exploit+MEDAL_RULES.award);this.militaryExploit=Math.min(MERIT_RULES.military.cap,this.militaryExploit+MEDAL_RULES.award);this.consume(index);this.refresh();this.message('功勋 '+this.exploit+' · 军功 '+this.militaryExploit);return true;}
  const name=packs[item.type]!;const drops=this.reward.drops.length;
  for(let i=0;i<PACK_QUANTITY;i++)this.reward.store(literalItem(name),position,contains);
  this.consume(index);this.message('获得 '+name+' ×'+PACK_QUANTITY+(this.reward.drops.length>drops?'；背包已满，部分物品掉落在地上了':''));return true;
 }
 unequip(slot:EquipmentSlot,expected:Item|null,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){const item=this.equipment[slot];if(!item||item!==expected)return false;const drops=this.reward.drops.length;this.reward.store(item,position,contains);this.equipment[slot]=null;this.refresh();this.message('已卸下 '+(item.name??slot)+(this.reward.drops.length>drops?'；背包已满，物品掉落在地上了':''));return true;}
 stats(){
  const bonus:Record<string,number>={minAttack:0,maxAttack:0,defense:0,maxLife:0,maxMp:0,moreAttack:0,moreDefense:0,moreLife:0,moreMp:0,attack:0,otherFire:0,burst:0,jook:0,reduceDamage:0};
  let fire=0;const armor=EQUIPMENT_SLOTS.slice(0,4).map(k=>this.equipment[k]);
  for(const item of armor){if(!item)continue;bonus.minAttack!+=number(item,'minAttack')+number(item,'mMinAttack');bonus.maxAttack!+=number(item,'maxAttack')+number(item,'mMaxAttack');bonus.defense!+=number(item,'defense')+number(item,'mDefense');fire+=number(item,'grade')+1+number(item,'holes');}
  if(armor.every(i=>i&&number(i,'mhdj')>0))fire+=Math.min(...armor.map(i=>number(i!,'mhdj')));
  const ring=this.equipment.戒指;if(ring){fire+=number(ring,'grade')+1;for(const field of ['mainType1','mainType2',...Array.from({length:number(ring,'grade')},(_,i)=>'pairType'+(i+1))]){const k=String(ring[field]);bonus[k]=(bonus[k]??0)+number(ring,k);}}
  const chaw=MERIT_RULES.nobility.thresholds.filter(t=>this.exploit>=t).length;
  const role={...CHARACTERS[this.reward.profession].rates,levels:this.vitals.level,skillAttack:0,moreExpAttack:0,skillDefense:0,moreExpDefense:0,moreExpLife:0,moreExpMp:0,skillBurst:0,baseBurst:CHARACTERS[this.reward.profession].baseBurst,skillJook:0,baseJook:CHARACTERS[this.reward.profession].baseJook,godFire:0,titleLevel:this.reward.titleLevel,militaryRankFire:0,chawFire:ROLE_PROGRESSION_RULES.nobility[chaw]!.fire,moreExpFire:0,skillAddFire:passiveSkillValue('英勇',this.bravery,CHARACTERS[this.reward.profession].rates).value,skillLife:0,skillMp:0,lifeSourseLevels:0,mpSourseLevels:0};
  const equipment={...bonus,minAttack:bonus.minAttack!+bonus.attack!,maxAttack:bonus.maxAttack!+bonus.attack!,moreMinAttack:bonus.moreAttack!,moreMaxAttack:bonus.moreAttack!,moreExp:0,wind:0,soil:0,fire:0,water:0,renew:0,attackFire:fire+bonus.otherFire!};
  const stats=roleAttributes(role,equipment);
  return {minAttack:stats.minAttack!,maxAttack:stats.maxAttack!,defense:stats.defense!,maxLife:stats.maxLife!,maxMp:stats.maxMp!,equipmentFire:equipment.attackFire,roleFire:stats.attackFire!,bravery:this.bravery,exploit:this.exploit,militaryExploit:this.militaryExploit};
 }
 refresh(){const s=this.stats();this.vitals.maxLife=s.maxLife;this.vitals.maxMp=s.maxMp;}
 snapshot(){return {equipment:structuredClone(this.equipment),stats:this.stats()};}
}

