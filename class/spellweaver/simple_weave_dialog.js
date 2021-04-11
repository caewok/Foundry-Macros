// Ability check to weave a spell
// Dialog indicates:
// - facet proficiencies
// - facet specialization and mastery, if any

// Dialog asks:
// - spell facet
// - spell level
// - number of modifications
// - number of enhancements
// - mirror modification
// - weaving type (prepared, notes, )

// Dialog calculates:
// - number of free enhancements, if any
// - spell base points plus enhancement/modification points
// DC
// advantage, normal, disadvantage



// Constants
const SPELL_POINTS_RESOURCE_LABEL = "Spell Points"
const USE_SPELL_POINTS_MODULE = true;

const FACETS = {
  energy: "con",
  matter: "int",
  mind: "cha",
  space: "int",
  spirit: "wis",
  time: "wis",
};

const SPELLWEAVER_POINTS = {
	spells: [0, 4, 6, 10, 12, 14, 18, 20, 22, 26],
	modifications: [0, 2, 4, 6, 9, 12, 15, 19, 24, 31],
	enhancements: [0, 1, 2, 3, 5, 7, 9, 12, 16, 22],
};


const WEAVING_TYPES = {
	prepared: ["advantage", "advantage", "advantage", "none", "none"],
	notebook: ["normal", "normal", "normal", "advantage", "none"],
	scroll: ["normal", "normal", "normal", "normal", "advantage"],
	observed: ["disadvantage", "disadvantage", "normal", "normal", "advantage"],
};

const ROLL_TYPES = {
  advantage: "2d20kh1", 
  normal: "1d20", 
  disadvantage: "2d20kl1", 
  none: "none"
};



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

/**
 * Pull the actor using id from the token
 * @token Token for the actor
 * @return actor
 */
function RetrieveActorFromTokenUsingID(token) {
  const actor = game.actors.get(token.actor._id);
  return actor;
}

/**
 * Retrieve the actor resource for spell points
 * From https://github.com/misthero/dnd5e-spellpoints/blob/main/scripts/dnd5e-spellpoints.js
 * @actor The actor to review
 * @return key/value object with the resource
 */
function getSpellPointsResource(actor) {
 let _resources = getProperty(actor, "data.data.resources");
    for (let r in _resources) {
      if (SPELL_POINTS_RESOURCE_LABEL === _resources[r].label) {
        return r;
        break;
      }
    }
    return false;
}

let selected_token = RetrieveSelectedTokens()[0];
if(isEmpty(selected_token)) {
  ui.notifications.warn("Please select a token");
}
//console.log(selected_token);


const chosen_actor_name = selected_token.actor.data.name;

const class_items = selected_token.actor.data.items.filter(i => "class" === i.type && ("Arcane Spellweaver" === i.name || "Divine Spellweaver" === i.name));
console.log(class_items);

let accumulator = (acc, cur) => acc + cur.data.levels;
const class_levels = class_items.reduce(accumulator, 0);
//console.log(class_levels);

if(class_levels < 1) {
  ui.notifications.warn(`${chosen_actor_name} does not appear to have any Spellweaver levels.`);
  return;
}


let spell_points_resource_name = getSpellPointsResource(selected_token.actor);
//console.log(spell_points_resource_name);


if(!spell_points_resource_name) {
  ui.notifications.warn(`${chosen_actor_name} does not appear to have a Spell Points resource`);
  return;
}

const actualSpellPoints = parseInt( getProperty(selected_token.actor.data.data, `resources.${spell_points_resource_name}.value`) )||0;
console.log(`${chosen_actor_name}'s current spell points: ${actualSpellPoints}.`);



// item name should be:
// 

const facet_items = selected_token.actor.data.items.filter(i => "feat" === i.type &&          i.name.includes("Facet"));
//console.log(facet_items); 



const max_spell_level = Math.min(9, Math.ceil(class_levels / 2));

