import type {NpcReward,PetRecord} from './npc-reward.ts';
import {PET_TITLE_TYPES} from '../content/pet-title-data.ts';
import {petDetails} from './pet-details.ts';
import {PET_SCORE_RULES} from '../content/pet-score-rules.ts';
export type PetTitleQuotas=(number|null)[];
export const initialPetTitles=():PetTitleQuotas=>PET_TITLE_TYPES.map(()=>3);
export function promotePetTitles(raw:Record<string,unknown>):PetTitleQuotas{return PET_TITLE_TYPES.map((_,i)=>{const n=raw['allTitle'+i];return typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=3?n:null;});}
export function titlePreview(p:PetRecord,quotas:PetTitleQuotas){
 const d=petDetails(p),index=PET_TITLE_TYPES.indexOf(p.type as typeof PET_TITLE_TYPES[number]),number=quotas[index];
 if(!d||!Number.isFinite(p.maxZs)||p.maxZs<0)return {reason:'幻兽属性无效，不能评称'};
 if(d.allFen<5000)return {reason:'极品50星以上的幻兽才能评称'};
 if(p.titleNum>0)return {reason:'该幻兽已经拥有称号'};
 if(index<0||!Number.isInteger(number)||number!<0||number!>3)return {reason:'该物种评称名额未知，原记录保留'};
 const titleNum=number!+2,title=PET_SCORE_RULES.titles[titleNum as keyof typeof PET_SCORE_RULES.titles];
 return {reason:'',index,number:number!,titleNum,name:title.name,score:title.score};
}
export function awardPetTitle(p:PetRecord,quotas:PetTitleQuotas){const preview=titlePreview(p,quotas);if(preview.reason)return {ok:false,message:preview.reason};p.titleNum=preview.titleNum!;p.maxZs+=50;if(preview.number!>0)quotas[preview.index!]=preview.number!-1;return {ok:true,message:`${p.type}获得${preview.name}称号，评分增加${preview.score}，最大转世次数增加50次；免费`};}
export class PetTitles {
 open=false;revision=0;main?:PetRecord;pending=false;feedback='';
 constructor(readonly owner:NpcReward,readonly quotas:PetTitleQuotas,private available:()=>boolean){}
 show(p:PetRecord){if(!this.available()||!this.owner.pets.includes(p))return false;this.open=true;this.main=p;this.pending=false;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.pending=false;this.revision++;}
 private valid(rev:number){return this.open&&this.available()&&rev===this.revision&&!!this.main&&this.owner.pets.includes(this.main);}
 preview(){return this.main?titlePreview(this.main,this.quotas):{reason:'请选择幻兽'};}
 request(rev=this.revision){if(!this.valid(rev))return false;this.revision++;const p=this.preview();this.feedback=p.reason;this.pending=!p.reason;return this.pending;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=false;this.revision++;this.feedback='已取消评称';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;this.pending=false;this.revision++;const result=awardPetTitle(this.main!,this.quotas);this.feedback=result.message;this.owner.messages.push(this.feedback);return result.ok;}
}
