/** Source formulas and state ownership. Registration does not expose castle gameplay. */
export const BUILDING_RULES = {
  id: 'numeric:castle-buildings',
  source: {file:'DefineSprite_2313_主城堡/frame_1/DoAction.as',sha256:'e0e7677dae88cb7462cf46170bcbf12c7dd02d0b64332fee69ec435bf692ee25'},
  constructorSource: {file:'__Packages/BuildingClass.as',sha256:'84718e8d6406dc5474222e115364b6eb7e9b0a3eb97528b4a461f6426100c803'},
  table: 'building registry, original array order',
  initial: {housingLevel:3, housingPrizeLevel:3, otherLevels:0, otherPrizeLevels:0},
  constructor: {nameFallback:'',numericFallback:0,invalidNumericWrite:'preserve previous decoded value',numericFields:['levels','maxLevels','upPrice','needMainLevels','prizeLv']},
  mainCastle: {
    index:1,
    housingRequired:'(currentLevel + 1) * 3',
    creditRequired:'currentLevel * 5 + 50',
    creditConsumed:0,resourceConsumed:0,
    success:['levels += 1','prizeLv += 1','flashInfo()'],
  },
  otherBuildings: {
    guard:'needMainLevels <= mainCastle.levels',
    resourceCost:'upPrice; constant per registered building',
    spendCall:'map.role.spendRes(upPrice); abort only when result == false',
    extraWrite:'parent.role.res -= upPrice; separate reference from parent.map.role',
    extraWriteStatus:'P-code confirms missing map segment; root frame 9 has no role instance while map has role sprite 3106; inferred dangling reference, effective AVM1 write outcome unverified',
    success:['levels += 1','prizeLv += 1','needMainLevels++','flashInfo()','showBuildings()'],
  },
  levelLimit:{ui:'hide upgrade button when levels >= maxLevels',upgradeFunction:'no maxLevels guard'},
  visibility:'building level > 0',
  persistence:{fields:['levels','prizeLv'],notStored:['needMainLevels','upPrice','maxLevels','name'],restore:'assign both stored fields through numeric setters in current building order',missing:'NaN/undefined numeric writes ignored',initData:'reset levels/prizeLv only; does not reset needMainLevels'},
} as const;
