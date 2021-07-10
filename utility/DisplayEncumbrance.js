// Display encumbrance of selected tokens to Dialog

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
}


const tokens = RetrieveSelectedTokens();
if(tokens.length === 0) {
  ui.notifications.error("Please select 1 or more tokens.");
  return;
}

// run through each token, pulling encumbrance data from the underlying actor
const encumbrance_data = tokens.map(t => {
  const encumbrance_value = t.actor.data.data.attributes.encumbrance.value;
  const encumbrance_max = t.actor.data.data.attributes.encumbrance.max;
  const encumbrance_pct = t.actor.data.data.attributes.encumbrance.pct;
  return { name: t.name,
           value: encumbrance_value,
           max: encumbrance_max,
           percent: encumbrance_pct }
  
});

// set up a chat message listing encumbrance for all
let chatContent = `<u>Encumbrance</u><br>`
encumbrance_data.forEach(e => {
  chatContent += `<b>${e.name}:</b> ${e.value}/${e.max} (${Math.round(e.percent)}%)<br>`;
});

const chatData = {
  user: game.user._id,
  speaker: ChatMessage.getSpeaker(),
  content: chatContent,
  type: CONST.CHAT_MESSAGE_TYPES.OTHER
};
ChatMessage.create(chatData);