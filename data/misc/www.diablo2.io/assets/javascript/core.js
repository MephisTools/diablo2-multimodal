var phpbb = {};
phpbb.alertTime = 100;
(function($) {
    'use strict';
    var keymap = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        ARROW_UP: 38,
        ARROW_DOWN: 40
    };
    var $dark = $('#darkenwrapper');
    var $loadingIndicator;
    var phpbbAlertTimer = null;
    phpbb.isTouch = (window && typeof window.ontouchstart !== 'undefined');
    $.ajaxPrefilter(function(s) {
        if (s.crossDomain) {
            s.contents.script = false;
        }
    });
    phpbb.loadingIndicator = function() {
        if (!$loadingIndicator) {
            $loadingIndicator = $('<div />', {
                'id': 'loading_indicator',
                'class': 'loading_indicator'
            });
            $loadingIndicator.appendTo('#page-footer');
        }
        if (!$loadingIndicator.is(':visible')) {
            $loadingIndicator.fadeIn(phpbb.alertTime);
            phpbb.clearLoadingTimeout();
            phpbbAlertTimer = setTimeout(function() {
                phpbb.showTimeoutMessage();
            }, 60000);
        }
        return $loadingIndicator;
    };
    phpbb.showTimeoutMessage = function() {
        var $alert = $('#phpbb_alert');
        if ($loadingIndicator.is(':visible')) {
            phpbb.alert($alert.attr('data-l-err'), $alert.attr('data-l-timeout-processing-req'));
        }
    };
    phpbb.clearLoadingTimeout = function() {
        if (phpbbAlertTimer !== null) {
            clearTimeout(phpbbAlertTimer);
            phpbbAlertTimer = null;
        }
    };
    phpbb.closeDarkenWrapper = function(delay) {
        phpbbAlertTimer = setTimeout(function() {
            $('#darkenwrapper').trigger('click');
        }, delay);
    };
    phpbb.alert = function(title, msg) {
        var $alert = $('#phpbb_alert');
        $alert.find('.alert_title').html(title);
        $alert.find('.alert_text').html(msg);
        $(document).on('keydown.phpbb.alert', function(e) {
            if (e.keyCode === keymap.ENTER || e.keyCode === keymap.ESC) {
                phpbb.alert.close($alert, true);
                e.preventDefault();
                e.stopPropagation();
            }
        });
        phpbb.alert.open($alert);
        return $alert;
    };
    phpbb.alert.open = function($alert) {
        if (!$dark.is(':visible')) {
            $dark.fadeIn(phpbb.alertTime);
        }
        if ($loadingIndicator && $loadingIndicator.is(':visible')) {
            $loadingIndicator.fadeOut(phpbb.alertTime, function() {
                $dark.append($alert);
                $alert.fadeIn(phpbb.alertTime);
            });
        } else if ($dark.is(':visible')) {
            $dark.append($alert);
            $alert.fadeIn(phpbb.alertTime);
        } else {
            $dark.append($alert);
            $alert.show();
            $dark.fadeIn(phpbb.alertTime);
        }
        $alert.on('click', function(e) {
            e.stopPropagation();
        });
        $dark.one('click', function(e) {
            phpbb.alert.close($alert, true);
            e.preventDefault();
            e.stopPropagation();
        });
        $alert.find('.alert_close').one('click', function(e) {
            phpbb.alert.close($alert, true);
            e.preventDefault();
        });
    };
    phpbb.alert.close = function($alert, fadedark) {
        var $fade = (fadedark) ? $dark : $alert;
        $fade.fadeOut(phpbb.alertTime, function() {
            $alert.hide();
        });
        $alert.find('.alert_close').off('click');
        $(document).off('keydown.phpbb.alert');
    };
    phpbb.confirm = function(msg, callback, fadedark) {
        var $confirmDiv = $('#phpbb_confirm');
        $confirmDiv.find('.alert_text').html(msg);
        fadedark = typeof fadedark !== 'undefined' ? fadedark : true;
        $(document).on('keydown.phpbb.alert', function(e) {
            if (e.keyCode === keymap.ENTER || e.keyCode === keymap.ESC) {
                var name = (e.keyCode === keymap.ENTER) ? 'confirm' : 'cancel';
                $('input[name="' + name + '"]').trigger('click');
                e.preventDefault();
                e.stopPropagation();
            }
        });
        $confirmDiv.find('input[type="button"]').one('click.phpbb.confirmbox', function(e) {
            var confirmed = this.name === 'confirm';
            callback(confirmed);
            $confirmDiv.find('input[type="button"]').off('click.phpbb.confirmbox');
            phpbb.alert.close($confirmDiv, fadedark || !confirmed);
            e.preventDefault();
            e.stopPropagation();
        });
        phpbb.alert.open($confirmDiv);
        return $confirmDiv;
    };
    phpbb.parseQuerystring = function(string) {
        var params = {},
            i, split;
        string = string.split('&');
        for (i = 0; i < string.length; i++) {
            split = string[i].split('=');
            params[split[0]] = decodeURIComponent(split[1]);
        }
        return params;
    };
    phpbb.ajaxify = function(options) {
        var $elements = $(options.selector),
            refresh = options.refresh,
            callback = options.callback,
            overlay = (typeof options.overlay !== 'undefined') ? options.overlay : true,
            isForm = $elements.is('form'),
            isText = $elements.is('input[type="text"], textarea'),
            eventName;
        if (isForm) {
            eventName = 'submit';
        } else if (isText) {
            eventName = 'keyup';
        } else {
            eventName = 'click';
        }
        $elements.on(eventName, function(event) {
            var action, method, data, submit, that = this,
                $this = $(this);
            if ($this.find('input[type="submit"][data-clicked]').attr('data-ajax') === 'false') {
                return;
            }

            function errorHandler(jqXHR, textStatus, errorThrown) {
                if (typeof console !== 'undefined' && console.log) {
                    console.log('AJAX error. status: ' + textStatus + ', message: ' + errorThrown);
                }
                phpbb.clearLoadingTimeout();
                var responseText, errorText = false;
                try {
                    responseText = JSON.parse(jqXHR.responseText);
                    responseText = responseText.message;
                } catch (e) {}
                if (typeof responseText === 'string' && responseText.length > 0) {
                    errorText = responseText;
                } else if (typeof errorThrown === 'string' && errorThrown.length > 0) {
                    errorText = errorThrown;
                } else {
                    errorText = $dark.attr('data-ajax-error-text-' + textStatus);
                    if (typeof errorText !== 'string' || !errorText.length) {
                        errorText = $dark.attr('data-ajax-error-text');
                    }
                }
                phpbb.alert($dark.attr('data-ajax-error-title'), errorText);
            }

            function returnHandler(res) {
                var alert;
                phpbb.clearLoadingTimeout();
                if (typeof res.S_CONFIRM_ACTION === 'undefined') {
                    if (typeof res.MESSAGE_TITLE !== 'undefined') {
                        alert = phpbb.alert(res.MESSAGE_TITLE, res.MESSAGE_TEXT);
                    } else {
                        $dark.fadeOut(phpbb.alertTime);
                        if ($loadingIndicator) {
                            $loadingIndicator.fadeOut(phpbb.alertTime);
                        }
                    }
                    if (typeof phpbb.ajaxCallbacks[callback] === 'function') {
                        phpbb.ajaxCallbacks[callback].call(that, res);
                    }
                    if (res.REFRESH_DATA) {
                        if (typeof refresh === 'function') {
                            refresh = refresh(res.REFRESH_DATA.url);
                        } else if (typeof refresh !== 'boolean') {
                            refresh = false;
                        }
                        phpbbAlertTimer = setTimeout(function() {
                            if (refresh) {
                                window.location = res.REFRESH_DATA.url;
                            }
                            $dark.fadeOut(phpbb.alertTime, function() {
                                if (typeof alert !== 'undefined') {
                                    alert.hide();
                                }
                            });
                        }, res.REFRESH_DATA.time * 1000);
                    }
                } else {
                    phpbb.confirm(res.MESSAGE_BODY, function(del) {
                        if (!del) {
                            return;
                        }
                        phpbb.loadingIndicator();
                        data = $('<form>' + res.S_HIDDEN_FIELDS + '</form>').serialize();
                        $.ajax({
                            url: res.S_CONFIRM_ACTION,
                            type: 'POST',
                            data: data + '&confirm=' + res.YES_VALUE + '&' + $('form', '#phpbb_confirm').serialize(),
                            success: returnHandler,
                            error: errorHandler
                        });
                    }, false);
                }
            }
            var runFilter = (typeof options.filter === 'function');
            data = {};
            if (isForm) {
                action = $this.attr('action').replace('&amp;', '&');
                data = $this.serializeArray();
                method = $this.attr('method') || 'GET';
                if ($this.find('input[type="submit"][data-clicked]')) {
                    submit = $this.find('input[type="submit"][data-clicked]');
                    data.push({
                        name: submit.attr('name'),
                        value: submit.val()
                    });
                }
            } else if (isText) {
                var name = $this.attr('data-name') || this.name;
                action = $this.attr('data-url').replace('&amp;', '&');
                data[name] = this.value;
                method = 'POST';
            } else {
                action = this.href;
                data = null;
                method = 'GET';
            }
            var sendRequest = function() {
                var dataOverlay = $this.attr('data-overlay');
                if (overlay && (typeof dataOverlay === 'undefined' || dataOverlay === 'true')) {
                    phpbb.loadingIndicator();
                }
                var request = $.ajax({
                    url: action,
                    type: method,
                    data: data,
                    success: returnHandler,
                    error: errorHandler,
                    cache: false
                });
                request.always(function() {
                    if ($loadingIndicator && $loadingIndicator.is(':visible')) {
                        $loadingIndicator.fadeOut(phpbb.alertTime);
                    }
                });
            };
            if (runFilter && !options.filter.call(this, data, event, sendRequest)) {
                return;
            }
            sendRequest();
            event.preventDefault();
        });
        if (isForm) {
            $elements.find('input:submit').click(function() {
                var $this = $(this);
                $this.parents('form:first').find('input:submit[data-clicked]').removeAttr('data-clicked');
                $this.attr('data-clicked', 'true');
            });
        }
        return this;
    };
    phpbb.search = {
        cache: {
            data: []
        },
        tpl: [],
        container: []
    };
    phpbb.search.cache.get = function(id) {
        if (this.data[id]) {
            return this.data[id];
        }
        return false;
    };
    phpbb.search.cache.set = function(id, key, value) {
        if (!this.data[id]) {
            this.data[id] = {
                results: []
            };
        }
        this.data[id][key] = value;
    };
    phpbb.search.cache.setResults = function(id, keyword, results) {
        this.data[id].results[keyword] = results;
    };
    phpbb.search.cleanKeyword = function(keyword) {
        return $.trim(keyword).toLowerCase();
    };
    phpbb.search.getKeyword = function($input, keyword, multiline) {
        if (multiline) {
            var line = phpbb.search.getKeywordLine($input);
            keyword = keyword.split('\n').splice(line, 1);
        }
        return phpbb.search.cleanKeyword(keyword);
    };
    phpbb.search.getKeywordLine = function($textarea) {
        var selectionStart = $textarea.get(0).selectionStart;
        return $textarea.val().substr(0, selectionStart).split('\n').length - 1;
    };
    phpbb.search.setValue = function($input, value, multiline) {
        if (multiline) {
            var line = phpbb.search.getKeywordLine($input),
                lines = $input.val().split('\n');
            lines[line] = value;
            value = lines.join('\n');
        }
        $input.val(value);
    };
    phpbb.search.setValueOnClick = function($input, value, $row, $container) {
        $row.click(function() {
            phpbb.search.setValue($input, value.result, $input.attr('data-multiline'));
            phpbb.search.closeResults($input, $container);
        });
    };
    phpbb.search.filter = function(data, event, sendRequest) {
        var $this = $(this),
            dataName = ($this.attr('data-name') !== undefined) ? $this.attr('data-name') : $this.attr('name'),
            minLength = parseInt($this.attr('data-min-length'), 10),
            searchID = $this.attr('data-results'),
            keyword = phpbb.search.getKeyword($this, data[dataName], $this.attr('data-multiline')),
            cache = phpbb.search.cache.get(searchID),
            key = event.keyCode || event.which,
            proceed = true;
        data[dataName] = keyword;
        if (key === keymap.ENTER) {
            return false;
        }
        if (cache.timeout) {
            clearTimeout(cache.timeout);
        }
        var timeout = setTimeout(function() {
            if (minLength > keyword.length) {
                proceed = false;
            } else if (cache.lastSearch) {
                if (cache.lastSearch === keyword) {
                    proceed = false;
                } else {
                    if (cache.results[keyword]) {
                        var response = {
                            keyword: keyword,
                            results: cache.results[keyword]
                        };
                        phpbb.search.handleResponse(response, $this, true);
                        proceed = false;
                    }
                    if (keyword.indexOf(cache.lastSearch) === 0 && cache.results[cache.lastSearch].length === 0) {
                        phpbb.search.cache.set(searchID, 'lastSearch', keyword);
                        phpbb.search.cache.setResults(searchID, keyword, []);
                        proceed = false;
                    }
                }
            }
            if (proceed) {
                sendRequest.call(this);
            }
        }, 350);
        phpbb.search.cache.set(searchID, 'timeout', timeout);
        return false;
    };
    phpbb.search.handleResponse = function(res, $input, fromCache, callback) {
        if (typeof res !== 'object') {
            return;
        }
        var searchID = $input.attr('data-results'),
            $container = $(searchID);
        if (this.cache.get(searchID).callback) {
            callback = this.cache.get(searchID).callback;
        } else if (typeof callback === 'function') {
            this.cache.set(searchID, 'callback', callback);
        }
        if (!fromCache) {
            this.cache.setResults(searchID, res.keyword, res.results);
        }
        this.cache.set(searchID, 'lastSearch', res.keyword);
        this.showResults(res.results, $input, $container, callback);
    };
    phpbb.search.showResults = function(results, $input, $container, callback) {
        var $resultContainer = $('.search-results', $container);
        this.clearResults($resultContainer);
        if (!results.length) {
            $container.hide();
            return;
        }
        var searchID = $container.attr('id'),
            tpl, row;
        if (!this.tpl[searchID]) {
            tpl = $('.search-result-tpl', $container);
            this.tpl[searchID] = tpl.clone().removeClass('search-result-tpl');
            tpl.remove();
        }
        tpl = this.tpl[searchID];
        $.each(results, function(i, item) {
            row = tpl.clone();
            row.find('.search-result').html(item.display);
            if (typeof callback === 'function') {
                callback.call(this, $input, item, row, $container);
            }
            row.appendTo($resultContainer).show();
        });
        $container.show();
        phpbb.search.navigateResults($input, $container, $resultContainer);
    };
    phpbb.search.clearResults = function($container) {
        $container.children(':not(.search-result-tpl)').remove();
    };
    phpbb.search.closeResults = function($input, $container) {
        $input.off('.phpbb.search');
        $container.hide();
    };
    phpbb.search.navigateResults = function($input, $container, $resultContainer) {
        $input.off('.phpbb.search');
        $input.on('keydown.phpbb.search', function(event) {
            var key = event.keyCode || event.which,
                $active = $resultContainer.children('.active');
            switch (key) {
                case keymap.ESC:
                    phpbb.search.closeResults($input, $container);
                    break;
                case keymap.ENTER:
                    if ($active.length) {
                        var value = $active.find('.search-result > span').text();
                        phpbb.search.setValue($input, value, $input.attr('data-multiline'));
                    }
                    phpbb.search.closeResults($input, $container);
                    event.preventDefault();
                    break;
                case keymap.ARROW_DOWN:
                case keymap.ARROW_UP:
                    var up = key === keymap.ARROW_UP,
                        $children = $resultContainer.children();
                    if (!$active.length) {
                        if (up) {
                            $children.last().addClass('active');
                        } else {
                            $children.first().addClass('active');
                        }
                    } else if ($children.length > 1) {
                        if (up) {
                            if ($active.is(':first-child')) {
                                $children.last().addClass('active');
                            } else {
                                $active.prev().addClass('active');
                            }
                        } else {
                            if ($active.is(':last-child')) {
                                $children.first().addClass('active');
                            } else {
                                $active.next().addClass('active');
                            }
                        }
                        $active.removeClass('active');
                    }
                    event.preventDefault();
                    break;
            }
        });
    };
    $('#phpbb').click(function() {
        var $this = $(this);
        if (!$this.is('.live-search') && !$this.parents().is('.live-search')) {
            phpbb.search.closeResults($('input, textarea'), $('.live-search'));
        }
    });
    phpbb.history = {};
    phpbb.history.isSupported = function(fn) {
        return !(typeof history === 'undefined' || typeof history[fn] === 'undefined');
    };
    phpbb.history.alterUrl = function(mode, url, title, obj) {
        var fn = mode + 'State';
        if (!url || !phpbb.history.isSupported(fn)) {
            return;
        }
        if (!title) {
            title = document.title;
        }
        if (!obj) {
            obj = null;
        }
        history[fn](obj, title, url);
    };
    phpbb.history.replaceUrl = function(url, title, obj) {
        phpbb.history.alterUrl('replace', url, title, obj);
    };
    phpbb.history.pushUrl = function(url, title, obj) {
        phpbb.history.alterUrl('push', url, title, obj);
    };
    phpbb.timezoneSwitchDate = function(keepSelection) {
        var $timezoneCopy = $('#timezone_copy');
        var $timezone = $('#timezone');
        var $tzDate = $('#tz_date');
        var $tzSelectDateSuggest = $('#tz_select_date_suggest');
        if ($timezoneCopy.length === 0) {
            $timezone.clone().attr('id', 'timezone_copy').css('display', 'none').attr('name', 'tz_copy').insertAfter('#timezone');
        } else {
            $timezone.html($timezoneCopy.html());
        }
        if ($tzDate.val() !== '') {
            $timezone.children('optgroup').remove(':not([data-tz-value="' + $tzDate.val() + '"])');
        }
        if ($tzDate.val() === $tzSelectDateSuggest.attr('data-suggested-tz')) {
            $tzSelectDateSuggest.css('display', 'none');
        } else {
            $tzSelectDateSuggest.css('display', 'inline');
        }
        var $tzOptions = $timezone.children('optgroup[data-tz-value="' + $tzDate.val() + '"]').children('option');
        if ($tzOptions.length === 1) {
            $tzOptions.prop('selected', true);
            keepSelection = true;
        }
        if (typeof keepSelection !== 'undefined' && !keepSelection) {
            var $timezoneOptions = $timezone.find('optgroup option');
            if ($timezoneOptions.filter(':selected').length <= 0) {
                $timezoneOptions.filter(':first').prop('selected', true);
            }
        }
    };
    phpbb.timezoneEnableDateSelection = function() {
        $('#tz_select_date').css('display', 'block');
    };
    phpbb.timezonePreselectSelect = function(forceSelector) {
        var offset = (new Date()).getTimezoneOffset();
        var sign = '-';
        if (offset < 0) {
            sign = '+';
            offset = -offset;
        }
        var minutes = offset % 60;
        var hours = (offset - minutes) / 60;
        if (hours === 0) {
            hours = '00';
            sign = '+';
        } else if (hours < 10) {
            hours = '0' + hours.toString();
        } else {
            hours = hours.toString();
        }
        if (minutes < 10) {
            minutes = '0' + minutes.toString();
        } else {
            minutes = minutes.toString();
        }
        var prefix = 'UTC' + sign + hours + ':' + minutes;
        var prefixLength = prefix.length;
        var selectorOptions = $('option', '#tz_date');
        var i;
        var $tzSelectDateSuggest = $('#tz_select_date_suggest');
        for (i = 0; i < selectorOptions.length; ++i) {
            var option = selectorOptions[i];
            if (option.value.substring(0, prefixLength) === prefix) {
                if ($('#tz_date').val() !== option.value && !forceSelector) {
                    phpbb.timezoneSwitchDate(true);
                    $tzSelectDateSuggest.css('display', 'inline');
                } else {
                    option.selected = true;
                    phpbb.timezoneSwitchDate(!forceSelector);
                    $tzSelectDateSuggest.css('display', 'none');
                }
                var suggestion = $tzSelectDateSuggest.attr('data-l-suggestion');
                $tzSelectDateSuggest.attr('title', suggestion.replace('%s', option.innerHTML));
                $tzSelectDateSuggest.attr('value', suggestion.replace('%s', option.innerHTML.substring(0, 9)));
                $tzSelectDateSuggest.attr('data-suggested-tz', option.innerHTML);
                return;
            }
        }
    };
    phpbb.ajaxCallbacks = {};
    phpbb.addAjaxCallback = function(id, callback) {
        if (typeof callback === 'function') {
            phpbb.ajaxCallbacks[id] = callback;
        }
        return this;
    };
    phpbb.addAjaxCallback('member_search', function(res) {
        phpbb.search.handleResponse(res, $(this), false, phpbb.getFunctionByName('phpbb.search.setValueOnClick'));
    });
    phpbb.addAjaxCallback('alt_text', function() {
        var $anchor, updateAll = $(this).data('update-all'),
            altText;
        if (updateAll !== undefined && updateAll.length) {
            $anchor = $(updateAll);
        } else {
            $anchor = $(this);
        }
        $anchor.each(function() {
            var $this = $(this);
            altText = $this.attr('data-alt-text');
            $this.attr('data-alt-text', $.trim($this.text()));
            $this.attr('title', altText);
            $this.children('span').text(altText);
        });
    });
    phpbb.addAjaxCallback('toggle_link', function() {
        var $anchor, updateAll = $(this).data('update-all'),
            toggleText, toggleUrl, toggleClass;
        if (updateAll !== undefined && updateAll.length) {
            $anchor = $(updateAll);
        } else {
            $anchor = $(this);
        }
        $anchor.each(function() {
            var $this = $(this);
            toggleUrl = $this.attr('data-toggle-url');
            $this.attr('data-toggle-url', $this.attr('href'));
            $this.attr('href', toggleUrl);
            toggleClass = $this.attr('data-toggle-class');
            $this.attr('data-toggle-class', $this.children().attr('class'));
            $this.children('.icon').attr('class', toggleClass);
            toggleText = $this.attr('data-toggle-text');
            $this.attr('data-toggle-text', $this.children('span').text());
            $this.attr('title', $.trim(toggleText));
            $this.children('span').text(toggleText);
        });
    });
    phpbb.resizeTextArea = function($items, options) {
        var configuration = {
            minWindowHeight: 500,
            minHeight: 200,
            maxHeight: 500,
            heightDiff: 200,
            resizeCallback: function() {},
            resetCallback: function() {}
        };
        if (phpbb.isTouch) {
            return;
        }
        if (arguments.length > 1) {
            configuration = $.extend(configuration, options);
        }

        function resetAutoResize(item) {
            var $item = $(item);
            if ($item.hasClass('auto-resized')) {
                $(item).css({
                    height: '',
                    resize: ''
                }).removeClass('auto-resized');
                configuration.resetCallback.call(item, $item);
            }
        }

        function autoResize(item) {
            function setHeight(height) {
                height += parseInt($item.css('height'), 10) - $item.innerHeight();
                $item.css({
                    height: height + 'px',
                    resize: 'none'
                }).addClass('auto-resized');
                configuration.resizeCallback.call(item, $item);
            }
            var windowHeight = $(window).height();
            if (windowHeight < configuration.minWindowHeight) {
                resetAutoResize(item);
                return;
            }
            var maxHeight = Math.min(Math.max(windowHeight - configuration.heightDiff, configuration.minHeight), configuration.maxHeight),
                $item = $(item),
                height = parseInt($item.innerHeight(), 10),
                scrollHeight = (item.scrollHeight) ? item.scrollHeight : 0;
            if (height < 0) {
                return;
            }
            if (height > maxHeight) {
                setHeight(maxHeight);
            } else if (scrollHeight > (height + 5)) {
                setHeight(Math.min(maxHeight, scrollHeight));
            }
        }
    };
    phpbb.inBBCodeTag = function(textarea, startTags, endTags) {
        var start = textarea.selectionStart,
            lastEnd = -1,
            lastStart = -1,
            i, index, value;
        if (typeof start !== 'number') {
            return false;
        }
        value = textarea.value.toLowerCase();
        for (i = 0; i < startTags.length; i++) {
            var tagLength = startTags[i].length;
            if (start >= tagLength) {
                index = value.lastIndexOf(startTags[i], start - tagLength);
                lastStart = Math.max(lastStart, index);
            }
        }
        if (lastStart === -1) {
            return false;
        }
        if (start > 0) {
            for (i = 0; i < endTags.length; i++) {
                index = value.lastIndexOf(endTags[i], start - 1);
                lastEnd = Math.max(lastEnd, index);
            }
        }
        return (lastEnd < lastStart);
    };
    phpbb.applyCodeEditor = function(textarea) {
        var startTags = ['[code]', '[code='],
            startTagsEnd = ']',
            endTags = ['[/code]'];
        if (!textarea || typeof textarea.selectionStart !== 'number') {
            return;
        }
        if ($(textarea).data('code-editor') === true) {
            return;
        }

        function inTag() {
            return phpbb.inBBCodeTag(textarea, startTags, endTags);
        }

        function getLastLine(stripCodeStart) {
            var start = textarea.selectionStart,
                value = textarea.value,
                index = value.lastIndexOf('\n', start - 1);
            value = value.substring(index + 1, start);
            if (stripCodeStart) {
                for (var i = 0; i < startTags.length; i++) {
                    index = value.lastIndexOf(startTags[i]);
                    if (index >= 0) {
                        var tagLength = startTags[i].length;
                        value = value.substring(index + tagLength);
                        if (startTags[i].lastIndexOf(startTagsEnd) !== tagLength) {
                            index = value.indexOf(startTagsEnd);
                            if (index >= 0) {
                                value = value.substr(index + 1);
                            }
                        }
                    }
                }
            }
            return value;
        }

        function appendText(text) {
            var start = textarea.selectionStart,
                end = textarea.selectionEnd,
                value = textarea.value;
            textarea.value = value.substr(0, start) + text + value.substr(end);
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
        }
        $(textarea).data('code-editor', true).on('keydown', function(event) {
            var key = event.keyCode || event.which;
            if (key === keymap.TAB && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
                if (inTag()) {
                    appendText('\t');
                    event.preventDefault();
                    return;
                }
            }
            if (key === keymap.ENTER) {
                if (inTag()) {
                    var lastLine = getLastLine(true),
                        code = '' + /^\s*/g.exec(lastLine);
                    if (code.length > 0) {
                        appendText('\n' + code);
                        event.preventDefault();
                    }
                }
            }
        });
    };
    phpbb.showDragNDrop = function(textarea) {
        if (!textarea) {
            return;
        }
        $('body').on('dragenter dragover', function() {
            $(textarea).addClass('drag-n-drop');
            $('.z-attach-tab').addClass('is-checked');
            $('.z-attach-panel').addClass('z-shown');
        }).on('dragleave dragout dragend drop', function() {
            $(textarea).removeClass('drag-n-drop');
        });
        $(textarea).on('dragenter dragover', function() {
            $(textarea).addClass('drag-n-drop-highlight');
        }).on('dragleave dragout dragend drop', function() {
            $(textarea).removeClass('drag-n-drop-highlight');
        });
    };
    phpbb.dropdownHandles = '.dropdown-container.dropdown-visible .dropdown-toggle';
    phpbb.dropdownVisibleContainers = '.dropdown-container.dropdown-visible';
    phpbb.toggleDropdown = function() {
        var $this = $(this),
            options = $this.data('dropdown-options'),
            parent = options.parent,
            visible = parent.hasClass('dropdown-visible'),
            direction;
        if (!visible) {
            $(phpbb.dropdownHandles).each(phpbb.toggleDropdown);
            direction = options.direction;
            var verticalDirection = options.verticalDirection,
                offset = $this.offset();
            if (direction === 'auto') {
                if (($(window).width() - $this.outerWidth(true)) / 2 > offset.left) {
                    direction = 'right';
                } else {
                    direction = 'left';
                }
            }
            parent.toggleClass(options.leftClass, direction === 'left').toggleClass(options.rightClass, direction === 'right');
            if (verticalDirection === 'auto') {
                var height = $(window).height(),
                    top = offset.top - $(window).scrollTop();
                verticalDirection = (top < height * 0.7) ? 'down' : 'up';
            }
            parent.toggleClass(options.upClass, verticalDirection === 'up').toggleClass(options.downClass, verticalDirection === 'down');
        }
        options.dropdown.toggle();
        parent.toggleClass(options.visibleClass, !visible).toggleClass('dropdown-visible', !visible);
        if (!visible) {
            var windowWidth = $(window).width();
            options.dropdown.find('.dropdown-contents').each(function() {
                var $this = $(this);
                $this.css({
                    marginLeft: 0,
                    left: 0,
                    marginRight: 0,
                    maxWidth: (windowWidth - 4) + 'px'
                });
                var offset = $this.offset().left,
                    width = $this.outerWidth(true);
                if (offset < 2) {
                    $this.css('left', (2 - offset) + 'px');
                } else if ((offset + width + 2) > windowWidth) {
                    $this.css('margin-left', (windowWidth - offset - width - 2) + 'px');
                }
                $this.toggleClass('dropdown-nonscroll', this.scrollHeight === $this.innerHeight());
            });
            var freeSpace = parent.offset().left - 4;
            if (direction === 'left') {
                options.dropdown.css('margin-left', '-' + freeSpace + 'px');
                if (options.dropdown.hasClass('dropdown-extended')) {
                    var contentWidth, fullFreeSpace = freeSpace + parent.outerWidth();
                    options.dropdown.find('.dropdown-contents').each(function() {
                        contentWidth = parseInt($(this).outerWidth(), 10);
                        $(this).css({
                            marginLeft: 0,
                            left: 0
                        });
                    });
                    var maxOffset = Math.min(contentWidth, fullFreeSpace) + 'px';
                    options.dropdown.css({
                        width: maxOffset,
                        marginLeft: -maxOffset
                    });
                }
            } else {
                options.dropdown.css('margin-right', '-' + (windowWidth + freeSpace) + 'px');
            }
        }
        if (arguments.length > 0) {
            try {
                var e = arguments[0];
                e.preventDefault();
                e.stopPropagation();
            } catch (error) {}
        }
        return false;
    };
    phpbb.toggleSubmenu = function(e) {
        $(this).siblings('.dropdown-submenu').toggle();
        e.preventDefault();
    };
    phpbb.registerDropdown = function(toggle, dropdown, options) {
        var ops = {
            parent: toggle.parent(),
            direction: 'auto',
            verticalDirection: 'auto',
            visibleClass: 'visible',
            leftClass: 'dropdown-left',
            rightClass: 'dropdown-right',
            upClass: 'dropdown-up',
            downClass: 'dropdown-down'
        };
        if (options) {
            ops = $.extend(ops, options);
        }
        ops.dropdown = dropdown;
        ops.parent.addClass('dropdown-container');
        toggle.addClass('dropdown-toggle');
        toggle.data('dropdown-options', ops);
        toggle.click(phpbb.toggleDropdown);
        $('.dropdown-toggle-submenu', ops.parent).click(phpbb.toggleSubmenu);
    };
    phpbb.colorPalette = function(dir, width, height) {
        var r, g, b, numberList = new Array(6),
            color = '',
            html = '';
        numberList[0] = '00';
        numberList[1] = '40';
        numberList[2] = '80';
        numberList[3] = 'BF';
        numberList[4] = 'FF';
        var tableClass = (dir === 'h') ? 'horizontal-palette' : 'vertical-palette';
        html += '<table class="not-responsive colour-palette ' + tableClass + '" style="width: auto;">';
        for (r = 0; r < 5; r++) {
            if (dir === 'h') {
                html += '<tr>';
            }
            for (g = 0; g < 5; g++) {
                if (dir === 'v') {
                    html += '<tr>';
                }
                for (b = 0; b < 5; b++) {
                    color = '' + numberList[r] + numberList[g] + numberList[b];
                    html += '<td style="background-color: #' + color + '; width: ' + width + 'px; height: ' +
                        height + 'px;"><a href="#" data-color="' + color + '" style="display: block; width: ' +
                        width + 'px; height: ' + height + 'px; " alt="#' + color + '" title="#' + color + '"></a>';
                    html += '</td>';
                }
                if (dir === 'v') {
                    html += '</tr>';
                }
            }
            if (dir === 'h') {
                html += '</tr>';
            }
        }
        html += '</table>';
        return html;
    };
    phpbb.registerPalette = function(el) {
        var orientation = el.attr('data-color-palette') || el.attr('data-orientation'),
            height = el.attr('data-height'),
            width = el.attr('data-width'),
            target = el.attr('data-target'),
            bbcode = el.attr('data-bbcode');
        el.html(phpbb.colorPalette(orientation, width, height));
        $('#color_palette_toggle').click(function(e) {
            el.toggle();
            e.preventDefault();
        });
        $(el).on('click', 'a', function(e) {
            var color = $(this).attr('data-color');
            if (bbcode) {
                bbfontstyle('[color=#' + color + ']', '[/color]');
            } else {
                $(target).val(color);
            }
            e.preventDefault();
        });
    };
    phpbb.toggleDisplay = function(id, action, type) {
        if (!type) {
            type = 'block';
        }
        var $element = $('#' + id);
        var display = $element.css('display');
        if (!action) {
            action = (display === '' || display === type) ? -1 : 1;
        }
        $element.css('display', ((action === 1) ? type : 'none'));
    };
    phpbb.toggleSelectSettings = function(el) {
        el.children().each(function() {
            var $this = $(this),
                $setting = $($this.data('toggle-setting'));
            $setting.toggle($this.is(':selected'));
            if ($this.is(':selected')) {
                $($this.data('toggle-setting') + ' input').prop('disabled', false);
            } else {
                $($this.data('toggle-setting') + ' input').prop('disabled', true);
            }
        });
    };
    phpbb.getFunctionByName = function(functionName) {
        var namespaces = functionName.split('.'),
            func = namespaces.pop(),
            context = window;
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func];
    };
    phpbb.registerPageDropdowns = function() {
        var $body = $('body');
        $body.find('.dropdown-container').each(function() {
            var $this = $(this),
                $trigger = $this.find('.dropdown-trigger:first'),
                $contents = $this.find('.dropdown'),
                options = {
                    direction: 'auto',
                    verticalDirection: 'auto'
                },
                data;
            if (!$trigger.length) {
                data = $this.attr('data-dropdown-trigger');
                $trigger = data ? $this.children(data) : $this.children('a:first');
            }
            if (!$contents.length) {
                data = $this.attr('data-dropdown-contents');
                $contents = data ? $this.children(data) : $this.children('div:first');
            }
            if (!$trigger.length || !$contents.length) {
                return;
            }
            if ($this.hasClass('dropdown-up')) {
                options.verticalDirection = 'up';
            }
            if ($this.hasClass('dropdown-down')) {
                options.verticalDirection = 'down';
            }
            if ($this.hasClass('dropdown-left')) {
                options.direction = 'left';
            }
            if ($this.hasClass('dropdown-right')) {
                options.direction = 'right';
            }
            phpbb.registerDropdown($trigger, $contents, options);
        });
        $body.click(function(e) {
            var $parents = $(e.target).parents();
            if (!$parents.is(phpbb.dropdownVisibleContainers)) {
                $(phpbb.dropdownHandles).each(phpbb.toggleDropdown);
            }
        });
    };
    phpbb.lazyLoadAvatars = function loadAvatars() {
        $('.avatar[data-src]').each(function() {
            var $avatar = $(this);
            $avatar.attr('src', $avatar.data('src')).removeAttr('data-src');
        });
    };
    phpbb.recaptcha = {
        button: null,
        ready: false,
        token: $('input[name="recaptcha_token"]'),
        form: $('.g-recaptcha').parents('form'),
        v3: $('[data-recaptcha-v3]'),
        load: function() {
            phpbb.recaptcha.bindButton();
            phpbb.recaptcha.bindForm();
        },
        bindButton: function() {
            phpbb.recaptcha.form.find('input[type="submit"]').on('click', function() {
                phpbb.recaptcha.button = this;
            });
        },
        bindForm: function() {
            phpbb.recaptcha.form.on('submit', function(e) {
                if (!phpbb.recaptcha.ready) {
                    if (phpbb.recaptcha.v3.length) {
                        grecaptcha.execute(phpbb.recaptcha.v3.data('recaptcha-v3'), {
                            action: phpbb.recaptcha.v3.val()
                        }).then(function(token) {
                            phpbb.recaptcha.token.val(token);
                            phpbb.recaptcha.submitForm();
                        });
                    } else {
                        grecaptcha.execute();
                    }
                    e.preventDefault();
                }
            });
        },
        submitForm: function() {
            phpbb.recaptcha.ready = true;
            if (phpbb.recaptcha.button) {
                phpbb.recaptcha.button.click();
            } else {
                if (typeof phpbb.recaptcha.form.submit !== 'function') {
                    phpbb.recaptcha.form.submit.name = 'submit_btn';
                }
                phpbb.recaptcha.form.submit();
            }
        }
    };
    window.phpbbRecaptchaOnLoad = function() {
        phpbb.recaptcha.load();
    };
    window.phpbbRecaptchaOnSubmit = function() {
        phpbb.recaptcha.submitForm();
    };
    $(window).on('load', phpbb.lazyLoadAvatars);
    $(function() {
        if (phpbb.recaptcha.v3.length) {
            phpbb.recaptcha.load();
        }
        $('textarea[data-bbcode]').each(function() {
            phpbb.applyCodeEditor(this);
        });
        phpbb.registerPageDropdowns();
        $('[data-color-palette], [data-orientation]').each(function() {
            phpbb.registerPalette($(this));
        });
        phpbb.history.replaceUrl($('#unread[data-url]').data('url'));
        $('select[data-togglable-settings]').each(function() {
            var $this = $(this);
            $this.change(function() {
                phpbb.toggleSelectSettings($this);
            });
            phpbb.toggleSelectSettings($this);
        });
    });
})(jQuery);