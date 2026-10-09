import type {Matrix} from './manifest.ts';
import {contentNamed} from './registry.ts';
export interface Placement {depth:number;characterId:number;name?:string;matrix:Matrix;color?:{mult:number[];add:number[]}}
export interface Shape {id:number;bounds:[number,number,number,number];edges:[string,number,number][];lines:{width:number}[];file:string}
export interface SliceManifest {sourceSha256:string;rootMatrix:Matrix;shapes:Record<number,Shape>;maps:Record<'outskirts'|'city',{frame:number;name:string;layers:Placement[]}>;portal:Placement[];npc:Placement[];portalFrames:number[]}
export function validateSlice(data:unknown):SliceManifest {
 const m=data as SliceManifest;if(m?.sourceSha256!=='f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9')throw Error('地图来源不匹配');
 if(m.rootMatrix?.length!==6||!m.rootMatrix.every(Number.isFinite)||m.rootMatrix[0]<=0||m.rootMatrix[3]<=0)throw Error('地图矩阵无效');
 for(const id of [2804,2806,4323,4326,4238,4240,4242,4257,4259,4269,4281,4295,4305,4307]){const s=m.shapes?.[id];if(!s||s.file!==`${id}.png`||s.bounds.length!==4||!s.bounds.every(Number.isFinite)||s.edges.length<4||!s.edges.every(e=>['M','L'].includes(e[0])&&Number.isFinite(e[1])&&Number.isFinite(e[2])))throw Error('地图形状无效');}
 for(const key of ['outskirts','city'] as const){const map=m.maps?.[key];if(!map||!map.layers.some(p=>p.name==='ground')||!map.layers.some(p=>p.name==='entry2'))throw Error('地图入口缺失');const definition=contentNamed('map',map.name);if(definition.length!==1||definition[0].data.frame!==map.frame)throw Error('地图注册与资源不一致');}
 if(m.portalFrames.length!==13)throw Error('传送动画无效');return m;
}
