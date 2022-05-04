// Updated for Foundry v9 and Sequencer v2
// Based on
// https://github.com/fantasycalendar/FoundryVTT-Sequencer
// https://github.com/otigon/Foundry-Macros/blob/main/Magic-Missiles/Blue%20Magic%20Missile

/// This macro pulls from the JB2A list of Magic Missiles to throw 1 random path at targeted token with the given color (or random if color not provided)

// for testing, run this from the console with one token selected and another targeted.


//args[0] = selected token ID
//args[1] = target token ID
//args[2] = color  // Options: Blue, Green, Orange, Purple, Yellow

console.log("AnimateRandomMagicMissile|args", args);



const the_caster = canvas.tokens.get(args[0]) || canvas.tokens.controlled[0];
const the_target = canvas.tokens.get(args[1]) || Array.from(game.user.targets)[0];


new Sequence()
  .wait(100, 600) // offset the missiles a bit
  .effect()
    .atLocation(the_caster)
    .stretchTo(the_target)
    .JB2A()
    .baseFolder("modules/jb2a_patreon/Library/1st_Level/Magic_Missile")
    .setMustache({
            "color": () => {
               if(args[2]) return args[2];
               return ['Blue', 'Green', 'Purple', 'Orange', 'Yellow'][Math.floor(Math.random() * 5)]
            },
            "number": () => {
                return Math.floor(Math.random() * 9) + 1;
            }
        })
    .addOverride(
            async (effect, data) => {
                if(data._distance <= 1800){
                    data.file = "MagicMissile_01_Regular_{{color}}_30ft_0{{number}}_1600x400.webm";
                }else{
                    data.file = "MagicMissile_01_Regular_{{color}}_60ft_0{{number}}_2800x400.webm";
                }
                return data
            }
        )
  .play();