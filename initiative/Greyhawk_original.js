// --------------------------------------
// SWITCHES

// TO DO:
// * Pull actor's alert feat, set a default toggle if single actor


// Notes:
// Original greyhawk: OG
// Weapon die greyhawk: DOG
// Revised: RG
// If not indicated, same for all



// Die sides
let ACTION_DIE_SIDES = {
  ranged_attack: "1d4", // OG: 1d4
  movement: "1d6",      // OG: 1d6
  swap_gear: "1d6",     // OG: 1d6
  other_action: "1d6",  // OG: 1d6
  melee_attack: "1d8",  // OG: 1d8
  spell: "1d10"         // OG: 1d10; RG: 1d8
};


// Swap Gear and Other Action are both 1d6, which is duplicative with Movement.
// Switch to 0 or false to drop those or other action selection options.
// Set to 1 or true to use the option.
// Set to a higher integer to add additional options of the same type
let INCLUDE_ACTIONS = {
  ranged_attack: 1,   // OG: 1; DOG, RG: 0
  movement: 1,        // OG: 1
  swap_gear: 1,       // OG: 1; DOG, RG: 0
  other_action: 1,    // OG: 1; DOG, RG: 0
  melee_attack: 1,    // OG: 1; DOG, RG: 0
  cast_spell: 1,      // OG: 1; DOG, RG: 0
  
  // selections for attack die and spell level, respectively
  attack_die: 0,      // OG: 0; DOG, RG: 2  // 2 so that bonus can be different than regular
  spell_level: 0,     // OG: 0; DOG, RG: 2
  
  ability: 0, // select an ability to use for a bonus/penalty   // OG: 0 // for using swashbuckler, etc.
  init_bonus: 1, // add straight bonus or penalty to initiative // OG: 1
  
  // following should only be true or false
  // add check to use the following
  proficiency: false,  // OG: false 
  advantage: true,     // OG: true 
  surprise: true,      // OG: true 
  dexterity: false,    // OG, DOG: false; RG: true
  //alert: true,
};


const DEFAULT_ACTION_VALUES = {
  init_bonus: 1,
  surprise: 10,
  advantage: "normal",  // normal, advantage, disadvantage
  ability: "charisma"
};

//const CHECK_ALERT_FEAT = true;

// const INCLUDE_SWAP_GEAR = false;
// const INCLUDE_OTHER_ACTION = true;


// For dexterity and initiative bonuses, subtract a die roll with sides equal 
// to the sum of the sides. For example, +2 Dex with a +1 other initiative bonus means
// 1d3 will be subtracted from the roll. 
// If the sum is less than 0 (for dexterity or initiative penalties) the roll will be added.
// Switches will be added for Dexterity bonus as well as a selector for another ability bonus
// (for example, the Swashbuckler uses Charisma)
// Initiative bonus and penalty remain. 
// Requires occasional negative initiative values. 
let USE_RANDOM_BONUSES = false; // OG, DOG: false; RG: true





// Only used if USE_REVISED_ATTACK is true
// The value must be a valid die roll command.
// Value will replace ranged_attack or melee_attack die rolls.
// add selected to the <option> bracket if you want a different default value. (or reorganize)
// e.g., <option value="1d8" selected>1d8</option>
const HTML_ATTACK_DIE_OPTIONS = 
`
<option value="1d4">1d4</option>
<option value="1d6">1d6</option>
<option value="1d8">1d8</option>
<option value="1d10">1d10</option>
<option value="1d12">1d12</option>
<option value="2d4">2d4</option>
<option value="2d6">2d6</option>
<option value="2d8">2d8</option>
<option value="2d10">2d10</option>  
<option value="2d12">2d12</option>  
<option value="1">1</option>a
`;

// Only used if USE_USE_REVISED_SPELL is true
// The value must be a valid die roll command.
// Value will be added to the ACTION_DIE_SIDES.spell die roll (e.g., 1d10 + 5 for a fifth level spell)

const HTML_SPELL_DIE_OPTIONS =
`
<option value="0">Cantrip</option>
<option value="1">Level 1</option>
<option value="2">Level 2</option>
<option value="3">Level 3</option>
<option value="4">Level 4</option>
<option value="5">Level 5</option>
<option value="6">Level 6</option>
<option value="7">Level 7</option>
<option value="8">Level 8</option>  
<option value="9">Level 9</option>  
`;



// --------------------------------------


// --------------------------------------
// BASIC 	LOCALIZATION SUPPORT
// Set names and error messages as constants for easier translation
// Thanks https://github.com/foundry-vtt-community/macros/blob/f07330b99ec2bde5818600410528ed452272a956/5e/sneak_attack.js
const errorNoCombatants = 'No combatants found in the combat tracker.';
const errorNoCombatantsOwned = 'No owned combatants found in the combat tracker.';
const errorNoActiveCombatTracker = 'No active combat tracker.';
const confirmButton = 'Confirm';
const cancelButton = 'Cancel';
const titleLabel = 'Greyhawk Initiative';

const allLabel = "All";
const PCsLabel = "PCs";
const NPCsLabel = "Creatures / NPCs";
const creatureNamesLabel = "Creature Names";
const creatureTypesLabel = "Creature Types";

// Language used in the dialog to select combatants
const selectCombatantsHeaderLabel = "Select Combatants";
const selectCombatantsParagraph = 
`Select one or more of the following to set their initiative for this turn.
 <br><em> Selecting more than one will set the same actions for all selected.</em>
`;


// Language used in the dialog to select actions
const selectActionsParagraph = "Please select one or more actions for:";
//const selectActionsBonusParagraph = "Initiative bonus/penalty steps largest die down/up, respectively.";
//const selectActionsAdvDisParagraph = "Advantage/disadvantage causes the largest die to be rolled with disadvantage/advantage, respectively.";
/*const selectActionsMultipleParagraph = 
`
<em>
<b>Multiple Actions.</b> 
If an effect grants you	an additional action without the use of a bonus action, 
you roll an initiative	die	for	only one of	your actions. 
Use the largest die that corresponds to any one of the actions you plan to take.
</em>  
`;*/

// Text in the action selection table and subsequent chat message.
const PHRASES = {
  action: "Action", 
  attack: "Attack",
  ability: "Ability",
  bonus: "Bonus",
  bonus_action: "Bonus Action",
  cast_spell: "Cast Spell",
  melee_attack: "Melee Attack",
  movement: "Movement",
  none: "None",
  other: "Other",
  other_action: "Other Action",
  proficiency: "Proficiency",
  ranged_attack: "Ranged Attack",
  surprise: "Surprise",
  swap_gear: "Swap Gear",
  
  init_bonus: "Initiative Bonus",
  init_penalty: "Initiative Penalty",
  
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
  
  
  normal: "Normal",
  advantage: "Advantage",
  disadvantage: "Disadvantage",
  
  advantage_explanation: "lowest roll for largest die",
  disadvantage_explanation: "highest roll for largest die"
};

