/** Shared scalar stage of RoleMC, MonsterMC and HuanShouMC.byAttack.
 * Caller selects the verified fire inputs, defense policy and optional life cap.
 * This is arithmetic only; it does not enable a combat or animation loop. */
export interface IncomingNumbers {attack:number;defense:number;defenderFire:number;attackerFire:number;burst:number;jook:number;reduceDamage:number;fly:boolean;nonDefense:boolean;dodgeRoll:number;burstRoll:number}
export function incomingDamage(x:IncomingNumbers, lifeCap?:number){
 let attack=x.attack,burst=x.burst,jook=x.jook,reduction=x.reduceDamage,extra=0;
 const difference=x.defenderFire-x.attackerFire;
 if(difference<0){burst=Math.min(95,burst-difference);extra=-difference;}
 else{jook=Math.min(95,jook+difference);reduction=Math.min(95,reduction-difference);}
 if(x.dodgeRoll<jook)return {miss:true,critical:false,lifeDamage:0,returnedAttack:attack,positive:false};
 attack*=(100+extra)/100;const critical=x.burstRoll<burst;if(critical)attack*=2;
 if(!x.nonDefense)attack-=x.defense/(x.fly?2:1);
 attack*=(100-reduction)/100;
 // Source tests <=0, not >0: NaN reaches the positive branch and its setter
 // ignores the write. Preserve that branch for subsequent bell/XP effects.
 const positive=!(attack<=0);
 if(positive){if(lifeCap!==undefined&&attack>lifeCap)attack=lifeCap;attack=Math.round(attack);}
 return {miss:false,critical,lifeDamage:positive?attack:0,returnedAttack:attack,positive};
}
