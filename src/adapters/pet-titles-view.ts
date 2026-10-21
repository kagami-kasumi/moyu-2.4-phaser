import type {Journey} from '../domain/journey.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class PetTitlesView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='pet-titles-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','幻兽评称');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.petTitles;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.feedback,s.main,s.quotas]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭幻兽评称',()=>s.close()),node('h2','幻兽评称'),node('p',`所选幻兽：${s.main?.type??'—'} · 免费服务`),node('p','达到50星且尚无称号即可评称。每个物种依次评为至尊、傲日、银月，之后为罡星。最大转世次数增加50次。'));
 const p=s.preview();if(!p.reason)this.panel.append(node('p',`本次称号：${p.name} · 评分增加${p.score} · 转世上限 ${s.main!.maxZs} → ${s.main!.maxZs+50}`));
 if(s.pending)this.panel.append(node('p','确认后该幻兽不可再次评称。'),button('确认评称',()=>s.confirm(rev)),button('取消评称',()=>s.cancel(rev)));else this.panel.append(button('预览评称',()=>s.request(rev)));
 const feedback=node('p',s.feedback||p.reason);feedback.id='pet-titles-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
