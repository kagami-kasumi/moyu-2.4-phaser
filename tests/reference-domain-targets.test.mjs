import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('generated item references contain only the bounded domain, without category-wide fallback',()=>{
 const audit=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/reference-audit.json','utf8'));
 const rows=audit.rows.filter(r=>r.classification==='generated-item-name');assert.equal(rows.length,9);
 for(const row of rows){
  const domain=audit.dynamicDomains.find(d=>d.source.file===row.source.file&&d.source.line===row.source.line&&d.expression===row.identity.name.expression);
  assert.ok(domain);assert.deepEqual(row.targets,domain.targets);assert.equal(new Set(row.targets).size,row.targets.length);
  assert.equal(row.targets.length,2,'Each reviewed name expression has exactly two possible identities');
 }
 const box=rows.find(r=>r.source.file.includes('幻兽研究所'));
 assert.deepEqual(box.targets,['item:初级月光宝盒','item:中级月光宝盒']);
});
