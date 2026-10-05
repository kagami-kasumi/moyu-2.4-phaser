import {Actor} from '../domain/actor.ts';
// Monotonic wall-clock adapter; Phaser callbacks only read the current projection.
export class ActorClock {
  private previous:number; private timer:ReturnType<typeof setInterval>|undefined;
  constructor(readonly actor:Actor,private now:()=>number=()=>performance.now()){this.previous=now();}
  pump(){const next=this.now();this.actor.advance(Math.max(0,next-this.previous));this.previous=next;}
  start(){if(this.timer!==undefined)return;this.previous=this.now();this.timer=setInterval(()=>this.pump(),8);}
  stop(){clearInterval(this.timer);this.timer=undefined;}
  pause(paused:boolean){this.pump();this.actor.paused=paused;this.previous=this.now();}
  reset(){this.actor.reset();this.previous=this.now();}
}
