// Setup for standalone macro script
let macroPass = "templatePlaced";
let templateUuid = canvas.templates.placeables.at(-1)?.document?.uuid;
let caster = _token;

// Setup for midiqol macro
if ( typeof args !== "undefined" && args.length ) {
  macroPass = args[0].macroPass;
  templateUuid = args[0].templateUuid;
  caster = token;
}

// For midiqol, return early if not a placed template.
// if ( macroPass !== "templatePlaced" ) return;

// Desired template location.
const templateX = caster.x + 70;
const templateY = caster.y + 70;

// Required template flags (for Limits module).
const flags = {
  limits: {
    sight: {
      basicSight: { enabled: true, range: 0 }, // Darkvision
      ghostlyGaze: { enabled: true, range: 0 }, // Ghostly Gaze
      lightPerception: { enabled: true, range: 0 } // Light Perception
    },
    light: { enabled: true, range: 0 }
  }
};

const updateData = {
  flags,
  fillColor: null
};
const templateD = fromUuidSync(templateUuid);
const template = templateD.object;

// Active effect for the attached token.
const effectData = {
  disabled: false,
  icon: "icons/svg/clockwork.svg",
  name: "Darkness Attacher",
  duration: { rounds: 100, seconds: 600 }
};

/* Dialog options:
1. User closes. No action taken.
2. User selects "Yes" to cast on self.
- template is moved to originate at caster
- limits flags added to template
- template is attached to token
3. User selects "No":
- template is not moved
- limits flags added to template

*/
await new Dialog({
  title: "Cast on Self",
  content: "<p>Would you like to cast this spell on yourself?</p>",
  buttons: {
    yes: {
      label: "Yes",
      callback: async (html) => {
        updateData.x = templateX;
        updateData.y = templateY;
        await templateD.update(updateData);
        template.attachToken(caster, effectData);
      }
    },
    no: {
      label: "No",
      callback: async (html) => {
        await templateD.update(updateData);
      },
    }
  },
  default: "No"
}).render(true);
