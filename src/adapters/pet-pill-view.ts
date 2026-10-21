import type {Journey} from '../domain/journey.ts';
import {PILL_RECIPES} from '../domain/pet-pill-crafting.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class PetPillView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='pet-pill-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','幻兽幻化师');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.petPill;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.selected,s.feedback,s.reward.ms]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭幻化师',()=>s.close()),node('h2','幻兽幻化师 · 转世丹制作'),node('p',`魔石 ${s.reward.ms.toLocaleString('en-US')} · 每次费用1000；余额须大于1000。`));
  if(s.selected===null){this.panel.append(button('我要进行转世幻化',()=>{s.close();this.j.petRebirthFusion?.show();}));this.panel.append(button('我想进行主属性幻化',()=>{s.close();this.j.petMainFusion?.show();}));PILL_RECIPES.forEach((p,i)=>this.panel.append(button(`用${p.count}个${p.name??p.type}制作${p.output}个转世丹`,()=>s.select(i,rev))));this.panel.append(node('p','制作后在幻兽详情使用，每丹最多增加10次转世。背包满时产物会掉落地面。社交服务尚未开放。'));}
  else{const p=PILL_RECIPES[s.selected]!;this.panel.append(node('p',`消耗${p.count}个${p.name??p.type}和1000魔石，获得${p.output}个幻兽转世丹。`),button('确认制作转世丹',()=>{s.confirm(rev);}),button('取消制作',()=>s.cancel(rev)));}
  const feedback=node('p',s.feedback);feedback.id='pet-pill-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
