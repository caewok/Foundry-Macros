// Roll injury tokens per Grit & Glory v6 rules
// Must have the following roll tables set up
// (rename below as necessary; ignore ones you won't use):
const INJURY_TABLES = {
  acid: "Acid Injury",
  piercing: "Piercing Injury",
  bludgeoning: "Bludgeoning Injury",
  cold: "Cold Injury",
  fire: "Fire Injury",
  force: "Force Injury", 
  lightning: "Lightning Injury",
  necrotic: "Necrotic Injury",
  poison: "Poison Injury",
  psychic: "Psychic Injury",
  radiant: "Radiant Injury",
  slashing: "Slashing Injury",
  siege: "Siege Injury",
  thunder: "Thunder Injury",
};

// Injury severity tables assume betterrolltables for escalation.
const INJURY_SEVERITY_TABLES = [
  "Injury Severity 1",
  "Injury Severity 2",
  "Injury Severity 3",
  "Injury Severity 4"
];

// Localization
const errorNoActorSelected = 'No actor selected on map.';
const errorMultipleActorsSelected = "Only one actor can be selected.";
const errorMissingTable = "Missing table ";

// Keywords found in the severity table description text for the roll result
// case insensitive
const SEVERITY_TABLE_KEYWORDS = {
  advantage: "advantage",
  disadvantage: "disadvantage",
  check: "check",
  save: "save",
  proficient: "proficient"
};

const dialog_content =
`
<table>
  <tr>
<td>Injury Tokens: </td>
    <td><input type="number" id="InjuryTokens" min=1 max=99 step=1 value=1> </td>
    </tr>
<td>  
Damage Type: 
  </td>
  <td><select id="DamageType" name="DamageType">
                <option value="acid">acid</option>
                <option value="piercing">bleeding</option>
                <option value="bludgeoning">bludgeoning</option>
                <option value="cold">cold</option>
                <option value="bludgeoning" selected>excess wounds</option>
                <option value="fire">fire</option>
                <option value="force">force</option>
                <option value="lightning">lightning</option>
                <option value="necrotic">necrotic</option>
                <option value="piercing">piercing</option>
                <option value="poison">poison</option>  
                <option value="psychic">psychic</option>  
                <option value="radiant">radiant</option>  
                <option value="slashing">slashing</option> 
                <option value="siege">siege</option>
                <option value="thunder">thunder</option>
              </select>
  </td>
  
</table>
`;

/**
 * Construct die roll based on result of the severity table.
 * @severity_result_text Text description of the severity table result
 */
function constructInjuryDieRoll(severity_result_text) {
  let roll_text = "";
	if(severity_result_text.includes(SEVERITY_TABLE_KEYWORDS.disadvantage)) {
		roll_text = "2d20kl1";
	} else if(severity_result_text.includes(SEVERITY_TABLE_KEYWORDS.advantage)) {
		roll_text = "2d20kh1";
	} else {
		roll_text = "1d20";
	}

	if(severity_result_text.includes(SEVERITY_TABLE_KEYWORDS.check)) {
		roll_text += " + @conMod";
	} else if(severity_result_text.includes(SEVERITY_TABLE_KEYWORDS.save)) {
		 roll_text +=  " + @conMod + @conProf";
	}

	if(severity_result_text.includes(SEVERITY_TABLE_KEYWORDS.proficient)) {
		 roll_text += " + @prof";
	}
	
	return roll_text;
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
function dialogCallback(content, callbackFn) {
	let d = new Dialog({
		title: "Title",
		content: content,
		buttons: {
			one: {
				icon: '<i class="fas fa-check"></i>',
				label: "Confirm",
				callback: (html) => callbackFn(html)
			},
			two: {
				icon: '<i class="fas fa-times"></i>',
				label: "Cancel",
				callback: () => callbackFn("Cancel")
			}
			},
		default: "two",
		close: () => callbackFn("Close")
	});
	d.render(true);
}

async function main(theActor) {
  let res = await dialogPromise(dialog_content);
  console.log(res);
  if("Cancel" == res) {
    return;
  } else if("Close" == res) {
    return;
  }
  
  
  let num_injuries = parseInt( res.find('[id=InjuryTokens]')[0].value );
  const injury_type = res.find('[id=DamageType]')[0].value;
 
  // first draw on one of the four injury severity tables
  if(num_injuries > 4) {
    num_injuries = 4;
  }
  console.log(num_injuries + " injury tokens of type " + injury_type);
  
  // Find tables
  const severity_table = game.tables.getName(INJURY_SEVERITY_TABLES[num_injuries - 1]);
  const injury_table = game.tables.getName(INJURY_TABLES[injury_type]);

  if(null === severity_table) {
    ui.notifications.error(`${errorMissingTable} "${INJURY_SEVERITY_TABLES[num_injuries]}."`);
    return;
  }
  
  if(null == injury_table) {
    ui.notifications.error(`${errorMissingTable} "${INJURY_TABLES[injury_type]}."`);
    return;
  }
  
  // Draw from the severity table
  //console.log(severity_table);
  const severity_result = await severity_table.draw();
  console.log(severity_result);  
  
  // Draw from the injury table
  const severity_result_text = severity_result.results[0].text.toLowerCase();
  const roll_text = constructInjuryDieRoll(severity_result_text);
  
	let roll_data = {
		prof: theActor.data.data.attributes.prof, 
		conMod: theActor.data.data.abilities.con.mod,
		conProf: theActor.data.data.abilities.con.prof 
	};
	//console.log(roll_data);
	//console.log("Rolling " + roll_text);
	
	injury_table.draw({ roll: new Roll(roll_text, roll_data) });
}

// Preliminary checks 
// ------------------
let errorReason = '';
let actors = canvas.tokens.controlled.map(({ actor }) => actor);

if(actors.length < 1) {
  errorReason = `${errorNoActorSelected}`;
} else if(actors.length > 1) {
  errorReason = `${errorMultipleActorsSelected}`;
}

const theActor = actors[0];


// Main
// ----
if(errorReason === '') {
  //console.log(combatants.length + " combatants owned.");
  main(theActor);
 
} else {
  //console.log(`Error: ${errorReason}`);
  ui.notifications.error(`${errorReason}`);
}
