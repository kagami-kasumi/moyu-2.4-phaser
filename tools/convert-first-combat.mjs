import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';import assert from 'node:assert/strict';
import {source,timeline,readShape,readBitmap} from './lib/first-slice.mjs';
export async function convertCombat(out='public/assets/first-combat'){
 // FFDec's bounded 0x42 mirrored bitmap sampling uses the opposite integer edge
 // to SVG's pixel-center mapping. The +1 raster correction below is checked
 // against independent PNGs; source matrices in the manifest remain unchanged.
 const s=source(),ids=new Set([2808,4321,3108,3109,3151,3152]);
 for(const id of [3126,3135,3146,2943,3167,3178,3187])for(const f of timeline(s,id))for(const l of f.layers)ids.add(l.characterId);
 const familyNames=['死神战将','刺虫人','炎女','鹿角兽','龙怪','骑士亡魂','巨猿','守卫魔','绿魔精','恐兽','提风','四牙怪','巨杰士','暗黑格拉斯','机关兽','强盗','冰妖剑士','魔军士兵','魔军副将','魔军主将'],families={};
 const sourceFrame=f=>({layers:f.layers,label:f.label,endMarker:f.actions.length>0});
 for(const name of familyNames){const parent=timeline(s,4116).find(f=>f.label===name).layers.find(l=>l.name==='playAction'),selectors=timeline(s,parent.characterId).slice(0,['死神战将','提风','强盗','魔军士兵','守卫魔','绿魔精','恐兽','巨猿'].includes(name)?8:6),animations={};for(const frame of selectors)for(const layer of frame.layers){let frames;try{frames=timeline(s,layer.characterId);}catch{}if(frames?.length){animations[layer.characterId]=frames.map(sourceFrame);for(const f of frames)for(const l of f.layers)ids.add(l.characterId);}else ids.add(layer.characterId);}families[name]={parent,selectors:selectors.map(sourceFrame),animations};}
 fs.mkdirSync(out,{recursive:true});const shapes={};
 for(const id of ids){const p=readShape(s,id),[x,y,r,b]=p.bounds,width=Math.ceil(r-x),height=Math.ceil(b-y),d=(p.edges[0]?.[0]==='L'?'M 0 0 ':'')+p.edges.map(e=>e.join(' ')).join(' ')+' Z',fill=p.fills[(p.fill1||p.fill0)-1];let content;
  if(fill.kind===0){assert.equal(id,2808);content=`<path d="${d}" fill="rgb(${fill.color.slice(0,3)})" stroke="black" stroke-width="${p.lines[0]?.width??0}" stroke-linejoin="round"/>`;}
  else {const bitmap=await readBitmap(s,fill.bitmapId,sharp),png=await sharp(bitmap.data,{raw:bitmap.info}).png().toBuffer(),m=fill.matrix.map((v,i)=>i<4?v/20:v);if(fill.kind===66&&m[0]===-1)m[4]++;if(fill.kind===66&&m[3]===-1)m[5]++;content=`<defs><clipPath id="clip"><path d="${d}"/></clipPath></defs><g clip-path="url(#clip)"><image style="image-rendering:pixelated" width="${bitmap.info.width}" height="${bitmap.info.height}" transform="matrix(${m})" href="data:image/png;base64,${png.toString('base64')}"/></g>`;}
  if(id===3531)fs.copyFileSync('local-resources/moyu/ice-palace-city-088-reference/3531.png',path.join(out,'3531.png'));else if([3285,3644].includes(id))fs.copyFileSync(`local-resources/moyu/lucky-gate-068-reference/${id}.png`,path.join(out,`${id}.png`));else await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}">${content}</svg>`)).png().toFile(path.join(out,`${id}.png`));shapes[id]={...p,file:`${id}.png`,...([3285,3644,3531].includes(id)?{rasterSource:'FFDec original PNG; integrity check only'}:{})};
 }
 const frame=f=>({layers:f.layers,label:f.label,endMarker:f.actions.length>0});
 const manifest={families,sourceSha256:'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9',shapes,map:{frame:7,name:'卡萨诺城野外一',layers:timeline(s,4536)[6].layers.filter(p=>p.depth<22)},monster:{parent:timeline(s,4116)[0].layers.find(l=>l.name==='playAction'),selectors:timeline(s,3147).map(frame),animations:Object.fromEntries([3126,3135,3146].map(id=>[id,timeline(s,id).map(frame)]))},mage:{selectors:timeline(s,3101).slice(8,10).map(frame),animation:timeline(s,2943).map(frame)}};
 manifest.dragon={parent:timeline(s,4116)[1].layers.find(l=>l.name==='playAction'),selectors:timeline(s,3188).map(frame),animations:Object.fromEntries([3167,3178,3187].map(id=>[id,timeline(s,id).map(frame)]))};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]?.endsWith('convert-first-combat.mjs'))await convertCombat(process.argv[2]);