const DIALOG_LABELS = {
  ranged_attack: `${PHRASES.ranged_attack} (${ACTION_DIE_SIDES.ranged_attack})`,
  movement: `${PHRASES.movement} (${ACTION_DIE_SIDES.movement})`,
  swap_gear: `${PHRASES.swap_gear} (${ACTION_DIE_SIDES.swap_gear})`,
  other_action: `${PHRASES.other_action} (${ACTION_DIE_SIDES.other_action})`,
  melee_attack: `${PHRASES.melee_attack} (${ACTION_DIE_SIDES.melee_attack})`,
  cast_spell: `${PHRASES.cast_spell} (${ACTION_DIE_SIDES.spell})`
};


/**
 * Selectively add "+" to positive numbers for printing.
 * @n Integer
 * @return String. +n or -n
 */
function bonusNumberString(n) {
  n = parseInt(n);  
  return `${(n >= 0) ? "+":""}${n}`;
}


// --------------------------------------


// --------------------------------------
// FUNCTIONS: SELECTING COMBATANTS
// --------------------------------------

/**
 * Compares combat token list to the currently selected actors.
 * @combatants Array of combatants.
 * @return An array of combatants. Could be empty.
 */
function filterSelectedCombatants(combatants) {
  //console.log("filterSelectedCombatants");
  const actors = canvas.tokens.controlled.map(({ actor }) => actor);
  let combatantsSelected = [];
  let actor_ids = [];
  if(actors.length < 1) {
    return combatantsSelected;
  }
  
  actors.forEach( a => actor_ids.push(a.data.id));
  //console.log(actor_ids);
  combatantsSelected = combatants.filter(c => actor_ids.includes(c.actor.data.id));
  
	return combatantsSelected;
}

/**
 * Partition combatants into NPC vs Player combatants.
 * @combatants. Array of combatants.
 * @return A structure of { npcCombatants, playerCombatants }.
 */
function partitionCombatants(combatants) {
  let playerCombatants = [];
	let npcCombatants = [];
	combatants.forEach( c => {
		if(c.players.length > 0) {
			playerCombatants.push(c);
		} else {
			npcCombatants.push(c);
		}
	});
	
	return { playerCombatants, npcCombatants };
}



// ----------------------------------------------
// Combatant Selection Dialog components
// ----------------------------------------------

/**
 * Create html necessary to display PCs and NPCs.
 * If the NPCs have different groups or names, add those as group selection options.
 * Skip displaying PCs, NPCs, or groups if none are available.
 */
function constructCombatantSelectionHTML(combatants) {
  //console.log(combatants.length + " combatants to partition.");
  const { playerCombatants, npcCombatants } = partitionCombatants(combatants);
  //console.log(playerCombatants.length + " PCs and " + npcCombatants.length + " NPCs.");

  // simplify to names needed
  
  // testing version
  //const PCs = playerCombatants.map(c => ({ id:c.id, name:c.name }));
  //const NPCs = npcCombatants.map(c => ({ id:c.id, name:c.name, groupname:c.groupname, grouptype:c.grouptype}));

  // actual version
  const PCs = playerCombatants.map(c => ({ id:c.id, name:c.name }));
  const NPCs = npcCombatants.map(c => ({ id:c.id, name:c.name, groupname:c.actor.data.token.name, grouptype:c.actor.data.data.details.type.value}));

  let group_names = [];
  let group_types = [];
  
  const include_pcs = PCs.length > 0;
  const include_npcs = NPCs.length > 0;
  
  // create the jquery script elements
  if(NPCs.length > 2) {
    // need the distinct groupings
    group_names = [...new Set(NPCs.map(a => a.groupname))];
    group_types = [...new Set(NPCs.map(a => a.grouptype))];
    
    if(group_names.length < 2) {
      group_names = [];
    }
    
    if(group_types.length < 2) {
      group_names = [];
    }
  }
  
  //console.log("Group names: " + group_names);
  //console.log("Group types: " + group_types);  
  
  const script_html = constructSelectionScript(include_pcs, include_npcs, group_types, group_names);
  
  // create the main html code
  
  // PCs  
  let pc_block_html = "";
  if(include_pcs) {
    let pc_selection_arr = [];
    PCs.forEach(a => pc_selection_arr.push(constructCombatantSelection(a.id, a.name, "PCs")));
    const pc_selection_html = pc_selection_arr.join(" <br> ");
    
		pc_block_html = 
		`
		${combatant_selection_pcs_header}
		${pc_selection_html}
		<br><br>
		`;
	}  
	
	// NPCs, including group selectors if applicable
	// Don't bother with group selectors unless we have at least two distinct groups
	let npc_block_html = "";
	let npc_group_type_block_html = "";
	let npc_group_name_block_html = "";
	if(include_npcs) {
	  let npc_selection_arr = [];
	  NPCs.forEach(a => npc_selection_arr.push(constructCombatantSelection(a.id, a.name, "Creatures", a.grouptype, a.groupname)));
	  const npc_selection_html = npc_selection_arr.join(" <br> ");
	   
	  npc_block_html = 
	  `
	  ${combatant_selection_npcs_header}
		${npc_selection_html}
		<br><br>
	  `
	  if(group_names.length > 1) {
	    let group_name_selection_arr = [];
			group_names.forEach(n => group_name_selection_arr.push(constructGroupingSelection(n, "Name")));
      const group_name_selection_html = group_name_selection_arr.join(" <br> ");
      
      npc_group_name_block_html =
      `
      ${combatant_selection_group_name_header}
			${group_name_selection_html}
			<br><br>
      `;
	  }
	  
	  if(group_types.length > 1) {
	    let group_type_selection_arr = [];
			group_types.forEach(n => group_type_selection_arr.push(constructGroupingSelection(n, "Type")));
      const group_type_selection_html = group_type_selection_arr.join(" <br> ");
      
      npc_group_type_block_html =
      `
      ${combatant_selection_group_type_header}
			${group_type_selection_html}
			<br><br>
      `;
	  }
	}
	
  // set up a two-column body
  // specific PC and NPC selection in left column.
  // Groupings for NPCs in right column
  const html =  
  `
  ${combatant_selection_header_script}
  ${combatant_selection_header_style}
  <body>
    ${combatant_selection_intro}
		<form>
      ${combatant_selection_all}
      <br><br>
			<div class="row">
				<div class="column">
				
				${pc_block_html}
				${npc_block_html}
				
				</div>
  
				<div class="column">
				
				${npc_group_type_block_html}
				${npc_group_name_block_html}
  
				</div>
			</div>
		</form>
  </body>
  ${script_html} 
  `;
  //console.log(html); 

  return html;
}


const combatant_selection_header_script = 
`
<script src="https://code.jquery.com/jquery-3.4.1.js"   
         integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="   
         crossorigin="anonymous"> </script>
`;

const combatant_selection_header_style =
`
<style>
  .row {
    display: flex;
  }

  .column {
    flex: 50%;
  }
</style>
`;

const combatant_selection_all = 
`
<input type="checkbox" id="All" class="AllSelection"/>
<label for="All"><strong> ${allLabel} </strong></label>  
  
&nbsp &nbsp <input type="reset" id="resetButton" class="resetButton">
`;

