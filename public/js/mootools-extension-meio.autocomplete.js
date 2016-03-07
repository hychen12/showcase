/*
---

description: Port of bgiframe plugin for mootools

authors:
 - Fábio Miranda Costa

requires:
 - Core/Class.Extras

license: MIT-style license Original plugin copyright Copyright (c) 2006 Brandon Aaron (http://brandonaaron.net) Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses. Version 2.1.1

provides: [BGIFrame]

...
*/

(function(global, $) {

    var isIE6 = Browser.ie6; // better compression and faster

    var BgIframe = new Class({
        Implements: Options,
        options: {
            top     : 'auto',
            left    : 'auto',
            width   : 'auto',
            height  : 'auto',
            opacity : true,
            src     : 'javascript:false;'
        },
        initialize: function(element, options) {
            if (!isIE6) return;
            this.setOptions(options);
            this.element = $(element);
            var firstChild = this.element.getFirst();
            if (!(firstChild && firstChild.hasClass('bgiframe'))) {
                this.element.grab(document.createElement(this.render()), 'top');
            }
        },
        toPx: function(n) {
            return isFinite(n) ? n + 'px' : n;
        },
        render: function() {
            var options = this.options;
            return ['<iframe class="bgiframe" frameborder="0" tabindex="-1" src="', options.src, '" ',
                'style="display:block;position:absolute;z-index:-1;',
                (options.opacity !== false ? 'filter:alpha(opacity=\'0\');' : ''),
                'top:', (options.top === 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : this.toPx(options.top)), ';',
                'left:', (options.left === 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : this.toPx(options.left)), ';',
                'width:', (options.width === 'auto' ? 'expression(this.parentNode.offsetWidth+\'px\')' : this.toPx(options.width)), ';',
                'height:', (options.height === 'auto' ? 'expression(this.parentNode.offsetHeight+\'px\')' : this.toPx(options.height)), ';',
            '"/>'].join('');
        }
    });

    Element.implement('bgiframe', function(options) {
        if (isIE6) new BgIframe(this, options);
        return this;
    });

})(this, document.id || this.$);

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Core/Class.Extras
 - Core/Element.Event
 - Core/Element.Style
 - More/Element.Forms

license: MIT-style license

provides: [Meio]

...
*/

(function(global, $) {

    var browser = Browser; // better compression and faster

    // Custom Events

    // thanks Jan Kassens
    Object.append(Element.NativeEvents, {
        'paste': 2, 'input': 2
    });
    Element.Events.paste = {
        base : (browser.opera || (browser.firefox && browser.version < 3)) ? 'input' : 'paste',
        condition: function(e) {
            this.fireEvent('paste', e, 1);
            return false;
        }
    };

    // the key event that repeats
    Element.Events.keyrepeat = {
        base : (browser.firefox || browser.opera) ? 'keypress' : 'keydown',
        condition: Function.from(true)
    };

    // Meio namespace

    global.Meio = global.Meio || {};

}(this, document.id || this.$));

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Base

license: MIT-style license

provides: [Meio.Widget]

...
*/

Meio.Widget = new Class({

    initialize: function() {
        this.elements = {};
    },

    addElement: function(name, obj) {
        this.elements[name] = obj;
    },

    addEventToElement: function(name, eventName, event) {
        this.elements[name].addEvent(eventName, event.bind(this));
    },

    addEventsToElement: function(name, events) {
        for (var eventName in events) {
            this.addEventToElement(name, eventName, events[eventName]);
        }
    },

    attach: function() {
        for (var element in this.elements) {
            this.elements[element].attach();
        }
    },

    detach: function() {
        for (var element in this.elements) {
            this.elements[element].detach();
        }
    },

    destroy: function() {
        for (var element in this.elements) {
            if (this.elements[element]) {
                this.elements[element].destroy();
            }
        }
    }
});

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Base

license: MIT-style license

provides: [Meio.Element]

...
*/

