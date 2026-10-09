import {literalItem} from '../content/registry.ts';
import {ITEM_PETS} from '../content/item-pets.ts';
import {ITEM_STACK_RULES} from '../content/item-stack-rules.ts';
import {MEDAL_RULES,REWARD_EQUIPMENT} from '../content/implemented-gameplay-rules.ts';
import {ORIGINAL_START_GRANTS} from '../content/original-start.ts';
import {ROLE_CURRENCY_RULES,roleCurrencyWrite} from '../content/role-state-rules.ts';
import {refreshEquipmentAttributes} from './equipment-attributes.ts';
import {RING_RULES,starterRingSeed} from '../content/ring-rules.ts';
import type {Profession} from '../content/character-entry.ts';
/** Bounded first reward rules. Source locators: docs/reverse-engineering/npc-reward/source-contract.md. */
export interface Item {type:string;name?:string;number?:number;salePrice?:number;[key:string]:string|number|undefined}
export interface PetRecord {type:string;levels:number;zs:number;maxZs:number;element:number;titleNum:number;rateLife:number;rateMinAttack:number;rateMaxAttack:number;rateDefense:number;battle:boolean}
export interface Drop {item:Item;x:number;y:number}
export interface Answer {txt:string;cmd:number}
const ZERO_FIELDS=['minAttack','maxAttack','mMinAttack','mMaxAttack','defense','mDefense','element','wind','fire','soil','water','holes','hole1','gem1','gem11','hole2','gem2','gem12','hole3','gem3','gem13','additional','spirit','spiritVal','spiritLevels','spiritExp'];
export function rewardEquipment(profession:Profession='战士'):Item[]{return REWARD_EQUIPMENT.map(seed=>{
 if(profession==='法师'&&seed.type==='衣服')return {type:'衣服',grade:1,name:'旅者装',mhdj:3,vocational:'法师',levels:1,defense:2,mDefense:1};
 const item:Item={...seed,vocational:profession,levels:1};for(const k of ZERO_FIELDS)item[k]=0;
 refreshEquipmentAttributes(item);return item;
 });}
