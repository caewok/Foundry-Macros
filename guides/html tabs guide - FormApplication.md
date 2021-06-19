![](https://img.shields.io/badge/Foundry-v0.8.7-informational)

# Using HTML Tabbed Templates in FoundryVTT (extend FormApplication Class)

This guide provides some examples of using html templates, tabs, and handlebars in Foundry VTT dialogs or sheets. It assumes basic knowledge about templates. (See the html template guide for basics.) In this guide, we will extend the FormApplication class for a basic tabbed version.

# All the tabs
The following code creates a tabbed display. Using handlebars, we are able to dynamically set the number of tabs by passing an array of tab properties, one for each tab. 

## HTML
Save the following in the foundry Data folder. For this example, I am saving mine at `macro_data/TEMPLATE_FILE`, where `TEMPLATE_FILE` is something like `tab_template.html`.

```html
<form>
<nav class="tabs" data-group="primary-tabs">
  {{#each tabs}}
  <a class="item" data-tab="{{label}}"><i class="fas fa-dice-d20"></i> {{title}}</a>
  {{/each}}
</nav>

<b>Fixed header</b><br>
{{header}}
<hr>

<section class="content">
  {{#each tabs}}
  <div class="tab" data-tab="{{label}}" data-group="primary-tabs">
    Fixed content for tab {{title}}<br>
    {{{content}}}
  </div>
  {{/each}}
</section>

<hr>
Fixed <em>footer</em><br>
{{footer}}
</form>
```
## Javascript
Run this from a macro or in module code. 

### 1. Call `renderTemplate` and then do something with the resulting html
```js
const template_file = "macro_data/TEMPLATE_FILE";
const template_data = { header: "Handlebars header text.",
                        tabs: [{ label: "Tab1",
                                 title: "My First Tab",
                                 content: "<em>Fancy tab1 content.</em>"},
                                 
                               { label: "Tab2",
                                 title: "My Second Tab",
                                 content: "<em>Fancy tab2 content.</em>"}],
                        footer: "Handlebars footer text."};
const rendered_html = await renderTemplate(template_file, template_data);
/* Below doesn't work
let d = new Dialog({
    title: "MyDialogTitle",
    content: rendered_html,
    buttons: {
        toggle: {
            icon: '<i class="fas fa-check"></i>',
            label: "Okay",
            callback: () => console.log("Okay")
        },
    },
    default: "toggle",
    close: html => {
        console.log(html);
    },
  }, { tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "tab1" }]} );
d.render(true);
*/
```
Notes:
- `Dialog` class will not work with tabs. This appears to be because it is not calling `super.activateListeners` and so the tab switching does not work. Passing `{ tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "tab1" }]}` as an option does not work. See html tabs guide - Dialog for an example of extending the Dialog class.


### 2. Subclass `FormApplication`.
```js
class myFormApplication extends FormApplication {
  constructor(object, options) {
    super(object, options);  
  }

  static get defaultOptions() {
    return super.defaultOptions;
  }
  
  getData(options = {}) {
    return super.getData().object; // the object from the constructor is where we are storing the data 
  }
  
  activateListeners(html) {
    super.activateListeners(html);
  }
    
  async _updateObject(event, formData) {
    return;
  }
}

const template_file = "macro_data/TEMPLATE_FILE";
const template_data = { header: "Handlebars header text.",
                        tabs: [{ label: "tab1",
                                 title: "My First Tab",
                                 content: "<em>Fancy tab1 content.</em>"},
                                 
                               { label: "tab2",
                                 title: "My Second Tab",
                                 content: "<em>Fancy tab2 content.</em>"}],
                        footer: "Handlebars footer text."};
const my_form = new myFormApplication(template_data, { template: template_file,
                             tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "tab1"}] }); // data, options
const res = await my_form.render(true);
```
Note:
- Make sure the initial tab name is the same as the label for the tab you want.
- These options could be built into myFormApplication definition. 
- If you want buttons like with Dialog, you will need to add them yourself.

# Handlebars with Partials

Instead of dynamically creating tab content, another option is to load one or more handlebars partials files for the tab content. For this example, we will use a single partial file but provide it dynamic content. Name the partial file whatever you want; here I use `tab_partial.html`.``

## HTML
Main file:
```html
<form>
<nav class="tabs" data-group="primary-tabs">
  {{#each tabs}}
  <a class="item" data-tab="{{label}}"><i class="fas fa-dice-d20"></i> {{title}}</a>
  {{/each}}
</nav>

<b>Fixed header</b><br>
{{header}}
<hr>

<section class="content">
  {{#each tabs}}
  <div class="tab" data-tab="{{label}}" data-group="primary-tabs">
    Fixed content for tab {{title}}<br>
    {{> 'macro_data/tab_partial.html' this}}
  </div>
  {{/each}}
</section>

<hr>
Fixed <em>footer</em><br>
{{footer}}
</form>

```
Partial:
```html
Fixed tab content.<br>
This is tab {{title}}.<br>
{{content}}
```

## Javascript
```js
class myFormApplication extends FormApplication {
  constructor(object, options) {
    super(object, options);  
  }

  static get defaultOptions() {
    return super.defaultOptions;
  }
  
  getData(options = {}) {
    return super.getData().object; // the object from the constructor is where we are storing the data 
  }
  
  activateListeners(html) {
    super.activateListeners(html);
  }
    
  async _updateObject(event, formData) {
    return;
  }
}

const template_file = "macro_data/TEMPLATE_FILE";
loadTemplates(["macro_data/tab_partial.html"]);
const template_data = { header: "Handlebars header text.",
                        tabs: [{ label: "tab1",
                                 title: "My First Tab",
                                 content: "<em>Fancy tab1 content.</em>"},
                                 
                               { label: "tab2",
                                 title: "My Second Tab",
                                 content: "<em>Fancy tab2 content.</em>"}],
                        footer: "Handlebars footer text."};
const my_form = new myFormApplication(template_data, { template: template_file,
                             tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "tab1"}] }); // data, options
const res = await my_form.render(true);
```

Notes:
- You must load the partial template either in your main code or when instantiating the class. 

# Search
This is an example of a tab that relies on `<script>` tag. Here, we define a function to filter through a table by a specific column in that table. (Useful for lists of items, tokens, etc.) We will use partials and create a special partial for the search table, named `tab_search_partial.html`. 

The following is overkill, in that it dynamically chooses the search tag with handlebars (this allows us to see how such if/then switches might work). The simpler version would just define the tabs in advance with no dynamic switching. 

## HTML
Main file:
```html
<form>
<nav class="tabs" data-group="primary-tabs">
  {{#each tabs}}
  <a class="item" data-tab="{{label}}"><i class="fas fa-dice-d20"></i> {{title}}</a>
  {{/each}}
</nav>

<b>Fixed header</b><br>
{{header}}
<hr>

<section class="content">
  {{#each tabs}}
  Fixed content for tab {{title}}<br>
  <div class="tab" data-tab="{{label}}" data-group="primary-tabs">
    {{#if search}}
      {{> 'macro_data/tab_search_partial.html' this}}
    {{else}}
      {{> 'macro_data/tab_partial.html' this}}
    {{/if}}
  </div>
  {{/each}}
</section>

<hr>
Fixed <em>footer</em><br>
{{footer}}
</form>

```
Partial:
```html
Fixed tab content.<br>
This is tab {{title}}.<br>
{{{content}}}
```

Search partial:
```html
Fixed tab content.<br>
This is tab {{title}}.<br>
{{{content}}}
<input type="text" id="filter_field" onkeyup="filterFn()" placeholder="{{search_text}}">
<table id="list_table" class="table table-striped">
<tbody>
  {{#each rows}}
  <tr class="item-row">
    {{#each columns}}
      <td> {{{this}}} </td>
    {{/each}}
  </tr>
  {{/each}}
</tbody>
</table>

<script>

function filterFn() {
        const input = document.getElementById("filter_field");
        const filter = input.value.toUpperCase();
        const table = document.getElementById("list_table");
        let tr = table.getElementsByTagName("tr");

        // Loop through all table rows, and hide those who don't match the search query
        for (let i = 0; i < tr.length; i++) {
                const td = tr[i].getElementsByTagName("td")[0]; // column to search
                if (td) {
                        const txtValue = td.textContent || td.innerText;
                        if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                tr[i].style.display = "";
                        } else {
                                tr[i].style.display = "none";
                        }
                }
        }
}

</script>

<style type="text/css">
  img { border-style: none; }
</style>
```
Notes:
- `filterFn` searches through a single column, as noted in the above code. So make sure you have chosen the correct column given the data you are using (or create a more advanced version to search multiple columns)
- The css style code is simply to remove the border around any images. See below image example.
- We anticipate passing html code as each row. For example, to provide an image. Thus `{{{this}}}` uses triple-moustache.
- `{{{this}}}` refers to the entire column object contained in the columns array. 


## Javascript
```js
class myFormApplication extends FormApplication {
  constructor(object, options) {
    super(object, options);  
  }

  static get defaultOptions() {
    return super.defaultOptions;
  }
  
  getData(options = {}) {
    return super.getData().object; // the object from the constructor is where we are storing the data 
  }
  
  activateListeners(html) {
    super.activateListeners(html);
  }
    
  async _updateObject(event, formData) {
    return;
  }
}

const template_file = "macro_data/TEMPLATE_FILE";
loadTemplates(["macro_data/tab_partial.html"]);
loadTemplates(["macro_data/tab_search_partial.html"]);

// build up some content for the search table
let rows = [];
let columns = [];

const row_names = ["Acid", "Angel", "Barrel"];
const images = ["icons/svg/acid.svg",
                "icons/svg/angel.svg",
                "icons/svg/barrel.svg"];

for(let r = 0; r < 3; r++) {
  columns = [];
  columns.push(row_names[r]); // We set filterFn above to search the first column, so this first column should be the name
  columns.push(`<img src="${images[r]}" width="30" height="30" />`);
  columns.push(`<input type="checkbox" id="row${r}" class="GroupSelection"/>`);
  rows.push({columns: columns});
}

console.log(rows);

const template_data = { header: "Handlebars header text.",
                        tabs: [{ label: "tab1",
                                 title: "My First Tab",
                                 content: "<em>Fancy tab1 content.</em>"},
                                 
                               { label: "tab2",
                                 title: "My Second Tab",
                                 content: "<em>Fancy tab2 content.</em>",
                                 search: true,
                                 search_text: "Search by name...",
                                 rows: rows}],
                        footer: "Handlebars footer text."};
const my_form = new myFormApplication(template_data, { template: template_file,
                             tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "tab1"}],
                             resizable: true }); // data, options
const res = await my_form.render(true);
```
