/** Fail closed on all 653 rows, independently of the report status string. */
export function persistenceCompletionIssues(schema,repairs){
 const issues=[];
 if(schema.status!=='final-schema-reviewed')issues.push('Persistence schema not finalized');
 if(schema.fields.length!==653)issues.push('Persistence field set incomplete');
 const keys=new Set();
 for(const row of schema.fields){
  const key=typeof row.key==='string'?row.key:row.key.expression.replace(/\s+/g,'');
  if(keys.has(key))issues.push('Duplicate persistence key '+key);keys.add(key);
  if(row.type.status!=='verified'||!row.finalInitialization?.recipe||!row.postRestoreEffects?.recipe||!row.restoreSemantics||!row.persistence||!row.restorePlan||row.restorePlan.length!==row.load.length||['unknown','source-initialization-steps'].includes(row.default.status))issues.push('Incomplete field semantics '+key);
 }
 const repair=repairs?.petConstructor;
 if(!repair||repair.id!=='distinct-pet-constructor-fields'||repair.source.file!=='frame_9/DoAction_2.as'||repair.source.line!==1772||repair.evidence!=='design'||repair.legacyCollision!=='unknown'||repair.rawPolicy!=='preserve-all-source-keys')issues.push('Missing explicit pet repair disposition');
 for(const name of ['nextLvRate','sd','qyg']){
  if(repair?.mapping?.[name]!==name)issues.push('Pet input collision '+name);
  if(!schema.fields.some(f=>f.owner==='huanShou.allHuanShou'&&f.property===name&&f.save.length&&f.load.length))issues.push('Missing pet source input '+name);
 }
 return issues;
}

export function acceptedPersistenceAnomaly(anomaly,schema,repairs){
 return persistenceCompletionIssues(schema,repairs).length===0&&
  anomaly.classification==='malformed-pet-restore-reference'&&anomaly.source.file==='frame_9/DoAction_2.as'&&anomaly.source.line===1772&&
  JSON.stringify(anomaly.storedInputs)===JSON.stringify(['nextLvRate','sd','qyg']);
}
