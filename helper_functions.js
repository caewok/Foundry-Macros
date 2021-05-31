// Helper functions used throughout

/** 
 * Retrieve NPC tokens on canvas
 * @return Array of tokens
 */
function RetrieveNPCTokens() {
  const tokens = canvas.tokens.placeables.filter((token) => token.data);
  return tokens.filter(t => t.actor && !t.actor.hasPlayerOwner);
} 

/** 
 * Retrieve hostile NPC tokens on canvas
 * @return Array of tokens
 */
function RetrieveHostileNPCTokens() {
  const tokens = canvas.tokens.placeables.filter((token) => token.data);
  return tokens.filter(t => t.actor && t.data.disposition === -1 && !t.actor.hasPlayerOwner);
} 

/**
 * Retrieve PC tokens on canvas
 * @return Array of tokens
 */
function RetrievePCTokens() {
  const tokens = canvas.tokens.placeables.filter((token) => token.data);
  return tokens.filter(t => t.actor && t.actor.hasPlayerOwner);
}

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
}

/**
 * Pull the actor data for the token
 * @token_array Array of tokens
 * @return array of actors
 */
function RetrieveActorsForTokens(token_array) {
  return token_array.map(t => t.actor)
}

/**
 * Retrieve visible tokens
 * For GM, all will be visible unless 1 or more tokens are selected.
 * Combined vision for all tokens selected.
 */
function RetrieveVisibleTokens() {
  return canvas.tokens.children[0].children.filter(c => c.visible);
}

/**
 * Retrieve actor by id.
 */
function RetrieveActor(id) { return game.actors.get(id); }

/**
 * Retrieve token by id.
 */
function RetrieveToken(id) { return canvas.tokens.get(id); }

/**
 * Retrieve visible tokens for token
 * To accomplish this, the token is temporarily selected.
 * Will fail if GM has Less Fog or similar module and has 
 * enabled see all tokens. 
 */
function RetrieveVisibleTokensForToken(the_token) {
  const selected_tokens = RetrieveSelectedTokens()
  the_token.control({releaseOthers: true});
  the_token.refresh()
  
  const visible_tokens = RetrieveVisibleTokens()
  
  the_token.release();
  the_token.refresh();
  
  // reselect all
  selected_tokens.forEach(t => {
    t.control({releaseOthers: false});
    t.refresh();
  });
  
  return visible_tokens;
}

/**
 * Wait for given number of milliseconds.
 * Example: await wait(1000)
 */
async function wait(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}



/**
 * Test for blank or empty string
 * https://stackoverflow.com/questions/154059/how-can-i-check-for-an-empty-undefined-null-string-in-javascript
 * @str String or object
 * @return True if object is blank ("") or empty.
 */  
function isEmpty(str) {
    const is_empty = (!str || /^\s*$/.test(str));
    //console.log("isEmpty? " + is_empty);
    return is_empty;
  }
  
  
/**
 * Convert dialog to a promise to allow use with await/async.
 * @content HTML content for the dialog.
 * @return Promise for the html content of the dialog
 * Will return "Cancel" or "Close" if those are selected.
 */
function dialogPromise(content) {
  return new Promise((resolve, reject) => {
    dialogCallback(content, (html) => resolve(html)); 
  });
}

/**
 * Create new dialog with a callback function that can be used for dialogPromise.
 * @content HTML content for the dialog.
 * @callbackFn Allows conversion of the callback to a promise using dialogPromise.
 * @return rendered dialog.
 */
function dialogCallback(content, callbackFn) {
	let d = new Dialog({
		title: titleLabel,
		content: content,
		buttons: {
			one: {
				icon: '<i class="fas fa-check"></i>',
				label: confirmButton,
				callback: (html) => callbackFn(html)
			},
			two: {
				icon: '<i class="fas fa-times"></i>',
				label: cancelButton,
				callback: () => callbackFn("Cancel")
			}
			},
		default: "two",
		close: () => callbackFn("Close")
	});
	d.render(true);
}
