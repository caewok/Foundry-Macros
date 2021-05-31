// Dialog to select visible tokens for Spirit Guardians
// Dialog options:
// [] PCs
// [] NPCs
// [] Hostiles
// [] Allies
// [] Neutrals
// ------
// PC race 
// --
// [] Race or Type 1
// [] Race or Type 2
// NPC type 
// ------
// tab with list of names and search
// select / deselect all

// For each token in list:
// Img Name (race or type)


// token.data.name
// token.data.img
// token.actor.data._id;
// token.actor.data.type
//  - "character"
// token.actor.data.data.details.race
// - "Variant Human"
// - may be null for NPCs
// token.actor.data.data.details.alignment
// - "Neutral Good"

// token.data.disposition 
// - -1, 0, 1
// pull labels from CONST.TOKEN_DISPOSITIONS

// NPCs
// token.actor.data.data.details.alignment
// - "Any Non-Lawful"
// token.actor.data.data.details.type
// - "Humanoid"

// Foundry default css: \FoundryVTT\resources\app\public\css
// dnd5e css: 

// ---------------- GET VISIBLE --------------------------- // 

/**
 * Retrieve selected tokens
 * @return Array of tokens
 */
function RetrieveSelectedTokens() {
  return canvas.tokens.controlled;
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
 * Retrieve visible tokens for token
 * To accomplish this, the token is temporarily selected.
 * Will fail if GM has Less Fog or similar module and has 
 * enabled see all tokens. 
 */
function RetrieveVisibleTokensForToken(the_token) {
  const selected_tokens = RetrieveSelectedTokens()
  the_token.control({releaseOthers: true});
  the_token.refresh()
  
  let visible_tokens = RetrieveVisibleTokens()
    
  the_token.release();
  the_token.refresh();
  
  // reselect all
  selected_tokens.forEach(t => {
    t.control({releaseOthers: false});
    t.refresh();
  });
  
  // filter out self
  visible_tokens = visible_tokens.filter(t => t.data._id != the_token.data._id);

  return visible_tokens;
}


// ---------------- UTILITY FUNCTIONS --------------------- //
/*
 * Put a consistent prefix on console logs.
 */
function log(...args) {
  try {
    if(LOG) console.log(LOG_PREFIX, ...args);
  } catch(e) {}

}

/*
 * Strip spaces from labels. For use in html ids.
 */
function cleanLabel(label) { return label.split(" ").join(""); }

/* 
 * Map the unique set of race or type for tokens.
 */ 
function getRaceGroups(tokens_arr) {
  const group_names = [...new Set(tokens_arr.map(t => t.actor.data.data.details.race || t.actor.data.data.details.type || "undefined"))];
  
  return group_names;
}

/*
 * Map unique dispositions for tokens
 */
function getDispositions(tokens_arr) {
  // flip the disposition label object so we can localize easily
  const inverted_disposition_names = invertObject(CONST.TOKEN_DISPOSITIONS)
  const dispositions = [...new Set(tokens_arr.map(t => 
  game.i18n.localize(`TOKEN.${inverted_disposition_names[t.data.disposition.toString()]}`)))];
  
  return dispositions;
}




const LOG = true;
const LOG_PREFIX = "SpiritGuardiansDialog|";

// ---------------- Dialog content constants -------------- //
const DIALOG_TEXT = {
  title: 'Spirit Guardians Unaffected Tokens',
  intro: `Select zero or more of the following visible tokens to be unaffected by <em>spirit guardians</em>.
`,
  all: "All",
  pcs: "PCs",
  npcs: "NPCs",
  pc_race_groups: "PC Races / Types",
  npc_race_groups: "NPC Races / Types"
};


// ---------------- Build Dialog Data --------------------- //
// Retrieve visible tokens for the originating actor.
const ORIGINATING_TOKEN = RetrieveSelectedTokens()[0]; // for testing
if(!ORIGINATING_TOKEN) return ui.notifications.error(LOG_PREFIX + "Must select a token.");

const visible_tokens = RetrieveVisibleTokensForToken(ORIGINATING_TOKEN);
log(visible_tokens);

// Set up data required for the dialog
const PCs = visible_tokens.filter(t => t.actor.data.type === "character");
const NPCs = visible_tokens.filter(t => t.actor.data.type === "npc");

log("PCs", PCs);
log("NPCs", NPCs);

let pc_races = getRaceGroups(PCs);
let npc_races = getRaceGroups(NPCs);
log("pc_races", pc_races);
log("npc_races", npc_races);

const dispositions = getDispositions(visible_tokens);
log("dispositions", dispositions);

// ignore if less than 2 separate labels
const disabled_pc_races = (pc_races.length < 2) ? "disabled" : "";
const disabled_npc_races = (npc_races.length < 2) ? "disabled" : "";
const disabled_dispositions = (dispositions.length < 2) ? "disabled" : "";

// listing every actor
const disposition_colors = { "-1": "red",
                             "0" : "black",
                             "1" : "green" };

const token_list = visible_tokens.map(t => {
  return {
    id: t.data._id,
    img: t.data.img,
    name: t.data.name,
    color: disposition_colors[t.data.disposition]
  };
});

const _dialog_data = { 
  pc_races: pc_races.map(r => {
    return { id: cleanLabel(r), label: r };
  }),
  
  npc_races: npc_races.map(r => {
    return { id: cleanLabel(r), label: r };
  }),
  
  dispositions: dispositions.map(r => {
    return { id: cleanLabel(r), label: r }; 
  }),
  
  // Alphabetical by token name
  token_list: token_list.sort((a, b) => (a.name > b.name ? 1 : -1))
};

log(_dialog_data);

// ---------------- Grouping Tab HTML --------------------- //

const _html_groupings_tab = `
<form>
  ${DIALOG_TEXT.intro}
  <hr>
  <div class="form group">
    <input type="checkbox" id="PCs" class="GroupSelection"/>
    <label for="PCs"> ${DIALOG_TEXT.pcs} </label>
    <br>
    <input type="checkbox" id="NPCs" class="GroupSelection"/>
    <label for="NPCs"> ${DIALOG_TEXT.npcs} </label>
    <br>
  </div>
  
  <hr>
  <div class="form group">
    {{#each this.dispositions}}
      <input type="checkbox" id={{this.id}} class="GroupSelection" ${disabled_dispositions}/>
      <label for={this.id}> {{this.label}} </label>
      <br>
    {{/each}}
  </div>
  

  
  <br>
  <h2>${DIALOG_TEXT.pc_race_groups}</h2>
  <div class="form group">
    {{#each this.pc_races}}
      <input type="checkbox" id={{this.id}} class="GroupSelection" ${disabled_pc_races}/>
      <label for={this.id}> {{this.label}} </label>
      <br>
    {{/each}}
  </div>
  
  <br>
  <h2>${DIALOG_TEXT.npc_race_groups}</h2>
  <div class="form group">
    {{#each this.npc_races}}
      <input type="checkbox" id={{this.id}} class="GroupSelection" ${disabled_npc_races}/>
      <label for={this.id}> {{this.label}} </label>
      <br>
    {{/each}}
    <br>	   
  </div>
  <br>


</form>
`;

// ---------------- Token List Tab HTML ------------------- //

const _css = `
<style type="text/css">
  img { border-style: none; }
</style>
`;

const _html_token_list_tab = `
<form>
  ${DIALOG_TEXT.intro}
  <hr>
  <input type="text" id="filter_field" onkeyup="filterFn()" placeholder="Search for tokens by name...">
   <table id='list_table' class="table table-striped">
			<tbody> 
			  {{#each this.token_list}}
			  <tr class="token-row">
			      <td> <input type="checkbox" id={{this.id}} class="GroupSelection"/> </td>
						<td> <label for={{this.id}} style="color:{{this.color}}"> {{this.name}} </label> </td>
						<td> <img src={{this.img}} width="30" height="30" /> </td>
			  </tr>  
			  {{/each}}			  
		 </tbody>
	 </table>
</form>
`;

const filterScript = 
	`
	<script>
	function filterFn() {
	  const input = document.getElementById("filter_field");
		const filter = input.value.toUpperCase();
		const table = document.getElementById("list_table");
		let tr = table.getElementsByTagName("tr");

		// Loop through all table rows, and hide those who don't match the search query
		for (let i = 0; i < tr.length; i++) {
			const td = tr[i].getElementsByTagName("td")[1]; // column to search
			if (td) {
				const txtValue = td.textContent || td.innerText;
				if (txtValue.toUpperCase().indexOf(filter) > -1) {
					tr[i].style.display = "";
				} else {
					tr[i].style.display = "none";
				}
			}
		}	
	}
	</script>
	`;


// Below doesn't work b/c tab content not displayed
// Even with adding to Dialog tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "groupings" }]
// Probably need to switch to FormApplication for this
// const _html_raw = `
// ${_css}
// <!-- Tab links -->
// <nav class="tabs" data-group="primary-tabs">
//     <a class="item" data-tab="groupings"><i class="fas fa-dice-d20"></i> Token Groupings</a>
//     <a class="item" data-tab="list"><i class="fas fa-cogs"></i> Token List</a>
// </nav>
// 
// <section id="dialog-tabs" class="content">
// <div class="tab" data-tab="groupings">
// ${_html_groupings_tab}
// </div>
// 
// <div class="tab" data-tab="list">
// ${_html_token_list_tab}
// </div>
// </section>
// 
// ${filterScript}
// `;

// const _html_raw = `
//  ${_css}
//  ${_html_groupings_tab}
//  <hr>
//  ${_html_token_list_tab}
//  ${filterScript}
// `;

// javascript tabs
// https://www.w3schools.com/howto/howto_js_tabs.asp

const tabScript = `
function openTab(evt, tabName) {
  // Declare all variables
  let i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
} 

`;

const _html_raw = `
${_css}
<!-- Tab links -->
<div class="tabs" data-group="primary-tabs">
  <button class="tablinks" onclick="openTab(event, 'token_groupings_tab')"><i class="fas fa-user-friends"></i> Token Groupings</button>
  <button class="tablinks" onclick="openTab(event, 'token_list_tab')"><i class="fas fa-list-ul"></i> Tokens List</button>>
</div>

<div id="token_groupings_tab" class="tabcontent">
${_html_groupings_tab}
</div>

<div id="token_list_tab" class="tabcontent">
${_html_token_list_tab}
</div>

${filterScript}
${tabScript}
`;

log("raw html", _html_raw);

const _html = Handlebars.compile(_html_raw);

let d = new Dialog({
    title: DIALOG_TEXT.title,
    content: _html(_dialog_data),
    buttons: {
        toggle: {
            icon: '<i class="fas fa-check"></i>',
            label: "Okay",
            callback: () => log("Okay")
        },
    },
    default: "toggle",
    close: html => {
        log(html);
    }
}).render(true);








// ---------------- HTML DIALOG BUILDER ------------------- //
const confirmButton = 'Confirm';
const cancelButton = 'Cancel';
const titleLabel = 'Spirit Guardians Unaffected Tokens';

const allLabel = "All";
const PCsLabel = "PCs";
const NPCsLabel = "Creatures / NPCs";

// Language used in the dialog to select combatants
const selectCombatantsHeaderLabel = "Select Unaffected Targets";
const selectCombatantsParagraph = 
`Select zero or more of the following visible tokens to be unaffected by <em>spirit guardians</em>.
`;


// html for intro
const combatant_selection_intro = 
`
<p>
  <h3> ${selectCombatantsHeaderLabel}</h3>
  ${selectCombatantsParagraph}
  <br>
</p>
`;

// html for the select all toggle
const combatant_selection_all = 
`
<input type="checkbox" id="All" class="AllSelection"/>
<label for="All"><strong> ${allLabel} </strong></label>  
  
&nbsp &nbsp <input type="reset" id="resetButton" class="resetButton">
`;


// All PCs toggle
const combatant_selection_pcs_header = 
`
<input type="checkbox" id="PCs" class="GroupSelection"/>
<label for="PCs"><strong> ${PCsLabel} </strong></label>
<hr width=100 align="left">
`;

// All NPCs toggle
const combatant_selection_npcs_header = 
`
<input type="checkbox" id="Creatures" class="GroupSelection"/>
<label for="Creatures"><strong> ${NPCsLabel} </strong></label>
<hr width=100 align="left">
`;

/**
 * Create html block for selecting a specific race group
 * @label Group label (e.g. undead, variant human, skeleton)
 */
function constructGroupingSelection(group_label, type = "Race") {
  type = type.split(" ").join("");
  const label_clean = group_label.split(" ").join("");

  const html = 
  `
  <input type="checkbox" id="${type}${label_clean}" class="${type}Selection"/>
  <label for="${type}${label_clean}">${group_label}</label>
  `;
  
  return html;
}


/**
 * Create html necessary to display PCs and NPCs by groups.
 * Skip displaying groups if none are available.
 */
function constructSelectionHTML(tokens) {
  const PCs = tokens.filter(t => t.players.length > 0);
  const NPCs = tokens.filter(t => t.players.length === 0);
  
  
  let pc_group_names = [];
  let npc_group_names = [];
  if(PCs.length > 2) {
    pc_group_names = [...new Set(tokens.map(t => t.actor.data.data.details.race || t.actor.data.data.details.type))];
  
		// Don't bother if all a single group
		if(pc_group_names.length < 2) pc_group_names = [];
  }
  
  if(NPCs.length > 2) {
    npc_group_names = [...new Set(tokens.map(t => t.actor.data.data.details.race || t.actor.data.data.details.type))];
  
		// Don't bother if all a single group
		if(npc_group_names.length < 2) npc_group_names = [];
  }
  
  const script_html = constructSelectionScript(PCs, NPCs, pc_group_names, npc_group_names);
  
  if(pc_group_names.length > 1) {
    
  
  }
  
  
  
  

  // main html
  const html =
  `
  <body>
    ${combatant_selection_intro}
    <form>
      ${combatant_selection_all}
      ${combatant_selection_pcs_header}
      <br>
      ${}
      
    </form>
  </body>
  `
  
}





