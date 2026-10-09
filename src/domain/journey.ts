import {characterStart,type Profession} from '../content/character-entry.ts';
import type {Manifest} from '../content/manifest.ts';
import {EquipmentSockets} from './equipment-sockets.ts';
import {Inventory} from './inventory.ts';
import {initialWarriorVitals,initialCharacterVitals,initialKainVitals} from './hud.ts';
import {Actor} from './actor.ts';
import {NpcReward} from './npc-reward.ts';
import type {SliceManifest} from '../content/slice-manifest.ts';
import type {GameProgress} from '../application/save-types.ts';
export type MapId='outskirts'|'city';
export interface Entry {name:string;x:number;y:number;visible:boolean;alpha:number;toMap?:MapId;toEntry?:string}
export interface Input {left:boolean;right:boolean;up:boolean;down:boolean;pointerDown:boolean;pointerX:number;pointerY:number}
export const emptyInput=():Input=>({left:false,right:false,up:false,down:false,pointerDown:false,pointerX:0,pointerY:0});
export class Journey {
 sockets?:EquipmentSockets;inventory?:Inventory;reward?:NpcReward;vitals=initialWarriorVitals();petVitals=initialKainVitals();
 map:MapId='outskirts';x=0;y=0;started=false;complete=false;name='';tick=0;transitions=0;input=emptyInput();entries:Entry[]=[];notice='';private phase=0;
 profession:Profession='战士';initialState=characterStart('', '战士');
 constructor(readonly manifest:SliceManifest,readonly actor:Actor,readonly actors?:Record<Profession,Manifest>){}
 start(name:string,profession:Profession='战士'){
  if(!name||name.length>10||!['战士','法师'].includes(profession)||profession==='法师'&&!this.actors?.法师)return false;
  this.name=name;this.profession=profession;this.initialState=characterStart(name,profession);
  if(this.actors)this.actor.manifest=this.actors[profession];
  this.vitals=initialCharacterVitals(profession,name);this.petVitals=initialKainVitals();this.started=true;this.complete=false;this.map='outskirts';this.tick=0;this.phase=0;this.transitions=0;this.notice='';this.actor.reset();this.input=emptyInput();this.enter('outskirts','entry3');
  this.reward=new NpcReward(name,undefined,profession,{x:this.x,y:this.y},(x,y)=>this.groundContains(x,y));this.inventory=new Inventory(this.reward,this.vitals);this.sockets=new EquipmentSockets(this.reward);return true;
 }

 progress():GameProgress {
  if(!this.started||!this.reward||!this.inventory||!this.sockets)throw Error('尚未进入游戏');
  const r=this.reward,i=this.inventory;
  return structuredClone({name:this.name,profession:this.profession,initialState:this.initialState,map:this.map,x:this.x,y:this.y,complete:this.complete,transitions:this.transitions,facing:this.actor.facing,vitals:this.vitals,petVitals:this.petVitals,
   reward:{bag:r.bag,pets:r.pets,drops:r.drops,ms:r.ms,res:r.res,credit:r.credit,titleLevel:r.titleLevel,cmd:r.cmd,nextCmd:r.nextCmd,claimedPack:r.claimedPack},
   inventory:{equipment:i.equipment,bravery:i.bravery,exploit:i.exploit,militaryExploit:i.militaryExploit},crafting:{item:this.sockets.item,stone:this.sockets.stone}});
 }
 /** Input has already passed the save boundary. No start(), random reward or UI callback replay. */
 restore(progress:GameProgress){
  const p=structuredClone(progress);
  if(p.profession==='法师'&&!this.actors?.法师)throw Error('缺少女法师资源');
  if(!this.groundContains(p.x,p.y,p.map))throw Error('存档坐标不在可行走区域');
  const r=new NpcReward(p.name,undefined,p.profession,undefined,undefined,false);
  for(const key of ['bag','pets','drops','credit','titleLevel','cmd','nextCmd','claimedPack'] as const)Object.defineProperty(r,key,{value:p.reward[key],writable:true,enumerable:true,configurable:true});
  r.ms=p.reward.ms;r.res=p.reward.res;
  const inventory=new Inventory(r,p.vitals);inventory.equipment=p.inventory.equipment;inventory.bravery=p.inventory.bravery;inventory.exploit=p.inventory.exploit;inventory.militaryExploit=p.inventory.militaryExploit;inventory.refresh();
  if(!Number.isFinite(p.vitals.maxLife)||!Number.isFinite(p.vitals.maxMp))throw Error('存档属性无效');
  const sockets=new EquipmentSockets(r);sockets.item=p.crafting.item;sockets.stone=p.crafting.stone;
  this.name=p.name;this.profession=p.profession;this.initialState=p.initialState;
  this.vitals=p.vitals;this.petVitals=p.petVitals;this.reward=r;this.inventory=inventory;this.sockets=sockets;
  if(this.actors)this.actor.manifest=this.actors[p.profession];
  this.actor.reset();this.actor.select('idle',p.facing);this.enter(p.map,p.map==='city'?'entry1':'entry3');
  this.x=p.x;this.y=p.y;this.complete=p.complete;this.transitions=p.transitions;this.started=true;
  this.tick=0;this.phase=0;this.input=emptyInput();this.notice='';
 }

