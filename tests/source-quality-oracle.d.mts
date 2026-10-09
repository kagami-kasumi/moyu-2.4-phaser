import type {Item} from '../src/domain/npc-reward.ts';
export const qualitySource:{functions:Record<string,string>;hashes:{path:string;sha256:string}[];gradeSuccess:number[];gradeNames:string};
export function qualityOracle(item:Item,stone:Item):{r:any;forge:any;events:string[];normalize(v:Item):Item;yes():void;item():Item;stone():Item|null};
