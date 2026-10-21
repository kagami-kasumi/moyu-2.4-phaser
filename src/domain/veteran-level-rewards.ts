export interface LevelPrizeChoice {cmd:number;txt:string;kind:'box'|'res'|'ms';amount:number;box?:string}
/** Verified cmd8..17: the displayed milestone must be exceeded, not reached. */
export function levelPrize(index:number,level:number){
 const tier=index<6?0:index<11?1:2,threshold=index*10,box=tier===2?'中级月光宝盒':'初级月光宝盒';
 const choices:LevelPrizeChoice[]=[{cmd:9+tier*3,txt:'我要'+box,kind:'box',amount:tier===1?2:1,box},{cmd:10+tier*3,txt:'我要资源',kind:'res',amount:tier===2?200000:50000},{cmd:11+tier*3,txt:'我要魔石',kind:'ms',amount:[500,1000,2000][tier]!}];
 return {threshold,tier,eligible:Number.isSafeInteger(index)&&index>=1&&threshold<level,choices};
}
