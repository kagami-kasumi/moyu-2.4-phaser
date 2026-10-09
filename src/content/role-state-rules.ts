/** Verified RoleMC.xxx_ms/xxx_res setters; frame_2 wudi seed is clamped by them. */
export const ROLE_CURRENCY_RULES={
 maximum:100_000_000,
 startingWrite:1_000_000_000,
 sources:[
  {file:'__Packages/RoleMC.as',line:198},
  {file:'__Packages/RoleMC.as',line:232},
  {file:'DefineSprite_4536/frame_2/DoAction.as',line:41},
 ],
} as const;

/** Source rejects NaN, has an upper cap and no lower clamp. */
export function roleCurrencyWrite(previous:number,next:number):number {
 return Number.isNaN(next)?previous:Math.min(next,ROLE_CURRENCY_RULES.maximum);
}
