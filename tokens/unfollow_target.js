// From token attacher (TA) Stop Follow!
// modified to allow multiple selections

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
}

const selected_tokens = RetrieveSelectedTokens();

let targets = Array.from(game.user.targets);
if(targets.length > 1) {
		return ui.notifications.error("Can't unfollow more then one token!");
} else if(targets.length < 1) {
  return ui.notifications.error("No target selected!");
}

(async () => {
  await tokenAttacher.detachElementsFromToken(selected_tokens, targets[0], true);
})();
	
	 
selected_tokens.forEach(selected_token => {
	selected_token.control({releaseOthers: true});
	ui.chat.processMessage(`I walk my own path again.`);
});


// reselect all
selected_tokens.forEach(selected_token => selected_token.control({releaseOthers: false}));

ui.notifications.info(`${selected_tokens.length} tokens no longer following ${targets[0].name}.`);