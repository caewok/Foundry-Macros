/* Magic Missile midi-qol on-use macro
• Add name of the macro to the Magic Missile On-Use field.
• Select "After active effects"
• Turn off Automated animations for the spell if applicable.

Required modules:
• Midi-qol
• JB2A patreon. (If not patreon, change COLOR below to available color.)
• Sequencer

If one token is targeted, fires missiles at the target. If more than one target, first
presents a dialog allowing the caster to select how many missiles should fire at each
target.

Applies 5e RAW rule that caster rolls a single 1d4 + 1 and uses that damage for each missile.

Change COLOR variable below if you prefer a specific color (default: random).
Change DAMAGE_TYPE variable below if you prefer a different damage type (default: FORCE).

/*

// Updated for Foundry v9 and Sequencer v2
// Adapting: https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/5e/Spells/Level%201/Magic%20Missile.js
// Midi-qol On Use.

// Typically, args is a length 1 array with an object with a ton of midi-qol values.
// The variable "actor" is also defined at the top level of a macro; here it is the caster.
// Typically, args[0].actor === actor.
// Key arguments from midi-qol:
// - args[0].actor: Actor5e object of the caster
// - args[0].tokenId: ID string for the actor token
// - args[0].itemCardId: ID string for the card of the magic missile spell in the chat
// - args[0].targets: Array of TokenDocuments5e objects, one per each token targeted

/* To test in console
Select an actor and one or more targets
t = canvas.tokens.controlled[0];
targets = Array.from(game.user.targets)
args = [ { spellLevel: 1, actor: t.actor, tokenId: t.id, targets, itemCardId: "" }]
*/

// Capitalized variables are global and may be called directly in functions below.

// Values to be set by user or GM
const COLOR = undefined; // blue, green, purple, orange, yellow, dark_red, or undefined for random
const DAMAGE_TYPE = "force";
let PAUSE_AFTER_DIE_ROLL = 0; // To give more time between die roll and animations

// Values set from midi-qol workflow
if(args.length < 1) {
  ui.notifications.error("Magic Missile Macro|Arguments not found.");
  return;
}
console.log("Magic Missile Macro|args", args);

const JB2A_COLORS = ["purple", "blue", "green", "dark_red", "orange", "yellow"];
const NUM_MISSILES = 2 + Number(args[0].spellLevel);
const CASTER = args[0].actor;
const CASTER_TOKEN = canvas.tokens.get(args[0].tokenId);
const TARGETS = args[0].targets;
const ITEM_CARD_ID = args[0].itemCardId;

if(!TARGETS.length) { return ui.notifications.error("No targets selected for magic missile spell."); }

