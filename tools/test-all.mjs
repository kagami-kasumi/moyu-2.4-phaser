import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
// Keep suite boundaries and fail-fast order without the Windows shell length limit.
const suites=JSON.parse(fs.readFileSync(new URL('./test-suites.json',import.meta.url),'utf8'));
for(const args of suites){
 const result=spawnSync(process.execPath,args,{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
