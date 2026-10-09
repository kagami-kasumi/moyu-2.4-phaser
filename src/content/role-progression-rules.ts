/** Verified RoleMC progression accessors. Source spellings are intentional. */
export const ROLE_PROGRESSION_RULES = {
  maximumLevel:150,
  levelWrite:'reject NaN and values above current maxLevels; no lower clamp',
  maxLevelWrite:'ignore NaN; cap above 150; no lower clamp or automatic current-level change',
  credit:{maximum:500,titleStep:50,titleUpdate:'raise to floor(credit / 50) only when larger; decreasing credit does not lower title',lowerClamp:false},
  nobility:[{name:'无  ',fire:0},{name:'勋爵',fire:3},{name:'子爵',fire:6},{name:'伯爵',fire:9},{name:'侯爵',fire:12},{name:'公爵',fire:15}],
  jobs:[{name:'无  ',fire:0},{name:'卡萨诺城守将',fire:50},{name:'树心城守将',fire:70},{name:'戈壁守将',fire:90},{name:'沼泽守将',fire:110},{name:'南城守将',fire:130},{name:'边关守将',fire:150},{name:'冰宫守将',fire:200}],
  militaryRanks:['无  ','少尉','中尉','上尉','少校','中校','上校','少将','中将','上将','大将'],
  militaryFire:'rank 0 or unmatched value resets fire to 0; ranks 1..10 leave previous fire unchanged',
  unknownRank:'store numeric value while applying default name/fire branch',
  readOnlyAliases:['militaryRank','chaw','maxLevels'],
  restoreOrder:['xxx_maxLevels','levels','xxx_militaryRank','xxx_chaw','militaryExploit','exploit','job','xxx_credit','militaryRankFire','chawFire','jobFire','titleLevel'],
  restoreImplication:'stored fire bonuses and title overwrite earlier setter-derived values; preserve this distinction from modern recalculation design',
  sources:[{file:'__Packages/RoleMC.as',line:300},{file:'__Packages/RoleMC.as',line:358},{file:'__Packages/RoleMC.as',line:405},{file:'__Packages/RoleMC.as',line:509},{file:'__Packages/RoleMC.as',line:670},{file:'frame_9/DoAction_2.as',line:1746}],
} as const;
