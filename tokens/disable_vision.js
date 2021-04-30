// Disable vision for selected tokens

async function vision_off() {
   await canvas.tokens.updateAll(
    t => ({_id: t.id, vision: false}),
    t => canvas.tokens.controlled.includes(t)
   );
}
vision_off();

ui.notifications.info(`Vision disabled for ${canvas.tokens.controlled.length} selected tokens.`);