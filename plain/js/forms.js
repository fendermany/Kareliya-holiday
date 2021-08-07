var forms = (function(window, undefined) {

    'use strict';

    function init(namespace) {

        forms.styleControls(namespace + ' input[type="checkbox"], ' + namespace + ' input[type="radio"]', namespace + ' select:not([multiple]):not(.js-selectric)', namespace + ' input[type="file"]:not(.js-dropZone, .js-uploader, .js-photo-uploader-input)');
        forms.styleSelects(namespace + ' select.js-selectric');

        forms.maskedInput(namespace);
        forms.makePlaceholders(namespace + ' [placeholder]');

        forms.validate(namespace);
        forms.resetForm();

        forms.rangeFields(namespace);
        forms.datePicker(namespace);

    }

    function validate(namespace) {

        $(namespace + ' form:not(.js-order)').each(function() {

            var $form = $(this);

            if ($.isFunction($.fn.validate) && $form.data('checkup')) {

                $form
                    .validate({
                        onChange: !!$form.data('checkupOnChange') ? $form.data('checkupOnChange') : false,
                        onKeyup: !!$form.data('checkupOnKeyup') ? $form.data('checkupOnKeyup') : false,
                        onBlur: !!$form.data('checkupOnBlur') ? $form.data('checkupOnBlur') : false,
                        conditional: {

                            passwords: function() {

                                return $(this).val() === $('[data-conditional-check="passwords"]').val();

                            },

                            checkboxes: function() {

                                var flag = true;

                                $(this).closest('.b-form_box_field').find('input[type="checkbox"]').each(function() {

                                    flag = $(this).is(':checked');

                                    return !flag;

                                });

                                return flag;

                            }

                        },
                        eachValidField: function() {

                            formNotifications.hideErrorLabel.call($(this));

                        },
                        eachInvalidField: function(status, options) {

                            var conditional = !!$(this).data('conditionalType') ? formNotifications.labels.conditional[$(this).data('conditionalType')] : formNotifications.labels.conditional[$(this).data('conditional')] || formNotifications.labels.conditional.def,
                                pattern = !!$(this).data('patternType') ? formNotifications.labels.pattern[$(this).data('patternType')] : formNotifications.labels.pattern.def,

                                notification = (options.required) ? ((!options.conditional) ? conditional : (!options.pattern) ? pattern : '') : !!$(this).data('requiredType') ? formNotifications.labels.required[$(this).data('requiredType')] : formNotifications.labels.required.def;

                            formNotifications.showErrorLabel.call($(this), notification, 0);

                        },
                        valid: function(e) {

                            var $form = $(this),
                                $btn = $(this).find('button[type="submit"].e-btn'),

                                xhrSubmit = !!$(this).data('xhr'),

                                validHandler = $(this).data('handler'),
                                validHandlerMethod = $(this).data('handlerProperty');

                            if (typeof window[validHandler] === 'function') {

                                window[validHandler].call($form, e);

                            }
                            else if (typeof window[validHandler] === 'object') {

                                if (!!window[validHandler][validHandlerMethod]) {

                                    window[validHandler][validHandlerMethod].call($form, e);

                                }

                            }

                            if (xhrSubmit) {

                                e.preventDefault();

                                if ($.isFunction($.fn.ajaxSubmit)) {

                                    $form.ajaxSubmit({
                                        url: $form.attr('action'),
                                        method: $form.attr('method'),
                                        dataType: 'json',
                                        beforeSubmit: function() {

                                            $btn.toggleClass('request');

                                        },
                                        success: function(response) {

                                            $btn.toggleClass('request');
                                            xhrFormHandler.response.call($form, response);

                                            $form.trigger('order.success');

                                        }
                                    });

                                } else {

                                    $.ajax({
                                        url: $form.attr('action'),
                                        method: $form.attr('method'),
                                        data: $form.serialize(),
                                        dataType: 'json',
                                        before: function() {

                                            $btn.toggleClass('request');

                                        },
                                        success: function(response) {

                                            $btn.toggleClass('request');
                                            xhrFormHandler.response.call($form, response);

                                            $form.trigger('order.success');

                                        }
                                    });

                                }

                            }

                        }

                    })
                    .on('focus rating selectric-before-open refresh.validate', 'input, textarea, select', function() {

                        $(this).closest('.m-valid').removeClass('m-valid');
                        $(this).closest('.m-error').removeClass('m-error');

                    });

            }

            // Check to toggle a button
            if ($form.data('checkupBtn')) {

                $form.validate({
                    nameSpace : 'buttonSwitching',
                    onKeyup: true,
                    onBlur: true,
                    buttonSwitching: true,
                    switching: function(event, options, btnState) {

                        $(this).data('validateStatus', options);

                        var xhrValidateState = typeof $form.data('xhrValidateState') !== 'undefined' ? $form.data('xhrValidateState') : true,
                            prop = btnState && xhrValidateState;

                        $(this).find('button[type="submit"]').prop('disabled', !prop);

                    }
                });

            }

        }); // End loop

    }

    function styleControls(input, select, file) {

        if ($.isFunction($.fn.uniform)) {

            // Inputs
            $(input)
                .not('.js-switch')
                .uniform();

            // Select
            if(!!select) {

                $(select).uniform({
                    selectAutoWidth: false,
                    selectClass: 'e-select'
                });

            }

            // File
            if(!!file) {

                $(file).each(function() {

                    $(this).uniform({
                        fileButtonHtml: '',
                        fileClass: 'e-uploader e-btn e-btn_grey e-btn_overlay i-ico i-ico-upload',
                        filenameClass: 'e-uploader_file',
                        fileButtonClass: 'e-uploader_btn',
                        fileDefaultHtml: $(this).data('label') || 'Загрузить'
                    });

                });

            }

        }

    }

    function styleSelects(selector) {

        if (helpers.mobile()) {

            if ($.isFunction($.fn.uniform)) {

                $(selector).uniform({
                    selectAutoWidth: false,
                    selectClass: 'e-select'
                });

            }

        }
        else {

            if ($.isFunction($.fn.selectric)) {

                $(selector).selectric({
                    maxHeight: 184,
                    arrowButtonMarkup: '',
                    disableOnMobile: false,
                    optionsItemBuilder: function(data, el) {

                        var storage = $(el).data();

                        return data.text + ((!!storage.price && !!storage.currency) ? '&nbsp;&ndash; <strong>' + storage.price + '&nbsp;<i class="' + storage.currency + '"></i></strong>' : '');

                    },
                    labelBuilder: function(data) {

                        var icon = 'i-sprite i-sprite-chevron-down',
                            text = data.value !== '' ? data.text : '<span class="placeholder">' + data.text + '</span>';

                        return !!icon ? '<span class="' + icon + '">' + text + '</span>' : text;

                    }
                });

                filterField();

                strongWidth();
                $(window).bind('resize.selectricWidth', strongWidth);

            }

        }

        function filterField() {

            $(selector).each(function() {

                if (!!$(this).data('filterField')) {

                    var $wg = $(this).closest('.selectric-wrapper'),
                        $wgDrop = $('.selectric-items', $wg),
                        $wgList = $('.selectric-list', $wg),

                        $field = $('<div class="selectric-filter"></div>'),
                        $fieldInput = $('<input type="text" placeholder="Поиск" />').appendTo($field),

                        $wgListNotFound = $('<div class="selectric-list-not-found"">Совпадений не найдено</div>').hide(),

                        length = 0;

                    $wgDrop.prepend($field);
                    $wgDrop.append($wgListNotFound);

                    $fieldInput.keyup(function() {

                        var valThis = $(this).val().toLowerCase();

                        $wgList.find('li').each(function() {

                            var text = $(this).text().toLowerCase();

                            length += text.indexOf(valThis) === 0 ? 1 : 0;
                            $(this).toggle(text.indexOf(valThis) === 0);

                        });

                        $wgListNotFound.toggle(!length);

                    });

                    $(this).on('selectric-open', function() {

                        setTimeout(function() {

                            $fieldInput.focus();

                        }, 250);

                    });

                    $(this).on('selectric-before-close', function() {

                        $fieldInput.val('');
                        $wgList.find('li').show();

                    });

                }

            });

        }

        function strongWidth() {

            $(selector).each(function() {

                var $wg = $(this).closest('.selectric-wrapper').css({ width: '' });

                if (!!$(this).data('width')) {

                    switch ($(this).data('width')) {

                        default:

                            $wg.css({ width: $(this).data('width') });
                            break;

                        case 'strong':

                            $wg.css({ width: $wg.outerWidth() });
                            break;

                    }

                }

            });

        }

    }

    function makePlaceholders(selector) {

        $(selector).each(function() {

            makeLabelsPlaceholders.call($(this));

        });

    }

    function makeLabelsPlaceholders() {

        var placeholdersIsSupports = 'placeholder' in document.createElement('input');

        if (!placeholdersIsSupports && this.is('input:not([type="radio"]):not([type="checkbox"]):not(.js-spinner), textarea')) {

            var $field = this.attr('id', !!this.attr('id') ? this.attr('id') : helpers.randomString(6)),
                $placeholder = $('<label class="b-form_box_field_placeholder" for="' + this.attr('id') + '">' + this.attr('placeholder') + '</label>').toggleClass('complete', !!this.val().length);

            $field
                .after($placeholder)
                .on('focus blur change', function() {

                    $placeholder.toggleClass('complete', !!$(this).val().length);

                });

        }

    }

    function maskedInput(namespace) {

        if ($.isFunction($.fn.inputmask)) {

            $(namespace + ' [data-masking]').each(function() {

                $(this).inputmask({
                    mask: $(this).data('masking') || '+7 (999) 999-99-99',
                    placeholder: '_',
                    showMaskOnHover: false
                });

            });

        }

    }

    function resetForm() {

        $('body').on('click', '.js-reset-form', function(e) {

            e.preventDefault();

            var $form = $(this).closest('form');

            $form[0].reset();

            $form.find('input[type="text"], select').not('[data-default]').val('');
            $form.find('input[type="radio"], input[type="checkbox"]').prop('checked', false);

            $form.find('select').selectric('refresh');

            $form.find('.js-range').slider('option', {
                values: [
                    $($form.find('.js-range').data('from')).data('default'),
                    $($form.find('.js-range').data('to')).data('default')
                ]
            });

            $.uniform.update();

        });

    }

    function datePicker(namespace) {

        $(namespace + ' .js-calendar').each(function() {

            var $field = $(this);

            if (!!helpers.mobile()) {

                var $date = $('<input type="date" />');

                $field.closest('.b-form_box_field').toggleClass('b-form_box_field_date', true);
                $field.after($date);

                $date.on('change', function() {

                    $field.val(_format($field, $(this).val()));

                    if (!!$field.data('bindingMin')) {

                        _bindingDates();

                    }

                });

            }
            else {

                if ($.isFunction($.fn.datepicker)) {

                    $field
                        .datepicker({
                            dateFormat: 'dd.mm.yy',
                            showOtherMonths: true,
                            selectOtherMonths: true
                        })
                        .datepicker('option', $.datepicker.regional[$field.data('local') || 'ru-RU']);

                }

            }

        });

        function _format($field, date) {

            if (new Date(Date.parse(date)) < new Date(Date.parse($field.attr('min')))) {

                date = $field.attr('min');

            }

            var arr = date.split('-');
            return arr[2] + '.' + arr[1] + '.' + arr[0];

        }

    }

    function rangeFields(namespace) {

        $(namespace).on('change.rangeFields keyup.rangeFields', '[data-range-min]', function(e) {

            var $this = $(this),

                min = parseInt($($this.data('rangeMin')).val(), 10),
                val = parseInt($this.val(), 10),

                step = $this.data('rangeStep') || 1;

            if (val <= min) {

                $this.val(min + step);

            }

        });

        $(namespace).on('change.rangeFields keyup.rangeFields', '[data-range-max]', function(e) {

            var $this = $(this),

                max = parseInt($($this.data('rangeMax')).val(), 10),
                val = parseInt($this.val(), 10),

                step = $this.data('rangeStep') || 1;

            if (val >= max) {

                $($this.data('rangeMax')).val(val + step);

            }

        });

    }

    function reCaptcha(namespace) {

        var $wg = $(namespace + ' .js-reCaptcha');

        $wg.each(function() {

            var id = helpers.randomString(8),
                $form = $(this).closest('form');

            $(this).append($('<div class="g-recaptcha" id="' + id + '"></div>'));

            grecaptcha.render(id, {
                sitekey: $(this).data('siteKey') || helpers.reCaptchaKey || '',
                callback: function(response) {

                    if (!!response) {

                        $form.find('button[type="submit"].e-btn').prop('disabled', false);

                    }

                }
            });

        });

    }

    return {
        init: init,
        datePicker: datePicker,
        makePlaceholders: makePlaceholders,
        maskedInput: maskedInput,
        rangeFields: rangeFields,
        reCaptcha: reCaptcha,
        resetForm: resetForm,
        styleControls: styleControls,
        styleSelects: styleSelects,
        validate: validate
    };

})(window);

