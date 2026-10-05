import type {Journey} from '../domain/journey.ts';
export class JourneyClock {
 private last=0;private timer:ReturnType<typeof setInterval>|undefined;
 constructor(readonly journey:Journey,private now:()=>number=()=>performance.now()){}
 start(){if(this.timer!==undefined)return;this.last=this.now();this.timer=setInterval(()=>this.pump(),8);}
 pump(){const time=this.now();this.journey.advance(Math.max(0,time-this.last));this.last=time;}
 stop(){clearInterval(this.timer);this.timer=undefined;this.journey.releaseInput();}
}
