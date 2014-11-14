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

		this._def();
	}

	Instances.prototype = {
		_gen: function () {
			var container = this._defaultHTML.cloneNode(true);

			return {
				container: container,
				toggle: container.getElementsByClassName('sb-toggle')[0],
				selector: container.getElementsByClassName('sb-selector')[0],
				options: container.getElementsByClassName('sb-options')[0]
			};
		},

		_def: function () {
			var container = document.createElement('div'),
				toggle = document.createElement('div'),
				selector = document.createElement('div'),
				options = document.createElement('ul');

			container.className = 'sb-container';
			toggle.className = 'sb-toggle';
			selector.className = 'sb-selector';
			options.className = 'sb-options';

			container.appendChild(toggle);
			container.appendChild(selector);
			container.appendChild(options);

			this._defaultHTML = container;
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
					el: this._gen(),
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
		return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
	}

	function addClass(el, name) {
		if (!hasClass(el, name)) {
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

		temp.remove();

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

		_attachEvents: function (target) {
			var self = this,
				inst = this._instances.get(target);

			inst.el.options.addEventListener('click', function (e) {
				var el = e.target;

				if( ! inst.disabled &&
						el.hasAttribute('data-sb-index') &&
						! el.getAttribute('data-sb-disabled')) {

					self.change(target, el);

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
			var inst = this._instances.get(target);

			if( ! inst) {
				inst = this._instances.create(target);
				this._selector.attach(target);
				target.style.display = 'none';

				inst.settings = settings || {};
				
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
					inst.settings.onInit.call(inst.target, inst);
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
				clone.remove();

				this._instances.remove(target);

				target.style.display = '';
			}
		},

		enable: function (target, silence) {
			var inst = this._instances.get(target);

			if(inst && inst.disabled) {
				inst.disabled = false;
				inst.target.disabled = false;
				removeClass(inst.el.container, 'sb-disabled');
				inst.el.container.className += ' sb-enabled';

				if( ! silence) {
					inst.settings.onEnable.call(inst.target, inst);
				}
			}
		},

		disable: function (target, silence) {
			var inst = this._instances.get(target);

			this.close(target);

			if( inst && ! inst.disabled) {
				inst.disabled = true;
				inst.target.disabled = true;
				removeClass(inst.el.container, 'sb-enabled');
				inst.el.container.className += ' sb-disabled';

				if( ! silence) {
					inst.settings.onDisable.call(inst.target, inst);
				}
			}
		},

		open: function (target, silence) {
			var inst = this._instances.get(target);

			if(inst && ! inst.disabled && ! inst.open) {
				inst.open = true;
				inst.el.container.className += ' sb-open';

				setHeightAuto(inst.el.options);
				setMaxHeight(inst.el.container, inst.el.options);

				if( ! silence) {
					inst.settings.onOpen.call(inst.target, inst);
				}
			}
		},

		close: function (target, silence) {
			var inst = this._instances.get(target);

			if(inst && inst.open) {
				inst.open = false;
				removeClass(inst.el.container, 'sb-open');

				inst.el.options.style.height = '';

				if( ! silence) {
					inst.settings.onClose.call(inst.target, inst);
				}
			}
		},

		change: function (target, item) {
			var inst = this._instances.get(target);

			if(inst.selectedItem) {
				removeClass(inst.selectedItem, 'sb-option-active');
			}
			this._selector.set(target, target[item.getAttribute('data-sb-index')]);
			addClass(item, 'sb-option-active');

			inst.selectedItem = item;

			inst.settings.onChange.call(target, inst);
		}

	};


	var main = null;

	function Selectbox(selector, settings) {
		var targets,
			def = function () {},
			i, max;

		if( ! selector) {
			return null;
		}

		if( ! (this instanceof Selectbox) ) {
			return new Selectbox(selector, settings);
		}

		if( ! main) {
			main = new Main;
		}

		this._main = main;


		// Settings Normalize
		settings = settings || {};
		settings.onInit = settings.onInit || def;
		settings.onChange = settings.onChange || def;
		settings.onOpen = settings.onOpen || def;
		settings.onClose = settings.onClose || def;
		settings.onEnable = settings.onEnable || def;
		settings.onDisable = settings.onDisable || def;

		this._settings = settings;

		// Targets Normalize
		if(typeof selector === 'string') {
			targets = document.querySelectorAll(selector);
		} else if(selector.length && ! selector.tagName) {
			targets = selector;
		} else {
			targets = [selector];
		}

		this._targets = [];
		for(i = 0, max = targets.length; i < max; i++) {
			this._main.attach(targets[i], settings);
			this._targets.push(targets[i]);
		}
	}

	Selectbox.prototype = {
		attach: function () {
			var targets = this._targets,
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				this._main.attach(targets[i], this._settings);
			}
		},

		detach: function () {
			var targets = this._targets,
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				this._main.detach(targets[i]);
			}
		},
		

		enable: function () {
			var targets = this._targets,
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				this._main.enable(targets[i]);
			}
		},
		
		disable: function () {
			var targets = this._targets,
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				this._main.disable(targets[i]);
			}
		},


		open: function () {
			var targets = this._targets,
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				this._main.open(targets[i]);
			}
		},
		
		close: function () {
			var targets = this._targets,
				i, max;

			for(i = 0, max = targets.length; i < max; i++) {
				this._main.close(targets[i]);
			}
		}
	};


	// Auto-initialize

	document.addEventListener('DOMContentLoaded', function () {
		var el = document.getElementsByClassName('sb-init'),
			i, max;
		for(i = 0, max = el.length; i < max; i++) {
			Selectbox(el[i], {
				custom: el[i].getAttribute('data-sb-custom')
			});
		}
	}, false);


	return Selectbox;

}));
