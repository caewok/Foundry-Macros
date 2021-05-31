/*
Temporarily gain disadvantage on all attacks against the target until end of your next turn.

To use:
- Create a feature that has a DAE that uses macro.execute to call this macro
- The DAE should set the duration (here, turn-based).
- The feature should assign to the actor on equip. 
- Drag the feature to the actor to start.
- When the DAE on the actor is removed, the feature will also be removed.
*/

const MACRO_ID = "macro_disadvantage_against_target";
const ADD_EFFECT_MACRO = game.macros.entities.find(m => m.name === "AddEffectToSingleTarget");

const effectData = {
    "_id": MACRO_ID,
    "label": "Grant disadvantage",
    "changes": [         
                 {
                   "key": "flags.midi-qol.grants.disadvantage.attack.all",
                   "value": 1,
                   "mode": 0, 
                   "priority": 20,
                 },                 
               ],
    "icon": "icons/svg/aura.svg",
    "tint": "#838bc9",
    "source": MACRO_ID,
    "disabled": false,
  };
  
await ADD_EFFECT_MACRO.execute(args[0], args[args.length - 1], effectData);

