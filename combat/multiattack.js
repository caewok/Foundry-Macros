/* 
 * Capitalize initial letter of string.
 * @return Capitalized string
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/* 
 * Repeat string with delimiter
 * e.g., repeatDelim("apple", ",", 5) -> "apple,apple,apple,apple,apple"
 * @param str String 
 * @param delim String delimiter
 * @param n number of times to repeat
 * @return concatenated string
 */
function repeatDelim(str, delim, n) {
  return new Array(n).fill(str).join(delim);
}


/* 
 * CSS format for the html grid that contains summary of attackers and their weapons.
 * Add a header with an image for each weapon.
 * @param weapons Map of weapon Objects
 * @return html string
 */
function formatAttackerHeader(weapons) {
  // console.log("Multiattack | formatattackerHeader weapons:");
//   console.log(weapons);
  
  // format the grid
  const n_weapons = weapons.size;
  const weapon_cols_size = repeatDelim("30px", " ", n_weapons);
  //const rows_size = repeatDelim("auto", " ", n_weapons + 1); // +1 for headers
  
  // grid columns:
  // 1. creature image (30px x 30px)
  // 2. creature name
  // 3, 4, ... checkmark for each weapon if present, image in header row
  // header row is 1; has image for each weapon
  let grid_style = `
  <div style="display:grid; 
              grid-template-columns: 30px auto ${weapon_cols_size}; 
              grid-template-rows: auto;
              justify-content: space-evenly;
              column-gap: 5px;">`

  // format the header row
  let header_row = `
  <label style="grid-column-start: 1; 
                grid-column-end: span 2;
                grid-row-start: 1">
  </label>
  `;
  
  let current_col = 3;
  weapons.forEach(weapon => {
    header_row += `
    <label style="grid-column-start: ${current_col}; 
                  grid-row-start: 1;
                  justify-self: center">
       <img src="${weapon.data.img}" title="${weapon.data.name.replace(" ","-")}"    width="30" height="30" style="margin:0px 5px 0px 0px; border:none;">
    </label>
    `;
    current_col += 1;
    });
  
  return grid_style + header_row;
}

/* 
 * Format html summary of attackers with their weapons.
 * Add a checkmark for each weapon owned by the actor.
 * @param actorData Object representing dnd5e actor
 * @param weapons Map of weapon Objects
 * @param actor_num Index of the actor, starting at 1
 * @return html string representing single row for an attacker.
 */
function formatAttackerLabel(actorData, weapons, actor_num) {
	let image = `
	<label style="grid-column-start:1;
                grid-row-start: ${actor_num + 1}">
	  <img src="${actorData.img}" 
	       title="${actorData.name.replace(" ","-")}" 
	       width="36" 
	       height="36" 
	       style="border:none; 
	       margin:0px 5px 0px 0px">
	</label>`;
	let attackerName = `
	<label style="grid-column-start:2; 
	              grid-row-start: ${actor_num + 1}; 
	              justify-self: start; 
	              text-overflow:ellipsis; 
	              overflow:hidden;">
	   ${actorData.name}
	</label>`;
	
	let weapon_check = "";
	let current_col = 3;
	
	for(let weapon_name of weapons.keys()) {
	 //  console.log(`Multiattack Tool | Testing for ${weapon_name}`);
// 	  console.log(actorData.items);
// 	  console.log(weapon_name);
	  
	  
	  let has_weapon = actorData.items.reduce((result, item) => {
	    return result | item.data.name === weapon_name;
	  }, false);
	  
	 
// 	  console.log(`Multiattack Tool | has_weapon: ${has_weapon}`);
	  
	  
	  let checkmark = has_weapon ? "√ " : " ";
	  
	  weapon_check += `
	  <label style="grid-column-start:${current_col}; 
	                grid-row-start: ${actor_num + 1};
	                justify-self: center;
	                text-overflow:ellipsis; 
	                overflow:hidden;">
	         ${checkmark}
	  </label>`;
	  
	  current_col += 1;
	}
	
	return image + attackerName + weapon_check;
}

