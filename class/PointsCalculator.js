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
  MAXIMUM_ABILITY: 15,
  MINIMUM_ABILITY: 8,
	COSTS: { "18": 19, "17": 15, "16": 12, "15": 9, 
					 "14":  7, "13":  5, "12":  4, "11": 3,
					 "10":  2, "9" :  1, "8" :  0, " 7": -1,
					 " 6": -2, "5" : -4, "4" : -6, " 3": -9 }
};


class TabbedDialog extends Dialog {
  constructor(data, options) {  
    // setting up tabs here instead of in defaultOptions so that we can easily set the initial tab
    options.tabs = [{navSelector: ".tabs", contentSelector: ".tab-content", initial: options.initial_tab || "tab1"}];
    super(data, options)    
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "macro_data/tabbedDialogTemplate.html",
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
    
  activateListeners(html) {
    super.activateListeners(html);
    Application.prototype.activateListeners.call(this, html);  
  }      
}

class PointsCalculator {
  constructor(options = {}) {
    this.options = mergeObject(options, DEFAULTS);
    this.attributes = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
  }
  
  abilityModifier(value) {
    return Math.floor((parseInt(value) - 10) / 2);
  }
  
  setAttributeValue(attribute, value) {
    value = parseInt(value);
    if(value < this.options.MINIMUM_ABILITY) {
      ui.notifications.error(`Cannot set ${attribute} below ${this.options.MINIMUM_ABILITY}`);
      return;
    }
    
    if(value > this.options.MAXIMUM_ABILITY) {
      ui.notifications.error(`Cannot set ${attribute} above ${this.options.MAXIMUM_ABILITY}`);
      return;
    }
    
    this.attributes[attribute] = value;
  }
  
  getAttributeValue(attribute) {
    return this.attributes[attribute];
  }
  
  pointCostForAttribute(attribute) {
    return this.pointCost(this.getAttributeValue(attribute));
  }
  
  pointCost(value) {
    return this.options.COSTS[value.toString()];
  }
  
  formatModifier(mod) {
    return (mod > 0) ? `+${mod}` : `${mod}`;
  }
  
  calculatorHTML() {
  
		let row_html = "";
		for(const [key, value] of Object.entries(this.attributes)) {
			row_html += `
			<tr>
				<td>${CONFIG.DND5E.abilities[key]}</td>
				<td><input type="number" step="1" min="${this.options.MINIMUM_ABILITY}" max="${this.options.MAXIMUM_ABILITY}" id="${key}" value="${value}"></td>
				<td id="${key}-modifier">${this.formatModifier(this.abilityModifier(value))}</td>
				<td id="${key}-point-cost">${this.pointCost(value)}</td>
			</tr>
			`;
		}
		
		const score_grid = 
		`
		<table>
			<thead>
				<tr>
					<th>Attribute</th> 
					<th>Score</th>
					<th>Modifier</th>
					<th>Points</th>
				</tr>
			</thead>
			<tbody>
			${row_html}
			</tbody>
		</table>
		`;

    return score_grid;
  }
  
  calculatorOptionsHTML() {
    let costs_html = ""
    let i = 0;
    for(const [key, value] of Object.entries(this.options.COSTS)) {
      // 4 x 4 grid
      if(i === 0) {
        costs_html += "<tr>"
      }
      
       costs_html += `<td>${key}:<input type="number" step="1" id="point${key}" value="${value}"></td>`
       
       if(i % 4 === 0 && i !== 0) {
         costs_html += "</tr><tr>"
       } 
       
       if(i === 15) {
         costs_html += "</tr>"
       }
       
      i++;
    }
    
    console.log("costs_html", costs_html);
    
    const options_html = 
    `
    <hr>
    <table>
    <tr><td>Total Points:</td> <td id="total-points">${this.options.TOTAL_POINTS}</td></tr>
    <tr><td>Maximum Ability Score\n(before racial adjustments):</td><td><input type="number" step="1" id="max-ability" value="${this.options.MAXIMUM_ABILITY}"></td></tr>
    <tr><td>Minimum Ability Score\n(before racial adjustments):</td><td><input type="number" step="1" id="min-ability" value="${this.options.MINIMUM_ABILITY}"></td><br>
    </tr>
    </table>
    <table>
			<tbody>			  
			  ${costs_html}
			</tbody>
    </table>
    
    `;
    return options_html;
  }
  
  
  
  render() {
    
  
    let d = new TabbedDialog(
		{
			title: "Points Calculator",
			header: "Add or subtract ability scores based on points",
			footer: "Test <i>footer</i>",
			tabs: [ { title: "Calculator",
								content: this.calculatorHTML() },
							{ title: "Options",
								icon: "fas fa-cogs",
								content: this.calculatorOptionsHTML() }
						],
			buttons: {
			 one: {
				icon: '<i class="fas fa-check"></i>',
				label: "Done",
				callback: () => console.log("Done")
			 }
		 },
		 default: "one",
		 render: html => console.log("Register interactivity in the rendered dialog"),
		 close: html => console.log("This always is logged no matter which option is chosen")

		},
		{ width: 600, height: 400, initial_tab: "tab1" }

		);

		d.render(true);
  }
}

let calc = new PointsCalculator();
console.log("calculator object", calc);




calc.render();

