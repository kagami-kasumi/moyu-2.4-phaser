/** Design contract for preserving data belonging to content without implemented behavior. */
export type PreservedValue =
 | {kind:'undefined'}
 | {kind:'null'}
 | {kind:'boolean';value:boolean}
 | {kind:'string';value:string}
 | {kind:'number';value:number}
 | {kind:'special-number';value:'NaN'|'Infinity'|'-Infinity'|'-0'}
 | {kind:'array';length:number;entries:{index:number;value:PreservedValue}[];properties?:{key:string;value:PreservedValue}[]}
 | {kind:'object';entries:{key:string;value:PreservedValue}[]};

/** Missing keys are absent entries; explicit undefined is retained as its own value. */
export interface PreservedContentRecord {
 contentId?:string;
 sourceIdentity:{type?:string;name?:string;vocational?:string};
 payload:PreservedValue;
}

/** Catalog registration alone never authorizes execution of an opaque record. */
export type ContentProjection<T> =
 | {availability:'implemented';record:PreservedContentRecord;value:T}
 | {availability:'unimplemented'|'unrecognized';record:PreservedContentRecord};
