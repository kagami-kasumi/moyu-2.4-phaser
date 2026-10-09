export const NUMERIC_CODEC_RULES={
 source:'__Packages/SecreteCode.as',evidence:'verified',
 movieClipVariant:{source:'__Packages/SecreteCodeMC.as',consumers:['RoleMC','ThingMC'],base:'SecreteCodeMC.BASE; separate from SecreteCode.BASE',arithmetic:'same encode/decode formulas'},
 instanceMultiplier:{minimum:-5,maximum:-2,expression:'-2 - random(4)'},
 sharedBase:{minimum:123456,maximum:623455,expression:'123456 + random(500000)'},
 encode:'val * SECRETECODE + BASE',decode:'isNaN(val) ? 0 : (val - BASE) / SECRETECODE',
 caveat:'floating-point subtraction may introduce small round-trip errors; encoded zero decodes to negative zero, while undefined storage decodes to positive zero',
 scope:'source arithmetic; random state lifecycle and serialization handled separately',
} as const;
