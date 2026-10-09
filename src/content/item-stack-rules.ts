export const ITEM_STACK_RULES={
 source:'__Packages/ThingMC.as',evidence:'verified',
 maxQuantity:99,
 write:'NaN becomes 0; num is empty when val < 2 otherwise val; maxNum becomes MAXNUM; encode val without clamping',
 room:'number > 0 ? maxNum - number : 0',
 add:'compute room; NaN input or room returns 0; if val <= room add val and return 0; otherwise fill to maxNum and return val-room',
 scope:'quantity accessors, display field writes and addNumber; codec and container policies separate',
} as const;
