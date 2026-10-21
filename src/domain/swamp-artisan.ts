import {literalItem} from '../content/registry.ts';
import type {Item,NpcReward} from './npc-reward.ts';
import {consumeTradeMaterial} from './outskirts-trade.ts';
type Material={name:string;count:number;missing:string};
const material=(name:string,count:number,missing:string):Material=>({name,count,missing});
export const ARTISAN_RECIPES=[
 {cmd:10101,result:'魔魂之心',level:0,credit:0,checks:[material('灵魂晶石',2,'你的背包里没有足够的 灵魂晶石')],primary:material('魔魂晶石',5,'你的背包里没有足够的 魔魂晶石')},
 {cmd:10102,result:'幻魔之心',level:0,credit:0,checks:[material('灵魂晶石',3,'你的背包里没有足够的 灵魂晶石')],primary:material('幻魔晶石',5,'你的背包里没有足够的 幻魔晶石')},
 {cmd:10103,result:'灵魂王',level:0,credit:1,checks:[],primary:material('灵魂晶石',10,'你的背包里没有足够的 灵魂晶石')},
 {cmd:10104,result:'小元素石',level:100,credit:0,checks:[material('灵魂晶石',1,'你没有 灵魂晶石'),material('幻魔晶石',1,'你没有 幻魔晶石')],primary:material('魔魂晶石',1,'你没有 魔魂晶石')},
 {cmd:10105,result:'大元素石',level:100,credit:0,checks:[material('灵魂晶石',5,'你没有足够的 灵魂晶石'),material('幻魔之心',1,'你没有 幻魔之心')],primary:material('魔魂之心',1,'你没有 魔魂之心')},
 {cmd:10106,result:'大元素石',level:100,credit:0,checks:[material('初级月光宝盒',1,'你没有 初级月光宝盒')],primary:material('小元素石',4,'你背包里没有足够的 小元素石')},
 {cmd:10107,result:'大元素石',level:100,credit:0,checks:[],primary:material('灵魂王',1,'你没有 灵魂王')},
] as const;
export function artisanCount(bag:readonly (Item|null)[],name:string){return bag.reduce((sum,item)=>sum+(item?.type==='宝石'&&(item.name===name||item.name===undefined)?item.number||1:0),0);}
export class SwampArtisan {
 open=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward,private level:()=>number,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 canInteract(){return this.available();}
 interact(){if(!this.canInteract())return false;this.reward.close();this.open=true;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.revision++;}
 craft(command:number,revision=this.revision){
  const recipe=ARTISAN_RECIPES.find(r=>r.cmd===command);if(!recipe||!this.open||!this.canInteract()||revision!==this.revision)return false;
  this.revision++;const fail=(message:string,announce=true)=>{this.feedback=message;if(announce)this.reward.messages.push(message);return false;};
  if(this.level()<recipe.level)return fail('要求100级以上才可以帮你合。你的等级还不够。',false);
  if(this.reward.credit<recipe.credit)return fail('你的声望不够');
  for(const check of recipe.checks)if(artisanCount(this.reward.bag,check.name)<check.count)return fail(check.missing);
  if(!consumeTradeMaterial(this.reward.bag,recipe.primary.name,recipe.primary.count))return fail(recipe.primary.missing);
  // Original commands deliberately ignore these later return values, including
  // overlap from unnamed legacy gems. Preserve their ordered semantics.
  for(const check of recipe.checks)consumeTradeMaterial(this.reward.bag,check.name,check.count);
  this.reward.credit-=recipe.credit;const drops=this.reward.drops.length;
  this.reward.store(literalItem(recipe.result),this.position(),this.contains);
  this.feedback='获得'+(command<=10103?'高级':'')+'宝石 '+recipe.result;this.reward.messages.push(this.feedback);
  if(this.reward.drops.length>drops)this.feedback+='；背包已满，产物落在地上。';return true;
 }
}
