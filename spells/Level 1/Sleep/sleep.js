/* Sleep midi-qol on-use macro
• Add name of the macro to the Sleep On-Use field.
• Select "After targeted"

• Add the Condition GM callback macro and mark it "run as GM".
  Make sure the name matches the below variable: let CONDITION_MACRO = game.macros.getName("Condition");
  This permits a player to change the condition of targeted tokens to asleep using this macro.

Required modules:
• Midi-qol

This macro does not animate, but works well when combined with AutomatedAnimations.
For example, use a sleep animation for all targeted tokens.
Alternatively, you could add a call to Sequencer in this macro to animate only those
tokens that were affected.

RAW: Sleep is 5d8 at first level; 2d8 for each additional spell slot level

*/

// based on @ccjmk macro for sleep. Gets targets and ignores those who are immune to sleep.
// Updated for Foundry v9

/**
 * Helper function to determine if token is unconscious.
 * - Has the unconscious condition or
 * - Has less than 1 HP
 * @param {Actor5e} actor
 */
function isUnconscious(actor) {
  if(actor.data.data.attributes.hp.value < 1) return true;

  const effect = CONFIG.statusEffects.find(se => se.id === "unconscious");
  const label = game.i18n.localize(effect.label)
  return actor.effects.some(e => e.data.label === label);
}

/**
 * Helper function to determine if actor is asleep.
 * - has the asleep condition
 * - compare with unconscious, above.
 * @param {Actor5e} actor
 */
function isAsleep(actor) {
  const effect = CONFIG.statusEffects.find(se => se.id === "sleep");
  const label = game.i18n.localize(effect.label)
  return actor.effects.some(e => e.data.label === label);
}


/**
 * Helper function to determine if token is immune to sleep
 * - Checks condition immunities for custom: Sleep
 * - Checks for unconscious immunity
 * @param {Actor5e} actor
 */
function immuneToSleep(actor) {
  return actor.data.data.traits.ci.custom?.match(/[Ss]leep/)
     ||  actor.data.data.traits.ci.value?.includes("unconscious");
}


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

const SPELL_LEVEL = parseInt(args[0].spellLevel);
const CASTER = args[0].actor;
const TARGETS = args[0].targets;
const ITEM_CARD_ID = args[0].itemCardId;
const CONDITION_MACRO = game.macros.getName("Condition");

if(!CONDITION_MACRO) {
  ui.notifications.error("Sleep Macro|No GM condition macro found.");
  return;
}

console.log("Sleep Macro|args", args[0]);
const sleep_roll = await new Roll(`${(SPELL_LEVEL * 2) + 3}d8`).roll({ async: true });
await game.dice3d?.showForRoll(sleep_roll); // Roll 3d dice if available
console.log(`Sleep Macro|HP: ${sleep_roll.result}`);

// Sort targets low -> high HP;
TARGETS.sort((a,b) => a.actor.data.data.attributes.hp.value - b.actor.data.data.attributes.hp.value);
// To check sorted array in console (also, the for loop should print names in order):
// console.log(TARGETS.map(t => t.name))

let remainingSleepHp = sleep_roll.result;
const results_arr = [];
const ln = TARGETS.length;
for(const target of TARGETS) {
  const hp = target.actor.data.data.attributes.hp.value;

  if(hp > remainingSleepHp || isUnconscious(target.actor) || immuneToSleep(target.actor) || isAsleep(target.actor)) {
    // Add some console logging to track why a target was not affected
    // inefficient to repeat, but easier for testing
    console.log(`Resisted\t`, target.name,`Total HP:`, hp,
      isUnconscious(target.actor) ? " (Unconscious)" : "",
      immuneToSleep(target.actor) ? " (Immune)" : "",
      isAsleep(target.actor) ? " (Asleep)" : "");

    // Add to chat message
    results_arr.push(`<div class="midi-qol-flex-container"><div>does not affect</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
  } else {
    // HP remaining
    remainingSleepHp -= hp;
    console.log(`Sleeping\t${target.name} Total HP: ${hp} (Remaining SleepHP: ${remainingSleepHp})`);
    results_arr.push(`<div class="midi-qol-flex-container"><div>affects</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

    // Knock them out!
    await CONDITION_MACRO.execute(target.id, "sleep", "enable");
  }
}

// Update the chat message for the sleep spell indicating who is asleep
//await wait(500);
const results_txt = `<div><div class="midi-qol-flex-container"><em>${sleep_roll.result} total HP affected.</em>\n </div><div class="midi-qol-nobox">${results_arr.join('')}</div></div>`;
const chatMessage = game.messages.get(ITEM_CARD_ID);
let content = duplicate(chatMessage.data.content);
const searchString =  /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${results_txt}`;
content = content.replace(searchString, replaceString);
await chatMessage.update({ content });
