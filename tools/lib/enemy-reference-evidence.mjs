import assert from 'node:assert/strict';
/** Spawn declarations identify a concrete map/branch, rather than all same-name enemies. */
export function enemyDeclarationTarget(definitions,candidate){
 const matches=definitions.filter(d=>d.kind==='enemy'&&d.source.some(s=>s.file===candidate.source.file&&s.line===candidate.source.line));
 assert.equal(matches.length,1,'Enemy declaration must resolve uniquely at '+JSON.stringify(candidate.source));
 assert.equal(matches[0].name,candidate.data.myName,'Enemy name differs at declaration');
 return [matches[0].id];
}
