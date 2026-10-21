import type {FirstQuestState} from './first-combat-quest.ts';
import type {NpcReward} from './npc-reward.ts';
export type HonorPrize='ms'|'res'|'credit';
export class KingHonor {
 open=false;revision=0;
 constructor(readonly state:FirstQuestState,readonly reward:NpcReward,private available:()=>boolean){}
 get task(){return this.state.honor;}
 get mode(){return !this.task?.isDoing?'accept':this.task.isComplete?'claim':'progress';}
 canInteract(){return this.state.king?.isComplete===true&&this.available();}
 interact(){if(!this.canInteract())return false;this.reward.close();this.open=true;this.revision++;return true;}
 close(){this.open=false;this.revision++;}
 private valid(revision:number){return this.open&&revision===this.revision&&this.canInteract();}
 accept(revision=this.revision){if(!this.valid(revision)||this.mode!=='accept')return false;this.state.honor={number:0,isDoing:true,isComplete:false};this.state.honorPrompt=false;this.reward.messages.push('接受日常任务 荣誉任务');this.close();return true;}
 claim(prize:HonorPrize,revision=this.revision){
  if(!this.valid(revision)||this.mode!=='claim'||!['ms','res','credit'].includes(prize))return false;
  this.task!.isDoing=false;
  const amount=prize==='ms'?this.reward.credit*200:prize==='res'?this.reward.credit*20000:20;
  if(prize==='credit'){this.reward.credit=Math.min(500,this.reward.credit+amount);this.reward.titleLevel=Math.max(this.reward.titleLevel,Math.floor(this.reward.credit/50));}else this.reward[prize]+=amount;
  this.reward.messages.push('获得'+amount+({ms:'魔石',res:'资源',credit:'声望'}[prize]));this.close();return true;
 }
}
