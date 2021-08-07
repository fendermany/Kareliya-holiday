var helpers = (function(window, undefined) {

    function maxHeight($collection) {

        var max = 0;

        $collection.each(function() {

            max = ($(this).height() > max) ? $(this).height() : max;

        });

        return max;

    }

    function pixelsRatio() {

        return 'devicePixelRatio' in window && window.devicePixelRatio > 1;

    }

    function screen() {

        var deviceScreen = $(window).width();

        if (deviceScreen < 480) {
            return 'xs';
        }
        else if (deviceScreen >= 480 && deviceScreen < 728) {
            return 'sm';
        }
        else if (deviceScreen >= 728 && deviceScreen < 1200) {
            return 'md';
        }
        else if (deviceScreen >= 1200) {
            return 'lg';
        }

    }

    function mobile() {

        var uaTest = {

            android: function() {
                return navigator.userAgent.match(/Android/i);
            },

            blackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },

            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },

            opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },

            windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            }

        };

        return (uaTest.android() || uaTest.blackBerry() || uaTest.iOS() || uaTest.opera() || uaTest.windows())

    }

    function randomString(length) {

        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(''),
            result = '';

        length = !length ? Math.floor(Math.random() * chars.length) : length;

        for (var i = 0; i < length; i++) {

            result += chars[Math.floor(Math.random() * chars.length)];

        }

        return result;

    }

    function editGetParams(url, paramKey, paramVal) {

        var hash = url.match(/#/gi) && url.indexOf('#') !== 0,

            urlParts, originalQueryString, resultQueryString;

        url = hash ? url.split('#') : [url, ''];

        urlParts = url[0].split('?');
        hash = hash ? '#' + url[1] : '';

        originalQueryString = urlParts[1];
        resultQueryString = '?';

        if (originalQueryString) {

            var params = originalQueryString.split('&');

            for (var i = 0; i < params.length; i++) {

                var keyVal = params[i].split("=");

                if (keyVal[0] !== paramKey) {

                    resultQueryString += params[i];

                } else {

                    resultQueryString += paramKey + '=' + paramVal;

                }

                resultQueryString += i < params.length - 1 ? '&' : ''

            }

        }

        return urlParts[0] + resultQueryString + hash;

    }

    function getPfx() {

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

    }

    function getNumEnding(num, endings) {

        var sEnding, i;

        num = num % 100;

        if (num>=11 && num<=19) {

            sEnding=endings[2];

        }
        else {

            i = num % 10;

            switch (i) {

                case (1):
                    sEnding = endings[0];
                    break;

                case (2):
                case (3):
                case (4):
                    sEnding = endings[1];
                    break;
                default:
                    sEnding = endings[2];

            }

        }

        return sEnding;

    }

    function getScrollBarWidth() {

        var $element = $('<div class="b-scrollBar-test"></div>').css({ position: 'absolute', left: -99999, top: -99999, overflowY: 'scroll', width: 50, height: 50, visibility: 'hidden' });

        $('body').append($element);

        var scrollBarWidth = $element[0].offsetWidth - $element[0].clientWidth;

        $element.remove();

        return scrollBarWidth;

    }

    function async(src) {

        // YouTube API
        var yt = document.createElement('script');

        yt.type = 'text/javascript';
        yt.src = src;
        yt.async = true;

        document.body.appendChild(yt);

    }

    function delay(func, duration) {

        if (this.data('timeout') !== 'undefined') {

            clearTimeout(this.data('timeout'));

        }

        this.data('timeout', setTimeout($.proxy(function() {

            if (!!func) {

                func();

            }

        }, this), duration || 500));

    }

    var cookies = {

        set: function(options) {

            var now = new Date,
                cookies = options.key + '=' + options.value;

            now.setDate(now.getDate() + (options.expires || 1));

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

            helpers.cookies.set({ key: key, value: '', expires: -1 });

        }

    };

    return {

        // Variables
        pfx: getPfx(),
        touches: {
            touchstart: {x: -1, y: -1 },
            touchmove: { x: -1, y: -1 }
        },
        reCaptchaKey: '6Lfp4iYTAAAAALL4XsWR5u_VzSPwK_7YD9d00Fb6',

        // Cookies
        cookies: cookies,

        // Functions
        async: async,
        delay: delay,
        mobile: mobile,
        maxHeight: maxHeight,
        editGetParams: editGetParams,
        getNumEnding: getNumEnding,
        getScrollBarWidth: getScrollBarWidth,
        getPfx: getPfx,
        pixelsRatio: pixelsRatio,
        randomString: randomString,
        screen: screen

    };

})(window);

// Swipe listeners
$(document).bind('touchstart.swipeControl touchmove.swipeControl', function(e) {

    var touch = e.originalEvent.touches[0];

    helpers.touches[e.type].x = touch.pageX;
    helpers.touches[e.type].y = touch.pageY;

});

