import type {Journey} from '../domain/journey.ts';
import {petDetails} from '../domain/pet-details.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class PetMainFusionView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='pet-main-fusion-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','主属性幻化');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.petMainFusion;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.feedback,s.reward.pets]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭主属性幻化',()=>s.close()),node('h2','主属性幻化'));
 if(!s.pending){for(const [key,label] of [['autoVice','自动选择奇异兽'],['useGrass','使用幻化草'],['useExp','自动经验球']] as const){const l=node('label'),c=document.createElement('input');c.type='checkbox';c.checked=s[key];c.onchange=()=>{s.option(key,c.checked,rev);this.render();};l.append(c,document.createTextNode(label));this.panel.append(l);}const list=node('div');list.className='fusion-pets';s.reward.pets.forEach((p,i)=>{const row=node('div',`${i+1}. ${p.type} · 等级${p.levels} · 评分${Math.floor(petDetails(p)?.allFen??0)} `);row.append(button(`主兽 ${i+1} ${p.type}`,()=>s.chooseMain(p,rev)),button(`副兽 ${i+1} ${p.type}`,()=>s.chooseVice(p,rev)));list.append(row);});this.panel.append(list);}
 const info=s.preview();this.panel.append(node('p',`主兽：${s.main?.type??'未选择'}；副兽：${s.vice?.type??'未选择'}；副兽要求：${info.need??'—'}`));
 if(s.pending){if(info.result?.accepted){for(const [key,label] of [['rateLife','生命'],['rateMinAttack','最小攻击'],['rateMaxAttack','最大攻击'],['rateDefense','防御']] as const){const before=s.main![key],after=info.result.pet[key];if(after!==before)this.panel.append(node('p',`${label}成长率 ${before.toFixed(4)} → ${after.toFixed(4)}`));}}this.panel.append(node('p',`将永久消耗副兽${s.vice!.type}${info.grass?'和1个'+info.grass[0]:''}，提高主属性成长率并降为1级。${s.useExp?'随后按评分尝试使用1或2个经验球。':''}可能发生雷元素突变。`),button('确认主属性幻化',()=>s.confirm(rev)),button('取消幻化',()=>s.cancel(rev)));}else this.panel.append(button('预览主属性幻化',()=>s.request(rev)));
 const feedback=node('p',s.feedback||info.reason);feedback.id='pet-main-fusion-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
