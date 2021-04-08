// Chromatic Orb Macro
// Let the user choose between different chromatic orb damage types and then cast the spell. 

// If using JB2A macros, need to create separate macro for each damage animation
const USE_MACRO = false;
const damageFXMacros = {
  acid: "JB2A FireBolt Orange",
  cold: "JB2A FireBolt Blue",
  fire: "JB2A FireBolt DarkRed",
  lightning: "JB2A FireBolt Purple",
  poison: "JB2A FireBolt Green",
  thunder: "JB2A FireBolt Blue"
};

// JB2A automated animations flags, if using
// color will be changed to match the damage type
const USE_AA = true;
let autoanimations = {
  animName: "Fire Bolt",
  animType: "t6",
  color: "Blue",
  dtvar: "",
  explodeColor: "",
  explodeLoop: "1",
  explodeRadius: "",
  explodeVariant: "",
  explosion: false,
  killAnim: false,
  override: true
};

// color choices: Blue, Green, Orange, Purple, Red
const AAOverrideColors = {
   acid: "Orange",
   cold: "Blue",
   fire: "Red",
   lightning: "Purple",
   poison: "Green",
   thunder: "Blue"
}




/**
 * Convert dialog to a promise to allow use with await/async.
 * @content HTML content for the dialog.
 * @return Promise for the html content of the dialog
 * Will return "Cancel" or "Close" if those are selected.
 */
async function dialogPromise(content) {
  return new Promise((resolve, reject) => {
    dialogCallback(content, (html) => resolve(html)); 
  });
}

/**
 * Create new dialog with a callback function that can be used for dialogPromise.
 * @content HTML content for the dialog.
 * @callbackFn Allows conversion of the callback to a promise using dialogPromise.
 * @return rendered dialog.
 */
function dialogCallback(content, callbackFn) {
	let d = new Dialog({
		title: 'Facet Ability Check',
		content: content,
		buttons: {
			one: {
				icon: '<i class="fas fa-check"></i>',
				label: 'Confirm',
				callback: (html) => callbackFn(html)
			},
			two: {
				icon: '<i class="fas fa-times"></i>',
				label: 'Cancel',
				callback: () => callbackFn("Cancel")
			}
			},
		default: "two",
		close: () => callbackFn("Close")
	});
	d.render(true);
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

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
}

let selected_token = RetrieveSelectedTokens()[0];
// console.log(selected_token);
if(isEmpty(selected_token)) {
  ui.notifications.warn("Please select a token.");
  return;
}

const targets = game.user.targets;
// console.log(targets);
if(isEmpty(targets)) {
  ui.notifications.warn("Please select a target.");
  return;
}

let chromatic_orb_spell = selected_token.actor.items.filter(i => "spell" === i.type && ("Chromatic Orb" === i.name))[0];
console.log(chromatic_orb_spell);

if(isEmpty(chromatic_orb_spell)) {
  ui.notifications.warn(`Chromatic orb spell not found for ${selected_token.data.name}.`);
  return;
}
chromatic_orb_spell = selected_token.actor.getOwnedItem(chromatic_orb_spell._id);


const html_dialog = 
`
<p> Select damage type for the Chromatic Orb </p>
  <select id="ChromaticOrbSelection" class="Selection" name="ChromaticOrbSelection">
    <option value="acid">Acid</option>
    <option value="cold">Cold</option>
    <option value="fire" selected>Fire</option>
    <option value="lightning">Lightning</option>
    <option value="poison">Poison</option>
    <option value="thunder">Thunder</option>
  </select>
<br>
`
const res_damage_dialog = await dialogPromise(html_dialog);
if("Cancel" === res_damage_dialog || "Close" === res_damage_dialog) return;

const chosen_damage_type = res_damage_dialog.find('[class=Selection]')[0].value;
// console.log(chosen_damage_type);

let chromatic_orb_damage_parts = duplicate(chromatic_orb_spell.data.data.damage.parts);
// console.log(chromatic_orb_damage_parts);


// change damage type
chromatic_orb_damage_parts[0][1] = chosen_damage_type;
// console.log(chromatic_orb_damage_parts);


let upcastData = mergeObject(chromatic_orb_spell.data, {
	"data.damage.parts": chromatic_orb_damage_parts
	}, { inplace: false });

if(USE_MACRO) {
  upcastData = mergeObject(upcastData, {
	"flags.midi-qol.onUseMacroName": damageFXMacros[chosen_damage_type]
	}, {inplace: false});
}

if(USE_AA) {
  autoanimations.color = AAOverrideColors[chosen_damage_type];

  upcastData = mergeObject(upcastData, {
	"flags.autoanimations": autoanimations
	}, {inplace: false});
}

// console.log(upcastData);
const updated_spell_to_cast = chromatic_orb_spell.constructor.createOwned(upcastData, selected_token.actor);


// console.log(updated_spell_to_cast);


if(game.modules.has("midi-qol")) {
  // TrapWorkflow works for midiqol but does not ask for spell level nor to use spell slot
  // new MidiQOL.TrapWorkflow(selected_token.actor, updated_spell_to_cast, targets);
  updated_spell_to_cast.roll();

} else {
	let chatData = await updated_spell_to_cast.roll({createMessage: false});
	chatData.flags["dnd5e.itemData"] = updated_spell_to_cast.data;
	ChatMessage.create(chatData);
}

