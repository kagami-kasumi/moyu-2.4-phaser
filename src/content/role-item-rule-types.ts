import type {SourceLocation,SourceValue} from './registry-types.ts';
/** Declarative contracts for unimplemented consumers. Evaluate via named pure
 * modules only; expressions must never be passed to eval/Function. */
export interface RoleItemRuleCatalog {
 groups:Record<string,{meaning:string;runtime:string[];tests:string[]}>;
 records:{id:string;group:string;representation:string;source:SourceLocation;scope:string;target:string;operator:string;value:SourceValue;inputs:string[];conditions:{header:string;line:number}[];review:string;existingModule:string|null}[];
 supplements:{source:SourceLocation;group:string;scope:string;expression:string;kind:string;meaning:string}[];
}
