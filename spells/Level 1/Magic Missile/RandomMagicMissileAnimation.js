// Based on https://github.com/otigon/Foundry-Macros/blob/main/Magic-Missiles/Blue%20Magic%20Missile

/// This macro pulls from the JB2A list of Blue Magic Missiles to throw 1 random path at targeted token

// for testing, run this from the console with one token selected and another targeted.
// game.macros.getName("JB2A RandomMagicMissile").execute(canvas.tokens.controlled[0].data._id,
//                              Array.from(game.user.targets)[0].data._id,
//                              "Blue");

//args[0] = selected token ID
//args[1] = target token ID
//args[2] = color  // Options: Blue, Green, Purple, Yellow

console.log("JB2A RandomMagicMissile|args", args);

const the_caster = canvas.tokens.get(args[0]);
const the_target = canvas.tokens.get(args[1]);
const color = args[2] ?? "Blue";

if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");

const file = "modules/jb2a_patreon/Library/1st_Level/Magic_Missile/";
const mmA = `${file}MagicMissile_01_${color}_30ft_01_1600x400.webm`;
const mmB = `${file}MagicMissile_01_${color}_30ft_02_1600x400.webm`;
const mmC = `${file}MagicMissile_01_${color}_30ft_03_1600x400.webm`;
const mmD = `${file}MagicMissile_01_${color}_30ft_04_1600x400.webm`;
const mmE = `${file}MagicMissile_01_${color}_30ft_05_1600x400.webm`;
const mmF = `${file}MagicMissile_01_${color}_30ft_06_1600x400.webm`;
const mmG = `${file}MagicMissile_01_${color}_30ft_07_1600x400.webm`;
const mmH = `${file}MagicMissile_01_${color}_30ft_08_1600x400.webm`;
const mmI = `${file}MagicMissile_01_${color}_30ft_09_1600x400.webm`;

const mmAA = `${file}MagicMissile_01_${color}_60ft_01_2800x400.webm`;
const mmBB = `${file}MagicMissile_01_${color}_60ft_02_2800x400.webm`;
const mmCC = `${file}MagicMissile_01_${color}_60ft_03_2800x400.webm`;
const mmDD = `${file}MagicMissile_01_${color}_60ft_04_2800x400.webm`;
const mmEE = `${file}MagicMissile_01_${color}_60ft_05_2800x400.webm`;
const mmFF = `${file}MagicMissile_01_${color}_60ft_06_2800x400.webm`;
const mmGG = `${file}MagicMissile_01_${color}_60ft_07_2800x400.webm`;
const mmHH = `${file}MagicMissile_01_${color}_60ft_08_2800x400.webm`;
const mmII = `${file}MagicMissile_01_${color}_60ft_09_2800x400.webm`;

function random_item(items) {
  return(items[Math.floor(Math.random()*items.length)]);
}

const itemsA = [mmA, mmB, mmC, mmD, mmE, mmF, mmG, mmH, mmI];
const itemsB = [mmAA, mmBB, mmCC, mmDD, mmEE, mmFF, mmGG, mmHH, mmII];
const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function Cast() {
	let ray = new Ray(the_caster.center, the_target.center);
	let anDeg = -(ray.angle * 57.3);
	let anDist = ray.distance;

  // not using these; just placeholders
	let anFile = random_item(itemsA);
	let anFileSize = 600;
	let anchorX = 0.125;
	
	// set based on distance
	switch(true){
	 case (anDist<=1800):
			anFileSize = 1200;
			anFile = random_item(itemsA);
			anchorX = 0.125;
			break;
	 default:
			anFileSize = 2400;
			anFile = random_item(itemsB);
			anchorX = 0.071;
			break;
	}

	let anScale = anDist / anFileSize;
	let anScaleY = anScale;
	if (anDist<=600){anScaleY = 0.6}
	if (anDist>=700 && anDist <=1200){anScaleY = 0.8}
	if (anDist>=1300 && anDist <=1800){anScaleY = 0.6}
	if (anDist>=1900){anScaleY = anScale}

	let spellAnim = 
											{
											 file: anFile,
												position: the_caster.center,
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
	await sleepNow(80);
	game.socket.emit('module.fxmaster', spellAnim);
	await sleepNow(50);
	}

Cast ()
