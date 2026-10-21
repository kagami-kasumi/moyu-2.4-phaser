import {PET_SHOP_GOODS} from '../content/pet-shop-data.ts';
import {PHARMACY_GOODS} from '../content/pharmacy-data.ts';
import {ShopUpgrades} from './shop-upgrades.ts';
import {ORDINARY_GOODS} from '../content/ordinary-shop-data.ts';
import {literalItem} from '../content/registry.ts';
import type {Item,NpcReward} from './npc-reward.ts';
export function shopItem(good:Item):Item {
 const name=good.name??good.type;
 const defaults:Record<string,number>={'高级攻击宝石':15,'高级减伤害宝石':8,'高级经验宝石':25,'高级战斗力宝石':5};
 if(name in defaults)return {type:'宝石',name,val1:good.type==='宝石'&&good.val1?Number(good.val1):defaults[name]!,salePrice:name==='高级经验宝石'?500:name==='高级战斗力宝石'?2000:1000};
 return literalItem(name);
}
export class OrdinaryShop {
 upgrades=new ShopUpgrades(this);
 canInteract(){return this.available();}
 deliver(item:Item){return this.reward.store(item,this.position(),this.contains);}
 open=false;dialog=false;revision=0;openNumber=4;selected=-1;quantity=1;quantityOpen=false;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean,readonly kind:'ordinary'|'pharmacy'|'pet'|'bravery'='ordinary'){this.openNumber=kind==='bravery'?1:kind==='pet'?9:kind==='pharmacy'?2:4;}
 get goods():readonly (Item&{salePrice:number})[]{return this.kind==='bravery'?[{type:'技能书',name:'英勇',vocational:'公共',levels:1,salePrice:5000}]:this.kind==='pet'?PET_SHOP_GOODS:this.kind==='pharmacy'?PHARMACY_GOODS:ORDINARY_GOODS;}
 interact(){if(!this.available())return false;this.close();this.reward.close();this.dialog=true;this.revision++;return true;}
 show(revision=this.revision){if(!this.dialog||revision!==this.revision||!this.available())return false;this.dialog=false;this.open=true;this.revision++;return true;}
 close(){this.dialog=false;this.open=false;this.quantityOpen=false;this.selected=-1;this.revision++;}
 cancel(){this.quantityOpen=false;this.revision++;}
 select(index:number,revision=this.revision){if(!this.valid(revision)||!Number.isInteger(index)||index<0||index>=Math.min(this.goods.length,this.openNumber))return false;this.quantity=this.quantityOpen&&this.selected===index?99:1;this.selected=index;this.quantityOpen=true;this.feedback='';this.revision++;return true;}
 setQuantity(value:string,revision?:number){if(revision!==undefined&&(!this.valid(revision)||!this.quantityOpen))return this.quantity;const n=Number(value);if(!Number.isNaN(n))this.quantity=Math.min(99,Math.max(1,Math.round(n)));return this.quantity;}
 private valid(revision:number){return this.open&&revision===this.revision&&this.available();}
 buy(revision=this.revision){if(!this.valid(revision)||!this.quantityOpen||this.selected<0||this.selected>=this.openNumber)return false;
  const good=this.goods[this.selected];if(!good)return false;
  if(!this.reward.bag.includes(null)){this.feedback='你的背包满了';return false;}
  const total=good.salePrice*this.quantity;if(this.reward.ms<total){this.feedback='没有足够的魔石购买该物品';return false;}
  for(let n=0;n<this.quantity;n++)this.reward.store(shopItem(good),this.position(),this.contains);
  this.reward.ms-=total;this.feedback=`购买 ${('name'in good?good.name:good.type)} × ${this.quantity}，花费 ${total} 魔石`;this.cancel();return true;
 }
 sell(index:number,item:Item,revision=this.revision){if(!this.valid(revision)||this.reward.bag[index]!==item||!item.type||!item.salePrice)return false;
  // Bag cells expose missing number as zero (source setThing); sales consume one whole cell.
  const number=item.number??0,value=Math.floor(item.salePrice/2)*(number<=0?1:number);
  if(!Number.isNaN(value))this.reward.ms+=value;
  this.reward.bag[index]=null;this.feedback=`出售 ${item.name??item.type}，获得 ${Number.isNaN(value)?0:value} 魔石`;this.revision++;return true;
 }
}
