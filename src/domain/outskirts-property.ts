import type {NpcReward} from './npc-reward.ts';
export class OutskirtsProperty {
 owned=false;open=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward,readonly rank:()=>number,private available:()=>boolean){}
 show(){if(!this.available())return false;this.reward.close();this.open=true;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.revision++;}
 buy(revision=this.revision){
  if(!this.open||revision!==this.revision||!this.available()||this.owned)return false;
  this.revision++;const r=this.reward;
  if(this.rank()<1)this.feedback='你的爵位没有达到勋爵,无法购买';
  else if(r.ms<100)this.feedback='你的魔石不足,无法购买';
  else{r.ms-=100;this.owned=true;r.res+=10000;this.feedback='恭喜你获得了卡萨诺城郊区的产权和10000资源。';return true;}
  r.messages.push(this.feedback);return false;
 }
}
