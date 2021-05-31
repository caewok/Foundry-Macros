// Dragon's Breath item macro
// Based on https://github.com/Kekilla0/Personal-Macros/blob/master/5e/Item%20Macros/Spells/Level%200/Shillelagh.js

//check for all error message needs
if(!game.modules.get("about-time").active) return ui.notifications.error(`About Time isn't Loaded`);

//instantiate variables (macro, quarterstaff)
const ActorItemMacro = game.macros.entities.find(m=>m.name==="ActorItem");

//cast spell
await game.dnd5e.rollItemMacro("Dragon's Breath");

// add the item to actor
// unclear how to get the actual actor as Item Macro does not pass it along.



game.dnd5e.rollItemMacro("Shillelagh").then(()=> {
	//call macro, set condition + time
	macro.execute(game.user.character.name,"Shillelagh",1,"");
	//get old information
	let qOld_ability = quarterstaff.data.ability;
	let qOld_damage = quarterstaff.data.damage.parts[0][0];
	//update weapon
	copy_quarterstaff.data.ability= "wis";
	copy_quarterstaff.data.damage.parts[0][0] = "1d8+@mod";
	game.user.character.updateEmbeddedEntity("OwnedItem",copy_quarterstaff);
	//revert weapon
	game.Gametime.doIn({minutes:1},() => {
		copy_quarterstaff.data.ability = qOld_ability;
		copy_quarterstaff.data.damage.parts[0][0] = qOld_damage;
		game.user.character.updateEmbeddedEntity("OwnedItem",copy_quarterstaff);
	});
});