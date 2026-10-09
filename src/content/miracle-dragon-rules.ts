/** Original seed generator; registration utility, not an enabled inventory action. */
export const MIRACLE_DRAGON_RULES={
 source:{file:'frame_9/DoAction.as',line:616},
 baseSpans:[35,3,3,2],
 boostedSpans:[105,9,9,6],
 selection:'random(4) boosts exactly one span',
 drawOrder:['life','minAttack','maxAttackIncrement','defense'],
 quantization:10000,
 lifeOffset:1,
 seed:{type:'奇迹龙',levels:1,zs:0,maxZs:1000,element:0,titleNum:0},
 consumption:'one item only if addHuanShou returns truthy; failed capacity leaves count unchanged',
} as const;
export function miracleDragonSeed(branch:number,draws:readonly number[]){
 if(!Number.isInteger(branch)||branch<0||branch>3||draws.length!==4||draws.some(v=>!Number.isFinite(v)||v<0||v>=1))throw Error('Invalid source random draws');
 const spans:number[]=[...MIRACLE_DRAGON_RULES.baseSpans];spans[branch]=MIRACLE_DRAGON_RULES.boostedSpans[branch];
 const round=(v:number)=>Math.round(10000*v)/10000;
 const rateLife=round(draws[0]*spans[0]+1),rateMinAttack=round(draws[1]*spans[1]);
 const rateMaxAttack=round(rateMinAttack+draws[2]*spans[2]),rateDefense=round(draws[3]*spans[3]);
 const rareFen=200+Math.round(200*(rateLife/spans[0]+rateMinAttack/spans[1]+(rateMaxAttack-rateMinAttack)/spans[2]+rateDefense/spans[3]));
 return {...MIRACLE_DRAGON_RULES.seed,rateLife,rateMinAttack,rateMaxAttack,rateDefense,rareFen};
}
