# Using HTML Templates in FoundryVTT

This guide provides some examples of using html templates, tabs, and handlebars in Foundry VTT dialogs or sheets. 

# What the what?

## What are templates?
Templates are just html files that can be loaded into Foundry, in lieu of hard-coding all the html within your javascript macro, module, or system.

Examples:
- [Midi-Qol templates](https://gitlab.com/tposney/midi-qol/master/src/templates/)
- [VanceCole template example](https://github.com/VanceCole/macros/blob/master/handlebars-templates.js)

## What are handlebars?
[Handlebars Guide](https://handlebarsjs.com/guide/#what-is-handlebars)

# Setup

## Storing templates
Create in your Data directory a folder to store templates. Don't call it templates, which appears to confuse the caching mechanism. I called mine `macro_data`.

Store the below html templates in `macro_data`. 

You will need to either restart your game session to pick up changes to templates, or you can force Foundry to re-load the cache. 
```js
delete _templateCache["macro_data/[TEMPLATE_FILE"]
```

## Loading templates


## Resetting the cache


## Javascript options
You have various options to use templates in javascript within Foundry. These should function for macros, modules, or systems.

1. Call `renderTemplate`, passing the template and the data.


```js
let data_object = {}; // data object to pass to the template 
await renderTemplate("macro_data/[TEMPLATE_FILE]", data_object);
```

2. Call `Handlebars.compile` with the template, then create the html file using the resulting function. Pass the html file to `Dialog` or some other class to render.

```js
let data_object = {}; // data object to pass to the template
const handlebars_fn = Handlebars.compile("macro_data/[TEMPLATE_FILE]");
const compiled_html = handlebars_fn(data_object);
let d = Dialog({
  title: "My Title",
  content: compiled_html,
  buttons: {
        toggle: {
            icon: '<i class="fas fa-check"></i>',
            label: "Okay",
            callback: () => log("Okay")
        },
    },
    default: "toggle",
    close: html => {
        log(html);
    },
  }
}).render(true);
```

3. Subclass `FormApplication`. You will need to define several methods.

```js
class SelectItemDialog extends FormApplication {
  constructor(object, options) {
    super(object, options)  
  }


  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "macro_data/[TEMPLATE_FILE]"
    });
  }
  
  getData(options = {}) {
    return super.getData();
  }
  
  activateListeners(html) {
    super.activateListeners(html);
  }
    
  async _updateObject(event, formData) {
    return;
  }
}

```

# Basic Version 
```html
<form>
Fixed <ul>header</ul>
<p>{{header}}</p
<hr>
<div>
Fixed content
{{{content}}}
<div>
<hr>
Fixed <em>footnote</em>
{{footer}}
</form>
```
Notes: 
- Need one and only one `<form>` tag. 
- Use `{{...}}` to pass data; use `{{{...}}}` to pass unescaped data (for example, a string variable with html code).
- Everything between the `<form>` tag is up to you.

1. Call `renderTemplate`

```js


``` 


# Tabbed Version

# Handlebars with Partials

# Search
