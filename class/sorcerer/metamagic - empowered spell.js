/*
Metamagic: Empowered Spell
PHB p. 102
When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of the damage dice up to your Charisma modifier (minimum of one). You must use the new rolls.

You can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.

Can use after rolling the damage...
*/

/* 
 * This macro has 2 use cases: 
 *   1. Call from another script, passing actor id as arg[0] and chat id as arg[1].
 *   2. Call alone. Requires an actor to be selected.
 *
 * If the chat id is not provided, a dialog will ask for a recent chat id to use.
 * Presents a dialog with one or more dice to re-roll.
 * "Rolls" the Empowered Spell feat so that sorcery points can be deducted if necessary.
 */

// When calling from another script:
// arg[0]  Id of the token casting the empowered spell
// arg[1]  Id of the message for the damage to modify

const EMPOWERED_METAMAGIC_NAME = "Metamagic: Empowered Spell";
 
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

/*
 * Parse a chat message to pull out the damage rolls
 * @param chat_content String (from messages.data.content) to run against regex.
 * @return matches for damage die(s) and resulting roll(s)
 */
function ParseChatDamageRoll(chat_content) {
  // replace new lines so that the below .* captures correctly
  chat_content = chat_content.replace(/\r?\n|\r/gm, " ");

//   console.log("ParseChatDamageRoll|chat_content\n${chat_content}", chat_content);
  
  // find the damage roll part of the chat message
  const re_dmg_txt = /<div class="midi-qol-damage-roll">(.*)<div class="end-midi-qol-damage-roll">/;
  const dmg_text = chat_content.match(re_dmg_txt);
//   console.log("ParseChatDamageRoll|dmg_text\n${dmg_text}", dmg_text);
  
  // find the individual damage die rolls
  const re_dmg_rolls = /roll die d(?<die>[0-9]{1,2}).*?>(?<roll>[0-9]{1,2})</g;
  const dmg_rolls = dmg_text[0].matchAll(re_dmg_rolls);  
  return dmg_rolls;
}
  

// ----------------------------------------------
// Main workflow

// Note: args is always defined. Should be length 0

// const token_chosen = RetrieveSelectedTokens()[0];
// console.log(args);

const token_chosen = (args.length === 0) ?  (RetrieveSelectedTokens()[0]) : (canvas.tokens.ownedTokens.filter(t => t._id == args[0])[0]);
console.log(token_chosen);


let empowered_metamagic = token_chosen.actor.data.items.filter(item => item.type === "feat" && item.name === EMPOWERED_METAMAGIC_NAME)[0];
if(isEmpty(empowered_metamagic)) {
  ui.notifications.warn(`No ${EMPOWERED_METAMAGIC_NAME} found for selected token.`);
  return;
}
empowered_metamagic = token_chosen.actor.getOwnedItem(empowered_metamagic._id);



let chosen_message = {};
if(args.length === 0) {
  let messages = game.messages.filter(m => m.data.content.includes("midi-qol-damage-roll") && 
                                           m.data.content.includes("dice-result"));
  
  // messages are by order of insertion
  // arbitrarily take the last 10
  messages = Array.from(messages);
  messages = messages.slice(Math.max(messages.length - 10, 0));
  
  console.log("Last 10 messages:", messages);
  // use flavor to label the message, default back to content if no flavor
  const message_flavors = messages.map(m => {
    let out = m.data?.flavor;
    if(isEmpty(out)) out = m.data.content;
    
    const time = new Date(m.data.timestamp).toLocaleDateString('en-US', {
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    });
    
    out += " | " + time;
    
    return out;
  });
    
  console.log("Message flavors:", message_flavors);
  
  const message_ids = messages.map(m => m._id);  
  
  const chosen_message_id = await SelectionDialog(message_flavors,
                            { ids : message_ids,
                              prompt : "Select a message to re-roll damage.",
                              checked_index : (message_ids.length - 1) }); // default to the most recent message
                              
                              
  if("CANCELED" === chosen_message_id[0] ||
     "CLOSED" === chosen_message_id[0] ||
     chosen_message_id.length === 0) return;
                    
  console.log("Message id", chosen_message_id);                            
  chosen_message = messages.filter(m => m._id === chosen_message_id[0])[0];
} else {
  chosen_message = game.messages.filter(m => m._id === args[1]);
}

console.log("Chosen message", chosen_message); 




let orig_dmg_rolls = ParseChatDamageRoll(chosen_message.data.content); // returns iterable matchAll object
  
orig_dmg_rolls = Array.from(orig_dmg_rolls);  // die is 1, roll is 2
console.log(orig_dmg_rolls);
const dmg_names = orig_dmg_rolls.map(d => `${d[2]} (d${d[1]})`);
const dmg_index = Array.from(Array(dmg_names.length).keys());

console.log(dmg_names);
console.log(dmg_index);

if(dmg_names.length > 0) {

	const max_dice = Math.max(1, token_chosen.actor.data.data.abilities.cha.mod);
	const empowered_dice = await SelectionDialog(dmg_names,
												{ ids : dmg_index,
													prompt : "If you want to use Empowered Spell, select one or more damage die to reroll", 
													type : "checkbox",
													limit : max_dice });
	console.log("empowered_dice", empowered_dice);

	if(empowered_dice.length === 0 || "CANCELED" === empowered_dice[0] || "CLOSED" === empowered_dice[0]) return;
 
	// apply the metamagic feature, which can be tied to using sorcerer points
	// Await it in case user cancels, and to get the right order.
	await empowered_metamagic.roll();
 
	// reroll the chosen die or dice, and create a chat entry with the full results.
	// assuming for now all damage dice are of the same type
	let roll_txt = `${orig_dmg_rolls.length}d${orig_dmg_rolls[1][1]}`;
	console.log("Empowered roll text", roll_txt);

	let empowered_roll = new Roll(roll_txt);
	empowered_roll.evaluate();
	console.log("Empowered roll", empowered_roll);

// 	if not one of the selected empowered dice, then reset to the original roll
  console.log("dmg_index", dmg_index);
	const nonempowered_dice = dmg_index.filter(x => !empowered_dice.includes(x.toString()));
	console.log("nonempowered dice:", nonempowered_dice);
	
	nonempowered_dice.forEach(d => {
	 empowered_roll.terms[0].results[parseInt(d)].result = parseInt(orig_dmg_rolls[parseInt(d)][2]);
	});
 
// 	update the totals
// 	do we need to care about checking for active in the results?
	empowered_roll.results[0] = empowered_roll.terms[0].results.reduce((acc, obj) => acc + parseInt(obj.result), 0); 
	empowered_roll._total = empowered_roll.results[0];
	empowered_roll.toMessage({
	 flavor: `Metamagic: Empowered Spell | Re-rolled ${empowered_dice.length} die.`
	});  

} 

 
