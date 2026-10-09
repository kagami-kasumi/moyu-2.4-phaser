import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {source,timeline,readShape,readBitmap} from './lib/first-slice.mjs';
export const ICON_LABELS=['英雄令','富豪礼包','灵魂礼包','英勇','莎菲','雪瑞','圣天使雷斯','圣天使奈丽','新手戒指','上品1级战士武器','良品1级战士衣服','良品1级战士头盔','良品1级战士鞋'];
export async function convertReward(out='public/assets/npc-reward'){
 fs.mkdirSync(out,{recursive:true});const s=source(),icons={},shapes={};
 for(const [id,names] of [[2047,ICON_LABELS],[2292,['老兵','男战士']],[2477,['凯恩']]]){
  timeline(s,id).forEach((f,i)=>{if(names.includes(f.label)){assert.equal(f.layers.length,1);icons[f.label]={sprite:id,frame:i+1,shape:f.layers[0].characterId,matrix:f.layers[0].matrix};}});
 }
 assert.equal(Object.keys(icons).length,16);
 for(const id of [...new Set(Object.values(icons).map(x=>x.shape))].sort((a,b)=>a-b)){
  const p=readShape(s,id),[x,y,r,b]=p.bounds,width=Math.ceil(r-x),height=Math.ceil(b-y),fill=p.fills[(p.fill1||p.fill0)-1];assert([66,67].includes(fill.kind));
  // All selected labels are rectangular non-smoothed clipped bitmap fills (0x43).
  assert.equal(fill.kind,67);assert.equal(fill.matrix[1],0);assert.equal(fill.matrix[2],0);
  assert(p.edges.every(e=>[x,r].includes(e[1])&&[y,b].includes(e[2])));
  const bitmap=await readBitmap(s,fill.bitmapId,sharp),pixels=Buffer.alloc(width*height*4),m=fill.matrix;
  for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++){
   const bx=Math.floor((x+xx+0.5-m[4])/(m[0]/20)),by=Math.floor((y+yy+0.5-m[5])/(m[3]/20));
   if(bx>=0&&by>=0&&bx<bitmap.info.width&&by<bitmap.info.height){const at=(by*bitmap.info.width+bx)*4;bitmap.data.copy(pixels,(yy*width+xx)*4,at,at+4);}
  }
  await sharp(pixels,{raw:{width,height,channels:4}}).png().toFile(path.join(out,id+'.png'));shapes[id]={...p,file:id+'.png'};
 }
 const manifest={sourceSha256:'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9',icons,shapes};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]?.endsWith('convert-npc-reward.mjs'))await convertReward(process.argv[2]);