// Расширение JQ-методов
(function($) {

    $.fn.rowSlideUp = function(duration, callback, easing) {

        var $td = this.find('> td'),
            pfx = helpers.pfx;

        this.toggleClass('slideUp', true);

        if ($td.length) {

            $td.each(function() {

                $(this)
                    .wrapInner('<div style="padding: ' + $(this).css('padding-top') + ' ' + $(this).css('padding-right') + ' ' + $(this).css('padding-bottom') + ' ' + $(this).css('padding-left') + ';"></div>')
                    .attr('style', 'padding: 0 !important;');

            });

            var $div = $td.find('> div');

            $td
                .css(pfx + 'transition', 'border 400ms')
                .css('transition', 'border 400ms');

            $div
                .css(pfx + 'transition', 'opacity 400ms')
                .css('transition', 'opacity 400ms');

            setTimeout(function() {

                $td
                    .css('border-color', 'transparent');

                $div
                    .css('opacity', 0)
                    .slideUp({ duration: duration, easing: !!easing ? easing : 'swing', complete: callback });

            }, 50);

            return this;

        }

    };

})(jQuery);

(function($) {

    $.fn.flexRows = function(options) {

        options = !!options ? options : {};
        options.selector = !!options.selector ? options.selector : '> *';

        options.auto = !!options.auto ? !!options.auto : false;
        options.strong = !!options.strong ? !!options.strong : false;
        options.handler = !!options.handler ? options.handler : false;
        options.breakpoints = !!options.breakpoints ? options.breakpoints : ['xs', 'sm', 'md', 'lg', 'xl'];

        var settings = $.extend(options, this.data());

        new FlexRows(this, settings);

        return this;

    };

    function FlexRows($this, options) {

        this.options = options;
        this.elements = $this.find(this.options.selector);

        if (this.options.breakpoints.indexOf(helpers.screen()) >= 0) {

            this.processing();

        }
        else {

            this.clear(this.elements);

        }

        $(window).bind('load.flexRows resize.flexRows', $.proxy(function() {

            helpers.delay.call($(this), $.proxy(function() {

                if (this.options.breakpoints.indexOf(helpers.screen()) >= 0) {

                    this.processing();

                }
                else {

                    this.clear(this.elements);

                }

            }, this), 500);

        }, this));

    }

    FlexRows.prototype.processing = function() {

        this.rows = this.splitUpIntoRows();

        if (this.options.handler) {

            for (var a = 0; a < this.rows.length; a++) {

                this.options.handler.call(this.rows[a]);

            }

        }
        else if (this.options.auto) {

            for (var b = 0; b < this.rows.length; b++) {

                this.alignment(this.rows[b]);

            }

        }
        else if (this.options.split) {

            for (var c = 0; c < this.rows.length; c++) {

                this.split(this.rows[c]);

            }

        }

        return true;

    };

    FlexRows.prototype.splitUpIntoRows = function() {

        var rows = {},
            result = [];

        this.elements.each(function(i) {

            if (typeof rows['top' + $(this).offset().top] === 'undefined') {

                rows['top' + $(this).offset().top] = [];

            }

            rows['top' + $(this).offset().top].push($(this));

        });

        $.each(rows, function() {

            var $col = $();

            $(this).each(function() {

                $col = $col.add($(this));

            });

            result.push($col);

        });

        return result;

    };

    FlexRows.prototype.alignment = function($collection) {

        var max = 0;

        if (this.options.strong) {

            $collection
                .css({ height: '' })
                .each(function() {

                    max = ($(this).outerHeight() > max) ? $(this).outerHeight() : max;

                });

            $collection.css({ height: max });

        } else {

            $collection
                .css({ minHeight: '' })
                .each(function() {

                    max = ($(this).outerHeight() > max) ? $(this).outerHeight() : max;

                });

            $collection.css({ minHeight: max });

        }

    };

    FlexRows.prototype.split = function($collection) {

        $collection
            .each(function(i) {

                $(this).removeClass('split');

                if (i > 0) {

                    $(this).addClass('split');

                }

            });

    };

    FlexRows.prototype.clear = function($collection) {

        $collection
            .css({ height: '' })
            .css({ minHeight: '' })
            .each(function() {

                $(this).removeClass('split');

            });

    };

})(jQuery);

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Prototypes extend
if (!String.prototype.capitalizeFirstLetter) {

    String.prototype.capitalizeFirstLetter = function() {

        return this.charAt(0).toUpperCase() + this.slice(1);

    };

}

if (!String.prototype.discharge) {

    String.prototype.discharge = function(delimiter) {

        return this.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + delimiter);

    };

}

if (!Number.prototype.isInteger) {

    Number.prototype.isInteger = function() {

        return (this % 1) === 0;

    };

}

if (!Array.prototype.indexOf) {

    Array.prototype.indexOf = function(elt) {

        var len = this.length >>> 0,
            from = Number(arguments[1]) || 0;

        from = (from < 0) ? Math.ceil(from) : Math.floor(from);

        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }

        return -1;

    };

}
