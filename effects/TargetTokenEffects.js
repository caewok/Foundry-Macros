/*
This will call the macro "macro_name" with args[0] = "on" and the rest of ...args passed through to the macro when the effects are applied to a target token. It will be called with args[0] = "off" when the active effect is deleted from the target actor.
In addition to the standard @values the following are supported (only as macro argruments)
@target will pass the token id of the targeted token
@scene will pass the scene id of the scene on which the user who activated the effect is located.
@item will pass the item data of the item that was used in the activation
@spellLevel if using midi qol this will be the spell level the spell was cast at.
@item.level if using midi qol this will be the spell level the spell was cast at.
@damage The total damage rolled for the attack
@token The id of the token that used the item
@actor The actor.data for the actor that used the item.
@FIELD`` The value of the FIELD within the actor that used the item, e.g. @abilities.str.mod.   @Unique``` A randomly generated unique id.
*/

/*
This macro will apply an active effect to a single target only on the actor's turn.
Useful where the actor has a feature that grants it advantage on a single target.
Essentially, the macro enables the effect whenever it is the actor's turn and the 
user is targeting the selected target. 
*/

// for flags to avoid overlaps
const FLAG_PREFIX = "macro_targettokeneffects_";

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
async function SelectionDialog(labels, { ids = [], prompt = "", disabled = [], type = "radio", limit = 0, checked_index = -1 } = {}) {
  if(isEmpty(ids)) ids = labels;
  
  
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
	labels.forEach((l, index) => {
	  
	  const disabled_text = disabled.includes(l) ? "disabled" : "";
	  const disabled_label = disabled.includes(l) ? `style="color:#757575;"` : ``;
	  const checked = checked_index === index ? "checked" : "";
		const tblRow = 
			`
			<tr class="selection_row">
				<td> <input type="${type}" name="Selection" class="Selection" id="${ids[index]}" ${disabled_text} ${checked}></td>
				<td> <label for="${ids[index]}" ${disabled_label}>${l} </label> </td>
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
				console.log("User cancelled.");
				return "CANCELED";
			} else if("Closed" == res) {
				console.log("User closed");
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


/**
 * Function for targetToken hook.
 * @param user The active user
 * @param token The token targeted
 * @param targeted Boolean as to whether target was selected or deselected.
 */
function AdvantageTarget(user, token, targeted) {
	console.log("DAE Macro hook user", user);
	console.log("DAE Macro hook token", token);
	console.log("DAE Macro hook targeted", targeted);
	console.log("DAE Macro hook target_id", the_target_id);
}

/** 
 * Function for preUpdateCombat or updateCombat hooks
 * @param combat_arr Array of length 4 with
 *   0: combat class object
 *   1: {_id, turn} id of the combat object? 
 *   2: {advanceTime: 0, diff: true}
 *   3: id string of the combat object
 */
/* e.g.
Array(4) [ {…}, {…}, {…}, "YizVbEtN3R0MhWGN" ]​
0: Object { _data: {…}, data: {…}, _soundPlaying: false, … }
	_data: Object { _id: "LaNPgL2Z84Vz1dVc", sort: 100001, scene: "pY0JKdBvGzxjcaGC", … }
	_soundPlaying: false
	apps: Object {  }
	compendium: null
	current: Object { round: 2, turn: 2, tokenId: "sVyRZO3COZGaFndj" }
		round: 2
		tokenId: "sVyRZO3COZGaFndj"
		turn: 2
		<prototype>: Object { … }​
	data: Object { _id: "LaNPgL2Z84Vz1dVc", sort: 100001, scene: "pY0JKdBvGzxjcaGC", … }
	options: Object {  }
	previous: Object { round: 2, turn: 2, tokenId: "sVyRZO3COZGaFndj" }
	turns: Array(5) [ {…}, {…}, {…}, … ]
		0: Object { _id: "NfsOSPvc4n928fVK", tokenId: "600kRor35wIrMcEi", initiative: 10, … }
		1: Object { _id: "0QckzC7EI2V15aF3", tokenId: "eLPmbwEYetgxpDH1", initiative: 10, … }
		2: Object { _id: "ER9xRtoZovwmTuuN", tokenId: "sVyRZO3COZGaFndj", initiative: 18, … }
		3: Object { _id: "vKpH2gomXSTyR1U0", tokenId: "2z5bDiocmnuXkfSk", initiative: 19, … }
		4: Object { _id: "GSdNNwvZSIAvoCNi", tokenId: "ctjVC1mMrE3k4DUE", hidden: false, … }
		length: 5
		<prototype>: Array []
		<prototype>: Object { … }
1: Object { turn: 1, _id: "LaNPgL2Z84Vz1dVc" }
2: Object { diff: true, advanceTime: 0 }
3: "YizVbEtN3R0MhWGN"
length: 4
*/
function preUpdateCombatTargets(combat, changed) {
  console.log(`DAE Macro hooks combat round ${combat.current.round} turn ${combat.current.turn}`, combat);
  console.log(`DAE Macro hooks changed turn ${changed.turn} id ${changed._id}`, changed);
  
  const upcoming_round = changed.round ? changed.round : combat.current.round;
  const upcoming_turn = changed.turn ? changed.turn : combat.current.turn;
  
  const tokenD = canvas.tokens.get(combat.turns[upcoming_turn].tokenId);
  console.log("DAE Macro hooks tokenD", tokenD)
  const target_id = tokenD.getFlag("world", FLAG_PREFIX + "the_target_id");
  console.log("DAE Macro hooks target_id", target_id);
  
  
  if(!isEmpty(target_id)) {
    const targetD = canvas.tokens.get(target_id);
    console.log(`DAE Macro hooks|round ${upcoming_round}, turn ${upcoming_turn} (${combat.turns[upcoming_turn].name}): turning on effects for ${target_id} (${targetD.data.name}).`);
    // turn on effects to last only this turn
    
  } else {
    console.log(`DAE Macro hooks|nothing to do for round ${upcoming_round}, turn ${upcoming_turn} (${combat.turns[upcoming_turn].name}).`);
    // cannot turn off manually without some other method to pass the target id to the combat tracker 
    
  }
}

function updateCombatantTargets(context, parentId, data) {
  console.log("DAE Macro hooks updateCombatantTargets context", context);
  console.log("DAE Macro hooks updateCombatantTargets parentId", parentId);
  console.log("DAE Macro hooks updateCombatantTargets data", data);

}





console.log("Called DAE macro with args", args);

const user_actorId = args[1].actorId;
const user_origin = args[1].origin;
const user_tokenId = args[1].tokenId;

const user_actorD = game.actors.get(user_actorId);
const user_tokenD = canvas.tokens.get(user_tokenId);



if(args[0] == "on") {
  console.log("Starting DAE macro.");

	console.log("DAE Macro user_actorD", user_actorD);
	console.log("DAE Macro user_tokenD", user_tokenD);
	
	// get the target from the current user
	// if no target or multiple targets selected, ask.
	let targets = Array.from(game.user.targets);
	let the_target_id = "";
	if(targets.length !== 1) {
	  targets = canvas.tokens.placeables.filter(t => t.id !== user_tokenId && t.actor.data.type === "npc" && t.visible);
	  
	  console.log("DAE Macro targets", targets);
	  
	  const labels = targets.map(t => `<img src="${t.data.img}" width="30" height="30" style="border:0px"> ${t.data.name}`);
	  const target_ids = targets.map(t => t.id);
	  
	  const res = await SelectionDialog(labels, {ids: target_ids, prompt: "Select a single target."});
	  console.log("DAE Macro selection res", res);
	  the_target_id = res[0];
	  
	} else {
	  the_target_id = targets[0].id
	}
	console.log("DAE Macro the_target_id", the_target_id);
	
	// set a flag on the user token to record the current target and current user token
	await user_tokenD.setFlag("world", FLAG_PREFIX + "the_target_id", the_target_id);
	
	
	// CONFIG.debug.hooks = true;
	// Hooks._hooks.preUpdateCombat
	const hook_id = Hooks.on("preUpdateCombat", preUpdateCombatTargets);
	console.log(`DAE Macro hook id ${hook_id}.`);
	
	// set a flag on the user token to store the hook id
	await user_tokenD.setFlag("world", FLAG_PREFIX + "hook_id", hook_id);
	
	//const combantant_hook_id = Hooks.on("updateCombantant", updateCombatantTargets);
	//console.log(`DAE Macro combantant_hook_id ${combantant_hook_id}.`);
	
	//Hooks.on("updateCombat", UpdateCombatTargets);
	//Hooks.on("targetToken", AdvantageTarget);
	

}  else {
  console.log("Stopping DAE Macro");
  //Hooks.off("targetToken", AdvantageTarget);
  //Hooks.off("preUpdateCombat", preUpdateCombatTargets); // why doesn't this work? b/c strict equality; the function is defined once for on and once for off.
  
  // use the actor id to retrieve the flag and turn off the hook
  const hook_id = tokenD.getFlag("world", FLAG_PREFIX + "hook_id");
  Hooks.off("preUpdateCombat", hook_id);
  
  // remove the flags from the token
  tokenD.unsetFlag("world", FLAG_PREFIX + "hook_id");
  tokenD.unsetFlag("world", FLAG_PREFIX + "the_target_id");
  
  // remove the temporary feature
  
}





/*

if (args[0] === "on" || args[0] === "each") {

    const lastArg = args[args.length - 1];
    let tactor;
    if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
    else tactor = game.actors.get(lastArg.actorId);
    const target = canvas.tokens.get(lastArg.tokenId)

    const flavor = `${CONFIG.DND5E.abilities["dex"]} CD${args[1]} Grease`;
    let saveRoll = (await tactor.rollAbilitySave("dex", { flavor }))?.total;
    if (saveRoll < args[1]) {
        game.cub.addCondition("Prone", target)
    }
}

*/



