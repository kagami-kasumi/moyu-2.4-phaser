import {refreshEquipmentAttributes} from './equipment-attributes.ts';
import type {Item,NpcReward} from './npc-reward.ts';
import {MAGIC_STONES,magicPlan} from './equipment-magic.ts';
import {QUALITY_STONE,qualityPlan} from './equipment-quality.ts';
export const SOCKET_BOXES=['初级月光宝盒','中级月光宝盒','高级月光宝盒'] as const;
export const SOCKET_EQUIPMENT=['武器','衣服','头盔','鞋'] as const;
export type ForgeSlot='item'|'stone';
export class EquipmentSockets {
 item:Item|null=null;stone:Item|null=null;open=false;revision=0;feedback='选择装备和对应宝盒。';
 constructor(readonly reward:NpcReward){}
 accepts(item:Item){return SOCKET_EQUIPMENT.some(t=>t===item.type)||item.type==='宝石'&&[...SOCKET_BOXES,...MAGIC_STONES,QUALITY_STONE].some(n=>n===item.name);}
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

