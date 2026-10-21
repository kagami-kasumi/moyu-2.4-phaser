import type {Journey} from '../domain/journey.ts';import {PACKING} from '../domain/legion-packing.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class LegionView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='legion-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','军团管理员');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.legion;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.selected,s.feedback]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭军团管理员',()=>s.close()),node('h2','军团管理员'));
  if(s.selected===null){this.panel.append(button('进入我的仓库',()=>{if(!s.open||s.revision!==rev)return;s.close();document.getElementById('inventory')!.hidden=false;document.getElementById('warehouse-button')!.click();}));PACKING.forEach((p,i)=>this.panel.append(button('打包'+p.material,()=>s.select(i,rev))));this.panel.append(node('p','每10件材料打包成1个礼包。军团战斗和军团信息尚未开放。'));}
  else{const p=PACKING[s.selected]!;this.panel.append(node('p',`消耗10个${p.material}，获得1个${p.pack}。`),button('确认打包',()=>{if(s.confirm(rev))this.j.notice="";}),button('取消打包',()=>s.cancel(rev)));}
  const feedback=node('p',s.feedback);feedback.id='legion-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
