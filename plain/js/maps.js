var YandexMaps = (function(window, undefined) {

    'use strict';

    function init() {

        // Simple map
        YandexMaps.regular({
            selector: '.b-map'
        });

    }

    function regular(settings) {

        settings = !!settings ? settings : {};

        settings.namespace = !!settings.namespace ? settings.namespace + ' ' : '';
        settings.selector = !!settings.selector ? settings.selector : '.b-map';

        settings.collection = !!settings.collection ? settings.collection : $(settings.namespace + settings.selector);

        if (ymaps !== 'undefined' && !!ymaps) {

            // Custom prototype functions
            ymaps.Map.prototype.setCenterWithOffset = function(horizontal, vertical) {

                var projection = this.options.get('projection'),
                    pixels = projection.toGlobalPixels(this.getCenter(), this.getZoom());

                pixels[0] = pixels[0] - horizontal;
                pixels[1] = pixels[1] - vertical;

                this.setCenter(projection.fromGlobalPixels(pixels, this.getZoom()));

            };

            ymaps.ready(function () {

                settings.collection.each(function() {

                    var $map = $(this).empty(),

                        map = new ymaps.Map($map.attr('id'), {
                            center: [0, 0],
                            zoom: $map.data('zoom') || 16,
                            controls: $map.data('controls') || !!$map.data('zoomOnly') ? [] : ['zoomControl', 'typeSelector', 'trafficControl']
                        }),

                        objectManager = new ymaps.ObjectManager();

                    map.element = $map;

                    $map
                        .toggleClass('initialized', true)
                        .data('yMapInstance', map);

                    // Map settings
                    if (helpers.mobile()) {

                        map.behaviors.disable('drag');

                    }
                    else {

                        map.behaviors.disable('scrollZoom');

                    }

                    if (!!$map.data('zoomOnly')) {

                        map.controls.add('zoomControl', {
                            float: 'none',
                            position: {
                                left: 15,
                                top: ($map.outerHeight() - 206) / 2
                            }
                        });

                        //map.controls.get('zoomControl').options.set('size', 'small');

                    }

                    // Search on map
                    var $searchForm = $($map.data('searchForm')),

                        $searchResults = $('.b-guide_search_results'),
                        $searchResultsClose = $('.b-guide_search_results_close', $searchResults),

                        $searchResultsList = $('.b-guide_search_results_response_list', $searchResults),
                        $searchResultsAmount = $('.b-guide_search_results_response_amount span', $searchResults),

                        searchedOnMap = new ymaps.GeoObjectCollection();

                    $searchForm.on('submit.searchOnMap', function(e) {

                        e.preventDefault();
                        _search($(this).find('input[type="text"]').first().val());

                    });

                    $searchResultsClose.on('click.searchClear', _searchClear);

                    // Get points data
                    if (!!$map.data('coordinates')) {

                        var point = processingPoint.call($map);

                        objectManager.add(point);
                        map.geoObjects.add(objectManager);

                    }
                    else if (!!$map.data('cards')) {

                        var collection = {
                            type: 'FeatureCollection',
                            features: []
                        };

                        $($map.data('cards')).each(function() {

                            collection.features.push(processingPoint.call($(this)));

                        });

                        objectManager.add(collection);
                        map.geoObjects.add(objectManager);

                        // Filtration
                        if (window.location.hash.length > 0) {

                            var activeLayers = window.location.hash.split('=')[1].split(',');

                            $('.js-map-filter input[type="checkbox"]').each(function() {

                                $(this).prop('checked', activeLayers.indexOf($(this).attr('name')) >= 0);

                            });

                        }

                        _filtration(objectManager);

                        $('.js-map-filter').on('change.mapFilter', 'input', function() {

                            _filtration(objectManager);

                        });

                    }

                    map.setBounds(map.geoObjects.getBounds());

                    if (/*objectManager.objects.getLength() === 1 && */!!map.element.data('zoom'))  {

                        map.setZoom(map.element.data('zoom'));

                    }

                    function _filtration(objectManager) {

                        var $checkboxes = $('.js-map-filter input:checked'),

                            filter = '',
                            hash = '#layer=';

                        $checkboxes.each(function(i) {

                            filter += 'properties.layer == "' + $(this).attr('name') + '"';
                            hash += $(this).attr('name');

                            if (i + 1 < $checkboxes.length) {

                                filter += ' || ';
                                hash += ',';

                            }

                        });

                        hash = hash !== '#layer=' ? hash : '#layer=hidden';
                        filter = filter.length ? filter : 'properties.layer == "default"';

                        window.location.hash = hash !== '#layer=' ? hash : '';
                        objectManager.setFilter(filter);

                    }

                    function _search(query) {

                        ymaps.geocode(query, { results: 10 }).then(
                            function(response) {

                                var geoObjects = response.geoObjects,
                                    meta = response.metaData.geocoder,

                                    amount = meta.found > 10 ? 10 : meta.found;

                                $searchResultsList.empty();
                                $searchResultsAmount.text(meta.found);

                                if (amount > 0) {

                                    for(var i = 0; i < amount; i++) {

                                        var item = geoObjects.get(i);

                                        $searchResultsList.append(_createResultsElement(item));

                                    }

                                    $searchResults.toggleClass('opened', true);

                                }
                                else {

                                    _searchErrCatch({});

                                }

                            },
                            _searchErrCatch
                        );

                    }

                    function _searchErrCatch(error) {

                        //console.log(error);

                        $searchResultsList.empty();
                        $searchResultsAmount.text('0');

                        $searchResults.toggleClass('opened', true);

                    }

                    function _searchClear() {

                        $searchResults.toggleClass('opened', false);
                        $searchForm[0].reset();

                        if (searchedOnMap.getLength() > 0) {

                            searchedOnMap.removeAll();
                            map.geoObjects.remove(searchedOnMap);

                        }

                        setTimeout(function() {

                            $searchResultsList.empty();
                            $searchResultsAmount.text('0');

                        }, 800);

                    }

                    function _createResultsElement(item) {

                        var data = item.properties,

                            name = data.get('name'),
                            text = data.get('text'),

                            $li = $('<li><br />' + text + '</li>'),
                            $link = $('<span class="b-guide_search_results_response_list_link">' + name.capitalizeFirstLetter() + '</span>').prependTo($li);

                        //console.log(data);

                        $link.on('click.showObjectOnMap', function(e) {

                            e.preventDefault();

                            if (searchedOnMap.getLength() > 0) {

                                searchedOnMap.removeAll();
                                map.geoObjects.remove(searchedOnMap);

                            }

                            item.options.set({ preset: 'islands#blueDotIcon' });
                            searchedOnMap.add(item);

                            map.geoObjects.add(searchedOnMap);

                            map.setCenter(item.geometry.getCoordinates(), 11);

                            var resultsH = $('.b-guide_search_results').outerHeight(),
                                offset = (($map.outerHeight() - resultsH) / 4) + (resultsH / 2);

                            map.setCenterWithOffset(0, offset);

                        });

                        return $li;

                    }

                });

            }); //ymaps.ready end scope

        }

    }

    function processingPoint() {

        var id = this.data('id') || helpers.randomString(6),
            color = this.data('color') || 'blue',

            data = {
                id: id,
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: this.data('coordinates') || [0, 0]
                },
                options: {
                    hideIconOnBalloonOpen: false,
                    balloonShadow: false,
                    balloonAutoPan: false
                },
                properties: {
                    id: id,
                    color: color,
                    layer: this.data('layer') || 'default',
                    balloonContent: !this.data('noBalloon') ? this.html() : false
                }
            },

            markerLayoutId = 'TicRK#marker' + color;

        // Marker
        if (!!this.data('customMark')) {

            ymaps.layout.storage.add(markerLayoutId, ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_marker[if properties.color] $[properties.color][endif]"></div>'));

            $.extend(data.options, {
                iconLayout: markerLayoutId,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [
                        [-13, -36], [14, 0]
                    ]
                }
            });

        }
        else if (!!this.data('customMarkImg')) {

            $.extend(data.options, {
                iconLayout: 'default#image',
                iconImageHref: this.data('customMarkImg'),
                iconImageSize: [30, 30],
                iconImageOffset: [-15, -15]
            });

        }
        else {

            $.extend(data.options, {
                preset: 'islands#blueDotIcon'
            });

        }

        // Balloon
        if (!!this.data('customBalloon')) {

            var balloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_balloon"><span class="b-map_balloon_close e-btn i-ico i-ico-cross-thin-grey"></span><div class="b-map_balloon_inner">$[[options.contentLayout observeSize minWidth=320 maxWidth=350]]</div></div>', {
                    build: function () {

                        this.constructor.superclass.build.call(this);
                        this._$element = $('.b-map_balloon', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.b-map_balloon_close')
                            .on('click', $.proxy(this.onCloseClick, this));

                    },
                    clear: function () {

                        this._$element.find('b-map_balloon_close').off('click');
                        this.constructor.superclass.clear.call(this);

                    },
                    onSublayoutSizeChange: function () {

                        balloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if(!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();
                        this.events.fire('shapechange');

                    },
                    applyElementOffset: function () {

                        /*this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2)/!*, top: -(this._$element[0].offsetHeight + 34)*!/
                        });*/

                    },
                    onCloseClick: function (e) {

                        e.preventDefault();
                        this.events.fire('userclose');

                    },
                    getShape: function () {

                        if(!this._isElement(this._$element)) {
                            return balloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + 34
                            ]
                        ]));

                    },
                    _isElement: function (element) {
                        return element && element[0] && element.find('.b-map_balloon_arrow')[0];
                    }
                }),

                balloonContentLayout = ymaps.templateLayoutFactory.createClass('<div class="b-map_balloon_content">$[properties.balloonContent]</div>');

            $.extend(data.options, {
                balloonShadow: false,
                balloonLayout: balloonLayout,
                balloonContentLayout: balloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                openBalloonOnClick: true
            });

        }

        return data;

    }

    return {
        init: init,
        regular: regular
    };

})(window);
