import type {Journey} from '../domain/journey.ts';import {DONATION_COSTS,DONATION_TYPES} from '../domain/palace-donation.ts';import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class PalaceView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='palace-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','元帅捐献');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.palace;this.panel.hidden=!s?.open;if(!s)return;const i=s.inventory,r=i.reward,key=JSON.stringify([s.open,s.revision,s.feedback,r.bag,r.ms,i.chaw,i.currentMilitaryRank]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭元帅',()=>s.close()),node('h2','元帅 · 任务与捐献'),node('p',`爵位 ${ROLE_PROGRESSION_RULES.nobility[i.chaw]!.name} · 军衔 ${ROLE_PROGRESSION_RULES.militaryRanks[i.currentMilitaryRank]} · 魔石 ${r.ms}`));
 if(s.pending)this.panel.append(node('p',s.feedback),button(s.pending.kind==='quest'?'确认接取':'确认捐献',()=>s.confirm(rev)),button(s.pending.kind==='quest'?'取消接取':'取消捐献',()=>s.cancel(rev)));
 else{for(const name of ['爵位','军衔'] as const)if(s.quests?.eligible(name))this.panel.append(button('任务：'+name,()=>s.quest(name,rev)));DONATION_COSTS.forEach(cost=>this.panel.append(button(`捐献${cost}魔石`,()=>s.money(cost,rev))));this.panel.append(node('h3','捐献背包装备'));r.bag.forEach((item,index)=>{if(item&&DONATION_TYPES.includes(item.type))this.panel.append(button(`捐献第${index+1}格 ${item.name??item.type}`,()=>s.equipment(index,item,rev)));});this.panel.append(node('p','任务进度和奖励可在下方任务栏查看。社交尚未开放。捐献需要已有相应资格；勇士勋章可增加功勋与军功。达到上限后捐献仍消耗财物。'),node('p',s.feedback));}
 }
}
