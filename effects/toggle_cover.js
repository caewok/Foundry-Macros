// Dialog to toggle cover on one or more targets. 
// Relies on DAE.
// 1/2 cover: +2 AC, +2 Dex save
// 3/4 cover: +5 AC, +5 Dex save

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
const halfCoverDAE = {
  "label": "1/2 Cover",
  "flags": {
     dae: {
       transfer: true,
       stackable: false   
     }
  },
  "changes": [
     {
        "key": "data.attributes.ac.value",
        "value": 2,
        "priority": 80,
        "mode": 2
     },
     
     {
        "key": "data.abilities.dex.save",
        "value": 2,
        "priority": 80,
        "mode": 2       
     }
  ],
  "icon": "icons/environment/wilderness/wall-ruins.webp",
  "source": "Macro: Toggle Cover",
  "disabled": true
};

const threeQuarterCoverDAE = {
  "label": "3/4 Cover",
  "flags": {
     dae: {
       transfer: true,
       stackable: false   
     }
  },
  "changes": [
     {
        "key": "data.attributes.ac.value",
        "value": 5,
        "priority": 80
     },
     
     {
        "key": "data.abilities.dex.save",
        "value": 5,
        "priority": 80       
     }
  ],
  "icon": "icons/environment/wilderness/wall-ruins.webp",
  "source": "Macro: Toggle Cover",
  "disabled": true
};

// ----------------
// Main
const targets = Array.from(game.user.targets);

if(targets.length < 1) {
  ui.notifications.error("Toggle Cover|Need at least 1 target selected.");
  return;
}

console.log("ToggleCoverMacro|targets", targets);

let ActiveEffect = game.macros.getName(ACTIVE_EFFECT_MACRO_NAME);

// For each target, display a radio dialog with current value selected.
// need for loop so async works
for(const the_target of targets) {
  console.log("ToggleCoverMacro|the_target", the_target);
  
  // pull the actor for the target
  // add covers if not there, in disabled state
  const target_actor = canvas.tokens.get(the_target.data._id).actor;
  console.log("ToggleCoverMacro|target_actor", target_actor);
  
  const actor_half_cover = target_actor.effects.entries.find(ef=> ef.data.label === "1/2 Cover");
  const actor_three_quarter_cover = target_actor.effects.entries.find(ef=> ef.data.label === "3/4 Cover");
  
  console.log("ToggleCoverMacro|actor_half_cover", actor_half_cover);
  console.log("ToggleCoverMacro|actor_three_quarter_cover", actor_three_quarter_cover);
  
  let has_half_cover = false;
  if(isEmpty(actor_half_cover)) {
    await ActiveEffect.execute(the_target.data._id, halfCoverDAE, "add");
  } else {
    // check if enabled
    has_half_cover = !actor_half_cover.data.disabled;
  }
  
  let has_three_quarter_cover = false;
  if(isEmpty(actor_three_quarter_cover)) {
    await ActiveEffect.execute(the_target.data._id, threeQuarterCoverDAE, "add");
  } else {
    // check if enabled
    has_three_quarter_cover = !actor_three_quarter_cover.data.disabled;
  }
  
  
  const default_selection = has_half_cover ? "1/2 Cover" : 
                            has_three_quarter_cover ? "3/4 Cover" : 
                            "No Cover";

  const chosen_cover = (await SelectionDialog(["No Cover", 
                                               "1/2 Cover", 
                                               "3/4 Cover"],
                              { "prompt": `Select cover for ${the_target.data.name}`,
                                "default_selection": default_selection }))[0];
                              
  console.log(`ToggleCoverMacro|${chosen_cover} selected for ${the_target.data.name}`);      
  
  
  const disable_half_cover = has_half_cover && "1/2 Cover" !== chosen_cover;
  const disable_three_quarter_cover = has_three_quarter_cover && "3/4 Cover" !== chosen_cover;
  const enable_half_cover = !has_half_cover && "1/2 Cover" === chosen_cover;
  const enable_three_quarter_cover = !has_three_quarter_cover && "3/4 Cover" === chosen_cover;
                                                   
  if(disable_half_cover) {
    await ActiveEffect.execute(the_target.data._id, "1/2 Cover", "disable");
    console.log(`ToggleCoverMacro|disabled half cover for ${the_target.data.name}`);
  }
  
  if(disable_three_quarter_cover) {
    await ActiveEffect.execute(the_target.data._id, "3/4 Cover", "disable");
    console.log(`ToggleCoverMacro|disabled three-quarter cover for ${the_target.data.name}`);
  }
  
  if(enable_half_cover) {
    await ActiveEffect.execute(the_target.data._id, "1/2 Cover", "enable");
    console.log(`ToggleCoverMacro|enabled half cover for ${the_target.data.name}`);
  }
  
  if(enable_three_quarter_cover) {
    await ActiveEffect.execute(the_target.data._id, "3/4 Cover", "enable");
    console.log(`ToggleCoverMacro|enabled three-quarter cover for ${the_target.data.name}`);
  }
}


  
  // testing
//   let ActiveEffect = game.macros.getName("ActiveEffect");
// let target = Array.from(game.user.targets)[0];
// await ActiveEffect.execute(target.id, effectData, "add");