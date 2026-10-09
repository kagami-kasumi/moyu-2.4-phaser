import type {Action,Facing,Manifest} from '../content/manifest.ts';
export interface ActorEvent {tick:number;type:'attack-ended'|'effect-requested'}
export class Actor {
  action:Action='idle';facing:Facing='left';frame=1;tick=0;paused=false;
  private phase=0;
  readonly events:ActorEvent[]=[];
  constructor(public manifest:Manifest){}
  select(action:Action,facing:Facing=this.facing):boolean {
    if(!this.manifest.actions[action])return false;
    // Source rejects attack reentry; tool state selection also keeps an attack atomic.
    if(this.action==='attack')return false;
    this.facing=facing;
    if(action!==this.action){this.action=action;this.frame=1;}
    return true;
  }
  reset(){this.action='idle';this.facing='left';this.frame=1;this.tick=0;this.phase=0;this.events.length=0;this.paused=false;}
  advance(milliseconds:number){
    if(!Number.isFinite(milliseconds)||milliseconds<0)throw new Error('Invalid clock delta');
    if(this.paused)return;
    this.phase+=milliseconds*this.manifest.fps;
    while(this.phase>=1000-1e-7){this.phase-=1000;if(this.phase<0)this.phase=0;this.step();}
  }
  step(){
    this.tick++;
    // Activities observes the previous frame script's marker before this tick's script.
    if(this.action==='attack'&&this.frame===11){this.events.push({tick:this.tick,type:'effect-requested'});this.action='idle';this.frame=1;return;}
    this.frame=this.frame%this.manifest.actions[this.action]!.frames.length+1;
    if(this.action==='attack'&&this.frame===11)this.events.push({tick:this.tick,type:'attack-ended'});
  }
  snapshot(){return {action:this.action,facing:this.facing,frame:this.frame,tick:this.tick,paused:this.paused,events:[...this.events]};}
}
