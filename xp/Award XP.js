// ----------------------------------------------
// AWARD XP
// ----------------------------------------------
// Select one or more characters. If no characters are selected, the macro will use all PCs.
// The dialog permits you to enter total xp or individual xps and vary the weights. 
// On confirmation, the macro applies the xp to each character and outputs a summary to a chat message.

const UPDATE_JOURNAL = true;
const UPDATE_ACTOR_XP = true;

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
 * Test for blank or empty string
 * https://stackoverflow.com/questions/154059/how-can-i-check-for-an-empty-undefined-null-string-in-javascript
 * @str String or object
 * @return True if object is blank ("") or empty.
 */  
function isEmpty(str) {
    const is_empty = (!str || /^\s*$/.test(str));
    console.log("isEmpty? " + is_empty);
    return is_empty;
  }
  
  
// getting all actors of selected tokens
let tokens = RetrieveSelectedTokens();


// if no selected tokens, use all PCs
if (isEmpty(tokens)) {
  tokens = RetrievePCTokens();
}

//console.log(tokens);
const actors = tokens.map( token => token.actor );
//console.log(actors);

//console.log("Actors: " + actors.length);


// ----------------------------------------------
// Constructing the dialog content piecemeal

// JQuery
const dialogHeader = 
`
 <script  src="https://code.jquery.com/jquery-3.4.1.js"   integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="   crossorigin="anonymous"></script>
`;

// CSS
const dialogStyle = 
`
<style>
form {
width:100%;
height:450px;
margin:auto;
position:relative;
}
 input {
width:100%;
height: 25px;
 }
</style> 
`;

// Intro paragraph
const dialogIntro = 
`
<p>Change one or more values in the table and the others should adjust automatically. Ratio defines how the Total Encounter XP is divided among the characters.</p>
`;

// List each actor name in a table, with current XP and inputs for added XP.
let tableRows = ``;
actors.forEach(actor => {
 console.log(actor);
 //console.log("\t" + actor.name + " " + actor.data.data.details.xp.value + " XP");
 
 const actorXP = parseInt(actor.data.data.details.xp.value);
 const actorTotalXP = actorXP + 100;
 
 const tableRow = 
 ` 
   <tr class="character-row">
                <td name="character" class="character">${actor.name}</td>
                <td name="currentXP" class="currentXP">${actorXP}</td>
                <td> <input type="number" name="weight" class="weight" value=1.0 /></td>
                <td> <input type="number" name="encounterXP" class="encounterXP" value=100 /></td>
                
                <td name="totalXP" class="totalXP">${actorTotalXP}</td>
              </tr>
 `;
  tableRows += tableRow;
}) 

// Header for the table of actors.
const tableHead = 
`
<table id='worksheet_table' class="table table-striped">
            <thead>
              <tr>
                <th>Character</th>
                <th>Current XP</th>
                <th>Weight</th>
                <th>Encounter XP</th>
                <th>Total XP</th>
                
              </tr>
            </thead>
            <tbody>
`

// Add entry at the bottom for the total XP for the encounter
const totalEncounterXPValue = 100 * actors.length;
const tableEnd = 
`
 <tr>
                <td colspan="3" id="character" name="blank">Total Encounter Experience</td>
                <td> <input type="number" name="totalEncounterXP" id="totalEncounterXP" class="totalEncounterXP" value=${totalEncounterXPValue}></td>
                
              </tr>
         
            </tbody>
          </table>
`

const dialogTable = tableHead + tableRows + tableEnd;

