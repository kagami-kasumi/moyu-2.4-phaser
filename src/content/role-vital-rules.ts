/** Original vital-value formulas and access order, not a new gameplay implementation. */
export const ROLE_VITAL_RULES={
  maxLife:'round((rateLife * (levels + 5) + skillLife + equipment.maxLife) * (1 + (moreExpLife + equipment.moreLife) * 0.01))',
  maxMp:'round((rateMp * (levels + 5) + skillMp + equipment.maxMp) * (1 + (moreExpMp + equipment.moreMp) * 0.01))',
  equipmentAbsent:'omit both equipment terms',
  currentWrite:'ignore NaN; encode proposed value; if current > maximum encode maximum, else if current < 0 encode 0; then changeHpMp()',
  maximumWrite:'ignore NaN; write maximum and recompute corresponding source capacity; does not clamp current value',
  sourceCapacity:'maximum * SourseLevels; recomputed by either maximum or SourseLevels setter',
  sourceCurrentWrite:'ignore NaN; no range clamp',
  initial:{sourceLevels:1,sourceCurrentFreshRead:0,lifeAndMp:'isAlive=true fills to current maxima after equipment refresh'},
  restoreOrder:['lifeSourseLevels','maxLifeSourse','lifeSourse','mpSourseLevels','maxMpSourse','mpSourse','xxx_maxLife','life','xxx_ms','xxx_res','maxMp','mp'],
  restoreEffect:'later maxLife/maxMp setters overwrite earlier stored source capacities with products; stored source current values are not clamped',
  source:{file:'__Packages/RoleMC.as',functions:['life','xxx_maxLife','mp','maxMp','lifeSourseLevels','mpSourseLevels','isAlive','flashAttribute']},
} as const;
