// Add DAE to spell item:
// - Duration (Seconds): 600
// - Effects: macro.execute Custom SpiritGuardiansDamage @token @spellLevel @attributes.spelldc
// - Effects: data.attributes.movement.all CUSTOM /2
// Optional to have targets glow
// - Effects: macro.tokenMagic Custom glow

// Auras:
// - Effect is Aura √
// - Ignore self √
// - Aura targets All 
// - Aura radius 15
// - Only apply during the current combatants' turn √
// - Only trigger the aura once per turn √

LOG_PREFIX = "Spirit Guardians|"

console.log(LOG_PREFIX, args);
//let target_token_id = args[1];
let spell_level = args[2];
let spell_dc = args[3];
let tactor_info = args[4];

// tactor_info has:
// actorId, efData, effectId, origin, tokenId

// underlying target token has:
// data._id, data.name (token name), 

const target_token_id = tactor_info.tokenId;
const target_actor_id = tactor_info.actorId;
let target_token = canvas.tokens.get(target_token_id);
let target_actor = game.actors.get(target_actor_id);
const target_token_name = target_token.data.name;


// origin example: "Actor.aICHflPcCHEbH1PY.OwnedItem.5Dvv7quJ3iaehoO3"
const origin_actor_id = tactor_info.origin.match(/Actor[.]([a-z0-9A-Z]+)[.]/)[1];
let origin_actor = game.actors.get(origin_actor_id);
console.log(origin_actor);

const origin_actor_name = origin_actor.data.name;
const origin_actor_spelldc = origin_actor.data.data.attributes.spelldc;

if(target_actor_id == origin_actor_id) {
  console.log(LOG_PREFIX + `Skipping self-application to ${origin_actor_name}.`)
 
} else if(args[0] == "on") {
  ui.notifications.info(LOG_PREFIX + `${origin_actor_name} will damage ${target_token_name} now! Spell Level: ${spell_level}; DC : ${origin_actor_spelldc}`);
  
  ExecuteSpiritGuardians(origin_actor, target_actor, target_token, origin_actor_spelldc, spell_level);
  
  

} else if (args[0] == "each") {
  ui.notifications.info(LOG_PREFIX + `${origin_actor_name} will continue to damage ${target_token_name} now! Spell Level: ${spell_level}; DC : ${origin_actor_spelldc}`);
  
  ExecuteSpiritGuardians(origin_actor, target_actor, target_token, origin_actor_spelldc, spell_level);

} else if(args[0] == "off") {
  ui.notifications.info(LOG_PREFIX + `${origin_actor_name} will stop damaging ${target_token_name} now! Spell Level: ${spell_level}`);
}

async function ExecuteSpiritGuardians(origin_actor, target_actor, target_token, dc, spell_level) {
    const flavor = LOG_PREFIX + `${CONFIG.DND5E.abilities["wis"]} Save DC ${dc} Spirit Guardians`;
    let saveRoll = (await target_actor.rollAbilitySave("wis", {flavor, fastforward: true})).total;
    
    // Spirit Guardians is 3d8 at 3rd level; increases 1d8 per level
    if(spell_level < 3) spell_level = 3;
    
    let damageRoll = new Roll(`${spell_level}d8`).roll();
    let halfDamage = Math.floor(damageRoll.total/2);

    if(saveRoll < dc ) {
        // args: actor, token, damageTotal, damageType, targets, roll, options
        console.log(LOG_PREFIX + `Applying full damage to ${target_token.data.name}`)
        new MidiQOL.DamageOnlyWorkflow(origin_actor, target_token, damageRoll.total, "radiant", [target_token], damageRoll, {flavor: "Spirit Guardians | Damage Roll", damageList: args[0].damageList});
    }
    
    if(saveRoll >= dc) {
       console.log(LOG_PREFIX + `Applying half damage to ${target_token.data.name}`)
        new MidiQOL.DamageOnlyWorkflow(origin_actor, target_token, halfDamage, "radiant", [target_token], damageRoll, {flavor: LOG_PREFIX + "Damage Roll", damageList: args[0].damageList});
    }
}





