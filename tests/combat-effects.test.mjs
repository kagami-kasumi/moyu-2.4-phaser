import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {CombatEffects} from '../src/domain/combat-effects.ts';import {functionRange} from '../tools/lib/as2-data.mjs';
test('frost and non-defense execute the source frame-one script, including final visible zero-count cycle',()=>{
 for(const [kind,id,length]of [['frost',2874,2],['nonDefense',2878,15]])for(const seconds of [1,3,5]){
  const source=fs.readFileSync(`local-resources/moyu/source-index/as/scripts/DefineSprite_${id}/frame_1/DoAction.as`,'utf8'),script=new vm.Script(source.slice(0,source.indexOf('this.run ='))),ctx=vm.createContext({times:undefined,_visible:false,_parent:{stopTime:0},stop(){},isNaN});ctx.gotoAndPlay=()=>script.runInContext(ctx);
  const run=vm.runInContext('(function(val)'+functionRange(source,'this.run =').text+')',ctx);let stop=0;const effects=new CombatEffects((_,v)=>stop=v);run.call(ctx,seconds);effects.run('m',kind,seconds,1);let frame=1;
  for(let tick=1;tick<=100;tick++){if(tick>1){frame=frame%length+1;if(frame===1&&ctx._visible)script.runInContext(ctx);}effects.step(tick,()=>true);if(kind==='frost')assert.equal(stop,ctx._parent.stopTime,`${seconds}/${tick}`);else assert.equal(effects.nonDefense('m'),ctx._visible,`${seconds}/${tick}`);}
 }
});
