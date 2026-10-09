import {registryData} from './registry-data.ts';
import {itemContentId} from './registry.ts';
/** Ordered wudi grants: quantities and repeated entries are source state, not factory defaults. */
export const ORIGINAL_START_GRANTS=registryData.startGrants.map(grant=>{
 const item=grant.instance;
 if(typeof item.type!=='string'||Object.values(item).some(v=>typeof v!=='string'&&typeof v!=='number'))throw Error('Nonliteral starting grant');
 const instance={...item} as {type:string;name?:string;number?:number};
 if(itemContentId(instance)!==grant.contentId)throw Error('Starting grant identity mismatch');
 return instance;
});