// parse the items
let FACET_ABILITIES = {
  energy: {
    proficient: false,
    specialized: false,
    mastery1: false,
    mastery2: false,
    enhanced1: false,
    enhanced2: false,
    potent: false,
    mod: selected_token.actor.data.data.abilities[FACETS.energy].mod,
    prof: selected_token.actor.data.data.attributes.prof,
  },
  
  matter: {
    proficient: false,
    specialized: false,
    mastery1: false,
    mastery2: false,
    enhanced1: false,
    enhanced2: false,
    potent: false,
    mod: selected_token.actor.data.data.abilities[FACETS.matter].mod,
    prof: selected_token.actor.data.data.attributes.prof,
  },
  
  mind: {
    proficient: false,
    specialized: false,
    mastery1: false,
    mastery2: false,
    enhanced1: false,
    enhanced2: false,
    potent: false,
    mod: selected_token.actor.data.data.abilities[FACETS.mind].mod,
    prof: selected_token.actor.data.data.attributes.prof,
  },
  
  space: {
    proficient: false,
    specialized: false,
    mastery1: false,
    mastery2: false,
    enhanced1: false,
    enhanced2: false,
    potent: false,
    mod: selected_token.actor.data.data.abilities[FACETS.space].mod,
    prof: selected_token.actor.data.data.attributes.prof,
  },
  
  spirit: {
    proficient: false,
    specialized: false,
    mastery1: false,
    mastery2: false,
    enhanced1: false,
    enhanced2: false,
    potent: false,
    mod: selected_token.actor.data.data.abilities[FACETS.spirit].mod,
    prof: selected_token.actor.data.data.attributes.prof,
  },
  
  time: {
    proficient: false,
    specialized: false,
    mastery1: false,
    mastery2: false,
    enhanced1: false,
    enhanced2: false,
    potent: false,
    mod: selected_token.actor.data.data.abilities[FACETS.time].mod,
    prof: selected_token.actor.data.data.attributes.prof,
  },
};



facet_items.forEach(function(i) {
  const facet = i.name.includes("Energy") ? "energy" : 
                i.name.includes("Matter") ? "matter" : 
                i.name.includes("Mind") ? "mind" : 
                i.name.includes("Space") ? "space" : 
                i.name.includes("Spirit") ? "spirit" : 
                i.name.includes("Time") ? "time" : "";
  //console.log(facet);              
  
  const knowledge_type = i.name.includes("Proficiency") ? "proficient" : 
                         i.name.includes("Specialization") ? "specialized" : 
                         i.name.includes("Mastery I") ? "mastery1" :
                         i.name.includes("Mastery II") ? "mastery2" : "";
  //console.log(knowledge_type);
  
  if(isEmpty(facet) || isEmpty(knowledge_type)) return;
  
  FACET_ABILITIES[facet][knowledge_type] = true;
  return;
});

// Enhanced Weaving I: 1 Free upcharge of an enhancement with that facet
// Enhanced Weaving II: -1 point for casting the facet
const enhanced_weaving = selected_token.actor.data.items.filter(i => "feat" === i.type &&          i.name.includes("Enhanced Weaving"));

// Potent Weaving I: 1 free enhancement when casting that facet
const potent_weaving = selected_token.actor.data.items.filter(i => "feat" === i.type &&          i.name.includes("Potent Weaving"));

if(!isEmpty(enhanced_weaving)) {
	enhanced_weaving.forEach(function(i) {
		const facet = i.name.includes("Energy") ? "energy" : 
									i.name.includes("Matter") ? "matter" : 
									i.name.includes("Mind") ? "mind" : 
									i.name.includes("Space") ? "space" : 
									i.name.includes("Spirit") ? "spirit" : 
									i.name.includes("Time") ? "time" : "";
	
		const type = i.name.includes("Weaving II") ? "enhanced2" : "enhanced1";
		if(isEmpty(facet) || isEmpty(type)) return;
		
		FACET_ABILITIES[facet][type] = true;
    return;
	});
}

