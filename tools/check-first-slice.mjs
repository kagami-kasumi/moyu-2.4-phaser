import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import sharp from 'sharp';import os from 'node:os';import path from 'node:path';
import {source,timeline,readShape} from './lib/first-slice.mjs';import {convertSlice,SHAPES} from './convert-first-slice.mjs';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/first-slice/source-fixture.json','utf8')),s=source();
const attr=(str,k)=>str.match(new RegExp(`\\b${k}="([^"]*)"`))?.[1];
const mat=m=>[m.hasScale==='true'?+m.scaleX:1,m.hasRotate==='true'?+m.rotateSkew0:0,m.hasRotate==='true'?+m.rotateSkew1:0,m.hasScale==='true'?+m.scaleY:1,+m.translateX/20,+m.translateY/20];
function compareLayers(actual,expected){assert.equal(actual.length,expected.length);for(const e of expected){const a=actual.find(p=>p.depth===e.depth);assert.equal(a.characterId,+e.characterId);if(e.name)assert.equal(a.name,e.name);if(e.matrix)mat(e.matrix).forEach((v,i)=>assert(Math.abs(v-a.matrix[i])<1e-7));if(e.colorTransform)assert.equal(a.color.mult[3],+e.colorTransform.alphaMultTerm);}}
for(const [id,v]of Object.entries(f.timelines)){const a=timeline(s,+id);assert.equal(a.length,v.frames.length);v.frames.forEach((frame,i)=>compareLayers(a[i].layers,frame));}
for(const [frame,layers]of Object.entries(f.mapFrames))compareLayers(timeline(s,4536)[+frame-1].layers,layers);
for(const [frame,layers]of Object.entries(f.npcFrames))compareLayers(timeline(s,4308)[+frame-1].layers,layers);
compareLayers([timeline(s,0)[8].layers.find(p=>p.name==='map')],[f.rootMap]);
for(const a of f.actions)assert(timeline(s,a.timeline)[a.frame-1].actions.some(b=>crypto.createHash('sha256').update(b).digest('hex')===a.sha256));
for(const id of SHAPES){const a=readShape(s,id),xml=f.shapes[id],bounds=xml.match(/<shapeBounds[^>]+/)[0];assert.deepEqual(a.bounds,['Xmin','Ymin','Xmax','Ymax'].map(k=>+attr(bounds,k)/20));let x=0,y=0;const edges=[];
 for(const row of xml.matchAll(/<item type="(StyleChangeRecord|StraightEdgeRecord)"[^>]+/g)){const r=row[0];if(row[1]==='StyleChangeRecord'&&attr(r,'stateMoveTo')==='true'){x=+attr(r,'moveDeltaX');y=+attr(r,'moveDeltaY');edges.push(['M',x/20,y/20]);}else if(row[1]==='StraightEdgeRecord'){x+=+attr(r,'deltaX');y+=+attr(r,'deltaY');edges.push(['L',x/20,y/20]);}}assert.deepEqual(a.edges,edges);
}
for(const h of JSON.parse(fs.readFileSync('docs/reverse-engineering/first-slice/behavior-source.json','utf8')).hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
for(const entry of JSON.parse(fs.readFileSync('docs/reverse-engineering/first-slice/baseline/provenance.json','utf8')).files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync('docs/reverse-engineering/first-slice/'+entry.file)).digest('hex'),entry.sha256);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'moyu-slice-'));const report=[];
try{await convertSlice(tmp);assert.equal(fs.readFileSync(path.join(tmp,'manifest.json'),'utf8'),fs.readFileSync('public/assets/first-slice/manifest.json','utf8'));
 for(const id of SHAPES){const b=await sharp(`docs/reverse-engineering/first-slice/baseline/${id}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true}),a=await sharp(path.join(tmp,`${id}.png`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(a.info,b.info);assert.deepEqual(fs.readFileSync(path.join(tmp,`${id}.png`)),fs.readFileSync(`public/assets/first-slice/${id}.png`));let error=0,max=0;
  for(let i=0;i<a.data.length;i+=4)for(let c=0;c<4;c++){const av=c===3?a.data[i+c]:a.data[i+c]*a.data[i+3]/255,bv=c===3?b.data[i+c]:b.data[i+c]*b.data[i+3]/255;error+=Math.abs(av-bv);max=Math.max(max,Math.abs(av-bv));}const mean=error/a.data.length;
  if([2804,2806].includes(id))assert(mean<0.03);else if([4238,4240,4242].includes(id))assert(max<=1.01);else assert.equal(mean,0);report.push({id,mean,max});
 }
}finally{assert(path.resolve(tmp).startsWith(path.resolve(os.tmpdir())+path.sep+'moyu-slice-'));fs.rmSync(tmp,{recursive:true,force:true});}
fs.mkdirSync('.evidence/first-slice',{recursive:true});fs.writeFileSync('.evidence/first-slice/source-check.json',JSON.stringify({actions:f.actions.length,shapes:report,checks:'binary vs frozen XML; AS/P-code hashes; fresh conversion vs FFDec PNG and shipping files'},null,2));console.log(JSON.stringify(report));
