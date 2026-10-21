import Phaser from 'phaser';
import type {Placement,Shape} from '../../content/slice-manifest.ts';
import type {FirstCombatMonster} from '../../domain/first-combat-spawn.ts';
interface Animation {layers:Placement[]}
interface Family {parent:Placement;selectors:Animation[];animations:Record<number,Animation[]>}
export interface CombatAssets {shapes:Record<number,Shape>;monster:Family;dragon:Family;families?:Record<string,Family>}
export class CombatView {
 private sprites=new Map<FirstCombatMonster,{image:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text}>();
 constructor(private scene:Phaser.Scene,private root:Phaser.GameObjects.Container,private assets:CombatAssets,private attack:(id:string)=>void){}
 render(monsters:FirstCombatMonster[]){
  for(const [m,v]of this.sprites)if(!monsters.includes(m)||!m.alive){v.image.destroy();v.label.destroy();this.sprites.delete(m);}
  for(const m of monsters){if(!m.alive)continue;const family=(m.attackFrames?this.assets.families?.[m.species]:undefined)??(m.species==='龙怪'?this.assets.dragon:this.assets.monster);
   const action=m.motion==='acting'||m.motion==='finished'?(m.effect==='skill'?6:4):['left','right','up','down'].includes(m.motion)?2:0;
   const selector=family.selectors[action+(m.facing==='right'?1:0)]!.layers[0]!,animation=family.animations[selector.characterId];
   const layer=animation?.[(m.animationFrame-1)%animation.length]?.layers[0];
   const id=layer?.characterId??selector.characterId,b=this.assets.shapes[id]!.bounds,p=family.parent.matrix,s=selector.matrix,l=layer?.matrix??[1,0,0,1,0,0];
   const sx=p[0]*s[0]*l[0]!,sy=p[3]*s[3]*l[3]!,x=m.x+p[4]+p[0]*(s[4]+s[0]*l[4]!)+b[0]*sx,y=m.y+p[5]+p[3]*(s[5]+s[3]*l[5]!)+b[1]*sy;
   let v=this.sprites.get(m);if(!v){const image=this.scene.add.image(x,y,'combat-'+id).setOrigin(0,0).setInteractive({useHandCursor:true});const label=this.scene.add.text(0,0,'',{fontFamily:'sans-serif',fontSize:'11px',color:'#fff0d0',backgroundColor:'#462a20'}).setOrigin(.5,1);this.root.add([image,label]);image.on('pointerup',()=>this.attack(m.id));v={image,label};this.sprites.set(m,v);}
   v.image.setTexture('combat-'+id).setPosition(x,y).setScale(sx,sy).setDepth(m.y);v.label.setColor('#'+m.textColor.toString(16).padStart(6,'0')).setText(`${m.level}级${m.name} ${Math.ceil(m.life)}/${m.maxLife}`).setPosition(m.x,m.y-110).setDepth(m.y+.1);
  }
 }
}
