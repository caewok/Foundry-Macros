// From (TA) Follow Target
// modified to handle multiple selected tokens.

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
		return ui.notifications.error("Can't follow more then one token!");
} else if(targets.length < 1) {
  return ui.notifications.error("No target selected!");
}

(async () => {
	await tokenAttacher.attachElementsToToken(selected_tokens, targets[0], true);
	await tokenAttacher.setElementsLockStatus(selected_tokens, false, true);
})();
	 
selected_tokens.forEach(selected_token => {
	selected_token.control({releaseOthers: true});
	ui.chat.processMessage(`I follow ${targets[0].name}`);
});

// reselect all
selected_tokens.forEach(selected_token => selected_token.control({releaseOthers: false}));

ui.notifications.info(`${selected_tokens.length} tokens following ${targets[0].name}.`);