Selectbox.js
============

VanillaJS Custom Selectbox

Was inspired by [jQuery Selectbox Plugin](http://www.bulgaria-web-developers.com/projects/javascript/selectbox/)


##Using

```js
var sb = Selectbox(selector, settings);
```

##Settings

`custom` - className for selectbox containers

###Callbacks

`onInit`

`onChange`

`onOpen`

`onClose`

`onEnable`

`onDisable`


##Methods

`sb.attach()` - create custom selectbox with `select` element. Call by constructor

`sb.detach()` - destroy custom selectbox

`sb.enable()` - unlock selectbox

`sb.disable()` - lock selectbox

`sb.open()` - open select list

`sb.close()` - minimize select list





##License

Copyright (c) 2014 Bogdan Chadkin
