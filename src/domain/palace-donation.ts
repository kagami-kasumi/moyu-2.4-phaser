import type {MarshalQuests,MarshalKind} from './marshal-quests.ts';
import type {Inventory} from './inventory.ts';
import type {Item} from './npc-reward.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
export const DONATION_COSTS=[200,1000,5000] as const;
export const DONATION_TYPES=['头盔','衣服','武器','鞋','庇护铃铛','翡翠铃铛','凤翼铃铛'];
export function donationAward(item:Item|null){return item&&DONATION_TYPES.includes(item.type)&&typeof item.grade==='number'&&Number.isInteger(item.grade)&&item.grade>=0&&item.grade<=6?([50,100,150,200,400,0,0][item.grade]??null):null;}
type Pending={kind:'quest';name:MarshalKind}|{kind:'money';cost:number}|{kind:'equipment';index:number;item:Item;fingerprint:string};
export class PalaceDonation {
 open=false;revision=0;pending:Pending|null=null;feedback='';
 constructor(readonly inventory:Inventory,private available:()=>boolean,readonly quests?:MarshalQuests){}
 quest(name:MarshalKind,rev=this.revision){if(!this.valid(rev)||!this.quests?.eligible(name))return false;this.revision++;this.pending={kind:'quest',name};this.feedback=name==='军衔'?'消灭龙怪头目，奖励1000军功与幸运之门；接取时获得行踪。':'消灭5个龙怪精英，奖励1000功勋与风元素；支线优先于训练四计数。';return true;}
 show(){if(!this.available())return false;this.open=true;this.pending=null;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.pending=null;this.revision++;}
 private valid(rev:number){return this.open&&this.available()&&this.revision===rev;}
 money(cost:number,rev=this.revision){if(!this.valid(rev)||!DONATION_COSTS.includes(cost as 200))return false;this.revision++;this.pending=null;if(this.inventory.chaw===0){this.feedback='需要先获得爵位；可在元帅处接取爵位任务。';return false;}this.pending={kind:'money',cost};this.feedback=`捐献${cost}魔石，获得${cost/2}点功勋。`;return true;}
 equipment(index:number,item:Item,rev=this.revision){if(!this.valid(rev))return false;this.revision++;this.pending=null;if(!this.inventory.currentMilitaryRank){this.feedback='需要先获得军衔；可在元帅处接取军衔任务。';return false;}const award=donationAward(item);if(this.inventory.reward.bag[index]!==item||award===null){this.feedback='这个物品不能捐献，装备品质或所有权不明确。';return false;}this.pending={kind:'equipment',index,item,fingerprint:JSON.stringify(item)};this.feedback=`整件捐献${item.name??item.type}，获得${award}点军功。${award===0?'此品质按原规则没有奖励，仍会消耗装备。':''}`;return true;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=null;this.revision++;this.feedback='已取消，财物保留。';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;const p=this.pending,i=this.inventory,r=i.reward;this.pending=null;this.revision++;const beforeN=i.chaw,beforeM=i.currentMilitaryRank;let award:number;
  if(p.kind==='quest'){const accepted=this.quests?.accept(p.name)??false;this.feedback=accepted?'已接取'+p.name+'任务。':'已有任务或资格发生变化，未重复接取。';return accepted;}
  if(p.kind==='money'){if(!i.chaw||r.ms<p.cost){this.feedback='爵位不足或魔石不够，未捐献。';return false;}r.ms-=p.cost;award=p.cost/2;if(i.exploit<MERIT_RULES.nobility.cap)i.exploit=Math.min(MERIT_RULES.nobility.cap,i.exploit+award);i.nobilityRank=i.chaw;this.feedback=`获得${award}点功勋；功勋 ${i.exploit}。`;}
  else{const amount=donationAward(p.item);if(!i.currentMilitaryRank||r.bag[p.index]!==p.item||JSON.stringify(p.item)!==p.fingerprint||amount===null){this.feedback='装备或军衔已变化，未捐献。';return false;}award=amount;r.bag[p.index]=null;if(i.militaryExploit<MERIT_RULES.military.cap){i.militaryExploit=Math.min(MERIT_RULES.military.cap,i.militaryExploit+award);i.militaryRank=Math.max(i.militaryRank,MERIT_RULES.military.thresholds.filter(t=>i.militaryExploit>=t).length);}this.feedback=`获得${award}点军功；军功 ${i.militaryExploit}。`;}
  if(i.chaw>beforeN)this.feedback+='恭喜晋升为 '+ROLE_PROGRESSION_RULES.nobility[i.chaw]!.name;if(i.currentMilitaryRank>beforeM)this.feedback+='恭喜晋升为 '+ROLE_PROGRESSION_RULES.militaryRanks[i.currentMilitaryRank];i.refresh();r.messages.push(this.feedback);return true;
 }
}
