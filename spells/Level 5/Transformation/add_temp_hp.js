// For Tenser's Transformation
// Add 50 temporary HP to target
// Used with midi-qol On Use Macro field for spell

const ADDED_TEMP_HP = 50;

let actor_id = "";
if(typeof args !== 'undefined' || args[0].targets.length < 1) {
  const targets = Array.from(game.user.targets);
  console.log(targets);
  
  if(targets.length < 1) {
    ui.notifications.error("Target must be selected to add temporary HP.");
    return;
  }
  actor_id = targets[0].actor.data._id;
  
} else {
  actor_id = args[0].targets[0].actor_id;
}
console.log("actor_id", actor_id);

const actor_targeted = game.actors.get(actor_id);
const new_tempmax = (parseInt(actor_targeted.data.data.attributes.hp.tempmax) || 0) + ADDED_TEMP_HP;

await actor_targeted.update({ "data.attributes.hp.tempmax": new_tempmax } );
