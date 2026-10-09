/** Reviewed original XP energy state. Registration only; does not enable gameplay. */
export const XP_ENERGY_RULES = {
  id: 'numeric:xp-energy',
  evidence: 'verified',
  source: {
    file: 'DefineSprite_4603/frame_1/DoAction.as',
    sha256: 'f764fafe3c40cdac339df3691a52cfdba422aae6986567f5b461233a15a0215a',
  },
  initial: { nowPower: 0, maxPower: 3, maxTopPower: 6, nowExp: 0, maxExp: 18, isFull: false, isUsed: false },
  cells: { count: 6, initiallyVisible: false },
  charge: { enabled: 'isUsed && !isFull', increment: 1, threshold: '++nowExp >= maxExp', onThreshold: ['nowExp = 0', 'powerUp()'], overflow: 'discarded' },
  gain: { order: ['++nowPower', 'if nowPower <= maxPower: reveal cell', 'if nowPower == maxPower: isFull = true'], success: 'nowPower <= maxPower', overflow: 'increment persists; returns false; no rollback or clamp' },
  consume: { enabled: 'nowPower > 0', order: ['hide current cell', '--nowPower', 'isFull = false'], amount: 1, chargeProgress: 'unchanged' },
  activation: { skills: ['震', '怒'], when: 'first learning branch with old levels == 0; sets isUsed true' },
  capacityItem: { type: '能量药水', condition: 'maxPower < maxTopPower', increment: 1, onSuccess: 'isFull = false; consume one item', atLimit: 'no state change; item retained' },
  chargingEvent: 'MonsterMC.byAttack non-miss branch after physical damage resolution, including zero damage; not a kill reward',
  persistence: { fields: ['nowPower', 'nowExp', 'isFull', 'isUsed', 'maxPower'], cells: 'six visibility fields stored separately', constantsNotStored: ['maxTopPower', 'maxExp'] },
} as const;
