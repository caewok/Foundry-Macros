// Enable vision for selected tokens

async function vision_on() {
   await canvas.tokens.updateAll(
    t => ({_id: t.id, vision: true}),
    t => canvas.tokens.controlled.includes(t)
   );
}
vision_on();

ui.notifications.info(`Vision enabled for ${canvas.tokens.controlled.length} selected tokens.`);