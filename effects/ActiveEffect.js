/*
 * Usage
 * let ActiveEffect = game.macros.getName("ActiveEffect");
 * ActiveEffect.execute(target, "Name of Item" or data if add, "add", "enable", "disable" or "remove");
 */

//args[0] = token ID
//args[1] = Name of Item in "" or update data
//args[2] = "add", "enable", "disable" or "remove"

/*
 * Example add
let ActiveEffect = game.macros.getName("ActiveEffect");
let target = Array.from(game.user.targets)[0];
let conditionData = {
   label : "Sleep",
   icon : "icons/svg/sleep.svg"
    }
ActiveEffect.execute(target.id, conditionData, "add");

// https://gitlab.com/crymic/foundry-vtt-macros/-/tree/master/Callback%20Macros
/* Example #2 add
let effectData = {
    "_id": "macro_shield",
    "label": "Shield (macro)",
    "duration": {
                  "seconds": 6,
                },
    "changes": [
                 {
                   "key": "data.attributes.ac.value",
                   "value": 5,
                   "mode": 2, 
                   "priority": 20,
                 },
               ],
    "icon": "icons/svg/shield.svg",
    "tint": "#838bc9",
    "source": "Shield macro",
    "disabled": false,
  };
  
  let ActiveEffect = game.macros.getName("ActiveEffect");
let target = Array.from(game.user.targets)[0];
ActiveEffect.execute(target.id, effectData, "add");

 */
(async ()=>{
let target = canvas.tokens.get(args[0]).actor;
if (args[2] === "remove"){
console.log("remove active effect");
let effect_id = target.effects.entries.find(ef=> ef.data.label === args[1]).id;
await target.deleteEmbeddedEntity("ActiveEffect", effect_id);
}
if (args[2] === "disable") {
console.log("disable active effect");
let effect_id = target.effects.entries.find(ef=> ef.data.label === args[1]).id;    
await target.updateEmbeddedEntity("ActiveEffect", {"_id": effect_id,  "disabled" : true});
}
if (args[2] === "enable") {
console.log("enable active effect");
let effect_id = target.effects.entries.find(ef=> ef.data.label === args[1]).id;
await target.updateEmbeddedEntity("ActiveEffect", {"_id": effect_id,  "disabled" : false});
}
if (args[2] === "add") {
console.log("add active effect");
let effect_data = args[1];
await target.createEmbeddedEntity("ActiveEffect", effect_data);
}    
})();