export function newRing(random:(n:number)=>number):Item{
 const main=[...RING_RULES.mainPool],pair=[...RING_RULES.pairPool];
 const take=(pool:string[])=>pool.splice(random(pool.length),1)[0]!;
 const mainType1=take(main),mainType2=take(main),pairType1=take(pair),pairType2=take(pair),pairType3=take(pair),pairType4=take(pair);
 const item:Item={...starterRingSeed(),salePrice:RING_RULES.salePrice,mainType1,mainType2,pairType1,pairType2,pairType3,pairType4};
 for(const key of [mainType1,mainType2])item[key]=RING_RULES.mainValue[key as keyof typeof RING_RULES.mainValue][Number(item.grade)]!/RING_RULES.starterDivisor;
 return item;
}
/** map frame2 debug(), after wudi; sample selectors before numeric attributes. */
export function debugRing(random:(n:number)=>number):Item{
 const main:string[]=[...RING_RULES.mainPool],pair:string[]=[...RING_RULES.pairPool],take=(p:string[])=>p.splice(random(p.length),1)[0]!;
 const selectors={mainType1:take(main),mainType2:take(main),pairType1:take(pair),pairType2:take(pair),pairType3:take(pair),pairType4:take(pair)};
 const item:Item={type:'戒指',grade:4,name:'结婚戒指',mhdj:0,moreAttack:0,moreDefense:0,moreLife:0,moreMp:0,attack:50+random(51),defense:20+random(31),maxLife:400+random(201),maxMp:400+random(201),otherFire:5+random(4),reduceDamage:5+random(4),burst:8+random(5),jook:8+random(5),...selectors,salePrice:10};
 for(const k of [selectors.mainType1,selectors.mainType2])item[k]=RING_RULES.mainValue[k as keyof typeof RING_RULES.mainValue][4];return item;
}
export class NpcReward {
 private currencyMs=roleCurrencyWrite(0,ROLE_CURRENCY_RULES.startingWrite);
 private currencyRes=roleCurrencyWrite(0,ROLE_CURRENCY_RULES.startingWrite);
 get ms(){return this.currencyMs;} set ms(value:number){this.currencyMs=roleCurrencyWrite(this.currencyMs,value);}
 get res(){return this.currencyRes;} set res(value:number){this.currencyRes=roleCurrencyWrite(this.currencyRes,value);}
 credit=500;titleLevel=10;
 readonly capacity=40;readonly petCapacity=40;bag:(Item|null)[]=Array.from({length:40},()=>null);pets:PetRecord[]=[];drops:Drop[]=[];messages:string[]=[];
 cmd=1;nextCmd=1;open=false;words='';answers:Answer[]=[];revision=0;claimedPack:number|null=null;
 constructor(readonly name:string,private random:(n:number)=>number=n=>Math.floor(Math.random()*n),readonly profession:Profession='战士',position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true,initialize=true){
  if(!initialize)return;
  this.pets.push({...ITEM_PETS['凯恩']!,battle:true});
  for(const item of [literalItem('富豪礼包'),literalItem('英雄令'),literalItem('英勇'),newRing(random)])this.store(item);
  for(const item of ORIGINAL_START_GRANTS)this.store(item);
  if(name.toLowerCase()==='debug'){
   this.store(debugRing(random),position,contains);this.ms+=502800;this.res+=1010000;
   for(const item of [{type:'经验球',number:99},{type:'超级经验球',number:99},{type:'幸运幻化草',number:99},{type:'勇士勋章',number:99},{type:'灵魂礼包',number:99},{type:'宝石',name:'雷元素',number:5},...['炫舞牛','霹雳虎','异界精灵','嘻哈牛','玲珑虎'].map(type=>({type}))])this.store(item,position,contains);
  }
 }
 store(value:Item,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  const item={...value};if((item.number??0)>0){for(const slot of this.bag){if(slot&&slot.type===item.type&&(slot.name===undefined||slot.name===item.name)&&(slot.number??0)>0&&slot.number!<ITEM_STACK_RULES.maxQuantity){const n=Math.min(item.number!,ITEM_STACK_RULES.maxQuantity-slot.number!);slot.number!+=n;item.number!-=n;if(item.number!<=0)return true;}}}
  const index=this.bag.findIndex(slot=>!slot);if(index>=0){this.bag[index]={...item,number:item.number??0};return true;}
  let x=position.x+75-this.random(150),y=position.y+25-this.random(50);if(!contains(x,y)){x=position.x;y=position.y;}
  this.drops.push({item:{...item,number:item.number??0},x,y});this.messages.push('背包已满，物品掉落在地上了');return true;
 }
 interact(){this.execute(this.nextCmd);}
 close(){this.open=false;this.revision++;}
 private consumeMedals(){
  const matches=(item:Item|null):item is Item=>item?.type==='勇士勋章'&&item.name===undefined;
  const count=(item:Item)=>item.number===undefined||item.number===0||Number.isNaN(item.number)?1:item.number;
  if(this.bag.reduce((total,item)=>total+(matches(item)?count(item):0),0)<MEDAL_RULES.exchangeCost)return false;
  let remaining=MEDAL_RULES.exchangeCost as number;
  for(let i=0;i<this.bag.length&&remaining>0;i++){
   const item=this.bag[i];if(!item||!matches(item))continue;
   if(item.number===undefined||item.number===0){this.bag[i]=null;remaining--;}
   else if(item.number>remaining){item.number-=remaining;remaining=0;}
   else{remaining-=item.number;this.bag[i]=null;}
  }
  return true;
 }
 choose(cmd:number,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  if(!this.open||revision!==this.revision||!this.answers.some(a=>a.cmd===cmd))return false;
  if(cmd===-1){this.close();return true;}this.nextCmd=cmd;this.execute(cmd,position,contains);return true;
 }
 private execute(cmd:number,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  this.open=true;this.revision++;this.answers=[];
  if(cmd===1){this.words=this.name+',你是新来的吧。我这里有些东西我已经用不上了,你挑几样去吧。';this.answers=[{txt:'嘿嘿,我不会客气的',cmd:2}];}
  else if(cmd===2){this.words='哎,现在的年轻人真不懂礼貌。你挑一包去吧\r礼包一：上品+9武器、良品衣服、莎菲幻兽\r礼包二：雪瑞幻兽、灵魂礼包\r礼包三：圣天使雷斯幻兽、圣天使奈丽幻兽';this.answers=[{txt:'我要礼包一',cmd:3},{txt:'我要礼包二',cmd:4},{txt:'我要礼包三',cmd:5}];this.nextCmd=this.cmd;}
  else if(cmd>=3&&cmd<=5&&this.cmd===1){
   this.cmd=6;this.claimedPack=cmd-2;
   const gifts:Item[]=cmd===3?[literalItem('莎菲'),...rewardEquipment(this.profession)]:cmd===4?[literalItem('雪瑞'),literalItem('灵魂礼包')]:[literalItem('圣天使雷斯'),literalItem('圣天使奈丽')];
   for(const item of gifts)this.store(item,position,contains);
   this.words=cmd===3?'你已经获得了礼包一,祝你游戏愉快':cmd===4?'你已经获得了礼包二,希望你能多多打BOSS':'你已经获得了礼包三,接下来就看你的了,我相信你是个高手';this.answers=[{txt:'谢谢',cmd:-1}];this.nextCmd=this.cmd;
  }else if(cmd===6){this.words='如果你能拿得到2个勇士勋章给我,我可以给你一个月光宝盒。';this.answers=[{txt:'我已经拿来了',cmd:7},{txt:'我不想要',cmd:-1}];this.nextCmd=this.cmd;}
  else if(cmd===7){
   this.nextCmd=this.cmd;
   if(this.consumeMedals()){
    this.store(literalItem('初级月光宝盒'),position,contains);
    this.messages.push('获得初级月光宝盒');this.close();return;
   }
   this.words='你的物品栏里没有2个勇士勋章啊。';this.answers=[{txt:'还是蒙不了你',cmd:-1}];
  }
 }
 leaveMap(){this.close();this.drops=[];}
 snapshot(){return {cmd:this.cmd,nextCmd:this.nextCmd,open:this.open,words:this.words,answers:structuredClone(this.answers),bag:structuredClone(this.bag),pets:structuredClone(this.pets),drops:structuredClone(this.drops),claimedPack:this.claimedPack,messages:[...this.messages]};}
}
