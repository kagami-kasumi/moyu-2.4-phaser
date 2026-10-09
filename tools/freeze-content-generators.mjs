import fs from 'node:fs';
import crypto from 'node:crypto';
import {functionRange} from './lib/as2-data.mjs';
const file='DefineSprite_4312/frame_1/DoAction.as',source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
const range=functionRange(source,'function getWeddingRing(who)');
fs.writeFileSync('docs/reverse-engineering/content-registry/generator-source.json',JSON.stringify({files:[{file,sha256:crypto.createHash('sha256').update(source).digest('hex')}],functions:{getWeddingRing:{source:{file,line:range.line},body:range.text}}},null,2)+'\n');
