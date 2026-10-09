import type {SourceExpression,SourceLocation,SourceValue} from './registry-types.ts';
/** Field templates are source contracts, not concrete keys or a validated save codec. */
export interface PersistenceFieldRegistration {
 id:string;
 key:string|SourceExpression;
 owner:string;
 property:string;
 valueType:string;
 allowUndefined:boolean;
 default:{[key:string]:SourceValue};
 finalInitialization:{[key:string]:SourceValue};
 postRestoreEffects:{[key:string]:SourceValue};
 persistence:{[key:string]:SourceValue};
 restorePlan:{phase:string;source:SourceLocation;statement:string;conditions:SourceValue[]}[];
 savePlan:{source:SourceLocation;expression:string;conditions:SourceValue[]}[];
 restore:{[key:string]:SourceValue}|null;
 sources:{save:SourceLocation[];saveRead:SourceLocation[];restore:SourceLocation[];external:SourceLocation[]};
 conditions:{save:SourceValue[];restore:SourceValue[]};
 reference:SourceValue|null;
}
