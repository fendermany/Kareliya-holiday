var siteModules = (function(window, undefined) {

    function accordions(options) {

        options.selector = !!options.selector ? options.selector : '.js-accordion';
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        // Init
        init(options);

        $(window).bind('resize.pocketReInit', function() {

            helpers.delay.call($('body'), init(options), 250);

        });

        function init(options) {

            var $accordion = $(options.namespace + options.selector);

            $accordion.each(function() {

                var $accordion = $(this),
                    screens = !!$accordion.data('resolutions') ? $accordion.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                $accordion.data('screens', screens);

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $accordion.find('li > ul, li > div').slideUp({ duration: 0 });
                    $accordion.find('.opened').find('> ul, > div').slideDown({ duration: 0 });

                }
                else {

                    $accordion.find('li > ul, li > div').show();

                }

                    $accordion
                        .find(/*'li > a, */'li > a > .js-accordion-trigger, li > span')
                        .unbind('click.accordionClick')
                        .each(function() {

                            var childLevel = !!$(this).closest('li').find('> ul, > div').length;

                            $(this)
                                .closest('li')
                                .toggleClass('hasChild', childLevel);

                            if (screens.indexOf(helpers.screen()) >= 0) {

                                $(this)
                                    .bind('click.accordionClick', function(e) {

                                        //if (childLevel) {
                                        if ($(this).closest('li').hasClass('hasChild')) {

                                            e.preventDefault();

                                            // Close neighbors items
                                            if (!!$accordion.data('neighbors')) {

                                                var $siblings = $(this).closest('li').siblings();

                                                $siblings.toggleClass('opened', false);

                                                $siblings
                                                    .find('> ul, > div')
                                                    .slideUp({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                                            }

                                            // Open current item
                                            var $current = $(this).closest('li');

                                            $current.toggleClass('opened');

                                            $current
                                                .find('> ul, > div')
                                                .slideToggle({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                                        }

                                    });

                            } else {

                                /*$(this)
                                    .closest('li')
                                    .toggleClass('hasChild', false);*/

                            }

                        });

                $accordion
                    .unbind('accordion.close')
                    .bind('accordion.close', function() {

                        if ($accordion.data('screens').indexOf(helpers.screen()) >= 0) {

                            $(this).find('li').each(function() {

                                $(this).toggleClass('opened', false);

                                $(this)
                                    .find('> ul, > div')
                                    .slideUp({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                            });

                        }

                    });

                $accordion
                    .unbind('accordion.open')
                    .bind('accordion.open', function() {

                        if ($accordion.data('screens').indexOf(helpers.screen()) >= 0) {

                            $(this).find('li').each(function() {

                                $(this).toggleClass('opened', true);

                                $(this)
                                    .find('> ul, > div')
                                    .slideDown({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                            });

                        }

                    });

            });

        }

    }

    function autoComplete(namespace) {

        namespace = !!namespace ? namespace + ' ' : '';

        var $fields = $(namespace + '.js-autoComplete');

        $fields.each(function() {

            var $this = $(this).attr('autocomplete', 'off'),
                $wrapper = $this.parent(),

                $wg = $('<div class="b-autoComplete"></div>').appendTo($wrapper),
                $wgList = $('<ul class="b-autoComplete_list"></ul>').prependTo($wg);

            $this.on('keypress.autoComplete get.autoComplete', function(e) {

                var value = $(this).val();

                if (value.length > 1) {

                    $.ajax({
                        url: $this.closest('form').attr('action') || $this.data('source'),
                        method: $this.closest('form').attr('method') || 'post',
                        data: $this.closest('form').serialize(),
                        dataType: 'json',
                        success: function (response) {

                            if (response.status) {

                                $wgList.html(response.results);
                                $wg.toggleClass('opened', true);

                                site.setBackgrounds({
                                    namespace: '.b-autoComplete_list'
                                });

                                $(document)
                                    .unbind('touchend.closeAutoComplete click.closeAutoComplete')
                                    .bind((navigator.userAgent.match(/iPhone|iPad|iPod/i)) ? 'touchend.closeAutoComplete' : 'click.closeAutoComplete', function(e) {

                                        var $target = $(e.target),

                                            wgClass = $wrapper.attr('class').split(' ')[0],
                                            targetIsWg = $target.hasClass(wgClass) || !!$target.closest('.' + wgClass).length && !$target.is('button[type="reset"]');

                                        if (!targetIsWg) {

                                            $wg.toggleClass('opened', false);

                                            setTimeout(function() {

                                                $wgList.empty();

                                            }, 350);

                                        }

                                    });

                            }

                        }
                    });

                }

            });

        });

    }

    function dropDown(options) {

        var $locker = !!options.locker ? options.locker : $('.b-page');

        options.switch = !!options.switch ? options.switch : 'opened';

        $(document).bind(/*(navigator.userAgent.match(/iPhone|iPad|iPod/i)) ? 'touchend.dropDown' + options.selector : */'click.dropDown' + options.selector, function(e) {

            var $target = $(e.target),

                targetIsSwitcher = $target.hasClass(options.selector + '-toggle') || !!$target.closest('.' + options.selector + '-toggle').length,
                isSwipeAction = helpers.touches.touchmove.y > -1 && (Math.abs(helpers.touches.touchstart.y - helpers.touches.touchmove.y) > 5);

            if (targetIsSwitcher) {

                $target = $target.hasClass(options.selector + '-toggle') ? $target : $target.closest('.' + options.selector + '-toggle');

                if ($target.is('a')) { e.preventDefault(); }

                var screens = !!$target.data('resolutions') ? $target.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],
                    touchOnly = !!$target.data('touch') ? $target.data('touch') : false;

                if (screens.indexOf(helpers.screen()) >= 0 && touchOnly ? !!helpers.mobile() : true) {

                    e.preventDefault();

                    var $dropDown = $target.closest('.' + options.selector),
                        state = $dropDown.hasClass(options.switch);

                    $('.' + options.selector).toggleClass(options.switch, false);

                    $dropDown.toggleClass(options.switch, !state);
                    $dropDown.find('.' + options.selector + '-box').toggleClass(options.switch, !state);

                    if (!!options.onToggle) {

                        options.onToggle.call($dropDown, !state);

                    }

                    if (!!$dropDown.data('lock')) {

                        if (!state) {

                            _lockPage.call($locker);

                        } else {

                            _unLockPage.call($locker);

                        }

                    }

                    setTimeout(function() {

                        $(window).trigger('aside.stepRefresh');

                    }, 300);

                }

            }
            else if (!isSwipeAction && (!$target.closest('.' + options.selector + '-box').length || $target.hasClass(options.selector + '-close'))) {

                $('.' + options.selector).each(function() {

                    var $this = $(this),

                        state = $this.hasClass('opened'),
                        screens = !!$(this).find(options.selector + '-toggle').data('resolutions') ? $(this).find(options.selector + '-toggle').data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                    if (screens.indexOf(helpers.screen()) >= 0) {

                        $this.toggleClass(options.switch, false);

                        if ($this.data('lock') && state) {

                            _unLockPage.call($locker);

                        }

                        if (!!options.onToggle) {

                            options.onToggle.call($this, false);

                        }

                        setTimeout(function() {

                            $(window).trigger('aside.stepRefresh');

                        }, 300);

                    }

                });

            }

            helpers.touches = {
                touchstart: {x: -1, y: -1 },
                touchmove: { x: -1, y: -1 }
            };

        });

        $('.' + options.selector)
            .on('dropDown.open', function() {

                $(this).toggleClass(options.switch, true);

                if (!!$(this).data('lock')) {

                    _lockPage.call($locker);

                }

            })
            .on('dropDown.close', function() {

                $(this).toggleClass(options.switch, false);
                _unLockPage.call($locker);

            });

        function _lockPage() {

            var $body = $('body'),
                scroll = document.documentElement.scrollTop || document.body.scrollTop;

            this.data('isLocked', true);
            this.data('vpOverflow', $body.css('overflow'));
            this.data('lockScrollState', scroll);

            $body.css({
                position: 'fixed',
                overflow: 'hidden',
                paddingRight: helpers.getScrollBarWidth(),
                marginTop: -scroll,
                height: '100%'
            });

        }

        function _unLockPage() {

            if (!!this.data('isLocked')) {

                setTimeout($.proxy(function() {

                    $('body').css({
                        position: '',
                        overflow: '',
                        paddingRight: '',
                        marginTop: '',
                        height: ''
                    });

                    window.scrollBy(0, this.data('lockScrollState'));

                }, this), 300);

            }

        }

    }

    function spoilers(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        options.toggleClass = !!options.toggleClass ? options.toggleClass : 'opened';

        // Hash check
        var hash = location.hash;

        if (!!hash && hash.match('spoiler')) {

            $(options.selector).each(function() {

                $(this).removeClass('opened');

                if ($(this).attr('id') === hash.split('#')[1]) {

                    $(this).addClass('opened');

                }

            });

        }

        // Init
        init(options);

        $(window).bind('resize.spoilerReInit', function() {

            init(options);

        });

        function init(options) {

            $(options.namespace + options.selector).each(function() {

                var $spoiler = $(this).toggleClass('js-spoiler-active', true),

                    $body = $spoiler.find(options.selector + '-box').css({ display: '' }),
                    $toggle = $spoiler.find(options.selector + '-toggle').unbind('click.spoiler'),

                    screens = !!$spoiler.data('resolutions') ? $spoiler.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $spoiler.not('.' + options.toggleClass).find(options.selector + '-box').slideDown(0).slideUp(0);
                    $spoiler.filter('.' + options.toggleClass).find(options.selector + '-box').slideDown(0);

                    $toggle
                        .bind('click.spoiler', function(e) {

                            if (!$(e.target).is('a[href]:not(a[href="#"])')) {

                                e.preventDefault();

                            }

                            if (!$(e.target).hasClass('e-hint') && !$(e.target).closest('.e-hint').length) {

                                var item = $(this).closest(options.selector),
                                    state = item.hasClass(options.toggleClass) && item.find(/*'> ' + */options.selector + '-box').is(':visible');

                                if (!state) {

                                    spoilerOpen.call(item, options.selector, options.onToggle);

                                } else {

                                    spoilerClose.call(item, options.selector, options.onToggle);

                                }

                                // Close neighbors items
                                if (!!item.data('closeNeighbors')) {

                                    var $neighbors = typeof item.data('closeNeighbors') === 'boolean' ? item.siblings(options.selector) : item.closest(item.data('closeNeighbors')).find(options.selector);

                                    $neighbors.each(function() {
                                        spoilerClose.call($(this), options.selector);
                                    });

                                }

                            }

                        });

                } else {

                    $spoiler.find(options.selector + '-box').show();

                }

            });

        }

        function spoilerClose(sel, callback) {

            this.toggleClass(options.toggleClass, false);

            var toggle = !!this.find(/*'> ' + */sel + '-toggle').data('closed') ? this.find(/*'> ' + */sel + '-toggle').data('closed') : this.find(/*'> ' + */sel + '-toggle').html();

            if (!!this.find(/*'> ' + */sel + '-toggle').data('closed')) {

                this.find(/*'> ' + */sel + '-toggle').html(toggle);

            }

            this.find(/*'> ' + */sel + '-toggle').toggleClass('active', false);
            this.find(/*'> ' + */sel + '-box').slideUp({ duration: 250, easing: 'easeOutQuart',
                step: function() {

                    $(window).trigger('aside.stepRefresh');

                },
                complete: function() {

                    //$(window).trigger('aside.refresh');

                    if(typeof callback !== 'undefined' && callback) {

                        callback(this);

                    }

                }
            });

        }

        function spoilerOpen(sel, callback) {

            this.toggleClass(options.toggleClass, true);

            var toggle = !!this.find(/*'> ' + */sel + '-toggle').data('opened') ? this.find(sel + '-toggle').data('opened') : this.find(/*'> ' + */sel + '-toggle').html();

            if (!!this.find(/*'> ' + */sel + '-toggle').data('opened')) {

                this.find(/*'> ' + */sel + '-toggle').html(toggle);

            }

            this.find(/*'> ' + */sel + '-toggle').toggleClass('active', true);
            this.find(/*'> ' + */sel + '-box').slideDown({ duration: 250, easing: 'easeOutQuart',
                step: function() {

                    $(window).trigger('aside.stepRefresh');

                },
                complete: function() {

                    //$(window).trigger('aside.refresh');

                    if(typeof callback !== 'undefined' && callback) {

                        callback(this);

                    }

                }
            });

        }

    }

    function pockets(options) {

        // Init
        init(options);

        $(window).bind('load.pocketReInit resize.pocketReInit', function() {

            helpers.delay.call($('body'), function() {

                init(options);

            }, 250);

        });

        function init(options) {

            $(options.selector).each(function() {

                var $pocket = $(this),

                    $pocketBody = $pocket.find(options.selector + '-box'),
                    $pocketBodyInner = $pocket.find(options.selector + '-box-inner').css({ overflow: 'hidden' }),
                    $pocketToggle = $pocket.find(options.selector + '-toggle').unbind('click.pocketModule'),

                    screens = !!$pocket.data('resolutions') ? $pocket.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],

                    heights = !!$pocket.data('heights') ? $pocket.data('heights').split(',') : false,
                    blocks = !!$pocket.data('blocks') ? $pocket.data('blocks').split(',') : false,

                    lines = !!$pocket.data('lines') ? $pocket.data('lines').split(',') : [2, 3, 4, 6, 6];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $pocket.toggleClass('active', true);
                    $pocketBody.css({ overflow: 'hidden' });

                    var maxHeight = $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocketBody.outerHeight();

                    $pocket.data('range', { min: 0, max: maxHeight });

                    if (!!heights) {

                        $pocket.data('range', {
                            min: parseInt(heights[screens.indexOf(helpers.screen())], 10),
                            max: maxHeight
                        });

                    }
                    else if (!!blocks) {

                        var minHeight = 0,
                            margin = 0,

                            length = blocks[screens.indexOf(helpers.screen())];

                        $pocketBodyInner.find('> *').each(function(i) {

                            if (i < length) {

                                minHeight += $(this).outerHeight();

                                if (i > 0) {

                                    minHeight += Math.max(margin, parseInt($(this).css('margin-top'), 10));

                                }

                                margin = parseInt($(this).css('margin-bottom'), 10);

                            }
                            else {

                                return false;

                            }

                        });

                        $pocket.data('range', {
                            min: minHeight,
                            max: maxHeight
                        });

                    }
                    else if (!!lines) {

                        $pocket.data('range', {
                            min: _getLineHeight.call($pocketBody) * lines[screens.indexOf(helpers.screen())] - 2,
                            max: maxHeight
                        });

                    }

                    if (!$pocket.data('noAnimation')) {

                        $pocketBody
                            .css(helpers.pfx + 'transition', 'max-height ' + options.duration + 'ms')
                            .css('transition', 'max-height ' + options.duration + 'ms');

                    }

                    setTimeout(function() {

                        if (typeof $pocket.data('range') !== 'undefined') {

                            $pocket.not('.opened').find(options.selector + '-box').css({ maxHeight: $pocket.data('range').min });

                        }

                        if ($.isFunction($.fn.owlCarousel)) {

                            $pocketBody.closest('.owl-carousel').trigger('refresh.owl.carousel');

                        }

                    }, 10);

                    $pocketToggle
                        .toggleClass('excess', $pocket.data('range').max <= $pocket.data('range').min)
                        .bind('click.pocketModule', function(e) {

                            e.preventDefault();

                            var $this = $(this).closest(options.selector),
                                state = $this.hasClass('opened');

                            _pocketToggle.call($this, options, !state);

                            // Close neighbors items
                            if (!!$this.data('closeNeighbors')) {

                                var $neighbors = typeof $this.data('closeNeighbors') === 'boolean' ? $this.siblings(options.selector) : $this.closest($this.data('closeNeighbors')).find(options.selector);

                                $neighbors.each(function() {

                                    _pocketToggle.call($(this), options, false);

                                });

                            }

                        });

                } else {

                    $pocket.toggleClass('active', false);

                    $pocketBody.css({ maxHeight: '', overflow: 'visible' });
                    $pocketBodyInner.css({ overflow: '' });

                }

            });

        }

        function _getLineHeight() {

            var lineHeight = this.css('line-height') !== 'normal' ? parseFloat(this.css('line-height')) : 1.14,
                fontSize = Math.ceil(parseFloat(this.css('font-size')));

            lineHeight = typeof lineHeight !== 'undefined' && lineHeight < fontSize ? lineHeight * fontSize : lineHeight;

            return parseInt(typeof lineHeight !== 'undefined' ? lineHeight : fontSize, 10);

        }

        function _pocketToggle(options, state) {

            if (typeof options.onToggle !== 'undefined' && options.onToggle) {

                options.onToggle.call(this, state);

            }

            var $pocket = this,

                $pocketBody = $pocket.find(options.selector + '-box'),
                $pocketBodyInner = $pocket.find(options.selector + '-box-inner'),
                $pocketToggle = $pocket.find(options.selector + '-toggle'),

                stringFlag = state ? 'opened' : 'closed',
                height = state ? $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocket.data('range').max : $pocket.data('range').min;

            $pocket.toggleClass('opened', state);

            $pocketBody.css({ maxHeight: height });
            $pocketToggle.html(!!$pocketToggle.data(stringFlag) ? $pocketToggle.data(stringFlag) : $pocketToggle.html());

            if (!!$pocket.data('noAnimation')) {

                $pocketBody.css({ overflow: state ? '' : 'hidden' });
                $pocketBodyInner.css({ overflow: state ? '' : 'hidden' });

            }

            // Refresh carousel height
            var $parentCarousel = $pocket.closest('.owl-carousel');

            if ($parentCarousel.length) {

                var carouselData = $parentCarousel.data('owl.carousel');

                if (!!carouselData.options.responsive[carouselData._breakpoint].autoHeight) {

                    $parentCarousel.trigger('refresh.owl.carousel');

                }

            }

            setTimeout($.proxy(function() {

                if (typeof options.onToggled != 'undefined' && options.onToggled) {

                    options.onToggled.call(this, state);

                }

            }, this), options.duration);

        }

    }

    function tabs(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        var widget = options.selector,
            toggle = options.selector + '-toggle',
            toggleItem = options.selector + '-toggle-control',
            content = options.selector + '-wrapper',
            contentAdd = options.selector + '-wrapper-add',
            page = options.selector + '-page',
            manual = options.selector + '-manual';

        init(options);

        $(window).bind('resize.tabsReInit', function() {

            init(options);

        });

        function init(options) {

            $(options.namespace + options.selector).each(function() {

                var $wg = $(this),

                    $wrapper = $(this).find(content),
                    $wrapperAdd = $(this).find(contentAdd),

                    screens = !!$(this).data('resolutions') ? $(this).data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    // Init tabs
                    $(this).toggleClass('js-init', true);

                    setTimeout(function() {

                        $(this).toggleClass('js-transition', true);

                    }, 500);

                    if (!$(this).find(toggle + ' a.current').length)
                        $(this).find(toggle + ' a:first').addClass('current');

                    if (!$(this).find(toggleItem + '.current').length)
                        $(this).find(toggleItem + ':first').addClass('current');

                    var hash = $(this).find(toggle + ' a.current, ' + toggleItem + '.current').data('hash') || $(this).find(toggle + ' a.current, ' + toggle + ' ' + toggleItem + '.current').attr('href'),
                        height = $(page + hash).outerHeight(true);

                    $(this)
                        .find(page)
                        .toggleClass('opened', false);

                    $(this)
                        .find(page + hash + ', ' + page + hash + '-tab')
                        .toggleClass('opened', true);

                    // Listening events
                    var $btn = $(this).find(options.selector + '-toggle a[href*="#"], ' + toggleItem + ', ' + manual);

                    $btn
                        .unbind(!$btn.is('input') ? 'click.switchTabs' : 'change.changeTabs')
                        .bind(!$btn.is('input') ? 'click.switchTabs' : 'change.changeTabs', function(e) {

                            e.preventDefault();

                            $wrapper.css({ height: $(page + hash + ', ' + page + hash + '-tab').outerHeight(true) });

                            hash = $(this).data('hash') || $(this).attr('href');
                            height = $(page + hash + ', ' + page + hash + '-tab').outerHeight(true);

                            // Off tabs
                            $(this)
                                .closest(widget)
                                .find(toggle + ' a, ' + toggleItem)
                                .toggleClass('current', false);

                            $(this)
                                .closest(widget)
                                .find(page)
                                .toggleClass('opened', false);

                            // On select tab
                            $(this)
                                .toggleClass('current', true);

                            $(this)
                                .closest(widget)
                                .find(page + hash + ', ' + page + hash + '-tab')
                                .toggleClass('opened', true);

                            if ($(this).is(manual)) {

                                $wg.find(options.selector + '-toggle a[href="' + $(this).attr('href') + '"]').toggleClass('current', true);

                            }

                            // Correct wrapper
                            $wrapper.css({ height: '' });
                            /*
                            $wrapper.stop(true).animate({ height: height }, 500, 'easeOutQuart', function() {

                                $(this).css({ height: '' });

                            });
                            */

                            // Callback fire
                            if(typeof options.onToggle !== 'undefined' && options.onToggle) {

                                options.onToggle.call($wg, $(this), $(this).closest(options.selector).find(options.selector + '-page' + ($(this).data('hash') || $(this).attr('href'))));

                            }

                        });

                    // Set hash
                    if (window.location.hash !== '#' && window.location.hash.length > 1) {

                        var $target = $(this).find(toggle + ' [href="' + window.location.hash + '"], ' + toggle + ' [data-hash="' + window.location.hash + '"]');
                            $target.trigger('click.switchTabs');

                    }

                } else {

                    $(this).toggleClass('js-init', false);

                    $(this)
                        .find(toggle + ' a')
                        .toggleClass('current', false);

                    /*$(this)
                        .find(page)
                        .toggleClass('opened', false);*/

                    $(this)
                        .find(content)
                        .css({ height: '' });

                }

            });

        }

    }

    function hashNav() {

        $('body')
            .on('click.hashNav', 'a[href^="#"]:not([href="#"], [class*="js-"], [class*="js-tabs"] a)', function(e) {

                var url = $(this).attr('href'),
                    threshold = ($(this).data('threshold') || 0) /* + $header.outerHeight()*/,

                    $element = !!$(url).length ? $(url) : $('[name="' + (url.substring(1)) + '"]');

                if (!!$(this).data('tab')) {

                    $('.js-tabs a[href="' + $(this).attr('href') + '"]').trigger('click.switchTabs')

                }

                if (url.length > 1 && $element.length) {

                    e.preventDefault();

                    var destination = $element.offset().top - threshold;
                    $('html, body').animate({ scrollTop: destination }, 400, 'easeOutQuart');

                    window.location.hash = url;

                }

            });

    }

    function swipeOfTables(options) {

        var $collection = $(options.collection);

        $(window).bind('load.buildSwipeOfTables resize.refreshSwipeOfTables', _processing);

        function _processing() {

            $collection.each(function() {

                if (!$(this).closest('.b-table_overflow').length) {

                    $(this).wrap('<div class="b-table_overflow"></div>');

                }

                var $container = $(this).closest('.b-table_overflow'),

                    tableWidth = $(this).width(),
                    containerWidth = $container.width();

                if (tableWidth > containerWidth) {

                    $(this)
                        .closest('.b-table_overflow')
                        .addClass('scrollable');

                } else {

                    $(this)
                        .closest('.b-table_overflow')
                        .removeClass('scrollable');
                }

            });

        }

    }

    function imagesOnRetinaDisplays(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '.b-page ';

        if ('devicePixelRatio' in window && window.devicePixelRatio > 1) {

            var $images = $(options.namespace + 'img.js-2x');

            $images.each(function() {

                var lowRes = $(this).attr('src'),
                    highRes = $(this).data('@2x');

                $(this)
                    .data('@1x', lowRes)
                    .attr('src', highRes);

                $(this).on('error', function() {
                    $(this).attr('src', lowRes);
                });

            });

            // Set cookies
            helpers.cookies.set({
                key: 'devicePixelRatio',
                value: window.devicePixelRatio
            });

        }

    }

    function loadingOnRequire(options) {

        /**
         *
         * @param {String} [options.btn] - Class of the button
         * @param {Function} [options.onComplete] - Callback function
         */

        var $links = $(options.btn);

        // Set data
        $links.each(function() {

            $(this).data('page', $(this).data('page') || 1);

        });

        // Loading on require
        $links.on('click.loadingOnRequire', function(e) {

            e.preventDefault();

            var $link = $(this).toggleClass('loading', true),
                $target = $($link.data('loadingTarget')),

                qs = $link.attr('href').split('?'),
                qsObj = {};

            if (typeof qs[1] !== 'undefined') {

                qsObj = qs[1].split("&").reduce(function(prev, curr, i, arr) {

                    var p = curr.split("=");
                    prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);

                    return prev;

                }, {});

            }

            $link.data('page', $link.data('page') || 2);

            _loadContent.call($target,
                {
                    url: $link.attr('href').split('?')[0],
                    method: $link.data('method') || 'get',
                    data: $.extend({}, { page: $link.data('page') }, qsObj),
                    onComplete: options.onComplete,
                    noWrapping: $(this).data('noWrapping')
                },
                function(response) {

                    setTimeout(function() {

                        $link.toggleClass('loading', false);

                    }, 300);

                    $link
                        .closest('.js-loading-on-require-wrap')
                        .toggleClass('fade', response.last);

                    $link
                        .attr('href', response.nextUrl || $link.attr('href'))
                        .data('page', $link.data('page') + 1);

                    if (!!response.btnText) {

                        $link.text(response.btnText);

                    }

                    if (!!response.info) {

                        $($link.data('loadingTarget') + '-info').text(response.info);

                    }

                }
            );

        });

        function _loadContent(options, callback) {

            var $target = this,
                $wrapper = $('<div class="js-loading-wrapper"></div>');

            $.ajax($.extend({}, {
                dataType: 'json',
                success: function(response) {

                    $wrapper.append(response.html);
                    $wrapper.css({ opacity: 0, transition: 'opacity 400ms' });

                    $target.append($wrapper);
                    $wrapper.slideUp(0);

                    setTimeout(function() {

                        $wrapper
                            .slideDown({ duration: 600, easing: 'easeOutQuart', complete: function() {

                                $(window).trigger('resize.flexRows');

                                if (!!options.onComplete) {

                                    options.onComplete.call($wrapper, response);

                                }

                                $wrapper.find('> *').unwrap();

                            }})
                            .css({ overflow: 'hidden', opacity: 1 });

                    }, 1);

                    if (!!callback) {

                        callback(response);

                    }

                }
            }, options));

        }

    }

    return {
        autoComplete: autoComplete,
        accordions: accordions,
        dropDown: dropDown,
        loadingOnRequire: loadingOnRequire,
        pockets: pockets,
        spoilers: spoilers,
        tabs: tabs,
        hashNav: hashNav,
        swipeOfTables: swipeOfTables,
        imagesOnRetinaDisplays: imagesOnRetinaDisplays
    };

})(window);