// DAE Item Macro for handling effects that may be disabled but should be reenabled each turn.

// console.debug("Cloak of Displacement", args, token);

const MIDI_EXPIRATION = "midi-qol:isDamaged";
const status = args[0];
const effectId = args[2].effectId;
let cloakEffect = token.actor.effects.get(effectId);
const hasEffectApplied = cloakEffect && !cloakEffect.disabled;
// console.debug(`Status: ${status}. Actor ${cloakEffect ? "has" : "does not have"} cloak effect. Effect is ${cloakEffect?.disabled ? "disabled" : "enabled"}.`);

switch ( status ) {
  case "off": {
    // If midi-qol is not expiring the effect, then it is likely being deleted and we should return.
    const expirationReason = args[2]["expiry-reason"];
    if ( !expirationReason || expirationReason !== MIDI_EXPIRATION ) return;

    // Check if the effect is added but may need to be disabled.
    if ( cloakEffect && cloakEffect.disabled ) return;
    if ( hasEffectApplied ) return await cloakEffect.update({disabled: true});

    // Need to re-add the cloak as a disabled effect.
    const effectData = args[2].efData;
    effectData.disabled = true;
    return await actor.createEmbeddedDocuments("ActiveEffect", [effectData])
  }

  case "on":
  case "each": {
    if ( hasEffectApplied ) return;
    return await cloakEffect.update({disabled: false});
  }
}
