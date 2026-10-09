export const ROLE_REBIRTH_RULES={
 source:{file:'__Packages/RoleMC.as',line:2386},evidence:'verified',
 guards:['roleGod != true','levels >= 100','equipment.hasEquipment() != true'],
 resets:{levels:1,expBallNum:0,xxx_nowExp:0,maxExp:9},
 doubled:['rateLife','rateMp','rateMinAttack','rateMaxAttack','rateDefense','baseBurst','baseJook'],
 godFire:300,
 order:['reset progression','double seven base fields','godFire = 300','roleGod = true','huanShou.reset()','expUp(maxExp)','announce','useRecord -= 1500'],
 resultingProgression:{levels:2,xxx_nowExp:0,maxExp:100},
 charge:'unconditional subtraction at end; no balance guard in upGod',
 scope:'method writes and expUp composition; huanShou.reset and derived attribute refresh require separate evidence',
} as const;
