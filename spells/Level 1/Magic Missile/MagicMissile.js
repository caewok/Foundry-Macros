// Updated for Foundry v9 and Sequencer v2
// https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/5e/Spells/Level%201/Magic%20Missile.js
// Midi-qol On Use. This handles damage, so remove it from the spell card.

const DAMAGE_TYPE = "force";
const PAUSE_AFTER_DIE_ROLL = 500;

// macro that takes caster_id, target_id, and optionally a color.
const MM_ANIMATION = game.macros.getName("AnimateRandomMagicMissile");
const COLOR = "Blue";

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// roll combine function from Kekilla
function combineRolls(arr) {
    return arr.reduce((acc, val, ind) => {
        if (ind === 0) {
            return val;
        } else {
            let returnVal = new Roll(`${acc._formula} + ${val._formula}`);

            returnVal.data = {};
//             returnVal.result = [...acc.result, `+`, ...val.results];
            returnVal.terms = [...acc.terms, `+`, ...val.terms];
            returnVal._evaluated = true;
            returnVal._total = acc._total + val._total;

            return returnVal;
        }
    });
}


if(args.length < 1) {
  ui.notifications.error("Magic Missile Macro|Arguments not found.");
  return;
}
console.log("Magic Missile Macro|args", args);



const num_missiles = 2 + Number(args[0].spellLevel);
const actor_id = args[0].actor.id;
const token_id = args[0].tokenId;
const target_ids = args[0].targets.map(t => { return { id: t.id, name: t.name }; });
const item_card_id = args[0].itemCardId;

const actorD = game.actors.get(actor_id);
const tokenD = canvas.tokens.get(token_id);

console.log("Magic Missile Macro|actorD", actorD);
console.log("Magic Missile Macro|tokenD", tokenD);

//(async()=>{

if(target_ids.length === 1) {
  console.log("Magic Missile Macro|Single target.");

  let the_target = canvas.tokens.get(target_ids[0].id);

// avoid bug in how MidiQOL interprets damage multiplier. See https://gitlab.com/tposney/midi-qol/-/issues/347.
//   const damageRoll = new Roll(`(1d4 +1)*${num_missiles}`).roll();
//   console.log(`Magic Missile Macro|damageRoll`, damageRoll);
//   new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, DAMAGE_TYPE, [the_target], damageRoll, {itemCardId: item_card_id});

  const damageRoll = await (new Roll(`1d4 + 1`)).roll({async: true});
  game.dice3d?.showForRoll(damageRoll);
  await wait(PAUSE_AFTER_DIE_ROLL);

  let damageRolls = [];
	for(let i = 0; i < num_missiles; i++) {
		damageRolls.push(damageRoll);
	}
	console.log(`Magic Missile Macro|damage rolls`, damageRolls);

	const damageRollAll = combineRolls(damageRolls);
	new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRollAll.total, DAMAGE_TYPE, [the_target], damageRollAll, {itemCardId: item_card_id});

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
	    //await wait(Math.floor(Math.random() * 500)) + 100; // wait a bit to offset the missiles
	    await MM_ANIMATION.execute(token_id, target_ids[0].id, COLOR);
	  }
	}

} else if(target_ids.length > 1) {
  console.log("Magic Missile Macro|Multiple targets.");

  let targetList = "";
	for (let t of target_ids) {
		 targetList += `<tr><td>${t.name}</td><td><input type="number" id="target" class="Selection" min="0" max="${num_missiles}" name="${t.id}"></td></tr>`;
	}

	const html_header =
`
<script src="https://code.jquery.com/jquery-3.4.1.js"
         integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="
         crossorigin="anonymous"> </script>
`;

	const html_script =
`
<script>
function recalculate() {

	const num_missiles = ${num_missiles};
	let num_selected = 0;
	$('input[type="number"].Selection').each(function () {
     num_selected += parseInt( $(this).val() )||0;
     });

	// update html text displaying the total number
    $('#Total').text(num_missiles -  num_selected);
	}

	$('.Selection').change( function() {
    //console.log("Selection changed.");
    recalculate();
  });


  $(document).ready(function() {
    //console.log("Document ready");
    recalculate();
  });
</script>
`;




	const html_body = `<p>You have currently <span id="Total"></span> <em>magic missiles</em> remaining.</p><form class="flexcol"><table width="100%"><tbody><tr><th>Target</th><th>Number Bolts</th></tr>${targetList}</tbody></table></form>`;

	const the_content = html_header + html_script + html_body;

	new Dialog({
			title: "Magic Missile Damage",
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
				console.log(`Magic Missile Macro|damageRoll`, damageRoll);
				game.dice3d?.showForRoll(damageRoll);
				await wait(PAUSE_AFTER_DIE_ROLL);

				// cycle through each target
				// for each, run the damage only workflow for each animation, applying the same damage each time
				for(let selected_target of selected_targets) {
					const damageNum = parseInt(selected_target.value)||0;
					console.log(`Magic Missile Macro|damageNum for ${selected_target.name}`, damageNum);

					if (damageNum > 0) {
					  const target_id = selected_target.name;
						console.log("Magic Missile Macro|target_id", target_id);

						const get_target = canvas.tokens.get(target_id);
						let damageRolls = [];
						for(let i = 0; i < damageNum; i++) {
						  damageRolls.push(damageRoll);

						  //new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, DAMAGE_TYPE, [get_target], damageRoll, {itemCardId: args[0].itemCardId});
						  if(MM_ANIMATION) {
						    //await wait(Math.floor(Math.random() * 500) + 100); // wait a bit to offset the missiles
						    await MM_ANIMATION.execute(token_id, target_id, COLOR);
						   }
						}
						damage_target.push(`<div class="midi-qol-flex-container"><div>hits ${damageNum > 1 ? (" (x" + damageNum.toString() + ")") : "" }</div><div class="midi-qol-target-npc midi-qol-target-name" id="${get_target.id}"> ${get_target.name}</div><div><img src="${get_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

						let damageRollAll = damageRoll;
						if(damageRolls.length > 1) { damageRollAll = combineRolls(damageRolls); }
						new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRollAll.total, DAMAGE_TYPE, [get_target], damageRollAll, {itemCardId: args[0].itemCardId});
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

//})();