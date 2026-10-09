const equipment=['头盔','衣服','武器','鞋'];
const exchangeTypes=[...equipment,'庇护铃铛','翡翠铃铛','凤翼铃铛'];
export function npcExperienceBalls(item:{type:string;grade:number;holes:number}){
 if(!exchangeTypes.includes(item.type))return undefined;
 return item.grade+1+(item.holes===1?1:item.holes===2?3:item.holes===3?6:0);
}
export function npcDonationMerit(item:{type:string;grade:number}){
 if(!exchangeTypes.includes(item.type))return undefined;
 return [50,100,150,200,400][item.grade]??0;
}
/** Ordered item factory requests; the caller's return contract consumes the
 * input only after success. Factory failures have no rollback in source. */
export function npcDismantleItems(item:{type:string;grade:number;holes:number;levels:number;mhdj:number;element:number}){
 if(!equipment.includes(item.type))return undefined;
 const items:string[]=[];
 const grade=[['魔魂晶石'],['幻魔晶石'],['灵魂晶石'],['灵魂晶石','灵魂晶石'],['小元素石'],['大元素石']][item.grade];
 if(grade)items.push(...grade);
 if(item.holes===1)items.push('初级月光宝盒');
 if(item.holes===2)items.push('初级月光宝盒','初级月光宝盒','初级月光宝盒');
 if(item.holes===3)items.push('中级月光宝盒','中级月光宝盒');
 if(item.levels>=60)items.push('幻魔之心');
 for(let i=0;i<Math.floor(item.mhdj/6)&&i<=6;i++)items.push('魔魂之心');
 const element=['','风元素','火元素','水元素','地元素','雷元素'][item.element];if(element)items.push(element);
 return items;
}
export function lifeSourcePetScore(level:number){return level<5?1000:level<10?2000:level<15?3000:4000}
export const NPC_EXCHANGE_SEMANTICS={
 experience:'accept four equipment and three bells; replace source slot with experience balls, salePrice=50; return false even after replacement',
 donation:'same accepted types; grades outside 0..4 award 0 but still clear the slot; militaryExploitUp owns rank progression',
 dismantle:'four equipment only; grade/holes/level/mhdj/element outputs combine independently; magic hearts loop admits indices 0..6 (at most 7), displayed floor(mhdj/6) can differ',
 lifeSource:'only 圣天使雷斯/圣天使奈丽; score threshold from old lifeSourseLevels; delete pet then increment level; first band also writes stray nimFen=1000; no explicit upper level guard',
} as const;
