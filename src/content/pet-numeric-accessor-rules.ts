export const PET_NUMERIC_ACCESSOR_RULES={
 source:'__Packages/HuanShouClass.as',evidence:'verified',
 fields:['nowExp','maxExp','attackLength','attackHeight','zs','maxZs','element','titleNum','rateLife','rateMinAttack','rateMaxAttack','rateDefense','moreLife','moreMinAttack','moreMaxAttack','moreDefense','maxRateLife','maxRateMinAttack','maxRateMaxAttack','maxRateDefense','maxLifeFen','maxMinAttackFen','maxMaxAttackFen','maxDefenseFen','oldLevels','oldNowExp','oldMaxExp'],
 write:'ignore isNaN(val); otherwise pass unchanged to setSecreteCode and store result',
 read:'getSecreteCode(stored value)',
 limits:'no local clamp, rounding, cross-field synchronization or recalculation',
 scope:'accessor control flow; codec behavior and gameplay input reachability separate',
} as const;
