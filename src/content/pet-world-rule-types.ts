import type {SourceValue,SourceLocation} from './registry-types.ts';
export interface PetWorldRuleCatalog {
 groups:Record<string,{inputs:string;conditions:string;defaults:string;outputs:string;boundary:string;runtime:string[];tests:string[]}>;
 records:{id:string;source:SourceLocation;scope:{signature:string;line:number;parameters:string};target:string;operator:string;value:SourceValue;inputs:string[];conditions:{header:string;line:number}[];classification:string;evidence:string;semanticStatus:string;semanticModule?:string;semanticContract?:string;group:string;representation:string;review:string}[];
 supplements:{source:SourceLocation;group:string;scope:string;expression:string;conditions:{header:string;line:number}[];kind:string}[];
}
