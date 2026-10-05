import fs from 'node:fs';import assert from 'node:assert/strict';import sharp from 'sharp';import path from 'node:path';
import {source,readShape,readBitmap,timeline} from './lib/first-slice.mjs';
export const SHAPES=[2804,2806,4323,4326,4238,4240,4242,4257,4259,4269,4281,4295,4305,4307];
export async function convertSlice(output='public/assets/first-slice'){
 fs.mkdirSync(output,{recursive:true});const s=source(),shapes={};
 for(const id of SHAPES){const p=readShape(s,id),[x,y,r,b]=p.bounds,width=Math.ceil(r-x),height=Math.ceil(b-y),d=p.edges.map(e=>e.join(' ')).join(' ')+' Z';
  const fill=p.fills[(p.fill1||p.fill0)-1];let content;
  if(fill.kind===0){const c=fill.color;content=`<path d="${d}" fill="rgb(${c.slice(0,3)})" stroke="black" stroke-width="${p.lines[0]?.width??0}" stroke-linejoin="round"/>`;}
  else{const bitmap=await readBitmap(s,fill.bitmapId,sharp),png=await sharp(bitmap.data,{raw:bitmap.info}).png().toBuffer(),m=fill.matrix.map((v,i)=>i<4?v/20:v);
   content=`<defs><clipPath id="clip"><path d="${d}"/></clipPath></defs><g clip-path="url(#clip)"><image width="${bitmap.info.width}" height="${bitmap.info.height}" transform="matrix(${m})" href="data:image/png;base64,${png.toString('base64')}"/></g>`;
  }
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}">${content}</svg>`)).png().toFile(path.join(output,`${id}.png`));shapes[id]={...p,file:`${id}.png`};
 }
 const map=timeline(s,4536),root=timeline(s,0)[8].layers.find(p=>p.name==='map');
 const manifest={sourceSha256:'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9',rootMatrix:root.matrix,shapes,maps:{outskirts:{frame:8,name:'卡萨诺城郊区',layers:map[7].layers.filter(p=>p.depth<22)},city:{frame:9,name:'卡萨诺城一',layers:map[8].layers.filter(p=>p.depth<22)}},portal:timeline(s,4247)[0].layers,npc:timeline(s,4312)[0].layers,portalFrames:timeline(s,4243).map(f=>f.layers[0].characterId)};
 fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]?.endsWith('convert-first-slice.mjs'))await convertSlice(process.argv[2]);
