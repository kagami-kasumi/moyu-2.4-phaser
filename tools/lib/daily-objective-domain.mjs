import assert from 'node:assert/strict';
import {QUEST_GENERATOR_RULES} from '../../src/content/quest-generator-rules.ts';
/** Domain of the original, reviewed caller arguments at each setDailyTask branch. */
export function dailyObjectiveDomain(candidate){
 const expression=candidate.data.name?.expression;
 if(candidate.source.file!=='DefineSprite_2210_任务系统/frame_1/DoAction.as'||!/^monstName[12]$/.test(expression??''))return null;
 const index=expression==='monstName1'?0:1,line=candidate.source.line;
 assert.ok([156,161,166].includes(line),'Unreviewed daily objective source branch');
 if(line===166)assert.equal(index,0,'Bounty has only one target');
 const names=QUEST_GENERATOR_RULES.commanders.flatMap(c=>line===166?c.bosses:[c.monsters[index]+(line===161?'精英':'')]);
 return {kind:'enemy',names:[...new Set(names)],expression,method:'reviewed setDailyTask caller argument position and military/elite/bounty branch',contract:'src/content/quest-generator-rules.ts'};
}
