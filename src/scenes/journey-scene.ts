import Phaser from 'phaser';
import {pickUp,groundItemName} from '../domain/ground-items.ts';
import type {Drop} from '../domain/npc-reward.ts';
import type {Journey} from '../domain/journey.ts';
import {ActorView} from '../adapters/phaser/actor-view.ts';
import {NPCS} from '../content/journey-content.ts';
export class JourneyScene extends Phaser.Scene {
 view?:ActorView;root?:Phaser.GameObjects.Container;private mapKey='';private dropMarkers=new Map<Drop,Phaser.GameObjects.Text>();private portals=new Map<string,Phaser.GameObjects.Image>();private hover?:string;private hoverTick=0;private tooltip?:Phaser.GameObjects.Container;private tooltipText?:Phaser.GameObjects.Text;
 constructor(readonly journey:Journey,private ready:()=>void,private report:()=>void,private inputBlocked:()=>boolean=()=>false){super('journey');}
 preload(){for(const m of this.journey.actors?Object.values(this.journey.actors):[this.journey.actor.manifest])for(const [name,a]of Object.entries(m.actions))for(const f of a.frames)this.load.image(`${m.profession==='mage'?'mage-':''}${name}-${f.frame}`,`/assets/${m.profession==='mage'?'mage':'first-actor'}/${f.file}`);for(const s of Object.values(this.journey.manifest.shapes))this.load.image(`shape-${s.id}`,`/assets/first-slice/${s.file}`);}
 create(){this.root=this.add.container(0,0).setScale(this.journey.manifest.rootMatrix[0],this.journey.manifest.rootMatrix[3]);
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>this.pointer(p));
  this.input.on('pointerdown',(p:Phaser.Input.Pointer,objects:Phaser.GameObjects.GameObject[])=>{this.pointer(p);if(objects.length||this.inputBlocked())return;if(this.journey.started&&!this.journey.complete&&this.journey.groundContains(p.x,p.y))this.journey.input.pointerDown=true;});
  this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{this.pointer(p);const captured=this.journey.input.pointerDown;this.journey.input.pointerDown=false;if(captured&&this.hover)this.journey.activate(this.hover);});
  this.input.on('gameout',()=>{this.journey.releaseInput();this.hover=undefined;});this.ready();
 }
 private pointer(p:Phaser.Input.Pointer){const j=this.journey,m=j.manifest.rootMatrix;j.input.pointerX=p.x/m[0];j.input.pointerY=p.y/m[3];const hovered=j.entries.find(e=>e.visible&&e.alpha>0&&j.entryContains(e,p.x,p.y))?.name;if(hovered!==this.hover)this.hoverTick=j.tick;this.hover=hovered;}
 private image(shape:number,x:number,y:number,sx=1,sy=sx){const b=this.journey.manifest.shapes[shape]!.bounds;const im=this.add.image(x+b[0]*sx,y+b[1]*sy,`shape-${shape}`).setOrigin(0,0).setScale(sx,sy);this.root!.add(im);return im;}
 private build(){const j=this.journey;this.root!.removeAll(true);this.dropMarkers.clear();this.portals.clear();this.mapKey=j.map;this.hover=undefined;this.hoverTick=j.tick;
  this.image(j.map==='outskirts'?4323:4326,0,0).setDepth(-1000);
  this.image(j.map==='outskirts'?2806:2804,0,0).setAlpha(77/256).setDepth(-999);
  for(const e of j.entries){const p=this.image(4238,e.x-42,e.y-17.6,39321/65536);p.setAlpha(e.alpha).setVisible(e.visible).setDepth(-900);this.portals.set(e.name,p);}
  const npc=j.manifest.npc.find(p=>p.name==='npcPic')!.matrix;
  for(const n of NPCS[j.map]){const instanceScale=n===NPCS[j.map][0]||n.title==='飞翔'?65512/65536:1;
   const image=this.image(n.shape,n.x+npc[4],n.y+npc[5]*instanceScale,npc[0],npc[3]*instanceScale).setDepth(n.y).setInteractive({pixelPerfect:true,alphaTolerance:1});
   if(n.title==='老兵')image.on('pointerup',()=>{j.input.pointerDown=false;j.reward?.interact();this.report();});
   const label=this.add.text(n.x,n.y-116,n.title,{fontFamily:'sans-serif',fontSize:'12px',color:'#ffffaa',backgroundColor:'#142822'}).setOrigin(0.5,0).setDepth(n.y+0.1);this.root!.add(label);
  }
  this.tooltip=this.add.container(0,0).setDepth(-890).setAlpha(0.5).setVisible(false);this.tooltip.add(this.add.rectangle(0,0,110,40,0x999999).setOrigin(0,0));this.tooltipText=this.add.text(3.4,1,'',{fontFamily:'sans-serif',fontSize:'14px',color:'#00ff00',align:'center',fixedWidth:102});this.tooltip.add(this.tooltipText);this.root!.add(this.tooltip);
  this.view=new ActorView(this);this.root!.add(this.view.image);
 }
 update(){const j=this.journey;if(!j.started){this.report();return;}if(this.mapKey!==j.map)this.build();
  const drops=j.reward?.drops??[];
  for(const [drop,marker]of this.dropMarkers)if(!drops.includes(drop)){marker.destroy();this.dropMarkers.delete(drop);}
  for(const d of drops)if(!this.dropMarkers.has(d)){
   const marker=this.add.text(d.x,d.y,'◆ '+groundItemName(d.item),{fontFamily:'sans-serif',fontSize:'11px',color:'#ffdf9c',backgroundColor:'#172630'}).setOrigin(0.5,1).setDepth(d.y).setInteractive({useHandCursor:true});
   marker.on('pointerup',()=>{j.input.pointerDown=false;if(this.inputBlocked()||!j.reward)return;pickUp(j.reward,d);this.report();});this.root!.add(marker);this.dropMarkers.set(d,marker);
  }
  this.view!.render(j.actor,j.x,j.y);this.view!.image.setDepth(j.y);this.root!.sort('depth');
  for(const e of j.entries){const shape=e.name===this.hover?j.manifest.portalFrames[(j.tick-this.hoverTick)%13]!:4238;const p=this.portals.get(e.name)!,bounds=j.manifest.shapes[shape]!.bounds,scale=39321/65536;p.setTexture(`shape-${shape}`).setPosition(e.x-42+bounds[0]*scale,e.y-17.6+bounds[1]*scale).setAlpha(e.alpha).setVisible(e.visible);}
  const hovered=j.entries.find(e=>e.name===this.hover&&e.visible&&e.alpha>0);this.tooltip!.setVisible(!!hovered&&!j.complete);if(hovered){this.tooltip!.setPosition(hovered.x-51,hovered.y-21.6);this.tooltipText!.setText('按Q进入\n'+(j.map==='outskirts'?(hovered.name==='entry2'?'卡萨诺城一':'卡萨诺城野外一'):(hovered.name==='entry1'?'卡萨诺城郊区':'卡萨诺城二')));}this.report();
 }
}