(function(global, $) {

    global.Meio.Element = new Class({

        Implements: [Events],

        initialize: function(node) {
            this.setNode(node);
            this.createBoundEvents();
            this.attach();
        },

        setNode: function(node) {
            this.node = node ? $(node) || $$(node)[0] : this.render();
        },

        createBoundEvents: function() {
            this.bound = {};
            this.boundEvents.each(function(evt) {
                this.bound[evt] = function(e) {
					if (e.key == 'enter' && e.event.stopImmediatePropagation) e.event.stopImmediatePropagation();
                    this.fireEvent('before' + evt.capitalize(), e);
                    if (this[evt]) this[evt](e);
                    this.fireEvent(evt, e);
                    return true;
                }.bind(this);
            }, this);
        },

        attach: function() {
            for (var e in this.bound) {
                this.node.addEvent(e, this.bound[e]);
            }
        },

        detach: function() {
            for (var e in this.bound) {
                this.node.removeEvent(e, this.bound[e]);
            }
        },

        addClass: function(type) {
            this.node.addClass(type);
        },

        removeClass: function(type) {
            this.node.removeClass(type);
        },

        toElement: function() {
            return this.node;
        },

        render: function() {}

    });

}(this, document.id || this.$));

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Element

license: MIT-style license

provides: [Meio.Element.Field]

...
*/

(function(global, $) {

    global.Meio.Element.Field = new Class({

        Extends: global.Meio.Element,

        Implements: [Options],

        options: {
        	'class': 'MeioAutocompleteField',
        	theme: ''
        },

        initialize: function(field, options) {
            this.keyPressControl = {};
            this.boundEvents = ['paste', 'focus', 'blur', 'click', 'keyup', 'keyrepeat'];
            if (Browser.ie6) this.boundEvents.push('keypress'); // ie6 doesnt fire keydown on enter
            this.setOptions(options);
            this.parent(field);
            this.node.addClass(this.options['class'] + (this.options.theme ? '-' + this.options.theme : ''));

            $(global).addEvent('unload', function() {
                // if autocomplete is off when you reload the page the input value gets erased
                if (this.node) $(this.node).set('autocomplete', 'on'); 
            }.bind(this));
        },

        setNode: function(element) {
            this.parent(element);
            this.node.set('autocomplete', 'off');
        },

        // this let me get the value of the input on keydown and keypress
        keyrepeat: function(e) {
            clearInterval(this.keyrepeatTimer);
            this.keyrepeatTimer = this._keyrepeat.delay(1, this, e);
        },

        _keyrepeat: function(e) {
            this.fireEvent('delayedKeyrepeat', e);
        },

        destroy: function() {
            this.detach();
            this.node.removeAttribute('autocomplete');
        },

        // ie6 only, uglyness
        // this fix the form being submited on the press of the enter key
        keypress: function(e) {
            if (e.key === 'enter') this.bound.keyrepeat(e);
        }

    });

}(this, document.id || this.$));

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Element

license: MIT-style license

provides: [Meio.Element.List]

...
*/

