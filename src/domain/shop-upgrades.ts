import {PET_SHOP_UPGRADES,PET_SHOP_LEVEL_STOCK} from '../content/pet-shop-upgrade-data.ts';
import {SHOP_UPGRADES,SHOP_LEVEL_STOCK} from '../content/shop-upgrade-data.ts';
import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
import {literalItem} from '../content/registry.ts';
import type {OrdinaryShop} from './ordinary-shop.ts';
export interface ShopUpgradeState {level:number;tasks:{isDoing:boolean;isComplete:boolean;number:number}[]}
export const initialShopUpgrades=():ShopUpgradeState=>({level:1,tasks:SHOP_UPGRADES.map(()=>({isDoing:false,isComplete:false,number:0}))});
export class ShopUpgrades {
 state=initialShopUpgrades();
 constructor(private shop:OrdinaryShop){}
 get definitions(){return this.shop.kind==='pet'?PET_SHOP_UPGRADES:SHOP_UPGRADES;}
 get title(){return this.shop.kind==='pet'?'幻兽商':'杂货商';}
 private get stock(){return this.shop.kind==='pet'?PET_SHOP_LEVEL_STOCK:SHOP_LEVEL_STOCK;}
 private valid(revision:number){return (this.shop.kind==='ordinary'||this.shop.kind==='pet')&&this.shop.dialog&&this.shop.canInteract()&&revision===this.shop.revision;}
 accept(revision=this.shop.revision){if(!this.valid(revision))return false;const t=this.state.tasks[this.state.level-1];if(!t||t.isDoing||t.isComplete)return false;t.isDoing=true;this.shop.reward.messages.push(`接到支线任务 ${this.state.level+1}级${this.title}任务`);this.shop.revision++;return true;}
 fund(revision=this.shop.revision){if(!this.valid(revision))return false;const i=this.state.level-1,t=this.state.tasks[i],q=this.definitions[i];if(!t||!q||!t.isDoing||t.isComplete)return false;
  if(this.shop.reward.ms<q.cost){this.shop.feedback='你的魔石不足';this.shop.reward.messages.push(this.shop.feedback);return false;}
  this.shop.reward.ms-=q.cost;t.number=q.cost;t.isComplete=true;this.state.level++;this.shop.openNumber=this.stock[this.state.level]!;this.shop.feedback=this.title+'等级提高';this.shop.reward.messages.push(this.shop.feedback);this.shop.revision++;return true;
 }
 claim(index:number,revision=this.shop.revision){if(!this.valid(revision))return false;const t=this.state.tasks[index],q=this.definitions[index];if(!t||!q||!t.isDoing||!t.isComplete)return false;
  const r=this.shop.reward;
  for(const p of [...q.prize].reverse()){
   if(p.type==='声望'){r.credit=Math.min(ROLE_PROGRESSION_RULES.credit.maximum,r.credit+('val'in p?p.val:0));r.titleLevel=Math.max(r.titleLevel,Math.floor(r.credit/ROLE_PROGRESSION_RULES.credit.titleStep));r.messages.push('声望增加 '+('val'in p?p.val:0));}
   else for(let n=0;n<('number'in p?p.number:1);n++)this.shop.deliver(literalItem(p.type));
  }
  t.number=0;t.isComplete=false;t.isDoing=false;this.shop.feedback=`已领取 ${q.name} 奖励`;this.shop.revision++;return true;
 }
}
