/*
 * Points calculator
 * Loosely based on https://chicken-dinner.com/5e/5e-point-buy.html
 * First tab:
 
Attribute | Ability Score | Ability Modifier | Point Cost
Strength		8								-1									0

Reset																Total Points: 0/27

 * Second tab:
 
Available Points 27
Maximum Ability  15
Minimum Ability   8

Adjust Points Costs
18: 19
17: 15 ... 
Reset
 */
 
 
 
const DEFAULTS = {
  TOTAL_POINTS: 27,
  MAXIMUM_ATTRIBUTE: 15,
  MINIMUM_ATTRIBUTE: 8,
	COSTS: { "18": 19, "17": 15, "16": 12, "15": 9, 
					 "14":  7, "13":  5, "12":  4, "11": 3,
					 "10":  2, "9" :  1, "8" :  0, "7" : -1,
					 "6" : -2, "5"  : -4, "4" : -6, "3" : -9 },
	ATTRIBUTES: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
};

// ---------------- TABBED DIALOG CLASS ---------------- //


class TabbedDialog extends Dialog {
  constructor(data, options = {}) {
    // setting up tabs here instead of in defaultOptions so that we can easily set the initial tab
    options.tabs = [{navSelector: ".tabs", contentSelector: ".tab-content", initial: options.initial_tab || "tab1"}];
    super(data, options)
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "macro_data/guide_tabbed_dialog_template.html",
    });
  }

  getData() {
    console.log("getData", this);
    // no super to Application
    const data = super.getData();

    data.tabs = this.data.tabs.map((t, idx) => {
      return {
        id: t.id || `tab${idx + 1}`,
        title: t.title || `Tab ${idx + 1}`,
        icon: t.icon || "fas fa-dice-d20",
        content: t.content || ""
      }
    });

    data.header = this.data.header;
    data.footer = this.data.footer;

    console.log(data);

    return data;
  }

  // In Foundry 0.7.9 we would have needed to call Application.prototype.activateListeners directly. Can remove for 0.8.7.
  /*
  activateListeners(html) {
    super.activateListeners(html);
    Application.prototype.activateListeners.call(this, html);
  }
  */
}
// ---------------- POINTS CALCULATOR CLASS ---------------- //

class PointsCalculator extends TabbedDialog {
  constructor(data = {}, options = {}) {
    // load partial templates
    loadTemplates([
	'macro_data/pointsCalculatorPartial.html',
	'macro_data/pointsCalculatorOptionsPartial.html']);
	
	if(!options.callback) options.callback = () => console.log("Done")
  
    // pass basic dialog parameters to parent.
    data.tabs = [ { title: "Calculator",
								content: "tab1 content placeholder" 
								},
							{ title: "Options",
								icon: "fas fa-cogs",
								content: "tab1 content placeholder"  
								}
						    ];
    data.buttons = {
			 one: {
				icon: '<i class="fas fa-check"></i>',
				label: "Done",
				callback: options.callback
			 }
		 };
		data.default = "one"
		data.header = "Add or subtract ability scores based on points<hr>"; 
    
    options.width = 600;
    options.height = 475;
  
    super(data, options)    
  
    this.options = mergeObject(this.options, DEFAULTS);
    
//     set up data for this calculator based on defaults
    this.setOptionDefaults();
    this.setAttributeDefaults();
    
	  console.log("PointsCalculator constructor", this); 
  }
  
  render(force=false, options={}) {
    // on render, render the partial templates
    // rendering is async
    console.log("PointsCalculator render", this.getData());
    
    const p1 = renderTemplate("macro_data/pointsCalculatorPartial.html", this.getData());
    const p2 = renderTemplate("macro_data/pointsCalculatorOptionsPartial.html", this.getData());
    
    Promise.all([p1, p2]).then((res) => {
      console.log("PointsCalculator render values", res[0]);
      console.log("PointsCalculator render values", res[1]);
       //  this.data.tabs[0].content = "Tab1 content";
//         this.data.tabs[1].content = "Tab2 content";
      
      this.data.tabs[0].content = res[0];     
      this.data.tabs[1].content = res[1];
      return super.render(force, options);
    });
  }
  
  getData() {
    console.log("PointsCalculator getData", this);
    // no super to Application
    const data = super.getData();
    
    data.max_points = this.data.max_points;
    data.min_attr = this.data.min_attr;
    data.max_attr = this.data.max_attr;
    data.costs = this.data.costs;
    data.attributes = this.data.attributes;
    data.costs_total = this.costs_total;
    
    return data;
  }
  