(function(global, $) {

    global.Meio.Element.List = new Class({

        Extends: global.Meio.Element,

        Implements: [Options],

        options: {
            width: 'field', // you can pass any other value settable by set('width') to the list container
            'class': 'MeioAutocompleteList',
            theme: ''
        },

        initialize: function(options) {
            this.boundEvents = ['mousedown', 'mouseover'];
            this.setOptions(options);
            this.parent();
            this.focusedItem = null;
        },

        applyMaxHeight: function(maxVisibleItems) {
        	this.node.show();
            var listChildren = this.list.childNodes;
            var node = listChildren[maxVisibleItems - 1] || (listChildren.length ? listChildren[listChildren.length - 1] : null);
            if (!node) return;
            node = $(node);
            // uggly hack to fix the height of the autocomplete list
            for (var i = 2; i--;) this.node.setStyle('height', node.getCoordinates(this.list).bottom);
        },

        mouseover: function(e) {
            var item = this.getItemFromEvent(e);
            if (!item) return true;
            if (this.focusedItem) this.focusedItem.removeClass('hover');
            item.addClass('hover');
            this.focusedItem = item;
            this.fireEvent('focusItem', [this.focusedItem]);
        },

        mousedown: function(e) {
            e.preventDefault();
            this.shouldNotBlur = true;
            if (!(this.focusedItem = this.getItemFromEvent(e))) {
                e.dontHide = true;
                return true;
            }
            this.focusedItem.removeClass('hover');
        },

        focusItem: function(direction) {
            var newFocusedItem;
            if (this.focusedItem) {
                if ((newFocusedItem = this.focusedItem[direction == 'up' ? 'getPrevious' : 'getNext']())) {
                    this.focusedItem.removeClass('hover');
                    newFocusedItem.addClass('hover');
                    this.focusedItem = newFocusedItem;
                    this.scrollFocusedItem(direction);
                }
            } else {
                if ((newFocusedItem = this.list.getFirst())) {
                    newFocusedItem.addClass('hover');
                    this.focusedItem = newFocusedItem;
                }
            }
        },

        scrollFocusedItem: function(direction) {
            var focusedItemCoordinates = this.focusedItem.getCoordinates(this.list),
                scrollTop = this.node.scrollTop;
            if (direction == 'down') {
                var delta = focusedItemCoordinates.bottom - this.node.getStyle('height').toInt();
                if ((delta - scrollTop) > 0) {
                    this.node.scrollTop = delta;
                }
            } else {
                var top = focusedItemCoordinates.top;
                if (scrollTop && scrollTop > top) {
                    this.node.scrollTop = top;
                }
            }
        },

        getItemFromEvent: function(e) {
            var target = e.target;
            while (target && target.tagName.toLowerCase() != 'li') {
                if (target === this.node) return null;
                target = target.parentNode;
            }
            return $(target);
        },

        render: function() {
            var node = new Element('div', {
    			'class': this.options['class'] + (this.options.theme ? '-' + this.options.theme : '')
            }).hide();
            this.showing = false;
            if (node.bgiframe) node.bgiframe({top: 0, left: 0});
            this.list = new Element('ul').inject(node);
            return node;
        },

        positionNextTo: function(fieldNode) {
            var width = this.options.width, listNode = this.node;
            listNode.setStyle('width', width == 'field' ? fieldNode.getWidth().toInt() - listNode.getStyle('border-left-width').toInt() - listNode.getStyle('border-right-width').toInt() : width);
            //listNode.position({relativeTo:fieldNode, position:'leftBottom'});	// modified by mllee
        },

        show: function() {
            if(this.field) this.node.inject(document.body, 'bottom');		// added by mllee
            this.node.scrollTop = 0;
            this.node.show().position({relativeTo:this.field.node, position:'leftBottom'});
            this.showing = true;
        },

        hide: function() {
            this.showing = false;
            this.node.hide();
            if(this.field) this.node.inject(this.field.node, 'after');		// added by mllee
        },
        
        setField: function(field){	// added by mllee
        	this.field = field;
        }
    });

}(this, document.id || this.$));

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Widget
 - Meio.Element.List
 - Meio.Element.Field

license: MIT-style license

provides: [Meio.Autocomplete]

...
*/

