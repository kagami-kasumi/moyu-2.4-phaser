// Offline source functions; not imported by the application.
import fs from 'node:fs';
import vm from 'node:vm';
const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/role-currency-source.json','utf8'));
export function installRoleCurrency(target){
 const context=vm.createContext({isNaN,_global:{numberToString:String},SecreteCodeMC:{BASE:123456}});
 const compile=(name,args)=>vm.runInContext('(function('+args+')'+frozen.functions[name].body+')',context);
 target.SECRETECODE=-3;target.cheat=0;
 target.setSecreteCode=compile('setSecreteCode','val');target.getSecreteCode=compile('getSecreteCode','val');
 for(const field of ['xxx_ms','xxx_res'])Object.defineProperty(target,field,{get:compile('get_'+field,''),set:compile('set_'+field,'val'),enumerable:true});
 return target;
}
