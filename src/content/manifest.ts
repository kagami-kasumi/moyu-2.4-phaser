export type Action = 'idle' | 'run' | 'attack';
export type Facing = 'left' | 'right';
export type Matrix = [number,number,number,number,number,number];
export interface Frame { frame:number;file:string;width:number;height:number;durationTicks:1;offset:[number,number];layers:{depth:number;shapeId:number}[];bitmapId:number;endMarker:boolean }
export interface ActionData { spriteId:number;selectorFrames:Record<Facing,number>;matrices:Record<Facing,Matrix>;frames:Frame[] }
export interface Manifest { version:1;profession?:'mage';sourceSha256:string;stage:{width:number;height:number};fps:number;parentMatrix:Matrix;actions:Record<'idle'|'run',ActionData>&Partial<Record<'attack',ActionData>>;collision:null }
export function validateManifest(data:unknown):Manifest {
  const m=data as Manifest;
  const fail=(ok:unknown,message:string)=>{if(!ok)throw new Error(`Invalid actor manifest: ${message}`);};
  fail(m&&m.version===1,'version');fail(m.sourceSha256==='f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9','source');
  fail(m.fps===15&&m.stage?.width===580&&m.stage?.height===500,'clock/stage');
  const matrix=(v:unknown)=>Array.isArray(v)&&v.length===6&&v.every(Number.isFinite)&&v[1]===0&&v[2]===0&&v[0]!==0&&v[3]!==0;
  fail(matrix(m.parentMatrix),'parent matrix');fail(m.collision===null,'collision must not be guessed');
  for(const [action,id,count]of (m.profession==='mage'?[['idle',2893,1],['run',2917,10]]:[['idle',2986,1],['run',3007,10],['attack',3031,11]]) as [Action,number,number][]) {
    const a=m.actions?.[action];fail(a?.spriteId===id&&a.frames?.length===count,`${action} frames`);
    if(!a)throw Error('Missing action');
    fail(matrix(a.matrices?.left)&&matrix(a.matrices?.right),`${action} matrices`);
    a.frames.forEach((f,i)=>{
      fail(f.frame===i+1&&f.durationTicks===1,`${action} ordering/hold`);
      fail(f.file===`${action}-${i+1}.png`,`${action} resource path`);
      const dimensions=(m.profession==='mage'?{idle:[115,155],run:[145,195],attack:[0,0]}:{idle:[148,153],run:[250,150],attack:[310,230]})[action];
      fail(f.width===dimensions[0]&&f.height===dimensions[1],'source dimensions');
      fail(f.offset?.length===2&&f.offset.every(v=>v===0),'untrimmed origin');
      fail(f.endMarker===(action==='attack'&&i===10),'end marker');
    });
  }
  fail(m.profession!=='mage'||!m.actions.attack,'mage attack unavailable');
  return m;
}