if(!isEmpty(potent_weaving)) {
	potent_weaving.forEach(function(i) {
		const facet = i.name.includes("Energy") ? "energy" : 
									i.name.includes("Matter") ? "matter" : 
									i.name.includes("Mind") ? "mind" : 
									i.name.includes("Space") ? "space" : 
									i.name.includes("Spirit") ? "spirit" : 
									i.name.includes("Time") ? "time" : "";
	
	  if(isEmpty(facet)) return;
		
		FACET_ABILITIES[facet]["potent"] = true;
    return;
	});
}


//console.log(FACET_ABILITIES);

const html_header = 
`
<script src="https://code.jquery.com/jquery-3.4.1.js"   
         integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="   
         crossorigin="anonymous"> </script>
`;


let facet_strings = {
  proficient: [],
  specialized: [],
  mastery1: [],
  mastery2: [],
  enhanced1: [],
  enhanced2: [],
  potent:[]
};

//console.log(Object.keys(FACET_ABILITIES));

Object.entries(FACET_ABILITIES).forEach(([key, value]) => {
  console.log(key);
  console.log(value);
  
  if(value.proficient) facet_strings.proficient.push(key);
  if(value.specialized) facet_strings.specialized.push(key); 
  if(value.mastery1) facet_strings.mastery1.push(key); 
  if(value.mastery2) facet_strings.mastery2.push(key);
  if(value.enhanced1) facet_strings.enhanced1.push(key);
  if(value.enhanced2) facet_strings.enhanced2.push(key);
  if(value.potent) facet_strings.potent.push(key);
});

facet_strings.proficient = facet_strings.proficient.join(', ');
facet_strings.specialized = facet_strings.specialized.join(', ');
facet_strings.mastery1 = facet_strings.mastery1.join(', ');
facet_strings.mastery2 = facet_strings.mastery2.join(', ');
facet_strings.enhanced1 = facet_strings.enhanced1.join(', ');
facet_strings.enhanced2 = facet_strings.enhanced2.join(', ');
facet_strings.potent = facet_strings.potent.join(', ');

//console.log(facet_strings);

let html_facet_summary =
`
Facet Proficiencies: ${facet_strings.proficient}<br>
Facet Specialization: ${facet_strings.specialized}<br>
Facet Mastery I: ${facet_strings.mastery1}<br>
Facet Mastery II: ${facet_strings.mastery2}<br>
`;


// add section on enhanced weaving features if needed
if(!isEmpty(facet_strings.enhanced1) || !isEmpty(facet_strings.enhanced2) || !isEmpty(facet_strings.potent)) {
  let enhanced_summary = 
`
<hr>
`;
  let enhanced_notes = ``;
  
  
  if(!isEmpty(facet_strings.enhanced1)) {
    enhanced_summary +=
`Enhanced Weaving: ${facet_strings.enhanced1}<br>`;

    enhanced_notes += `<em>Enhanced Weaving grants a free enhancement for that facet. Add manually.<br>`;
  }
  
  if(!isEmpty(facet_strings.enhanced2)) {
    enhanced_summary +=
`Enhanced Weaving II: ${facet_strings.enhanced2}<br>`;

    enhanced_notes += `<em>Enhanced Weaving II grants -1 spell point if casting that facet. Added automatically.<br>`;
  }
  
  if(!isEmpty(facet_strings.potent)) {
    enhanced_summary +=
`Potent Weave: ${facet_strings.potent}<br>`;

    enhanced_notes += `<em>Potent Weave grants 1 free enhancement if casting that facet. Added automatically.<br>`;
  }
  
  html_facet_summary += enhanced_summary + "<p>" + enhanced_notes + "</p>";
}


