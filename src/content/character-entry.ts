import {WARRIOR_RATES} from './implemented-gameplay-rules.ts';
export type Profession='战士'|'法师';
/** Verified map frame1:2802–2828; frame2 initNewGame and task.nextMainTask. */
export const CHARACTERS={
 战士:{label:'男战士',sex:'男',skill:'斩魂',mainTaskIndex:0,rates:WARRIOR_RATES,baseBurst:3,baseJook:3},
 法师:{label:'女法师',sex:'女',skill:'火球术',mainTaskIndex:1,rates:{rateLife:12,rateMp:9,rateMinAttack:.8,rateMaxAttack:1.6,rateDefense:.2},baseBurst:1,baseJook:1},
} as const;
export function characterStart(name:string,profession:Profession){
 const c=CHARACTERS[profession];
 return {name,profession,sex:c.sex,skills:[{name:c.skill,level:1}],fastKeys:{5:c.skill},mainTask:{index:c.mainTaskIndex,isDoing:true,isComplete:false},credit:500,titleLevel:10,intoV:name.toLowerCase()==='debug'?.5:.05,daoshiLv:0,useRecord:0,demonGeneralRebirth:0,usedTimer:0,readTimes:0};
}
