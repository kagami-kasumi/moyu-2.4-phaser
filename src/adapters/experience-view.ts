import type {Journey} from '../domain/journey.ts';
const el=(id:string)=>document.getElementById(id)!;
export class ExperienceView {
 private previous='';
 constructor(private journey:Journey){
  const panel=document.createElement('section');panel.id='experience-panel';panel.hidden=true;panel.setAttribute('aria-label','经验球分配');
  panel.innerHTML='<button id="close-experience" aria-label="关闭经验球分配">关闭</button><h2>经验球分配</h2><p>每颗 2000 经验；选择未出征幻兽会召回第一槽幻兽并自动出征。</p><div id="experience-targets"></div><p id="experience-status"></p><p id="experience-count"></p><button id="confirm-experience">确认用于人物</button><p id="experience-feedback" role="status"></p>';
  document.querySelector('main')!.append(panel);
  el('close-experience').onclick=()=>{journey.experience?.close();this.render();};
 }
 render(){
  const s=this.journey.experience;if(!s)return;
  const v=this.journey.vitals,key=JSON.stringify([s.open,s.revision,s.feedback,v,s.count(),s.inventory.maxLevel,s.target,s.pets?.owner.pets]);if(key===this.previous)return;this.previous=key;
  el('experience-panel').hidden=!s.open;
  const targets=el('experience-targets');targets.replaceChildren();for(const pet of [undefined,...s.pets?.owner.pets??[]]){const button=document.createElement('button');button.textContent=pet?(s.pets!.owner.pets.indexOf(pet)+1)+'. '+pet.type:'人物';button.setAttribute('aria-pressed',String(s.target===pet));const revision=s.revision;button.onclick=()=>{s.choose(pet,revision);this.render();};targets.append(button);}
  el('experience-status').textContent=`${this.journey.name} · 等级 ${v.level} / ${s.inventory.maxLevel} · 经验 ${v.exp} / ${v.maxExp}`;
  if(s.target)el('experience-status').textContent=s.target.type+' · 等级 '+s.target.levels+' · 经验 '+(s.target.nowExp??0)+' / '+(s.target.maxExp??9);
  el('confirm-experience').textContent=s.target?'确认用于幻兽':'确认用于人物';
  el('experience-count').textContent=`背包经验球 ${s.count()} 颗`;
  el('experience-feedback').textContent=s.feedback;
  const revision=s.revision;el('confirm-experience').onclick=()=>{s.confirm(revision);this.render();};
 }
}
