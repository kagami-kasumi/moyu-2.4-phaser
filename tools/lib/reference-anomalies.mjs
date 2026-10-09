import assert from 'node:assert/strict';
/** Keep malformed source declarations visible without inventing AVM1 collision semantics. */
export function referenceAnomalies(unparsed){
 return unparsed.map(row=>{
  assert.equal(row.source.file,'frame_9/DoAction_2.as','Unreviewed malformed declaration');
  assert.equal(row.source.line,1772);assert.equal(row.reason,'Duplicate object property');
  assert.equal([...row.text.matchAll(/\bnextLvRate\s*:/g)].length,3);
  for(const key of ['type','nextLvRate','sd','qyg'])assert.ok(row.text.includes('"'+key+'"'));
  return {source:row.source,classification:'malformed-pet-restore-reference',identity:'stored allHuanShou[i].type; not a newly generated species',duplicatedProperty:'nextLvRate',storedInputs:['nextLvRate','sd','qyg'],resolution:'preserve all stored inputs separately; do not infer which duplicate property AVM1 retains',semanticStatus:'source-anomaly-unresolved',blocksFinalPersistenceReview:true};
 });
}
