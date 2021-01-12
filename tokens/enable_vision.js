// Enable vision for selected tokens

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
}


let selected_tokens = RetrieveSelectedTokens();
for ( let token of selected_tokens ) {
  token.update({ vision: true });
}

ui.notifications.info(`Vision enabled for ${selected_tokens.length} selected tokens.`);