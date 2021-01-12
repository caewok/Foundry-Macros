//This macro plays the animation on selected targets with a trajectory and distances of 30ft, 60ft and 90ft
//It works for animations like Scorching Ray, Fire Bolt, Arrow, Boulder Toss, Siege Projectile that use these distances
//Import this macro, duplicate it and change its name making sure it's unique by adding the colour (i.e. "Ray Of Frost Blue").
//If it has the exact same name as the spell or item you want to trigger it from, you'll encounter an issue.

//folder 01 is the directory path to the assets
// let folder01 = "modules/jb2a_patreon/Library/2nd_Level/Scorching_Ray/";
//anFile30 points to the file corresponding to 30ft, anFile60 for 60ft and anFile90 for 90ft
// let anFile30 = `${folder01}ScorchingRay_01_Orange_30ft_1600x400.webm`;
// let anFile60 = `${folder01}ScorchingRay_01_Orange_60ft_2800x400.webm`;
// let anFile90 = `${folder01}ScorchingRay_01_Orange_90ft_4000x400.webm`;

//How this macro is set up for Fire Bolt
let folder01 = "modules/jb2a_patreon/Library/Cantrip/Fire_Bolt/";


// Select color at random

const colors = ["Regular_Orange", "Dark_Red", "Regular_Blue", "Regular_Green", "Regular_Purple"];


function select_random_item(items) {
  //console.log(items);
  const idx = Math.floor(Math.random()*items.length);
  //console.log(idx);
  return items[idx];
}

const chosen_color = select_random_item(colors);
//console.log(chosen_color);


let anFile30 = `${folder01}FireBolt_01_${chosen_color}_30ft_1600x400.webm`;
let anFile60 = `${folder01}FireBolt_01_${chosen_color}_60ft_2800x400.webm`;
let anFile90 = `${folder01}FireBolt_01_${chosen_color}_90ft_4000x400.webm`;

console.log(anFile30)

if(game.user.targets.size == 0) ui.notifications.error('You must target at least one token');
if(canvas.tokens.controlled.length == 0) ui.notifications.error("Please select your token");
///Check if Module dependencies are installed or returns an error to the user
if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function Cast() {
var myStringArray = Array.from(game.user.targets)[0];
var arrayLength = game.user.targets.size;
for (var i = 0; i < arrayLength; i++) {

let mainTarget = Array.from(game.user.targets)[i];
let myToken = canvas.tokens.controlled [0];

let ray = new Ray(myToken.center, mainTarget.center);
let anDeg = -(ray.angle * 57.3);
let anDist = ray.distance;


let anFile = anFile30;
let anFileSize = 1200;
let anchorX = 0.125;
switch(true){
 case (anDist<=1200):
    anFileSize = 1200;
    anFile = anFile30;
    anchorX = 0.125;
    break;
 case (anDist>2400):
    anFileSize = 3600;
    anFile = anFile90;
    anchorX = 0.05;
    break;
 default:
    anFileSize = 2400;
    anFile = anFile60;
    anchorX = 0.071;
    break;
}

let anScale = anDist / anFileSize;
let anScaleY = anDist <= 600 ? 0.6  : anScale;

let spellAnim = 
                    {
                     file: anFile,
                      position: myToken.center,
                      anchor: {
                       x: anchorX,
                       y: 0.5
                      },
                      angle: anDeg,
                      scale: {
                       x: anScale,
                       y: anScaleY
                      }
                    }; 

canvas.fxmaster.playVideo(spellAnim);
game.socket.emit('module.fxmaster', spellAnim);
await wait (250);
}
}
Cast ()