(function(global, $) {

    var Meio = global.Meio;

    var keysThatDontChangeValueOnKeyUp = {
        9:   1,  // tab
        16:  1,  // shift
        17:  1,  // control
        18:  1,  // alt
        224: 1,  // command (meta onkeypress)
        91:  1,  // command (meta onkeydown)
        37:  1,  // left
        38:  1,  // up
        39:  1,  // right
        40:  1   // down
    };

    var encode = function(str) {
        return str && typeOf(str) == 'string' ? str.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';
    };

    Meio.Autocomplete = new Class({

        Extends: Meio.Widget,

        Implements: [Options, Events],

        options: {

            delay: 100,
            minChars: 0,
            cacheLength: 10,
            maxVisibleItems: 10,
            cacheType: 'shared', // 'shared' or 'own'
            
            // add by mllee below ---------------------
            forceData: false,		// false or function(data) ...
            // ----------------------------------------

            filter: {
            	type: 'contains',
            	path: 'name'
                /*
                    its posible to pass the filters directly or by passing a type and optionaly a path.

                    filter: function(text, data) {}
                    formatMatch: function(text, data, i) {}
                    formatItem: function(text, data) {}

                    or

                    type: 'startswith' or 'contains' // can be any defined on the Meio.Autocomplete.Filter object
                    path: 'a.b.c' // path to the text value on each object thats contained on the data array
                */
            },

            /*
            onNoItemToList: function(elements) {},
            onSelect: function(elements, item, label, index, component) {},
            onDeselect: function(elements) {},
            */

            fieldOptions: {}, // see Element options
            listOptions: {}, // see List options
            requestOptions: {}, // see DataRequest options
            urlOptions: {} // see URL options

        },

        initialize: function(input, data, options, listInstance) {
            this.parent();
            this.setOptions(options);
            this.active = 0;

            this.forceData = this.options.forceData == true ? true : ['function', 'string'].contains(typeOf(this.options.forceData)); 
            this.valueFilter = typeOf(this.options.forceData) == 'function' ? this.options.forceData : function(data, text){
            	return typeOf(this.options.forceData) == 'string' ? data[this.options.forceData] : text;
            };
            if(this.forceData && !this.options.onNoItemToList)
            	this.options.onNoItemToList = function(elements){
					elements.field.node.highlight('#FF9999');
				};
			this.setOptions(options);
            
			if(this.options.filter.filter && this.options.filter.formatMatch && this.options.filter.formatMatch){
				delete this.options.filter.type;
				delete this.options.filter.path;
			}
            this.filters = Meio.Autocomplete.Filter.get(this.options.filter);

            this.addElement('field', new Meio.Element.Field(input, this.options.fieldOptions));
            this.inputedText = '';
            this.addFieldEvents();

            this.addElement('list', listInstance || new Meio.Element.List(this.options.listOptions));
            this.addListEvents();
            this.elements.list.node.inject(this.elements.field.node, 'after');
            this.elements.list.setField(this.elements.field);	// added by mllee

            this.addSelectEvents();

            this.attach();
            this.initCache();
            this.initData(data);
        },

        addFieldEvents: function() {
            this.addEventsToElement('field', {
                'beforeKeyrepeat': function(e) {
                    this.active = 1;
                    var e_key = e.key, list = this.elements.list;
                    if (e_key == 'up' || e_key == 'down' || (e_key == 'enter' && list.showing)) e.preventDefault();
                },
                'delayedKeyrepeat': function(e) {
                    var e_key = e.key, field = this.elements.field;
                    field.keyPressControl[e_key] = true;
                    switch (e_key) {
                    case 'up': case 'down':
                        this.focusItem(e_key);
                        break;
                    case 'enter':
                    	e.stopPropagation();
                    	this.autoSave = true;
                        this.elements.field.node.blur();
                        break;
                    case 'tab':
                    	this.autoSave = true;
                        field.keyPressControl[e_key] = false; // tab blurs the input so the keyup event wont happen at the same input you made a keydown
                        break;
                    case 'esc':
                    	this.autoSave = false;
                        this.elements.field.node.blur();
                        break;
                    default:
                        this.setupList();
                    }
                    this.oldInputedText = field.node.get('value');
                },
                'keyup': function(e) {
                    var field = this.elements.field;
                    if (!keysThatDontChangeValueOnKeyUp[e.code]) {
                        if (!field.keyPressControl[e.key]) this.setupList();
                        field.keyPressControl[e.key] = false;
                    }
                },
                'focus': function() {
                    this.active = 1;
                    var list = this.elements.list;
                    list.focusedItem = null;
                    list.positionNextTo(this.elements.field.node);
                    this.elements.field.removeClass('selected');
                    this.autoSave = true;
                },
                'click': function() {
                    if (/*++this.active > 2 &&*/ !this.elements.list.showing) {
                    	this.setupList();
                        //this.forceSetupList();
                    }
                },
                'blur': function(e) {
                    this.active = 0;
                    var list = this.elements.list;
                    if (list.shouldNotBlur) {
                        this.elements.field.node.setCaretPosition('end');
                        list.shouldNotBlur = false;
                        if (list.focusedItem) list.hide();
                    }
                    else list.hide();
                    if(this.autoSave) this.setInputValue();
                    else this.resetInputValue();
                },
                'paste': function() {
                    return this.setupList();
                }
            });
        },

        addListEvents: function() {
            this.addEventsToElement('list', {
                'mousedown': function(e) {
                    if (this.active && !e.dontHide) this.setInputValue();
                }
            });
        },

        update: function() {
            var data = this.data, list = this.elements.list;
            var cacheKey = data.getKey(), cached = this.cache.get(cacheKey), html;
            if (cached) {
                html = cached.html;
                this.itemsData = cached.data;
            } else {
                data = data.get();
                var itemsHtml = [], itemsData = [], classes = list.options.classes, text = this.inputedText;
                var filter = this.filters.filter, formatMatch = this.filters.formatMatch, formatItem = this.filters.formatItem;
                for (var row, i = 0, n = 0; (row = data[i++]);) if (filter.call(this, text, row)) {
                    itemsHtml.push('<li title="', encode(formatMatch.call(this, text, row)),
                    	'" data-index="', n, '">', formatItem.call(this, text, row, n), '</li>');
                    itemsData.push(row);
                    n++;
                }
                html = itemsHtml.join('');
                this.cache.set(cacheKey, {html: html, data: itemsData});
                this.itemsData = itemsData;
            }
            list.focusedItem = null;
            this.fireEvent('deselect', [this.elements]);
            list.list.set('html', html);
            if (this.options.maxVisibleItems) list.applyMaxHeight(this.options.maxVisibleItems);
        },

        setupList: function() {
            this.inputedText = this.elements.field.node.get('value');
            if(this.inputedText.length > 0 && this.inputedText !== this.oldInputedText)
            	this.forceSetupList(this.inputedText);
            else this.elements.list.hide();
            return true;
        },

        forceSetupList: function(inputedText) {
            inputedText = inputedText || this.elements.field.node.get('value');
            if (inputedText.length >= this.options.minChars) {
                clearInterval(this.prepareTimer);
                this.prepareTimer = this.data.prepare.delay(this.options.delay, this.data, inputedText);
            }
        },

        dataReady: function() {
            this.update();
            if (this.onUpdate) {
                this.onUpdate();
                this.onUpdate = null;
            }
            var list = this.elements.list;
            if (list.list.get('html')) {
                this.fireEvent('itemToList', [this.elements]);
                if (this.forceData /*&& list.list.getChildren().length === 1*/) list.focusItem(); //this.focusItem();
                if (this.active) list.show();
                //else if(this.forceData /*&& list.list.getChildren().length === 1*/) this.setInputValue();
            }
            else {
                this.fireEvent('noItemToList', [this.elements]);
                list.hide();
            }
        },

        setInputValue: function() {
            var list = this.elements.list;
            var field = this.elements.field; 
            if(list.focusedItem) {
                this.label = list.focusedItem.get('title');
                field.node.set('value', this.label);
                var index = list.focusedItem.get('data-index');
                this.fireEvent('select', [this.elements, this.itemsData[index], this.label, index, this]);
                this.value = this.valueFilter.call(this, this.itemsData[index], this.label);
            }
            else if(this.inputedText.length == 0){
        		this.label = '';
        		this.value = undefined;
            }
            else if(!this.forceData){
            	this.label = field.node.get('value');
            	this.value = field.node.get('value');
            }
        	field.node.set('value', this.label ? this.label : '').addClass('selected');
            list.hide();
            this.oldInputedText = field.node.get('value');
        },
        
        reset: function(){
        	this.value = '';
        	this.label = '';
        	this.resetInputValue();
        },
        
        resetInputValue: function(){
        	this.elements.field.node.set('value', this.label ? this.label : '');
            this.elements.field.addClass('selected');
            this.elements.list.hide();
            this.oldInputedText = this.elements.field.node.get('value');
        },
        
        getValue: function(){
        	return this.value;
        },

        focusItem: function(direction) {
            var list = this.elements.list;
            if (list.showing) {
                list.focusItem(direction);
            } else {
                this.forceSetupList();
                this.onUpdate = function() { list.focusItem(direction); };
            }
        },

        addSelectEvents: function() {
            this.addEvents({
                select: function(elements) {
                    elements.field.addClass('selected');
                },
                deselect: function(elements) {
                    elements.field.removeClass('selected');
                }
            });
        },

        initData: function(data) {
            this.data = (typeOf(data) == 'string') ?
                new Meio.Autocomplete.Data.Request(data, this.cache, this.elements.field, this.options.requestOptions, this.options.urlOptions) :
                (typeOf(data) == 'function') ? new Meio.Autocomplete.Data.Source(data, this.cache, this.elements.field) :
                new Meio.Autocomplete.Data(data, this.cache);
            this.data.addEvent('ready', this.dataReady.bind(this));
        },

        initCache: function() {
            var cacheLength = this.options.cacheLength;
            if (this.options.cacheType == 'shared') {
                this.cache = Meio.Autocomplete.Cache.instance;
                this.cache.setMaxLength(cacheLength);
            } else if (this.options.cacheType == 'own') { // 'own'
                this.cache = new Meio.Autocomplete.Cache(cacheLength);
            } else { // deactivates cache
                this.cache = new Meio.Autocomplete.FakeCache();
            }
        },

        refreshCache: function(cacheLength) {
            this.cache.refresh();
            this.cache.setMaxLength(cacheLength || this.options.cacheLength);
        },

        refreshAll: function(cacheLength, urlOptions) {
            // TODO, do you really need to refresh the url? see a better way of doing this
            this.refreshCache(cacheLength);
            this.data.refreshKey(urlOptions);
        }

    });

}(this, document.id || this.$));


