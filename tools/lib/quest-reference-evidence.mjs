import assert from 'node:assert/strict';
/** A declaration is identified by its source position, never by a shared display title. */
export function questDeclarationTarget(definitions,candidate){
 const matches=definitions.filter(d=>d.kind==='quest'&&d.source.some(s=>s.file===candidate.source.file&&s.line===candidate.source.line));
 assert.equal(matches.length,1,'Quest declaration must resolve uniquely at '+JSON.stringify(candidate.source));
 assert.equal(matches[0].name,candidate.data.name,'Quest title differs at declaration');
 return [matches[0].id];
}
