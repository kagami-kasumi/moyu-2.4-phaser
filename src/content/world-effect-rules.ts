/** Source timeline counters. Units are activations of the relevant timeline
 * script, not assumed seconds or a universal 15 Hz update rate. */
export function effectCounter(kind:'frost'|'nonDefense'|'heavyDamage',times:number){
 const active=times>0;
 return {times:active?times-(kind==='frost'?2:1):times,visible:active,stop:!active,stopTime:kind==='frost'?(active?5:0):undefined,hit:kind==='heavyDamage'&&active};
}
export function effectDuration(kind:'frost'|'nonDefense',value:number){return Number.isNaN(value)?undefined:value*(kind==='frost'?15:1)}
export const HEAVY_DAMAGE_SOURCE_ANOMALY={file:'DefineSprite_2881/frame_1/DoAction.as',line:22,parameter:'from',readVariable:'form',evidence:'verified-pcode-GetVariable',policy:'preserve unresolved external form; do not silently substitute from'} as const;
/** The buff display uses setInterval(50), independent of movie frame rate. */
export function buffTimerStep(nowTime:number,durationMs:number){return {frame:Math.round(400*nowTime/durationMs)+1,nowTime:nowTime+50,end:nowTime+50>=durationMs}}
export function militaryShare(jobFire:number,rank:number){return Math.floor((50+jobFire)*rank*2/100)}
/** beginEvolve does not abort when payment fails. Payment attempt is only made
 * for a nonzero element; source returns undefined after calling GoEvolve. */
export function petElementEvolution(pet:{allFen:number;element:number}|undefined,random:(n:number)=>number){
 if(!pet||pet.allFen<3000)return {accepted:false as const};
 let element=random(4)+1;if(random(10000)<100)element=5;
 return {accepted:true as const,paymentAttempt:pet.element!==0?100:0,element};
}
