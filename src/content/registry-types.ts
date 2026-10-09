/** Source expressions are documentation, never executable runtime code. */
export interface SourceExpression {expression:string}
export type SourceValue = string|number|boolean|null|SourceExpression|SourceValue[]|{[key:string]:SourceValue};
export interface SourceLocation {file:string;line:number}
export type ContentKind='item'|'equipment'|'map'|'quest'|'npc'|'skill'|'enemy'|'pet'|'profession'|'building'|'boss-growth'|'objective'|'reward';
export interface ContentDefinition {
 id:string;
 kind:ContentKind;
 name:string;
 aliases:string[];
 source:SourceLocation[];
 evidence:'verified'|'inferred';
 evidenceScope?:{verified:string[];notClaimed:string[]};
 availability:'registered';
 data:{[key:string]:SourceValue};
}
export interface RegistryData {
 schemaVersion:1;sourceSha256:string;definitions:ContentDefinition[];
 startGrants:{contentId:string;source:SourceLocation;instance:{[key:string]:SourceValue}}[];
}
