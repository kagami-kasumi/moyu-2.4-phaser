import {literalItem} from '../content/registry.ts';
import type {NpcReward} from './npc-reward.ts';
export const SOUTH_PET_CARDS=[{type:'极品35星凯恩',cost:5000},{type:'极品35星莎菲',cost:6000},{type:'极品35星雪瑞',cost:7000},{type:'极品35星飞飞',cost:6500},{type:'极品35星朵朵',cost:6500}] as const;
/** 4312/frame1 commands 10300..10305. This NPC does not use shop2 inventory. */
export class SouthPetMerchant {
 open=false;revision=0;feedback='';failed=false;
 constructor(readonly reward:NpcReward,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 canInteract(){return this.available();}
 interact(){if(!this.available())return false;this.reward.close();this.open=true;this.failed=false;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.revision++;}
 buy(index:number,revision=this.revision){
  if(!this.open||this.failed||revision!==this.revision||!this.available()||!Number.isInteger(index))return false;
  const card=SOUTH_PET_CARDS[index];if(!card)return false;
  this.revision++;
  if(this.reward.ms<card.cost){this.failed=true;this.feedback='你的魔石不够啊';return false;}
  this.reward.ms-=card.cost;this.reward.store(literalItem(card.type),this.position(),this.contains);
  this.feedback='获得幻兽卡 '+card.type;this.reward.messages.push(this.feedback);return true;
 }
}
