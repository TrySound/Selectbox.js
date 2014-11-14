Selectbox.js
============

VanillaJS Custom Selectbox

Was inspired by [jQuery Selectbox Plugin](http://www.bulgaria-web-developers.com/projects/javascript/selectbox/)


##Using

Just add `sb-init` class to a `select`. If you need to add custom class add `data-sb-custom` attribute with this classname

```html
<select class="sb-init" data-sb-custom="custom-selectbox-class">
	<option>...</option>
	<option>...</option>
	<option>...</option>
</select>
```

or

```js
var sb = Selectbox(selector, settings);
```

##Settings

`custom` - className for selectbox containers. `data-sb-custom` attribute have more priority.

**Callbacks:**

`onInit`,
`onChange`,
`onOpen`,
`onClose`,
`onEnable`,
`onDisable`

Callbacks also can be added after initializing (onInit will not be called):

```js
setTimeout(function () {
	Selectbox('.sb-init', {
		onOpen: function () {
			console.log('Open');
		}
	});
},);
```

##Methods

`sb.attach()` - create custom selectbox with `select` element. Call by constructor

`sb.detach()` - destroy custom selectbox

`sb.enable()` - unlock selectbox

`sb.disable()` - lock selectbox

`sb.open()` - open select list

`sb.close()` - minimize select list





##License

Copyright (c) 2014 Bogdan Chadkin
