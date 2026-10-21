import type {Journey} from '../domain/journey.ts';
export class KingHonorView {
 private panel=document.createElement('section');private previous='';
 constructor(private journey:Journey){this.panel.id='king-honor-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','国王荣誉任务');document.querySelector('main')!.append(this.panel);}
 render(){const service=this.journey.kingHonor;if(!service){this.panel.hidden=true;return;}if(service.open&&!service.canInteract())service.close();this.panel.hidden=!service.open;
  const key=JSON.stringify([service.open,service.revision,service.task,service.reward.credit]);if(key===this.previous)return;this.previous=key;
  const revision=service.revision,button=(label:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{action();this.render();};return b;};
  const title=document.createElement('h2');title.textContent='国王 · 荣誉任务';const text=document.createElement('p');text.textContent=service.mode==='accept'?'消灭100个怪物，完成后选择魔石、资源或声望奖励。声望越高，奖励越多。':service.mode==='progress'?`荣誉任务 ${service.task!.number}/100 · 完成后再来领取奖励。`:`任务完成 · 当前声望 ${service.reward.credit} · 请选择一种奖励。`;
  this.panel.replaceChildren(title,text);
  if(service.mode==='accept')this.panel.append(button('接受荣誉任务',()=>service.accept(revision)));
  if(service.mode==='claim')for(const [kind,label,value]of [['ms','魔石',service.reward.credit*200],['res','资源',service.reward.credit*20000],['credit','声望',20]] as const)this.panel.append(button('领取'+label+' '+value,()=>service.claim(kind,revision)));
  this.panel.append(button('离开国王',()=>service.close()));
 }
}
