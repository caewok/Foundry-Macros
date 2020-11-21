let params =
[{
    filterType: "shadow",
    blur: 2,
    quality: 5,
    distance: 0,
    alpha: 1.,
    padding: 100,
    color: 0xFFFFFF,
    animated:
    {
        blur:     
        { 
           active: true, 
           loopDuration: 500, 
           animType: "syncCosOscillation", 
           val1: 2, 
           val2: 4
        },
     }
},
{
    filterType: "electric",
    color: 0xFFFFFF,
    time: 0,
    blend: 2,
    intensity: 5,
    animated :
    {
      time : 
      { 
        active: true, 
        speed: 0.0160, 
        animType: "move" 
      }
    }
}];

TokenMagic.addPreset("Shocking Grasp",params);