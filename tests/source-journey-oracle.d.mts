interface SourceEntry {_x:number;_y:number;_visible:boolean;_alpha:number;toMap:string;toEntry:string;hitTest(x:number,y:number):boolean}
interface SourceSnapshot {x:number;y:number;action:'idle'|'run';facing:'left'|'right'}
export function oracle():{
 role:{_x:number;_y:number;motion:string;faceTo:string};
 map:{nowMap:string;nextMap:string;nextEntry:string;entry2:SourceEntry;jumpMap():boolean};
 contains(x:number,y:number):boolean;
 step(input:{left?:boolean;right?:boolean;up?:boolean;down?:boolean;pointerDown?:boolean;pointerX?:number;pointerY?:number}):SourceSnapshot;
 snapshot():SourceSnapshot;
};
