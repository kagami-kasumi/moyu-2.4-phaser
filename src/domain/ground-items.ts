import type {Drop,Item,NpcReward} from './npc-reward.ts';

/** Source pickup gates and order: ground-items/source-contract.md. */
export function groundItemName(item:Item):string {
 const grade=['','良品','上品','精品','极品','神品','上神品'][Number(item.grade)]??'';
 if(['头盔','衣服','武器','鞋'].includes(item.type))return grade+(item.name??item.type);
 if(['幸运符','庇护铃铛','翡翠铃铛','凤翼铃铛'].includes(item.type))return grade+item.type;
 return ['戒指','技能书','药品','宝石'].includes(item.type)?item.name??item.type:item.type;
}
export function pickUp(reward:NpcReward,drop:Drop):boolean {
 const index=reward.drops.indexOf(drop);
 if(index<0||!drop.item||!drop.item.type||['空格','技能图标'].includes(drop.item.type))return false;
 // The original rejects a full bag BEFORE trying to merge existing stacks.
 if(!reward.bag.some(slot=>slot===null)){reward.messages.push('你的背包没有空格了');return false;}
 reward.store(drop.item);
 reward.drops.splice(index,1);
 reward.messages.push('获得  '+groundItemName(drop.item));
 return true;
}
export function autoPickUp(reward:NpcReward,x:number,y:number):number {
 let count=0;
 for(const drop of [...reward.drops].reverse())if(Math.abs(drop.x-x)<100&&Math.abs(drop.y-y)<50&&pickUp(reward,drop))count++;
 return count;
}
