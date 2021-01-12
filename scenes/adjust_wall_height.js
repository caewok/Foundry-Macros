(function ()
{

// console.log(canvas.scene.data.walls);
// e.g.,
// _id, 
// flags.wallHeightBottom: null (for Infinity)
// flags.wallHeightTop: 100
// see Community Module close all doors.



/*
canvas.walls.updateMany(canvas.scene.data.walls.map(w => {
  return {_id: w._id, ds: w.ds === 1 ? 0 : w.ds};
}));
*/

/**
 * Test for blank or empty string
 * https://stackoverflow.com/questions/154059/how-can-i-check-for-an-empty-undefined-null-string-in-javascript
 * @str String or object
 * @return True if object is blank ("") or empty.
 */  
function isEmpty(str) {
    const is_empty = (!str || /^\s*$/.test(str));
    //console.log("isEmpty? " + is_empty);
    return is_empty;
  }

function adjust_wall_heights(top, bottom) {

  let walls = null;

  if(!isEmpty(top)) {
    console.log("Top is " + top);
    let top_value = parseInt( top );
    
		if("infinite" === top.toLowerCase()) {
      top_value = null;
    } 
    
    walls = canvas.scene.data.walls.map(w => {
			return {_id: w._id, flags: { wallHeight: { wallHeightTop: top_value }}};
		});
		//console.log(walls);
    
    canvas.walls.updateMany(walls);
  }
  
  if(!isEmpty(bottom)) {
    console.log("Bottom is " + bottom);
    let bottom_value = parseInt( bottom );
    
		if("infinite" === bottom.toLowerCase()) {
      bottom_value = null;
    } 
    
    walls = canvas.scene.data.walls.map(w => {
			return {_id: w._id, flags: { wallHeight: { wallHeightBottom: bottom_value }}};
		});
		//console.log(walls);
		
    canvas.walls.updateMany(walls);
  } 

}


new Dialog({
    title: "Adjust Wall Heights",
    content: `
     <p>Enter new top and bottom wall heights. Leave blank to leave unchanged. Enter infinite to make infinitely high or low (this is the default setting).</p>
     <form>
      
      <div class="form-group">
       <label>Top</label>
       <input type="text" id="top">
      </div>
      <div class="form-group">
       <label>Bottom</label>
       <input type="text" id="bottom">
      </div>
     </form>
     `,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: "Confirm",
        callback: (html) =>
        {
          let top = html.find('[id=top]')[0].value;
          let bottom = html.find('[id=bottom]')[0].value;
          adjust_wall_heights(top, bottom);
        }
      },
      two: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
      }
    },
    default: "Cancel"
  }).render(true);
})();