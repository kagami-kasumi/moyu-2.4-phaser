// Supplemental bounded source inputs for the initial pet and global equipment tables.
import fs from 'node:fs';
const root='local-resources/moyu/source-index/as/scripts/',main=fs.readFileSync(root+'frame_9/DoAction.as','utf8'),globals=fs.readFileSync(root+'frame_9/DoAction_2.as','utf8');
const pet=main.slice(main.indexOf('      case "凯恩":'),main.indexOf('      case "莎菲":'));
const tables=globals.split(/\r?\n/).filter(l=>/^_global\.战士(?:weapon|clothe|helmet|shoes)Name =/.test(l)).join('\n');
const ring=main.slice(main.indexOf('var ringMainValue ='),main.indexOf('this.upDataWeapon ='));
fs.writeFileSync('docs/reverse-engineering/npc-reward/initial-source.json',JSON.stringify({pet,tables,ring},null,2)+'\n',{flag:'wx'});