const html_choices =
`
Spell Facet: 
  <select id="SpellFacetSelection" class="Selection" name="SpellFacetSelection">
    <option value="energy">Energy</option>
    <option value="matter">Matter</option>
    <option value="mind">Mind</option>
    <option value="space">Space</option>
    <option value="spirit">Spirit</option>
    <option value="time">Time</option>
  </select>
  <br>
  
  Spell Level: 
  <input type="number" id="SpellLevelSelection" class="Selection" min=0 max=${max_spell_level} step=1 value=0></input>
  <br>

  Weaving Type: 
  <select id="WeaveTypeSelection" class="Selection" name="WeaveTypeSelection">
    <option value="prepared">Prepared</option>
    <option value="notebook">Notebook</option>
    <option value="scroll">Scroll</option>
    <option value="observed">Observed</option>
  </select>
  <br>
  <br>
  
  Attempt Number:
  <input type="number" id="AttemptSelection" class="Selection" min=1 max=99 step=1 value=1></input>
  <br>
   
  Modifications: 
  <input type="number" id="SpellModificationSelection" class="Selection" min=0 max=${max_spell_level} step=1 value=0></input>
  <br>

  Enhancements: 
  <input type="number" id="SpellEnhancementSelection" class="Selection" min=0 max=${max_spell_level} step=1 value=0></input>
  <br>

  Mirrors? 
  <input type="number" id="SpellMirrorSelection" class="Selection" min=0 max=${max_spell_level} step=1 value=0></input>
  <em>(do not also add to modifications)</em>
`;

const html_calculations = 
`
DC <span id="DC"></span><br>
Facet Ability Check: <span id="FacetAbilityCheck"></span><br>
Spell Points: <span id="SpellPoints"></span>
`;

const html_script = 
`
<script>
   function recalculate() {
    const SPELLWEAVER_POINTS = ${JSON.stringify(SPELLWEAVER_POINTS)};
    const FACET_ABILITIES = ${JSON.stringify(FACET_ABILITIES)};
    const ROLL_TYPES = ${JSON.stringify(ROLL_TYPES)};
    const WEAVING_TYPES = ${JSON.stringify(WEAVING_TYPES)};
   
    //console.log("Recalculating...");
    //console.log(SPELLWEAVER_POINTS);
    
    // can get faster by coercing using | 0 or ? 1 : 0, but this should suffice here.
    //console.log(FACET_ABILITIES.space.proficient + FACET_ABILITIES.space.specialized);
    
    const chosen_facet = $('#SpellFacetSelection').val();
    const spell_level = parseInt( $('#SpellLevelSelection').val() );
    const weaving_type = $('#WeaveTypeSelection').val();
    const num_modifications = parseInt( $('#SpellModificationSelection').val() );
    let num_enhancements = parseInt( $('#SpellEnhancementSelection').val() );
    const num_mirrors = parseInt( $('#SpellMirrorSelection').val() );
    const num_attempts = parseInt( $('#AttemptSelection').val() );
    
    
    const total_modifications = Math.min(9, num_modifications + num_mirrors);
    //console.log("Total modifications: " + total_modifications.toString());
    
    // DC: 10 + spell level + 1 per mod + 1 per enhancement - 1 per attempt after the first
    //const dc_total = 10 + spell_level + total_modifications + num_enhancements;
    let dc_str = "10 + " + spell_level.toString() + " + " + total_modifications.toString() + " + " + num_enhancements.toString();
    if(num_attempts > 1) {
      dc_str +=  " - " + (num_attempts - 1).toString();
    }
    
    
    const dc_total = eval(dc_str);
    //console.log(dc_str);
    //console.log(eval(dc_str));
    
    if(FACET_ABILITIES[chosen_facet].potent) {
      num_enhancements = Math.max(0, num_enhancements - 1);
    }
    
    // spell points: 
    let spell_points_str = SPELLWEAVER_POINTS.spells[spell_level].toString() + " + " + SPELLWEAVER_POINTS.modifications[total_modifications].toString() + " + " + SPELLWEAVER_POINTS.enhancements[num_enhancements].toString();
    
    if(FACET_ABILITIES[chosen_facet].enhanced2) {
      spell_points_str += " - 1";
    }
    
    if(num_mirrors > 0) spell_points_str += " + (" + spell_points_str + ") * " + num_mirrors.toString();
    const spell_points_total = eval(spell_points_str);
    
    // facet ability check: 
    // 1d20 or 2d20kh1 for adv or 2d20kl1 for dis + ability + proficiency
    // prepared: advantage or none if mastery
    // const roll = {advantage: "2d20kh1", normal: "1d20", disadvantage: "2d20kl1", none: "none"}
    const proficiency_level = FACET_ABILITIES[chosen_facet].proficient + 
                              FACET_ABILITIES[chosen_facet].specialized +
                              FACET_ABILITIES[chosen_facet].mastery1 +
                              FACET_ABILITIES[chosen_facet].mastery2;
    
    let facet_ability_check_str = ROLL_TYPES[WEAVING_TYPES[weaving_type][proficiency_level]];
    facet_ability_check_str += " + " + FACET_ABILITIES[chosen_facet].mod.toString();
    if(FACET_ABILITIES[chosen_facet].proficient) facet_ability_check_str += " + " + FACET_ABILITIES[chosen_facet].prof.toString();
    
    if("none" === ROLL_TYPES[WEAVING_TYPES[weaving_type][proficiency_level]]) {
      facet_ability_check_str = "none";
    }
    
    if(0 === spell_level && 
       0 === total_modifications && 
       0 === num_enhancements) {
        facet_ability_check_str = "none";
    }
        
    // update html text displaying the totals
    $('#DC').text(dc_str + " = " + dc_total.toString());
    $('#SpellPoints').text(spell_points_str + " = " + spell_points_total.toString());
    $('#FacetAbilityCheck').text(facet_ability_check_str);
    
    
  }
  
  $('.Selection').change( function() { 
    //console.log("Selection changed.");
    recalculate(); 
  });
  
  $(document).ready(function() {
    //console.log("Document ready");
    recalculate();
  });
  
</script>
`;

