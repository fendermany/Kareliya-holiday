$(document).ready(function() {

    // User interface
    site.init();

    // Init UI modules
    siteModules.hashNav();

    siteModules.dropDown({
        selector: 'js-dropDown'
    });

    siteModules.accordions({
        selector: '.js-accordion'
    });

    siteModules.tabs({
        selector: '.js-tabs'
    });

    siteModules.spoilers({
        selector: '.js-spoiler'
    });

    siteModules.pockets({
        selector: '.js-pocket'
    });

    siteModules.loadingOnRequire({
        btn: '.js-loading-on-require'
    });

    siteModules.imagesOnRetinaDisplays();

    // Init plugins
    sitePlugins.popUps();
    sitePlugins.scrollBars();

    sitePlugins.carousels({
        selector: '.b-carousel'
    });

    // Init forms handlers
    forms.init('.b-page');

});

// UI
var site = (function(window, undefined) {

    'use strict';

    function onLoadPage() {

        $(window).bind('load.pageReady', function() {

            // YMaps API
            //helpers.async('http://api-maps.yandex.ru/2.1/?load=package.full&lang=ru-RU&onload=YandexMaps.init');

            // YShare API
            //helpers.async('//yastatic.net/es5-shims/0.0.2/es5-shims.min.js');
            helpers.async('//yastatic.net/share2/share.js');

            // ReCaptcha
            // helpers.async('https://www.google.com/recaptcha/api.js?onload=reCaptchaOnLoad&render=explicit');

            // VK API
            // helpers.async('//vk.com/js/api/openapi.js?116');

            // Facebook API
            // helpers.async('//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.6');

        });

    }

    function targetBlank() {

        $('a[data-target="_blank"]')
            .on('click', function() {

                return !window.open($(this).attr('href'));

            });

    }

    function orderedLists() {

        $('ol[start]').each(function() {

            $(this).css({ counterReset: 'list ' + (parseInt($(this).attr('start')) - 1) });

        });

    }

    function backgrounds(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        var $img = $(options.namespace + '[data-background-image]'),
            $color = $(options.namespace + '[data-background-color]');

        $img.each(function() {

            $(this).css({
                backgroundImage: 'url(' + $(this).data('backgroundImage') + ')'
            });

        });

        $color.each(function() {

            $(this).css({
                backgroundColor: $(this).data('backgroundColor')
            });

        });

    }

    function verticalAlignment() {

        $('.js-flexRows').flexRows({
            auto: true,
            strong: false,
            selector: '.js-flexRowsTile'
        });

        $('.b-mp-sights_feed').flexRows({
            auto: true,
            strong: false,
            selector: '.b-mp-sight'
        });

    }

    function footerBottom() {

        var $page = $('.b-page'),
            $footer = $('.b-footer', $page),

            screens = [/*'xs', 'sm', */'md', 'lg'];

        _processing();

        $footer.on('footer.refresh', _processing);

        $(window).bind('load.refreshFooterPosition resize.refreshFooterPosition', _processing);

        function _processing() {

            if (screens.indexOf(helpers.screen()) >= 0) {

                $page.css({ paddingBottom: $footer.outerHeight(true) });
                $footer.css({ position: 'absolute', zIndex: 0, left: 0, bottom: 0, right: 0, minWidth: 320 })

            } else {

                $page.css({ paddingBottom: '' });
                $footer.css({ position: '', zIndex: '', left: '', bottom: '', right: '', minWidth: '' });

            }

        }

    }

    function header() {

        $('body')
            .on('focus.hdrSearchFocus', '.b-header_bar_search_field input', function() {

                $(this).closest('.b-header_bar_search').toggleClass('active', true);

            })
            .on('blur.hdrSearchBlur', '.b-header_bar_search_field input', function() {

                $(this).closest('.b-header_bar_search').toggleClass('active', !!$(this).val().length);

            });

    }

    return {
        init: function() {

            // Footer positioning
            footerBottom();

            // On load page
            onLoadPage();

            // Vertical align
            verticalAlignment();

            // Valid target attribute
            targetBlank();

            // Set start num for ol
            orderedLists();

            // Background
            backgrounds();

            // Header
            header();

        },
        setBackgrounds: backgrounds
    };

})(window);