export interface FusionPet {
 type:string;levels:number;allFen:number;zs:number;maxZs:number;element:number;
 rateLife:number;rateMinAttack:number;rateMaxAttack:number;rateDefense:number;
 maxRateLife:number;maxRateMinAttack:number;maxRateMaxAttack:number;maxRateDefense:number;
 maxLifeFen:number;maxMinAttackFen:number;maxMaxAttackFen:number;maxDefenseFen:number;
}
const fields=[['rateLife','maxRateLife','maxLifeFen'],['rateMinAttack','maxRateMinAttack','maxMinAttackFen'],['rateMaxAttack','maxRateMaxAttack','maxMaxAttackFen'],['rateDefense','maxRateDefense','maxDefenseFen']] as const;
/** No zero-denominator guard or upper clamp exists in the source. */
export function fusionViceScore(p:FusionPet){
 let score=0;
 for(const [rate,max,weight]of fields){const half=p[max]/2;score+=p[weight]*(p[rate]-half)/((p[max]-half)*3);}
 return score<100?100:Math.floor(score/10)*10;
}
/** Growth fusion only. Callers retain turn/reset/checkUp in that order through
 * pet-reset-rules and pet-score-rules; this module does not duplicate them. */
export function petFusionNumbers(main:FusionPet|undefined,vice:Pick<FusionPet,'type'|'allFen'>|undefined,needFen:number,useGrass:boolean,grassBonus:number,random:(count:number)=>number){
 if(!main)return {accepted:false as const,reason:'missing-main'};
 if(main.zs>=main.maxZs)return {accepted:false as const,reason:'turn-limit'};
 if(!vice)return {accepted:false as const,reason:'missing-vice'};
 if(vice.type!==main.type&&vice.type!=='奇异兽')return {accepted:false as const,reason:'vice-type'};
 if(vice.allFen<needFen)return {accepted:false as const,reason:'vice-score'};
 if(main.allFen>=500&&main.levels<20)return {accepted:false as const,reason:'level-20'};
 if(main.allFen>=3000&&main.levels<30)return {accepted:false as const,reason:'level-30'};
 const multiplier=useGrass?1+grassBonus:1;
 if(useGrass&&multiplier===1)return {accepted:false as const,reason:'missing-grass'};
 const pet={...main};
 for(const [rate,max,weight]of fields)if(pet[weight]>0){
  const half=pet[max]/2;let gain=(pet[max]-pet[rate])/100;
  if(gain<0)gain=(pet[max]-half)*2.5/6000;
  else if(gain<(pet[max]-half)/1000)gain=(pet[max]-half)/1000;
  pet[rate]+=multiplier*gain;
 }
 if(pet.allFen>3000&&pet.element!==0&&random(1000)<10)pet.element=5;
 return {accepted:true as const,pet};
}
export const PET_FUSION_SEQUENCE=['consume-first-available-grass-if-enabled','grow-four-rates','optional-element-roll','delete-vice','turned','checkUp','optional-exp-balls','refresh-score-requirement','restore-battle-panel-life'] as const;
export const FUSION_GRASSES=[['幸运幻化草',1],['大幻化草',0.8],['中幻化草',0.5],['小幻化草',0.2]] as const;
export const PET_REINCARNATION_RULES={minLevel:30,cost:{type:'宝石',name:'灵魂晶石',number:1},displayedScoreGain:10,autoExpBeforeLevelGuard:true} as const;
/** Title panel does not spend its declared price=100. Reverse search: last match
 * wins; no match still reports success, but grants no title/maxZs. */
export function petTitleNumbers(p:{type:string;allFen:number;titleNum:number;maxZs:number}|undefined,titles:readonly {type:string;number:number}[]){
 if(!p||p.allFen<5000||p.titleNum>0)return {accepted:false as const};
 const pet={...p},next=titles.map(t=>({...t}));
 for(let i=next.length-1;i>=0;i--)if(next[i]!.type===pet.type){pet.titleNum=next[i]!.number+2;if(next[i]!.number>0)next[i]!.number--;pet.maxZs+=50;break;}
 return {accepted:true as const,pet,titles:next};
}
