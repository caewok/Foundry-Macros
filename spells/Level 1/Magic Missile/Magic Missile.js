// https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/5e/Spells/Level%201/Magic%20Missile.js
// Item macro, Midi-qol On Use. This handles damage, so remove it from the spell card.

const DAMAGE_TYPE = "force";

// macro that takes caster_id, target_id, and optionally a color.
const MM_ANIMATION = game.macros.getName("JB2A RandomMagicMissile");
const COLOR = "Blue";

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
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



if(args.length < 1) {
  ui.notifications.error("Magic Missile Macro|Arguments not found.");
  return;
}
console.log("Magic Missile Macro|args", args);



const num_missiles = 2 + Number(args[0].spellLevel);
const actor_id = args[0].actor._id;
const token_id = args[0].tokenId;
const target_ids = args[0].targets.map(t => { return { id: t._id, name: t.name }; });
const item_card_id = args[0].itemCardId;

const actorD = game.actors.get(actor_id);
const tokenD = canvas.tokens.get(token_id);

console.log("Magic Missile Macro|actorD", actorD);
console.log("Magic Missile Macro|tokenD", tokenD);

(async()=>{

if(target_ids.length === 1) {
  console.log("Magic Missile Macro|Single target.");
  
  let the_target = canvas.tokens.get(target_ids[0].id);
  const damageRoll = new Roll(`(1d4 +1)*${num_missiles}`).roll();
  new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, DAMAGE_TYPE, [the_target], damageRoll, {itemCardId: item_card_id}); 
  const damage_target = `<div class="midi-qol-flex-container"><div>hits</div><div class="midi-qol-target-npc midi-qol-target-name" id="${the_target.id}"> ${the_target.name}</div><div><img src="${the_target.data.img}" width="30" height="30" style="border:0px"></div></div>`;
  await wait(1000);
	const chatMessage = await game.messages.get(args[0].itemCardId);
	
	const damage_results = `<div><div class="midi-qol-nobox">${damage_target}</div></div>`;
	const searchString =  /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
	const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${damage_results}`;
	
	let content = await duplicate(chatMessage.data.content);
	content = await content.replace(searchString, replaceString);
	await chatMessage.update({content: content});
	
	if(MM_ANIMATION) {
	  for(let i = 0; i < num_missiles; i++) {
	    await MM_ANIMATION.execute(token_id, target_ids[0].id, COLOR);
	  }
	}

} else if(target_ids.length > 1) {
  console.log("Magic Missile Macro|Multiple targets.");
  
  let targetList = "";
	for (let t of target_ids) {
		 targetList += `<tr><td>${t.name}</td><td><input type="number" id="target" min="0" max="${num_missiles}" name="${t.id}"></td></tr>`;
	}
	
	const the_content = `<p>You have currently <b>${num_missiles}</b> total <em>magic missile</em> bolts.</p><form class="flexcol"><table width="100%"><tbody><tr><th>Target</th><th>Number Bolts</th></tr>${targetList}</tbody></table></form>`;
	new Dialog({
			title: "Magic Missle Damage",
			content: the_content,
			buttons: {
			one: { label: "Damage", callback: async (html) => {
				let spentTotal = 0;
				let selected_targets = html.find('input#target');
				console.log("Magic Missile Macro|selected_targets", selected_targets);
				for(let get_total of selected_targets){
				  spentTotal += Number(get_total.value);
			  }
				if (spentTotal > num_missiles) return ui.notifications.error(`The spell fails, You assigned more bolts then you have.`);
				let damage_target = [];
				const damageRoll = new Roll(`1d4 +1`).roll();
				//game.dice3d?.showForRoll(damageRoll);
				for(let selected_target of selected_targets) {
					let damageNum = selected_target.value;
					console.log(`Magic Missile Macro|damageNum for ${selected_target.name}`, damageNum);
					
					if (!isEmpty(damageNum)) {
					  damageNum = parseInt(damageNum);
						const target_id = selected_target.name;
						console.log("Magic Missile Macro|target_id", target_id);
						
						const get_target = canvas.tokens.get(target_id);
						let totalDamage = damageNum * damageRoll.total;
						new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, totalDamage, DAMAGE_TYPE, [get_target], damageRoll, {itemCardId: args[0].itemCardId});
						damage_target.push(`<div class="midi-qol-flex-container"><div>hits ${damageNum > 1 ? " (x2) " : "" }</div><div class="midi-qol-target-npc midi-qol-target-name" id="${get_target.id}"> ${get_target.name}</div><div><img src="${get_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
					  
					  	if(MM_ANIMATION) {
								for(let i = 0; i < damageNum; i++) {
									await MM_ANIMATION.execute(token_id, target_id, COLOR);
								}
							}
					}
				}
				let damage_list = damage_target.join('');
				await wait(1000);
				let damage_results = `<div><div class="midi-qol-nobox">${damage_list}</div></div>`;
				
				const chatMessage = await game.messages.get(item_card_id);
				const searchString =  /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
				const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${damage_results}`;
				
				let content = await duplicate(chatMessage.data.content);
				content = await content.replace(searchString, replaceString);
				await chatMessage.update({content: content});
			  }
		  }
	  }
  }).render(true);

} else {
  console.log("Magic Missile Macro|No targets.");
  ui.notifications.error("Magic Missile Macro|No targets selected.");
}

})();