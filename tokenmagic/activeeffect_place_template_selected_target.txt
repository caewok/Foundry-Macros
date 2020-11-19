// For DAE
// set macro to 
// "macro name" @token @target "template file location"
// e.g. FirebreathFx @token @target "modules/animated-spell-effects/spell-effects/fire/fire_blast_real_right.webm"
console.log(args);

// const TEMPLATE_FILE = "modules/animated-spell-effects/spell-effects/fire/fire_blast_real_right.webm"

// Likely templates:
// Fire breath
// modules/animated-spell-effects/spell-effects/fire/fire_blast_real_right.webm

// Lightning 
// modules/animated-spell-effects/spell-effects/lightning/electricity_l2r.webm

// Magic missile (caution, hurts the gpu)
// modules/animated-spell-effects/spell-effects/magic/magic_missle_02.webm

const TEMPLATE_OPACITY = 0.9;

const selected_id = args[1];
const targeted_id = args[2];
const TEMPLATE_FILE = args[3];

if(args[0] === "off") {
  console.log("Need to turn off template.")
  return;
}

const selected_token = canvas.tokens.get(selected_id);
const targeted_token = canvas.tokens.get(targeted_id);

// console.log(selected_token);
// console.log(targeted_token);

const s = selected_token.center;
const t = targeted_token.center;

// console.log("Selected X,Y: " + s.x + ", " + s.y);
// console.log("Target X,Y: " + t.x + ", " + t.y);



const dist = canvas.grid.measureDistance(s, t);
// console.log("Distance between selected and target: " + dist);


// angle in radians
//const angleRadians = Math.atan2(t.y - s.y, t.x - s.x);
//console.log("Angle (radians): " + angleRadians);

// angle in degrees -- this is what we want for the template
const angleDeg = Math.atan2(t.y - s.y, t.x - s.x) * 180 / Math.PI;
// console.log("Angle (degrees): " + angleDeg);

// turn toward the target
// for tokens, 0 is facing north (up)
selected_token.rotate(angleDeg + 90);

// Draw ray from selected to target
let template = await MeasuredTemplate.create({
  t: "ray",
  user: game.user._id,
  x: s.x,
  y: s.y,
  width: 5,
  direction: angleDeg,
  distance: dist,
  //alpha: 0.4,  
  tmfxTextureAlpha: TEMPLATE_OPACITY, // requires TokenMagicFX
//  _borderThickness: 0,
//  borderColor: "#FF0000",
 // fillColor: "#FF3366",
  texture: TEMPLATE_FILE
});

// console.log(template);

// remove the border
template._borderThickness = 0;

// update the template on the scene
template.refresh();


// set a flag on the token so we can find the template by id



// to find template by id:
// canvas.templates.placeables.find(i => i.data._id == "4WpnklgxbFYsShwP")


// 
// MeasuredTemplate.create({
//   t: "ray",
//   user: game.user._id,
//   x: 1000,
//   y: 1000,
//   direction: 0.45,
//   distance: dist,
//   width: 5,
//   borderColor: "#FF0000",
//   fillColor: "#FF3366",
//   texture: TEMPLATE_FILE
// });

