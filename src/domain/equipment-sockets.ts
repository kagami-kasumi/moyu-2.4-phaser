import {SOUL_MATERIAL,hasSoul,soulPlan} from './equipment-soul.ts';
import {REFORGE_MATERIALS,reforgePlan} from './equipment-reforge.ts';
import {ELEMENT_MATERIALS,ELEMENT_FIELDS,elementPlan} from './equipment-elements.ts';
import {RING_MATERIALS,ringPlan} from './ring-forge.ts';
import {GEM_TYPES,gemPlan} from './equipment-gems.ts';
import {LEVEL_STONES,equipmentLevelPlan} from './equipment-level.ts';
import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
import {refreshEquipmentAttributes} from './equipment-attributes.ts';
import type {Item,NpcReward} from './npc-reward.ts';
import {MAGIC_STONES,magicPlan} from './equipment-magic.ts';
import {QUALITY_STONE,qualityPlan} from './equipment-quality.ts';
export const SOCKET_BOXES=['初级月光宝盒','中级月光宝盒','高级月光宝盒'] as const;
export const SOCKET_EQUIPMENT=['武器','衣服','头盔','鞋'] as const;
export type ForgeSlot='item'|'stone';
export class EquipmentSockets {
 item:Item|null=null;stone:Item|null=null;open=false;revision=0;feedback='选择装备和对应宝盒。';
 constructor(readonly reward:NpcReward,private maximumLevel:()=>number=()=>ROLE_PROGRESSION_RULES.maximumLevel){}
 accepts(item:Item){return item.type==='戒指'||SOCKET_EQUIPMENT.some(t=>t===item.type)||item.type==='宝石'&&[SOUL_MATERIAL,...REFORGE_MATERIALS,...ELEMENT_MATERIALS,...RING_MATERIALS,...Object.keys(GEM_TYPES),...SOCKET_BOXES,...MAGIC_STONES,...LEVEL_STONES,QUALITY_STONE].some(n=>n===item.name);}
 show(){this.open=true;this.revision++;}
 close(){this.open=false;this.revision++;}
 select(index:number,expected:Item,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  if(!this.open||revision!==this.revision||this.reward.bag[index]!==expected||!this.accepts(expected))return false;
  const slot:ForgeSlot=expected.type==='宝石'?'stone':'item',old=this[slot];
  // Selection replaces the source drag: bag relinquishes ownership before drop into the forge.
  this.reward.bag[index]=null;
  if(old)this.reward.store(old,position,contains);
  this[slot]={...expected};this.revision++;this.feedback='已放入'+(expected.name??expected.type);return true;
 }
 take(slot:ForgeSlot,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  const item=this[slot];if(!this.open||revision!==this.revision||!item)return false;
  const drops=this.reward.drops.length;this.reward.store(item,position,contains);this[slot]=null;this.revision++;
  this.feedback=this.reward.drops.length>drops?'背包已满，'+(item.name??item.type)+'掉落在地上，可腾出空格后拾取。':'已取回'+(item.name??item.type);return true;
 }
 canForge(){return !!this.item&&SOCKET_EQUIPMENT.some(t=>t===this.item!.type)&&this.stone?.type==='宝石'&&SOCKET_BOXES.indexOf(this.stone.name as typeof SOCKET_BOXES[number])===this.item.holes;}
 forge(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  if(!this.canForge()){this.feedback='不能开孔：初级需0孔，中级需1孔，高级需2孔。';this.revision++;return false;}
  const item=this.item!,stone=this.stone!,holes=Number(item.holes)+1;item.holes=holes;item['hole'+holes]=0;
  if((stone.number??0)>1)stone.number!--;else this.stone=null;
  refreshEquipmentAttributes(item);
  if(!this.stone)this.reward.messages.push('装备打造成功');
  this.feedback=`开孔成功：${item.name??item.type}现有${holes}孔，消耗1个${stone.name}。`;this.revision++;return true;
 }
 soulPlan(){return soulPlan(this.item,this.stone);}
 forgeSoul(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.soulPlan();this.revision++;this.feedback=plan.reason;if(!plan.ok)return false;
  const item=this.item!,stone=this.stone!;if(!hasSoul(stone)){stone.val1=1;stone.val2=1;}
  item.val1=stone.val1;item.val2=stone.val2;
  if((stone.number??0)>1)stone.number!--;else this.stone=null;
  refreshEquipmentAttributes(item);if(!this.stone)this.reward.messages.push('装备打造成功');this.feedback='附加成功：'+plan.reason;return true;
 }
 reforgePlan(){return reforgePlan(this.item,this.stone,this.reward.credit);}
 forgeReforge(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.reforgePlan();this.revision++;this.feedback=plan.reason;
  if(!plan.ok){this.reward.messages.push(...plan.messages);return false;}
  const item=this.item!,stone=this.stone!;if(plan.reset)item.levels=1;
  if((stone.number??0)>plan.cost)stone.number!-=plan.cost;else this.stone=null;
  if(!plan.reset){this.reward.credit-=plan.credit;item.grade=Number(item.grade)+1;}
  this.reward.messages.push(...plan.messages);refreshEquipmentAttributes(item);if(!this.stone)this.reward.messages.push('装备打造成功');this.feedback='重铸成功：'+plan.reason;return true;
 }
 elementPlan(){return elementPlan(this.item,this.stone,this.reward.credit);}
 forgeElement(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.elementPlan();this.revision++;this.feedback=plan.reason;
  if(!plan.ok){if(plan.cost>0)this.reward.messages.push(plan.reason);return false;}
  const item=this.item!,stone=this.stone!;
  if(plan.element){this.reward.credit-=plan.cost;item.element=plan.element;}
  else if(stone.name==='小元素石'){const field=ELEMENT_FIELDS[this.reward.randomInt(4)]!;item[field]=Number(item[field])+1;}
  else for(const field of ELEMENT_FIELDS)item[field]=Number(item[field])+1;
  if((stone.number??0)>1)stone.number!--;else this.stone=null;
  refreshEquipmentAttributes(item);if(!this.stone)this.reward.messages.push('装备打造成功');this.feedback='元素打造成功：'+plan.reason;return true;
 }
 ringPlan(){return ringPlan(this.item,this.stone);}
 forgeRing(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.ringPlan();this.revision++;this.feedback=plan.reason;
  if(!plan.ok){if(plan.shortage&&Number(this.stone?.number)>0)this.reward.messages.push('宝石数量不足！');return false;}
  const item=this.item!,stone=this.stone!;
  if(plan.quality)item.grade=Number(item.grade)+1;else{item.mhdj=Number(item.mhdj)+1;item[plan.field]=Number(item[plan.field])+plan.amount;}
  if(Number(stone.number)>plan.cost)stone.number!-=plan.cost;else this.stone=null;
  refreshEquipmentAttributes(item);if(!this.stone)this.reward.messages.push('装备打造成功');this.feedback='戒指打造成功：'+plan.reason;return true;
 }
 gemPlan(){return gemPlan(this.item,this.stone);}
 forgeGem(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.gemPlan();this.revision++;this.feedback=plan.reason;if(!plan.ok)return false;
  const item=this.item!,stone=this.stone!;item['hole'+plan.hole]=plan.type;item['gem'+plan.hole]=stone.val1;item['gem'+(10+plan.hole)]=stone.val2;
  if((stone.number??0)>1)stone.number!--;else this.stone=null;
  refreshEquipmentAttributes(item);if(!this.stone)this.reward.messages.push('装备打造成功');this.feedback='镶嵌成功：'+plan.reason;return true;
 }
 magicPlan(){return magicPlan(this.item,this.stone);}
 forgeMagic(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.magicPlan();
  if(!plan.ok){
   if(plan.cost>0&&Number(this.stone?.number)>0&&Number(this.item?.mhdj)<19&&Number(this.stone?.number)<plan.cost&&this.stone?.name==='魔魂晶石')this.reward.messages.push('宝石数量不足！');
   this.feedback=plan.reason;this.revision++;return false;
  }
  const item=this.item!,stone=this.stone!;item.mhdj=Number(item.mhdj??0)+1;
  if((stone.number??0)>plan.cost)stone.number!-=plan.cost;else this.stone=null;
  refreshEquipmentAttributes(item);if(!this.stone)this.reward.messages.push('装备打造成功');
  this.feedback='强化成功：'+plan.reason;this.revision++;return true;
 }
 levelPlan(){return equipmentLevelPlan(this.item,this.stone,this.maximumLevel());}
 forgeLevel(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.levelPlan();if(!plan.ok){if(plan.shortage&&Number(this.stone?.number)>0)this.reward.messages.push('宝石数量不足！');this.feedback=plan.reason;this.revision++;return false;}
  this.item!.levels=plan.next;const stone=this.stone!;if((stone.number??0)>plan.cost)stone.number!-=plan.cost;else this.stone=null;
  refreshEquipmentAttributes(this.item!);if(!this.stone)this.reward.messages.push('装备打造成功');this.feedback='升级成功：'+plan.reason;this.revision++;return true;
 }
 qualityPlan(){return qualityPlan(this.item,this.stone);}
 forgeQuality(revision=this.revision){
  if(!this.open||revision!==this.revision)return false;
  const plan=this.qualityPlan();
  if(!plan.ok){if(plan.shortage)this.reward.messages.push('宝石数量不足！');this.feedback=plan.reason;this.revision++;return false;}
  const item=this.item!,stone=this.stone!;
  if(stone.number!>plan.cost)stone.number!-=plan.cost;else this.stone=null;
  item.grade=Number(item.grade??0)+1;refreshEquipmentAttributes(item);
  if(!this.stone)this.reward.messages.push('装备打造成功');
  this.feedback='提升成功：'+plan.reason;this.revision++;return true;
 }
 snapshot(){return {item:structuredClone(this.item),stone:structuredClone(this.stone),open:this.open,revision:this.revision,feedback:this.feedback};}
}

