// Offline bounded readers for TASK-SLICE-004. No AVM1 execution.
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import {Bits,matrix,loadSource} from './first-actor.mjs';
import {readRect} from './swf.mjs';
export function source(){const s=loadSource();s.chars=new Map(s.tags.filter(t=>[2,22,32,83,6,20,21,35,36,39,37].includes(t.code)).map(t=>[s.body.readUInt16LE(t.offset),t]));return s;}
export function timeline(s,id){
 const display=new Map(),frames=[];let actions=[],label;
 for(const t of (id===0?s.tags:s.chars.get(id).children)){
  const b=s.payload(t);
  if(t.code===26){const flags=b[0],depth=b.readUInt16LE(1),r=new Bits(b,3),p={...(flags&1?display.get(depth):{}),depth};
   if(flags&2)p.characterId=r.word(); if(flags&4)p.matrix=matrix(r);p.matrix??=[1,0,0,1,0,0];
   if(flags&8){const add=r.u(1),mult=r.u(1),n=r.u(4);p.color={mult:mult?[r.s(n),r.s(n),r.s(n),r.s(n)]:[256,256,256,256],add:add?[r.s(n),r.s(n),r.s(n),r.s(n)]:[0,0,0,0]};r.align();}
   if(flags&16)p.ratio=r.word();if(flags&32){const str=[];for(let c;(c=r.byte());)str.push(c);p.name=Buffer.from(str).toString('utf8');}
   if(flags&64)p.clipDepth=r.word();
   // ClipActions are opaque evidence, never interpreted as runtime code.
   if(flags&128)p.clipActions=b.subarray(r.p/8).toString('hex');display.set(depth,p);
  }else if(t.code===28)display.delete(b.readUInt16LE(0));
  else if(t.code===43)label=b.subarray(0,b.indexOf(0)).toString('utf8');
  else if(t.code===12)actions.push(b);
  else if(t.code===1){frames.push({layers:structuredClone([...display.values()].sort((a,b)=>a.depth-b.depth)),actions,label});actions=[];label=undefined;}
 }
 return frames;
}
export function readShape(s,id){
 const t=s.chars.get(id),b=s.payload(t);assert([2,32,83].includes(t.code));const rect=readRect(b,2);let at=2+rect.bytes;
 if(t.code===83)at+=readRect(b,at).bytes+1;
 const r=new Bits(b,at),rgba=()=>[r.byte(),r.byte(),r.byte(),t.code===2?255:r.byte()],count=()=>{const n=r.byte();return n===255?r.word():n;};
 const fills=[];for(let n=count();n--;){const kind=r.byte();if(kind===0)fills.push({kind,color:rgba()});else{assert([66,67].includes(kind),'bitmap or solid fill only');fills.push({kind,bitmapId:r.word(),matrix:matrix(r)});}}
 const lines=[];for(let n=count();n--;){const width=r.word()/20;if(t.code===83){const start=r.u(2),join=r.u(2),hasFill=r.u(1);r.u(1);r.u(1);r.u(1);r.u(5);r.u(1);const end=r.u(2);assert(!hasFill&&join===0&&start===0&&end===0,'bounded round stroke only');}lines.push({width,color:rgba()});}
 let nf=r.u(4),nl=r.u(4),x=0,y=0;const edges=[],segments=[];let fill0=0,fill1=0,line=0;
 while(true){if(!r.u(1)){const flags=r.u(5);if(!flags)break;assert(!(flags&16),'new styles unsupported');if(flags&1){const n=r.u(5);x=r.s(n);y=r.s(n);edges.push(['M',x/20,y/20]);}if(flags&2)fill0=r.u(nf);if(flags&4)fill1=r.u(nf);if(flags&8)line=r.u(nl);}
 else{const from=[x/20,y/20],straight=r.u(1),n=r.u(4)+2;if(!straight){const cx=x+r.s(n),cy=y+r.s(n);x=cx+r.s(n);y=cy+r.s(n);edges.push(['Q',cx/20,cy/20,x/20,y/20]);segments.push({from,to:[x/20,y/20],control:[cx/20,cy/20],fill0,fill1,line});}else{if(r.u(1)){x+=r.s(n);y+=r.s(n);}else if(r.u(1))y+=r.s(n);else x+=r.s(n);edges.push(['L',x/20,y/20]);segments.push({from,to:[x/20,y/20],fill0,fill1,line});}}}
 return {id,bounds:[rect.xmin/20,rect.ymin/20,rect.xmax/20,rect.ymax/20],fills,lines,edges,segments,fill0,fill1,line};
}
export async function readBitmap(s,id,sharp){const t=s.chars.get(id),b=s.payload(t);
 if([6,21].includes(t.code))return sharp(b.subarray(2)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(t.code===35){const size=b.readUInt32LE(2),rgb=await sharp(b.subarray(6,6+size)).removeAlpha().raw().toBuffer({resolveWithObject:true}),alpha=zlib.inflateSync(b.subarray(6+size)),data=Buffer.alloc(alpha.length*4);assert.equal(rgb.info.width*rgb.info.height,alpha.length);for(let i=0;i<alpha.length;i++){data[i*4+3]=alpha[i];for(let c=0;c<3;c++)data[i*4+c]=alpha[i]?Math.min(255,Math.round(rgb.data[i*3+c]*255/alpha[i])):0;}return {data,info:{width:rgb.info.width,height:rgb.info.height,channels:4}};}
 assert([20,36].includes(t.code),'lossless or JPEG2 only');const format=b[2],width=b.readUInt16LE(3),height=b.readUInt16LE(5),out=Buffer.alloc(width*height*4),alpha=t.code===36;
 if(format===3){const count=b[7]+1,raw=zlib.inflateSync(b.subarray(8)),stride=(width+3)&~3,channels=alpha?4:3;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(y*width+x)*4,k=raw[count*channels+y*stride+x]*channels,a=alpha?raw[k+3]:255;for(let c=0;c<3;c++)out[p+c]=alpha&&a?Math.min(255,Math.floor(raw[k+c]*255/a)):raw[k+c];out[p+3]=a;}
 }else{assert.equal(format,5);const raw=zlib.inflateSync(b.subarray(7));for(let p=0;p<out.length;p+=4){const a=alpha?raw[p]:255;out[p+3]=a;for(let c=0;c<3;c++)out[p+c]=a?Math.min(255,Math.floor(raw[p+1+c]*255/a)):0;}}
 return {data:out,info:{width,height,channels:4}};
}


