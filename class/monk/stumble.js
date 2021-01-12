// Stumble 5 feet in a random direction (1d8)
// If space is free, move there
// If occupied, have the target roll Str check to avoid being knocked prone.
// DC 8 + Str + prof

// Measurement ideas mainly from
// https://github.com/otigon/Foundry-Macros/blob/main/Projectiles%20to%20Target%20and%20Spell%20on%20Target


/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
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
async function shoveDialogPromise(content) {
  return new Promise((resolve, reject) => {
    shoveDialogCallback(content, (html) => resolve(html)); 
  });
}

/**
 * Create new dialog with a callback function that can be used for dialogPromise.
 * @content HTML content for the dialog.
 * @callbackFn Allows conversion of the callback to a promise using dialogPromise.
 * @return rendered dialog.
 */
function shoveDialogCallback(content, callbackFn) {
	let d = new Dialog({
		title: "Shove",
		content: content,
		buttons: {
			one: {
				icon: '<i class="fas fa-check"></i>',
				label: "Knock Prone",
				callback: (html) => callbackFn("Prone")
			},
			two: {
				icon: '<i class="fas fa-times"></i>',
				label: "Shove 5 ft.",
				callback: () => callbackFn("Shove")
			}
			},
		default: "two",
		close: () => callbackFn("Close")
	});
	d.render(true);
}


/* 
 * Given a direction between 1 and 8, assign a cardinal direction.
 * Use the given token location and direction to provide the coordinates of the adjacent square.
 * @direction_choice 1 to 8
 * @current_location Point {x, y}
 * @return direction and new location
 */
function stumbleDirection(direction_choice, current_location) {
  let direction = "none";
	let stumble_square = { x: current_location.x, y: current_location.y };
	switch(direction_choice) {
		case 1: 
			direction = "north";
			stumble_square = { x: current_location.x, y: current_location.y - canvas.scene.data.grid };
			break;
		case 2: 
			direction = "northeast";
			stumble_square = { x: current_location.x + canvas.scene.data.grid, y: current_location.y - canvas.scene.data.grid };
			break;
		case 3: 
			direction = "east";
			stumble_square = { x: current_location.x + canvas.scene.data.grid, y: current_location.y };
			break;
		case 4: 
			direction = "southeast";
			stumble_square = { x: current_location.x + canvas.scene.data.grid, y: current_location.y + canvas.scene.data.grid };
			break;    
		case 5: 
			direction = "south";
			stumble_square = { x: current_location.x, y: current_location.y + canvas.scene.data.grid };
			break;  
		case 6: 
			direction = "southwest";
			stumble_square = { x: current_location.x - canvas.scene.data.grid, y: current_location.y + canvas.scene.data.grid };
			break;
		case 7: 
			direction = "west";
			stumble_square = { x: current_location.x - canvas.scene.data.grid, y: current_location.y };
			break;
		case 8: 
			direction = "northwest";
			stumble_square = { x: current_location.x - canvas.scene.data.grid, y: current_location.y - canvas.scene.data.grid };
			break;  
	}
	
	return {
	  direction:  direction,
	  stumble_square: stumble_square,
	};

}


//console.log(canvas.grid);
//console.log(RetrieveSelectedTokens());

let tokens = RetrieveSelectedTokens();

//console.log(tokens);

//console.log(`${tokens[0].data.name}: ${tokens[0].data.x}, ${tokens[0].data.y}`);
//console.log(`${tokens[1].data.name}: ${tokens[1].data.x}, ${tokens[1].data.y}`);




let t = tokens[0];

if(isEmpty(t)) {
  ui.notifications.warn("No token selected to stumble.");
  return;
}


// const skill_roll_test = await t.actor.rollSkill("ath");
// console.log("Rolled skill: " +  skill_roll_test.total);

//console.log(t.actor.rollSkill("ath"));

// Distance between two tokens is exactly the grid size
// at least, on a square grid. 
// x and y are 0,0 in upper left corner
// console.log(canvas.scene.data.grid);


const neighbors = canvas.grid.grid.getNeighbors(t.y, t.x); // row, col
//console.log(neighbors);

// Roll 1d8; display result in chat
let r = new Roll("1d8");
r.evaluate();
//console.log(r.total);

const { direction, stumble_square } = stumbleDirection(r.total, { x: t.data.x, y: t.data.y });