  setOptionDefaults() {
    this.data.costs = Object.entries(this.options.COSTS).map(([k, v], i) => {
      return { label: k,
               id: k,
               value: v,
               new_row: (i % 4) === 0,
               end_row: ((i + 1) % 4) === 0
      };
    });
  
    this.data.max_points = this.options.TOTAL_POINTS;
    this.data.min_attr = this.options.MINIMUM_ATTRIBUTE;
    this.data.max_attr = this.options.MAXIMUM_ATTRIBUTE;
  }
  
  setAttributeDefaults() {
    this.data.attributes = Object.entries(this.options.ATTRIBUTES).map(([k, v], i) => {
      return { label: CONFIG.DND5E.abilities[k],
               id: k,
               value: v,
               modifier: this.formatModifier(this.abilityModifier(v)),
               cost: this.pointCost(v),
               min: this.data.min_attr,
               max: this.data.max_attr 
              };
    
    });
  }
  
  submit(button) {
    try {
      if (button.callback) button.callback(this.getData());
      this.close();
    } catch(err) {
      ui.notifications.error(err);
      throw new Error(err);
    }
  }
   
  abilityModifier(value) {
    return Math.floor((parseInt(value) - 10) / 2);
  }
  
  get title() {
    return "Points Calculator";
  }
  
  setAttributeValue(attr, value) {
    console.log(`Points Calculator setAttributeValue ${attr} to ${value}`, this);
  
    value = parseInt(value);
    if(value < this.data.min_attr) {
      console.log(`Points Calculator|Cannot set ${attr} below ${this.data.min_attr}`)
      ui.notifications.error(`Cannot set ${attr} below ${this.data.min_attr}`);
      return;
    }
    
    if(value > this.data.max_attr) {
      console.log(`Points Calculator|Cannot set ${attr} above ${this.data.max_attr}`)
      ui.notifications.error(`Cannot set ${attr} above ${this.data.max_attr}`);
      return;
    }
    
    let the_attribute = this.getAttribute(attr);
    console.log(`Points Calculator Found ${attr}`, the_attribute);
    
    the_attribute.value = value;
    this.setAttributeModifier(attr, value);
    this.setAttributeCost(attr, value);
    
  }
  
  get costs_total() {
    return this.data.attributes.reduce((total, curr) => total + curr.cost, 0);
  }
  
  getAttribute(attr) {
    return this.data.attributes.find(a => a.id === attr);
  }
  
  getCost(id) {
    return this.data.costs.find(a => a.id === id.toString());
  }
  
  getAttributeValue(attr) {
    return this.getAttribute(attr).value;
  }
    
  getAttributeModifier(attr) {
    return this.getAttribute(attr).modifier;
  }
  
  setAttributeModifier(attr, value) {
    value = parseInt(value);
    const the_attribute = this.getAttribute(attr);
    the_attribute.modifier = this.formatModifier(this.abilityModifier(value));
  }
  
  getAttributeCost(attr) {
    return this.getAttribute(attr).cost;
  }
  
  setAttributeCost(attr, value) {
    const the_attribute = this.getAttribute(attr);
    the_attribute.cost = this.pointCost(value);
  }
  
  pointCostForAttribute(attr) {
    const value = this.getAttributeValue(attr);
    return this.pointCost(value);
  }
  
  pointCost(id) {
    return this.getCost(id).value;
  }
  
  setPointCost(id, value) {
    console.log(`PointsCalculator| setPointCost ${id} to ${value}`, this);
  
    const the_cost = this.getCost(id);
    the_cost.value = parseInt(value);
  }
  
  formatModifier(mod) {
    return (mod > 0) ? `+${mod}` : `${mod}`;
  }
  
  activateListeners(html) {
    console.log("PointsCalculator activateListeners", html);
    super.activateListeners(html);
    
    // If an attribute is changed, update:
    // - modifier
    // - point cost
    html.on("change", "input,select,textarea", this._onChangeInput.bind(this));
    
    // let self = this;
//     self.data.attributes.forEach(a => {
//       html.find(`${a.id}`).on("change",(e) => {
//         console.log(`PointsCalculator activateListeners attributes ${a} e`, e);
//         console.log(`PointsCalculator activateListeners attributes ${a} val`, html.find(`${a.id}`).val);
//         self.data.attributes[a].value = parseInt(html.find(`${a.id}`).val);
//         self.render();
//       });
//     });

  }  
  
