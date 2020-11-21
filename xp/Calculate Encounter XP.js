// ----------------------------------------------
// CALCULATE ENCOUNTER XP
// ----------------------------------------------
// Basic XP calculator. Select one or more creatures. 
// Adds up the XP; allows you to de-select or add additional xp for each creature. 
// Ignores PCs.


/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
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

// collect tokens
let tokens = RetrieveSelectedTokens();
//console.log(tokens);

if(isEmpty(tokens)) {
  tokens = RetrieveHostileNPCTokens();
}

if(isEmpty(tokens)) {
 ui.notifications.warn("No selected or NPC tokens found.");
 return;
}

console.log(tokens);


// Construct dialog piecemeal.

// JQuery header
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

// Introductory paragraph
let dialogIntro = 
`
<p>Select the button to include/omit creature from xp. Use a positive or negative integer if XP for the creature should be increased or decreased, respectively.</p>
`;

// Table listing hostile creatures by name, with XP, adjustment box, and totals.
const tableHead = 
`
<form id="xp_form">
<table id='worksheet_table' class="table table-striped">
            <thead>
              <tr>
                <th>Use</th>
                <th>Creature</th>
                <th>XP</th>
                <th>Adjustment</th>
                <th>Total XP</th>
                
              </tr>
            </thead>
            <tbody>
            <input type="reset" id="resetButton" class="resetButton">
`;

let tableRows = ``;
let totalXP = 0;
tokens.forEach(t => {
  
  const xp = parseInt( t.actor.data.data.details.xp.value ) || 0;

  const tableRow = 
`
  <tr class="character-row">
                <td> <input type="checkbox" name="useCreature" class="useCreature" value="1" Checked></td> 
                <td name="creature" class="creature">${t.actor.data.name}</td>
                <td name="creatureXP" class="creatureXP">${xp}</td> &nbsp;
                <td> <input type="number" name="adjustment" class="adjustment" value=0 min="-99999" max="99999"/></td> &nbsp;
                <td name="creatureTotalXP" class="creatureTotalXP">${xp}</td>               
              </tr>
`;
  tableRows += tableRow;
  totalXP += xp;
});


const tableEnd = 
`
              <tr>
                <td colspan="4" id="character" name="blank" style="border-top:4px double; padding-top:1em">Total Encounter Experience</td>
                <td name="totalEncounterXP" id="totalEncounterXP" class="totalEncounterXP" style="border-top:4px double; padding-top:1em">${totalXP}</td>
                
              </tr>
             
         
            </tbody>
  
          </table>
       
</form>
<br>
<br>
`;

const dialogTable = tableHead + tableRows + tableEnd;             
                         
// JQuery to automatically calculate totals.              
const dialogScript = 
`
<script>
  
function recalculate() {
  //console.log("recalculate");
  
  var useCreatureArray = [];
  var creatureXPArray = [];
  var adjustmentArray = [];
                                           
  $('.useCreature').each( function(index, element) {
    var useCreatureVal = $(this).is(':checked');
    useCreatureArray.push( useCreatureVal );
  });
  //console.log("use Creature: " + useCreatureArray);
  
  $('.creatureXP').each( function(index, element) {
    var creatureXPVal = parseInt( $(this).text() )||0;
    creatureXPArray.push( creatureXPVal );
  });
  //console.log("Creature XP: " + creatureXPArray);
  
  $('.adjustment').each( function(index, element) {
    var adjustmentVal = parseInt( $(this).val() )||0;
    adjustmentArray.push( adjustmentVal );
  });
  //console.log("Adjustment: " + adjustmentArray);
    
  var totalEncounterXP = 0;
  $('.creatureTotalXP').each( function(index, element) {
    var totalCreatureVal = useCreatureArray[index] * (creatureXPArray[index] + adjustmentArray[index]);
    $(this).text(totalCreatureVal);
    totalEncounterXP += totalCreatureVal;   
  });
  //console.log("totalEncounterXP: " + totalEncounterXP);
  
  $('.totalEncounterXP').text(totalEncounterXP);
      
}
 
$('.adjustment').keyup(function() {
  //console.log("adjustment change");
  var adjustment = parseInt( $(this).val() );
  //console.log("\tadjustment: " + adjustment);
  
  // if checked, add to total xp
  var currentRow = $(this).parents('tr');
 
  var useCreature = currentRow.find('.useCreature').is(':checked');
  
  if(useCreature) {    
    var creatureXP = parseInt( currentRow.find('.creatureXP').text() )||0;
    var newCreatureXP = (creatureXP + adjustment) * useCreature;
  
    currentRow.find('.creatureTotalXP').text(newCreatureXP);
    //console.log("\tNewCreatureXP: " + newCreatureXP);
    
    // adjust total for the encounter
    // cannot simply adjust total by adjustment, b/c we don't know what the original adjustment was.
    recalculate();
  }
  
 
});


$('.useCreature').change(function() {
  var currentRow = $(this).parents('tr');
  var currentTbl = currentRow.parent();     
  
  var useCreature = $(this).is(':checked');
  //console.log("\tuseCreature: " + useCreature); 
  
  var creatureXP = parseInt( currentRow.find('.creatureXP').text() )||0;
  var creatureAdj = parseInt( currentRow.find('.adjustment').val() )||0;
  var totalEncounterXP = parseInt( currentTbl.find('.totalEncounterXP').text() )||0;
  
  if(useCreature) {
    
    //console.log("\tCreature XP: " + creatureXP + " Adjustment: " + creatureAdj);
    
    currentRow.find('.creatureTotalXP').text(creatureXP + creatureAdj);
    
    // adjust total for the now-added creature
    currentTbl.find('.totalEncounterXP').text(totalEncounterXP + creatureXP + creatureAdj);
    
    
  } else {
    // set total to 0
    //console.log("\tSetting total XP to 0.");
    currentRow.find('.creatureTotalXP').text(0);
    
    // adjust total for the now-missing creature
    currentTbl.find('.totalEncounterXP').text(totalEncounterXP - creatureXP - creatureAdj);
  }
});
  
$('.resetButton').click(function(e) {
  //console.log("Reset");
  e.preventDefault();
  $('#xp_form')[0].reset();  // https://stackoverflow.com/questions/32062897/why-do-i-need-to-click-reset-button-twice-before-the-jqueries-in-it-is-triggered
  recalculate();
});  
  
</script>

`;

// Full dialog content
const dialogContent = dialogHeader + dialogStyle + dialogIntro + dialogTable + dialogScript;

// console.log(dialogContent);

new Dialog({
    title: "Sum Encounter XP",
    content: dialogContent,
    buttons: {
      one: {
        icon: '<i class="fas fa-times"></i>',
        label: "Done",
      }
    },
    default: "Done"
  }).render(true);