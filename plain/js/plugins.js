var sitePlugins = (function(window, undefined) {

    'use strict';

    function carousels(init) {

        init.selector = !!init.selector ? init.selector : '.b-carousel';
        init.namespace = !!init.namespace ? init.namespace + ' ' : '';

        init.options = !!init.options ? init.options : {};

        var $collection = $(init.namespace + init.selector);

        _init.call($collection);

        $(window).bind('resize.owlCarouselReInit', function() {

            helpers.delay.call($(window), function() {

                _init.call($collection);

            }, 250);

        });

        function _init() {

            if ($.isFunction($.fn.owlCarousel)) {

                this.each(function() {

                    var $carousel = $(this),
                        screens = !!$carousel.data('resolutions') ? $carousel.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                    if (screens.indexOf(helpers.screen()) >= 0 && $carousel.find('.b-carousel_item').length >= $carousel.data()[helpers.screen()]) {

                        $carousel
                            .toggleClass('owl-carousel', true)
                            .owlCarousel($.extend({

                                items: 1,
                                margin: typeof $carousel.data('margin') === 'number' ? $carousel.data('margin') : 20,

                                autoplay: $carousel.data('auto') || false,
                                autoplayTimeout: $carousel.data('interval') * 1000 || 10000,

                                autoHeight: typeof $carousel.data('autoHeight') !== 'object' ? $carousel.data('autoHeight') || false : false,
                                autoWidth: $carousel.data('autoWidth') || false,

                                loop: typeof $carousel.data('loop') !== 'undefined' ? $carousel.data('loop') : true,

                                mouseDrag: !!$carousel.data('mouseDrag') || false,
                                touchDrag: true, /*typeof $carousel.data('touchDrag') !== 'undefined' ? !!$carousel.data('touchDrag') : false,*/
                                pullDrag: false,
                                freeDrag: false,

                                dots: $carousel.data('dots') || false,
                                dotsEach: typeof $carousel.data('dotsEach') !== 'undefined' ? !! $carousel.data('dotsEach') : true,

                                //dotsSpeed: typeof $carousel.data('dotsEach') !== 'undefined' ? 250 : 125,

                                dotClass: 'b-carousel_paging_bullet',
                                dotsClass: 'b-carousel_paging',

                                dotsContainer: $carousel.data('dotsContainer') || false,

                                nav: $carousel.data('nav') || false,
                                navText: ['', ''],
                                navClass: $carousel.data('navClass') || ['b-carousel_arrow b-carousel_arrow__prev i-icon i-arrow-prev-sm', 'b-carousel_arrow b-carousel_arrow__next i-icon i-arrow-next-sm'],

                                navContainer: $carousel.data('navContainer') || false,

                                smartSpeed: $carousel.data('smartSpeed') || 250,

                                scrollBar: $carousel.data('scrollBar') || false,
                                scrollBarContainer: $carousel.data('scrollBarContainer') || false,

                                scrollBarClass: 'b-carousel_scroll_bar',
                                scrollBarHandleClass: 'b-carousel_scroll_bar_handle',

                                startPosition: typeof $carousel.data('startPosition') !== 'undefined' ? $carousel.data('startPosition') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPosition') : 0,

                                useCSS: !!$carousel.data('useCss'),
                                fallbackEasing: 'easeOutCubic',

                                responsive: {
                                    0: {
                                        items: $carousel.data('xs'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[0] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[0] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('xs')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('xs')),
                                        loop: _loopControl.call($carousel, $carousel.data('xs')),
                                        startPosition: typeof $carousel.data('startPositionXs') !== 'undefined' ? $carousel.data('startPositionXs') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionXs') : 0
                                    },
                                    480: {
                                        items: $carousel.data('sm'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[1] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[1] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('sm')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('sm')),
                                        loop: _loopControl.call($carousel, $carousel.data('sm')),
                                        startPosition: typeof $carousel.data('startPositionSm') !== 'undefined' ? $carousel.data('startPositionSm') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionSm') : 0
                                    },
                                    728: {
                                        items: $carousel.data('md'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[2] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[2] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('md')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('md')),
                                        loop: _loopControl.call($carousel, $carousel.data('md')),
                                        startPosition: typeof $carousel.data('startPositionMd') !== 'undefined' ? $carousel.data('startPositionMd') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionMd') : 0
                                    },
                                    1200: {
                                        items: $carousel.data('lg'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[3] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[3] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('lg')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('lg')),
                                        loop: _loopControl.call($carousel, $carousel.data('lg')),
                                        startPosition: typeof $carousel.data('startPositionLg') !== 'undefined' ? $carousel.data('startPositionLg') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionLg') : 0
                                    }
                                },
                                onInitialized: function() {

                                    this._direction = null;
                                    _itemsCounter.call(this);

                                },
                                onResized: function() {

                                    _itemsCounter.call(this);

                                },
                                onChange: function(e) {

                                    // Get direction
                                    if (e.property.name === 'position') {

                                        this._direction = e.property.value > e.item.index ? 'next' : 'prev';

                                    }

                                }
                            }, init.options));

                    } else {

                        if (!!$carousel.data('owlCarousel') || !!$carousel.data('owl.carousel')) {

                            $carousel.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
                            $carousel.find('.owl-stage-outer').children().unwrap();

                        }

                    }

                });

            } // isFunction end

        }  // end of init scope

        function _navShouldBe(limit) {

            var navOption = typeof this.data('nav') === 'undefined' ? true : !!this.data('nav'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return navOption && itemsEnough;

        }

        function _dotsShouldBe(limit) {

            var dotsOption = !!this.data('dots'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return dotsOption && itemsEnough;

        }

        function _loopControl(limit) {

            var loopOption = typeof this.data('loop') === 'undefined' ? true : !!this.data('loop'),
                //loopControlOption = !!this.data('loopControl'),

                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return loopOption && itemsEnough/*(loopControlOption ? itemsEnough : true)*/;

        }

        function _itemsCounter() {

            if (this.$element.hasClass('b-carousel__counter')) {

                var amount = this.$element.find('.b-carousel_paging').find('.b-carousel_paging_bullet').length/*this._items.length*/;

                this.$element.find('.b-carousel_paging').attr('data-items-amount', amount);

            }

        }

    }

    function popUps() {

        var $page = $('.b-page'),

            $popUps = $('.js-popup'),

            $lightBoxes = $('.js-lightBox'),
            $videoBoxes = $('.js-videoBox'),

            settings = {
                animationStyleOfBox: 'scale',
                animationStyleOfChange: 'slide',

                boxHorizontalGutters: 10,
                boxVerticalGutters: 40,

                closeBtnLocation: 'overlay',
                closeBtnClass: 'i-icon i-cross',

                directionBtnLocation: 'overlay',
                directionBtnClass: ['i-icon i-arrow-prev', 'i-icon i-arrow-next'],

                overlayOpacity: .65,
                scrollLocker: $page
            };

        if ($.isFunction($.fn.leafLetPopUp)) {

            $popUps.leafLetPopUp($.extend({}, settings, {
                closeBtnLocation: 'box',
                animationStyleOfChange: 'fade',
                boxWidth: function() {

                    return this.data('boxWidth') || 416

                },
                beforeLoad: function(scroll, leaflet) {

                    $('.b-leaflet').data('triggerElement', leaflet.elements.link);

                },
                afterLoad: function() {

                    // Set backgrounds
                    site.setBackgrounds({
                        namespace: '.b-leaflet'
                    });

                    // Modules
                    siteModules.tabs({
                        selector: '.js-tabs',
                        namespace: '.b-leaflet'
                    });

                    // Forms
                    forms.init('.b-leaflet');

                }
            }));

            $lightBoxes.leafLetPopUp($.extend({}, settings, {
                animationStyleOfChange: 'fade',

                boxWidth: 1020,
                boxHorizontalGutters: 20,
                boxVerticalGutters: 20,

                closeBtnLocation: 'box',
                closeBtnClass: 'i-icon i-cross-sm',

                directionBtnLocation: 'box',
                directionBtnClass: ['i-icon i-arrow-prev', 'i-icon i-arrow-next'],

                afterLoad: function(scroll, type, leaflet) {

                    var $title = leaflet.elements.box.find('.b-leaflet_box_title'),

                        txt = $title.text(),
                        counter = (leaflet.groupCurrent + 1 ) + ' / ' + leaflet.group.length;

                    $title.html(txt + '<span>' + counter + '</span>');

                },

                maxHeight: function() {

                    return $(window).height() - ((parseInt($('.b-leaflet_inner').css('paddingTop')) + 60) * 2);

                }
            }));

            $videoBoxes.leafLetPopUp($.extend({}, settings, {
                boxWidth: 1200,
                boxHorizontalGutters: 30,
                boxVerticalGutters: 20,
                content: true,
                contentType: 'iframe'
            }));

            $('body').on('click', '.js-popup-close', function(e) {

                e.preventDefault();
                $popUps.leafLetPopUp('hide');

            });

        }

    }

    function scrollBars() {

        var $collection = $('.js-scrollBar');

        if ($.isFunction($.fn.perfectScrollbar)) {

            $collection.each(function() {

                var $scrollArea = $(this);

                $scrollArea.perfectScrollbar($scrollArea.data());

            });

        }

    }

    return {
        carousels: carousels,
        popUps: popUps,
        scrollBars: scrollBars
    };

})(window);