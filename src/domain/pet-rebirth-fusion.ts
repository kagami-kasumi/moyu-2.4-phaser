import type {Item,PetRecord} from './npc-reward.ts';
import {PetProgression,grantPetExperience} from './pet-progression.ts';
import {petDetails} from './pet-details.ts';
const matches=(i:Item|null,type:string,name?:string)=>i?.type===type&&(i.name===name||i.name===undefined);
const count=(bag:(Item|null)[],type:string,name?:string)=>bag.reduce((n,i)=>n+(matches(i,type,name)?i!.number||1:0),0);
function consume(bag:(Item|null)[],type:string,name?:string){const n=bag.findIndex(i=>matches(i,type,name));if(n<0)return false;const i=bag[n]!;if((i.number??0)>1)i.number!--;else bag[n]=null;return true;}
/** Original ordering intentionally allows experience consumption before a failed fusion. */
export function rebirthPet(p:PetRecord,bag:(Item|null)[],roleLevel:number,useExp:boolean,bell?:Item|null){
 let balls=0;const fail=(message:string)=>({ok:false,balls,message});
 if(!petDetails(p,bell)||![p.levels,p.zs,p.maxZs,p.nowExp??0,p.maxExp??9,p.oldLevels??1,p.oldNowExp??0,p.oldMaxExp??9].every(n=>Number.isFinite(n)&&n>=0)||p.levels<1||!p.battle||bag.some(i=>i&&['经验球','宝石'].includes(i.type)&&(!Number.isInteger(i.number??0)||Number(i.number??0)<0)))return fail('幻兽或材料数据无效，未消耗');
 if(p.zs>=p.maxZs)return fail('主幻兽的转世次数已经达到极限，不能再进行幻化了。');
 if(useExp&&p.levels<30&&count(bag,'经验球')>=2)for(let n=0;n<2;n++){if(!grantPetExperience(p,2000,roleLevel,bell))break;consume(bag,'经验球');balls++;}
 if(p.levels<30)return fail(`转世幻化等级要求30级以上；已消耗经验球 ${balls}`);
 if(!consume(bag,'宝石','灵魂晶石'))return fail(`你的背包里没有灵魂晶石；已消耗经验球 ${balls}`);
 p.zs++;if((p.oldLevels??1)<p.levels){p.oldLevels=p.levels;p.oldNowExp=p.nowExp??0;p.oldMaxExp=p.maxExp??Math.floor(p.levels*9);}p.levels=1;p.nowExp=0;p.maxExp=9;p.life=petDetails(p,bell)!.maxLife;
 return {ok:true,balls,message:`转世幻化成功：转世增加1次，评分提高10分；消耗灵魂晶石1个、经验球 ${balls}；等级1，生命已恢复`};
}
export class PetRebirthFusion {
 open=false;revision=0;main?:PetRecord;pending=false;useExp=true;feedback='';
 constructor(readonly progression:PetProgression,private available:()=>boolean){}
 get reward(){return this.progression.owner;}
 show(){if(!this.available())return false;this.open=true;this.main=undefined;this.pending=false;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.pending=false;this.revision++;}
 private valid(rev:number){return this.open&&this.available()&&rev===this.revision;}
 choose(p:PetRecord,rev=this.revision){if(!this.valid(rev)||!this.reward.pets.includes(p))return false;this.revision++;this.pending=false;if(!this.progression.selectForExperience(p)){this.feedback='出征槽或属性不明确';return false;}this.main=p;this.feedback='';return true;}
 option(value:boolean,rev=this.revision){if(!this.valid(rev))return false;this.useExp=value;this.pending=false;this.revision++;return true;}
 private ready(){return !!this.main&&this.reward.pets.includes(this.main)&&this.progression.valid()&&this.progression.slots.includes(this.main)&&!!this.progression.details(this.main);}
 preview(){if(!this.ready())return null;const p={...this.main!},bag=this.reward.bag.map(i=>i?{...i}:null),result=rebirthPet(p,bag,this.progression.roleLevel(),this.useExp,this.progression.bells[this.progression.slots.indexOf(this.main!)]);return {...result,pet:p};}
 request(rev=this.revision){if(!this.valid(rev))return false;this.revision++;const preview=this.preview();if(!preview){this.feedback='请选择有效的出征幻兽';return false;}this.pending=true;this.feedback='';return true;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=false;this.revision++;this.feedback='已取消，材料保留';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;this.pending=false;this.revision++;if(!this.ready()){this.feedback='幻兽或出征槽已经改变，未消耗';return false;}const result=rebirthPet(this.main!,this.reward.bag,this.progression.roleLevel(),this.useExp,this.progression.bells[this.progression.slots.indexOf(this.main!)]);this.feedback=result.message;this.reward.messages.push(this.feedback);return result.ok;}
}
