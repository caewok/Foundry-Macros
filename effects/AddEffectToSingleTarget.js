/*
Template to be called when you want to add an effect to a target that is only active
during a specific actor's turn.

For example: Hex lets the caster deal an extra 1d6 damage on a single target. 
  Passing an effect to grant extra damage to an actor can accomplish this.

Generally, use with DAE Macro repeat.
On each of your turns, call a macro that calls this template, placing the specified effect on the target for 1 turn (i.e., for your turn.)
*/

/*
 * Args
 * [0] "on", "each", or "off" per DAE
 * [1] DAE last arg object with actorId, origin, tokenId
 * [2] effect data to apply
 */

const MACRO_ID = "macro_add_temp_to_target";
const FORCE_DEBUG = true;
const GM_ACTIVE_EFFECT_MACRO = "ActiveEffect"; 

log("args", args);

const user_actorId = args[1].actorId;
const user_origin = args[1].origin;
const user_tokenId = args[1].tokenId;

const user_actorD = game.actors.get(user_actorId);
const user_tokenD = canvas.tokens.get(user_tokenId);

log("user_actorD", user_actorD);
log("user_tokenD", user_tokenD);


if(args[0] === "on") {
  // get the target from the current user
  // default to currently selected, if any
	// if no target or multiple targets selected, ask.
	const current_targets = Array.from(game.user.targets);
  log("current_targets", current_targets);
	
	// list of possible targets
	// if actor is pc, then visible npcs
	// if actor is npc, then all
	//if(user_actorD.data.type === "pc") {
	const possible_targets = canvas.tokens.placeables.filter(t => t.id !== user_tokenId && t.actor.data.type === "npc" && t.visible);
	//} else {
	 // targets = canvas.tokens.placeables.filter(t => t.id !== user_tokenId && t.actor.data.type === "pc");
	//}
	
	const default_target_id = (current_targets.length > 0) ? current_targets[0].id : possible_targets[0].id;
		  
	log("possible_targets", possible_targets);

	const labels = possible_targets.map(t => `<img src="${t.data.img}" width="30" height="30" style="border:0px"> ${t.data.name}`);
	const possible_target_ids = possible_targets.map(t => t.id);
	
	log(`possible_target_ids ${possible_target_ids}; default_target_id ${default_target_id}`);
	
	const res = await SelectionDialog(labels, {ids: possible_target_ids, 
	                                           prompt: "Select a single target.",
	                                           default_selection: default_target_id});
	const target_id_chosen = res[0];
	log(`target_id_chosen is ${target_id_chosen}`);

	// set a flag on the user token to record the current target
	await user_tokenD.setFlag("world", MACRO_ID + "target_id_chosen", target_id_chosen);
	
	// check if it is the current actor's turn and set the active effect accordingly
	if(game.combat.current.tokenId === user_tokenId) {
	  log("User is the current combatant; adding the effect now.");
	  args[0] = "each";
	}
} 

if(args[0] === "each") {
  // adding the effect on turn 1 with duration of turns: 1 will cause the effect 
  // to be deleted on turn 3.
  // Avoid by setting the effect to have started the turn prior.
  const effectData = args[2];
  setProperty(effectData, "duration.startTurn", game.combat.current.turn - 1);
  setProperty(effectData, "duration.startRound", game.combat.current.round);
  setProperty(effectData, "duration.turns", 1);

  // get the flag for the target; set the effect on the target
  const target_id_chosen = user_tokenD.getFlag("world", MACRO_ID + "target_id_chosen");
  const ActiveEffect = game.macros.getName(GM_ACTIVE_EFFECT_MACRO);
  ActiveEffect.execute(target_id_chosen, args[2], "add");

} else if(args[0] === "off") {
  // remove the flag
  user_tokenD.unsetFlag("world", MACRO_ID + "target_id_chosen");
  
  // remove the feature from the actor
  const origin_re = /OwnedItem[.](.*)/;
  log('RegEx', args[1].origin.match(origin_re));
  
  const item_id = args[1].origin.match(origin_re)[1];
  log(`item_id is ${item_id}`);
  
  await user_actorD.deleteOwnedItem(item_id);
}


// for macro repeat, will run with arg[0] === "each".
// args[1].origin "Actor.vYwDzcVDjHjbN4VT.OwnedItem.QNRziHmpDxCd0LIP"
// user_actorD.getOwnedItem(id);


/**
 * Logging function 
 * Only logs when FORCE_DEBUG is set
 * Adds an id to the console message.
 */
function log(...args) {
  try {
    if(FORCE_DEBUG) {
      console.log(MACRO_ID, '|', ...args);
    }
  } catch (e) {}
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
 * @param labels Array of strings with option labels from which to choose
 * @param ids Array of strings corresponding to a unique id for each option. Optional; defaults to labels.
 * @param prompt Intro prompt. Optional.
 * @param default_selection Array of strings naming ids that should be checked as default. Optional.
 * @param disabled Array of strings naming ids that should be disabled. Optional.
 * @param type "radio", "checkbox", etc. Optional.
 * @param limit Number of items to select. Optional. Non-functional for radio input.
 * @return array of ids chosen (may be 1)
*/
async function SelectionDialog(labels, 
                                { ids = [],
                                  prompt = "", 
                                  default_selection = [],
                                  disabled = [], 
                                  type = "radio", 
                                  limit = 0 } = {} ) {
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
	ids.forEach((o, index) => {
	  
	  const disabled_text = disabled.includes(o) ? "disabled" : "";
	  const disabled_label = disabled.includes(o) ? `style="color:#757575;"` : ``;
	  const default_checked = default_selection.includes(o) ? "checked" : "";
	  const the_label = labels[index];
	  
		const tblRow = 
			`
			<tr class="selection_row">
				<td> <input type="${type}" name="Selection" class="Selection" id="${o}" ${disabled_text} ${default_checked}> </td>
				<td> <label for="${o}" ${disabled_label}>${the_label} </label> </td>
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