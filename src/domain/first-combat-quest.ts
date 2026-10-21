import {contentById,literalItem} from '../content/registry.ts';
import {refreshEquipmentAttributes} from './equipment-attributes.ts';
import type {NpcReward,Item} from './npc-reward.ts';
export interface TrainingStage {number:number;isDoing:boolean;isComplete:boolean}
export interface FirstQuestState {number:number;secondActive:boolean;later?:[TrainingStage,TrainingStage];fourthActive?:boolean;fourth?:TrainingStage;nextActive?:boolean;bandits?:TrainingStage;kingActive?:boolean;king?:TrainingStage;swampActive?:boolean;swamp?:TrainingStage;southActive?:boolean;south?:TrainingStage;counterattackActive?:boolean;counterattack?:TrainingStage;icePalaceActive?:boolean;icePalace?:TrainingStage;blackAbyssActive?:boolean;honor?:TrainingStage;honorPrompt?:boolean}
/** Three source profession-specific training stages, independently claimable. */
export class FirstCombatQuest {
 constructor(readonly state:FirstQuestState,readonly flags:{index:number;isDoing:boolean;isComplete:boolean},readonly reward:NpcReward){}
 get later(){return this.state.later??= [{number:0,isDoing:this.state.secondActive,isComplete:false},{number:0,isDoing:false,isComplete:false}];}
 get fourth(){return this.state.fourth??={number:0,isDoing:this.state.fourthActive??false,isComplete:false};}
 get claimable(){if(this.flags.isDoing&&this.flags.isComplete)return 0;const n=this.state.later?.findIndex(q=>q.isDoing&&q.isComplete)??-1;return n>=0?n+1:this.state.fourth?.isDoing&&this.state.fourth.isComplete?3:-1;}
 get description(){const counts=[this.state.number,...(this.state.later??[{number:0},{number:0}]).map(q=>q.number)];return `训练一 ${counts[0]}/6 · 二 ${counts[1]}/4 · 三 ${counts[2]}/6 · 四 ${this.state.fourth?.number??0}/4`;}
 catchThing(name:string,count:number,level:number){
  if(name==='龙怪精英'){const q=this.fourth;if(!q.isDoing||q.number>=4||level<1)return false;q.number+=Math.min(count,4-q.number);q.isComplete=q.number>=4;if(q.isComplete){this.state.nextActive=true;if(this.state.bandits)this.state.bandits.isDoing=true;this.reward.messages.push('主线任务 新手训练四完成，可领取奖励。');}return true;}
  const n=['鹿角兽精英','龙怪'].indexOf(name);
  if(n>=0){const q=this.later[n]!,need=n===0?4:6;if(!q.isDoing||q.number>=need||level<1)return false;q.number+=Math.min(count,need-q.number);q.isComplete=q.number>=need;if(q.isComplete){if(n===0)this.later[1].isDoing=true;else{this.state.fourthActive=true;if(this.state.fourth)this.state.fourth.isDoing=true;}this.reward.messages.push(`主线任务 新手训练${n===0?'二':'三'}完成，可领取奖励。`);}return true;}
if(name!=='鹿角兽'||!this.flags.isDoing||level<1||this.state.number>=6)return false;this.state.number+=Math.min(count,6-this.state.number);this.flags.isComplete=this.state.number>=6;if(this.flags.isComplete){this.state.secondActive=true;if(this.state.later)this.state.later[0].isDoing=true;this.reward.messages.push('主线任务 新手训练一完成，可领取奖励。');}return true;}
 claim(position:{x:number;y:number},contains:(x:number,y:number)=>boolean){
  const stage=this.claimable;if(stage<0)return false;
  const definition=contentById('quest:mainTask:'+(stage===3?6:this.flags.index+stage*2))!;
  const prizes=definition.data.prize as Item[];
  for(const prize of [...prizes].reverse()){const item={...prize};if(item.type==='魔石')this.reward.ms+=Number(item.val);else if(stage===3){for(let n=0;n<Number(item.number);n++)this.reward.store(literalItem(item.type),position,contains);}else{refreshEquipmentAttributes(item);this.reward.store(item,position,contains);}}
  if(stage===0)this.flags.isDoing=false;else if(stage===3){this.fourth.isDoing=false;this.state.fourthActive=false;}else{this.later[stage-1]!.isDoing=false;if(stage===1)this.state.secondActive=false;}this.reward.messages.push(['已领取新手训练一奖励：武器、衣服、100魔石。','已领取新手训练二奖励：头盔、200魔石。','已领取新手训练三奖励：鞋子、300魔石。','已领取新手训练四奖励：50极品玉石、50束9朵玫瑰。'][stage]!);return true;
 }
}
