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


const tokens = RetrieveSelectedTokens();

if(isEmpty(tokens)) {
  ui.notifications.warn("No tokens selected.");
  return;
}

// eventually run through each selected token
const token_chosen = tokens[0];
console.log(token_chosen);

const spells = token_chosen.actor.data.items.filter(item => item.type === "spell");
console.log(spells);


if(isEmpty(spells)) {
  ui.notifications.warn("No spells found for selected token.");
  return;
}






// display spells; select one
// spell name, school, facet, level, prepared/not prepared
const spellTableHead = 
`
<p><em>Please select a spell to attempt to weave.</em></p>
<form id = "spell_selection_form">
<table id='worksheet_table' class="table table-striped">
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
  const tableRow = 
  `
  <tr class="spell-row">
    <td> <input type="radio" name="spellSelection" class="spellSelection" id="${spell.id}"> </td>
    <td> <label for="${spell}">${spell.name} </label> </td>
    <td> ${spell.data.level} </td>
    <td> ${spell.data.school} </td>
    <td> ${spell.data.preparation.prepared} </td>
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
`

const dialogSpellTable = spellTableHead + spellTableRows + spellTableEnd;

const spell_table_res = await dialogPromise(dialogSpellTable);
if("Cancel" === spell_table_res) {
			console.log("User cancelled.");
			return;
		} else if("Closed" == spell_table_res) {
			console.log("User closed");
			return;
		}

console.log(spell_table_res);
let spell_chosen_id = "";
spell_table_res.find('[class=spellSelection]').each(function(index, spell) {
  if(spell.checked) {
    spell_chosen_id = spell.id;
  }
});

console.log(spell_chosen_id);


// selection to add one or more modifications



// selection to add one or more enhancements

// check points
// roll check for whether spell is cast
// if not successful, ask for cantrip or none
// apply points

// modify spell with enhancements, modifications
// cast spell
// change spell back to original, keeping in mind that cast spell might also change it?


/* spell (burning hands)
data:
ability: ""
actionType: "save"
activation: {type: "action", cost: 1, condition: ""}
attackBonus: 0
chatFlavor: ""
components: {value: "", vocal: true, somatic: true, material: false, ritual: false, …}
consume: {type: "attribute", target: "resources.primary.value", amount: 4}
critical: null
damage: {parts: Array(1), versatile: ""}
description: {value: "<p>As you hold your hands with thumbs touching and…creases by 1d6 for each slot level above 1st.</p>", chat: "", unidentified: ""}
duration: {value: null, units: "inst"}
formula: ""
level: 1
materials: {value: "", consumed: false, cost: 0, supply: 0}
preparation: {mode: "atwill", prepared: false}
range: {value: null, long: null, units: "self"}
save: {ability: "dex", dc: 10, scaling: "spell"}
scaling: {mode: "level", formula: "1d6"}
school: "evo"
source: "PHB pg. 220"
target: {value: 15, width: null, units: "ft", type: "cone"}
uses: {value: 0, max: 0, per: ""}
__proto__: Object
effects: []
flags: {core: {…}}
hasTarget: true
hasUses: false
img: "systems/dnd5e/icons/spells/fog-orange-2.jpg"
isDepleted: undefined
isOnCooldown: undefined
isStack: false
labels:
activation: "1 Action"
components: (2) ["V", "S"]
damage: "3d6"
damageTypes: "Fire"
duration: "Instantaneous"
level: "1st Level"
materials: ""
range: "Self"
recharge: "Recharge [undefined]"
save: "DC 10 Dexterity"
school: "Evocation"
target: "15 Feet Cone"
__proto__: Object
name: "Burning Hands"
sort: 100001
toggleClass: ""
toggleTitle: "Unprepared"
type: "spell"
_id: "qYjXV2xfOMSnhOpo"
*/