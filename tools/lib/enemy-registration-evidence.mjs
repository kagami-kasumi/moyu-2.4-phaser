import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root='local-resources/moyu/source-index/as/scripts/';
const plain=v=>JSON.parse(JSON.stringify(v));
/** Source declaration equivalence only. Fixtures do not claim real gameplay input values. */
export function verifyEnemyRegistrations(definitions){
 const records=definitions.filter(d=>d.kind==='enemy'),expected=[];
 for(const frame of fs.readdirSync(root+'DefineSprite_4536').filter(n=>/^frame_\d+$/.test(n))){
  const file=`DefineSprite_4536/${frame}/DoAction.as`;if(!fs.existsSync(root+file))continue;
  for(const [i,line] of fs.readFileSync(root+file,'utf8').split(/\r?\n/).entries())if(/\binitMonster\(/.test(line))expected.push({file,line:i+1,statement:line.slice(line.indexOf('initMonster('))});
 }
 assert.equal(records.length,expected.length,'Enemy call-set count mismatch');
 const ids=[];
 for(const call of expected){
  const matches=records.filter(d=>d.source.length===1&&d.source[0].file===call.file&&d.source[0].line===call.line);
  assert.equal(matches.length,1,'Missing/duplicate enemy source call '+call.file+':'+call.line);
  const record=matches[0],{spawn,...data}=record.data;
  for(const high of [false,true]){
   let captured;
   const context={levels:high?120:1,rate:high?1.7:1,typename:high?'fixture-B':'fixture-A',_loc3_:high?99:0,elementRate:6,testCount:high?9:0,lives:high?3:0,lifeRate:high?25:1,attackRate:high?4:1,jookRate:high?80:0,reduceRate:high?75:0,bLife:51,bAttack:0.65,bItemAttack:0.8,bHuanShouAttack:0.65,bDefense:0.6,bItemDefense:0.75,bHuanShouDefense:0.6,bBurst:5,bJook:5,bossLevels:Array.from({length:13},(_,i)=>({levels:high?100+i:i+1,moreFire:high?200:0})),random:n=>high?n-1:0,initMonster:(begin,end,seed)=>{assert.equal(captured,undefined);captured={begin,end,seed};}};
   vm.createContext(context);vm.runInContext(call.statement,context,{timeout:1000});assert.ok(captured);
   const resolve=v=>{
    if(Array.isArray(v))return v.map(resolve);
    if(v&&typeof v==='object'){
     if(Object.keys(v).length===1&&typeof v.expression==='string'){
      assert.ok(call.statement.includes(v.expression),'Enemy expression absent from source '+record.id);
      return vm.runInContext('('+v.expression+')',context,{timeout:1000});
     }
     return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolve(x)]));
    }return v;
   };
   assert.deepEqual(resolve(data),plain(captured.seed),'Enemy declaration differs '+record.id);
   assert.deepEqual([resolve(spawn.beginNum),resolve(spawn.endNum)],[captured.begin,captured.end],'Enemy range differs '+record.id);
  }
  ids.push(record.id);
 }
 return ids;
}