/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Autocomplete

license: MIT-style license

provides: [Meio.Autocomplete.Filter]

...
*/

Meio.Autocomplete.Filter = {

    filters: {},

    get: function(options) {
        var type = options.type, keys = (options.path || '').split('.');
        var filters = (type && this.filters[type]) ? this.filters[type](this, keys) : options;
        return Object.merge(this.defaults(keys), filters);
    },

    define: function(name, options) {
        this.filters[name] = options;
    },

    defaults: function(keys) {
        var self = this;
        return {
            filter: function(text, data) {
                return text ? self._getValueFromKeys(data, keys).test(new RegExp(text.escapeRegExp(), 'i')) : true;
            },
            formatMatch: function(text, data) {
                return self._getValueFromKeys(data, keys);
            },
            formatItem: function(text, data, i) {
                return text ? self._getValueFromKeys(data, keys).replace(new RegExp('(' + text.escapeRegExp() + ')', 'gi'), '<span class="match">$1</span>') : self._getValueFromKeys(data, keys);
            }
        };
    },

    _getValueFromKeys: function(obj, keys) {
        var key, value = obj;
        for (var i = 0; (key = keys[i++]);) value = value[key];
        return value;
    }

};

Meio.Autocomplete.Filter.define('contains', function(self, keys) {return {};});
Meio.Autocomplete.Filter.define('startswith', function(self, keys) {
    return {
        filter: function(text, data) {
            return text ? self._getValueFromKeys(data, keys).test(new RegExp('^' + text.escapeRegExp(), 'i')) : true;
        }
    };
});