//console.log(`Direction: ${direction} (${stumble_square})`);

const will_collide = t.checkCollision(stumble_square);

const stumble_flavor_msg = 
`${t.name} stumbles ${direction}${will_collide ? " but is blocked by something" : ""}!`

r.toMessage({
	flavor: stumble_flavor_msg,
	speaker: ChatMessage.getSpeaker({token: t}),
  })
  

//console.log(`${t.data.name} ${will_collide ? "will" : "will not"} collide with something by moving ${direction}...`);

let can_move = !will_collide;


// if(can_move) {
//   console.log(`Moving ${direction} (${stumble_square})`);
//   await t.update(stumble_square, {animate: true});
// }


if(!will_collide) {
  // need to check whether a token is already there.
  const tokens_in_path = canvas.tokens.placeables.filter((token) => token.data.x === stumble_square.x & token.data.y === stumble_square.y);
  
  
  if(!isEmpty(tokens_in_path)) {
    can_move = false;  
    console.log(tokens_in_path);
    // apply prone status to any that fail
    
    for(let unfortunate_token of tokens_in_path) {
    
    // cannot use forEach with await
    //tokens_in_path.forEach( function(unfortunate_token) {
      // console.log(`${unfortunate_token.data.name} is in the path of the stumbling ${t.data.name}!`);
      
      
      const dc = ( await t.actor.rollSkill("ath", { messageData: { flavor: `${t.data.name} attempts to shove ${unfortunate_token.data.name}!` } }) ).total;
      
      // choose the skill with the higher bonus
      const athletics_bonus = unfortunate_token.actor.data.data.skills.ath.mod + unfortunate_token.actor.data.data.skills.ath.prof;
      
      const acrobatics_bonus = unfortunate_token.actor.data.data.skills.acr.mod + unfortunate_token.actor.data.data.skills.acr.prof;
      
      
      const chosen_skill = athletics_bonus > acrobatics_bonus ? "ath" : "acr";
      
      
      const opposed_check = ( await unfortunate_token.actor.rollSkill(chosen_skill, { messageData: { flavor: `${unfortunate_token.data.name} is in the path of the stumbling ${t.data.name}!` }}) ).total;
      
      
      console.log(`${t.data.name}: ${dc}; ${unfortunate_token.data.name}: ${opposed_check}`);
      
      if(opposed_check < dc) {
         let shoveChoice = await shoveDialogPromise(`Shove ${unfortunate_token.data.name} five feet ${direction} or knock prone where they stand?`);
      
      //console.log(shoveChoice);
      
      if("Shove" === shoveChoice) {
        let unfortunate_shove = stumbleDirection(r.total, { x: unfortunate_token.data.x, y: unfortunate_token.data.y });
      
        
        const unfortunate_will_collide = unfortunate_token.checkCollision(unfortunate_shove.stumble_square);
        
        if(unfortunate_will_collide) {
          ChatMessage.create({
						user: game.user._id,
						speaker: ChatMessage.getSpeaker(),
						content: `The stumbling ${t.data.name} shoves ${unfortunate_token.data.name} into an obstacle to the ${unfortunate_shove.direction}.`,
});

          
          
        } else {
          ChatMessage.create({
						user: game.user._id,
						speaker: ChatMessage.getSpeaker(),
						content: `The stumbling ${t.data.name} shoves ${unfortunate_token.data.name} five feet.`,
});

        
          // move the target 5 feet
          console.log(`Moving ${unfortunate_token.data.name} ${unfortunate_shove.direction} (${unfortunate_shove.stumble_square})`);
           unfortunate_token.update(unfortunate_shove.stumble_square, {animate: true});
           
           can_move = true;
           
        }
        
      
      } else if("Prone" === shoveChoice) {
          
				ChatMessage.create({
					user: game.user._id,
					speaker: ChatMessage.getSpeaker(),
					content: `The stumbling ${t.data.name} knocks ${unfortunate_token.data.name} prone.`,
});

				if(hasProperty(game, "cub")) {
					game.cub.addCondition("Prone", unfortunate_token);
        } 
        
      }
      
      
      
      }
      
      
     
      
    } // end for
    
  } 

} else {
  console.log("Colliding with something...give up")
}

if(can_move) {
  //console.log(`Moving ${direction} (${stumble_square})`);
  await t.update(stumble_square, {animate: true});
}


  
