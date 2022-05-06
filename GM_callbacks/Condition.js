/* GM Callback to set/unset conditions on a token

Use with "Run as GM" checked. Call from player macro to set conditions on targeted tokens.
Example:
let ConditionMacro = game.macros.getName("Condition");
let target = canvas.tokens.controlled[0];
await ConditionMacro.execute(target.id, "sleep", "add");
await ConditionMacro.execute(target.id, "sleep", "disable");
await ConditionMacro.execute(target.id, "sleep", "enable");
await ConditionMacro.execute(target.id, "sleep", "remove");

or:
let target = Array.from(game.user.targets)[0];
*/

// Tested in Foundry v9, dnd5e
console.log("Condition Macro", args);

const token_id = args[0];     // Id string for Token5e
const condition_id = args[1]; // From CONFIG.statusEffects
const action = args[2]; // Options: add, enable, disable, remove

const effect = CONFIG.statusEffects.find(se => se.id === condition_id);
const tActor = canvas.tokens.get(token_id)?.actor;

if(!tActor) {
  ui.notifications.warn(`Condition Macro|No token with id ${token_id} found.`);
  return;
}

const label = game.i18n.localize(effect.label);
let effect_id = tActor.effects.find(e=> e.data.label === label)?.id;
if(!effect_id) {
  if(action === "remove") { return; }

  const ae_data = {
    label,
    icon: effect.icon,
    disabled: false,
    flags: { core: { statusId: effect.id }}
  }

  console.log(`Added effect ${condition_id} to ${tActor.name}`);
  const new_effect = await tActor.createEmbeddedDocuments("ActiveEffect", [ae_data]);

  if(action === "add" || action === "enable") return new_effect;
  effect_id = new_effect.id;
}

switch(action) {
  case "add":
    return; // added above when effect_id checked.

  case "enable":
    console.log(`Enabled effect ${condition_id} on ${tActor.name}`)
    return await tActor.updateEmbeddedDocuments("ActiveEffect", [{ _id: effect_id, disabled: false }]);

  case "disable":
    console.log(`Disabled effect ${condition_id} on ${tActor.name}`)
    return await tActor.updateEmbeddedDocuments("ActiveEffect", [{ _id: effect_id, disabled: true }]);

  case "remove":
    console.log(`Removed effect ${condition_id} from ${tActor.name}`)
    return await tActor.deleteEmbeddedDocuments("ActiveEffect", [effect_id]);
}


