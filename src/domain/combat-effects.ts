interface Effect {remaining:number;frame:number;started:number}
/** Source 2874 (2 frames) and 2878 (15 frames); frame-one script runs on run(). */
export class CombatEffects {
 private frost=new Map<string,Effect>();private defense=new Map<string,Effect>();
 constructor(private stop:(id:string,value:number)=>void){}
 run(id:string,kind:'frost'|'nonDefense',seconds:number,tick:number){const state={remaining:kind==='frost'?seconds*15:seconds,frame:1,started:tick};(kind==='frost'?this.frost:this.defense).set(id,state);this.frameOne(id,kind,state);}
 private frameOne(id:string,kind:'frost'|'nonDefense',state:Effect){if(state.remaining>0){state.remaining-=kind==='frost'?2:1;if(kind==='frost')this.stop(id,5);}else{(kind==='frost'?this.frost:this.defense).delete(id);if(kind==='frost')this.stop(id,0);}}
 nonDefense(id:string){return this.defense.has(id);}
 step(tick:number,alive:(id:string)=>boolean){for(const [kind,states,length]of [['frost',this.frost,2],['nonDefense',this.defense,15]] as const)for(const [id,state]of states){if(!alive(id)){states.delete(id);continue;}if(state.started===tick)continue;state.frame=state.frame%length+1;if(state.frame===1)this.frameOne(id,kind,state);}}
 clear(){this.frost.clear();this.defense.clear();}
}
