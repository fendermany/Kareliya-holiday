/*

 JQuery Leaflet Pop Up v1.0.0
 Copyright © 2014 Artem Loginov
 http://loginoff.pro/

 License:
 GNU General Public License 2 - http://opensource.org/licenses/GPL-2.0

 */

(function($) {

    'use strict';

    var LeafletPopup = (function(window, undefined) {

        var leaflet = {

                settings: {},
                defaultSettings: {

                    url: false,
                    content: false,                         // text/html string or function, who will return text/html string, or false (boolean)
                    contentType: false,                     // string: "html", "function", "image", "iframe", "url", "hash"

                    animationStyleOfBox: 'fade',            // animation style of popup box: "fade", "scale", "drop", "drop3d"
                    animationStyleOfOverlay: 'fade',        // animation style of overlay: "fade", "scale"
                    animationStyleOfChange: 'fade',         // animation style of change content: "fade", "slide", "pushDown"
                    animateSpeed: 400,

                    boxVerticalGutters: 50,                 // number of pixels
                    boxHorizontalGutters: 50,               // number of pixels
                    boxWidth: 800,                          // number of pixels or string 'auto',

                    closeBtnClass: 'i-leaflet i-leaflet-close',
                    closeBtnLocation: 'overlay',            // 'overlay', 'box',

                    directionBtnClass: ['i-leaflet i-leaflet-prev', 'i-leaflet i-leaflet-next'],
                    directionBtnLocation: 'overlay',        // 'overlay', 'box',

                    checkCookies: false,
                    cookies: {
                        key: 'jquery.leaflet',
                        value: 'locked',
                        expires: 1,
                        path: '/'
                    },

                    maxHeight: false,

                    namespace: 'b-leaflet',                  // css-prefix for popup layout

                    overlay: true,
                    overlayBlur: false,
                    overlayCloseEvent: true,
                    overlayOpacity: 0.65,
                    overlayShowSpeed: 400,
                    overlayLoader: {
                        cx: 26,
                        cy: 26,
                        r: 25
                    },

                    scrollMode: 'outer',                    // 'outer' - common scroll mode, 'inner' - popup is fixed behind content
                    scrollLocker: null,

                    // Callbacks
                    beforeLoad: function() {  },            // this - popup box jquery object
                    afterLoad: function() {  },             // this - popup box jquery object

                    beforeClose: function() {  },           // this - popup container jquery object
                    afterClose: function() {  }             // global context

                },

                states: {
                    isBuilt: false,
                    keycode: 0,
                    scroll: 0,
                    scrollBarWidth: 18,
                    direction: 1
                },
                elements: {},
                group: {},
                groupArray: []

            },

            KEYCODE_LEFT_ARROW = 37,
            KEYCODE_RIGHT_ARROW = 39,

            KEYCODE_ESC = 27;

        function App($element, options, method) {

            // Cashing
            leaflet.elements.body = $('body');
            leaflet.elements.document = $('html');

            leaflet.elements.link = $element;

            // Get settings
            this.settings = $.extend(leaflet.settings, leaflet.defaultSettings, options);

            this.settings.url = this.settings.url || $element.attr('href') || $element.data('href') || '/';

            if (!this.settings.contentType) {

                this.setContentType();

            }

            this.settings.boxWidth = typeof this.settings.boxWidth === 'function' ? this.settings.boxWidth.call(leaflet.elements.link) : this.settings.boxWidth;
            this.settings.closeBtnLocation = this.settings.overlay ? this.settings.closeBtnLocation : 'box';
            this.settings.scrollMode = typeof this.settings.scrollMode === 'function' ? this.settings.scrollMode() : this.settings.scrollMode;

            // Set states
            this.states = {};
            this.states.pfx = helpers.getPfx();
            this.states.loadingTimeout = null;
            this.states.scroll = document.documentElement.scrollTop || document.body.scrollTop;
            this.states.scrollBarWidth = helpers.getScrollBarWidth();

            // Set document classes prefix
            this.docClassPfx = 'm-leaflet-';

            switch (method) {

                default:

                    return $.error('Method "' +  param + '" is not defined in LeafletPopup');

                case 'init':

                    // Init popup
                    this.init();

                    break;

                case 'show':

                    if (!(this.settings.checkCookies && helpers.cookies.get(this.settings.cookies.key) == this.settings.cookies.value)) {

                        // Init popup
                        this.init();
                        helpers.cookies.set(this.settings.cookies);

                    }

                    break;

                case 'hide':

                    // Hide popup
                    this.hideLayout();

                    break;

                case 'destroy':

                    leaflet.elements.body.off('click.leafletOpen', $element.selector);

                    break;

            }

        }

        App.prototype.init = function() {

            if (!leaflet.states.isBuilt) {

                // Build layout
                this.buildLayout();

                // Popup box show
                this.boxShow();

            } else {

                // Popup box change
                this.boxChange();

            }

        };

        App.prototype.configureDocClasses = function() {

            var docClasses = this.docClassPfx + 'on ' + this.docClassPfx + 'loading ';

            // Box transition style
            docClasses += this.docClassPfx + this.settings.animationStyleOfBox + '-transition ';

            // Leaflet mode
            docClasses += this.docClassPfx + this.settings.scrollMode + '-mode ';

            // Overlay switch
            docClasses += this.settings.overlay ? this.docClassPfx + 'overlay ' : '';

            return docClasses;

        };

        App.prototype.removeDocClasses = function() {

            var mask = this.docClassPfx + '*';

            leaflet.elements.document.removeClass(function(index, classStr) {

                var replace = mask.replace(/\*/g, '\\S+');
                return (classStr.match(new RegExp('\\b' + replace + '', 'g')) || []).join(' ');

            });

        };

        App.prototype.setContentType = function() {

            if (!!this.settings.content) {

                switch (typeof leaflet.settings.content) {

                    default:
                    case 'string':

                        this.settings.contentType = 'html';

                        break;

                    case 'function':

                        this.settings.contentType = 'function';

                        break;

                    case 'boolean':

                        this.settings.contentType = 'iframe';

                        break;

                }

            } else {

                var isImage = /\.(gif|png|jp(e|g|eg)|bmp|ico|webp|jxr|svg)((#|\?).*)?$/i.test(this.settings.url),
                    hasHash = !!this.settings.url.match(/#/gi),
                    remoteHash = this.settings.url.indexOf('#') !== 0;

                if (isImage) {

                    this.settings.contentType = 'image';

                }

                if (hasHash && !remoteHash) {

                    this.settings.contentType = 'hash';

                }

                if (hasHash && remoteHash) {

                    this.settings.contentType = 'hashUrl';

                }

                if (!isImage && !hasHash) {

                    this.settings.contentType = 'url';

                }

            }

        };

        App.prototype.buildLayout = function() {

            // Create popUp markup
            var $leaflet = $('<div class="' + leaflet.settings.namespace + '"></div>'),

                $leafletCapsule = $('<div class="' + leaflet.settings.namespace + '_capsule"></div>').appendTo($leaflet),
                $leafletWrapper = $('<div class="' + leaflet.settings.namespace + '_capsule_inner"></div>').css({ padding: leaflet.settings.boxVerticalGutters + 'px ' + leaflet.settings.boxHorizontalGutters + 'px' }).appendTo($leafletCapsule),

                $leafletSources = $('<div class="' + leaflet.settings.namespace + '_inner_sources"></div>').appendTo($leafletWrapper),
                $leafletPerspective = $('<div class="' + leaflet.settings.namespace + '_perspective"></div>').css({ maxWidth: leaflet.settings.boxWidth }).appendTo($leafletWrapper),

                $leafletBox = $('<div class="' + leaflet.settings.namespace + '_box"></div>').css({ width: 'auto', maxWidth: leaflet.settings.boxWidth }).appendTo($leafletPerspective),
                $leafletBoxContent = $('<div class="' + leaflet.settings.namespace + '_box_content"></div>').appendTo($leafletBox),

                $leafletCloseBtn = $('<div class="' + leaflet.settings.namespace + '_close ' + leaflet.settings.closeBtnClass + '"></div>'),

                $leafletOverlay = $('<div class="' + leaflet.settings.namespace + '_overlay"></div>'),
                $leafletOverlayLoader = $('<div class="' + leaflet.settings.namespace + '_overlay_loader"></div>'),
                $leafletOverlayLoaderCircle = $('<svg><circle cx="' + leaflet.settings.overlayLoader.cx + '" cy="' + leaflet.settings.overlayLoader.cy + '" r="' + leaflet.settings.overlayLoader.r + '"></circle></svg>').appendTo($leafletOverlayLoader),

                $leafletNav = $('<div class="' + leaflet.settings.namespace + '_nav"></div>').appendTo(this.settings.directionBtnLocation === 'box' ? $leafletBox : $leafletWrapper),

                $leafletPrevBtn = $('<div class="' + leaflet.settings.namespace + '_direction ' + leaflet.settings.namespace + '_prev ' + leaflet.settings.directionBtnClass[0] + '"></div>').appendTo($leafletNav),
                $leafletNextBtn = $('<div class="' + leaflet.settings.namespace + '_direction ' + leaflet.settings.namespace + '_next ' + leaflet.settings.directionBtnClass[1] + '"></div>').appendTo($leafletNav),

                $leafletLocker = $('<div class="' + leaflet.settings.namespace + '_locker"></div>');

            // Overlay
            if (!!leaflet.settings.overlay) {

                $leafletOverlay.appendTo($leafletWrapper);

            }

            if (!!leaflet.settings.overlayLoader) {

                $leafletOverlayLoader.appendTo($leafletOverlay);

            }

            leaflet.elements.sources = $leafletSources;

            // Group
            this.groupSources();
            $leafletNav.toggle(leaflet.groupArray.length > 1);

            // Close
            $leafletCloseBtn.appendTo(this.settings.closeBtnLocation === 'box' ? $leafletBox : $leafletWrapper);

            // Transition settings
            $leaflet
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms');

            $leafletBox
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms');

            $leafletBoxContent
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms');

            $leafletOverlay
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.overlayShowSpeed + 'ms')
                .css('transition-duration', leaflet.settings.overlayShowSpeed + 'ms');

            // Add document classes
            leaflet.elements.document.addClass(this.configureDocClasses());

            // Set leaflet data
            $leaflet.data('leafletSettings', {
                animationStyleOfBox: this.settings.animationStyleOfBox,
                animationStyleOfOverlay: this.settings.animationStyleOfOverlay,
                animationStyleOfChange: this.settings.animationStyleOfChange,
                scrollLocker: this.settings.scrollLocker,
                scrollMode: this.settings.scrollMode
            });

            // Caching jquery objects
            leaflet.elements.main = $leaflet;
            leaflet.elements.perspective = $leafletPerspective;
            leaflet.elements.wrapper = $leafletWrapper;
            leaflet.elements.box =  $leafletBox;
            leaflet.elements.close = $leafletCloseBtn;
            leaflet.elements.nav = $leafletNav;
            leaflet.elements.prev = $leafletPrevBtn;
            leaflet.elements.next = $leafletNextBtn;
            leaflet.elements.content = $leafletBoxContent;
            leaflet.elements.overlay = $leafletOverlay;
            leaflet.elements.loader = $leafletOverlayLoader;
            leaflet.elements.locker = !!this.settings.scrollLocker ? this.settings.scrollLocker : $leafletLocker;

            // Caching scroll state
            leaflet.states.scroll = this.states.scroll;

            // Set layout mode
            this.setLayoutMode();

            // Bind events
            this.bindCloseEvents();
            this.bindChangeEvents();
            this.bindResizeEvents();

            // Append markup
            leaflet.elements.body.prepend($leaflet);

            // Show overlay with micro delay
            setTimeout($.proxy(function() {

                this.overlayShow();

            }, this), 0);

            // Switch state
            leaflet.states.isBuilt = true;

        };

        App.prototype.hideLayout = function() {

            // Action before closing popup
            if(!!this.settings.beforeClose) {

                this.settings.beforeClose.call(leaflet.elements.main, leaflet);

            }

            this.overlayHide();

            // Hide popup box and destroy layout
            this.boxHide(function() {

                // Unset locker
                this.unsetLayoutMode();

                // Destroy layout
                leaflet.elements.main.remove();

                // Clear document classes
                this.removeDocClasses();

                // Switch state
                leaflet.states.isBuilt = false;

                leaflet.group = {};
                leaflet.groupArray = [];
                leaflet.groupCurrent = false;

                // Action after closing popup
                if(!!this.settings.afterClose) {

                    this.settings.afterClose();

                }

            });

        };

        App.prototype.setLayoutMode = function() {

            if (this.settings.scrollMode === 'outer') {

                $('body')
                    .css({
                        //position: 'fixed',
                        overflow: 'hidden',
                        paddingRight: helpers.getScrollBarWidth()
                        //marginTop: -leaflet.states.scroll,
                        //height: '100%'
                    });

            }

        };

        App.prototype.unsetLayoutMode = function() {

            if (leaflet.elements.main.data('leafletSettings').scrollMode === 'outer') {

                $('body')
                    .css({
                        position: '',
                        overflow: '',
                        paddingRight: '',
                        marginTop: '',
                        height: ''
                    });

                //window.scrollBy(0, leaflet.states.scroll);

            }

        };

        App.prototype.groupSources = function() {

            var $group = $('[data-group="' + leaflet.elements.link.attr('data-group') + '"]');

            leaflet.group = $group.filter(function() {

                return leaflet.states.isBuilt || !!$(this).data('leaflet');

            });

            leaflet.groupCurrent = leaflet.group.length && typeof leaflet.groupCurrent === 'undefined' ? leaflet.group.index(leaflet.elements.link) : leaflet.groupCurrent;

            /*
             leaflet.elements.sources.empty().append(leaflet.group.clone());
             leaflet.group = leaflet.elements.sources.find('[data-group]');
             */

            $group.each(function() {

                if (leaflet.states.isBuilt || !!$(this).data('leaflet')) {

                    leaflet.groupArray.push($(this));

                }

            });

        };

        App.prototype.bindCloseEvents = function() {

            leaflet.elements.close
                .add(this.settings.overlayCloseEvent ? leaflet.elements.overlay : {})
                .bind('click.leafletClose', $.proxy(function() {

                    this.hideLayout();

                }, this));

            // Keyboard
            $(document).bind('keyup.leafletClose', $.proxy(function(e) {

                leaflet.states.keycode = e.keyCode;

                if (leaflet.states.keycode === KEYCODE_ESC) {

                    this.hideLayout();

                }

            }, this));

        };

        App.prototype.bindResizeEvents = function() {

            $(window).bind('resize.leafletResize', $.proxy(function() {

                if (leaflet.states.isBuilt) {

                    leaflet.elements.box
                        .css(this.states.pfx + 'transition-property', 'top, margin, height, transform, opacity, visibility')
                        .css('transition-property', 'top, margin, height, transform, opacity, visibility');

                    this.boxPosition();

                }

            }, this));

        };

        App.prototype.bindChangeEvents = function() {

            $(leaflet.elements.prev)
                .bind('click.leafletChange', $.proxy(function() {

                    leaflet.states.direction = -1;
                    this.changeEventHandler();

                }, this));

            $(leaflet.elements.next)
                .bind('click.leafletChange', $.proxy(function() {

                    leaflet.states.direction = 1;
                    this.changeEventHandler();

                }, this));

            // Keyboard
            $(document).bind('keyup.leafletChange', $.proxy(function(e) {

                leaflet.states.keycode = e.keyCode;

                if (!leaflet.elements.document.hasClass(this.docClassPfx + 'loading') && (leaflet.states.keycode === KEYCODE_RIGHT_ARROW || leaflet.states.keycode === KEYCODE_LEFT_ARROW)) {

                    leaflet.states.direction = leaflet.states.keycode === KEYCODE_RIGHT_ARROW ? 1 : -1;
                    this.changeEventHandler();

                }

            }, this));

            // Swipe
            leaflet.elements.perspective.bind('touchstart.leafletSwipeControl', function(e) {

                var touch = e.originalEvent.touches[0];

                helpers.touches[e.type].x = touch.pageX;
                helpers.touches[e.type].y = touch.pageY;

            });

            leaflet.elements.perspective.bind('touchmove.leafletSwipeControl', function(e) {

                var touch = e.originalEvent.touches[0];

                helpers.touches[e.type].x = touch.pageX;
                helpers.touches[e.type].y = touch.pageY;

                if (leaflet.group.length > 0 && leaflet.settings.animationStyleOfChange === 'swipe') {

                    leaflet.elements.box
                        .css(leaflet.states.pfx + 'transition', 'none')
                        .css('transition', 'none')
                        .css(leaflet.states.pfx + 'transform', 'translate(' + (helpers.touches.touchmove.x - helpers.touches.touchstart.x) + 'px, 0)')
                        .css('transform', 'translate(' + (helpers.touches.touchmove.x - helpers.touches.touchstart.x) + 'px, 0)');

                }

            });

            leaflet.elements.perspective.bind('touchend.leafletSwipeChange', $.proxy(function(e) {

                if (leaflet.group.length > 0 && leaflet.settings.animationStyleOfChange === 'swipe') {

                    leaflet.elements.box
                        .css(leaflet.states.pfx + 'transition', '')
                        .css('transition', '');

                    var swipeThreshold = 10,
                        isSwipeAction = helpers.touches.touchmove.x > -1 && /*helpers.touches.touchstart.x > helpers.touches.touchmove.x && */(Math.abs(helpers.touches.touchstart.x - helpers.touches.touchmove.x) > swipeThreshold);

                    if (isSwipeAction) {

                        leaflet.states.direction = helpers.touches.touchstart.x - helpers.touches.touchmove.x > 0 ? 1 : -1;
                        this.changeEventHandler();

                    }

                }

                helpers.touches = {
                    touchstart: {x: -1, y: -1 },
                    touchmove: { x: -1, y: -1 }
                };

            }, this));

        };

        App.prototype.changeEventHandler = function() {

            var currentIndex = !leaflet.groupCurrent ? leaflet.group.index(leaflet.elements.link) : leaflet.groupCurrent,
                targetIndex = currentIndex + leaflet.states.direction;

            targetIndex = (targetIndex + 1) > leaflet.group.length ? 0 : targetIndex < 0 ? (leaflet.group.length - 1) : targetIndex;

            leaflet.groupCurrent = targetIndex;

            /*leaflet.elements.main.leafLetPopUp('show', {
             url: leaflet.groupArray[targetIndex].attr('href'),
             title: leaflet.groupArray[targetIndex].attr('title'),
             boxWidth: leaflet.settings.boxWidth,
             animationStyleOfChange: leaflet.settings.animationStyleOfChange
             });*/

            leaflet.group.eq(targetIndex).trigger('click.leafletOpen');

        };

        App.prototype.overlayShow = function() {

            leaflet.elements.overlay
                .css(this.states.pfx + 'opacity', this.settings.overlayOpacity)
                .css('opacity', this.settings.overlayOpacity)
                .css('visibility', 'visible');

            if (this.settings.overlayBlur) {

                leaflet.elements.locker

                    .css(this.states.pfx + 'transition', this.states.pfx + 'filter ' + this.settings.overlayShowSpeed + 'ms ease')
                    .css('transition', this.states.pfx + 'filter ' + this.settings.overlayShowSpeed + 'ms ease')

                    .css(this.states.pfx + 'filter', 'blur(3px)')
                    .css('filter', 'blur(3px)');

            }

        };

        App.prototype.overlayHide = function() {

            leaflet.elements.overlay
                .add(leaflet.elements.close)
                .add(leaflet.elements.prev)
                .add(leaflet.elements.next)

                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms')

                .css(this.states.pfx + 'opacity', 0)
                .css('opacity', 0)
                .css('visibility', 'hidden');

            if (this.settings.overlayBlur) {

                leaflet.elements.locker
                    .css(this.states.pfx + 'filter', '')
                    .css('filter', '');

            }

        };

        App.prototype.getContent = function(callback) {

            var app = this;

            // Action before loading of content
            if(!!this.settings.beforeLoad) {

                this.settings.beforeLoad.call(leaflet.elements.main, this.states.scroll, leaflet);

            }

            // Classes
            leaflet.elements.main
                .removeClass($.proxy(function(index, classStr) {

                    var replace = this.docClassPfx + 'type-*'.replace(/\*/g, '\\S+');
                    return (classStr.match(new RegExp('\\b' + replace + '', 'g')) || []).join(' ');

                }, this))
                .addClass(this.docClassPfx + 'type-' + this.settings.contentType);

            switch (this.settings.contentType) {

                default:
                case 'html':
                case 'hash':
                case 'function':

                    var content = this.settings.contentType === 'html' ? this.settings.content : this.settings.contentType === 'function' ? this.settings.content() : $(this.settings.url).clone(true, true);

                    leaflet.elements.content
                        .empty()
                        .html(content)
                        .css({ maxHeight: !!this.settings.maxHeight ? this.settings.maxHeight() : 'none' });

                    setTimeout(function() {

                        callback();

                    }, 0);

                    break;

                case 'image':

                    var $img = $('<img src="' + this.settings.url + '" alt="" />');

                    $img.css({ maxHeight: !!this.settings.maxHeight ? this.settings.maxHeight() : 'none' });

                    $img.on('load', function() {

                        app.addTitle($img);
                        callback();

                    });

                    leaflet.elements.content
                        .empty()
                        .append($img);

                    break;

                case 'iframe':

                    var $iframe = $('<iframe src="' + this.settings.url + '" frameborder="0" allowfullscreen></iframe>');

                    $iframe.on('load', function() {

                        app.addTitle($iframe);
                        callback();

                    });

                    setTimeout(function(){

                        leaflet.elements.content
                            .empty()
                            .append($iframe);

                        $iframe.wrap('<div class="b-leaflet_box_iframe"></div>');

                    }, this.settings.overlayShowSpeed);

                    break;

                case 'url':
                case 'hashUrl':

                    var url = this.settings.contentType === 'hashUrl' ? this.settings.url.split('#')[0] + ' #' + this.settings.url.split('#')[1] : this.settings.url;

                    leaflet.elements.content
                        .load(url, function() {

                            callback();

                        });

                    break;

            }

        };

        App.prototype.addTitle = function($obj) {

            var $title = $('<div class="' + leaflet.settings.namespace + '_box_title" />'),
                title = false;

            if (!!this.settings.title) {

                title = typeof this.settings.title === 'function' ? this.settings.title.call(leaflet) : this.settings.title;

            }
            else if (!!leaflet.elements.link.attr('title')) {

                title = leaflet.elements.link.attr('title');

            }

            if (!!title) {

                leaflet.elements.content.append($title.css({ maxWidth: $obj.width() }).html(title));

            }

        };

        App.prototype.boxPosition = function() {

            var viewPortHeight = $(window).height(),
                viewPortInnerHeight = viewPortHeight - (this.settings.boxVerticalGutters * 2),

                boxVerticalPadding = leaflet.elements.box.outerHeight() - leaflet.elements.box.height(),
                contentHeightMax = viewPortInnerHeight - boxVerticalPadding;

            leaflet.elements.box.css({ maxHeight: (this.settings.scrollMode === 'outer') ? 'none' : contentHeightMax });

            leaflet.elements.content.css({ maxHeight: 'none' });
            leaflet.elements.content.css({ maxHeight: '' });

        };

        App.prototype.boxShow = function() {

            // Get content
            this.getContent($.proxy(function() {

                // Action when content is loaded
                if(!!this.settings.afterLoad) {

                    this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                }

                this.boxPosition();
                this.boxTransitionsIn[leaflet.elements.main.data('leafletSettings').animationStyleOfBox].call(this);

            }, this));

        };

        App.prototype.boxHide = function(callback) {

            this.boxTransitionsOut[leaflet.elements.main.data('leafletSettings').animationStyleOfBox].call(this);

            setTimeout($.proxy(function() {

                callback.call(this);

            }, this), this.settings.animateSpeed);

        };

        App.prototype.boxChange = function() {

            if (!leaflet.groupArray.length) {

                this.groupSources();

            }

            if (leaflet.elements.nav.is(':hidden')) {

                setTimeout(function() {

                    leaflet.elements.nav.toggle(!!leaflet.group.length);

                }, this.settings.animateSpeed);

            }

            switch (leaflet.elements.main.data('leafletSettings').animationStyleOfChange) {

                default:
                case 'fade':

                    leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', true);

                    // Set transition properties
                    leaflet.elements.perspective
                        .css(this.states.pfx + 'transition-property', 'width')
                        .css('transition-property', 'width');

                    leaflet.elements.box
                        .css(this.states.pfx + 'transition-property', 'top, margin, height, transform, opacity, visibility')
                        .css('transition-property', 'top, margin, height, transform, opacity, visibility');

                    // Hide text block
                    leaflet.elements.content.css({ overflow: 'hidden', opacity: 0 });

                    // Fix box height
                    /*leaflet.elements.perspective
                        .css({
                            width: leaflet.elements.perspective.width()
                        });*/

                    leaflet.elements.box
                        .css({
                            height: leaflet.elements.box.outerHeight()
                        });

                    setTimeout($.proxy(function() {

                        // Get content
                        this.getContent($.proxy(function() {

                            // Action when content is loaded
                            if(!!this.settings.afterLoad) {

                                this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                            }

                            /*leaflet.elements.perspective
                                .css({
                                    width: leaflet.settings.boxWidth
                                });*/

                            leaflet.elements.box
                                .css({
                                    height: leaflet.elements.content.height()
                                });

                            setTimeout($.proxy(function() {

                                /*leaflet.elements.perspective
                                    .css({ maxWidth: leaflet.settings.boxWidth, width: '' });*/

                                leaflet.elements.box
                                    .css(this.states.pfx + 'transition-property', '')
                                    .css('transition-property', '')
                                    .css({ /*maxWidth: leaflet.settings.boxWidth, */height: '', width: '' });

                                // Show content block
                                leaflet.elements.content.css({ overflow: '', opacity: '' });

                                // Loading class
                                clearTimeout(leaflet.loadingTimeout);
                                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

                                this.boxPosition();

                            }, this), this.settings.animateSpeed);


                        }, this));

                    }, this), leaflet.settings.animateSpeed);

                    break;

                case 'slide':

                    leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', true);

                    leaflet.elements.box
                        .css(this.states.pfx + 'transform', 'translate(' + (-300 * leaflet.states.direction) + 'px,0)')
                        .css('transform', 'translate(' + (-300 * leaflet.states.direction) + 'px,0)')
                        .css(this.states.pfx + 'opacity', 0)
                        .css('opacity', 0);

                    setTimeout($.proxy(function() {

                        leaflet.elements.perspective
                            .css({ maxWidth: leaflet.settings.boxWidth });

                        leaflet.elements.box
                            .css({ maxWidth: leaflet.settings.boxWidth })
                            .css(this.states.pfx + 'transition-property', 'zoom')
                            .css('transition-property', 'zoom')
                            .css(this.states.pfx + 'transform', 'translate(' + (300 * leaflet.states.direction) + 'px,0)')
                            .css('transform', 'translate(' + (300 * leaflet.states.direction) + 'px,0)');

                        setTimeout($.proxy(function() {

                            this.getContent($.proxy(function() {

                                // Action when content is loaded
                                if (!!this.settings.afterLoad) {

                                    this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                                }

                                leaflet.elements.box
                                    .css(this.states.pfx + 'transition-property', '')
                                    .css('transition-property', '')
                                    .css(this.states.pfx + 'transform', 'translate(0,0)')
                                    .css('transform', 'translate(0,0)')
                                    .css(this.states.pfx + 'opacity', 1)
                                    .css('opacity', 1);

                                // Loading class
                                clearTimeout(leaflet.loadingTimeout);
                                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

                            }, this));

                        }, this), this.settings.animateSpeed / 1.1);

                    }, this), this.settings.animateSpeed / 1.1);

                    break;

                case 'pushDown':

                    leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', true);

                    leaflet.elements.box
                        .css(this.states.pfx + 'transform-origin', '50% 100%')
                        .css('transform-origin', '50% 100%')
                        .css(this.states.pfx + 'transform', 'translateY(25%) rotateX(45deg) scale(.85)')
                        .css('transform', 'translateY(25%) rotateX(45deg) scale(.85)')
                        .css(this.states.pfx + 'opacity', 0)
                        .css('opacity', 0);

                    setTimeout($.proxy(function() {

                        leaflet.elements.perspective
                            .css({ maxWidth: leaflet.settings.boxWidth });

                        leaflet.elements.box
                            .css({ maxWidth: leaflet.settings.boxWidth })
                            .css(this.states.pfx + 'transition-property', 'zoom')
                            .css('transition-property', 'zoom')
                            .css(this.states.pfx + 'transform', 'translateY(-100%) rotateX(45deg)')
                            .css('transform', 'translateY(-100%) rotateX(45deg)');

                        setTimeout($.proxy(function() {

                            this.getContent($.proxy(function() {

                                // Action when content is loaded
                                if(!!this.settings.afterLoad) {

                                    this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                                }

                                leaflet.elements.box
                                    .css(this.states.pfx + 'transition-property', '')
                                    .css('transition-property', '')
                                    .css(this.states.pfx + 'transform', 'translateY(0)')
                                    .css('transform', 'translateY(0)')
                                    .css(this.states.pfx + 'opacity', 1)
                                    .css('opacity', 1);

                                // Loading class
                                clearTimeout(leaflet.loadingTimeout);
                                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

                            }, this));

                        }, this), this.settings.animateSpeed / 1.5);

                    }, this), this.settings.animateSpeed / 1.5);

                    break;

            }

        };


        // Box transition styles
        App.prototype.boxTransitionsIn = {

            fade: function() {

                leaflet.elements.box
                    .css('visibility', 'visible')
                    .css(this.states.pfx + 'opacity', 1)
                    .css('opacity', 1);

                clearTimeout(this.states.loadingTimeout);
                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

            },

            scale: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'scale(1, 1)')
                    .css('transform', 'scale(1, 1)');

                this.boxTransitionsIn.fade.call(this);

            },

            superScale: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'scale(1, 1)')
                    .css('transform', 'scale(1, 1)');

                this.boxTransitionsIn.fade.call(this);

            },

            drop: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'translate(0, 0)')
                    .css('transform', 'translate(0, 0)');

                this.boxTransitionsIn.fade.call(this);

            },

            drop3d: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'translate3d(0, 0, 0) rotateX(0deg)')
                    .css('transform', 'translate3d(0, 0, 0) rotateX(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            flip3d: function() {

                leaflet.elements.box
                    .css(this.states.pfx + 'transform', 'rotateY(0deg)')
                    .css('transform', 'rotateY(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            flip3dVertical: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'rotateX(0deg)')
                    .css('transform', 'rotateX(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            newspaper: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'scale(1, 1) rotate(0deg)')
                    .css('transform', 'scale(1, 1) rotate(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            sideFall: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'translate(0) translateZ(0) rotate(0deg)')
                    .css('transform', 'translate(0) translateZ(0) rotate(0deg)');

                this.boxTransitionsIn.fade.call(this);

            }

        };

        App.prototype.boxTransitionsOut = {

            fade: function() {

                leaflet.elements.box
                    .css('visibility', '')
                    .css(this.states.pfx + 'opacity', '')
                    .css('opacity', '')
                    .css(this.states.pfx + 'transform', '')
                    .css('transform', '');

            },

            scale: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            superScale: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            drop: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            drop3d: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            flip3d: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            flip3dVertical: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            newspaper: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            sideFall: function() {

                this.boxTransitionsOut.fade.call(this);

            }

        };


        // Helpers
        var helpers = {

            getPfx: function() {

                var element = document.createElement('div'),
                    propsArray = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'],
                    pfx = false;

                $.each(propsArray, function(key, val) {

                    if (element.style[propsArray[key]] !== undefined) {

                        pfx = '-' + (propsArray[key].replace('Perspective','').toLowerCase()) + '-';
                        return false;

                    }

                });

                return pfx;

            },

            getScrollBarWidth: function() {

                var $element = $('<div class="b-scrollBar-test"></div>').css({ position: 'absolute', left: -99999, top: -99999, overflowY: 'scroll', width: 50, height: 50, visibility: 'hidden' });

                $('body').append($element);

                var scrollBarWidth = $element[0].offsetWidth - $element[0].clientWidth;

                $element.remove();

                return scrollBarWidth;

            },

            unwrap: function($this, selector) {

                return $this.each(function() {
                    var t = this,
                        c = (typeof selector !== 'undefined') ? $(t).find(selector) : $(t).children().first();
                    if (c.length === 1) {
                        c.contents().appendTo(t);
                        c.remove();
                    }
                });

            },

            cookies: {

                set: function(options) {

                    var now = new Date,
                        cookies = options.key + '=' + options.value;

                    now.setDate(now.getDate() + 1);

                    cookies += options.expires ? '; expires=' + now.toUTCString() : '';
                    cookies += options.path ? '; path=' + options.path : '';

                    return document.cookie = cookies;

                },

                get: function(key) {

                    var matches = document.cookie.match(new RegExp(
                        "(?:^|; )" + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                    ));

                    return matches ? decodeURIComponent(matches[1]) : false;

                },

                remove: function(key) {

                    leaflet.helpers.cookies.set({ key: key, value: '', expires: -1 })

                }

            },

            touches: {
                touchstart: {x: -1, y: -1 },
                touchmove: { x: -1, y: -1 }
            }

        };

        return {
            App: App
        };

    })(window);

    $.fn.leafLetPopUp = function(param) {

        var $body = $('body'),
            selector = this.selector;

        if (typeof param === 'object' || !param) {

            $(selector).data('leaflet', true);

            $body.on('click.leafletOpen', selector, function(e) {

                e.preventDefault();

                new LeafletPopup.App($(this), param || {}, 'init');

            });

            return this;

        } else {

            new LeafletPopup.App($(this), Array.prototype.slice.call(arguments, 1)[0] || {}, param);
            return this;

        }

    };

})(jQuery);