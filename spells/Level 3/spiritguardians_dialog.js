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

function getDisposition(t) {
  const inverted_disposition_names = invertObject(CONST.TOKEN_DISPOSITIONS)
  return game.i18n.localize(`TOKEN.${inverted_disposition_names[t.data.disposition.toString()]}`);
}

function getRaceGroup(t) {
  return t.actor.data.data.details.race || t.actor.data.data.details.type || "undefined";
}



const LOG = true;
const LOG_PREFIX = "SpiritGuardiansDialog|";

// ---------------- Dialog content constants -------------- //
const DIALOG_TEXT = {
  title: 'Spirit Guardians Unaffected Tokens',
  intro: `Select zero or more of the following visible tokens to be <b>unaffected</b> by <em>spirit guardians</em>.
`,
  all: "All",
  pcs: "PCs",
  npcs: "NPCs",
  pc_race_groups: "PC Races / Types",
  npc_race_groups: "NPC Races / Types"
};

// ---------------- EXTEND TABBED DIALOG CLASS -------- //
class TabbedDialog extends Dialog {
  constructor(data, options) {  
    // setting up tabs here instead of in defaultOptions so that we can easily set the initial tab
    options.tabs = [{navSelector: ".tabs", contentSelector: ".tab-content", initial: options.initial_tab || "tab1"}];
    super(data, options)
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "macro_data/tabbedDialogTemplate.html",
    });
  }
  
  getData() {
    console.log("getData", this);
    // no super to Application
    const data = super.getData();

    data.tabs = this.data.tabs.map((t, idx) => {
      return {
        id: t.id || `tab${idx + 1}`,
        title: t.title || `Tab ${idx + 1}`,
        icon: t.icon || "fas fa-dice-d20",
        content: t.content || ""
      }
    });
    
    data.header = this.data.header;
    data.footer = this.data.footer;
    
    console.log(data);
    
    return data;
  }
    
  activateListeners(html) {
    FormApplication.prototype.
    super.activateListeners(html);
    Application.prototype.activateListeners.call(this, html);  
  }      
}


/*
 * Creates a two-tab interface for selecting items.
 * Tab1: items by groups. For example, PCs, NPCs, Hostiles, Race
 * Tab2: list of items with search box
 * 
 * Items in the list will be selected if the corresponding group is selected.
 * List of checked items will be returned upon dialog close.
 */

- tabs.list.array_data[].group_labels is an Array of strings.
-   each should correspond to the groups.array_data[].label
-   if the group is selected, the list data is searched in order 
-   to check the corresponding checkbox in the item list
*/




// Retrieve visible tokens for the originating actor.
const ORIGINATING_TOKEN = RetrieveSelectedTokens()[0]; // for testing
if(!ORIGINATING_TOKEN) return ui.notifications.error(LOG_PREFIX + "Must select a token.");

const visible_tokens = RetrieveVisibleTokensForToken(ORIGINATING_TOKEN);
log(visible_tokens);

// Set up data required for the dialog
visible_tokens.sort((a, b) => (a.name > b.name ? 1 : -1))

// Map tokens to the data need for the dialog
const tokens_data = visible_tokens.map(t => {
  const groups = [];
  groups.push(t.actor.data.type === "character" ? "PCs" : "NPCs");
  groups.push(getDisposition(t));
  groups.push(getRaceGroup(t));

  return {id: t.data._id,
          label: t.data.name,
          img: t.data.img,
          groups: groups}
});



const template_data = {
  header: DIALOG_TEXT.intro,
  footer: "Test footer",
  tabs: [
    {
      title: "Token Groups",
      icon: "fas fa-dice-d20",
      label: "tab-groups",
      groups: groups_tab_data,
      content: "Tab token groups content."
    },
    
    {
      title: "Token List",
      icon: "fas fa-dice-d20",
      label: "tab-list",
      search: true,
      search_text: "Search for one or more tokens by name...",
      search_column: 2,
      
      // Alphabetical by token name
      items: tokens_data
    }
  ]
};

log("template_data object", template_data);

const select_tokens_dialog = new SelectItemDialog(template_data, {});
select_tokens_dialog.reloadTemplates();

log("Rendering...");

const res = await select_tokens_dialog.render(true);

/* Dialog template
<div class="dialog-content">
    {{{content}}}
</div>
<div class="dialog-buttons">
    {{#each buttons as |button id|}}
    <button class="dialog-button {{cssClass}}" data-button="{{id}}">
        {{{button.icon}}}
        {{{button.label}}}
    </button>
    {{/each}}
</div>

*/


