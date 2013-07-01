# Knockout.WindowLocationExtender

Allows observables to be two-way bound to window.location.hash. Can update window.location.hash with observable values and can update observables with changes to window.location.hash.

## Setup

1. Include knockout.js on your page.
2. Copy knockout.windowlocationextender.js to your scripts folder.
3. Add a script reference to knockout.windowlocationextender.js.
4. In your page's initialization, do the following:

    var windowLocationExtender = new KnockoutWindowLocationExtender();
    windowLocationExtender.init();

## Usage

To use the extender, just add the following configuration to your observable setup: `.extend({ windowLocation: 'urlFriendlyName' })`. Here's an example:

    this.MyObservableField = ko.observable('default value').extend({ windowLocation: 'MyObservableField' });
    
Your URL will automatically be updated with `#MyObservableField=default%20value`.

Additionally, the extender gives you flexability in naming:

    this.SelectedOptionFromAnArray = ko.observable(3).extend({ windowLocation: 'Option' });
    
Your URL would be `#Option=3`, mapping it to `this.SelectedOptionFromAnArray`.

## Advanced Setup and Usage

_Coming Soon_
