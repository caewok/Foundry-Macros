// controlled returns an array
// can be any selected object.
// if actor token, will have actor.data and actor._data
// has _validPosition.x and _validPosition.y
// console.log(canvas.tokens.controlled);


// targets returns a set
// has entries array
// each has _validPosition.x, _validPosition.y

// console.log(game.user.targets);

const selected_id = canvas.tokens.controlled[0].data._id;
const targeted_id = [...game.user.targets][0].data._id;

// console.log(selected);
// console.log(target);
// 
// console.log(selected.center);
// console.log(selected.center());


// const selected_token = canvas.tokens.placeables.find(i => i.data._id === selected_id);
// const targeted_token = canvas.tokens.placeables.find(i => i.data._id === targeted_id);

const selected_token = canvas.tokens.get(selected_id);
const targeted_id = canvas.tokens.get(targeted_id);

// console.log(selected_token);
// console.log(targeted_token);
// 
// console.log(selected_token.center);
// console.log(targeted_token.center);



// will create an entirely new token overlapping the original
//const s_token = Token.create(selected);
//const t_token = Token.create(target);
// console.log(s_token);
// console.log(t_token);
// 
// console.log(Token.prototype.center.call(selected));
// console.log(Token.prototype.center.call(target));
// 
// console.log(selected.center);
// console.log(target.center);
// 
// console.log(canvas);
// console.log(game.scenes.active);
// console.log("gridDistance: " + game.scenes.active.data.gridDistance);
// console.log("grid width: " + game.scenes.active.data.w);
// console.log("grid height: " + game.scenes.active.data.h);

// 1540, 1820
// 1960, 2380
//const s = {x: selected.x + selected.width, y: selected.y + selected.width};
//const t = {x: target.x + target.width, y: target.y + target.width};

// This works, but will fails for larger creatures
// It is getting the single grid center, not the center of the entire creature
// let s = canvas.grid.getCenter(selected.x, selected.y);
// s = {x: s[0], y: s[1]};
// let t = canvas.grid.getCenter(target.x, target.y);
// t = {x: t[0], y: t[1]};

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


// MeasuredTemplate.create({
//   t: "circle",
//   user: game.user._id,
//   x: 
//   direction: 0,
//   distance: 30,
//   borderColor: "#FF0000",
//   fillColor: "#FF3366",
// });



//const TEMPLATE_FILE = "ui/tiles/fire.jpg"
const TEMPLATE_FILE = "modules/animated-spell-effects/spell-effects/fire/fire_blast_real_right.webm"

const TEMPLATE_OPACITY = 0.9;

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
// template.update({_borderThickeness: 0}); // does not work

// hover over the tokens
// Nope, this hovers the template grid
//template._hover = true;

// update the template on the scene
template.refresh();




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

