import type {Journey} from '../domain/journey.ts';
export class SouthRescueView {
 private panel=document.createElement('section');private previous='';
 constructor(private j:Journey){this.panel.id='south-rescue-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','公爵与劫狱');document.querySelector('main')!.append(this.panel);}
 render(){const service=this.j.rescue;if(!service){this.panel.hidden=true;return;}this.panel.hidden=!service.open;
  const key=JSON.stringify([service.open,service.revision,service.state]);if(key===this.previous)return;this.previous=key;
  const revision=service.revision,button=(label:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{action();this.render();};return b;},title=document.createElement('h2'),description=document.createElement('p');title.textContent=service.stage==='chest'?'公爵的宝箱':'南城公爵';this.panel.replaceChildren(title,description);
  if(service.stage==='chest'){description.textContent=service.state.chestCmd===4020?'箱里放有生命之源和魔力源泉。':'打开宝箱需要一个勇士勋章；读档后须等待超过5分钟。';this.panel.append(button('打开公爵宝箱',()=>service.chest(revision)));}
  else if(service.stage==='accept'){description.textContent='魔军监狱看守不容易对付，你相信能打得过吗？';this.panel.append(button('全包在我身上',()=>service.answer(true,revision)),button('那就算了吧',()=>service.answer(false,revision)));}
  else if(service.state.isComplete){description.textContent='你救出了我的儿女！可从南城二右上进入我的城堡。每个初级月光宝盒可换2个幻魔之心。';if(service.state.isDoing)this.panel.append(button('领取劫狱奖励',()=>service.claim()));this.panel.append(button('兑换两个幻魔之心',()=>service.exchange(revision)));}
  else if(service.state.isDoing){description.textContent='我在等着你的好消息。经南城野外一至四进入监狱，救出公爵儿子和女儿。';}
  else{description.textContent='我的儿子和女儿被关在南城野外的监狱里，你能帮忙救人吗？';this.panel.append(button('那简单，劫狱',()=>service.offer(revision)));}
  const feedback=document.createElement('p');feedback.id='south-rescue-feedback';feedback.setAttribute('role','status');feedback.textContent=service.feedback;this.panel.append(feedback,button('关闭公爵对话',()=>service.close()));
 }
}
