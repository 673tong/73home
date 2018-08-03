(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["openlayers"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("openlayers"));
    } else {
        root.LayerSwitcher = factory(root.ol);
    }
}(this, function (ol) {
    /**
     * OpenLayers v3/v4 Layer Switcher Control.
     * See [the examples](./examples) for usage.
     * @constructor
     * @extends {ol.control.Control}
     * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
     *                              **`tipLabel`** `String` - the button tooltip.
     */
    ol.control.LayerSwitcher = function (opt_options) {

        var options = opt_options || {};

        var tipLabel = options.tipLabel ?
          options.tipLabel : 'Legend';

        this.mapListeners = [];

        this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
        if (ol.control.LayerSwitcher.isTouchDevice_()) {
            this.hiddenClassName += ' touch';
        }
        this.shownClassName = 'shown';

        var element = document.createElement('div');
        element.className = this.hiddenClassName;
        //test
        element.id="layershowdiv";
        element.style.display = "none";
       // element.hide();


        var button = document.createElement('button');
        button.setAttribute('title', tipLabel);
        element.appendChild(button);

        var a = document.createElement('i');
        a.className = "fa fa-close close-i";
        element.appendChild(a);
        a.onclick = function (e) {
        	element.style.display = "none";
        	//修改人:黎顺平,加上标志位
       	    window.isShowLayers = false;//显示图层组的标志

        };
        
        
        this.panel = document.createElement('div');
        /*this.panel.className = 'panel';*/
        this.panel.id="panelid";
        element.appendChild(this.panel);
        ol.control.LayerSwitcher.enableTouchScroll_(this.panel);

        var this_ = this;

//        button.onmouseover = function (e) {
//            this_.showPanel();
//        };

//        button.onclick = function (e) {
//            e = e || window.event;
//            this_.showPanel();
//            e.preventDefault();
//        };

//        this_.panel.onmouseout = function (e) {
//            e = e || window.event;
//            if (!this_.panel.contains(e.toElement || e.relatedTarget)) {
//                this_.hidePanel();
//            }
//        };

        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });

    };

    ol.inherits(ol.control.LayerSwitcher, ol.control.Control);

    /**
     * Show the layer panel.
     */
    ol.control.LayerSwitcher.prototype.showPanel = function () {
        if (!this.element.classList.contains(this.shownClassName)) {
            this.element.classList.add(this.shownClassName);
            this.renderPanel();
        }
    };

    /**
     * Hide the layer panel.
     */
    ol.control.LayerSwitcher.prototype.hidePanel = function () {
        if (this.element.classList.contains(this.shownClassName)) {
            this.element.classList.remove(this.shownClassName);
            this.element.style.display='none';
        }
    };

    /**
     * Re-draw the layer panel to represent the current state of the layers.
     */
    ol.control.LayerSwitcher.prototype.renderPanel = function () {

        this.ensureTopVisibleBaseLayerShown_();

        while (this.panel.firstChild) {
            this.panel.removeChild(this.panel.firstChild);
        }

        var ul = document.createElement('ul');
        ul.className='mapadd_ul';
        this.panel.appendChild(ul);
        this.renderLayers_(this.getMap(), ul);

    };

    /**
     * Set the map instance the control is associated with.
     * @param {ol.Map} map The map instance.
     */
    ol.control.LayerSwitcher.prototype.setMap = function (map) {
        // Clean up listeners associated with the previous map
        for (var i = 0, key; i < this.mapListeners.length; i++) {
            ol.Observable.unByKey(this.mapListeners[i]);
        }
        this.mapListeners.length = 0;
        // Wire up listeners etc. and store reference to new map
        ol.control.Control.prototype.setMap.call(this, map);
        if (map) {
            var this_ = this;
            this.mapListeners.push(map.on('pointerdown', function () {
//                this_.hidePanel();
            }));
            this.renderPanel();
        }
    };

    /**
     * Ensure only the top-most base layer is visible if more than one is visible.
     * @private
     */
    ol.control.LayerSwitcher.prototype.ensureTopVisibleBaseLayerShown_ = function () {
        var lastVisibleBaseLyr;
        ol.control.LayerSwitcher.forEachRecursive(this.getMap(), function (l, idx, a) {
       	 if ((l.get('type') === 'base1' || l.get('type') === 'base2') && l.getVisible()) {
                lastVisibleBaseLyr = l;
            }
       });
        if (lastVisibleBaseLyr) this.setVisible_(lastVisibleBaseLyr, true);
    };

    /**
     * Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     * @private
     * @param {ol.layer.Base} The layer whos visibility will be toggled.
     */
    ol.control.LayerSwitcher.prototype.setVisible_ = function (lyr, visible) {
        var map = this.getMap();
        lyr.setVisible(visible);
        if (visible && lyr.get('type') === 'base1') {
            // Hide all other base layers regardless of grouping
            ol.control.LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
                if (l != lyr && l.get('type') === 'base2') {
                    l.setVisible(false);
                    var base2 = document.getElementsByName("base2");
                    for(var i=0;i<base2.length;i++){
                    	base2[i].checked = false;
                    };
                }
            });
        }else if(visible && lyr.get('type') === 'base2'){
        	ol.control.LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
                if (l != lyr && l.get('type') === 'base1') {
                    l.setVisible(false);
                    var base1 = document.getElementsByName("base1");
                    for(var i=0;i<base1.length;i++){
                    	base1[i].checked = false;
                    };
                }
            });
        }
    };

    /**
      * 设置图层置顶
      */
    ol.control.LayerSwitcher.prototype.setLayerZIndex = function (lyr) {
        var map = this.getMap();
        var layer_idx = -1;
        $.each(map.getLayers().getArray(), function (k, v) {
            if (v.getLayers() != null && v.getLayers().length > 0) {
                $.each(v.getLayers().getArray(), function (g) {

                });
            }
            if (v.get("layerId") == lyr.get("layerId")) {
                layer_idx = k;
            }
        });
        var layer = map.getLayers().removeAt(layer_idx);
        map.getLayers().insertAt(new_idx, layer);
        lyr.setZIndex(mapLayerZindex);
        mapLayerZindex++;
    };

    /**
     * Render all layers that are children of a group.
     * @private
     * @param {ol.layer.Base} lyr Layer to be rendered (should have a title property).
     * @param {Number} idx Position in parent group list.
     */
    ol.control.LayerSwitcher.prototype.renderLayer_ = function (lyr, idx) {

        var this_ = this;

        var li = document.createElement('li');

        var lyrTitle = lyr.get('title');
        var lyrId = ol.control.LayerSwitcher.uuid();

        var label = document.createElement('label');
        var map = this.getMap();
        if (lyr.getLayers && !lyr.get('combine')) {
        	if(lyr.getLayers().getArray().length > 0){
        		li.className = 'group';
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                var ul = document.createElement('ul');
                li.appendChild(ul);
                this.renderLayers_(lyr, ul);
        	}
        } else {
            li.className = 'layer';
            var input = document.createElement('input');
            if (lyr.get('type') === 'base1') {
                input.type = 'checkbox';
                input.name = 'base1';
            } else if(lyr.get('type') === 'base2'){
            	input.type = 'checkbox';
                input.name = 'base2';
            }else {
                input.type = 'checkbox';
            }
            input.id = lyrId;
            input.checked = lyr.get('visible');
            input.onchange = function (e) {
                this_.setVisible_(lyr, e.target.checked);
                if(lyr.get('title') == '小班' && input.checked){
                	var array =	map.getInteractions().getArray();
                	for(var i=0;i < array.length;i++){
                		if(array[i] instanceof ol.interaction.DoubleClickZoom){
                			array[i].setActive(false);
                			break;
                		}
                	};
                	map.on("dblclick",sBlockLayerClick);
                }else if(lyr.get('title') == '小班' && !input.checked){
                	map.un("dblclick",sBlockLayerClick);
                	var array =	map.getInteractions().getArray();
                	for(var i=0;i < array.length;i++){
                		if(array[i] instanceof ol.interaction.DoubleClickZoom){
                			array[i].setActive(true);
                			break;
                		}
                	};
                };
            };
            li.appendChild(input);

            var button = document.createElement('input');
            button.type = 'button';
            button.title = '置顶';
            button.id = lyrId;
            button.onclick = function (e) {
                this_.setLayerZIndex(lyr);
            }
            li.appendChild(button);

            label.htmlFor = lyrId;
            label.innerHTML = lyrTitle;

            var rsl = this.getMap().getView().getResolution();
            if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()) {
                label.className += ' disabled';
            }

            li.appendChild(label);

        }

        return li;

    };

    /**
     * Render all layers that are children of a group.
     * @private
     * @param {ol.layer.Group} lyr Group layer whos children will be rendered.
     * @param {Element} elm DOM element that children will be appended to.
     */
    ol.control.LayerSwitcher.prototype.renderLayers_ = function (lyr, elm) {
        var lyrs = lyr.getLayers().getArray().slice().reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title')) {
                elm.appendChild(this.renderLayer_(l, i));
            }
        }
    };

    /**
     * **Static** Call the supplied function for each layer in the passed layer group
     * recursing nested groups.
     * @param {ol.layer.Group} lyr The layer group to start iterating from.
     * @param {Function} fn Callback which will be called for each `ol.layer.Base`
     * found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach`
     */
    ol.control.LayerSwitcher.forEachRecursive = function (lyr, fn) {
        lyr.getLayers().forEach(function (lyr, idx, a) {
            fn(lyr, idx, a);
            if (lyr.getLayers) {
                ol.control.LayerSwitcher.forEachRecursive(lyr, fn);
            }
        });
    };

    /**
     * Generate a UUID
     * @returns {String} UUID
     *
     * Adapted from http://stackoverflow.com/a/2117523/526860
     */
    ol.control.LayerSwitcher.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
    * @private
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    */
    ol.control.LayerSwitcher.enableTouchScroll_ = function (elm) {
        if (ol.control.LayerSwitcher.isTouchDevice_()) {
            var scrollStartPos = 0;
            elm.addEventListener("touchstart", function (event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function (event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    };

    /**
     * @private
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     */
    ol.control.LayerSwitcher.isTouchDevice_ = function () {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    };
    var LayerSwitcher = ol.control.LayerSwitcher;
    return LayerSwitcher;
}));
