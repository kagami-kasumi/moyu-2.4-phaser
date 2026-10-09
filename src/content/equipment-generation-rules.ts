/** Shared equipment factory numeric rules. Enemy eligibility/call rates belong to
 * DATA-018; every random call is independently sampled in source order. */
export type SourceRandom=(exclusiveMaximum:number)=>number;
export function generateEquipmentNumbers(family:'normal'|'boss'|'superBoss'|'reiBoss'|'reiSuperBoss',level:number,vocational:string,random:SourceRandom){
 const rei=family==='reiBoss'||family==='reiSuperBoss';
 const levels=rei?(random(2)!==1?1:15):level>90?90:level<15?1:Math.floor(level/15)*15;
 let additional=0;
 if(!rei&&levels>=30&&random(1000)<(family==='normal'?100:200))additional=random(4)+1;
 const type=['武器','鞋','衣服','头盔'][random(4)];
 if(rei){
  const element=family==='reiSuperBoss'?(random(10000)>=2000?1+random(4):5):(random(10000)>=100?(random(10000)>=2000+level*5?0:1+random(4)):5);
  return {type,grade:random(1000)>=700?1:0,mhdj:0,vocational,levels,element};
 }
 if(family==='normal')return {type,grade:random(1000)>=700?1:0,mhdj:0,vocational,levels,additional,holes:random(1000)>=50?0:1};
 let grade=family==='boss'?1:2;
 if(random(5000)<1500+level*20)grade=family==='boss'?2:3;
 if(random(5000)<500+level*20)grade=family==='boss'?3:4;
 const holes=random(1000)>=1?(random(1000)>=699?(random(300)>=250?2:1):0):3;
 const element=level>=50?(random(10000)>=10?(random(10000)>=500+level*5?0:1+random(4)):5):0;
 return {type,grade,mhdj:random(6)+(family==='superBoss'?6:0),vocational,levels,additional,holes,element};
}
