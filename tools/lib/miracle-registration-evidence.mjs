import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
export function verifyMiracleRegistration(definitions){
 const file='frame_9/DoAction.as',text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
 const rows=[...text.matchAll(/addHuanShou\((\{type:"奇迹龙"[^{}]*\})\)/g)];assert.equal(rows.length,1);
 const record=definitions.find(d=>d.id==='pet:奇迹龙');assert.ok(record);
 const source={file,line:text.slice(0,rows[0].index).split('\n').length};
 assert.deepEqual(record.source,[source]);assert.equal(record.data.initializations.length,1);
 const variant=record.data.initializations[0];assert.deepEqual(variant.source,source);assert.equal(variant.itemTrigger,'奇迹龙');
 const symbols={_loc11_:'_loc11_',_loc6_:'_loc6_',_loc13_:'_loc13_',_loc12_:'_loc12_',_loc14_:'_loc14_'};
 const expected=JSON.parse(JSON.stringify(vm.runInNewContext('('+rows[0][1]+')',symbols)));
 const actual=Object.fromEntries(Object.entries(variant.definition).map(([k,v])=>[k,v&&typeof v==='object'?v.expression:v]));
 assert.deepEqual(actual,expected,'Miracle seed fields differ');
 const g=record.data.generationRules;
 assert.equal(g.implementation,'src/content/miracle-dragon-rules.ts:miracleDragonSeed');
 assert.equal(g.branchCount,4);assert.equal(g.drawCount,4);assert.equal(g.quantization,10000);
 assert.deepEqual(g.baseSpans,[35,3,3,2]);assert.deepEqual(g.boostedSpans,[105,9,9,6]);
 return [record.id];
}
