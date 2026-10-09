/** RoleMC.init/flashAttribute. Plain numeric inputs; view refresh belongs to the adapter.
 * Pet panel contributions are inputs here; their own derivation belongs to DATA-018. */
export type NumericFields = Record<string, number>;
export interface BattlePanelNumbers {isOpen:boolean;inOne:boolean;minAttack:number;maxAttack:number;defense:number;attackFire:number}
export function roleAttributes(role:NumericFields,equipment?:NumericFields,panels:readonly BattlePanelNumbers[]=[]):NumericFields {
 const out:NumericFields={
  moreMinAttack:role.skillAttack+role.moreExpAttack,moreMaxAttack:role.skillAttack+role.moreExpAttack,
  moreDefense:role.skillDefense+role.moreExpDefense,moreLife:role.moreExpLife,moreMp:role.moreExpMp,
  moreExp:0,reduceDamage:0,wind:0,soil:0,fire:0,water:0,renew:0,
  burst:role.skillBurst+role.baseBurst,jook:role.skillJook+role.baseJook,
  godFire:Number.isNaN(role.godFire)||role.godFire===undefined?0:role.godFire,
  titleFire:role.titleLevel*2,
 };
 out.attackFire=role.militaryRankFire+role.chawFire+out.titleFire+role.moreExpFire+role.skillAddFire+out.godFire;
 if(equipment)for(const field of ['burst','jook','moreMinAttack','moreMaxAttack','moreDefense','reduceDamage','moreExp','moreLife','moreMp','wind','soil','fire','water','renew','attackFire'])out[field]+=equipment[field];
 for(const [field,rate,skill,bonus] of [
  ['maxLife','rateLife','skillLife','moreLife'],['maxMp','rateMp','skillMp','moreMp'],
  ['minAttack','rateMinAttack',null,'moreMinAttack'],['maxAttack','rateMaxAttack',null,'moreMaxAttack'],['defense','rateDefense',null,'moreDefense'],
 ] as const)out[field]=Math.round((role[rate]*(role.levels+5)+(skill?role[skill]:0)+(equipment?equipment[field]:0))*(1+out[bonus]*.01));
 out.maxLifeSourse=out.maxLife*role.lifeSourseLevels;out.maxMpSourse=out.maxMp*role.mpSourseLevels;
 out.attackFire+=role.levels;
 for(const panel of panels.slice(0,3))if(panel.isOpen){
  if(panel.inOne)for(const field of ['minAttack','maxAttack','defense'] as const)out[field]+=panel[field];
  out.attackFire+=panel.attackFire;
 }
 return out;
}
/** Numeric codec fields with no range clamp; invalid writes preserve prior state. */
export const ROLE_PLAIN_NUMERIC_FIELDS=['xxx_burst','baseBurst','xxx_jook','baseJook','wind','soil','fire','water','renew','attackFire','minAttack','maxAttack','defense','speedX','speedY','attackLength','attackHeight','attackStopTime','rateLife','rateMp','rateMinAttack','rateMaxAttack','rateDefense'] as const;
export function roleNumericWrite(previous:number,next:number):number{return Number.isNaN(next)?previous:next;}
export const ROLE_NUMERIC_ALIASES={burst:'xxx_burst',jook:'xxx_jook',nowExp:'xxx_nowExp',credit:'xxx_credit',ms:'xxx_ms',res:'xxx_res'} as const;