const html_dialog = 
`
${html_facet_summary}
<form>
<hr>
${html_choices}
<hr>
${html_calculations}
</form>
${html_script}
`;

let res = await dialogPromise(html_dialog);

if("Cancel" === res || "Close" === res) return;


let userInput = {
  facet: res.find('[id=SpellFacetSelection]')[0].value,
  level: parseInt( res.find('[id=SpellLevelSelection]')[0].value ),
  type: res.find('[id=WeaveTypeSelection]')[0].value,
  num_modifications: parseInt( res.find('[id=SpellModificationSelection]')[0].value ),
  num_enhancements: parseInt( res.find('[id=SpellEnhancementSelection]')[0].value ),
  num_mirrors: parseInt( res.find('[id=SpellMirrorSelection]')[0].value ),  
  num_attempts: parseInt( res.find('[id=AttemptSelection]')[0].value )
};
console.log(userInput);



// DC: 10 + spell level + mods + enhancements 
const total_modifications = userInput.num_modifications + userInput.num_mirrors;
const facet_ability_dc = 10 + userInput.level + total_modifications + userInput.num_enhancements - (userInput.num_attempts - 1);

// Points
let spell_points_needed = SPELLWEAVER_POINTS.spells[userInput.level] + SPELLWEAVER_POINTS.modifications[total_modifications] + SPELLWEAVER_POINTS.enhancements[userInput.num_enhancements];

if(userInput.num_mirrors > 0) spell_points_needed += (spell_points_needed * userInput.num_mirrors);




if(actualSpellPoints < spell_points_needed) {
  console.log(`Need ${spell_points_needed} spell points; only have ${actualSpellPoints} points.`);
  let spellPointCheckDialog = await Dialog.confirm({
       title: "Spellweaver Facet Ability Check",
       content: `<p>${chosen_actor_name} only has ${actualSpellPoints} but needs ${spell_points_needed} points for a successful weaving. Weave anyway?</p>`,
       yes: () => true,
       no: () => false,
       defaultYes: false,
       rejectClose: true
      });
      
  console.log(spellPointCheckDialog);
  
  if(!spellPointCheckDialog) return;
  
}



