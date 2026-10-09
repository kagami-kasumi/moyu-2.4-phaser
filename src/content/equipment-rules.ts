/** Static source contract: frame_9/DoAction.as upDataWeapon, lines 5360–5489.
 * Table indices are source grade/element/hole codes, not modern balance choices.
 */
export const EQUIPMENT_RULES = {
 source:{file:'frame_9/DoAction.as',function:'this.upDataWeapon'},
 base:{perLevel:1.5,offset:5},
 professions:{
  战士:{weapon:[3,.3],shoes:[1,.1],clothe:[.4,.05],helmet:[.2,.02],minimumAttackShare:.1},
  法师:{weapon:[3.6,.36],shoes:[1.2,.12],clothe:[.3,.03],helmet:[.1,.02],minimumAttackShare:.4},
 },
 magicDivisor:20,
 elementPower:[8,16,32,64,128,256,512],
 allElementCode:5,allElementDivisor:2,
 elementFields:[['wind',1],['fire',2],['water',3],['soil',4]],
 price:{grade:[0,80,240,560,1360],singleElement:500,allElements:2000,holes:[0,400,2400,10400],perLevel:4,perMagic:10},
 names:{levelStep:15,maximumNameLevel:120,family:{武器:'weaponName',鞋:'shoesName',衣服:'clotheName',头盔:'helmetName'}},
} as const;
