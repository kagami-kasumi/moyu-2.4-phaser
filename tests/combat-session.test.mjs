import test from 'node:test';import assert from 'node:assert/strict';
import {CombatSession} from '../src/domain/combat-session.ts';import {spawnFirstCombat} from '../src/domain/first-combat-spawn.ts';
function fixture(){
 const events=[],role={id:'role',x:250,y:300,alive:true,motion:'idle',animationFrame:1},pets=[];
 const monsters=spawnFirstCombat(n=>n-1);for(const m of monsters){m.x=260;m.y=300;m.target='role';m.stopRate=90;}
 const ports={role,pets:()=>pets,random:n=>n-1,roleActivity(){events.push(['role',session.tick]);if(role.motion==='finished'){events.push(['player-hit',session.tick]);role.motion='idle';role.animationFrame=1;}},hitMonster(p,h){events.push([p.id,h.target,session.tick]);},hitParty(m,h){events.push([m.id,h.target,session.tick]);}};
 const session=new CombatSession(monsters,ports);return {session,ports,events,role,pets,monsters};
}
test('deer marker at ninth child frame, hit on following Activities, six source slots in order',()=>{
 const f=fixture();f.session.step();assert(f.monsters.every(m=>m.motion==='acting'&&m.animationFrame===1));
 for(let i=0;i<7;i++)f.session.step();assert.equal(f.events.filter(e=>e[0].startsWith('monster')).length,0);assert(f.monsters.every(m=>m.animationFrame===8));
 f.session.step();assert(f.monsters.every(m=>m.motion==='finished'&&m.animationFrame===9));assert.equal(f.events.filter(e=>e[0].startsWith('monster')).length,0);
 f.session.step();assert.deepEqual(f.events.filter(e=>e[0].startsWith('monster')),f.monsters.map(m=>[m.id,'role',10]));assert(f.monsters.every(m=>m.stopTime===6));
});
test('role eleventh marker does not hit early; pause and chunked advance preserve source phase',()=>{
 const a=fixture(),b=fixture();for(const f of [a,b]){f.role.motion='acting';f.monsters.forEach(m=>m.alive=false);}
 a.session.advance(600);a.session.paused=true;const before=structuredClone(a.role);a.session.advance(10000);assert.deepEqual(a.role,before);a.session.paused=false;a.session.advance(200);
 for(let i=0;i<48;i++)b.session.advance(1000/60);
 assert.deepEqual(a.events,b.events);assert.deepEqual(a.role,b.role);assert.deepEqual(a.events.filter(e=>e[0]==='player-hit'),[['player-hit',11]]);
});
test('dragon attack and skill retain their different child timeline lengths',()=>{
 for(const [effect,end]of [['attack',10],['skill',7]]){const f=fixture();const m=spawnFirstCombat(n=>n-1,1)[0];Object.assign(m,{x:260,y:300,target:'role',effect,motion:'acting',animationFrame:1});f.session.monsters=[m];for(let i=0;i<end-1;i++)f.session.step();assert.equal(m.motion,'finished');assert.equal(f.events.filter(e=>e[0]==='monster1').length,0);f.session.step();assert.deepEqual(f.events.find(e=>e[0]==='monster1'),['monster1','role',end]);}
});
test('map close during first hit cancels remaining slots, pending attacks and future clock work',()=>{
 const f=fixture();for(const m of f.monsters){m.motion='finished';m.effect='attack';}
 f.ports.hitParty=(m,h)=>{f.events.push([m.id,h.target]);f.session.close();};f.session.advance(10000);
 assert.equal(f.session.tick,1);assert.deepEqual(f.events,[['role',1],['monster1','role']]);assert(f.monsters.every(m=>m.target===undefined));f.session.step();assert.equal(f.session.tick,1);
});
