export const ROLE_EXPERIENCE_RULES = {
 source: {file:'__Packages/RoleMC.as',awardLine:2122,progressLine:2159},
 evidence:'verified',
 award: {rounding:'round((1 + moreExp * 0.01) * val)',invalid:'NaN returns false before all effects',aliveOnly:['role experience','overflow balls','owned-map resources'],petSlots:[1,2,3],petAward:'all three receive rounded experience even if role is dead',returnValue:false},
 overflow: {threshold:5000,item:'经验球',condition:'alive and levels >= xxx_maxLevels before expUp',factoryFailure:'ignored; overflow already deducted'},
 ownedMapResourceMultiplier:20,
 thresholds:[{below:15,multiplier:10},{below:30,multiplier:20},{below:60,multiplier:60},{below:90,multiplier:100},{below:100,multiplier:150},{below:110,fixed:20000},{below:120,fixed:25000},{below:130,fixed:30000},{below:140,fixed:35000},{below:150,fixed:50000}],
 godMultiplier:5,
 progression:'add experience; repeatedly subtract current maxExp, increment levels, then recompute threshold; no direct cap check in expUp',
 at150:'no matching threshold branch; previous maxExp retained',
 upgraded:'refresh attributes; sound and aura; fill life/mp; notify friend levelsUp once after loop',
 noUpgrade:'life += 0; changeDepth',
} as const;