const proficiency_level = FACET_ABILITIES[userInput.facet].proficient + 
                              FACET_ABILITIES[userInput.facet].specialized +
                              FACET_ABILITIES[userInput.facet].mastery1 +
                              FACET_ABILITIES[userInput.facet].mastery2;
    
const facet_roll_type = WEAVING_TYPES[userInput.type][proficiency_level];

let successful_weaving = false;
if("none" === facet_roll_type ||
   (0 === total_modifications &&
    0 === userInput.num_enhancements &&
    0 === userInput.level)) {
  console.log("No DC check needed.");
  successful_weaving = true;
} else {
  console.log("Rolling DC " + facet_ability_dc);
  
  // Roll the DC
  let parts = [`@data.data.abilities.${FACETS[userInput.facet]}.mod`];
  if(FACET_ABILITIES[userInput.facet].proficient) parts.push("@data.data.attributes.prof");
  
  let facet_check_flavor = `
  <em>Facet ability check (DC ${facet_ability_dc})</em><br>
  <b>Facet:</b> ${userInput.facet} (${FACETS[userInput.facet]}) | 
  <b>Spell slot level:</b> ${userInput.level}<br>
  `
  
  if(total_modifications > 0) {
    facet_check_flavor += `
    <b>Modifications:</b> ${total_modifications}<br>
    `
  }
  
  if(userInput.num_enhancements > 0) {
    facet_check_flavor += `
    <b>Enhancements:</b> ${userInput.num_enhancements}<br>
    `
  }
  
  if(userInput.num_mirrors > 0) {
   facet_check_flavor += `
    <b>Mirrors:</b> ${userInput.num_mirrors}<br>
    `
  }
  
  if(userInput.num_attempts > 1) {
     facet_check_flavor += `
    <b>Attempt:</b> ${userInput.num_attempts}<br>
    `
  }
  
  facet_check_flavor += `
  <b>Spell points:</b> ${spell_points_needed} <br>
  `
  
  
  let options = { title: "Spellweaver facet ability check",
                  data: selected_token.actor,
                  targetValue: facet_ability_dc,
                  parts: parts,
                  fastForward: true,
                  //halflingLucky: selected_token.actor.data.data.feats.halflingLucky,
                  advantage: "advantage" === facet_roll_type,
                  disadvantage: "disadvantage" === facet_roll_type,
                  flavor: facet_check_flavor
                };
  
  //console.log(options);
  // FACETS[userInput.facet]
  // selected_token.actor.rollAbility
  let facet_roll_result = await game.dnd5e.dice.d20Roll(options);
  //console.log(facet_roll_result);
  
  if(facet_roll_result.total >= facet_ability_dc) {
    successful_weaving = true;
  }
}

console.log("Was weaving successful? " + successful_weaving);
// if successful, subtract spell points
// post message

let spell_points_to_subtract = successful_weaving ? spell_points_needed : 0);

if(USE_SPELL_POINTS_MODULE && successful_weaving) {
 // omit the points for the basic spell level
 let lvl_points = SPELLWEAVER_POINTS.spells[userInput.level];
 spell_points_to_subtract -= lvl_points
}

const new_spell_points_total = Math.max(0, actualSpellPoints - spell_points_to_subtract);


if(new_spell_points_total != actualSpellPoints) {
  console.log(`Updating ${chosen_actor_name} to ${new_spell_points_total} total spell points.`)


	let update_data = {
			data: {
				resources: {
					[spell_points_resource_name]: {
						value: new_spell_points_total
					}
				}
			}
		};


	//console.log(update_data);

	let update_resolution = await selected_token.actor.update(update_data);
	//console.log(update_resolution);

	ui.notifications.info(`Subtracted ${spell_points_to_subtract} spell points from ${chosen_actor_name}.`);
}