if(TARGETS.length === 1) {
  // Single target; skip dialog and just fire missiles!
  const targetsMap = new Map();
  targetsMap.set(TARGETS[0], NUM_MISSILES);
  await fireAtTargets(targetsMap);

} else {
  // Multiple targets; present user with dialog to divide missiles among targets.
  console.log("Magic Missile Macro|Multiple targets!");
  let targetStr = "";
  TARGETS.forEach(t => targetStr += `<tr><td>${t.name}</td><td><input type="number" id="target" class="Selection" min="0" max="${NUM_MISSILES}" name="${t.id}"></td></tr>`)

  const html_dialog_header =
`
<script src="https://code.jquery.com/jquery-3.4.1.js"
         integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="
         crossorigin="anonymous"> </script>
`;

  const html_dialog_script =
`
<script>
function recalculate() {

	let num_missiles = ${NUM_MISSILES};
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

  const html_dialog_body =
`
<p>You have currently <span id="Total"></span> <em>magic missiles</em> remaining.</p>
<form class="flexcol">
  <table width="100%">
    <tbody>
      <tr>
        <th>Target</th>
        <th>Number Bolts</th>
      </tr>${targetStr}
    </tbody>
  </table>
</form>
`;

  new Dialog({
    title: "Magic Missile Damage",
    content: html_dialog_header + html_dialog_script + html_dialog_body,
    buttons: {
      one: { label: "Damage", callback: multipleTargetCallback }
    }
  }).render(true);
}

/**
 * Helper function to pause execution.
 * @param {Number}  ms  Number of milliseconds to pause.
 */
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/**
 * Roll combine function from Kekilla
 * @param {Roll[]}  arr   Array of Roll objects to combine.
 * @return {Roll} The combined roll object.
 */
function combineRolls(arr) {
  if(arr.length === 0) return;
  if(arr.length === 1) return arr[0];
  return arr.reduce((acc, val, ind) => {
    if(!ind) return val;

    let returnVal = new Roll(`${acc._formula} + ${val._formula}`);
    returnVal.data = {};
    returnVal.terms = [...acc.terms, `+`, ...val.terms];
    returnVal._evaluated = true;
    returnVal._total = acc._total + val._total;
    return returnVal;
  });
}

/**
 * Callback to process the apportioned missiles to targets.
 * @param {Object}  html
 */
async function multipleTargetCallback(html) {
  let targetsMap = new Map();

  // Confirm the number of missiles do not exceed the maximum.
  let spentTotal = 0;
  const selected_targets = html.find('input#target');
  for(const target of selected_targets){
    spentTotal += Number(target.value);
    const target_token = canvas.tokens.get(target.name); // here, target.name is the id for the token. See targetStr above.
    targetsMap.set(target_token.document, parseInt(target.value) || 0);
  }
  if (spentTotal > NUM_MISSILES) { return ui.notifications.error(`The spell fails. You assigned ${spentTotal} missiles but only have ${NUM_MISSILES}!`); }

  await fireAtTargets(targetsMap);
}

/**
 * Roll the 1d4 damage die and fire missiles at one or more targets as indicated
 * in the targets map. Update chat card accordingly.
 * @param {Map[key: Token5e, value: Number]}  targetsMap    Map identifying number of missiles (value)
 *                                                          to fire at each target (key).
 */
async function fireAtTargets(targetsMap) {
  console.log(`Magic Missile Macro|${targetsMap.size} targets mapped.`, targetsMap);

  // Roll a 1d4 + 1; possible pause for dice3d to display.
  const damage_roll = await new Roll("1d4 +1").roll( {async: true });
  console.log(`Magic Missile Macro|damage_roll`, damage_roll);
  await game.dice3d?.showForRoll(damage_roll); // Roll 3d dice if available
  await wait(PAUSE_AFTER_DIE_ROLL);

  // Cycle through targets, applying the same damage to each.
  // The targetsMap indicates how many missiles to fire at each target.
  let damage_target = [];
  for(const [target, num_missiles] of targetsMap) {
    if(!num_missiles) continue; // skip if number of missiles is 0 or otherwise falsy
    await fireMissilesAt(target, damage_roll, num_missiles)
    damage_target.push(`<div class="midi-qol-flex-container"><div>hits ${num_missiles > 1 ? (" (x" + num_missiles.toString() + ")") : "" }</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
  }

  const damage_list = damage_target.join('');
  const damage_results = `<div><div class="midi-qol-nobox">${damage_list}</div></div>`;

  const chatMessage = game.messages.get(ITEM_CARD_ID);
  const searchString =  /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
  const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${damage_results}`;

  let content = duplicate(chatMessage.data.content);
  content = content.replace(searchString, replaceString);
  await chatMessage.update({ content });
}

/**
 * Fire specified number of missiles at a given target.
 * Then use midi-qol to update the target damage and the chat message.
 * @param {Token5e} target          Token to fire at and apply damage.
 * @param {Roll}    damage_roll     The damage roll to display in the chat
 * @param {Number}  num_missiles    Number of missiles to fire
 */
async function fireMissilesAt(target, damage_roll, num_missiles) {
  if(!num_missiles) return;

  // Every damage roll is the same according to RAW: the previously-rolled 1d4 + 1.
  const damage_rolls = Array(num_missiles).fill(damage_roll);
  const damage_roll_all = combineRolls(damage_rolls);
  animateMagicMissile(CASTER_TOKEN, target, { reps: num_missiles, color: COLOR });
  await new MidiQOL.DamageOnlyWorkflow(CASTER, CASTER_TOKEN.document, damage_roll_all.total, DAMAGE_TYPE, [target], damage_roll_all, { itemCardId: ITEM_CARD_ID });
}

/* FYI: Midi-qol DamageOnlyWorkflow constructor:
export class DamageOnlyWorkflow extends Workflow {
  constructor(actor: Actor5e, token: Token, damageTotal: number, damageType: string, targets: [Token], roll: Roll,
    options: { flavor: string, itemCardId: string, damageList: [], useOther: boolean, itemData: {}, isCritical: boolean }) {
*/

/**
 * Use Sequencer module to animate one or more magic missiles between caster and target.
 * @param {Token5e} caster
 * @param {Token5e} target
 * Optional:
 * @param {String}  color   One of purple, blue, green,dark_red, orange, yellow.
 *                          If not defined, chosen randomly.
 * @param {Number} reps     Number of missiles to animate.
 */
function animateMagicMissile(caster, target, { color, reps = 1} = {}) {
  color ||= JB2A_COLORS[Math.floor(Math.random() * 5)];
  new Sequence()
    .wait(100, 600) // offset the missiles a bit between calls
    .effect()
      .repeats(reps)
      .randomOffset()
      .delay(200, 400)   // decreased numbers: more machine-gun-like effect
      .atLocation(caster)
      .stretchTo(target)
      .file(`jb2a.magic_missile.${color}`)
    .play();
}