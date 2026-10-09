import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {referenceCompletionIssues} from '../tools/lib/reference-completion.mjs';
const audit=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/reference-audit.json','utf8'));
test('changing completion label cannot hide the unresolved source anomaly',()=>{
 const changed=structuredClone(audit);changed.status='complete-reference-audit';
 assert.ok(referenceCompletionIssues(changed).some(s=>s.startsWith('Unresolved source anomaly')));
 changed.anomalies=[];
 assert.ok(referenceCompletionIssues(changed).some(s=>s.startsWith('Unaccounted malformed source')));
});
test('completion rejects restored name ambiguity and overbroad generator targets',()=>{
 const changed=structuredClone(audit);
 changed.rows.find(r=>r.classification==='enemy').targets.push('another-enemy');
 changed.rows.find(r=>r.classification==='generated-item-name').targets.push('another-item');
 const issues=referenceCompletionIssues(changed);
 assert.ok(issues.some(s=>s.startsWith('Ambiguous declaration')));
 assert.ok(issues.some(s=>s.startsWith('Generated item target/domain mismatch')));
});
