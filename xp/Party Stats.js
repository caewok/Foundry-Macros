// ----- Party Statistics ----- //

/*
Pop out message with vitals for the party.
- Name
- Race
- Alignment
- Class(es)
- Level(s)
- XP
- HP
- AC
- Perception
- Stealth
- Walk / Fly / Swim / Climb
*/

const ACTOR_PROPERTIES = {
  Alignment: "system.details.alignment",
  AC: "system.attributes.ac.value",
  Walk: "system.attributes.movement.walk",
  Fly: "system.attributes.movement.fly",
  Swim: "system.attributes.movement.swim",
  Climb: "system.attributes.movement.climb",
  Perception: "system.skills.prc.passive",
  Stealth: "system.skills.ste.passive"
};

const XP = {
  CURRENT: "system.details.xp.value",
  NEXT: "system.details.xp.max"
};

const HP = {
  CURRENT: "system.attributes.hp.value",
  TOTAL: "system.attributes.hp.max"
};

/**
 * Retrieve actors for all PC tokens on canvas
 * @return {Actor[]}
 */
function RetrievePCTokenActors() {
  return canvas.tokens.placeables.filter(t => t.actor && t.actor.hasPlayerOwner)
    .map(t => t.actor)
    .filter(t => Boolean(t));
}

/**
 * Get all player actors
 * @return {Actor[]}
 */
function RetrievePCActors() {
  return game.actors.filter(a => a.hasPlayerOwner)
}

/**
 * Get the HP for an actor
 * @returns {string} Current HP / Total HP
 */
function actorHP(actor) {
  return `${foundry.utils.getProperty(actor, HP.CURRENT)} / ${foundry.utils.getProperty(actor, HP.TOTAL)}`;
}

/**
 * Retrieve a map of classes and levels for an actor
 * @param {Actor} actor
 * @returns {Map<Class, level>}
 */
function actorClasses(actor) {
  const classItems = actor.items.filter(i => i.type === "class");
  return new Map(classItems.map(i => [i.name, i.system.levels]));
}

/**
 * Retrieve an array of race names for an actor.
 * @param {Actor} actor
 * @returns {string[]} An array of race names
 */
function actorRaces(actor) {
  const raceItems = actor.items.filter(i => i.type === "race");
  return raceItems.map(i => i.name);
}


/**
 * Build html row for the actor.
 * @param {Actor} actor
 * @returns {html}
 */
function buildActorRow(actor) {
  const getProperty = foundry.utils.getProperty;
  let tableRow = [];

  tableRow.push(`<td class="icon"><img src="actor.img" width="32" height="32"></td>`);
  tableRow.push(`<td class="character">${actor.name}</td>`);
  tableRow.push(`<td class="hp">${actorHP(actor)}</td>`);

  const classes = [];
  for ( const [className, level] of actorClasses(actor) ) classes.push(`${className} (${level})`);
  tableRow.push(`<td class="class">${classes.join(", ")}</td>`);

  const currHP = getProperty(actor, XP.CURRENT);
  const nextHP = getProperty(actor, XP.NEXT);
  tableRow.push(`<td class="xp">${currHP} / ${nextHP} (${Math.round(currHP / nextHP * 100)}%)</td>`);

  const races = actorRaces(actor);
  tableRow.push(`<td class="race">${races.join(", ")}</td>`);

  for ( const prop of Object.values(ACTOR_PROPERTIES) ) {
    const value = getProperty(actor, prop);
    tableRow.push(`<td class="property">${value}</td>`);
  }

  return `
    <tr class="character-row">
      ${tableRow.join("\n\t\t")}
    </tr
  `;
}

function buildHeaderRow() {
  let tableRow = ["", "Name", "HP", "Class", "XP", "Race"];
  tableRow.push(...Object.keys(ACTOR_PROPERTIES));
  tableRow = tableRow.map(label => `<th>${label}</th>`);
  return `<tr>
    ${tableRow.join("\n\t")}
  </tr>`;
}



// Get the actors.
let actors = RetrievePCTokenActors();
if ( !actors.length ) actors = RetrievePCActors();

// Construct actor table
const tableHead = `<thead>${buildHeaderRow()}</thead>`;
const tableBody = `<tbody>${actors.map(actor => buildActorRow(actor)).join("\n\t\t")}</tbody>`;
const table = `<table id='worksheet_table' class="table table-striped">
  ${tableHead}
  ${tableBody}
 </table>`;


foundry.applications.api.DialogV2.prompt({
  content: table,
  modal: true,
  rejectClose: false
})

