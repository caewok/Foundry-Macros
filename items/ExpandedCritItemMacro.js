// Expanded Crit to be used with ItemMacro
// Place in the Item Macro for the relevant item.
// This sets the crit range, then calls midi-qol to roll the item, then re-sets the crit range.

const CRIT_MIN = 19;
const GM_ACTIVE_EFFECT_MACRO = "ActiveEffect";
const DAE_LABEL = `Sharpened (Expanded Crit ${CRIT_MIN}–20)`;


const LOG_PREFIX = "Item Macro|";
// all these are available:
//console.log(LOG_PREFIX + "Item", item);
//console.log(LOG_PREFIX + "Actor", item.actor);
//console.log(LOG_PREFIX + "Token", token);
//console.log(LOG_PREFIX+ "Actor base", actor);



// Needs an ActiveEffect macro to apply the effect using GM macro
const ActiveEffect = game.macros.getName(GM_ACTIVE_EFFECT_MACRO);

// mode is probably Custom (0), Multiply (1), Add (2), Downgrade (3), Upgrade (4), Override (5)
const sharpenedDAE = {
  "label": DAE_LABEL,
  "flags": {
     dae: {
       transfer: true,
       stackable: false   
     }
  },
  "changes": [
     {
        "key": "flags.dnd5e.weaponCriticalThreshold",
        "value": CRIT_MIN,
        "priority": 20,
        "mode": 3
     },
     
     // preferably set duration set to next attack? 
     
  ],
  "icon": item.data.img,
  "source": `ItemMacro: Sharpened ${item.data.name}`,
  "disabled": false
};

(async()=>{

console.log(`${LOG_PREFIX}Starting`);
// flags.dnd5e.weaponCriticalThreshold 
await ActiveEffect.execute(token.data._id, sharpenedDAE, "add");
console.log(`${LOG_PREFIX}Added effect`);

await item.roll();
console.log(`${LOG_PREFIX}Roll completed.`);

await ActiveEffect.execute(token.data._id, DAE_LABEL, "remove");
console.log(`${LOG_PREFIX}Removed effect.`);

})();