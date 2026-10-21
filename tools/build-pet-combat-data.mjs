import fs from 'node:fs';import {functionRange} from './lib/as2-data.mjs';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/HuanShouClass.as','utf8'),table={};
const body=functionRange(source,'function initialize()').text.split('var _loc2_')[0]+'break;';
for(const match of body.matchAll(/((?:\s*case "[^"]+":)+)([\s\S]*?)break;/g)){
 const fields={};for(const m of match[2].matchAll(/this\.(speedX|speedY|attackLength|attackHeight|attackType) = ("[^"]*"|[\d.]+);/g))fields[m[1]]=JSON.parse(m[2]);
 if(Object.keys(fields).length!==5)throw Error('Incomplete movement fields');
 for(const m of match[1].matchAll(/case "([^"]+)":/g))table[m[1]]=fields;
}
if(Object.keys(table).length!==25)throw Error('Incomplete pet species');
const text='// HuanShouClass.initialize; checked independently by pet-combat-data.test.mjs.\nexport const PET_COMBAT_DATA:Record<string,{speedX:number;speedY:number;attackLength:number;attackHeight:number;attackType:string}>='+JSON.stringify(table,null,2)+';\n',file='src/content/pet-combat-data.ts';
if(process.argv.includes('--write'))fs.writeFileSync(file,text);else if(fs.readFileSync(file,'utf8')!==text)throw Error('Pet combat data drift');
