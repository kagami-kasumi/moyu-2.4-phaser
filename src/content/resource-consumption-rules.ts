/** Original method-level semantics. Property setter caps are separate contracts. */
export const RESOURCE_CONSUMPTION_RULES={
 source:'__Packages/RoleMC.as',evidence:'verified',
 methods:[{name:'spendMs',field:'xxx_ms',invalidReturn:'undefined'},{name:'spendRes',field:'xxx_res',invalidReturn:'undefined'},{name:'consumeMp',field:'mp',invalidReturn:'false'}],
 condition:'balance >= val',success:'subtract val and return true',insufficient:'return false without subtraction',
 invalid:'isNaN(val)',negative:'not rejected; subtraction increases balance before setter caps',zero:'accepted when balance >= 0',
 credit:{default:'val == undefined -> 1',valid:'!isNaN(val)',effect:'xxx_credit += val; log message',returnValue:'undefined'},
} as const;