const combatant_selection_intro = 
`
<p>
  <h3> ${selectCombatantsHeaderLabel}</h3>
  ${selectCombatantsParagraph}
  <br>
</p>
`;

const combatant_selection_pcs_header = 
`
<input type="checkbox" id="PCs" class="GroupSelection"/>
<label for="PCs"><strong> ${PCsLabel} </strong></label>
<hr width=100 align="left">
`;

const combatant_selection_npcs_header = 
`
<input type="checkbox" id="Creatures" class="GroupSelection"/>
<label for="Creatures"><strong> ${NPCsLabel} </strong></label>
<hr width=100 align="left">
`;

// to line up the horizontal correctly, keep the checkbox but make invisible
// checkbox for all creature types is redundant, and causes problems with active updating.
const combatant_selection_group_name_header = 
`
<input type="checkbox" id="CreatureNames" class="GroupSelection" style="visibility:hidden"/>
<label for="CreatureNames"><strong> ${creatureNamesLabel} </strong></label>
<hr width=150 align="left">
`;

const combatant_selection_group_type_header = 
`
<input type="checkbox" id="CreatureTypes" class="GroupSelection" style="visibility:hidden"/>
<label for="CreatureTypes"><strong> ${creatureTypesLabel} </strong></label>
<hr width=150 align="left">
`;


/**
 * Create html block for selecting a combatant.
 * @combatantID Combat tracker string id for the combatant.
 * @combatantName Name for the combatant.
 * @combatantGroup PCs or Creatures.
 * @data_type Does the combatant belong to a Type group (e.g., humanoid, undead)?
 * @data_name Does the combatant belong to a Name group (e.g., skeleton to combine Skeleton1, Skeleton2, etc.)
 * @return html block
 */
function constructCombatantSelection(combatantID, combatantName, combatantGroup = "PCs", data_type = "", data_name = "") {

  console.log("data_type", data_type);
  data_type = data_type.split(" ").join("");
  data_name = data_name.split(" ").join("");

  if("" != data_type) {
    data_type = ` data-type="${data_type}"`
  }
  
  if("" != data_name) {
    data_name = ` data-name="${data_name}"`
  }

  const html =
  `<input type="checkbox" id="${combatantID}" class="${combatantGroup}Selection"${data_type}${data_name}/>
  <label for="${combatantID}">${combatantName}</label> 
  `;
  return html;
}

/**
 * Create html block for selecting a group of combatants.
 * @label Group label (e.g. undead, humanoid, skeleton)
 * @type Name or Type
 * @return html block.
 */
function constructGroupingSelection(label, type = "Name") {
  console.log("label", label)
  type = type.split(" ").join("");
  const label_clean = label.split(" ").join("");

  const html = 
  `
  <input type="checkbox" id="${type}${label_clean}" class="${type}Selection"/>
  <label for="${type}${label_clean}">${label}</label>
  `;
  
  return html;
}

/**
 * Create the jQuery necessary to check and uncheck by group or all.
 * User can select "All" to select all combatants.
 * Select a category name (e.g. PCs) to select all in that category.
 * Can select group types or names for NPCs.
 * @includePCs true if the script should include PC selection code.
 * @includeCreatures true if the script should include NPC/Creature selection code.
 * @groupTypes String array of group types.
 * @groupNames String array of group names.
 * @return script html block
 */
function constructSelectionScript(includePCs, includeCreatures, groupTypes, groupNames) {
  let pc_js = "";
  let pc_check_js = "";
  let pc_uncheck_js = "";
  
  let creature_js = "";
  let creature_check_js = "";
  let creature_uncheck_js = "";
  
  var group_names_js = "";
  let group_names_check_js = "";
  let group_names_uncheck_js = "";
  
  var group_types_js = "";
  let group_types_check_js = "";
  let group_types_uncheck_js = "";
  
  let includeGroupTypes = groupTypes.length > 0;
  let includeGroupNames = groupNames.length > 0;
  
//   console.log("Groups:");
//   console.log(groupTypes);
//   console.log(groupNames);
   
  if(includePCs) {
    pc_js = 
    `  
    $('#PCs').change( function() {
    //console.log("PCs");
    if($(this).is(':checked')) {
      //console.log("\tchecked");
      $('.PCsSelection').prop('checked', true);
      
    } else {
      //console.log("\tunchecked");
      $('.PCsSelection').prop('checked', false);
    }
    });
    
    `;
    pc_check_js = `$('#PCs,.PCsSelection').prop('checked', true);`;
    pc_uncheck_js = `$('#PCs,.PCsSelection').prop('checked', false);`;
  }  
  
  if(includeGroupTypes) {
    group_types_check_js = `$('.TypeSelection').prop('checked', true);`;
    group_types_uncheck_js = `$('.TypeSelection').prop('checked', false);`;
    
    console.log(`groupTypes:`, groupTypes);
    // in dnd5e 1.4, the groupTypes are objects with names: value, swarm, subtype, custom
    
    groupTypes.forEach( g => {
      g = g.split(" ").join("");
    
      group_types_js = group_types_js + 
      `
			$('#Type${g}').change( function() {
			//console.log("Type${g}");
			if($(this).is(':checked')) {
				//console.log("\tchecked");
				$('*[data-type="${g}"]').prop('checked', true);
			
			} else {
				//console.log("\tunchecked");
				$('*[data-type="${g}"]').prop('checked', false);
				$('#Creatures').prop('checked', false);
			}
			});
      `;
    });
  }
  
  if(includeGroupNames) {
    group_names_check_js = `$('.NameSelection').prop('checked', true);`;
    group_names_uncheck_js = `$('.NameSelection').prop('checked', false);`;
    
     console.log(`groupNames:`, groupNames);
		groupNames.forEach(g => {
		  g = g.split(" ").join("");
		 
      group_names_js = group_names_js + 
      `
			$('#Name${g}').change( function() {
			//console.log("Name${g}");
			if($(this).is(':checked')) {
				//console.log("\tchecked");
				$('*[data-name="${g}"]').prop('checked', true);
			
			} else {
				//console.log("\tunchecked");
				$('*[data-name="${g}"]').prop('checked', false);
				$('#Creatures').prop('checked', false);
			}
			});
      `;
    });
  }
  
  if(includeCreatures) {
    creature_check_js = `$('#Creatures, .CreaturesSelection').prop('checked', true);`;
    creature_uncheck_js = `$('#Creatures, .CreaturesSelection').prop('checked', false);`;
    creature_js =
    `
    $('#Creatures').change( function() {
			//console.log("Creatures");
			if($(this).is(':checked')) {
				//console.log("\tchecked");
				$('.CreaturesSelection').prop('checked', true);
			  ${group_types_check_js}
				${group_names_check_js}
			
			} else {
				//console.log("\tunchecked");
				$('.CreaturesSelection').prop('checked', false);
				${group_types_uncheck_js}
				${group_names_uncheck_js}
			}
    });
    `;
  }
  
  const all_js = 
  `
  $('#All').change( function() {
    //console.log("All");
    if($(this).is(':checked')) {
      //console.log("\tchecked");
      $('#PCs,.PCsSelection').prop('checked', true);
      ${creature_check_js}
      ${group_types_check_js}
      ${group_names_check_js}
    } else {
      //console.log("\tunchecked");
      $('#PCs,.PCsSelection').prop('checked', false);
      ${creature_uncheck_js}
      ${group_types_uncheck_js}
      ${group_names_uncheck_js}     
    }
  });
  `;

	const html = 
	`
	 <script>
	   ${all_js}
	   ${pc_js}
	   ${creature_js}
	   ${group_names_js}
	   ${group_types_js}	   
	 </script>
	`;
  return html;
}


