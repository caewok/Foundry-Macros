// based on @ccjmk macro for sleep. Gets targets and ignores those who are immune to sleep.
// Requires https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/Callback Macros/Cub_Condition.js

// Sleep is 5d8 at first level; 2d8 for each additional spell slot level

async function wait(ms) {return new Promise(resolve => {setTimeout(resolve, ms);});}

(async ()=>{

console.log("Sleep Macro|args", args[0]);

const sleep_roll = new Roll(`${(parseInt(args[0].spellLevel) * 2) + 3}d8`).evaluate();
sleep_roll.toMessage({ flavor: `Number of HP affected by <em>sleep</em> cast by <b>${args[0].actor.name}</b>.`});
const sleepHp = sleep_roll.result;
 
console.log(`Starting Sleep macro with sleepHp =>`,sleepHp);
// Get Targets
let targets = await args[0].targets.filter(a=> !canvas.tokens.get(a._id).actor.data.data.traits.ci.custom?.includes("Sleep")).sort((a,b) => canvas.tokens.get(a._id).actor.data.data.attributes.hp.value < canvas.tokens.get(b._id).actor.data.data.attributes.hp.value ? -1 : 1);
let Cub_Condition = game.macros.getName("Cub_Condition");
let remainingSleepHp = await sleepHp;
const condition = "Unconscious";
let slept_target = [];
for(let i = 0; i < await targets.length; i++) {
  let target = await canvas.tokens.get(targets[i]._id);
  let targetHpValue = target.actor.data.data.attributes.hp.value;
  if(targetHpValue != 0){
  if (game.cub.hasCondition(condition, target)){
    console.log(`Skipping =>`, target.name);
    slept_target.push(`<div class="midi-qol-flex-container"><div>skip</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
    }
    if((remainingSleepHp >= targetHpValue) && (!game.cub.hasCondition(condition, target))){
      remainingSleepHp -= targetHpValue;
      console.log(`Sleeping =>`,target.name, `Total HP:`, targetHpValue, `Remaining SleepHP:`, remainingSleepHp);
      slept_target.push(`<div class="midi-qol-flex-container"><div>affects</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
      Cub_Condition.execute(target.id, condition, "add");
    }
    if((remainingSleepHp < targetHpValue) && (!game.cub.hasCondition(condition, target))) {
      console.log(`Resisted =>`, target.name,`Total HP:`,targetHpValue);
      slept_target.push(`<div class="midi-qol-flex-container"><div>does not affect</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
    }
  }
}
await wait(500);
let slept_list = slept_target.join('');
let slept_results = `<div><div class="midi-qol-nobox">${slept_list}</div></div>`;
const chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
const searchString =  /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${slept_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({content: content});
})();