/* 
 * CSS format for the html grid that contains summary of weapon attack/damage parameters.
 * @param weapons Map of weapon Objects
 * @return html string
 */
function formatWeaponHeader(weapons) {
   // format the grid
  const n_weapons = weapons.size;
  //const rows_size = repeatDelim("auto", " ", n_weapons); 
  
  // grid columns:
  // 1. weapon image (30px x 30 px)
  // 2. weapon name
  // 3. attack bonus
  // 4. damage die and bonus
  // 5. damage type
  // 6. checkbox
  let grid_style = `
  <div style="display:grid; 
              grid-template-columns: 30px auto auto auto auto 20px; 
              grid-template-rows: auto
              justify-content: space-evenly;
              column-gap: 5px;">`;
              
   return grid_style;           
}

/* 
 * Format html summary of weapons with attack/damage bonuses.
 * Add a checkmark for each weapon owned by the actor.
 * @param weapon Object representing dnd5e weapon
 * @param weapon_num Index of the weapon, starting at 1
 * @return html string representing single row for a weapon
 */
function formatWeaponLabel(weapon, weapon_num) {
  let image = `
  <label style="grid-column-start:1; 
                grid-row-start: ${weapon_num};">
     <img src="${weapon.data.img}" 
          title="${weapon.data.name.replace(" ","-")}" 
          width="30" 
          height="30" 
          style="margin:0px 5px 0px 0px; border:none;">
  </label>`;
  
  let weaponName = `
	<label style="grid-column-start:2; 
	              grid-row-start: ${weapon_num}; 
	              text-overflow:ellipsis;
	              overflow:hidden;">
	   ${weapon.data.name}
	</label>`;
  
  let weaponAttackBonus = `
  <label class="hint" 
         style="grid-column-start:3; 
                grid-row-start: ${weapon_num}">
      ${getAttackBonus(weapon)} to hit
  </label>`;
  
  let [dmg, dmgType] = getWeaponDamage(weapon);
  if(Array.isArray(dmg)) {
    dmg = dmg.join('<br>');
    dmgType = dmgType.join('<br>');
  }
  
	let weaponDamage = `
	<label class="hint" 
	       style="grid-column-start:4; 
	              grid-row-start: ${weapon_num}">
	   ${dmg}
	</label>`;
	
	let weaponDamageType = `
		<label class="hint" 
	       style="grid-column-start:5; 
	              grid-row-start: ${weapon_num};
	              justify-self: start">
	   ${dmgType}
	</label>`;

	
	let useButton = `
	<label class="hint" 
	       style="grid-column-start:6; 
	              grid-row-start: ${weapon_num}">
	<input type="checkbox" 
	       name="use${weapon.data.name.replace(" ","-")}"/>
	</label>`;
	
	let weaponLabel  = `${image}${weaponName}${weaponAttackBonus}${weaponDamage}${weaponDamageType}${useButton}`;
	
	return weaponLabel;

}



// function formatWeaponLabel(weapons,itemData) {
// 	let image = `<label style="grid-column-start:2; grid-column-end:3; align-self:center;"><img src="${itemData.img}" title="${itemData.name.replace(" ","-")}" width="30" height="30" style="margin:0px 5px 0px 0px; border:none;"></label>`;
// 	let weaponAttackBonus = `<label class="hint" style="grid-column-start:4; grid-column-end:5; align-self:center;">+${getAttackBonus(weapons[itemData.name])} to hit</label>`;
// 	let damageData = getWeaponDamage(weapons[itemData.name]);
// 	let weaponDamageText = ``;
// 	for (let i = 0; i < damageData[0].length; i++) {
// 		((i > 0) ? weaponDamageText += `<br>${damageData[0][i]} ${damageData[1][i].capitalize()}` : weaponDamageText += `${damageData[0][i]} ${damageData[1][i].capitalize()}`);
// 	}
// 	// let weaponDamage = `<label class="hint" style="grid-column-start:5; grid-column-end:6; align-self:center;">${getWeaponDamage(weapons[itemData.name])[0]} ${getWeaponDamage(weapons[itemData.name])[1]}</label>`;
// 	let weaponDamage = `<label class="hint" style="white-space: pre-wrap; grid-column-start:5; grid-column-end:6; align-self:center; text-align:center;">${weaponDamageText}</label>`;
// 	let weaponName = `<label style="grid-column-start:3; grid-column-end:4; align-self:center; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${itemData.name}</label>`;
// 	let useButton = `<input type="checkbox" name="use${itemData.name.replace(" ","-")}" style="grid-column-start:6; grid-column-end:7; align-self: center;"/>`;
// 
// 	let weaponLabel =  `<div style="display:grid; grid-template-columns:10px 30px auto 60px auto 30px; column-gap:5px;"><label style="grid-column-start:1; grid-column-end:2; align-self:center;"></label>${image}${weaponName}${weaponAttackBonus}${weaponDamage}${useButton}</div>`;
// 	return weaponLabel;
// }







