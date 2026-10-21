import {bellBonuses} from './pet-bells.ts';
import type {Item} from './npc-reward.ts';
import {PET_SPECIES} from '../content/pet-species-data.ts';
import {PET_SCORE_RULES} from '../content/pet-score-rules.ts';
import {PET_ATTRIBUTE_RULES} from '../content/pet-attribute-rules.ts';
import type {PetRecord} from './npc-reward.ts';
export const PET_DETAIL_FIELDS=['nowLifeLv','rareFen','nowExp','maxExp','oldLevels','oldNowExp','oldMaxExp','nextLvRate','sd','qyg'] as const;
export function petDetails(p:PetRecord,bell?:Item|null){
 const species=PET_SPECIES[p.type],generation=p.nowLifeLv??0;
 if(!species||!Number.isInteger(generation)||generation<0||generation>2||![p.levels,p.zs,p.rateLife,p.rateMinAttack,p.rateMaxAttack,p.rateDefense].every(Number.isFinite))return null;
 const element=PET_SCORE_RULES.elements[p.element];if(!element)return null;
 const title=PET_SCORE_RULES.titles[p.titleNum as keyof typeof PET_SCORE_RULES.titles];
 const extra=p.battle?bellBonuses(bell):[0,0,0,0];if(!extra)return null;const bonus=PET_ATTRIBUTE_RULES.elementBonuses[p.element]!.map((v,i)=>v+extra[i]!);
 const axes=['Life','MinAttack','MaxAttack','Defense'] as const;
 const attributes=axes.map((axis,i)=>{
  const base=species['max'+axis+'Fen']!,main=base>0,maxRate=species['maxRate'+axis]!*(main?1.5**generation:1),maxScore=base+(main?generation*1000:0),rate=p[('rate'+axis) as 'rateLife'];
  // Source NaN setter leaves an unset score at the codec's zero default.
  const score=maxRate===0?0:maxScore*(rate-maxRate/2)/(maxRate/2);
  return {axis,main,rate,maxRate,maxScore,score,value:Math.round(rate*(p.levels+5)*(1+bonus[i]!*0.01))};
 });
 const mainFen=attributes.reduce((sum,a)=>sum+a.score,0),rareFen=Math.max(species.rareFen!,p.rareFen??species.rareFen!),zsFen=p.zs*10,titleFen=title?.score??0,allFen=mainFen+rareFen+zsFen+element.score+titleFen;
 if(!Number.isFinite(allFen)||attributes.some(a=>!Number.isFinite(a.value)))return null;
 return {attributes,maxLife:attributes[0]!.value,minAttack:attributes[1]!.value,maxAttack:attributes[2]!.value,defense:attributes[3]!.value,mainFen,rareFen,zsFen,elementFen:element.score,titleFen,allFen,stars:Math.floor(allFen)/100,elementName:element.name,titleName:title?.name??'无',generation:generation+1};
}
