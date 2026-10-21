import type {Item,NpcReward} from './npc-reward.ts';import {literalItem} from '../content/registry.ts';import {consumeTradeMaterial} from './outskirts-trade.ts';
export const PALACE_PRIZES=[
 ['凯恩','高级经验宝石','高级经验宝石','中级战斗力宝石','9朵玫瑰','极品玉石','12星奇异兽','8星奇异兽','6星奇异兽','奇异兽'],
 ['高级攻击宝石','高级减伤害宝石','高级战斗力宝石','守护者','鼠来福','幻魔之心','魔魂之心','初级月光宝盒','大魔石袋子','勇士勋章'],
 ['灵魂王','紫水晶','陨铁矿','玄铁矿','强健之术','智慧之术','吉祥噜噜','如意嘟嘟','鼠来运','眺望者'],
 ['狄克牛','发条虎','蝴蝶牛','乖乖虎','玲珑虎','嘻哈牛','神影兽','炫舞牛','霹雳虎','异界精灵']
] as const;
const gems:Record<string,readonly [number,number]>={'高级攻击宝石':[15,1000],'高级减伤害宝石':[8,1000],'高级经验宝石':[25,500],'高级战斗力宝石':[5,2000]};
export function palacePrize(name:string):Item{const gem=gems[name];return gem?{type:'宝石',name,val1:gem[0],salePrice:gem[1]}:literalItem(name);}
export function choosePalacePrize(random:(n:number)=>number){const value=random(10000),slot=random(10);if(!Number.isInteger(value)||value<0||value>=10000||!Number.isInteger(slot)||slot<0||slot>=10)throw Error('抽样结果无效');const tier=value<4000?0:value<7000?1:value<9000?2:3;return PALACE_PRIZES[tier][slot]!;}
export class PalaceLottery {
 open=false;pending=false;revision=0;feedback='';lastPrize:Item|null=null;
 constructor(readonly reward:NpcReward,private available:()=>boolean,private elapsed:()=>number,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean,private random:(n:number)=>number=n=>Math.floor(Math.random()*n)){}
 get waiting(){return this.elapsed()<=300000;}get remainingSeconds(){return Math.max(0,Math.floor((300000-this.elapsed())/1000)+1);}
 show(){if(!this.available())return false;this.open=true;this.pending=false;this.feedback='';this.lastPrize=null;this.revision++;return true;}
 close(){this.open=false;this.pending=false;this.revision++;}
 private valid(rev:number){return this.open&&this.available()&&rev===this.revision;}
 request(rev=this.revision){if(!this.valid(rev))return false;this.revision++;this.pending=false;if(this.waiting){this.feedback='刚刚读取游戏，5分钟后才可以抽奖。';return false;}this.pending=true;this.feedback='确认消耗1颗灵魂晶石打开宝箱？';return true;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=false;this.revision++;this.feedback='已取消，灵魂晶石保留。';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;this.pending=false;this.revision++;if(this.waiting){this.feedback='刚刚读取游戏，5分钟后才可以抽奖。';return false;}if(!consumeTradeMaterial(this.reward.bag,'灵魂晶石',1)){this.feedback='你的背包里没有灵魂晶石了';return false;}const name=choosePalacePrize(this.random),item=palacePrize(name),drops=this.reward.drops.length;this.reward.store(item,this.position(),this.contains);this.lastPrize={...item};this.feedback='获得 '+(['蝴蝶牛','乖乖虎','玲珑虎','嘻哈牛'].includes(name)?'超级幻兽':'')+name;this.reward.messages.push(this.feedback);if(this.reward.drops.length>drops)this.feedback+='；背包已满，奖品掉落在地上，可按空格拾取。';return true;}
}
