import {PET_ADVANCEMENT_TYPES} from './pet-advancement.ts';
import {hatchPet,isPetEgg} from './pet-hatching.ts';
import {SOUL_MATERIAL,soulBonuses} from './equipment-soul.ts';
import {REFORGE_MATERIALS} from './equipment-reforge.ts';
import {ELEMENT_MATERIALS,elementBonuses} from './equipment-elements.ts';
import {GEM_TYPES,gemBonuses} from './equipment-gems.ts';
import {LEVEL_STONES} from './equipment-level.ts';
import {initialSkills,learnSkill,skillFields} from './character-skills.ts';
import {type HealingPanel,initialConsumables,isConsumable,applyMedicine,useReserve,spendMedicine} from './character-consumables.ts';
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
import {SOCKET_BOXES} from './equipment-sockets.ts';
import {MAGIC_STONES} from './equipment-magic.ts';
export const EQUIPMENT_SLOTS=['头盔','衣服','武器','鞋','戒指'] as const;
export type EquipmentSlot=typeof EQUIPMENT_SLOTS[number];
const number=(i:Item,k:string)=>Number(i[k]??0);
const money=['小魔石袋子','中魔石袋子','大魔石袋子','富豪礼包'];
export class Inventory {
 travelItem?:(index:number,item:Item)=>boolean;
 petHealingPanels:()=>HealingPanel[]|null=()=>[];
 petMergeBonus=()=>({minAttack:0,maxAttack:0,defense:0});
 equipment:Record<EquipmentSlot,Item|null>={头盔:null,衣服:null,武器:null,鞋:null,戒指:null};
 maxLevel:number=ROLE_PROGRESSION_RULES.maximumLevel;
 consumables=initialConsumables();
 skills:Record<string,number>={};xpEnabled=false;
 get bravery(){return this.skills.英勇??0;} set bravery(value:number){if(value===0)delete this.skills.英勇;else this.skills.英勇=value;}
 nobilityRank=0;get chaw(){return Math.max(this.nobilityRank,MERIT_RULES.nobility.thresholds.filter(t=>this.exploit>=t).length);}
 militaryRank=0;militaryRankFire=0;get currentMilitaryRank(){return this.militaryRank;}
 exploit=0;militaryExploit=0;
 constructor(readonly reward:NpcReward,readonly vitals:Vitals,private petRandom:()=>number=Math.random){this.skills=initialSkills(reward.profession);}
 action(item:Item){if((item.type==='冰宫幻境'||item.type==='边境幻境'||item.type==='幸运之门'||item.type==='卡萨诺幻境'||item.type==='南城幻境'||item.type==='沼泽幻境'||item.type==='戈壁幻境'||item.type==='树心幻境'))return '使用';if(item.type==='剌虫人头目行踪'||item.type==='炎女头目行踪'||item.type==='龙怪头目行踪')return '使用';if(isConsumable(item))return '使用';if(item.type==='经验球')return '分配';if(EQUIPMENT_SLOTS.includes(item.type as EquipmentSlot))return '装备';if(isPetEgg(item.type))return '孵化';if(item.type==='技能书')return '学习';if(packs[item.type]||money.includes(item.type)||item.type==='勇士勋章'||item.type==='英雄令')return '使用';return null;}
 unavailable(item:Item){if(PET_ADVANCEMENT_TYPES.includes(item.type))return '请打开幻兽面板，选择出征幻兽，在进阶道具中确认使用';return item.type==='宝石'&&item.name===SOUL_MATERIAL?'请打开魔之魂附加，选择装备和材料':item.type==='宝石'&&REFORGE_MATERIALS.includes(item.name??'')?'请打开高阶重铸；灵魂王也可用于戒指打造':item.type==='宝石'&&ELEMENT_MATERIALS.includes(item.name??'')?'请打开元素打造选择装备和材料':item.type==='宝石'&&GEM_TYPES[item.name??'']?'请打开宝石镶嵌选择装备和宝石':item.type==='宝石'&&LEVEL_STONES.some(name=>name===item.name)?'请点击背包上方的“等级提升”，选择装备和幻魔材料':item.type==='宝石'&&item.name===QUALITY_STONE?'请点击背包上方的品质提升，选择装备和灵魂晶石':item.type==='宝石'&&MAGIC_STONES.some(name=>name===item.name)?'请点击背包上方的“魔魂强化”，选择装备和材料':item.type==='宝石'&&SOCKET_BOXES.some(name=>name===item.name)?'请点击背包上方的“装备开孔”，选择装备和宝盒':item.type==='经验球'?'请打开经验球分配面板':item.type==='宝石'||item.type.includes('内丹')||item.type==='极品玉石'?'此物品用于打造或培养，相关系统尚未开放':'此物品对应的功能尚未开放';}
 private message(text:string){this.reward.messages.push(text);}
 private consume(index:number){const item=this.reward.bag[index]!;item.number=number(item,'number')-1;if(item.number<=0)this.reward.bag[index]=null;}
 use(index:number,expected:Item|null,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  const item=this.reward.bag[index];if(!item||item!==expected)return false;if((item.type==='冰宫幻境'||item.type==='边境幻境'||item.type==='幸运之门'||item.type==='卡萨诺幻境'||item.type==='南城幻境'||item.type==='沼泽幻境'||item.type==='戈壁幻境'||item.type==='树心幻境')||item.type==='剌虫人头目行踪'||item.type==='炎女头目行踪'||item.type==='龙怪头目行踪')return this.travelItem?.(index,item)??false;
  const action=this.action(item);if(action==='分配')return false;if(!action){this.message(this.unavailable(item));return false;}
  if(item.type==='英雄令'){this.reward.credit=Math.min(500,this.reward.credit+10);this.reward.titleLevel=Math.max(this.reward.titleLevel,Math.floor(this.reward.credit/50));this.consume(index);this.message('已使用英雄令，声望 '+this.reward.credit+'（上限500）');return true;}
  if(isConsumable(item)){
   const c=this.consumables,v=this.vitals;
   const healing=item.type==="药品"||item.type==="生命之源"||item.type==="魔力源泉",panels=healing?this.petHealingPanels():[];
   if(healing&&(!panels||![v.life,v.maxLife,v.mp,v.maxMp,...(item.type==="生命之源"?[c.lifeSourse]:item.type==="魔力源泉"?[c.mpSourse]:[])].every(n=>Number.isFinite(n)&&n>=0))){this.message("队伍属性或槽位不明确，未治疗、未消耗");return false;}
   const partyText=()=>panels!.map((p,i)=>` · ${p.label??"出征幻兽"+(i+1)}生命 ${p.body.life}/${p.body.maxLife}`).join("");
   if(item.type==='药品'){if(!applyMedicine(v,item,panels!)){this.message('死亡状态，不能使用药品');return false;}if(!spendMedicine(this.reward.bag,item))this.reward.bag[index]=null;this.message('已使用 '+(item.name??item.type)+'；生命 '+v.life+'/'+v.maxLife+' · 魔力 '+v.mp+'/'+v.maxMp+partyText());return true;}
   if(item.type==='生命之源'||item.type==='魔力源泉'){useReserve(v,c,item.type,panels!);this.message(item.type+'：生命 '+v.life+'/'+v.maxLife+' · 魔力 '+v.mp+'/'+v.maxMp+'；储备 '+c.lifeSourse+' / '+c.mpSourse+partyText());return true;}
   if(item.type==='能量药水'){if(c.maxPower>=6){this.message('XP能量格上限已经达到6，不能继续使用此药品');return false;}c.maxPower++;c.isFull=false;this.consume(index);this.message('XP能量格上限增加至'+c.maxPower);return true;}
   if(c.expBallNum<v.level){c.expBallNum++;for(const key of ['moreExpFire','moreExpLife','moreExpMp','moreExpAttack','moreExpDefense'] as const)c[key]+=2;this.refresh();this.message('超级经验球：战斗力+2，攻击、防御、生命、魔力+2%；已使用 '+c.expBallNum+' / '+v.level);}
   else this.message('人物当前等级：'+v.level+'，已经使用过'+c.expBallNum+'次超级经验球；本次无加成，道具仍按原规则消耗');
   this.consume(index);return true;
  }
  if(action==='装备'){
   if(item.type!=='戒指'&&(number(item,'levels')>this.vitals.level||item.vocational!==this.reward.profession)){this.message('装备的职业或等级不符合');return false;}
   const slot=item.type as EquipmentSlot,old=this.equipment[slot],drops=this.reward.drops.length;if(old)this.reward.store(old,position,contains);
   this.equipment[slot]={...item};this.reward.bag[index]=null;this.refresh();this.message('已装备 '+(item.name??item.type)+(this.reward.drops.length>drops?'；背包已满，旧装备掉落在地上了':''));return true;
  }
  if(action==='孵化'){
   let pet;try{pet=hatchPet(item.type,this.reward.pets.length<this.reward.petCapacity,this.petRandom);}catch{this.message('孵化随机数据无效，未消耗幻兽蛋');return false;}
   if(!pet){this.message('幻兽背包已经满了。');return false;}
   this.reward.pets.push(pet);this.consume(index);this.message('已孵化 '+item.type+'，可在幻兽记录中查看');return true;
  }
  if(action==='学习'){
   const result=learnSkill(this.skills,item,this.reward.profession,this.vitals.level);this.message(result.message);if(!result.success)return false;
   if(result.activateXp)this.xpEnabled=true;
   this.reward.bag[index]=null;this.refresh();return true;
  }
  if(money.includes(item.type)){this.reward.ms+=number(item,'salePrice');this.consume(index);this.message('获得'+number(item,'salePrice')+'魔石');return true;}
  if(item.type==='勇士勋章'){this.exploit=Math.min(MERIT_RULES.nobility.cap,this.exploit+MEDAL_RULES.award);if(this.militaryExploit<MERIT_RULES.military.cap){this.militaryExploit=Math.min(MERIT_RULES.military.cap,this.militaryExploit+MEDAL_RULES.award);this.militaryRank=Math.max(this.militaryRank,MERIT_RULES.military.thresholds.filter(t=>this.militaryExploit>=t).length);}this.nobilityRank=this.chaw;this.consume(index);this.refresh();this.message('功勋 '+this.exploit+' · 军功 '+this.militaryExploit);return true;}
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
  const chaw=this.chaw;
  const role={...CHARACTERS[this.reward.profession].rates,levels:this.vitals.level,skillAttack:0,moreExpAttack:this.consumables.moreExpAttack,skillDefense:0,moreExpDefense:this.consumables.moreExpDefense,moreExpLife:this.consumables.moreExpLife,moreExpMp:this.consumables.moreExpMp,skillBurst:0,baseBurst:CHARACTERS[this.reward.profession].baseBurst,skillJook:0,baseJook:CHARACTERS[this.reward.profession].baseJook,godFire:0,titleLevel:this.reward.titleLevel,militaryRankFire:this.militaryRankFire,chawFire:ROLE_PROGRESSION_RULES.nobility[chaw]!.fire,moreExpFire:this.consumables.moreExpFire,skillAddFire:passiveSkillValue('英勇',this.bravery,CHARACTERS[this.reward.profession].rates).value,skillLife:0,skillMp:0,lifeSourseLevels:this.consumables.lifeSourseLevels,mpSourseLevels:this.consumables.mpSourseLevels};
  Object.assign(role,skillFields(this.skills,this.reward.profession));
  const gems=gemBonuses(armor),elements=elementBonuses(armor),souls=soulBonuses(armor);
  for(const key of ['attack','defense','maxLife','maxMp','burst','jook','moreAttack','moreDefense','moreLife','moreMp'] as const)bonus[key]!+=souls[key];
  for(const key of ['burst','jook','moreAttack','moreDefense','moreLife','moreMp'] as const)bonus[key]!+=elements[key];
  const equipment={...bonus,reduceDamage:bonus.reduceDamage!+gems.reduceDamage,minAttack:bonus.minAttack!+bonus.attack!,maxAttack:bonus.maxAttack!+bonus.attack!,moreMinAttack:bonus.moreAttack!+gems.moreAttack,moreMaxAttack:bonus.moreAttack!+gems.moreAttack,moreExp:gems.moreExp,wind:elements.wind,soil:elements.soil,fire:elements.fire,water:elements.water,renew:0,attackFire:fire+bonus.otherFire!+gems.stoneFire+elements.elementFire+souls.soulFire};
  const stats=roleAttributes(role,equipment);
  const merge=this.petMergeBonus();for(const key of ["minAttack","maxAttack","defense"] as const)stats[key]!+=merge[key];
  return {soulFire:souls.soulFire,elementSet:elements.elementSet,elementFire:elements.elementFire,wind:stats.wind!,fire:stats.fire!,water:stats.water!,soil:stats.soil!,burst:stats.burst!,jook:stats.jook!,moreExp:stats.moreExp!,reduceDamage:stats.reduceDamage!,minAttack:stats.minAttack!,maxAttack:stats.maxAttack!,defense:stats.defense!,maxLife:stats.maxLife!,maxMp:stats.maxMp!,equipmentFire:equipment.attackFire,roleFire:stats.attackFire!,bravery:this.bravery,exploit:this.exploit,militaryExploit:this.militaryExploit};
 }
 refresh(){const s=this.stats();this.vitals.maxLife=s.maxLife;this.vitals.maxMp=s.maxMp;}
 snapshot(){return {maxLevel:this.maxLevel,equipment:structuredClone(this.equipment),stats:this.stats(),skills:this.skills,xpEnabled:this.xpEnabled,consumables:this.consumables,vitals:this.vitals};}
}