 private enter(map:MapId,entryName:string){this.map=map;this.entries=this.manifest.maps[map].layers.filter(p=>p.name?.startsWith('entry')).map(p=>({name:p.name!,x:p.matrix[4],y:p.matrix[5],visible:true,alpha:(p.color?.mult[3]??256)/256,...(map==='outskirts'&&p.name==='entry2'?{toMap:'city' as const,toEntry:'entry1'}:{})}));const e=this.entries.find(e=>e.name===entryName);if(!e)throw Error('目标入口不存在');this.x=e.x;this.y=e.y;}
 groundContains(globalX:number,globalY:number,map:MapId=this.map){
  const m=this.manifest.rootMatrix,x=globalX/m[0],y=globalY/m[3],shape=this.manifest.shapes[map==='outskirts'?2806:2804],pts=shape.edges.map(e=>[e[1],e[2]]),radius=(shape.lines[0]?.width??0)/2;let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++) {const [ax,ay]=pts[j]!,[bx,by]=pts[i]!,dx=bx!-ax!,dy=by!-ay!,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((x-ax!)*dx+(y-ay!)*dy)/length)):0;
   if((x-ax!-t*dx)**2+(y-ay!-t*dy)**2<=radius*radius)return true;
   if((ay!>y)!==(by!>y)&&x<(bx!-ax!)*(y-ay!)/(by!-ay!)+ax!)inside=!inside;
  }return inside;
 }
 entryContains(e:Entry,x=this.x,y=this.y){const m=this.manifest.rootMatrix;return x>=(e.x-51)*m[0]&&x<=(e.x+59)*m[0]&&y>=(e.y-21.6)*m[3]&&y<=(e.y+18.4)*m[3];}
 activate(entryName?:string){if(!this.started||this.complete)return false;const e=entryName?this.entries.find(e=>e.name===entryName&&e.visible&&this.entryContains(e)):this.entries.find(e=>e.visible&&this.entryContains(e));if(!e||e.alpha===0)return false;
  if(!e.toMap||!e.toEntry){this.notice='这个出口不在本次旅程中，请前往右侧卡萨诺城一。';return false;}return this.arrive(e.toMap,e.toEntry,e.toMap);
 }
 // Source allowJumpMap validates a pending destination before committing the scene.
 arrive(request:MapId,entry:string,label:MapId){if(this.complete||request!==label)return false;this.sockets?.close();this.reward?.leaveMap();this.enter(label,entry);this.transitions++;this.complete=true;this.input=emptyInput();this.actor.select('idle');return true;}
 releaseInput(){this.input=emptyInput();if(this.started)this.actor.select('idle');}
 private mouseDirection(){if(!this.input.pointerDown)return '';const dx=this.input.pointerX-this.x,dy=this.input.pointerY-this.y;if(Math.abs(dx)<=12&&Math.abs(dy)<=9)return '';const d=Math.abs(dx)-Math.abs(dy);if(d>12)return dx<=0?'L':'R';if(d<9)return dy<=0?'U':'D';return (dx>0?'R':'L')+(dy<=0?'U':'D');}
 step(){if(!this.started)return;this.tick++;if(this.complete){this.actor.step();return;}const before=this.actor.action;const input=this.input,d=this.mouseDirection();let dx=0,dy=0;
  if(input.left||d.includes('L')){dx=-1;dy=input.up||d==='LU'?-1:input.down||d==='LD'?1:0;}
  else if(input.right||d.includes('R')){dx=1;dy=input.up||d==='RU'?-1:input.down||d==='RD'?1:0;}
  else if(input.up||d==='U')dy=-1;else if(input.down||d==='D')dy=1;
  if(dx||dy){this.actor.select('run',dx<0?'left':dx>0?'right':this.actor.facing);
   if(dx&&dy){if(this.groundContains(this.x+dx*9,this.y))this.x+=dx*9;if(this.groundContains(this.x,this.y+dy*9))this.y+=dy*9;}
   else {const choices=dx?[[dx*12,0],[dx*12,9],[dx*12,-9]]:[[0,dy*9],[12,dy*9],[-12,dy*9]];for(const [mx,my]of choices)if(this.groundContains(this.x+mx!,this.y+my!)){this.x+=mx!;this.y+=my!;break;}}
  }else if(!input.pointerDown&&!input.left&&!input.right&&!input.up&&!input.down)this.actor.select('idle');
  if(before===this.actor.action)this.actor.step();else this.actor.tick++;
 }
 advance(ms:number){if(!Number.isFinite(ms)||ms<0)throw Error('Invalid journey clock delta');if(!this.started)return;this.phase+=ms*15;while(this.phase>=1000-1e-7){this.phase=Math.max(0,this.phase-1000);this.step();}}
 snapshot(){return {name:this.name,profession:this.profession,initialState:structuredClone(this.initialState),vitals:{...this.vitals},map:this.map,x:this.x,y:this.y,started:this.started,complete:this.complete,transitions:this.transitions,tick:this.tick,action:this.actor.action,facing:this.actor.facing,frame:this.actor.frame};}
}
