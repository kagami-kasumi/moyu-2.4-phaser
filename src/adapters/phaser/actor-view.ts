import Phaser from 'phaser';
import type {Actor} from '../../domain/actor.ts';
export class ActorView {
  readonly image:Phaser.GameObjects.Image;
  constructor(scene:Phaser.Scene){this.image=scene.add.image(0,0,'idle-1').setOrigin(0,0);}
  render(actor:Actor){
    const m=actor.manifest,p=m.parentMatrix,a=m.actions[actor.action],s=a.matrices[actor.facing];
    // These source matrices have no skew/rotation. Negative scale mirrors the source origin.
    this.image.setTexture(`${actor.action}-${actor.frame}`).setOrigin(0,0);
    this.image.setPosition(290+p[4]+p[0]*s[4],340+p[5]+p[3]*s[5]);
    this.image.setScale(p[0]*s[0],p[3]*s[3]);
  }
}
