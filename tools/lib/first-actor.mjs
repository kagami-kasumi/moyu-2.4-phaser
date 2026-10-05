// Bounded offline SWF8 extractor. Reject unsupported tags/styles; never executes AVM1.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import { inspectSwf, parseTags, readRect } from './swf.mjs';

export const SOURCE_HASH = 'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9';
export class Bits {
  constructor(b, offset=0) { this.b=b; this.p=offset*8; }
  u(n) { let v=0; for(let i=0;i<n;i++) { assert(this.p<this.b.length*8,'truncated bits'); v=v*2+((this.b[this.p>>3]>>(7-(this.p++&7)))&1); } return v; }
  s(n) { const v=this.u(n); return n && v>=2**(n-1)?v-2**n:v; }
  align() { this.p=Math.ceil(this.p/8)*8; }
  byte() { this.align(); return this.u(8); }
  word() { return this.byte() | this.byte()<<8; }
}
export function matrix(r) {
  let a=1,d=1,b=0,c=0;
  if(r.u(1)) { const n=r.u(5); a=r.s(n)/65536; d=r.s(n)/65536; }
  if(r.u(1)) { const n=r.u(5); b=r.s(n)/65536; c=r.s(n)/65536; }
  const n=r.u(5), tx=r.s(n)/20,ty=r.s(n)/20; r.align();
  return [a,b,c,d,tx,ty];
}
export function loadSource(filename='魔域2.4.swf') {
  const file=fs.readFileSync(filename); assert.equal(inspectSwf(file).hashes.compressedSha256,SOURCE_HASH);
  const body=file.toString('ascii',0,3)==='CWS'?zlib.inflateSync(file.subarray(8)):file.subarray(8);
  const tags=parseTags(body,readRect(body).bytes+4,body.length).tags;
  const chars=new Map(tags.filter(t=>[2,22,32,36,39].includes(t.code)).map(t=>[body.readUInt16LE(t.offset),t]));
  return {body,tags,chars,payload:t=>body.subarray(t.offset,t.offset+t.length)};
}
export function placements(source,id) {
  const frames=[], display=new Map(); let actions=[];
  for(const t of source.chars.get(id).children) {
    const b=source.payload(t);
    if(t.code===26) {
      const flags=b[0],depth=b.readUInt16LE(1); if(id===3106 && depth!==1)continue; let r=new Bits(b,3);
      assert(!(flags&0xc8),'unsupported color/clip action/depth');
      const p={...(flags&1?display.get(depth):{}),depth};
      if(flags&2) p.characterId=r.word();
      if(flags&4) p.matrix=matrix(r);
      p.matrix??=[1,0,0,1,0,0];
      if(flags&16) p.ratio=r.word();
      if(flags&32) { let s='';for(let c;(c=r.byte());)s+=String.fromCharCode(c);p.name=s; }
      display.set(depth,p);
    } else if(t.code===28) display.delete(b.readUInt16LE(0));
    else if(t.code===12) actions.push(b.toString('hex'));
    else if(t.code===1) { frames.push({layers:structuredClone([...display.values()].sort((a,b)=>a.depth-b.depth)),actions});actions=[]; }
    else assert([0,18,45,43].includes(t.code),`unsupported timeline tag ${t.code}`);
  }
  return frames;
}
export function shape(source,id) {
  const tag=source.chars.get(id);assert([2,32].includes(tag.code));const b=source.payload(tag),bounds=readRect(b,2);
  const r=new Bits(b,2+bounds.bytes);assert.equal(r.byte(),1,'single fill only');const kind=r.byte();let fill;
  if(kind===67) fill={bitmapId:r.word(),matrix:matrix(r)};
  else { assert.equal(kind,0);fill={color:[r.byte(),r.byte(),r.byte(),tag.code===32?r.byte():255]}; }
  assert.equal(r.byte(),0,'no lines');let nf=r.u(4),nl=r.u(4),x=0,y=0;const edges=[];
  while(true) {
    if(!r.u(1)) {
      const flags=r.u(5);if(!flags)break;assert(!(flags&16),'no new styles');
      if(flags&1) { const n=r.u(5); x=r.s(n);y=r.s(n);edges.push(['M',x/20,y/20]); }
      if(flags&2)r.u(nf);if(flags&4)r.u(nf);if(flags&8)r.u(nl);
    } else {
      const straight=r.u(1),n=r.u(4)+2;
      if(straight) { if(r.u(1)) { x+=r.s(n);y+=r.s(n); } else if(r.u(1))y+=r.s(n);else x+=r.s(n);edges.push(['L',x/20,y/20]); }
      else {const cx=x+r.s(n),cy=y+r.s(n);x=cx+r.s(n);y=cy+r.s(n);edges.push(['Q',cx/20,cy/20,x/20,y/20]);}
    }
  }
  if(edges[0]?.[0]!=='M')edges.unshift(['M',0,0]);
  return {id,bounds:[bounds.xmin/20,bounds.ymin/20,bounds.xmax/20,bounds.ymax/20],fill,edges};
}
export function bitmap(source,id) {
  const t=source.chars.get(id); assert.equal(t.code,36);const b=source.payload(t);
  assert.equal(b[2],3,'indexed RGBA only'); const width=b.readUInt16LE(3),height=b.readUInt16LE(5),count=b[7]+1;
  const raw=zlib.inflateSync(b.subarray(8)),stride=(width+3)&~3,data=Buffer.alloc(width*height*4);
  assert.equal(raw.length,count*4+stride*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const palette=raw[count*4+y*stride+x]*4,p=(y*width+x)*4,a=raw[palette+3];
    for(let c=0;c<3;c++)data[p+c]=a?Math.min(255,Math.floor(raw[palette+c]*255/a)):0;
    data[p+3]=a;
  }
  return {data,width,height};
}