function isTargeted(token) {
	if (token.isTargeted) {
		let targetUsers = token.targeted.entries().next().value;
		for (let i = 0; i < targetUsers.length; i++) {
			if (targetUsers[i]._id === game.user.id) {
				return true;
			}
		}
	};
}


function sendChatMessage(text) {
	let chatData = {
		user: game.user.id,
		speaker: game.user,
		content: text,
		whisper: game.users.entities.filter(u => u.isGM).map(u => u._id),
	};
	ChatMessage.create(chatData,{});
}


/*
 * Calculate the attack bonus for the provided weapon.
 * @param weapon Object representing dnd5e weapon
 * @return integer value of the bonus
 */
function getAttackBonus(weapon) {
  return weapon.labels.toHit;
}

/*
 * Calculate the damage for the provided weapon.
 * @param weapon Object representing dnd5e weapon
 * @return array with the dice formula and the damage type
 */
function getWeaponDamage(weapon) {
  let dmg = weapon.labels.damage;
  let dmgType = weapon.labels.damageTypes;
  const roll_data = weapon.getRollData();
  
  if(Array.isArray(dmg)) {
    // if dmg is a string, map will iterate over each character
    dmg = dmg.map(d => Roll.replaceFormulaData(d, roll_data));
  } else {
    dmg = Roll.replaceFormulaData(dmg, roll_data);
  }
  
	return [dmg, dmgType];
}


async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function DoSingleAttack(the_weapon, the_target, rolltype = "normal") {
  console.log(`Multiattack|DoSingleAttack using ${the_weapon.data.name} controlled by ${the_weapon.options.actor.data.name} with rolltype ${rolltype}.`);
//   console.log(the_weapon);
// 	console.log(the_targets);
	
// 	the_target.forEach(t => t.setTarget(true, {releaseOthers: false}));
	the_target.setTarget(true, {releaseOthers: true});
	await wait(100);
  
  let rollConfig = {};
  rollConfig.fastForward = true;
  
  if(rolltype === "advantage") {
      rollConfig.event = {altKey: true};
      rollConfig.advantage = true;
    
    } else if(rolltype === "disadvantage") {
      rollConfig.event = {ctrlKey: true};
      rollConfig.disadvantage = true;
    }  
  console.log("Multiattack|rollConfig: ", rollConfig);
  
  let attack_roll = await the_weapon.roll(rollConfig);
//     await the_weapon.rollAttack(rollConfig);
        
  if(!midi_QOL_Active) { 
    // calculate hits manually
    const targetAC = the_target.actor.data.data.attributes.ac.value;
    if(targetAC <= attack_roll.total) {
      await the_weapon.rollDamage();
    }
     // could roll damage for each actor in turn, but probably not worth it. 
//     const targetsAC = the_target.map(t => t.actor.data.data.attributes.ac.value);
// if(targetsAC.some(ac => ac <= attack_roll.total)) {
//       await the_weapon.rollDamage();
//     }
   
  }    
  
  // give time for midiqol and animations to run
	await wait(3000);
	
}

