/** Writes made by map.initMonster, before MonsterMC accessor/display side effects. */
export const ENEMY_INITIALIZATION_RULES={
 source:{file:'DefineSprite_4536/frame_1/DoAction.as',line:491},
 slots:'beginNum through endNum inclusive, while slot < 7; no lower-bound guard',
 coordinateIndex:'starts at 1 for each call, independently of beginNum',
 formulas:{minAttack:'attack * (levels + baseLevels) * 0.8',maxAttack:'attack * (levels + baseLevels) * 1.2',defense:'defense * (levels + baseLevels)',maxLife:'life * (levels + baseLevels)',attackFire:'floor(attackFire + levels * 2)'},
 life:'set to maxLife after maxLife write',
 random:{attackLength:{count:20,offset:-10},attackHeight:{count:10,offset:-5},faceTo:{count:2,value0:'右',value1:'左'}},
 color:{atLeastFiveLower:65280,atLeastFiveHigher:16724787,otherwise:16777215},
 reset:{motion:'站立',skillEffect:'无',myTarget:'undefined',isAlive:true},
 success:'returns true even when the slot loop is empty',
 scope:'call-site inputs and write formulas; MonsterMC setters and runtime spawn eligibility are separate contracts',
} as const;
