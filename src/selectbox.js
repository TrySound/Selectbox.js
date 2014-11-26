(function (module) {
	"use strict";

	window.Selectbox = module(window, document);

} (function (window, document) {
	"use strict";


	/**
	 * Instances Class
	 * 
	 */

	function Instances() {
		this._instances = {};
		this._default = null;
	}

	Instances.prototype = {
		_generate: function (pfx) {
			var container, toggle, selector, options;

			if( ! this._default) {
				container = document.createElement('div'),
				toggle = document.createElement('div'),
				selector = document.createElement('div'),
				options = document.createElement('ul');
				
				container.className = pfx + 'container';
				toggle.className = pfx + 'toggle';
				selector.className = pfx + 'selector';
				options.className = pfx + 'options';
				
				container.appendChild(toggle);
				container.appendChild(selector);
				container.appendChild(options);

				this._default = container;
			}

			container = this._default.cloneNode(true);

			return {
				container: container,
				toggle: container.children[0],
				selector: container.children[1],
				options: container.children[2]
			};
		},

		create: function (target) {
			var id = Math.floor(Math.random() * 99999999);

			if(target && target.setAttribute) {

				target.setAttribute('data-sb', id);

				this._instances[id] = {
					target: target,
					uid: id,
					open: false,
					disabled: false,
					el: this._generate('sb-'),
					settings: {}
				};

				return this._instances[id];
			}
		},

		get: function (target) {
			if(target && target.getAttribute) {
				return this._instances[target.getAttribute('data-sb')];
			}
		},

		remove: function (target) {
			if(target && target.getAttribute) {
				this._instances[target.getAttribute('data-sb')] = null;
			}
		},
	};



	/**
	 * Helpers
	 */

	function hasClass(el, name) {
		return new RegExp(' ' + name + ' ').test(' ' + el.className + ' ');
	}

	function addClass(el, name) {
		if ( ! hasClass(el, name)) {
			el.className += (el.className ? ' ' : '') + name;
		}
	}

	function removeClass(el, name) {
		if (hasClass(el, name)) {
			el.className = el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
		}
	}

	function insertAfter(el, target) {
		var parent = target.parentNode,
			next = target.nextSibling;

		if (next) {
			parent.insertBefore(el, next);
		} else {
			parent.appendChild(el);
		}
	}

	function setHeightAuto(el) {
		var temp = el.cloneNode(true),
			height,
			getStyle = window.getComputedStyle;

		temp.style.cssText = [
			'width: ' + getStyle(el).width,
			'height: auto',
			'visibility: hidden',
			'position: absolute'
		].join('; ');
		document.body.appendChild(temp);

		height = getStyle(temp).height;

		temp.parentNode.removeChild(temp);

		el.style.height = height;
	}

	function setMaxHeight(container, el) {
		var screenHeight = window.innerHeight,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop,
			offsetTop = 0,
			elem = container,
			containerHeight = parseInt(window.getComputedStyle(container).height, 10),
			diffTop,
			diffBottom;

		while(elem) {
			offsetTop = offsetTop + parseFloat(elem.offsetTop);
			elem = elem.offsetParent;
		}
		offsetTop = Math.round(offsetTop);

		diffBottom = offsetTop - scrollTop;
		diffTop = screenHeight + containerHeight - diffBottom;
		
		if(diffTop > diffBottom) {
			el.style.top = '100%';
			el.style.bottom = 'auto';
			el.style.maxHeight = (diffTop - containerHeight * 2.5) + 'px';
		} else {
			el.style.top = 'auto';
			el.style.bottom = '100%';
			el.style.maxHeight = (diffBottom - containerHeight / 2) + 'px';
		}
	}



	/**
	 * Selector Class
	 * 
	 */

	function Selector(param) {
		this._instances = param.instances;
		this._settings = param.settings;
	}

	Selector.prototype = {
		_getOptions: function (target) {
			var i, max, itemOption, option, itemGroup, group,
				list = document.createDocumentFragment();

			for(i = 0, max = target.length; i < max; i++ ) {
				option = target[i];

				itemOption = document.createElement('li');
				itemOption.innerHTML = option.text;
				itemOption.setAttribute('data-sb-index', option.index);
				itemOption.className = 'sb-option';
				if(option.parentNode.tagName === 'OPTGROUP' && option.parentNode.disabled || option.disabled) {
					itemOption.className += ' sb-option-disabled';
					itemOption.setAttribute('data-sb-disabled', true);
				}
				
				if(option.parentNode.tagName === 'OPTGROUP') {
					if(option.parentNode !== group) {
						group = option.parentNode;

						itemGroup = document.createElement('li');
						itemGroup.className = 'sb-group' + (group.disabled ? ' sb-group-disabled' : '');
						itemGroup.innerHTML = group.getAttribute('label');

						list.appendChild(itemGroup);
					}

					itemOption.className += ' sb-option-sub';
				}
				
				list.appendChild(itemOption);
			}

			return list;
		},

		set: function (target, option) {
			var inst = this._instances.get(target);

			if(inst.selected) {
				inst.selected.selected = false;
			}
			option.selected = true;
			inst.selected = option;
			
			inst.el.selector.innerHTML = option.text;
		},

		_setDefault: function (target) {
			var selected = target.querySelectorAll('option[selected]'),
				def = selected ? selected[selected.length - 1] : null;

			if( ! def) {
				def = target.getElementsByTagName('option')[0];
			}
			
			if(def) {
				this.set(target, def);
			}
		},

		attach: function (target) {
			var list = this._getOptions(target),
				inst = this._instances.get(target);

			inst.el.options.appendChild(list);

			this._setDefault(target);
		}
	};


	/**
	 * Main Class
	 * 
	 */

	function Main() {
		this._instances = new Instances();
		this._selector = new Selector({
			instances: this._instances,
			settings: {}
		});
	}

	Main.prototype = {
		_change: function (target, item) {
			var inst = this._instances.get(target);

			if(inst.selectedItem) {
				removeClass(inst.selectedItem, 'sb-option-active');
			}
			this._selector.set(target, target[item.getAttribute('data-sb-index')]);
			addClass(item, 'sb-option-active');

			inst.selectedItem = item;

			inst.settings.onChange && inst.settings.onChange.call(target, inst);
		},

		_attachEvents: function (target) {
			var self = this,
				inst = this._instances.get(target);

			inst.el.options.addEventListener('click', function (e) {
				var el = e.target;

				if( ! inst.disabled &&
						el.hasAttribute('data-sb-index') &&
						! el.getAttribute('data-sb-disabled')) {

					self._change(target, el);

					self.close(target);
				}

			}, false);

			function selectorClick() {
				if( ! inst.disabled) {
					if(inst.open) {
						self.close(target);
					} else {
						self.open(target)
					}
				}
			}

			inst.el.selector.addEventListener('click', selectorClick);
			inst.el.toggle.addEventListener('click', selectorClick);

			document.documentElement.addEventListener('mousedown', function (e) {
				if( ! inst.disabled && inst.open &&
						e.target.parentNode !== inst.el.container &&
						e.target.parentNode !== inst.el.options) {
					self.close(target);
				}
			}, false);
		},

		attach: function (target, settings) {
			var inst = this._instances.get(target),
				key;

			if(inst) {
				for(key in settings) if(settings.hasOwnProperty(key)) {
					inst.settings[key] = settings[key];
				}
			} else {
				inst = this._instances.create(target);
				this._selector.attach(target);
				target.style.display = 'none';

				inst.settings = settings || {};

				if(target.hasAttribute('data-sb-custom')) {
					inst.settings.custom = target.getAttribute('data-sb-custom');
				}

				if(inst.settings.custom) {
					inst.el.container.className += ' ' + inst.settings.custom;
				}

				if(target.disabled) {
					this.disable(target, true);
				} else {
					inst.el.container.className += ' sb-enabled';
				}

				this._attachEvents(target);

				insertAfter(inst.el.container, target)

				setTimeout(function () {
					inst.settings.onInit && inst.settings.onInit.call(target, inst);
				}, 20);
			}
		},

		detach: function (target) {
			var inst = this._instances.get(target),
				el,
				clone;

			if(inst) {
				el = inst.el.container,
				clone = el.cloneNode(true);

				// Stop Listenings and remove
				el.parentNode.replaceChild(clone, el);

				clone.parentNode.removeChild(clone);

				this._instances.remove(target);

				target.style.display = '';
			}
		},

		enable: function (target) {
			var inst = this._instances.get(target);

			if(inst && inst.disabled) {
				inst.disabled = false;
				inst.target.disabled = false;
				removeClass(inst.el.container, 'sb-disabled');
				inst.el.container.className += ' sb-enabled';

				inst.settings.onEnable && inst.settings.onEnable.call(target, inst);
			}
		},

		disable: function (target) {
			var inst = this._instances.get(target);

			this.close(target);

			if( inst && ! inst.disabled) {
				inst.disabled = true;
				inst.target.disabled = true;
				removeClass(inst.el.container, 'sb-enabled');
				inst.el.container.className += ' sb-disabled';

				inst.settings.onDisable && inst.settings.onDisable.call(target, inst);
			}
		},

		open: function (target) {
			var inst = this._instances.get(target);

			if(inst && ! inst.disabled && ! inst.open) {
				inst.open = true;
				inst.el.container.className += ' sb-open';

				setHeightAuto(inst.el.options);
				setMaxHeight(inst.el.container, inst.el.options);

				inst.settings.onOpen && inst.settings.onOpen.call(target, inst);
			}
		},

		close: function (target) {
			var inst = this._instances.get(target);

			if(inst && inst.open) {
				inst.open = false;
				removeClass(inst.el.container, 'sb-open');

				inst.el.options.style.height = '';

				inst.settings.onClose && inst.settings.onClose.call(target, inst);
			}
		}

	};


	var main = null;

	function Selectbox(selector, settings) {
		if( ! (this instanceof Selectbox) ) {
			return new Selectbox(selector, settings);
		}

		// Normalize
		this._settings = settings || {};
		this._targets = ! selector ? []
						: typeof selector === 'string' ? document.querySelectorAll(selector)
						: selector.tagName ? [selector]
						: selector.length ? selector
						: [];

		// Init Driver
		this._main = ! main ? (main = new Main) : main;

		// Init Component
		this.attach();
	}

	Selectbox.prototype = {
		_each: function (name) {
			var targets = this._targets,
				settings = this._settings,
				method = this._main[name].bind(this._main),
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				method(targets[i], settings);
			}
		},


		attach: function () {
			this._each('attach');
		},

		detach: function () {
			this._each('detach');
		},
		

		enable: function () {
			this._each('enable');
		},
		
		disable: function () {
			this._each('disable');
		},


		open: function () {
			this._each('open');
		},
		
		close: function () {
			this._each('close');
		}
	};


	// Auto-initialize
	document.addEventListener('DOMContentLoaded', function () {
		Selectbox('.sb-init');
	}, false);


	return Selectbox;

}));
