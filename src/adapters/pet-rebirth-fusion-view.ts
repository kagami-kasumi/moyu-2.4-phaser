import type {Journey} from '../domain/journey.ts';
import {petDetails} from '../domain/pet-details.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class PetRebirthFusionView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='pet-rebirth-fusion-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','转世幻化');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.petRebirthFusion;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.feedback,s.reward.pets]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭转世幻化',()=>s.close()),node('h2','转世幻化'),node('p','要求30级，消耗1个灵魂晶石；转世+1、评分+10，降至1级，成长率保持。'));
 if(!s.pending){const label=node('label'),c=document.createElement('input');c.type='checkbox';c.checked=s.useExp;c.onchange=()=>{s.option(c.checked,rev);this.render();};label.append(c,document.createTextNode('先自动使用经验球'));this.panel.append(label);const list=node('div');list.className='fusion-pets';s.reward.pets.forEach((p,i)=>list.append(button(`选择 ${i+1} ${p.type} · 等级${p.levels}`,()=>s.choose(p,rev))));this.panel.append(list,button('预览转世幻化',()=>s.request(rev)));}
 if(s.main)this.panel.append(node('p',`主兽：${s.main.type}；转世 ${s.main.zs}/${s.main.maxZs}；评分 ${Math.floor(petDetails(s.main)?.allFen??0)}`));
 if(s.pending){const p=s.preview();this.panel.append(node('p',`预计消耗经验球 ${p?.balls??0}。${p?.ok?'随后消耗1个灵魂晶石，完成转世。':'转世将失败：'+p?.message} 已使用经验球不会因后续条件不满足而退回。`),button('确认转世幻化',()=>s.confirm(rev)),button('取消转世幻化',()=>s.cancel(rev)));}
 const feedback=node('p',s.feedback);feedback.id='pet-rebirth-fusion-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
