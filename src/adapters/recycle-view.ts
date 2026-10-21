import type {Journey} from '../domain/journey.ts';import {RECYCLE_TYPES,recyclePlan} from '../domain/equipment-recycle.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class RecycleView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){const b=node('button','装备回收');b.id='recycle-button';document.getElementById('inventory')!.append(b);this.panel.id='recycle-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','装备回收');document.querySelector('main')!.append(this.panel);b.onclick=()=>{j.warehouse?.close();j.fusion?.close();j.sockets?.close();j.removal?.close();j.experience?.close();j.reward?.close();j.recycle?.show();this.render();};}
 render(){const s=this.j.recycle;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.item,s.pending,s.feedback,s.reward.bag]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭装备回收',()=>s.close()),node('h2','装备回收'),node('p','兑换经验球或分解打造材料。确认后会消耗原装备；关闭面板保留持有物。'),node('p','持有：'+(s.item?(s.item.name??s.item.type)+(s.item.number?' ×'+s.item.number:''):'空')));
  if(s.item)this.panel.append(button('取回回收槽物品',()=>s.take(rev)));
  const select=document.createElement('select');select.setAttribute('aria-label','选择回收装备');select.add(new Option('从背包选择装备',''));const bag=[...s.reward.bag];bag.forEach((v,i)=>{if(v&&RECYCLE_TYPES.includes(v.type))select.add(new Option(`${v.name??v.type} · 品质${v.grade??'?'} · ${v.holes??0}孔（背包${i+1}）`,String(i)));});select.onchange=()=>{const n=Number(select.value),v=bag[n];if(select.value!==''&&v)s.select(n,v,rev);this.render();};this.panel.append(select);
  if(s.pending){const plan=recyclePlan(s.item,s.pending),counts=new Map<string,number>();for(const i of plan.items){const name=i.name??i.type;counts.set(name,(counts.get(name)??0)+(i.number||1));}this.panel.append(node('p',plan.reason),node('p',[...counts].map(([n,c])=>n+' × '+c).join('、')||'无产物'),button('确认回收',()=>s.confirm(rev)),button('取消回收',()=>s.cancel(rev)));}
  else this.panel.append(button('兑换经验球',()=>s.request('experience',rev)),button('分解装备',()=>s.request('dismantle',rev)));
  const feedback=node('p',s.feedback);feedback.id='recycle-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
