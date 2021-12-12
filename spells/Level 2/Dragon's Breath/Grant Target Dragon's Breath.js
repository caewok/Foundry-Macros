/*
For Dragon's Breath spell. 
This macro will give the target an at-will Dragon's breath spell to use to roll damage.
The macro will remove the at-will spell from the target when the spell ends.
Add this macro to an effect to be transferred to the target
Requires the spell to already be created.
*/

// To use, assuming the macro is titled "GrantDragonsBreath"
// Add to DAE effect with macro.execute
//   GrantDragonsBreath @item.level 
// Create a Dragon's Breath weapon at-will spell with appropriate template for damage.
// Set DRAGON_BREATH_WEAPON_ITEM_NAME to the at-will spell name.

const MACRO_ID = "macro_grant_target_dragon_breath";
const FORCE_DEBUG = true;
const DRAGON_BREATH_WEAPON_ITEM_NAME = "Dragon's Breath (Weapon)"
const ACTOR_ITEM_MACRO = game.macros.find(m => m.name === "ActorItem");
const DAMAGE_TYPES = ["acid", "cold", "fire", "lightning", "poison"];
const DEFAULT_DAMAGE_TYPE = "fire";

function log(...args) {
  try {
    if(FORCE_DEBUG) {
      console.log(MACRO_ID, '|', ...args);
    }
  } catch (e) {}
}


log("args", args);

const lastArg = args[args.length - 1];
const spell_lvl = parseInt(args[1]); 
log("Spell level ${spell_lvl}");

const user_tokenId = lastArg.tokenId;
log("user_tokenId: ${user_tokenId}");

if(args[0] == "on") {
  const damage_type = (await SelectionDialog(DAMAGE_TYPES, {prompt: "Select damage type for <em>Dragon's Breath</em>", default_selection: DEFAULT_DAMAGE_TYPE}))[0];
log(`Chose damage type ${damage_type}`);

  await ACTOR_ITEM_MACRO.execute(user_tokenId, DRAGON_BREATH_WEAPON_ITEM_NAME, "create");
  
  // now add changed data
  // should be a single data; we will be modifying the data part of the item
  // damage.parts is an array with another  array of [dmg, dmg type]
  const updated_data = { data: {
														 damage: {
															 parts: [[`${spell_lvl + 1}d6`, damage_type]] 
															       },
														 level: spell_lvl
															 }
															   
											 };      
  
  await ACTOR_ITEM_MACRO.execute(user_tokenId, DRAGON_BREATH_WEAPON_ITEM_NAME, "modify", updated_data);
  
}

if(args[0] == "off") {
  await ACTOR_ITEM_MACRO.execute(user_tokenId, DRAGON_BREATH_WEAPON_ITEM_NAME, "delete");
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