/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Autocomplete

license: MIT-style license

provides: [Meio.Autocomplete.Data]

...
*/


Meio.Autocomplete.Data = new Class({

    Implements: [Options, Events],

    initialize: function(data, cache) {
        this.data = data;
        this._cache = cache;
        this.dataString = JSON.encode(this.data);
    },

    get: function() {
        return this.data;
    },

    getKey: function() {
        return this.cachedKey;
    },

    prepare: function(text) {
        this.cachedKey = this.dataString + (text || '');
        this.fireEvent('ready');
    },

    cache: function(key, data) {
        this._cache.set(key, data);
    },

    refreshKey: function() {}

});

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Autocomplete.Data

license: MIT-style license

provides: [Meio.Autocomplete.Data.Source]

...
*/

Meio.Autocomplete.Data.Source = new Class({

    Extends: Meio.Autocomplete.Data,

    initialize: function(source, cache, element) {
        this.source = source;
        this._cache = cache;
        this.element = element;
    },

    prepare: function(text) {
        this.element.addClass('loading');
        this.source(text, this.done.bind(this));
    },

    done: function(data) {
        this.data = data;
        this.element.removeClass('loading');
        this.fireEvent('ready');
    }

});


/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Autocomplete.Data

license: MIT-style license

provides: [Meio.Autocomplete.Data.Request]

...
*/

