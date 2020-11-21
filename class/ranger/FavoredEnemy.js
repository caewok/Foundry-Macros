// Revised Ranger Favored Enemy
/*
Choose a type of favored enemy: beasts, fey, humanoids, monstrosities,
or undead. You gain a +2 bonus to damage rolls with weapon attacks
against creatures of the chosen type. Additionally, you have advantage
on Wisdom (Survival) checks to track your favored enemies, as well as on
Intelligence checks to recall information about them.
*/

const FAVORED_ENEMY = "humanoid";

const FLAG_SCOPE = "world";
const FLAG_KEY = "FavoredEnemyIsActive";

// getting all actors of selected tokens
let actors = canvas.tokens.controlled.map(({ actor }) => actor);

// if there are no selected tokens, roll for the player's character.
if (actors.length < 1) {
  actors = game.users.entities.map(entity => {
    if (entity.active && entity.character !== null) {
      return entity.character;
    }
  });
}
const validActors = actors.filter(actor => actor != null);
//console.log(validActors.length + " actors found.");

if(validActors.length > 1) {
  ui.notifications.error("Please select only one token.");
} else {
  let actor = validActors[0];
  console.log(actor);
  
  if(!actor.data.flags.hasOwnProperty("")) {
    console.log("Setting flag " + FLAG_KEY);
    actor.setFlag(FLAG_SCOPE, FLAG_KEY, false);
  }

  const active = actor.getFlag(FLAG_SCOPE, FLAG_KEY);
  console.log(FLAG_KEY + " is " + active);
  
  if(active) {
    // remove
  
  } else {
    // add bonuses
    
    
  }

  //actor.setFlag(FLAG_SCOPE, FLAG_KEY, !current_status)
  
  
  ui.notifications.info("Favored Enemy " + "?");

}