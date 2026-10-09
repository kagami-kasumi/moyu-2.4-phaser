import assert from 'node:assert/strict';

const dynamicClasses = new Set(['dynamic-identity', 'generated-item-name', 'dynamic-quest-requirement']);
const key = source => `${source.file}:${source.line}`;

/** Identity-only gate. Persistence collision semantics remain a separate, blocking contract. */
export function identityCoverage(definitions, census, audit, expectedIds) {
 const ids = new Set(definitions.map(d => d.id));
 assert.equal(ids.size, definitions.length, 'Duplicate registry ID');
 const expected = new Set(expectedIds);
 const missing = [...expected].filter(id => !ids.has(id));
 const extra = [...ids].filter(id => !expected.has(id));
 assert.deepEqual(missing, [], 'Missing source identities');
 assert.deepEqual(extra, [], 'Unaccounted registry identities');
 assert.equal(audit.rows.length, census.objects.length, 'Reference census cardinality');
 const seen = new Set();
 for (const [index,row] of audit.rows.entries()) {
  const anchor = key(row.source);
  const candidate=census.objects[index];
  assert.equal(anchor,key(candidate.source),'Changed reference anchor '+anchor);
  const identity=Object.fromEntries(['type','name','nTitle','myName'].filter(k=>candidate.data[k]!==undefined).map(k=>[k,candidate.data[k]]));
  assert.deepEqual(row.identity,identity,'Changed reference identity '+anchor);
  seen.add(anchor);
  assert.ok(!row.unresolved && row.classification !== 'unclassified', 'Unresolved reference '+anchor);
  assert.equal(new Set(row.targets).size, row.targets.length, 'Duplicate reference target '+anchor);
  for (const target of row.targets) assert.ok(ids.has(target), 'Unknown reference target '+target);
  if (['quest','enemy'].includes(row.classification)) assert.equal(row.targets.length,1,'Ambiguous declaration '+anchor);
  if (!row.targets.length) assert.ok(row.reason, 'Unexplained reference exclusion '+anchor);
  if (dynamicClasses.has(row.classification)) {
   const expression=row.identity.type?.expression??row.identity.name?.expression;
   const domain=audit.dynamicDomains.find(d=>key(d.source)===anchor&&d.expression===expression);
   assert.ok(domain, 'Missing dynamic domain '+anchor);
   assert.deepEqual(domain.missing, [], 'Incomplete dynamic domain '+anchor);
   assert.deepEqual([...row.targets].sort(), [...domain.targets].sort(), 'Dynamic target mismatch '+anchor);
  }
 }
 for (const domain of audit.dynamicDomains) {
  assert.ok(seen.has(key(domain.source)), 'Orphan dynamic domain');
  assert.deepEqual(domain.missing, [], 'Missing dynamic target');
  for (const target of domain.targets) assert.ok(ids.has(target), 'Unknown dynamic target');
  const families={武器:'weaponName',衣服:'clotheName',鞋:'shoesName',头盔:'helmetName'};
  const targets=new Set();
  for(const name of domain.names){
   const matches=definitions.filter(d=>domain.kind==='equipment-family'?d.kind==='equipment'&&d.data.family===families[name]:d.kind===domain.kind&&(d.name===name||d.aliases.includes(name)));
   assert.ok(matches.length,'Unresolved domain name '+name);
   for(const match of matches)targets.add(match.id);
  }
  assert.deepEqual([...domain.targets].sort(),[...targets].sort(),'Domain name/target mismatch');
 }
 assert.deepEqual(audit.unparsed, census.unparsed, 'Malformed source omitted');
 for (const raw of census.unparsed) {
  const anomaly=audit.anomalies.find(a=>key(a.source)===key(raw.source));
  assert.ok(anomaly, 'Missing anomaly disposition');
  assert.equal(anomaly.classification,'malformed-pet-restore-reference');
  assert.equal(anomaly.identity,'stored allHuanShou[i].type; not a newly generated species');
  assert.equal(anomaly.blocksFinalPersistenceReview,true,'Persistence blocker must remain visible');
 }
 for (const d of definitions) {
  assert.ok(d.source.length && d.evidenceScope?.verified.length && d.evidenceScope?.notClaimed.length, 'Missing scoped evidence '+d.id);
  assert.equal(d.evidence,'verified','Unverified identity '+d.id);
  assert.equal(d.availability,'registered','Registration cannot claim gameplay availability');
  for (const source of d.source) assert.ok(census.sources.some(s=>s.file===source.file)&&Number.isInteger(source.line)&&source.line>0,'Invalid source anchor '+d.id);
 }
 return [...new Set(definitions.map(d=>d.kind))].map(kind=>({kind,sourceIdentities:[...expected].filter(id=>id.startsWith(kind+':')).length,registered:definitions.filter(d=>d.kind===kind).length,duplicateIds:0,missing:0,extra:0}));
}
