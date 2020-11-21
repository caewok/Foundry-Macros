// Grit & Glory: Raise Shield
// --------------------------
// Melee reaction allows you to raise your shield to gain +2 to AC.
// Shield is damaged by -1 AC in the process.
// The macro finds the actor's shield, asks if more than 1, and 
// decreases the shield AC accordingly. 
// Message indicating that the shield is damaged or destroyed if 0 and non-magical.

// getting all actors of selected tokens
let actors = canvas.tokens.controlled.map(({ actor }) => actor);

// if there are no selected tokens, roll for the player's character.
if (actors.length < 1) {
  actors = game.users.entities.map(entity => {
    if (entity.active && entity.character !== null) {
      return entity.character;
    }
  });
}
const validActors = actors.filter(actor => actor != null);
//console.log(validActors.length + " actors found.");

async function modifyShieldAC(shield, actor) {
  const current_ac = parseInt( shield.data.armor.value );
  
  if(current_ac > 0) {
    const update = {
      _id: shield._id, 
      data: {
        armor: {
          value: current_ac - 1
          }
      }            
    };
    //console.log(update);
    const updated = await actor.updateEmbeddedEntity("OwnedItem", update);
    ui.notifications.info("Shield AC decreased by 1.");
    
    let shield_impact = `${shield.name} damaged!`
    if(current_ac == 1) {
      shield_impact = `${shield.name} broken!`
    } 
    
    let chat_html = 
`
<div class="dnd5e chat-card item-card" data-actor-id="${actor._id}" data-item-id="${shield._id}">
    <header class="card-header flexrow">
        <img src="icons/svg/shield.svg" title="Raise Shield" width="36" height="36" />
        <h3 class="item-name">Raise Shield</h3>
    </header>
    <br>
    ${shield_impact}

    <div class="card-content">
        <p>If you are wielding a shield and another creature hits you with a melee attack you may use your reaction to interpose your shield between yourself and the attack and increase your AC by 2 potentially causing the attack to miss you. Your shield is damaged in the process and suffers a -1 penalty to its AC each time you block in this fashion. If your shield's AC reaches 0, it is destroyed.</p>
<p>Magical shields self repair AC equal to their enchantment bonus each long rest and may block critical hits that meet the above criteria.</p>
    </div>

    <div class="card-buttons">
        
    </div>

    <footer class="card-footer">
        <span>1 Reaction</span>
    </footer>
</div>
`;
    
    
    let chat_data = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: chat_html,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
      };
      ChatMessage.create(chat_data);
    
    
  } else {
    ui.notifications.error("Shield appears to be already broken (AC bonus of 0).");
  }
  
}


if(validActors.length > 1) {
  ui.notifications.error("Please select only one token.");
} else {
  const shields = validActors[0].data.items.filter(it => it.data.hasOwnProperty("armor") && it.data.armor.type === "shield" && it.data.equipped);
  //console.log(shields);
  if(shields.length > 1) {
    ui.notifications.error("Multiple shields found equipped for actor " + validActors[0].data.name + ". Unequip one?");
  
  } else if(shields.length < 1) {
    ui.notifications.error("No shield found (or not equipped) for actor " + validActors[0].data.name);
  } else {
    modifyShieldAC(shields[0], validActors[0]);
  
  }
}


