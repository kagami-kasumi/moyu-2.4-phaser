export const PET_EXPERIENCE_RULES={
 source:{file:'__Packages/HuanShouMC.as',line:433},evidence:'verified',
 guards:'battle truthy; life != 0; pet.levels < role.levels + 10',
 levelLead:10,rounding:'Math.round(val)',
 thresholds:[{below:30,multiplier:9},{below:60,multiplier:15},{below:90,multiplier:30},{below:100,multiplier:72},{below:110,fixed:30000},{below:120,fixed:40000},{below:130,fixed:50000},{below:140,fixed:60000},{below:150,fixed:70000},{below:Infinity,fixed:80000}],
 capDuringLoop:'set nowExp = maxExp - 1 when already at role.levels + 10; recompute threshold',
 insight:'after loop and only if upgraded: levels >= 30 && oldLevels > levels restores oldLevels/oldNowExp/oldMaxExp without rechecking role level cap',
 upgraded:'refresh attributes; fill life; sound; aura; refresh pet view',
 accepted:'refresh pet HP/MP after processing; no explicit return value',
} as const;
