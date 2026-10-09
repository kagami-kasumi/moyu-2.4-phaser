export const PET_ATTRIBUTE_RULES={
 source:'__Packages/HuanShouClass.as',evidence:'verified',
 elementBonuses:[[0,0,0,0],[0,75,0,0],[0,0,75,0],[100,0,0,0],[0,0,0,100],[50,50,50,50]],
 bonusOrder:['moreLife','moreMinAttack','moreMaxAttack','moreDefense'],
 bell:{condition:'battle && bell.type != undefined && bell.type != 空格',slots:3,stop:'grade - slotIndex < -1',types:{1:['moreDefense'],2:['moreMinAttack','moreMaxAttack'],3:['moreLife']}},
 formula:'round(rate * (levels + 5) * (1 + bonus * 0.01))',
 refresh:'clear all four bonuses before element and bell additions; then write maxLife/minAttack/maxAttack/defense',
 accessors:{life:'ignore NaN; encode, then clamp above maxLife, otherwise below zero; maximum changes alone do not clamp current life',otherFields:['maxLife','burst','jook','wind','soil','fire','water','reduceDamage','minAttack','maxAttack','defense'],other:'ignore NaN; otherwise encode without local rounding or bounds'},
} as const;
