// Create, update, or delete item on actor
// Based on https://github.com/Kekilla0/Personal-Macros/blob/master/Furnace/Create_Actor_Items_Macro.js
// And loosely structured like ActiveEffect.js from https://gitlab.com/crymic/foundry-vtt-macros/-/tree/master/Callback%20Macros
// Added several checks and logging to 

/*
 * Usage
 * let ActorItemMacro = game.macros.getName("ActorItem");
 * ActorItemMacro.execute(token_id, "Name of Item", "create", "modify",  or "delete", data if any);
 */


//console.log("ActorItem Macro|args", args);

const token_id = args[0];
const item_name = args[1];
const action_to_take = args[2];

let target = canvas.tokens.get(token_id).actor;

if(!target) {
  ui.notifications.error(`${this.name}'s target not found.`);
  console.error(`${this.name}|${token_id} target not found.`);
  return;
}

if(action_to_take === "delete") {
  console.log(`ActorItem Macro|Deleting ${item_name} from ${target.data.name}`);
  const item_to_remove = target.items.find(i => i.name === item_name);
  
  if(!item_to_remove || item_to_remove.length === 0) {
    // not strictly an error, as it is just already not there; we can ignore.
    console.log(`${this.name}|Item ${item_name} not found on ${target.data.name}`);
    return;
  }
  await item_to_remove.delete();  
}

if(action_to_take === "modify") {
  console.log(`ActorItem Macro|Modifying ${item_name} on ${target.data.name}`, args[3]);
  if(!args[3]) {
    console.log(`${this.name}|No data to modify.`);
    return;
  }
  
  // get the existing object id, merge into the data to be changed
  const item_id = target.items.find(i => i.name === item_name).id;
  if(!item_id) {
    ui.notifications.error(`${this.name}|Item ${item_name} not found on ${target.data.name}`)
    console.error(`${this.name}|Item ${item_name} not found on ${target.data.name}`);
    return;
  }
  
  const updated_data = mergeObject(args[3], { _id: item_id }, { insertKeys: true, overwrite: true, inplace: false });
  console.log(`ActorItem Macro|updated_data`, updated_data);
  
  
  //target.updateEmbeddedEntity("OwnedItem", copy_item);
  await target.updateEmbeddedEntity("OwnedItem", updated_data);
}


if(action_to_take === "create") {
  console.log(`ActorItem Macro|Creating ${item_name} on ${target.data.name}`);
  const item_to_add = game.items.getName(item_name);
  if(!item_to_add) {
    ui.notifications.error(`${this.name}'s item not found.`);
    console.error(`${this.name}|Item ${item_name} not found.`);
    return;
  }

  await target.createOwnedItem(item_to_add.data);
}
