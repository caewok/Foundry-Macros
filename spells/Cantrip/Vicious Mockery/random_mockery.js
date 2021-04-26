// Draw random mockery from table and post to chat.
// Meant to be used with midi qol On Use Macro
const MOCKERY_TABLE = "Mockeries";

// default mockery if no table found.
let mockery = "Now go away or I shall taunt you a second time-a!";

// functions
function checkTable(table) {
	let results = 0;
	for (let data of table.data.results) {
		if (!data.drawn) {
			results++;
		}
	}
	if (results < 1) {
		table.reset();
		ui.notifications.notify("Table Reset")
		return false
	}
	return true
}




let targets = [];
if(typeof args !== 'undefined' || args[0].targets.length < 1) {
  targets = Array.from(game.user.targets);
  console.log(targets);
  
  if(targets.length < 1) {
    ui.notifications.error("Target must be selected to mock.");
    return;
  }
  
} else {
  targets = args[0].targets;
}


targets.forEach(the_target => {
	console.log("Mockery|the_target", the_target);
	const targetName = the_target.data.name;

	let table = game.tables.entities.find(t => t.name == MOCKERY_TABLE);
	console.log("Mockery|table", table);

	// Roll the result, and mark it drawn
	if (table) {
		if (checkTable(table)) {
			const roll = table.roll();
			const result = roll.results[0];
			console.log("Mockery|roll", roll);
			console.log("Mockery|result", result);
			mockery = result.text;
			table.updateEmbeddedEntity("TableResult", {
				_id: result._id,
				drawn: true
			});
		}
	}
  
	let messageContent = `<p>${token.name} yells at ${targetName},<br><b><i>"${mockery}"</i></b></p>`;

	// create the message
	if (messageContent !== '') {
		let chatData = {
			user: game.user._id,
			speaker: ChatMessage.getSpeaker(),
			content: messageContent,
		};
		ChatMessage.create(chatData, {});
	}
});


  