Meio.Autocomplete.Data.Request = new Class({

    Extends: Meio.Autocomplete.Data,

    options: {
        noCache: true,
        formatResponse: function(jsonResponse) {
            return jsonResponse;
        },
        link: 'cancel'
    },

    initialize: function(url, cache, element, options, urlOptions) {
        this.setOptions(options);
        this.noCache = this.options.noCache;
        delete this.options.noCache;
        this.rawUrl = url;
        this._cache = cache;
        this.element = element;
        this.urlOptions = urlOptions;
        this.refreshKey();
        this.createRequest();
    },

    prepare: function(text) {
        this.cachedKey = this.url.evaluate(text);
        if (this._cache.has(this.cachedKey)) this.fireEvent('ready');
        else this.request.send({url: this.cachedKey + (this.noCache ? '&c=' + String.uniqueID() : '')});
    },

    createRequest: function() {
        var self = this;
        this.request = new Request.JSON(this.options);
        this.request.addEvents({
            request: function() {
                self.element.addClass('loading');
            },
            complete: function() {
                self.element.removeClass('loading');
            },
            success: function(jsonResponse) {
                self.data = self.options.formatResponse(jsonResponse);
                self.fireEvent('ready');
            }
        });
    },

    refreshKey: function(urlOptions) {
        urlOptions = Object.merge(this.urlOptions, {url: this.rawUrl}, urlOptions || {});
        this.url = new Meio.Autocomplete.Data.Request.URL(urlOptions.url, urlOptions);
    }

});

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Autocomplete.Data.Request

license: MIT-style license

provides: [Meio.Autocomplete.Data.Request.URL]

...
*/


Meio.Autocomplete.Data.Request.URL = new Class({

    Implements: [Options],

    options: {
        queryVarName: 'q',
        extraParams: null,
        max: 10
    },

    initialize: function(url, options) {
        this.setOptions(options);
        this.rawUrl = url;
        this.url = url;
        this.url += this.url.contains('?') ? '&' : '?';
        this.dynamicExtraParams = [];
        var params = Array.from(this.options.extraParams);
        for (var i = params.length; i--;) {
            this.addParameter(params[i]);
        }
        if (this.options.max) this.addParameter('limit=' + this.options.max);
    },

    evaluate: function(text) {
        text = text || '';
        var params = this.dynamicExtraParams, url = [];
        url.push(this.options.queryVarName + '=' + encodeURIComponent(text));
        for (var i = params.length; i--;) {
            url.push(encodeURIComponent(params[i].name) + '=' + encodeURIComponent(Function.from(params[i].value)()));
        }
        return this.url + url.join('&');
    },

    addParameter: function(param) {
        if (param.nodeType == 1 || typeOf(param.value) == 'function') {
            this.dynamicExtraParams.push(param);
        } else {
            this.url += ((typeOf(param) == 'string') ? param : encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value)) + '&';
        }
    },

    // TODO remove non dynamic parameters
    removeParameter: function(param) {
        this.dynamicExtraParams.erase(param);
    }

});

/*
---

description: A plugin for enabling autocomplete of a text input or textarea.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Base

license: MIT-style license

provides: [Meio.Autocomplete.Cache]

...
*/


(function(global) {

    global.Meio.Autocomplete = global.Meio.Autocomplete || {};

    var Cache = global.Meio.Autocomplete.Cache = new Class({

        initialize: function(maxLength) {
            this.refresh();
            this.setMaxLength(maxLength);
        },

        set: function(key, value) {
            if (!this.cache[key] && this.maxLength > 0) {
                if (this.getLength() >= this.maxLength) {
                    var keyToRemove = this.pos.shift();
                    this.cache[keyToRemove] = null;
                    delete this.cache[keyToRemove];
                }
                this.cache[key] = value;
                this.pos.push(key);
            }
            return this;
        },

        get: function(key) {
            return this.cache[key || ''] || null;
        },

        has: function(key) {
            return !!this.get(key);
        },

        getLength: function() {
            return this.pos.length;
        },

        refresh: function() {
            this.cache = {};
            this.pos = [];
        },

        setMaxLength: function(maxLength) {
            this.maxLength = Math.max(maxLength, 0);
        }

    });

    global.Meio.Autocomplete.FakeCache = new Class({
        Extends: Cache,

        get: function() {
            return null;
        },

        set: function() {
            return this;
        }
    });

    global.Meio.Autocomplete.Cache.instance = new Meio.Autocomplete.Cache();

}(this));