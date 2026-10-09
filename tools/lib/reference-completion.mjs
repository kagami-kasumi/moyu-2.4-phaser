/** Structural completion invariants supplement, rather than trust, the report's status label. */
export function referenceCompletionIssues(audit,acceptAnomaly=()=>false){
 const issues=[];
 for(const row of audit.rows){
  if(new Set(row.targets).size!==row.targets.length)issues.push('Duplicate reference targets '+JSON.stringify(row.source));
  if(['quest','enemy'].includes(row.classification)&&row.targets.length!==1)issues.push('Ambiguous declaration '+JSON.stringify(row.source));
  if(row.classification==='generated-item-name'){
   const domain=audit.dynamicDomains.find(d=>d.source.file===row.source.file&&d.source.line===row.source.line&&d.expression===row.identity.name?.expression);
   if(!domain||JSON.stringify([...row.targets].sort())!==JSON.stringify([...domain.targets].sort()))issues.push('Generated item target/domain mismatch '+JSON.stringify(row.source));
  }
 }
 for(const raw of audit.unparsed??[]){
  const anomaly=(audit.anomalies??[]).find(a=>a.source.file===raw.source.file&&a.source.line===raw.source.line);
  if(!anomaly)issues.push('Unaccounted malformed source '+JSON.stringify(raw.source));
 }
 for(const anomaly of audit.anomalies??[]){
  if((anomaly.semanticStatus==='source-anomaly-unresolved'||anomaly.blocksFinalPersistenceReview)&&!acceptAnomaly(anomaly))issues.push('Unresolved source anomaly '+JSON.stringify(anomaly.source));
 }
 return issues;
}
