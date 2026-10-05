import Phaser from 'phaser';
import {Actor} from '../domain/actor.ts';
import {ActorView} from '../adapters/phaser/actor-view.ts';
export class ActorScene extends Phaser.Scene {
  view?:ActorView;
  constructor(readonly actor:Actor,private ready:()=>void,private report:()=>void){super('actor');}
  preload(){for(const [name,a]of Object.entries(this.actor.manifest.actions))for(const f of a.frames)this.load.image(`${name}-${f.frame}`,`/assets/first-actor/${f.file}`);}
  create(){this.view=new ActorView(this);this.view.render(this.actor);this.ready();}
  update(){this.view?.render(this.actor);this.report();}
}
