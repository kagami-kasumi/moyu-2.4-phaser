import Phaser from 'phaser';
import {validateManifest,type Action,type Facing} from './content/manifest.ts';
import {Actor} from './domain/actor.ts';
import {ActorClock} from './application/clock.ts';
import {ActorScene} from './scenes/actor-scene.ts';
import './style.css';

async function main(){
  const params=new URLSearchParams(location.search),manual=params.has('manual');
  const response=await fetch(params.get('profession')==='mage'?'/assets/mage/manifest.json':'/assets/first-actor/manifest.json');if(!response.ok)throw new Error('角色清单加载失败');
  const actor=new Actor(validateManifest(await response.json())),clock=new ActorClock(actor);
  const status=document.querySelector<HTMLElement>('#status')!,events=document.querySelector<HTMLElement>('#events')!;
  const report=()=>{status.textContent=`${{idle:'待机',run:'跑动',attack:'斩魂'}[actor.action]} · ${actor.facing==='left'?'左':'右'}向 · 帧 ${actor.frame}/${actor.manifest.actions[actor.action]!.frames.length} · tick ${actor.tick}${actor.paused?' · 已暂停':''}`;events.textContent=actor.events.slice(-6).map(e=>`tick ${e.tick}  ${e.type==='attack-ended'?'末帧：技能结束标记':'Activities：效果请求（不结算伤害）'}`).join('\n')||'尚无动作事件';};
  const scene=new ActorScene(actor,()=>{document.body.dataset.ready='true';if(!manual)clock.start();report();},report);
  const game=new Phaser.Game({type:Phaser.AUTO,width:580,height:500,parent:'stage',backgroundColor:'#172630',antialias:true,roundPixels:false,scene:[scene],render:{preserveDrawingBuffer:true},banner:false});
  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(b=>{b.disabled=!actor.manifest.actions[b.dataset.action as Action];b.onclick=()=>{clock.pump();actor.select(b.dataset.action as Action);report();};});
  document.querySelectorAll<HTMLButtonElement>('[data-facing]').forEach(b=>b.onclick=()=>{clock.pump();actor.select(actor.action,b.dataset.facing as Facing);report();});
  const pause=document.querySelector<HTMLButtonElement>('#pause')!;
  pause.onclick=()=>{clock.pause(!actor.paused);pause.textContent=actor.paused?'继续播放':'暂停';report();};
  document.querySelector<HTMLButtonElement>('#reset')!.onclick=()=>{clock.reset();pause.textContent='暂停';report();};
  document.querySelector<HTMLButtonElement>('#step')!.onclick=()=>{clock.pause(true);actor.step();pause.textContent='继续播放';report();};
  // Readable controlled probe for browser acceptance, available only with ?manual.
  if(manual)(window as unknown as {actorProbe:unknown}).actorProbe={
    select:(a:Action,f:Facing)=>actor.select(a,f),advance:(ms:number)=>actor.advance(ms),snapshot:()=>actor.snapshot(),
    reset:()=>clock.reset(),pause:(v:boolean)=>{actor.paused=v;},render:()=>{scene.view?.render(actor);report();},
    renderer:()=>game.renderer.type,
    startClock:()=>clock.start(),stopClock:()=>clock.stop(),sleepRenderer:()=>game.loop.sleep(),wakeRenderer:()=>game.loop.wake(),
  };
  window.addEventListener('pagehide',()=>{clock.stop();game.destroy(true);},{once:true});
}
main().catch(e=>{document.querySelector('#status')!.textContent=`加载失败：${e.message}`;console.error(e);});
