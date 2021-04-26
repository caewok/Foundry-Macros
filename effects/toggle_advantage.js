// Dialog to toggle advantage on one or more targets. 
// Relies on DAE.
// Advantage: advantage for all types. 
// All attack/damage/saves/checks/skill/deathSaves rolls have advantage
// Or disadvantage or disable

// Needs an ActiveEffect macro to apply the effect using GM macro
const ACTIVE_EFFECT_MACRO_NAME = "ActiveEffect"

// ----------------
// Functions

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
 * @param ids Array of strings corresponding to a unique id for each option. Optional.
 * @param prompt Intro prompt. Optional.
 * @param default_selection Array of strings naming options that should be checked as default. Optional.
 * @param disabled Array of strings naming options that should be disabled. Optional.
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
	labels.forEach((o, index) => {
	  
	  const disabled_text = disabled.includes(o) ? "disabled" : "";
	  const disabled_label = disabled.includes(o) ? `style="color:#757575;"` : ``;
	  const default_checked = default_selection.includes(o) ? "checked" : "";
	  
		const tblRow = 
			`
			<tr class="selection_row">
				<td> <input type="${type}" name="Selection" class="Selection" id="${ids[index]}" ${disabled_text} ${default_checked}> </td>
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


// ----------------
// DAE definitions
// mode is probably Custom (0), Multiply (1), Add (2), Downgrade (3), Upgrade (4), Override (5)
const advantageDAE = {
  "label": "Advantage All",
  "flags": {
     dae: {
       transfer: true,
       stackable: false   
     }
  },
  "changes": [
     {
        "key": "flags.midi-qol.advantage.all",
        "value": 1,
        "priority": 80,
        "mode": 0
     },
  ],
  "icon": "icons/svg/upgrade.svg",
  "source": "Macro: Toggle Advantage",
  "disabled": true
};

const disadvantageDAE = {
  "label": "Disadvantage All",
  "flags": {
     dae: {
       transfer: true,
       stackable: false   
     }
  },
  "changes": [
     {
        "key": "flags.midi-qol.disadvantage.all",
        "value": 1,
        "priority": 80
     },
     
  ],
  "icon": "icons/svg/downgrade.svg",
  "source": "Macro: Toggle Advantage",
  "disabled": true
};

// ----------------
// Main
const targets = Array.from(game.user.targets);

if(targets.length < 1) {
  ui.notifications.error("Toggle Advantage|Need at least 1 target selected.");
  return;
}

console.log("ToggleAdvantageMacro|targets", targets);

let ActiveEffect = game.macros.getName(ACTIVE_EFFECT_MACRO_NAME);

// For each target, display a radio dialog with current value selected.
// need for loop so async works
for(const the_target of targets) {
  console.log("ToggleAdvantageMacro|the_target", the_target);
  
  // pull the actor for the target
  // add covers if not there, in disabled state
  const target_actor = canvas.tokens.get(the_target.data._id).actor;
  console.log("ToggleAdvantageMacro|target_actor", target_actor);
  
  const actor_adv = target_actor.effects.entries.find(ef=> ef.data.label === "Advantage All");
  const actor_disadv = target_actor.effects.entries.find(ef=> ef.data.label === "Disadvantage All");
  
  console.log("ToggleAdvantageMacro|actor_adv", actor_adv);
  console.log("ToggleAdvantageMacro|actor_disadv", actor_disadv);
  
  let has_adv = false;
  if(isEmpty(actor_adv)) {
    await ActiveEffect.execute(the_target.data._id, advantageDAE, "add");
  } else {
    // check if enabled
    has_adv = !actor_adv.data.disabled;
  }
  
  let has_disadv = false;
  if(isEmpty(actor_disadv)) {
    await ActiveEffect.execute(the_target.data._id, disadvantageDAE, "add");
  } else {
    // check if enabled
    has_disadv = !actor_disadv.data.disabled;
  }
  
  
  const default_selection = has_adv ? "Advantage All" : 
                            has_disadv ? "Disadvantage All" : 
                            "Normal";

  const chosen_modifier = (await SelectionDialog(["Normal", 
                                               "Advantage All", 
                                               "Disadvantage All"],
                              { "prompt": `Select advantage/disadvantage for ${the_target.data.name}`,
                                "default_selection": default_selection }))[0];
                              
  console.log(`ToggleAdvantageMacro|${chosen_modifier} selected for ${the_target.data.name}`);      
  
  
  const disable_adv = has_adv && "Advantage All" !== chosen_modifier;
  const disable_disadv = has_disadv && "Disadvantage All" !== chosen_modifier;
  const enable_adv = !has_adv && "Advantage All" === chosen_modifier;
  const enable_disadv = !has_disadv && "Disadvantage All" === chosen_modifier;
                                                   
  if(disable_adv) {
    await ActiveEffect.execute(the_target.data._id, "Advantage All", "disable");
    console.log(`ToggleAdvantageMacro|disabled advantage for ${the_target.data.name}`);
  }
  
  if(disable_disadv) {
    await ActiveEffect.execute(the_target.data._id, "Disadvantage All", "disable");
    console.log(`ToggleAdvantageMacro|disabled disadvantage for ${the_target.data.name}`);
  }
  
  if(enable_adv) {
    await ActiveEffect.execute(the_target.data._id, "Advantage All", "enable");
    console.log(`ToggleAdvantageMacro|enabled advantage for ${the_target.data.name}`);
  }
  
  if(enable_disadv) {
    await ActiveEffect.execute(the_target.data._id, "Disadvantage All", "enable");
    console.log(`ToggleAdvantageMacro|enabled disadvantage for ${the_target.data.name}`);
  }
}


  
  // testing
//   let ActiveEffect = game.macros.getName("ActiveEffect");
// let target = Array.from(game.user.targets)[0];
// await ActiveEffect.execute(target.id, effectData, "add");