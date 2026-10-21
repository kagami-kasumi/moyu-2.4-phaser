import type {PetRecord,Item} from './npc-reward.ts';
import {PetProgression,grantPetExperience} from './pet-progression.ts';
import {petDetails} from './pet-details.ts';
import {orderedPets} from './pet-collection.ts';
import {fusionViceScore,petFusionNumbers,FUSION_GRASSES,type FusionPet} from '../content/pet-fusion-rules.ts';
export function fusionInput(p:PetRecord):FusionPet|null {const d=petDetails(p);if(!d)return null;return Object.assign({...p,allFen:d.allFen},...d.attributes.map(a=>({['maxRate'+a.axis]:a.maxRate,['max'+a.axis+'Fen']:a.maxScore}))) as FusionPet;}
const count=(bag:(Item|null)[],type:string)=>bag.filter(i=>i?.type===type&&i.name===undefined).reduce((n,i)=>n+(i!.number||1),0);
function consume(bag:(Item|null)[],type:string){const index=bag.findIndex(i=>i?.type===type&&i.name===undefined),item=bag[index]!;if((item.number??0)>1)item.number!--;else bag[index]=null;}
export class PetMainFusion {
 open=false;revision=0;main?:PetRecord;vice?:PetRecord;pending=false;useGrass=false;useExp=true;autoVice=true;feedback='';
 constructor(readonly progression:PetProgression,private available:()=>boolean,private random:()=>number=Math.random){}
 get reward(){return this.progression.owner;}
 show(){if(!this.available())return false;this.open=true;this.main=this.vice=undefined;this.pending=false;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.pending=false;this.revision++;}
 private valid(rev:number){return this.open&&this.available()&&rev===this.revision;}
 chooseMain(p:PetRecord,rev=this.revision){if(!this.valid(rev)||!this.reward.pets.includes(p))return false;this.pending=false;this.revision++;if(p.type==='奇迹龙'){this.feedback='奇迹龙没有主属性，不能进行主属性幻化。';return false;}if(!this.progression.selectForExperience(p)){this.feedback='出征槽位或属性不明确，未选择';return false;}this.main=p;this.vice=undefined;this.feedback='';if(this.autoVice)this.selectAutomatic();return true;}
 chooseVice(p:PetRecord,rev=this.revision){if(!this.valid(rev)||!this.main||p===this.main||!this.reward.pets.includes(p)||!(p.type===this.main.type||p.type==='奇异兽'))return false;this.vice=p;this.pending=false;this.revision++;return true;}
 selectAutomatic(){const m=this.main,need=m&&fusionInput(m);this.vice=need?[...orderedPets(this.reward.pets)].reverse().find(p=>p!==m&&p.type==='奇异兽'&&(petDetails(p)?.allFen??-Infinity)>=fusionViceScore(need)):undefined;}
 option(key:'useGrass'|'useExp'|'autoVice',value:boolean,rev=this.revision){if(!this.valid(rev))return false;this[key]=value;this.pending=false;this.revision++;if(key==='autoVice'){this.vice=undefined;if(value)this.selectAutomatic();}return true;}
 preview(){
  const m=this.main,v=this.vice,p=m&&fusionInput(m),vd=v&&petDetails(v),bag=this.reward.bag;
  if(!m||!p||!this.reward.pets.includes(m)||m.type==='奇迹龙')return {reason:'请选择有效主幻兽'};
  if(!this.progression.valid()||!this.progression.slots.includes(m)||!this.progression.details(m))return {reason:'出征槽位或铃铛归属不明确，未消耗'};
  if(![m.levels,m.zs,m.maxZs,m.life??0,m.oldLevels??1,m.nowExp??0,m.maxExp??9].every(n=>Number.isFinite(n)&&n>=0)||m.levels<1)return {reason:'主幻兽成长数据无效，未消耗'};
  const need=fusionViceScore(p);
  if(!Number.isFinite(need)||!Number.isFinite(m.nextLvRate)||m.nextLvRate!<=0)return {reason:'原版分母或旧倍率无效，原数据保留，未消耗'};
  if(!v||v===m||!vd||!this.reward.pets.includes(v))return {reason:'请选择不同的有效副幻兽',need};
  if(bag.some(i=>i&&['经验球',...FUSION_GRASSES.map(g=>g[0])].includes(i.type)&&(!Number.isInteger(i.number??0)||Number(i.number??0)<0)))return {reason:'消耗品数量无效，未消耗',need};
  const grass=this.useGrass?FUSION_GRASSES.find(g=>count(bag,g[0])>0):undefined;
  const result=petFusionNumbers(p,{type:v.type,allFen:vd.allFen},need,this.useGrass,grass?.[1]??0,()=>999);
  const errors:Record<string,string>={'turn-limit':'主幻兽转世次数已达上限','vice-type':'副幻兽须为同种或奇异兽','vice-score':'副幻兽评分没达到要求','level-20':'主幻兽需要20级','level-30':'主幻兽需要30级','missing-grass':'没有幻化草'};
  return {reason:result.accepted?'':errors[result.reason]??'幻化条件不满足',need,grass,result};
 }
 request(rev=this.revision){if(!this.valid(rev))return false;this.revision++;const p=this.preview();this.feedback=p.reason;this.pending=!p.reason;return this.pending;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=false;this.revision++;this.feedback='已取消，副兽与物品保留';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;this.pending=false;this.revision++;const preview=this.preview();if(preview.reason){this.feedback=preview.reason;return false;}
  const m=this.main!,v=this.vice!,p=fusionInput(m)!,oldScore=p.allFen;let roll=999;if(p.allFen>3000&&p.element!==0){const draw=this.random();if(!Number.isFinite(draw)||draw<0||draw>=1){this.feedback='随机输入无效，未消耗';return false;}roll=Math.floor(draw*1000);}
  const result=petFusionNumbers(p,{type:v.type,allFen:petDetails(v)!.allFen},preview.need!,this.useGrass,preview.grass?.[1]??0,()=>roll);if(!result.accepted)return false;
  if(preview.grass)consume(this.reward.bag,preview.grass[0]);
  for(const key of ['rateLife','rateMinAttack','rateMaxAttack','rateDefense','element'] as const)m[key]=result.pet[key];
  if(v.battle)this.progression.toggle(v);this.reward.pets.splice(this.reward.pets.indexOf(v),1);this.reward.petCollectionEdited=true;this.vice=undefined;
  if(m.zs<m.maxZs)m.zs++;if((m.oldLevels??1)<m.levels){m.oldLevels=m.levels;m.oldNowExp=m.nowExp??0;m.oldMaxExp=m.maxExp??Math.floor(m.levels*9);}m.levels=1;m.nowExp=0;m.maxExp=9;
  const score=petDetails(m)!.allFen;let balls=0;const wanted=this.useExp?(score>=3000?2:score>=500?1:0):0;
  if(count(this.reward.bag,'经验球')>=wanted)for(let n=0;n<wanted;n++){if(!grantPetExperience(m,2000,this.progression.roleLevel(),this.progression.bells[this.progression.slots.indexOf(m)]))break;consume(this.reward.bag,'经验球');balls++;}
  m.life=this.progression.details(m)!.maxLife;this.feedback=`幻化成功：评分提高 ${Math.floor((score-oldScore)*10)/10}；消耗副兽 ${v.type}${preview.grass?'、'+preview.grass[0]:''}；经验球 ${balls}；等级 ${m.levels}，生命已恢复`;this.reward.messages.push(this.feedback);return true;
 }
}
