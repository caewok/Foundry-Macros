// https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/Callback Macros/Cub_Condition.js

// Add this Callback macro to your GM's hotbar and use Furnace mod to check "Execute as GM".
// You should only pass the target id to this macro
(async ()=>{
let target = canvas.tokens.get(args[0]);
let condition = args[1];
let state = args[2];
if (state === "remove"){
    await game.cub.removeCondition(condition, target, {warn: false});
}
if (state === "add"){
    await game.cub.addCondition(condition, target, {warn: false});
}
})();

//### How to Execute the above, do not include this in the pasting into Foundry..####
//include this line in the headever of whichever macro.
// => let Cub_Condition = game.macros.getName("Cub_Condition");
// then use this line to execute it deep in your macro.
// => Cub_Condition.execute(target, "Condition", "add|remove");
// If bulk adding or removal is needed use the following example
// => let element = ["condition 1","condition 2","condition 3"];
// => Cub_Condition.execute(target, element, "add|remove");