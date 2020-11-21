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