var formNotifications = (function(window, undefined) {

    var settings = {
        errorClass: 'm-error',
        errorSuffix: '_error',
        validClass: 'm-valid'
    };

    var extendLabels = typeof formNotices !== 'undefined' ? formNotices : {},

        labels = {
            required: {
                def: 'Это поле необходимо заполнить'
            },
            conditional: {
                def: 'Введенные данные не совпадают',
                credit: 'Некорректный номер банковской карты',
                passwords: 'Введенные пароли не совпадают',
                checkboxes: 'Необходимо выбрать один из параметров',
                inn: 'Ошибка в ИНН',
                snils: 'Ошибка в номере СНИЛС'
            },
            pattern: {
                def: 'Некорректный формат данных',
                email: 'Некорректный адрес электронной почты',
                phone: 'Некорректный номер телефона'
            },
            uploader: {
                count: 'Вы пытаетесь загрузить больше изображений, чем это допустимо',
                uploading: 'Во время загрузки изображений возникла ошибка'
            },
            submit: {
                success: 'Спасибо. Мы свяжемся с вами в ближайшее время.',
                error: 'Ошибка.'
            }
        };

    labels = $.extend({}, labels, extendLabels);

    // Notification alerts
    function showMessage(msg, status, hideForm, callback) {

        var $notice = this.find('.b-form_message').length ? this.find('.b-form_message') : $('<div class="b-form_message"></div>').prependTo(this),
            suffix = status ? 'success' : 'error';

        $notice
            .height($notice.height())
            .html('<div class="b-form_message_balloon b-form_message_balloon__' + suffix + '"><div class="b-form_message_balloon_capsule"><div class="b-form_message_balloon_capsule_inner">' + msg + '</div></div></div>');

        $notice
            .toggleClass('b-form_message__show', true)
            .animate({ height: $notice.find('.b-form_message_balloon').height(), paddingBottom: hideForm ? 0 : 30 }, 300, 'easeOutQuart', function() {

                $(this).css({ height: '' });

            });

        if (hideForm) {

            this
                .find('form')
                .toggleClass('b-form__hide', true)
                .slideUp({ duration: 300, easing: 'easeOutQuart' });

        }

        // Callback
        if(!!callback) {

            callback.call(this);

        }

    }

    function showMessageInPopUp(msg, status, hideForm, callback) {

        var $form = this.find('form'),
            $msg =
                $('<div class="b-form_message b-form_message__show">' +
                    '<div class="b-form_message_balloon b-form_message_balloon__' + (status ? 'success' : 'error') + '">' +
                    '<div class="b-form_message_balloon_capsule">' +
                    '<div class="b-form_message_balloon_capsule_inner">' + msg + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

        if ($form.data('inPopUpClear')) {

            $msg = msg;

        }

        this.leafLetPopUp('show', {
            animationStyleOfBox: 'scale',
            animationStyleOfChange: 'slide',
            boxWidth: 590,
            boxHorizontalGutters: 50,
            boxVerticalGutters: 50,
            closeBtnLocation: 'no',
            closeBtnClass: 'i-icon i-close-circle',
            content: $msg,
            overlayOpacity: .65,
            scrollLocker: $('.b-page'),
            beforeLoad: function() {

                var $this = this;

                $this.find('.b-leaflet_box').addClass('b-form_message_balloon_leaflet');

            },
            afterLoad: function() {

                if (hideForm) {

                    $form
                        .toggleClass('disabled', true)
                        .find('input, select, textarea, button')
                        .prop('disabled', true);

                    $.uniform.update($form.find('input, select, textarea'));

                }

                // Callback
                if(!!callback) {

                    callback.call(this);

                }

            }
        });

    }

    function hideMessage() {

        var $notice = this.find('.b-form_message').length ? this.find('.b-form_message') : $('<div class="b-form_message"></div>').prependTo(this);

        $notice
            .slideUp({duration: 300, easing: 'easeOutQuart' });

    }

    // Notification labels
    function showErrorLabel(text, status) {

        var $field = this.closest('.b-form_box_field');

        $field
            .find('.b-form_box' + settings.errorSuffix).remove();

        $field
            //.find('.b-form_box_field')
            .append('<div class="b-form_box' + settings.errorSuffix + '">' + text + '</div>');

        setTimeout(function() {

            $field
                .removeClass(settings.validClass)
                .addClass(settings.errorClass);

        }, 100);

    }

    function hideErrorLabel() {

        var $field = this.closest('.b-form_box_field');

        $field.removeClass(settings.errorClass);
        $field.find('.b-form_box' + settings.errorSuffix).remove();

        if ($field.find('[data-required]').length) {

            setTimeout(function() {

                $field.addClass(settings.validClass);

            }, 100);

        }

    }

    return {
        labels: labels,
        showErrorLabel: showErrorLabel,
        showMessage: showMessage,
        showMessageInPopUp: showMessageInPopUp,
        hideErrorLabel: hideErrorLabel,
        hideMessage: hideMessage
    };

})(window);

var xhrFormHandler = (function(window, undefined) {

    function response(response) {

        var $form = this,
            message = '';

        // start check
        if (typeof response.fields === 'boolean' && response.fields) {

            if (response.captcha || typeof response.captcha === 'undefined') {

                // Success action
                message = response.msg || formNotifications.labels.submit.success;

                if (!!$form.data('inPopUp')) {

                    formNotifications.showMessageInPopUp.call(this.closest('.b-form'), message, true, response.hideForm);

                } else {

                    formNotifications.showMessage.call(this.closest('.b-form'), message, true, response.hideForm);

                }

            } else {

                // Captcha error action
                message = response.msg || formNotifications.labels.submit.error;
                captchaHandler.call(this, response);

            }

            // Redirect user
            if (!!response.redirect) {

                redirect(response.redirect);

            }

        } else if (typeof response.fields === 'object') {

            // Get error message string
            var messageStr = ' Некорректно заполнены поля: ';

            $.each(response.fields, function(key, value) {

                var fieldName = $form.find('[name="' + key + '"]').attr('placeholder') || $form.find('[name="' + key + '"]').closest('.b-form_box').find('.b-form_box_title').text().replace(' *', '');

                messageStr += '&laquo;' + fieldName + '&raquo;, ';

            });

            message = response.msg || formNotifications.labels.submit.error + messageStr.substring(0, messageStr.length - 2) + '.';

            // Init handlers
            captchaHandler.call(this, response);

            if (!!$form.data('inPopUp')) {

                formNotifications.showMessageInPopUp.call(this.closest('.b-form'), message, false, false, function(form) {

                    highlightFields($form, response.fields);

                });

            } else {

                formNotifications.showMessage.call(this.closest('.b-form'), message, false, false, function(form) {

                    highlightFields($form, response.fields);

                });
            }


        } else {

            if ('console' in window) {
                console.log('Неверный формат ответа обработчика формы');
                console.log(response);
            }

        }

    }

    function highlightFields(form, array) {

        $.each(array, function(key, value) {

            formNotifications.showErrorLabel.call(form.find('[name="' + key + '"]'), value, 0);

        });

    }

    function captchaHandler(response) {

        this.find('[name*="captcha"]').val('');
        this.find('img').attr('src', response.captchaImg);

        if (!response.captcha && typeof response.captcha !== 'undefined') {

            formNotifications.showErrorLabel.call(this, forms.msg.captcha, 0);

        }

    }

    function redirect(settings) {

        var seconds = settings.timer / 1000,
            $counter = $(settings.counter).text(seconds),

            withCounting = $counter.length && !!settings.timer,
            timeout = setTimeout(withCounting ? countdown : redirect, withCounting ? 1000 : !!settings.timer ? settings.timer : 100);

        function countdown() {

            $counter[0].innerHTML--;

            if ($counter[0].innerHTML === 0) {

                redirect();
                clearTimeout(timeout);

            } else {

                setTimeout(countdown, 1000);

            }

        }

        function redirect() {

            window.location = settings.url;

        }

    }

    return {
        response: response
    };

})(window);

