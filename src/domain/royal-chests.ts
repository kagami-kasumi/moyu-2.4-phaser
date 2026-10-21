import type {NpcReward,Item} from './npc-reward.ts';import {literalItem} from '../content/registry.ts';
export type RoyalChestKind='prince'|'princess';
export interface RoyalChestState {prince:number|null;princess:number|null}
export const initialRoyalChests=():RoyalChestState=>({prince:4010,princess:4005});
export const ROYAL_CHESTS={prince:{title:'王子的宝箱',first:4010,repeat:4000,material:'极品玉石',heart:'幻魔之心',pool:['幻魔之心','小魔石袋子','中魔石袋子','大魔石袋子','圣天使雷斯']},princess:{title:'公主的宝箱',first:4005,repeat:4002,material:'9朵玫瑰',heart:'魔魂之心',pool:['魔魂之心','奇异兽','6星奇异兽','8星奇异兽','圣天使奈丽']}} as const;
export function royalPrize(kind:RoyalChestKind,value:number){if(!Number.isInteger(value)||value<0||value>=10000)throw Error('抽样结果无效');return ROYAL_CHESTS[kind].pool[value<2000?0:value<4500?1:value<7000?2:value<9500?3:4];}
export function consumeRoyalMaterial(bag:(Item|null)[],type:string){const matches=(i:Item|null)=>i?.type===type&&i.name===undefined;const count=bag.reduce((n,i)=>n+(matches(i)?(!i!.number||Number.isNaN(i!.number)?1:i!.number!):0),0);if(count<1)return false;for(let n=0;n<bag.length;n++){const i=bag[n];if(!matches(i??null))continue;if((i!.number??0)>1)i!.number!--;else bag[n]=null;return true;}return false;}
export class RoyalChests {
 open=false;kind:RoyalChestKind='prince';pending=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward,readonly state:RoyalChestState,private available:(kind:RoyalChestKind)=>boolean,private elapsed:()=>number,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean,private random:(n:number)=>number=n=>Math.floor(Math.random()*n)){}
 get definition(){return ROYAL_CHESTS[this.kind];}get first(){return this.state[this.kind]===this.definition.first;}get known(){return this.first||this.state[this.kind]===this.definition.repeat;}get waiting(){return !this.first&&this.elapsed()<=300000;}
 show(kind:RoyalChestKind){if(!this.available(kind))return false;this.kind=kind;this.open=true;this.pending=false;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.pending=false;this.revision++;}
 private valid(rev:number){return this.open&&this.available(this.kind)&&rev===this.revision;}
 request(rev=this.revision){if(!this.valid(rev))return false;this.pending=false;this.revision++;if(!this.known){this.feedback='旧宝箱状态尚不可识别，已保留原始记录，未领取。';return false;}if(this.waiting){this.feedback='刚刚读取游戏，5分钟后才可以抽奖。';return false;}this.pending=true;this.feedback=this.first?`免费领取2个${this.definition.heart}和1500魔石？`:`消耗1个${this.definition.material}打开宝箱？`;return true;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=false;this.revision++;this.feedback='已取消，未消耗或领取。';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;this.pending=false;this.revision++;if(!this.known||this.waiting){this.feedback='宝箱状态或读档等待条件不满足，未消费。';return false;}const d=this.definition,r=this.reward,before=r.drops.length;
  if(this.first){for(let n=0;n<2;n++)r.store(literalItem(d.heart),this.position(),this.contains);r.ms+=1500;this.state[this.kind]=d.repeat;this.feedback=`获得 2个${d.heart}和1,500魔石`;}
  else{if(!consumeRoyalMaterial(r.bag,d.material)){this.feedback='背包里没有'+d.material;return false;}const prize=royalPrize(this.kind,this.random(10000));r.store(literalItem(prize),this.position(),this.contains);this.feedback='获得 '+prize;}
  r.messages.push(this.feedback);if(r.drops.length>before)this.feedback+='；背包已满，物品掉落在地上。';return true;
 }
}
