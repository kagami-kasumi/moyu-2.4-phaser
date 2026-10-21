import {CombatView,type CombatAssets} from '../adapters/phaser/combat-view.ts';
import type {PetRecord} from '../domain/npc-reward.ts';
import {petLife} from '../domain/pet-progression.ts';
import Phaser from 'phaser';
import {pickUp,groundItemName} from '../domain/ground-items.ts';
import type {Drop} from '../domain/npc-reward.ts';
import type {Journey} from '../domain/journey.ts';
import {ActorView} from '../adapters/phaser/actor-view.ts';
import {MAP_RENDER} from '../content/map-layout.ts';
import {NPCS} from '../content/journey-content.ts';
export class JourneyScene extends Phaser.Scene {
 private chestView?:{owner:NonNullable<Journey['combat']>;chest:NonNullable<NonNullable<Journey['combat']>['chest']>;image:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text};
 private kingVisuals:(Phaser.GameObjects.Image|Phaser.GameObjects.Text)[]=[];
 private combatView?:CombatView;
 private companions=new Map<PetRecord,Phaser.GameObjects.Text>();private shopLabel?:Phaser.GameObjects.Text;private petShopLabel?:Phaser.GameObjects.Text;
 view?:ActorView;root?:Phaser.GameObjects.Container;private mapKey='';private dropMarkers=new Map<Drop,Phaser.GameObjects.Text>();private portals=new Map<string,Phaser.GameObjects.Image>();private hover?:string;private hoverTick=0;private tooltip?:Phaser.GameObjects.Container;private tooltipText?:Phaser.GameObjects.Text;
 constructor(readonly journey:Journey,private ready:()=>void,private report:()=>void,private inputBlocked:()=>boolean=()=>false,private combatAssets?:CombatAssets){super('journey');}
 preload(){if(this.combatAssets)for(const s of Object.values(this.combatAssets.shapes))this.load.image('combat-'+s.id,'/assets/first-combat/'+s.file);for(const m of this.journey.actors?Object.values(this.journey.actors):[this.journey.actor.manifest])for(const [name,a]of Object.entries(m.actions))for(const f of a.frames)this.load.image(`${m.profession==='mage'?'mage-':''}${name}-${f.frame}`,`/assets/${m.profession==='mage'?'mage':'first-actor'}/${f.file}`);for(const s of Object.values(this.journey.manifest.shapes))this.load.image(`shape-${s.id}`,`/assets/first-slice/${s.file}`);}
 create(){this.root=this.add.container(0,0).setScale(this.journey.manifest.rootMatrix[0],this.journey.manifest.rootMatrix[3]);
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>this.pointer(p));
  this.input.on('pointerdown',(p:Phaser.Input.Pointer,objects:Phaser.GameObjects.GameObject[])=>{this.pointer(p);if(objects.length||this.inputBlocked())return;if(this.journey.started&&this.journey.groundContains(p.x,p.y))this.journey.input.pointerDown=true;});
  this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{this.pointer(p);const captured=this.journey.input.pointerDown;this.journey.input.pointerDown=false;if(captured&&this.hover)this.journey.activate(this.hover);});
  this.input.on('gameout',()=>{this.journey.releaseInput();this.hover=undefined;});this.ready();
 }
 private pointer(p:Phaser.Input.Pointer){const j=this.journey,m=j.manifest.rootMatrix;j.input.pointerX=p.x/m[0];j.input.pointerY=p.y/m[3];const hovered=j.entries.find(e=>e.visible&&e.alpha>0&&j.entryContains(e,p.x,p.y))?.name;if(hovered!==this.hover)this.hoverTick=j.tick;this.hover=hovered;}
 private image(shape:number,x:number,y:number,sx=1,sy=sx){const b=this.journey.manifest.shapes[shape]!.bounds;const im=this.add.image(x+b[0]*sx,y+b[1]*sy,`shape-${shape}`).setOrigin(0,0).setScale(sx,sy);this.root!.add(im);return im;}
 private currentMapKey(){const j=this.journey;return j.map+':'+(j.map==='southPrison'&&j.combat?.prisonWave===3&&!j.combat.monsters.some(m=>m.alive));}
 private build(){const j=this.journey;this.root!.removeAll(true);this.kingVisuals=[];this.chestView=undefined;this.companions.clear();this.shopLabel=undefined;this.petShopLabel=undefined;this.dropMarkers.clear();this.portals.clear();this.mapKey=this.currentMapKey();this.hover=undefined;this.hoverTick=j.tick;
  this.image(MAP_RENDER[j.map].background,0,0).setDepth(-1000);
  const ground=j.manifest.maps[j.map].layers.find(p=>p.name==='ground')!.matrix;
  this.image(MAP_RENDER[j.map].ground,ground[4],ground[5],ground[0],ground[3]).setAlpha(77/256).setDepth(-999);
  if(j.map==='frostOutskirts'){const p=j.manifest.maps[j.map].layers.find(p=>p.name==='冰柱')!;this.image(4314,p.matrix[4],p.matrix[5],p.matrix[0],p.matrix[3]).setDepth(p.matrix[5]);}
  for(const e of j.entries){const p=this.image(4238,e.x-42,e.y-17.6,39321/65536);p.setAlpha(e.alpha).setVisible(e.visible).setDepth(-900);this.portals.set(e.name,p);}
  const npc=j.manifest.npc.find(p=>p.name==='npcPic')!.matrix;
  for(const original of NPCS[j.map]){if(['公爵儿子','公爵女儿'].includes(original.title)&&!(j.map==='southPrison'?j.combat?.prisonWave===3&&!j.combat.monsters.some(m=>m.alive):j.cityVisit.southPrisonRescued))continue;const n={...original,...((j.map==='eastPalace'||j.map==='garden')?j.royalVisits[j.map]:{})};const instanceScale=original===NPCS[j.map][0]||n.title==='飞翔'||n.title==='挑战者'||n.title==='抽奖箱'?65512/65536:1;
   const image=this.image(n.shape,n.x+npc[4],n.y+npc[5]*instanceScale,npc[0],npc[3]*instanceScale).setDepth(n.y).setInteractive({pixelPerfect:true,alphaTolerance:1});
   if(n.title==='1级杂货商 奈奈安')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openShop('ordinary');this.report();});
   if(n.title==='1级装备打造师 约克')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();document.getElementById('inventory')!.hidden=false;document.getElementById('split-button')!.click();this.report();});
   if(n.title==='冰宫郊区管理员'||n.title==='冰宫幻兽商')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.notice=n.title==='冰宫幻兽商'?'冰宫幻兽商 · 共享库存开放 '+j.cityVisit.gobiPetShopOpenNumber+' 项；专属购买尚未开放。':'冰宫郊区管理员服务尚未开放。';this.report();});
   if(n.title==='军需官')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openGobiServices();this.report();});
   if(n.title==='树心城郊区管理员')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.reviveShuxin();this.report();});
   if(n.title==='卡萨诺城郊区管理员')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openTrade();this.report();});
   if(n.title==='幻兽幻化师')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openPetPill();this.report();});
   if(n.title==='经验导师')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();document.getElementById('inventory')!.hidden=false;j.recycle?.show();this.report();});
   if(n.title==='王子的宝箱'||n.title==='公主的宝箱')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.royalChests?.show(n.title==='王子的宝箱'?'prince':'princess');this.report();});
   if(n.title==='抽奖箱')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.lottery?.show();this.report();});
   if(n.title==='国王')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.kingHonor?.interact();this.report();});
   if(n.title==='元帅')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.palace?.show();this.report();});
   if(n.title==='军团管理员')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openLegion();this.report();});
   if(!['南城公爵','公爵儿子','公爵女儿'].includes(n.title)&&!(n.title==='巧匠'&&(j.map==='swampCity'||j.map==='borderCity'))&&['冰宫指挥官','白衣圣兽师','边关郊区管理员','边关指挥官','南城指挥官','南城公爵','公爵儿子','公爵女儿','戈壁指挥官','幻兽装备师','戈壁郊区管理员','树心城指挥官','爱神','巧匠','卡萨诺城指挥官','城堡管理员','挑战者','PK赛报名官','王子','公主'].includes(n.title))image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.notice=n.title+'的服务尚未开放。';this.report();});
   if(n.title==='巧匠'&&(j.map==='swampCity'||j.map==='borderCity'))image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.swampArtisan?.interact();this.report();});
   if(n.title==='戈壁幻兽商')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.gobiPetMerchant?.interact();this.report();});
   if(n.title==='南城公爵'||n.title==='公爵的宝箱')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.rescue?.show(n.title==='南城公爵'?'duke':'chest');this.report();});
   if(n.title==='公爵儿子'||n.title==='公爵女儿')image.on('pointerup',()=>{if(this.inputBlocked())return;j.notice=j.map==='southPrison'?(n.title==='公爵儿子'?'你真了不起啊，能跑到这里来找我们。':'谢谢你救了我。'):'社交关系扩展尚未开放。';this.report();});
   if(n.title==='南城幻兽商')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.southPetMerchant?.interact();this.report();});
   if(n.title==='幻兽商')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openShop('pet');this.report();});
   if(n.title==='技能导师')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openShop('bravery');this.report();});
   if(n.title==='药剂师')image.on('pointerup',()=>{if(this.inputBlocked())return;j.releaseInput();j.openShop('pharmacy');this.report();});
   if(n.title==='老兵')image.on('pointerup',()=>{if(this.inputBlocked())return;j.trade?.close();j.input.pointerDown=false;j.reward?.interact();this.report();});
   const label=this.add.text(n.x,n.y-116,n.title,{fontFamily:'sans-serif',fontSize:'12px',color:'#ffffaa',backgroundColor:'#142822'}).setOrigin(0.5,0).setDepth(n.y+0.1);this.root!.add(label);
   if(n.title==='国王'){this.kingVisuals=[image,label];for(const view of this.kingVisuals)view.setVisible(j.firstQuest.king?.isComplete===true);}
   if(n.title==='1级杂货商 奈奈安')this.shopLabel=label;if(n.title==='幻兽商')this.petShopLabel=label;
  }
  this.tooltip=this.add.container(0,0).setDepth(-890).setAlpha(0.5).setVisible(false);this.tooltip.add(this.add.rectangle(0,0,110,40,0x999999).setOrigin(0,0));this.tooltipText=this.add.text(3.4,1,'',{fontFamily:'sans-serif',fontSize:'14px',color:'#00ff00',align:'center',fixedWidth:102});this.tooltip.add(this.tooltipText);this.root!.add(this.tooltip);
  this.combatView=this.combatAssets?new CombatView(this,this.root!,this.combatAssets,id=>{if(!this.inputBlocked()){j.releaseInput();if(!j.attack(id))j.notice='靠近敌人并对齐后点击攻击，或按F向面朝方向攻击。';this.report();}}):undefined;
  this.view=new ActorView(this);this.root!.add(this.view.image);
 }
 update(){const j=this.journey;if(!j.started){this.report();return;}if(this.mapKey!==this.currentMapKey())this.build();
  for(const view of this.kingVisuals)view.setVisible(j.firstQuest.king?.isComplete===true);
  this.petShopLabel?.setText(`${j.petShop?.upgrades.state.level??1}级幻兽商 薇薇安`);
  this.shopLabel?.setText(`${j.shop?.upgrades.state.level??1}级杂货商 奈奈安`);
  this.combatView?.render(j.combat?.monsters??[]);
  const chest=j.combat?.chest;
  if(this.chestView&&(this.chestView.owner!==j.combat||this.chestView.chest!==chest||chest?.opened)){this.chestView.image.destroy();this.chestView.label.destroy();this.chestView=undefined;}
  if(chest&&!chest.opened&&!this.chestView){const owner=j.combat!,m=j.manifest.npc.find(p=>p.name==='npcPic')!.matrix,image=this.image(4263,chest.x+m[4],chest.y+m[5],m[0],m[3]).setDepth(chest.y).setInteractive({pixelPerfect:true,alphaTolerance:1}),label=this.add.text(chest.x,chest.y-116,'宝箱 · 点击开启',{fontFamily:'sans-serif',fontSize:'12px',color:'#ffffaa',backgroundColor:'#142822'}).setOrigin(.5,0).setDepth(chest.y+.1);this.root!.add(label);image.on('pointerup',()=>{if(this.inputBlocked()||j.combat!==owner)return;j.releaseInput();owner.openChest(chest);this.report();});this.chestView={owner,chest,image,label};}
  const pets=j.petProgression?.slots??[];for(const [pet,marker]of this.companions)if(!pets.includes(pet)||pet.inOne){marker.destroy();this.companions.delete(pet);}pets.forEach((pet,i)=>{if(!pet||pet.inOne)return;let marker=this.companions.get(pet);if(!marker){marker=this.add.text(0,0,'',{fontFamily:'sans-serif',fontSize:'12px',color:'#d0fff1',backgroundColor:'#164c43',padding:{x:6,y:5}}).setOrigin(0.5,1);this.root!.add(marker);this.companions.set(pet,marker);}marker.setText((petLife(pet)<=0?'◇ ':'◆ ')+pet.type+' Lv.'+pet.levels+(petLife(pet)<=0?' · 死亡':'')).setPosition(Math.max(70,Math.min(510,j.x-38-i*35)),Math.max(90,Math.min(420,j.y+22+i*16))).setDepth(j.y+22+i*16);const body=j.combat?.pets().find(b=>b.record===pet);if(body)marker.setPosition(body.x,body.y).setDepth(body.y);});
  const drops=j.reward?.drops??[];
  for(const [drop,marker]of this.dropMarkers)if(!drops.includes(drop)){marker.destroy();this.dropMarkers.delete(drop);}
  for(const d of drops)if(!this.dropMarkers.has(d)){
   const marker=this.add.text(d.x,d.y,'◆ '+groundItemName(d.item),{fontFamily:'sans-serif',fontSize:'11px',color:'#ffdf9c',backgroundColor:'#172630'}).setOrigin(0.5,1).setDepth(d.y).setInteractive({useHandCursor:true});
   marker.on('pointerup',()=>{j.input.pointerDown=false;if(this.inputBlocked()||!j.reward||j.vitals.life<=0)return;pickUp(j.reward,d);this.report();});this.root!.add(marker);this.dropMarkers.set(d,marker);
  }
  this.view!.render(j.actor,j.x,j.y);this.view!.image.setDepth(j.y);this.root!.sort('depth');
  for(const e of j.entries){const shape=e.name===this.hover?j.manifest.portalFrames[(j.tick-this.hoverTick)%13]!:4238;const p=this.portals.get(e.name)!,bounds=j.manifest.shapes[shape]!.bounds,scale=39321/65536;p.setTexture(`shape-${shape}`).setPosition(e.x-42+bounds[0]*scale,e.y-17.6+bounds[1]*scale).setAlpha(e.alpha).setVisible(e.visible);}
  const hovered=j.entries.find(e=>e.name===this.hover&&e.visible&&e.alpha>0);this.tooltip!.setVisible(!!hovered);if(hovered){this.tooltip!.setPosition(hovered.x-51,hovered.y-21.6);this.tooltipText!.setText('按Q进入\n'+(hovered.toMap?j.manifest.maps[hovered.toMap].name:j.map==='luckyGate'?j.cityVisit.homeCity+'（尚未开放）':j.map==='icePalaceCity'?(hovered.name==='entry2'?'港口（尚未开放）':'黑渊入口（尚未开放）'):j.map==='frostOutskirts'?(hovered.name==='entry2'?'冰宫野外（尚未开放）':'冰宫（尚未开放）'):j.map==='iceCorridor'?(hovered.name==='entry2'?'冰封谷（尚未开放）':'冰宫郊区（尚未开放）'):j.map==='borderCity'?'冰封走廊（70级）':j.map==='borderOutskirts'?'边关野外一（尚未开放）':j.map==='southSecond'?(hovered.name==='entry2'?'边关郊区（尚未开放）':'公爵城堡（尚未开放）'):j.map==='southOutskirts'?(hovered.name==='entry1'?'南城野外一（尚未开放）':'南城一（尚未开放）'):j.map==='swampCity'?(hovered.name==='entry2'?'南城郊区（尚未开放）':'海岛（尚未开放）'):j.map==='swampOutskirts'?(hovered.name==='entry1'?'沼泽野外一（尚未开放）':'沼泽（尚未开放）'):j.map==='gobiOutskirts'?(hovered.name==='entry2'?'戈壁野外一（尚未开放）':'戈壁（尚未开放）'):j.map==='shuxinCity'?'心湖（尚未开放）':j.map==='palace'?({entry1:'东宫',entry2:'卡萨诺城二',entry3:'花园'} as Record<string,string>)[hovered.name]:j.map==='cityThird'?(hovered.name==='entry1'?'卡萨诺城二':'树心城郊区'):j.map==='citySecond'?({entry1:'卡萨诺城一',entry2:'沼泽郊区',entry3:'皇宫',entry4:'卡萨诺城三'} as Record<string,string>)[hovered.name]:j.map==='outskirts'?(hovered.name==='entry2'?'卡萨诺城一':'卡萨诺城野外一'):(hovered.name==='entry1'?'卡萨诺城郊区':'卡萨诺城二')));}this.report();
 }
}