// Code for testing creature selection
/*
var html = constructSelectionScript(true, // includePCs
	                                  true, // includeCreatures
	                                  ["undead", "humanoid", "monstrosity"], 
	                                  ["skeleton", "goblin"]);


console.log(html);
*/

/*

const PCs = [{ id:"1A1", name:"PC1",  players:[1,2,3]}, 
             { id:"2B2", name: "PC2", players:[1,2,3]}];
             
const NPCs = [{ id:"3C3", name:"Bad Skeleton",  grouptype:"undead",      groupname:"Skeleton", players:[]},
              { id:"4C4", name:"Good Skeleton", grouptype:"undead",      groupname:"Skeleton", players:[]},
              { id:"5C5", name:"Big Dragon",    grouptype:"monstrosity", groupname:"Dragon",   players:[]}];
//console.log(PCs.concat(NPCs));
//const NPCmapping = NPCs.map(c => ({ id:c.id, name:c.name }));
//console.log(NPCmapping);
//const combatants = PCs.concat(NPCs);
//const { playerCombatants, npcCombatants } = partitionCombatants(combatants);

//console.log(combatants[0].players.length)
//console.log(playerCombatants);
//console.log(npcCombatants);

const html = constructCombatantSelectionHTML(PCs.concat(NPCs));

console.log(html);
*/

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
function dialogCallback(content, callbackFn) {
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
 * Pull id from array of PCs and NPCs.
 * @PCSelection Array of PC combatants.
 * @CreatureSelection Array of NPC combatants.
 * @return Array of string ids.
 */
function getSelectionIDs(PCSelection, CreatureSelection) {
  //console.log(PCSelection.length + " PC selection objects.");
  //console.log(CreatureSelection.length + " NPC selection objects.");
  
  let ids = [];
  
  
  PCSelection.each( function(index, element) {
    //console.log("Value: " + element.value); // on
    //console.log("Text: " + element.text); // undefined
    //console.log("Id: " + element.id); // string of letters, numbers
    //console.log("Checked: " + element.checked); // true or false
  
    if(element.checked) {
      ids.push(element.id);
    }
  });

  CreatureSelection.each( function(index, element) {
    //console.log("Value: " + element.value); // on
    //console.log("Text: " + element.text); // undefined
    //console.log("Id: " + element.id); // string of letters, numbers
    //console.log("Checked: " + element.checked); // true or false
  
    if(element.checked) {
      ids.push(element.id);
    }
  });
  
  //console.log(ids.length + " ids checked: " + ids);

  return(ids);
}

// --------------------------------------
// FUNCTIONS FOR SELECTING ACTIONS
// --------------------------------------

/**
 * Combine an array of strings.
 * Create a comma-delimited list of unique strings, with number of repeats indicated.
 * For example: Skeleton (x3), Bear (x2), PC
 * @names Array of string names.
 * @return a single combined string.
 */
function combineElementsToSummaryString(names) {
  // testing
  //const names = ["Skeleton", "Skeleton", "Skeleton", "Bear", "PC", "Bear"];

	let counts = {};
	for (let i = 0; i < names.length; i++) {
    counts[names[i]] = 1 + (counts[names[i]] || 0);
	}
	//console.log(counts);
	//console.log(Object.keys(counts));
	//console.log(Object.values(counts));

	const keys = Object.keys(counts);
	const values = Object.values(counts);

	let names_string = [];
	for(let i = 0; i < keys.length; i++) {
		const c = values[i];
		let str = keys[i];
	
		if(c > 1) {
			str += " (x" + c + ")";    
		}
		names_string.push(str);
	}
	
	const joined_str = names_string.join(", ");
	//console.log(names_string);
	//console.log(joined_str);
	return joined_str;
}


/**
* Create the html code to display choices for selecting Greyhawk Initiative actions.
* Checkboxes for actions; radio buttons for bonus actions; initiative bonus/penalty;
* advantage/disadvantage; other (die command as string)
* @names Names of combatants attributed to these actions, per combineElementsToSummaryString.
* @return html code as string
*/
function constructDialogInitiativeActionsContent(selected_combatants) {
  const combatant_names = combineElementsToSummaryString(selected_combatants.map(c => c.name));
  console.log(selected_combatants.length + " combatants: " + combatant_names);
  
  // actor abilities: combatants[0].actor.data.data.abilities
	// object with six entries: cha, con, dex, int, str, wis
	// object values: mod and prof. 
	// So for dex: combatants[0].actor.data.data.abilities.dex.mod
	let proficiency = "";
	if(INCLUDE_ACTIONS.proficiency) {
	  let prof_bonus_text = "";
	
	  if(selected_combatants.length == 1) {
	    const prof_bonus = parseInt( combatants[0].actor.data.data.attributes.prof );
	  
	    prof_bonus_text = 
	    `
	    &nbsp(${bonusNumberString(prof_bonus)}) 
	    `;
	  
	  }
	
	  proficiency = 
	  `
	  <br><input type="checkbox" id="Proficiency" class="ActionSelection" checked/>
		<label for="Proficiency">${PHRASES.proficiency}${prof_bonus_text}</label>
	  `;
	}
	
	
	let dexterity = "";
	if(INCLUDE_ACTIONS.dexterity) {
	  let dex_bonus_text = "";
	  if(selected_combatants.length == 1) {
	    const dex_bonus = parseInt( combatants[0].actor.data.data.abilities.dex.mod );
	  
	    dex_bonus_text = 
	    `
	    &nbsp(${bonusNumberString(dex_bonus)}) 
	    `;
	  }
	
	  dexterity =
	  `
    <br><input type="checkbox" id="Dexterity" class="ActionSelection" checked/>
		<label for="Dexterity">${PHRASES.dex}${dex_bonus_text}</label>
		`;
	}
	
	let ability = "";
	for(let i = 0; i < INCLUDE_ACTIONS.ability; i++) {
	  const ability_options =
		`
		<option value="str">${PHRASES.str}</option>
		<option value="dex">${PHRASES.dex}</option>
		<option value="con">${PHRASES.con}</option>
		<option value="int">${PHRASES.int}</option>
		<option value="wis">${PHRASES.wis}</option>
		<option value="cha">${PHRASES.cha}</option>
		`;
	
	
	  ability += 
	  `
	  <br><input type="checkbox" id="Ability${i}" class="ActionSelection"/>
		<label for="Ability${i}">${PHRASES.ability}</label>
		<select id="AbilitySelection${i}" name="AbilitySelection{i}">
		${ability_options}
		</select>
	  `;
	}	
	  
  // Add one or more of each row type to the action selections
  // Use the for loop to give a number to each id.
  let row_rangedAttack = "";
  for(let i = 0; i < INCLUDE_ACTIONS.ranged_attack; i++) {
    row_rangedAttack += 
		`
		<tr>
			<td> <input type="checkbox" id="RangedAttack${i}" class="ActionSelection"/></td>
			<td> <label for="RangedAttack${i}">${DIALOG_LABELS.ranged_attack}</label></td>
			<td> <input type="radio" name="BonusAction" id="BonusRangedAttack${i}" class="ActionSelection"/></td>
		</tr>
		`;
  }
  
  let row_movement = "";
  for(let i = 0; i < INCLUDE_ACTIONS.movement; i++) {
    row_rangedAttack += 
		`
		<tr>
			<td> <input type="checkbox" id="Movement${i}" class="ActionSelection"/></td>
			<td> <label for="Movement${i}">${DIALOG_LABELS.movement}</label></td>
			<td> <input type="radio" name="BonusAction" id="BonusMovement${i}" class="ActionSelection"/></td>
		</tr>
		`;
  }
  
  let row_swapGear = "";
  for(let i = 0; i < INCLUDE_ACTIONS.swap_gear; i++) {
    row_swapGear += 
		`
		<tr>
			<td> <input type="checkbox" id="SwapGear${i}" class="ActionSelection"/></td>
			<td> <label for="SwapGear${i}">${DIALOG_LABELS.swap_gear}</label></td>
			<td> <input type="radio" name="BonusAction" id="BonusSwapGear${i}" class="ActionSelection"/></td>
		</tr>
		`;
  }
  
  let row_otherAction = "";
  for(let i = 0; i < INCLUDE_ACTIONS.other_action; i++) {
    row_swapGear += 
		`
		<tr>
			<td> <input type="checkbox" id="OtherAction${i}" class="ActionSelection"/></td>
			<td> <label for="OtherAction${i}">${DIALOG_LABELS.other_action}</label></td>
			<td> <input type="radio" name="BonusAction" id="BonusOtherAction${i}" class="ActionSelection"/></td>
		</tr>
		`;
  }
  
  let row_meleeAttack = "";
  for(let i = 0; i < INCLUDE_ACTIONS.melee_attack; i++) {
    row_meleeAttack += 
		`
		<tr>
			<td> <input type="checkbox" id="MeleeAttack${i}" class="ActionSelection"/></td>
			<td> <label for="MeleeAttack${i}">${DIALOG_LABELS.melee_attack}</label></td>
			<td> <input type="radio" name="BonusAction" id="BonusMeleeAttack${i}" class="ActionSelection"/></td>
		</tr>
		`; 
  }
  
  let row_castSpell = "";
  for(let i = 0; i < INCLUDE_ACTIONS.cast_spell; i++) {
    row_castSpell += 
		`
		<tr>
			<td> <input type="checkbox" id="CastSpell${i}" class="ActionSelection"/></td>
			<td> <label for="CastSpell${i}">${DIALOG_LABELS.cast_spell}</label></td>
			<td> <input type="radio" name="BonusAction" id="BonusCastSpell${i}" class="ActionSelection"/></td>
		</tr>
		`;
  }
  
  let row_attackDie = ""; 
  for(let i = 0; i < INCLUDE_ACTIONS.attack_die; i++) {
    row_attackDie += 
		`
    <tr>
			<td> <input type="checkbox" id="Attack${i}" class="ActionSelection"/></td>
			<td> <label for="Attack${i}">${PHRASES.attack}</label>
				<select id="AttackDie${i}" name="AttackDie{i}">
					${HTML_ATTACK_DIE_OPTIONS}
				</select></td>
			<td> <input type="radio" name="BonusAction" id="BonusAttack${i}" class="ActionSelection"/></td>   
		</tr>
		`;
  }
  
  let row_spellLevel = ""; 
  for(let i = 0; i < INCLUDE_ACTIONS.attack_die; i++) {
    row_spellLevel += 
		`
    <tr>
			<td> <input type="checkbox" id="CastSpellLevel${i}" class="ActionSelection"/></td>
			<td> <label for="CastSpellLevel${i}">${PHRASES.cast_spell}</label>
					<select id="SpellLevel${i}" name="SpellLevel{i}">
					${HTML_SPELL_DIE_OPTIONS}
					</select></td>
	 
		 </td>

		</td>
			<td> <input type="radio" name="BonusAction" id="BonusCastSpellLevel${i}"act class="ActionSelection"/></td>
	 </tr>
	 `;
  }
  
  let initBonus = "";
  for(let i = 0; i < INCLUDE_ACTIONS.init_bonus; i++) {
		initBonus +=
		`
		<br><input type="checkbox" id="InitiativeBonus${i}" class="ActionSelection"/>
		<label for="InitiativeBonus${i}">${PHRASES.init_bonus}</label>
		<input type="number" id="InitiativeBonusNumber${i}" min=-99 max=99 step=1 value=${DEFAULT_ACTION_VALUES.init_bonus}>
		`
  }
  
  let surprise = "";
  if(INCLUDE_ACTIONS.surprise) {
    surprise +=
    `
    <br><input type="checkbox" id="Surprise" class="ActionSelection"/>
		<label for="Surprise">${PHRASES.surprise}</label>
		<input type="number" id="SupriseNumber" min=0 max=99 step=1 value=${DEFAULT_ACTION_VALUES.surprise}>
		`
  }
  
  let advantage = "";
  if(INCLUDE_ACTIONS.advantage) {
    let checked_normal = "";
    let checked_advantage = "";
    let checked_disadvantage = "";
    if(DEFAULT_ACTION_VALUES.advantage == "advantage") {
      checked_advantage = "checked"
    } else if(DEFAULT_ACTION_VALUES.advantage == "disadvantage") {
      checked_disadvantage = "checked"
    } else {
      checked_normal = "checked"
    }
    
    if(selected_combatants.length == 1) {
      const advFlag = selected_combatants[0].actor.getFlag("dnd5e", "initiativeAdv");
      console.log(advFlag);
      if(advFlag) {
        checked_advantage = "checked";
        checked_normal = "";
        checked_disadvantage = "";
      }
    }
    
            
    advantage +=
		`
		<input type="radio" id="Normal" name="AdvDis" class="ActionSelection" ${checked_normal}/>
		<label for="Normal">${PHRASES.normal}</label> 
		<input type="radio" id="Advantage" name="AdvDis" class="ActionSelection" ${checked_advantage}/>
		<label for="Advantage">${PHRASES.advantage}</label> 
		<input type="radio" id="Disadvantage" name="AdvDis" class="ActionSelection" ${checked_disadvantage}/>
		<label for="Disadvantage">${PHRASES.disadvantage}</label> 
		`
  }  
  const dialogInitiativeActionsContent = 
	`
	<h3> ${titleLabel} </h3> 
	<p>${selectActionsParagraph}</p>
	<p><em> ${combatant_names} </em></p>
	<form>
		<table>
			<thead>
					 <tr>
							<th style="text-align:left">${PHRASES.action}</th>
							<th colspan=2 style="text-align:right">${PHRASES.bonus_action}</th>
					 </tr>
			
					 <tr>
						 <td> </td>
						 <td style="text-align:right"> <label for="None">${PHRASES.none}</label></td>
						 <td> <input type="radio" name="BonusAction" id="BonusNone" class="ActionSelection" checked/></td>
					 </tr>
				 
					 ${row_attackDie}
					 ${row_rangedAttack}
					 ${row_movement}
					 ${row_swapGear}
					 ${row_otherAction}
					 ${row_meleeAttack}
					 ${row_castSpell}
					 ${row_spellLevel}
				
					 <tr>
						 <td> <input type="checkbox" id="Other" class="ActionSelection"/> </td>
						 <td colspan=2> <label for="Other">${PHRASES.other}</label> <input type="text" id="OtherText"/></td>
					 
					 </tr>
			
				</table> 
	
    ${initBonus}
		${surprise}
		${dexterity}
		${ability}
		${proficiency}
		<br>
		<br>
		${advantage}
		
		<input type="reset" id="resetButton" class="resetButton">
			</form>
	`;	
		/*
		<p>
			<em>${selectActionsBonusParagraph}</em>
			<br><br>
			<em>${selectActionsAdvDisParagraph}</em> 
			
			<br><br>
			${selectActionsMultipleParagraph}
		</p>
	*/
//	`;
  return dialogInitiativeActionsContent;

}

/** 
 * Roll initiative for one or more ids given a particular die command.
 * @ids Combatant ids string array.
 * @init_roll String corresponding to the die roll command.
 * @actions HTML String corresponding to the actions to be noted in the chat message.
 * @return Nothing.
 */
async function doInitiative(ids, init_roll, actions = "") {
  //console.log("Rolling " + init_roll + " for " + ids);
  const message_options = {
    flavor: "Greyhawk Initiative Roll.<br>" + actions
  };
  
  if(!game.combat) {
    ui.notifications.warn('${errorNoActiveCombatTracker}');
    return;
  }
  await game.combat.rollInitiative(ids, { formula: init_roll, updateTurn: false, messageOptions: message_options } );
  //console.log("Done " + id);
}



/**
 * Determine the various dice needed to accomplish the selected actions.
 * @actionPool One or more actions selected by the user in the action selection dialog.
 * @otherText Any text input by the user, which will be interpreted as dice commands.
 * @initBonus Initiative bonus chosen by user. Assumed to be 0 or more. Only used if Initiative Bonus was checked (in actionSelections).
 * @initPenalty Initiative penalty chosen by user. Assumed to be 0 or more. Only used if Initiative Penalty was checked (in actionSelections). 
 * @surprise Surprise penalty chosen by user. Only used if Surprise was checked (in actionSelections).
 * @return Array of DieRoll objects corresponding to the necessary die rolls required.
 */
function calculateDice(combatant, actionSelections, userInput) {
	console.log("CalculateDice");
	console.log("Combatant " + combatant.id);
	console.log(actionSelections.length + " actionSelections");
	console.log(userInput);
  
  let action_description_array = [];
  
	let die_strings = [];
	let initiative_bonus = 0;
	let advantage_type = "normal";
	
	// Cases:
	// √ rangedAttack: RangedAttack[#] 
	// √ movement: Movement[#]
	// √ swapGear: SwapGear[#]
	// √ otherAction: OtherAction[#] 
	// √ meleeAttack: MeleeAttack[#]
	// √ castSpell: CastSpell[#]
	
	// userInputs:
	// √ attackDie: Attack[#], AttackDie[#] (userInput.attack[])
	// √ spellLevel: CastSpellLevel[#], SpellLevel[#] (userInput.spell[])
	// √ other: Other, OtherText (userInput.other_text)
	// √ initBonus: InitiativeBonus[#], InitiativeBonusNumber[#] (userInput.init_bonus[])
	// √ surprise: Surprise[#], SurpriseNumber# (userInput.surprise)
	
	// combatant-based:
	// dexterity: Dexterity
	// ability: Ability[#], AbilitySelection[#] (userInput.ability[])
	// proficiency: Proficiency
	
	// Other:
	// √ advantage: Normal/Advantage/Disadvantage
   
   		
	const index_regexp = /\d+$/;
	const action_regexp = /^(.*)\d+$/;

	let actionPool_i = [];
	let actions = [];
	// Select only the checked actions
	// separate the number, if any, from the action name
	actionSelections.each(function(index, a) {
	  //console.log(index + ": " + a.id);
	  //console.log(a);
	  if(a.checked) {	  
	    console.log("\tAdding " + a.id);
			actionPool_i.push(parseInt( a.id.match(index_regexp) ));
			actions.push(a.id.replace(action_regexp, '$1'));	
	  }
	
	});
	console.log(actionPool_i);
	console.log(actions);
	
	actions.forEach( (action, i) => {
	  let desc = "";
	  let die = "";
	  let bonus = 0;
	  let spell_level_desc = "";
	  let spell_level_die = "";
	  let chosen_ability = "";
	  
	  // Bonus actions described by Bonus: Action. 
	  if(action.includes("Bonus") && !action.includes("BonusNone")) desc = `${PHRASES.bonus}: `;
	  
	  switch(action) {
	  
	  case 'BonusRangedAttack':  
		case 'RangedAttack':
		  die = ACTION_DIE_SIDES.ranged_attack;		
		  desc += `${DIALOG_LABELS.ranged_attack}`;
		  break;
		  
		case 'BonusMovement':   
		case 'Movement':
		  die = ACTION_DIE_SIDES.movement;
		  desc += `${DIALOG_LABELS.movement}`;
		  break;
		   
		case 'BonusSwapGear':
		case 'SwapGear':
		  die = ACTION_DIE_SIDES.swap_gear;
		  desc += `${DIALOG_LABELS.swap_gear}`;
		  break;
		  
		case 'BonusOtherAction':   
		case 'OtherAction':
		  die = ACTION_DIE_SIDES.other_action;
		  desc += `${DIALOG_LABELS.other_action}`;
		  break;
	
	  case 'BonusMeleeAttack':
		case 'MeleeAttack':
		  die = ACTION_DIE_SIDES.melee_attack;
		  desc += `${DIALOG_LABELS.melee_attack}`;
		  break; 
	  
	  case 'BonusCastSpell':
		case 'CastSpell':
		  desc += `${DIALOG_LABELS.cast_spell}`;
		  die_strings.push(ACTION_DIE_SIDES.spell);
		  break; 
		  
		
		// Cases that require pulling from the userInput data.
		// actionPool_i contains the number of the action. e.g., Attack1 or CastSpellLevel2.
		// The associated user input is that number minus 1 (0-indexed).  
		case 'BonusAttack':
		case 'Attack':
		  die = userInput.attack[actionPool_i[i]];
		  desc += `${PHRASES.attack} (${die})`;
		  break;
		  
		case 'BonusCastSpellLevel':
	  case 'CastSpellLevel':
	    //console.log("i: " + i);
	    //console.log("\tSpell user input index: " + actionPool_i[i]);
	    //console.log(userInput.spell[actionPool_i[i]]);
	    spell_level_die = Object.values(userInput.spell[actionPool_i[i]])[0];
	    console.log("\tSpell Level: " + spell_level_die);
	    
	    if(!isBlank(spell_level_die) & spell_level_die != "0") {
				if(spell_level_die.charAt(1) == "-" || spell_level_die.charAt(1) == "+") {
					// use the existing operator for the spell level die or modifier
					die = ACTION_DIE_SIDES.spell + spell_level_die;
				
				} else {
					// assume addition for the spell level die or modifier
					die = ACTION_DIE_SIDES.spell + " + " + spell_level_die;
				}
	    } else {
	      die = ACTION_DIE_SIDES.spell;
	    }
	    console.log("Spell level die: " + die);
	     	    
	    spell_level_desc = Object.keys(userInput.spell[actionPool_i[i]])[0];
	    console.log("\tSpell description: " + spell_level_desc);
	    desc += `${PHRASES.cast_spell} (${spell_level_desc}) (${die})`;
	    break;
	  
		case 'Other':     
		  die = userInput.other_text;
		  desc += `${PHRASES.other} (${die})`;
		  break;   
	  
	  // Advantage/Disadvantage. Only one should be checked.
	  case 'Advantage':
		  advantage_type = "advantage";
		  desc += `${PHRASES.advantage}`;
		  break;
		case 'Disadvantage':
		  advantage_type = "disadvantage";
		  desc += `${PHRASES.disadvantage}`;
		  break;
	  
	  // Initiative bonuses / penalties
		case 'Surprise':
		  // Surprise is always added as a straight penalty 
		  die = userInput.surprise;
		  desc += `${PHRASES.surprise} (${bonusNumberString(die)})`;	
		  break;
		    
		case 'InitiativeBonus':
		  bonus = userInput.init_bonus[actionPool_i[i]];
		  initiative_bonus += parseInt(bonus);
		  desc += `${PHRASES.init_bonus} (${bonusNumberString(bonus)})`;
		  break;
		
	  // Combatant-specific bonuses/penalties
	  case 'Dexterity':
	    bonus = combatant.actor.data.data.abilities.dex.mod;
	    initiative_bonus += parseInt( bonus );
	    desc += `${PHRASES.dex} (${bonusNumberString(bonus)})`;
	    break;
	  case 'Ability':
	    chosen_ability = userInput.ability[actionPool_i[i]]; // str, dex, con, int, wis, cha
	    console.log("Chosen ability: " + chosen_ability);
      bonus = combatant.actor.data.data.abilities[chosen_ability].mod;
      initiative_bonus += parseInt( bonus );
      desc += `${PHRASES[chosen_ability]} (${bonusNumberString(bonus)})`;  
      break;
    case 'Proficiency':
      bonus = combatant.actor.data.data.attributes.prof;
      console.log("Proficiency: " + bonus);
      initiative_bonus += parseInt( bonus );
      desc += `${PHRASES.proficiency} (${bonusNumberString(bonus)})`;
      break;
	  
		default:
	  }
	  if(!isBlank(die)) die_strings.push(die);
	  if(!isBlank(desc)) action_description_array.push(desc);
  
	}); 
   
	console.log("\tDie strings: ");
	console.log(die_strings);
	console.log("\tDescription: ");
	console.log(action_description_array);
	
	var init_roll = new Roll(die_strings.join("+"));
	console.log(init_roll);
	
	
	// Do adv/dis before init bonus. Otherwise, the init bonus could be largest die. 
	if(advantage_type === "advantage" | advantage_type === "disadvantage") {
	  // find the highest die, roll with disadvantage in order to keep lowest
	  console.log("Applying " + advantage_type + " to initiative roll.");
	  init_roll = greyhawkAdvantageDisadvantage(init_roll, advantage_type);
	}

	if(initiative_bonus != 0) {
	  if(USE_RANDOM_BONUSES) {
	    // lower is better, so subtract if bonus is positive
	    // die sides equal to the absolute value of the bonus. e.g. +3 is -1d3. 
	    console.log("Using random bonus for initiative " + bonusNumberString(initiative_bonus)); 
	    init_roll.terms.push((initiative_bonus > 0 ? "-" : "+"));
	    init_roll.terms.push(new Die({faces: Math.abs(initiative_bonus), number: 1}));
	  
	  } else {
	  
	    console.log("Applying initiative " + (initiative_bonus > 0 ? "bonus " : "penalty ") + initiative_bonus + " to " + (initiative_bonus > 0 ? "largest " : "smallest ") + " die.");
	    init_roll = greyhawkBonus(init_roll, initiative_bonus);
	  }
	
	}
	
	const action_description = "<ul><li>" + action_description_array.join("</li><li>") + "</ul>"; 
	console.log(init_roll.formula);
	console.log(action_description);

	return { init_roll, action_description };
}



/**
 * Test for blank or empty string
 * @str String
 * @return True if object is blank ("") or empty.
 */  
function isBlank(str) {
    // https://stackoverflow.com/questions/154059/how-can-i-check-for-an-empty-undefined-null-string-in-javascript
    const is_blank = (!str || /^\s*$/.test(str));
    //console.log("isBlank? " + is_blank);
    return is_blank;
  }


// --------------------------------------
// Die Roll helper functions
// --------------------------------------
/**
 * For Greyhawk style initiative.
 * Advantage means roll disadvantage on largest die.
 * Disadvantage means roll advantage on largest die.
 * @r Roll class
 * @return The modified Roll class
 */
function greyhawkAdvantageDisadvantage(r, type = "advantage") {
  let dice = r.dice;
  let max = dice.reduce(function(prev, current) {
    if (+current.faces > +prev.faces) {
        return current;
    } else {
        return prev;
    }
  });
  
  const i_adv = max.modifiers.findIndex(value => /^kh/.test(value));
  const i_disadv = max.modifiers.findIndex(value => /^kl/.test(value));
      
  if(i_adv > -1) {
    max.modifiers.splice(i_adv, 1);
    // max.alter(.5); // alter uses parseInt, so it does not understand division.
    // instead, subtract half the dice. Round down to try to get to even number.
    if(max.number > 1) {
      max.alter(1, parseInt(max.number / -2))
    }
  }
  
  if(i_disadv > -1) {
    max.modifiers.splice(i_disadv, 1);
     // max.alter(.5); // alter uses parseInt, so it does not understand division.
    // instead, subtract half the dice. Round down to try to get to even number.
    if(max.number > 1) {
      max.alter(1, parseInt(max.number / -2))
    }
  }
  
  const adv_mod = type === "advantage" ? "kl" : "kh";  
  max.modifiers.push(adv_mod + max.number)
  max = max.alter(2);
  
  return r;
}

/**
 * For Greyhawk-style bonuses.
 * Apply a bonus by decreasing the sides of largest die.
 * Apply a penalty by increasing the sides of smallest die.
 * Sides cannot go below 1, and increase by 2 per bonus.
 * @r Roll class
 * @return The modified roll class
 */
function greyhawkBonus(r, bonus) {
  bonus = parseInt(bonus);
  if(bonus === 0) return(0);
  
  let dice = r.dice;
  if(dice.length === 0) return(r);
  
  let chosen_die = dice.reduce(function(prev, current) {
      if(bonus > 0) {
       // find the largest die
			if (+current.faces > +prev.faces) {
					return current;
			} else {
					return prev;
			}
			
		} else {
		  // find the smallest die
		  if (+current.faces < +prev.faces) {
       return current;
      } else {
        return prev;
      }
		}
    });
  
  
  const new_faces = -bonus * 2;
  chosen_die.faces = Math.max(1, chosen_die.faces + new_faces);
  
  return r;  
}

// --------------------------------------
// MAIN CODE
// --------------------------------------

/**
 * First identify combatants owned by the user.
 * If multiple combatants, ask the user to select one or more.
 * Then ask the user to select actions for the chosen combatants.
 * Actions chosen apply to all combatants selected, but are rolled separately.
 * Finally, do the die rolls and update the initiative in the combat tracker.
 * @combatants One or more combatants from the combat tracker. 
 * @return Nothing.
 */
async function main(selected_combatants) {
	// let selected_combatants = filterSelectedCombatants(combatants);
// 	if(selected_combatants.length < 1) {
// 		//console.log("No selected combatants in combat.");
// 		// use combatants controlled by user instead
// 		selected_combatants = combatants;  
// 	}
	//console.log(selected_combatants.length + " combatants selected/owned.");

  console.log(selected_combatants);
	let ids = [];
	if(selected_combatants.length < 1) {
	  console.log("No combatants found.");
	  return;
	} else if(selected_combatants.length == 1) {
		console.log("Single combatant found.")
		ids = selected_combatants[0].id;
	} else {
		// list by PC / NPC. Groups: type, name. 
		const combatant_selection_html = constructCombatantSelectionHTML(selected_combatants);
		//let PCSelection = [];
		//let CreatureSelection = [];
		console.log(combatant_selection_html);
		
		let res = await dialogPromise(combatant_selection_html);
		//console.log(res);
		if("Cancel" === res) {
			//console.log("User cancelled.");
			return;
		} else if("Closed" == res) {
			//console.log("User closed");
			return;
		} else {
			const PCSelection = (res.find('[class=PCsSelection]'));
			const CreatureSelection = (res.find('[class=CreaturesSelection]'));
			ids = getSelectionIDs(PCSelection, CreatureSelection);
		}
	}
	
	console.log(ids);
	if(isBlank(ids) || ids.length < 1) {
		console.log("No combatants selected.");
		return;
	}

  selected_combatants = selected_combatants.filter(c => (ids.includes(c.id) ));
	console.log(selected_combatants); 



	const initiative_dialog_content = constructDialogInitiativeActionsContent(selected_combatants);
	//console.log(initiative_dialog_content);

	const res = await dialogPromise(initiative_dialog_content);


	const actionSelections = (res.find('[class=ActionSelection]'));
	if(actionSelections.length < 1) {
	  console.log("No actions selected.");
	  return;
	}
	
	
	let userInput = {
	  other_text: res.find('[id=OtherText]')[0].value,
	  surprise: parseInt( res.find('[id=SupriseNumber]')[0].value ),
	  
	  init_bonus: [],
	  attack: [],
	  spell: [],
	  ability: []
	  
	};
	
	// id^= means starts with
	// https://stackoverflow.com/questions/1206739/find-all-elements-on-a-page-whose-element-id-contains-a-certain-text-using-jquer	
	res.find('[id^=AttackDie]').each( function(i, id) {
	  userInput.attack.push(id.value);
	});
	
	res.find('[id^=SpellLevel]').each( function(i, id) {
	  let obj = {}
	  obj[id.options[id.selectedIndex].text] = id.value; // could be integer (e.g., 5) or string (e.g., 1d5)
	  userInput.spell.push(obj);
	});

	res.find('[id^=InitiativeBonusNumber]').each( function(i, id) {
	  userInput.init_bonus.push(parseInt( id.value ));
	});
	
	res.find('[id^=AbilitySelection]').each( function(i, id) {
	  userInput.ability.push(id.value);
	});
	
  
  const selections = [];
  actionSelections.each(s => selections.push(s.id));
  //console.log(actionSelections);
	console.log(userInput);
	
	
// 	constructInitiativeRoll(c, actionSelections, userInput);  var actionPool = [];
//   for(var i = 0; i < actionSelections.length; i++) {
//     //console.log("\t selection id: " + actionSelections[i].id);
//     //console.log("\t selection is checked: " + actionSelections[i].checked);
//     if(actionSelections[i].checked) {
//       //console.log("\tAdding " + actionSelections[i].id)
//       actionPool.push(actionSelections[i].id);
//     }
//   }
	
	// actor abilities: combatants[0].actor.data.data.abilities
	// object with six entries: cha, con, dex, int, str, wis
	// object values: mod and prof. 
	// So for dex: combatants[0].actor.data.data.abilities.dex.mod
	selected_combatants.forEach( c => {
	  console.log(c);
	  console.log("Combatant " + c.id);
	
		let { init_roll, action_description } = calculateDice(c, actionSelections, userInput);
		console.log(init_roll.formula);
		console.log(action_description);
		     
	  doInitiative(c.id, init_roll.formula, action_description);
	});
	
	
	//const { init_roll, action_str } = constructInitiativeRoll(actionSelections, otherText, initBonus, initPenalty, surprise, attackDie, attack2Die, spellLevelDie, spell2LevelDie, spellLevelText, spell2LevelText);

	//console.log(action_str);


	//console.log("Rolling " + init_roll);
	//doInitiative(ids, init_roll, action_str);
	//console.log("Done!");
  
}

// Preliminary checks 
// ------------------
let errorReason = '';
let combatants = game.combat?.combatants;


if(errorReason === '' && !game.combat) {
  errorReason = `${errorNoActiveCombatTracker}`;
} 

if(errorReason === '' && combatants.length < 1) {
  errorReason = `${errorNoCombatants}`;
}

if(errorReason === '') {
  //console.log(combatants.length + " combatants total.");
	combatants = combatants.filter(c => c.owner);
	if(combatants.length < 1) {
	  errorReason = `${errorNoCombatantsOwned}`;
	}
}

// Main
// ----
if(errorReason === '') {
  //console.log(combatants.length + " combatants owned.");
  main(combatants);
 
} else {
  //console.log(`Error: ${errorReason}`);
  ui.notifications.error(`${errorReason}`);
}
