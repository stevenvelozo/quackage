# Pict View: {~PascalCaseIdentifier:AppData.Package.name~}

This is a subclassed Pict View, {~PascalCaseIdentifier:AppData.Package.name~}.

It does stuff.

# Usage

```js
const libPict = require('pict');

let tmpView = libPict.addView({Options:"Set here"}, "{~PascalCaseIdentifier:AppData.Package.name~}-Hash", require({~Data:AppData.Package.name~}));

tmpView.render();
```