  _onChangeInput(event) {
    const el = event.target;
    console.log(`PointsCalculator change id ${el.id} to ${el.value}`, el, event, this);
    // className: "", checked: false, max: "15", min: "8", type: "number", value
    // parentElement: <td style="text-align:center;">
    // parentNode: <td style="text-align:center;">
    
    if(el.className === "attributes") {
      // setting the attribute value will update corresponding modifier and cost
      this.setAttributeValue(el.id, el.value);
      
      // update modifier
      //console.log("PointsCalculator document search", document.querySelector(`#${el.id}-modifier`));
      const mod_field = document.querySelector(`#${el.id}-modifier`);
      mod_field.textContent = this.getAttributeModifier(el.id);
      
      // update cost
      //console.log("PointsCalculator document search", document.querySelector(`#${el.id}-cost`));
      const cost_field = document.querySelector(`#${el.id}-cost`);
      cost_field.textContent = this.getAttributeCost(el.id);
      
      // update total
      this._updateTotal();
          
      //this.render(); // probably could do this through propagation of the change in the html
    } else if(el.className === "points-options") {
      this.setPointCost(el.id.replace('point-', ''), el.value);
      this._updateAllPoints();
    
      
    } else if(el.className === "options") {
      // total-points, max-ability, min-ability
      if(el.id === "max-points") {
        this.data.max_points = parseInt(el.value);
        this._updateTotal();
      
      } else if(el.id === "max-ability") {
        this._updateRangeMax(el.value);
        
      
      } else if(el.id === "min-ability") {
        this._updateRangeMin(el.value);
      }
      
    } else {
      console.log(`PointsCalculator change class ${el.className} unknown`);
      
    }
    
  }
  
  _updateTotal() {
    const current_field = document.querySelector(`#attr-current-points`);
    current_field.textContent = `${this.costs_total}`;
    
    const total_field = document.querySelector(`#attr-max-points`);
    total_field.textContent = `${this.data.max_points}`;
  }
  
  _updateAllPoints() {
    // update each attribute cost field and total
    this.data.attributes.forEach(a => {
      const cost_field = document.querySelector(`#${a.id}-cost`);
      cost_field.textContent = this.getAttributeCost(a.id);
    });
    
    this._updateTotal();
  }
  
  _updateRangeMin(value) {
    this.data.min_attr = parseInt(value);
    this.data.attributes.forEach(a => {
      const attr_field = document.querySelector(`#${a.id}`);
      //console.log("Attribute field for ${a.id}", attr_field);
      attr_field.min = value.toString();
    });
    
  }
  
  _updateRangeMax(value) {
    this.data.max_attr = parseInt(value);
    this.data.attributes.forEach(a => {
      const attr_field = document.querySelector(`#${a.id}`);
      //console.log("Attribute field for ${a.id}", attr_field);
      attr_field.max = value.toString();
    });
  }

  
}

// helper functions to render and wait
/**
 * Convert dialog to a promise to allow use with await/async.
 * @content HTML content for the dialog.
 * @return Promise for the html content of the dialog
 * Will return "Cancel" or "Close" if those are selected.
 */
function dialogPromise() {
  return new Promise((resolve, reject) => {
    dialogCallback((html) => resolve(html)); 
  });
}

/**
 * Create new dialog with a callback function that can be used for dialogPromise.
 * @content HTML content for the dialog.
 * @callbackFn Allows conversion of the callback to a promise using dialogPromise.
 * @return rendered dialog.
 */
function dialogCallback(callbackFn) {
	let calc = new PointsCalculator({}, { callback: (html) => callbackFn(html) });
  calc.render(true);
}




// for debugging
// delete _templateCache["macro_data/guide_tabbed_dialog_template.html"];
// delete _templateCache["macro_data/pointsCalculatorPartial.html"];
// delete _templateCache["macro_data/pointsCalculatorOptionsPartial.html"];


// let calc = new PointsCalculator();
// let calc = new PointsCalculator({}, { callback: () => console.log("Finis", this) });
// calc.render(true);

res = await dialogPromise();
console.log(res);

// create chat message with results
let chat_html = "";
res.attributes.forEach(a => {
  chat_html += `<b>${a.label}</b> ${a.value}<br>`;
});

chat_html += `
<hr>
Points: ${res.costs_total} / ${res.max_points}
`;



const chatData = {
  content: chat_html
};
ChatMessage.create(chatData, {});

