// Macro to apply sorcerer metamagic to a spell
// Workflow:
// 1. Asks the user to select one spell from the character's spellbook.
// 2. Asks the user to select one metamagic option.
// 3. Subtracts the sorcery points accordingly.
// 4. Casts the spell by creating a temporary version with the enhancement.

// Metamagic options:
// 


const METAMAGIC_FEATS = [
  "Metamagic: Careful Spell",
  "Metamagic: Distant Spell",
  // "Metamagic: Empowered Spell", // separate macro to handle
  "Metamagic: Extended Spell",
  "Metamagic: Heightened Spell",
  "Metamagic: Quickened Spell",
  "Metamagic: Subtle Spell",
  "Metamagic: Twinned Spell",
  "Metamagic: Seeking Spell", // TCE
  "Metamagic: Transmuted Spell" // TCE
];

// Tasha p. 66. Transmuted spell damage options
const TRANSMUTED_DAMAGE_TYPES = [
  "acid", 
  "cold",
  "fire",
  "lightning",
  "poison",
  "thunder"
];

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
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

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
  
/**
 * Convert dialog to a promise to allow use with await/async.
 * @content HTML content for the dialog.
 * @return Promise for the html content of the dialog
 * Will return "Cancel" or "Close" if those are selected.
 */
function dialogPromise(content) {
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
function dialogCallback(content, callbackFn, titleLabel = "", confirmButton = "Okay", cancelButton = "Cancel") {
	let d = new Dialog({
		title: titleLabel,
		content: content,
		buttons: {
			one: {
				icon: '<i class="fas fa-check"></i>',
				label: confirmButton,
				callback: (html) => callbackFn(html)
			},
			two: {
				icon: '<i class="fas fa-times"></i>',
				label: cancelButton,
				callback: () => callbackFn("Cancel")
			}
			},
		default: "two",
		close: () => callbackFn("Close")
	});
	d.render(true);
}
  
/**
 * Present user with a dialog listing spells and get selected.
 * @spells Spell list
 * @return Chosen spell id
 */
async function SelectFromSpellList(spells, invalid_spell_names = []) {

  spells = spells.sort((a, b) => (a.name > b.name ? 1 : -1)); 
  
  // display spells; select one
  // spell name, school, facet, level, prepared/not prepared
  // class="table table-striped"
	const spellTableHead = 
	`
	<p><em>Please select a spell.</em></p>
	<form id = "spell_selection_form">
	<input type="text" id="filter_spells" onkeyup="filterSpellsFn()" placeholder="Search for spell by name...">
	<table id='spell_list_table' class="table table-striped">
							<thead>
								<tr>
									<th>Choice</th>
									<th>Name</th>
									<th>Level</th>
									<th>School</th>
									<th>Prepared?</th>
								
								</tr>
							</thead>
							<tbody>
	`;

	let spellTableRows = ``;
	spells.forEach(spell => {
	  const disable_input = invalid_spell_names.includes(spell.name) ? "disabled" : "";
	  const disable_text = invalid_spell_names.includes(spell.name) ? `style="color:#757575;"` : ``;
	
		const tableRow = 
		`
		<tr class="spell-row">
			<td> <input type="radio" name="spellSelection" class="spellSelection" id="${spell._id}" ${disable_input}> </td>
			<td> <label for="${spell}" ${disable_text}>${spell.name} </label> </td>
			<td ${disable_text}> ${spell.data.level} </td>
			<td ${disable_text}> ${spell.data.school} </td>
			<td ${disable_text}> ${spell.data.preparation.prepared} </td>
		</tr>
		`
		spellTableRows = spellTableRows + tableRow;
	});

	const spellTableEnd = 
	`
		</tbody>
		</table>
		</form>
		<br>
		<br>
	`;
	
	const filterScript = 
	`
	<script>
	function filterSpellsFn() {
	  const input = document.getElementById("filter_spells");
		const filter = input.value.toUpperCase();
		const table = document.getElementById("spell_list_table");
		let tr = table.getElementsByTagName("tr");

		// Loop through all table rows, and hide those who don't match the search query
		for (let i = 0; i < tr.length; i++) {
			const td = tr[i].getElementsByTagName("td")[1]; // column to search
			if (td) {
				const txtValue = td.textContent || td.innerText;
				if (txtValue.toUpperCase().indexOf(filter) > -1) {
					tr[i].style.display = "";
				} else {
					tr[i].style.display = "none";
				}
			}
		}	
	}
	</script>
	`;

	const dialogSpellTable = spellTableHead + spellTableRows + spellTableEnd + filterScript;

	const spell_table_res = await dialogPromise(dialogSpellTable);
	if("Cancel" === spell_table_res) {
				console.log("SelectFromSpellList|User cancelled.");
				return "CANCELED";
			} else if("Closed" == spell_table_res) {
				console.log("SelectFromSpellList|User closed");
				return "CLOSED";
			}

	// console.log(spell_table_res);
	let spell_chosen_id = "";
	spell_table_res.find('[class=spellSelection]').each(function(index, spell) {
		if(spell.checked) {
			spell_chosen_id = spell.id;
		}
	});

	console.log("SelectFromSpellList|spell chosen id", spell_chosen_id);
	
	return spell_chosen_id;
	
	// console.log(spells);
// 	return spells.find(sp => sp._id === spell_chosen_id);
}




/*
 * Display a dialog to select among several options
 * @param options Array of strings with option labels from which to choose
 * @param ids Array of strings corresponding to a unique id for each option. Optional.
 * @param prompt Intro prompt. Optional.
 * @param disabled Array of strings naming options that should be disabled. Optional.
 * @param type "radio", "checkbox", etc. Optional.
 * @param limit Number of items to select. Optional. Non-functional for radio input.
 * @return array of options chosen (may be 1)
*/
async function SelectionDialog(options, ids = [], prompt = "", disabled = [], type = "radio", limit = 0) {
  if(isEmpty(ids)) ids = options;
  
  
  const limit_prompt = (type != "radio" && limit > 0) ? `<i> (Limit ${limit})</i>` : ``;

  const tblHead = 
	`
	<p>${prompt}${limit_prompt}</p>
	<form id = "selection_form">
	<table id='worksheet_table' class="table table-striped">
								<thead>
									<tr>
										<th>Choice</th>
										<th>Name</th>
									</tr>
								</thead>
								<tbody>
	`;

	let tblRows = ``;
	options.forEach((o, index) => {
	  
	  const disabled_text = disabled.includes(o) ? "disabled" : "";
	  const disabled_label = disabled.includes(o) ? `style="color:#757575;"` : ``;
		const tblRow = 
			`
			<tr class="selection_row">
				<td> <input type="${type}" name="Selection" class="Selection" id="${ids[index]}" ${disabled_text}> </td>
				<td> <label for="${ids[index]}" ${disabled_label}>${o} </label> </td>
			</tr>
			`;
		tblRows = tblRows + tblRow;		
	});

	const tblEnd = 
	`
		</tbody>
		</table>
		</form>
		<br>
		<br>
	`;

	let dialogTable = tblHead + tblRows + tblEnd;
	
	if(type == "checkbox" && limit > 0) {
		// JQuery header
		const dialogHeader = 
		`
		 <script  src="https://code.jquery.com/jquery-3.4.1.js"   integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="   crossorigin="anonymous"></script>
		`;
		
		const script = 
		`
		<script>		
		$('input[name="Selection"]').on('change', function (e) {
      var len = $('input[name="Selection"]:checked').length
			if (len > ${limit}) {
					$(this).prop('checked', false);
			}
		});
		
		</script>
		`

		
		dialogTable = dialogHeader + dialogTable + script;
	}
	
//  	console.log("SelectionDialog:", dialogTable);

	const res = await dialogPromise(dialogTable);
	if("Cancel" === res) {
				console.log("SelectionDialog|User cancelled.");
				return "CANCELED";
			} else if("Closed" == res) {
				console.log("SelectionDialog|User closed");
				return "CLOSED";
			}

	let chosen_option = [];
	res.find('[class=Selection]').each(function(index, o) {
		if(o.checked) {
			chosen_option.push(o.id);
		}
	});
  
	return(chosen_option)
} 




/*
 * Test whether the metamagics can be used with the chosen spell.
 * @param spell_chosen Spell to be cast
 * @return object with valid, invalid, and unknown 
 */
function TestMetamagicValidity(spell_chosen) {
  // spell could have a single data or data.data. properties
  
  const spell_chosen_data = spell_chosen.data.hasOwnProperty("data") ? spell_chosen.data.data : spell_chosen.data; 


  let valid = [];

  // properties to test
  const spell_range = spell_chosen_data.range.value;
  const spell_range_units = spell_chosen_data.range.units;
  const spell_dc = spell_chosen_data.save.dc;
  const spell_dmg = spell_chosen_data.damage.parts;
  const spell_duration = spell_chosen_data.duration.value;
  const spell_duration_units = spell_chosen_data.duration.units;
  const spell_casting_time = spell_chosen_data.activation.cost;
	const spell_casting_type = spell_chosen_data.activation.type;
	const spell_actionType = spell_chosen_data.actionType;
	const spell_somatic = spell_chosen_data.components.somatic;
	const spell_vocal = spell_chosen_data.components.vocal;
	const spell_target_type = spell_chosen_data.target.type;
	const spell_target_number = spell_chosen_data.target.value;
	

	/* 
	 * Metamagic: Careful Spell
	 * Metamagic: Heightened Spell
	 * PHB p. 102
	 * Need a saving throw
	 */
	 
	 if(!isEmpty(spell_dc)) {
	   valid.push("Metamagic: Careful Spell");
	   valid.push("Metamagic: Heightened Spell");
	 } 

  /* Metamagic: Distant Spell
	 * PHB p. 102
	 * Need range of touch or 5+ feet
	 */ 
	 if(spell_range > 5 || spell_range === "touch") {
	   valid.push("Metamagic: Distant Spell");
	 } 
  
  /* Metamagic: Empowered Spell
   * PHB p. 102
   * Need a damage roll
   
   * Metamagic: Transmuted Spell
   * Tasha's p. 66.
   * Need damage type 
   * acid, cold, fire, lightning, poison, thunder
   */ 
   const valid_transmutations = ["acid", "cold", "fire", "lightning", "poison", "thunder"];
   
   
   if(!isEmpty(spell_dmg)) {
     valid.push("Metamagic: Empowered Spell");
     
     if(valid_transmutations.includes(spell_dmg[0][1])) {
       valid.push("Metamagic: Transmuted Spell");
     }
   }
  
  /* Metamagic: Extended Spell
   * PHB p. 102
   * Need duration 1 minute or longer
   */
   
  // test for invalid durations
  // instantaneous, turns, rounds, minutes, hours, days, months, years, permanent, special
  // units: inst, turn, round, minute, hour, day, month, year, perm, spec
   if("round" === spell_duration_units && spell_duration >= 10 ||
      "minute" === spell_duration_units ||
      "hour" === spell_duration_units || 
      "day" === spell_duration_units || 
      "month" === spell_duration_units || 
      "year" === spell_duration_units) {
     // 1 round is 6 seconds
     // rest are clearly longer than a minute
     valid.push("Metamagic: Extended Spell");
     
   }  
   
  /* Metamagic: Quickened Spell
   * PHB p. 102
   * Need casting time of 1 action
   */
	
	 if(1 === spell_casting_time && "action" === spell_casting_type) {
	   valid.push("Metamagic: Quickened Spell");
	 }
   
  /* Metamagic: Seeking Spell
   * Tasha's p. 66.
   * Need an attack roll
   */
   // "rsak" - Ranged Spell Attack
   // "msak" -- Melee Spell Attack
   
   if("rsak" === spell_actionType || 
      "msak" === spell_actionType) {
     valid.push("Metamagic: Seeking Spell");
   
   }
   
  /* Metamagic: Subtle Spell
   * PHB p. 102
   * Need somatic or verbal components
   */
   if(spell_somatic ||
      spell_vocal) {
      valid.push("Metamagic: Subtle Spell");
      
   }
    
 
  /* Metamagic: Twinned Spell
   * PHB p. 102
   * Need range other than self, target single creature
   */
   if("creature" === spell_target_type &&
      1 === spell_target_number && 
      "self" !== spell_range_units) {
      valid.push("Metamagic: Twinned Spell");   
   }
   
  return valid;
}
  
// ----------------------------------------------
// main workflow


const tokens = RetrieveSelectedTokens();
const targets = Array.from(game.user.targets);

if(isEmpty(tokens)) {
  ui.notifications.warn("No tokens selected.");
  return;
} else if(tokens.length > 1) {
  ui.notifications.warn("Please select a single token.");
  return;
}

const token_chosen = tokens[0];
console.log("Chosen token", token_chosen);
console.log("Targets", targets);

// if(token_chosen.actor.data.classes)

const spells = token_chosen.actor.data.items.filter(item => item.type === "spell");
console.log("Spells:", spells);
  
if(isEmpty(spells)) {
	ui.notifications.warn("No spells found for selected token.");
	return;
}

const actor_metamagics = token_chosen.actor.data.items.filter(item => item.type === "feat" && METAMAGIC_FEATS.includes(item.name));
if(isEmpty(actor_metamagics)) {
  ui.notifications.warn("No metamagics found for selected token.");
  return;
}
const metamagics = actor_metamagics.sort((a, b) => (a.name > b.name ? 1 : -1)); 
console.log("Metamagics:", metamagics);

const metamagics_names = [];
const metamagics_ids = [];
const metamagics_full_names = [];
metamagics.forEach(m => {
  metamagics_full_names.push(m.name);
  metamagics_names.push(m.name.replace(/Metamagic: /, ''));
  metamagics_ids.push(m._id);
});


	
// Test spell list against available metamagics; gray out unavailable ones
const valid_metamagics = spells.map(s => TestMetamagicValidity(s));
console.log("valid_metamagics", valid_metamagics);
const invalid_spells = spells.filter((s, idx) => {
  // the spell has no qualifying metamagic or 
  if(isEmpty(valid_metamagics[idx])) return true;
  
   // the spell's qualifying metamagics are not owned by the actor
  const intersection = valid_metamagics[idx].filter(m => metamagics_full_names.includes(m));
  if(isEmpty(intersection)) return true;
  return false;
});
console.log(`${invalid_spells.length} spells do not qualify given metamagic`, invalid_spells);
const invalid_spell_names = invalid_spells.map(s => s.name);


let spell_chosen_id = await SelectFromSpellList(spells, invalid_spell_names);
if("CANCELED" === spell_chosen_id ||
   "CLOSED" === spell_chosen_id) return;

// const spell_chosen = token_chosen.actor.items.filter(i => spell_chosen_id === i._id)[0];
const spell_chosen = token_chosen.actor.getOwnedItem(spell_chosen_id);

console.log("Spell Chosen:", spell_chosen);  


const valid_metamagic_names = TestMetamagicValidity(spell_chosen);
console.log("valid_metamagic_names:", valid_metamagic_names);

// metamagics that are not in valid_metamagics
let invalid_metamagic_names = METAMAGIC_FEATS.filter(x => !valid_metamagic_names.includes(x));
console.log("invalid_metamagic_names:", invalid_metamagic_names);

invalid_metamagic_names = invalid_metamagic_names.map(m => {
  return m.replace(/Metamagic: /, '');
});
console.log("invalid_metamagic_names:", invalid_metamagic_names);





let metamagic_chosen_id = (await SelectionDialog(metamagics_names,
                               metamagics_ids,
                               "Please select a metamagic.",
                               invalid_metamagic_names))[0];
                               
                               
console.log(`Chosen metamagic id ${metamagic_chosen_id}.`, metamagic_chosen_id);

if("CANCELED" === metamagic_chosen_id ||
   "CLOSED" === metamagic_chosen_id) return;

// const metamagic_chosen = token_chosen.actor.items.filter(i => metamagic_chosen_id === i._id)[0];
const metamagic_chosen = token_chosen.actor.getOwnedItem(metamagic_chosen_id);
console.log("metamagic_chosen", metamagic_chosen);      

const metamagic_chosen_name = metamagic_chosen.name;
console.log(`Selected ${metamagic_chosen.name}:`, metamagic_chosen);                               
                              
let spell_modifications = {};
let sorcery_points_expended = 0;

if(metamagic_chosen.name == "Metamagic: Careful Spell") {
/*
PHB p. 102
When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.
*/
  sorcery_points_expended += 1;
  
  // if no targets, error out
  // target select dialog using token name (and image?) Multi-select
  // apply active effect to each selected
  // flags.midi-qol.
/*
"data.abilities.ABILITY.save"

Provides a bonus to ability saves. This is only active if the "Use ability save field when rolling saving throws" module setting is enabled. This will use the save plus rather than the ability modifier when rolling saving throws.
*/
  
  // targets is an Array
	console.log(`Number of targets: ${targets.length}`, targets);
	
	// max creatures Charisma modifier, min 1
	const max_creatures = Math.max(1, token_chosen.actor.data.data.abilities.cha.mod);
	
	if(targets.length < 1) {
	  ui.notifications.error("Metamagic: Careful Spell|Requires at least one target selected.");
	  return;
	}
	
	// check that the spell requires a save
	if(isEmpty(spell_chosen.data.data.save.dc)) {
	  ui.notifications.error("Metamagic: Careful Spell|Requires a spell with a saving throw.")
	}
	
	
	const target_names = targets.map(t => t.data.name);
	const target_ids = targets.map(t => t.data._id);
		
	let target_chosen_id = await SelectionDialog(target_names,
                               target_ids,
                               "Please select target(s) to give automatic save success.",
                               [],
                               "checkbox",
                               max_creatures);
	console.log(`Chosen target id:`, target_chosen_id);
	
	let ActiveEffect = game.macros.getName("ActiveEffect");



  // mode is probably Custom (0), Multiply (1), Add (2), Downgrade (3), Upgrade (4), Override (5)
let effectData = {
    "label": "Metamagic: Careful Spell",
    "flags": { dae: {
                      macroRepeat: "none",
                      specialDuration: ["isSave"],
                      stackable: false,
                      transfer: true
                    }
                 
              },
    "changes": [
                 {
                   "key": "data.bonuses.abilities.save",
                   "value": 99,
                   "mode": 2, 
                   "priority": 90,
                 },
               ],
    "icon": "icons/svg/aura.svg",
    "source": "Metamagic macro",
    "disabled": false,
  };
  // testing
//   let ActiveEffect = game.macros.getName("ActiveEffect");
// let target = Array.from(game.user.targets)[0];
// await ActiveEffect.execute(target.id, effectData, "add");
  
  // need for loop so async works
  for(let t of target_chosen_id) {
    await ActiveEffect.execute(t, effectData, "add");
  }
  
  

  console.log("Targets after active effect:", targets);
  

}

if(metamagic_chosen.name === "Metamagic: Distant Spell") {
/*
PHB p. 102
When you cast a spell that has a range of 5 feet or greater, you can spend 1 sorcery point to double the range of the spell.

When you cast a spell that has a range of touch, you can spend 1 sorcery point to make the range of the spell 30 feet.
*/
  sorcery_points_expended += 1;
  
  const spell_range = spell_chosen.data.data.range.value;
  if(spell_range >= 5) {
    spell_modifications = mergeObject(spell_modifications, 
      { "data.range.value": spell_range * 2 });

  } else if(spell_range == "touch") {
    spell_modifications = mergeObject(spell_modifications, 
      { "data.range.value": 30,
        "data.range.units": "ft" });
  }

} 



if(metamagic_chosen.name == "Metamagic: Extended Spell") {
/*
PHB p. 102
When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum duration of 24 hours.
*/
	sorcery_points_expended += 1;
	
  const spell_duration = spell_chosen.data.data.duration.value;
  const spell_duration_units = spell_chosen.data.data.duration.units;
  
  // test for invalid durations
  // instantaneous, turns, rounds, minutes, hours, days, months, years, permanent, special
  // units: inst, turn, round, minute, hour, day, month, year, perm, spec
  if("round" === spell_duration_units && spell_duration < 10) {
    // 1 round is 6 seconds
    ui.notifications.error(`Metamagic: Extended Spell|Chosen spell is only ${spell_duration_units} ${spell_duration}.`); 
    return;
  } else if("inst" === spell_duration_units ||
            "perm" === spell_duration_units ||
            "special" === spell_duration_units ||
            "turn" === spell_duration_units) {
    ui.notifications.error(`Metamagic: Extended Spell|Chosen spell is ${spell_duration_units}.`);
    return;
  } 
  
  spell_modifications = mergeObject(spell_modifications, 
      { "data.duration.value": spell_duration * 2 });  
  
}

if(metamagic_chosen.name == "Metamagic: Heightened Spell") {
/*
PHB p. 102
When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery points to give one target of the spell disadvantage on its first saving throw made against the spell.
*/
	sorcery_points_expended += 3;
	
	// check if one or more targets are selected. If no, error out
	// display dialog to select targets, using token names (and images?). 
	// use active effect to grant disadvantage on first saving throw to target
	// flags.midi-qol.disadvantage.ability.save.all
	// duration isAttacked
	
	// targets is an Array
	console.log(`Number of targets: ${targets.length}`, targets);
	
	if(targets.length < 1) {
	  ui.notifications.error("Metamagic: Heightened Spell|Requires at least one target selected.");
	  return;
	}
	
	// check that the spell requires a save
	if(isEmpty(spell_chosen.data.data.save.dc)) {
	  ui.notifications.error("Metamagic: Heightened Spell|Requires a spell with a saving throw.")
	}
	
	
	const target_names = targets.map(t => t.data.name);
	const target_ids = targets.map(t => t.data._id);
		
	let target_chosen_id = (await SelectionDialog(target_names,
                               target_ids,
                               "Please select a target."))[0];
	console.log(`Chosen target id ${target_chosen_id}.`);
	
	let ActiveEffect = game.macros.getName("ActiveEffect");



  // mode is probably Custom (0), Multiply (1), Add (2), Downgrade (3), Upgrade (4), Override (5)
let effectData = {
    "label": "Metamagic: Heightened Spell",
    "flags": { dae: {
                      macroRepeat: "none",
                      specialDuration: ["isSave"],
                      stackable: false,
                      transfer: true
                    }
                 
              },
    "changes": [
                 {
                   "key": "flags.midi-qol.disadvantage.ability.save.all",
                   "value": 1,
                   "mode": 0, 
                   "priority": 90,
                 },
               ],
    "icon": "icons/svg/aura.svg",
    "source": "Metamagic macro",
    "disabled": false,
  };
  // testing
//   let ActiveEffect = game.macros.getName("ActiveEffect");
// let target = Array.from(game.user.targets)[0];
// await ActiveEffect.execute(target.id, effectData, "add");
  
  
  await ActiveEffect.execute(target_chosen_id, effectData, "add");

  console.log("Targets after active effect:", targets);

}

if(metamagic_chosen.name == "Metamagic: Quickened Spell") {
/*
PHB p. 102
When you cast a spell that has a casting time of 1 action, you can spend 2 sorcery points to change the casting time to 1 bonus action for this casting.
*/
	sorcery_points_expended += 2;
	
	const spell_casting_time = spell_chosen.data.data.activation.cost;
	const spell_casting_type = spell_chosen.data.data.activation.type;
	
	if(1 === spell_casting_time && "action" === spell_casting_type) {
	  spell_modifications = mergeObject(spell_modifications, 
      { "data.activation.type": "bonus"});
	} else {
	  ui.notifications.error("Chosen spell does not have a casting time of 1 action.");
	  return;
	}
}


// if(metamagic_chosen.name == "Metamagic: Seeking Spell") {
// /*
// Tasha's p. 66.
// If you make an attack roll for a spell and miss, you can spend 2 sorcery points to reroll the d20, and you must use the new roll.
// 
// You can use Seeking Spell even if you have already used a different Metamagic option during the casting of the spell.
// */
//   sorcery_points_expended += 2;
//   
//   // check for whether an attack roll must be made; error otherwise
//   // when the attack is rolled, use rollAttack and check if the attack hit, then rollDamage
// }



if(metamagic_chosen.name == "Metamagic: Subtle Spell") {
/*
PHB p. 102
When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.
*/
  sorcery_points_expended += 1;
  
  spell_modifications = mergeObject(spell_modifications, 
      { "data.components.somatic": false,
        "data.components.vocal": false });
}

if(metamagic_chosen.name == "Metamagic: Transmuted Spell") {
/*
Tasha's p. 66.
When you cast a spell that deals a type of damage from the following list, you can spend 1 sorcery point to change that damage type to one of the other listed types: acid, cold, fire, lightning, poison, thunder.
*/
  sorcery_points_expended += 1;
  
  const dmg_type = spell_chosen.data.data.damage.parts[0][1];
  
  
  if(TRANSMUTED_DAMAGE_TYPES.includes(dmg_type)) {
  // dialog to select damage type
  const chosen_dmg_type = await SelectionDialog(TRANSMUTED_DAMAGE_TYPES,
                                                TRANSMUTED_DAMAGE_TYPES,
                                           "<h3>Metamagic: Transmuted Spell</h3>Please select a damage type.", dmg_type);
  
  let dmg_parts = duplicate(spell_chosen.data.data.damage.parts);
  dmg_parts[0][1] = chosen_dmg_type;
  
  spell_modifications = mergeObject(spell_modifications, 
      { "data.damage.parts": dmg_parts });
  
  } else {
    ui.notifications.error("Metamagic: Transmuted Spell|Spell does not contain valid damage type.")
    return;
  }
  
  
}

if(metamagic_chosen.name == "Metamagic: Twinned Spell") {
/*
PHB p. 102
When you cast a spell that targets only one creature and doesn't have a range of self, you can spend a number of sorcery points equal to the spell's level to target a second creature in range with the same spell (1 sorcery point if the spell is a cantrip).

To be eligible, a spell must be incapable of targeting more than one creature at the spell's current level. For example, magic missile and scorching ray aren't eligible, but ray of frost and chromatic orb are.
*/
  const spell_level = spell_chosen.data.level;
  sorcery_points_expended += (0 === spell_level ? 1 : spell_level);
  
  if("self" === spell_chosen.data.range.units) {
    ui.notifications.error("Metamagic: Twinned Spell|Chosen spell has a range of self.")
    return;
  
  } else if("creature" !== spell_chosen.data.target.units) {
    ui.notifications.error("Metamagic: Twinned Spell|Chosen spell does not target single creature.")
    return;
  }
  
  // confirm that two targets are selected
  if(targets.length != 2) {
     ui.notifications.error("Metamagic: Twinned Spell|Requires two targets selected.");
	  return;
  } 
  
}

// apply the metamagic feature, which can be tied to using sorcerer points
// Await it in case user cancels, and to get the right order.
await metamagic_chosen.roll();

console.log("Spell modifications:", spell_modifications);

let updated_spell_to_cast = {};

if(!isEmpty(spell_modifications)) {
  const upcastData = mergeObject(spell_chosen.data, spell_modifications, 
                                 {inplace: false});
  console.log("Upcast data: ", upcastData);                 
  // randomID()              

	// two versions: either just use createOwned or first create a temporary item (which changes the id) and then use createOwned
	// dnd5e uses createOwned when upcasting a spell
	// this casts the spell but the resulting chat message damage uses the original unmodified spell (test by clicking place template; it will revert back to 15-feet)
	updated_spell_to_cast = spell_chosen.constructor.createOwned(upcastData, 
																		token_chosen.actor);

	// createOwnedItem is async, unlike createOwned, and takes a temporary flag
	// need the temporary flag to avoid creating the item in the actor
	// this casts the spell but the resulting chat message buttons throw an error because the item is no longer found
	// const temp_item = await token_selected.actor.createOwnedItem(upcastData, {temporary: true});
	// updated_spell_to_cast = spell_chosen.constructor.createOwned(temp_item, 
	//                                   token_chosen.actor);
} else {
  updated_spell_to_cast = spell_chosen;

}
console.log("Updated spell to cast:", updated_spell_to_cast);


if(metamagic_chosen.name == "Metamagic: Twinned Spell") {
  // run one, then the second target.
  targets[0].setTarget(true, {releaseOthers: true});
	await wait(100);
}

let res = {};
if(game.modules.has("midi-qol")) {
  res = await updated_spell_to_cast.roll();
  //new MidiQOL.TrapWorkflow(token_chosen.actor, updated_spell_to_cast, targets);
} else {
	res = await updated_spell_to_cast.roll({createMessage: false});
	chatData.flags["dnd5e.itemData"] = updated_spell_to_cast.data;
	ChatMessage.create(chatData);
}
// 
// console.log("Roll result", res);
// console.log("Roll result roll", res.getRollData());
// console.log(`Roll result message ${res.data.content}`);


if(metamagic_chosen.name == "Metamagic: Twinned Spell") {
  // run one, then the second target.
  targets[1].setTarget(true, {releaseOthers: true});
	await wait(100);
	
	if(game.modules.has("midi-qol")) {
		updated_spell_to_cast.roll();
		//new MidiQOL.TrapWorkflow(token_chosen.actor, updated_spell_to_cast, targets);
	} else {
		let chatData = await updated_spell_to_cast.roll({createMessage: false});
		chatData.flags["dnd5e.itemData"] = updated_spell_to_cast.data;
		ChatMessage.create(chatData);
	}

	targets.forEach(t => t.setTarget(true, {releaseOthers: false}));
}



// Tested:
/*
√  "Metamagic: Careful Spell",
√  "Metamagic: Distant Spell",
  "Metamagic: Extended Spell",
√  "Metamagic: Heightened Spell",
√  "Metamagic: Quickened Spell",
√  "Metamagic: Subtle Spell",
  "Metamagic: Twinned Spell",
  "Metamagic: Seeking Spell", // TCE
√  "Metamagic: Transmuted Spell" // TCE
  
*/
  