async function DoMultiAttack(html) {
  console.log("Multiattack|DoMultiAttack");
  canvas.tokens.placeables[0].setTarget(false, {releaseOthers: true});
  
  let weapons_selected = new Map;
	weapons.forEach((weapon, weapon_name) => {
		if (html.find(`input[name="use` + weapon_name.replace(" ","-") + `"]`)[0].checked) {
			weapons_selected.set(weapon_name, weapon);
		}
	}); // Object.entries(weapons).forEach
	console.log(weapons_selected);
	
	if(weapons_selected.size < 1) {
	  ui.notifications.info("Multiattack|No weapon selected; defaulting to first weapon found.")
	  
	  const first_weapon_name = weapons.keys().next().value;
	  console.log("Multiattack|Selecting first weapon found: ${first_weapon_name}")
	  weapons_selected.set(first_weapon_name, weapons.get(first_weapon_name));
	  console.log(weapons_selected);
	}
	
	
  let rolltype = "";
	html.find('[name=rolltype]').each(function(index, button) {
		if(button.checked) {
			rolltype = button.id;
		}
	});

	console.log(rolltype);
	
	for(const [weapon_name, weapon] of weapons_selected) {
	  console.log(`MultiAttack|Attacks using ${weapon_name}`);
// 	  console.log(weapon);
	  
	  for(const [attacker_name, attacker] of Object.entries(the_attackers)) {
	    console.log(`Multiattack|Attacker ${attacker_name}`);
// 	    console.log(attacker)
	    // select only the single attacker so animations work.
			attacker.control({releaseOthers: true});
	  
	    const has_weapon = attacker.actor.items.reduce((result, item) => {
						return result | item.data.name === weapon_name;
					}, false);
		
				if(has_weapon) {
				  const attacker_weapon = attacker.actor.items.filter(i => i.data.name === weapon_name)[0];				  
          console.log(attacker_weapon);
					
					for(const single_target of the_targets) {
					  console.log(single_target);
					  console.log(`MultiAttack|${attacker.data.name} attacking ${single_target.data.name} using ${weapon_name}${(rolltype === "advantage") ? " with advantage" : (rolltype === "disadvantage") ? " with disadvantage" : ""}!`);
					
					  await DoSingleAttack(attacker_weapon, single_target, rolltype);
					  the_targets.forEach(t => t.setTarget(true, {releaseOthers: false}));
					  
					}
				 
				
				} else {
					console.log(`MultiAttack| Skipping ${attacker.data.name} because they do not have ${weapon_name}.`);
				}
				 
	  } // for(const [attacker_name, attacker] of Object.entries(the_attackers))
	
	} // for(const [weapon_name, weapon] of Object.entries(weapons_selected))
	 the_attackers.forEach(a => a.control({releaseOthers: false}));
					
}


// Start macro 
const midi_QOL_Active = game.modules.get("midi-qol")?.active
console.log(`Multiattack|Using ${midi_QOL_Active ? "midi-qol" : "base rolls"}`);

let the_attackers = canvas.tokens.controlled;
let the_targets = canvas.tokens.objects.children.filter(a => a.isTargeted);

let numSelected = the_attackers.length;
let numTargeted = the_targets.length;

console.log(`Multiattack|${numSelected} attackers:`, the_attackers);
console.log(`Multiattack|${numTargeted} targets:`, the_targets);

if (the_attackers.length < 1) {
  ui.notifications.warn("Select a token!");
  return;
}

if (the_targets.length < 1) {
	ui.notifications.warn("Select a target!");
	return;
}

let dialogContentLabel = `<p><em>Welcome to the Murderbot 3000!</em></p><p class="hint">You have selected ${numSelected} token${(numSelected === 1) ? "" : "s"} and ${numTargeted} target${(numTargeted === 1) ? "" : "s"}.<br>`;

const targetsAC = the_targets.map(t => t.actor.data.data.attributes.ac.value);
console.log(targetsAC);
console.log(Math.min(...targetsAC));

dialogContentLabel += (targetsAC.length > 1) ? 
  `Your targets have an AC ranging between ${Math.min(...targetsAC)} and ${Math.max(...targetsAC)}.</p>` :
  `Your target has an AC of ${targetsAC}.</p>`



