// Create 3 rays of fire, hurl them at targets w/in range.
// One target or several
// 2d6 fire damage each target if ranged spell attack succeeds. Per ray.
// 1 additional ray each level above 2.

// Loosely based on https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/5e/Spells/Level%201/Magic%20Missile.js

// Scorching Ray spell item should be set to Utility
// Why not set to ranged spell attack and have midi-qol roll the attacks in the first instance?
// -- because scorching ray requires one attack rolls per ray, which means a single target could be subject to multiple attacks.
// -- This macro is overkill: Simpler way would be to just roll the spell manually, once per ray. Only use the spell slot on the first roll.

const WAIT_MS = 3000;

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Test for blank or empty string
 * https://stackoverflow.com/questions/154059/how-can-i-check-for-an-empty-undefined-null-string-in-javascript
 * @str String or object
 * @return True if object is blank ("") or empty.
 */  
function isEmpty(str) {
    const is_empty = (!str || /^\s*$/.test(str));
    //console.log("isEmpty? " + is_empty);
    return is_empty;
  }



if(args.length < 1) {
  ui.notifications.error("Scorching Ray Macro|Arguments not found.");
  return;
}
console.log("Scorching Ray Macro|args", args);

const actor_id = args[0].actor._id;
const token_id = args[0].tokenId;
const target_ids = args[0].targets.map(t => { return { id: t._id, name: t.name }; });
const scorching_ray_item = args[0].item;
const spell_level = Number(args[0].spellLevel);
const num_missiles = 1 + spell_level;

console.log("Scorching Ray Macro|spell_level", spell_level);
console.log("Scorching Ray Macro|num_missiles", num_missiles);


const actorD = game.actors.get(actor_id);
const tokenD = canvas.tokens.get(token_id);
const spell_original = actorD.getOwnedItem(scorching_ray_item._id);

console.log("Scorching Ray Macro|actorD", actorD);
console.log("Scorching Ray Macro|tokenD", tokenD);

// Check distance. Omit targets outside spell range (120' default)
const max_range = Number(spell_original.data.data.range.value) || 120; 
const pixel_range = max_range * canvas.scene.data.grid / canvas.scene.data.gridDistance; 

console.log("Scorching Ray Macro|target_ids", target_ids);
let in_range_targets = [];
for(let t of target_ids) {
  const get_target = canvas.tokens.get(t.id);
  console.log("Scorching Ray Macro|get_target", get_target);
  const ray = new Ray(tokenD.center, get_target.center);
  console.log("Scorching Ray Macro|ray", ray);
  
  if(ray.distance <= pixel_range) {
    in_range_targets.push(t);
  } else {
    ui.notifications.warn(`Scorching Ray Macro|Target ${t.name} was omitted because the target is outside the range ${max_range}.`);
  }
}



// Modify the scorching ray item to use damage based on spell level
const spell_modifications = {
  "data.preparation.mode" : "atwill",
  "data.level" : spell_level,
  "data.damage.parts" : [ ["2d6", "fire"] ],
  "data.actionType" : "rsak",
  "flags.midi-qol.onUseMacroName" : "",
  "flags.autoanimations" : {
    animName: "",
    animTint: "#ffffff",
    animType: "t1",
    auraOpacity: 0.75,
    color: "a1",
    ctaOption: false,
    dtvar: "dt1",
    explodeColor: "ec1",
    explodeLoop: "1",
    explodeRadius: "0",
    explodeVariant: "ev1",
    explosion: false,
    hmAnim: "a1",
    killAnim: false,
    override: false,
    selfRadius: "5",
    uaStrikeType: "physical"
    }
}

const upcastData = mergeObject(spell_original.data, spell_modifications, { inplace: false });
console.log("Scorching Ray Macro|Upcast data: ", upcastData);                 
  // randomID()              

	// two versions: either just use createOwned or first create a temporary item (which changes the id) and then use createOwned
	// dnd5e uses createOwned when upcasting a spell
	// this casts the spell but the resulting chat message damage uses the original unmodified spell (test by clicking place template; it will revert back to 15-feet)
const updated_spell_to_cast = spell_original.constructor.createOwned(upcastData, 
																		actorD);
console.log("Scorching Ray Macro|updated_spell_to_cast", updated_spell_to_cast);               							

// Get targets using dialog. 
if(in_range_targets.length === 1) {
  console.log("Scorching Ray Macro|Single target.");
  
  for(let i = 0; i < num_missiles; i++) {
    const get_target = canvas.tokens.get(in_range_targets[0].id);
    get_target.setTarget(true, { releaseOthers : true });
    
    // showFullCard: true will display the card but not the results
    const roll_result = await updated_spell_to_cast.roll({configureDialog: false})
    console.log("Scorching Ray Macro|roll_result", roll_result);
    await wait(WAIT_MS);
  }
  
} else if(in_range_targets.length > 1) {
  console.log("Scorching Ray Macro|Multiple targets.");
  
  let targetList = "";
	for (let t of in_range_targets) {
		 targetList += `<tr><td>${t.name}</td><td><input type="number" id="target" min="0" max="${num_missiles}" name="${t.id}"></td></tr>`;
	}
	
	const the_content = `<p>You have currently <b>${num_missiles}</b> total rays.</p><form class="flexcol"><table width="100%"><tbody><tr><th>Target</th><th>Number Rays</th></tr>${targetList}</tbody></table></form>`;
	new Dialog({
			title: "Scorching Ray Damage",
			content: the_content,
			buttons: {
				one: { label: "Damage", callback: async (html) => {
					let spentTotal = 0;
					let selected_targets = html.find('input#target');
					console.log("Scorching Ray Macro|selected_targets", selected_targets);
					for(let get_total of selected_targets){
						spentTotal += Number(get_total.value);
					}
					if (spentTotal > num_missiles) return ui.notifications.error(`The spell fails, You assigned more rays then you have.`);
				
					// For each target/ray, roll the (revised) scorching ray item
					for(let selected_target of selected_targets) {
						let damageNum = selected_target.value;
						console.log(`Scorching Ray Macro|${damageNum} rays for ${selected_target.name}`);
					
						if (!isEmpty(damageNum)) {
							damageNum = parseInt(damageNum);
					
							const get_target = canvas.tokens.get(selected_target.name);
							for(let i = 0; i < damageNum; i++) {
								get_target.setTarget(true, { releaseOthers : true });		
								const roll_result = await updated_spell_to_cast.roll({configureDialog: false})
								console.log("Scorching Ray Macro|roll_result", roll_result);
								await wait(WAIT_MS);
							}					  
						}
					}
				}
			}
		}
  }).render(true);
  
} else {
  console.log("Scorching Ray Macro|No targets.");
  ui.notifications.error("Scorching Ray Macro|No targets selected.");
}

  


  
