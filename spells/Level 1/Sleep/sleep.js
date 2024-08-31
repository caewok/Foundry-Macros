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
// Updated for Foundry v11
// Requires DFred's Convenient Effects and midi (for the chat message)
const SLEEP_EFFECT_NAME = "Unconscious"; // Effect name per DFred's. Likely localized name.
const HP_PROPERTY = "system.attributes.hp.value";

/**
 * Helper function to determine if token is unconscious.
 * - Has less than 1 HP
 * @param {Actor5e} actor
 */
function isUnconscious(actor) { return getProperty(actor, HP_PROPERTY) < 1; }

/**
 * Helper function to determine if actor is asleep.
 * - has the unconscious condition
 * - has more than 0 HP
 * @param {Actor5e} actor
 */
function isAsleep(actor) { return !isUnconscious && game.dfreds.effectInterface.hasEffectApplied(SLEEP_EFFECT_NAME, actor.uuid); }

/**
 * Helper function to determine if token is immune to sleep
 * - Checks condition immunities for custom: Sleep
 * - Checks for unconscious immunity
 * @param {Actor5e} actor
 */
function immuneToSleep(actor) {
  return actor.system.traits.ci.custom?.match(/[Ss]leep/)
     || actor.system.traits.ci.value?.has("unconscious");
}

/**
 * Helper function to turn on or off an effect.
 * @param {Token} token
 * @param {string} effect
 * @param {boolean} [enable=true]
 */
async function applyEffect(token, effect, enable = true) {
  const uuid = token.actor.uuid;
  if ( !(enable ^ game.dfreds.effectInterface.hasEffectApplied(effect, uuid)) ) return;
  game.dfreds.effectInterface.toggleEffect(effect, { uuids: [uuid] });
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
Select an actor and target 1+ tokens

messages = [...game.messages].sort((a, b) => b.timestamp - a.timestamp)


caster = canvas.tokens.controlled[0]
targets = [...game.user.targets]
args = [{
  actor: caster.actor,
  tokenId: caster.id,
  targets: targets.map(t => t.document),
  spellLevel: 1,
  itemCardId: ""
}]

*/

console.log("Sleep Macro|args", args);
const { spellLevel, itemCardId } = args[0];
const sleep_roll = await new Roll(`${(spellLevel * 2) + 3}d8`).roll({ async: true });
await game.dice3d?.showForRoll(sleep_roll); // Roll 3d dice if available
console.log(`Sleep Macro|HP: ${sleep_roll.result}`);

// Sort targets low -> high HP;
const targets = args[0].targets.map(tokenD => tokenD.object);
targets.sort((a,b) => getProperty(a.actor, HP_PROPERTY) - getProperty(b.actor, HP_PROPERTY));
// Debug HP: console.table(targets.map(t => getProperty(t.actor, HP_PROPERTY)))

let remainingSleepHp = sleep_roll.result;
const chatAdditions = [];
for(const target of targets) {
  const tActor = target.actor;
  const hp = getProperty(tActor, HP_PROPERTY);
  const { name: targetName, id: targetId } = target;
  const targetImage = target.document.texture.src

  if( hp > remainingSleepHp || isUnconscious(tActor) || immuneToSleep(tActor) || isAsleep(tActor) ) {
    // Target unaffected
    // Add some console logging to track why a target was not affected
    // inefficient to repeat, but easier for testing
    const reason = (isUnconscious(tActor) ? " (Unconscious!)" : "")
      +  (immuneToSleep(tActor) ? " (Immune!)" : "")
      + (isAsleep(tActor) ? " (Already asleep!)" : "")

    console.log(`Resisted\t${targetName} | Total HP: ${hp}${reason}`);

    // Add to chat message
    chatAdditions.push(`<div class="midi-qol-flex-container"><div>does not affect</div><div class="midi-qol-target-npc midi-qol-target-name" id="${targetId}"> ${targetName}</div><div><img src="${targetImage}" width="30" height="30" style="border:0px"></div></div>`);
  } else {
    // Target asleep
    // HP remaining
    remainingSleepHp -= hp;
    console.log(`Sleeping\t${target.name} Total HP: ${hp} (Remaining SleepHP: ${remainingSleepHp})`);
    chatAdditions.push(`<div class="midi-qol-flex-container"><div>affects</div><div class="midi-qol-target-npc midi-qol-target-name" id="${targetId}"> ${targetName}</div><div><img src="${targetImage}" width="30" height="30" style="border:0px"></div></div>`);

    // Put the target to sleep
    await applyEffect(target, SLEEP_EFFECT_NAME)
  }
}

// Update the chat message for the sleep spell indicating who is asleep
//await wait(500);
const results_txt = `<div><div class="midi-qol-flex-container"><em>${sleep_roll.result} total HP affected.</em>\n </div><div class="midi-qol-nobox">${chatAdditions.join('')}</div></div>`;
const chatMessage = game.messages.get(itemCardId);
let content = duplicate(chatMessage.content);
const searchString =  /<div class="midi-qol-damage-roll">[\s\S]*<div class="end-midi-qol-damage-roll">/g;
const replaceString = `<div class="midi-qol-damage-roll"><div class="midi-qol-damage-roll">${results_txt}`;
content = content.replace(searchString, replaceString);
await chatMessage.update({ content });
