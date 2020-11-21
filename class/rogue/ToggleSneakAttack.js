// Toggle Sneak attack
// Requires Dynamic Active Effects and (optionally) MacroMarker

//DAE.togglePassive("Sneak Attack", "feat");
const effect_name = "Sneak Attack";
const icon = "icons/svg/mystery-man-black.svg"
const FORCE_DISABLE = false;
const USE_MACRO_MARKER = true;


let tokens = canvas.tokens.controlled;
//console.log(tokens[0]);

let self = this;
tokens.forEach( function(token) {
  let effect = token.actor.effects.entries.find(ef=> ef.data.label===effect_name);
  let effect_id = effect.data._id;
  // if the effect is currently disabled, we want to turn it on
  let turn_on = effect.data.disabled;
  
  if(FORCE_DISABLE) {
    turn_on = false;
  }

  token.actor.updateEmbeddedEntity("ActiveEffect", {
                "_id": effect_id,
                "disabled": !turn_on
            });
  token.toggleEffect(icon, { active: turn_on, overlay: false });   
  
  
  if(USE_MACRO_MARKER) {
    // if currently disabled, script will enable the effect
    if(turn_on) { MacroMarker.activate(self, { entity: token }) }
    if(!turn_on) { MacroMarker.activate(self, { entity: token }) }  
  } 
      

});

// Add to marker tab to trigger automatically:
// Does not seem to work??
/*
const effect_name = "Sneak Attack";
const effect = actor.effects.entries.find(ef=> ef.data.label===effect_name);
return !effect.data.disabled;
*/

