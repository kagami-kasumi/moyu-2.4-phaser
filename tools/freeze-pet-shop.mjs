import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';import {source,timeline} from './lib/first-slice.mjs';
const base='local-resources/moyu/source-index/',files=['frame_9/DoAction','frame_9/DoAction_2','DefineSprite_2089_幻兽商店/frame_1/DoAction','DefineSprite_4312/frame_1/DoAction','DefineSprite_4536/frame_1/DoAction','DefineSprite_4536/frame_12/DoAction'];
const text=fs.readFileSync(base+'as/scripts/frame_9/DoAction_2.as','utf8'),catalog=vm.runInNewContext('['+text.match(/this.huanShouShop.saleThings = new Array\(([^\r\n]+)\);/)[1]+']');
const hashes=files.flatMap(f=>['as','pcode'].map(format=>{const path=base+format+'/scripts/'+f+'.'+format;return {path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')};}));
const binding=timeline(source(),0)[8].layers.find(p=>p.name==='huanShouShop'),xml=fs.readFileSync(base+'source.xml','utf8').match(/<item[^>]*name="huanShouShop"[^>]*>/g);
fs.mkdirSync('docs/reverse-engineering/pet-shop',{recursive:true});fs.writeFileSync('docs/reverse-engineering/pet-shop/source-fixture.json',JSON.stringify({catalog,hashes,binding,xml},null,2)+'\n');
fs.writeFileSync('src/content/pet-shop-data.ts','// Verified frame_9/DoAction_2:191; factory fields are independent.\nexport const PET_SHOP_GOODS='+JSON.stringify(catalog,null,2)+' as const;\n');