// JQuery script for live updating of table calculations.
const dialogScript = 
`
<script>
  $('table tbody tr').find('.encounterXP').on('keyup',function() {
    //console.log("EncounterXP KeyUp");
    var currentRow = $(this).parents('tr');
    var currentTbl = currentRow.parent();    
    
    //console.log("\tCurrentRow length: " + currentRow.length);
    
    var currentXP = parseInt(currentRow.find('.currentXP').text())||0;
    //console.log("\tcurrentXP: " + currentXP);
 
    var encounterXP = parseInt(currentRow.find('.encounterXP').val())||0;
    //console.log("\tencounterXP: " + encounterXP);
    
    // update total encounter
    $('table tbody tr').find('.totalEncounterXP').val(40);
    
    
    var totalEncounterXP = 0;
    var encounterXPArray = [];

    $('.encounterXP').each( function(index, element) {
      var encounterXPVal = parseInt( $(this).val() )||0;
      encounterXPArray.push( encounterXPVal );
      
      totalEncounterXP += encounterXPVal;
    });
    
    //console.log("\ttotalEncounterXP: " + totalEncounterXP);
    //console.log("\tencounterXPArray: " + encounterXPArray);    
    //console.log("\ttotalEncounterXP: " + totalEncounterXP);
    currentTbl.find('.totalEncounterXP').val(totalEncounterXP);
    
    // update weights
    $('.weight').each( function(index, element) {
      //console.log("\teXP: " + encounterXPArray[index]);
      
      $(this).val( (encounterXPArray[index] / totalEncounterXP).toFixed(5) );
    })
    
        
    // only need to update totalXP of the current row; other doesn't change
    
    currentRow.find('.totalXP').text(currentXP + encounterXP);
    
    
    
});
 
 $('table tbody tr').find('.weight').on('keyup',function() { 
    //console.log("Weight KeyUp");
    var currentRow = $(this).parents('tr');
    var currentTbl = currentRow.parent();
   
    // Get new weights
    var totalWeights = 0;
    var weightArray = [];

    $('.weight').each( function(index, element) {
      var weightVal = parseFloat( $(this).val() )||0;
      weightArray.push( weightVal );
      
      totalWeights += weightVal;
    });
   
    //console.log("\tWeights: " + weightArray);
   
   
   
    // update EncounterXP
    var totalEncounterXPsum = 0;
    var encounterXPArray = [];
    var totalEncounterXP = parseInt( currentTbl.find('.totalEncounterXP').val() )||0;
    //console.log("\ttotalEncounterXP: " + totalEncounterXP);
    
    
    $('.encounterXP').each( function(index, element) {
      var encounterXPval = Math.round((weightArray[index] / totalWeights) * totalEncounterXP);
      totalEncounterXPsum += encounterXPval;
      $(this).val(encounterXPval);
      encounterXPArray.push( encounterXPval ); 
    });
    //console.log("\tEncounterXPs: " + encounterXPArray);
   
    // Total EncounterXP does not change but should be updated in case of rounding
    currentTbl.find('.totalEncounterXP').val(totalEncounterXPsum);
   
   
    // Recalculate TotalXP 
    var currentXPArray = [];
    $('.currentXP').each( function(index, element) {
      var currentXPval = parseInt( $(this).text() )||0;
      currentXPArray.push( currentXPval );
    });
    
    
    $('.totalXP').each( function(index, element) {
      $(this).text( (currentXPArray[index] + encounterXPArray[index]))
    });
    
   
 });
  
 $('table tbody tr').find('.totalEncounterXP').on('keyup',function() { 
    //console.log("totalEncounterXP KeyUp");
    var currentRow = $(this).parents('tr');
    var currentTbl = currentRow.parent();
    var totalEncounterXP = parseInt( currentTbl.find('.totalEncounterXP').val() )||0;
   
    // appportion total to EncounterXPs
    var totalWeights = 0;
    var weightArray = [];

    $('.weight').each( function(index, element) {
      var weightVal = parseFloat( $(this).val() )||0;
      weightArray.push( weightVal );
      totalWeights += weightVal;
    });
   
    var encounterXPArray = [];
    $('.encounterXP').each( function(index, element) {
      var encounterXPval = Math.round((weightArray[index] / totalWeights) * totalEncounterXP);
      $(this).val(encounterXPval);
      encounterXPArray.push( encounterXPval ); 
    });
   
    // Recalculate TotalXP 
    var currentXPArray = [];
    $('.currentXP').each( function(index, element) {
      var currentXPval = parseInt( $(this).text() )||0;
      currentXPArray.push( currentXPval );
    });
    
    
    $('.totalXP').each( function(index, element) {
      $(this).text( (currentXPArray[index] + encounterXPArray[index]))
    });
   
   
 });
 
 
</script>

`;

// Combine the above parts to create the full dialog
const dialogContent = dialogHeader + dialogStyle + dialogIntro + dialogTable + dialogScript;

/**
 * Award XP to a set of actors
 * @totalAmount The total XP to be awarded. Only needed for the chat content.
 * @amountArray Array of integers representing XP to award, corresponding to each actor.
 */
async function award_xp(totalAmount, amountArray) {

  //console.log("TotalEncounterXP: " + totalAmount);
  //console.log("Amount.Length: " + amountArray.length);
  //console.log("Amount (0): " + amountArray[0].value);
  
  let chatContent = `
      <em>${canvas.scene.name}</em><br>
			<b>${totalAmount} Experience Awarded!</b>
			`;
  
  actors.forEach(actor => {
    var index = actors.indexOf(actor);
    var awardAmount = parseInt( amountArray[index].value );
    console.log("Awarding " + awardAmount + " to " + actor.name);
    chatContent += `<br>${awardAmount} added to ${actor.name}.`;
    
    if(UPDATE_ACTOR_XP) {
    await actor.update({
       "data.details.xp.value": actor.data.data.details.xp.value + awardAmount
        });
    }
        
    if(UPDATE_JOURNAL) {
    const current_notes = actor.data.data.details.hasOwnProperty("notes") ? actor.data.data.details.notes.value : "";
    
    const updated_notes = current_notes + `
      <p><em>${canvas.scene.name}</em> ${awardAmount} XP earned.</p>
    `
    await actor.update({
      "data.details.notes": {value: updated_notes}
    
    });
    
    }
        
  })
  
  let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: chatContent,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
      };
      ChatMessage.create(chatData);
}

// Present dialog to permit GM enter the total XP and tweak the amounts.
new Dialog({
    title: "Award Party XP",
    content: dialogContent,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: "Confirm",
        callback: (html) =>
        {
          let totalAmount = html.find('[id=totalEncounterXP]')[0].value;
          let amountArray = (html.find('[name=encounterXP]'));
          //console.log("totalAmount: " + totalAmount);
          //console.log(amountArray);
          award_xp(totalAmount, amountArray);
        }
      },
      two: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
      }
    },
    default: "Cancel"
  }).render(true);
