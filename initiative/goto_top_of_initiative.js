// Macro to jump to the top of the initiative order
// Used when re-rolling initiative, leaving the wrong person on top

if(!game.combat) {
  ui.notifications.error("Combat must first be enabled.");
  return;
}
await game.combat.update({turn: 0});