const dialogContentRollType = 
`
 <p>
   <input type="radio" name="rolltype" id="normal" value="normal" checked>
   <label for="normal">Normal</label>
   
   <input type="radio" name="rolltype" id="advantage" value="advantage">
   <label for="advantage">Advantage</label>
   
   <input type="radio" name="rolltype" id="disadvantage" value="disadvantage"> 
   <label for="disadvantage">Disadvantage</label>
  </p>
`;




let weapons = new Map();
for (const token of the_attackers) {
  let items = token.actor.items.entries.filter(i => i.data.type == "weapon");
  items.forEach((item) => {
    if(!weapons.has(item.data.name)) {
      // use id instead of name for edge cases where identically-named weapons are found?
      weapons.set(item.data.name, item);
    }
  }); // items.forEach
} // for (const token of the_attackers)

// console.log("Multiattack|weapons:", weapons);
// console.log("Multiattack|weapons array", [...weapons]);
// console.log("Multiattack|weapons key", Array.from(weapons.keys()));
// console.log("Multiattack|weapons values", Array.from(weapons.values()));


// let arr = Array.from(weapons.values());
// arr.map((weapon, index) => {
//   console.log(weapon);
//   console.log(index);
// });

// create entries in a table listing attack/damage for each weapon
let weapons_content = Array.from(weapons.values()).map((weapon, index) => {
 //  console.log(`Multiattack|weapon ${index}`, weapon);
//   console.log(`Multiattack|weapon damage`, getWeaponDamage(weapon))
  
  return formatWeaponLabel(weapon, index + 1);
});

// console.log(weapons_content);
weapons_content = weapons_content.join(""); // default join is ","
// console.log(weapons_content);
// console.log("Multiattack|weapons_content:", weapons_content);

// create entries in a table listing a checkmark for each weapon the attacker possesses
let attacker_content = the_attackers.map((token, index) => {
  return formatAttackerLabel(token.actor, weapons, index + 1);
});
attacker_content = attacker_content.join(""); // <hr/>? 
// console.log("Multiattack|attacker_content:", attacker_content);


// console.log(attacker_content);

let attacker_header_content = formatAttackerHeader(weapons);
let weapon_header_content = formatWeaponHeader(weapons);

// console.log(weapon_header_content);
// console.log(weapons_content);


// content += weapon_header_content + weapons_content + `</div>` + attacker_header_content + attacker_content + `</div>` + dialogContentEnd + `<br>`;


// let content = `
// <form id="multiattack-lm" class="dialog-content">
//  ${dialogContentLabel}
//  ${dialogContentRollType}
//  <hr>
//  <div class="flexcol">
//    ${weapon_header_content}
//    ${weapons_content} 
//  </div>
// 
//  <div class="flexcol">
//    ${attacker_header_content}
//    ${attacker_content}
//  </div>
// </form>
// <br>
// `
// console.log(content);

// let content = `
// <form id="multiattack-lm" class="dialog-content">
//  ${dialogContentLabel}
//  ${dialogContentRollType}
//  <hr>
//  <div class="flexcol">
//    ${weapon_header_content}
//    ${weapons_content} 
//    ${attacker_header_content}
//  </div>
//  
// </form>
// `

let content = `
 <form id="multiattack-lm" class="dialog-content">
 ${dialogContentLabel} 
 ${dialogContentRollType}
 <p>Please choose one or more weapon options:</p>
 <hr>
 ${weapon_header_content}
 ${weapons_content} 
 </div>
 <hr>
 <br>
 ${attacker_header_content}
 ${attacker_content}
 </div>
 
</form>
`


const d = new Dialog({
	title: "Multiattack Tool",
	content: content,
	buttons: {
		one: {
			label: "Multiattack",
			icon: `<i class="fas fa-fist-raised"></i>`,
			callback: (html) => {
			  //console.log(html);
			  DoMultiAttack(html);
			}
		}, // one
			
		two: {
			label: "Cancel",
			icon: `<i class="fas fa-times"></i>`
		} // two

	}, // buttons
	default: "one"
},{width: 450});  // Dialog

d.render(true);