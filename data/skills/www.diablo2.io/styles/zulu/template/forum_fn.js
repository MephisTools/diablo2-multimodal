function find_username(url) {
    'use strict';
    popup(url, 760, 570, '_usersearch');
    return false;
}

function popup(url, width, height, name) {
    'use strict';
    if (!name) {
        name = '_popup';
    }
    window.open(url.replace(/&amp;/g, '&'), name, 'height=' + height + ',resizable=yes,scrollbars=yes, width=' + width);
    return false;
}

function pageJump(item) {
    'use strict';
    var page = parseInt(item.val(), 10),
        perPage = item.attr('data-per-page'),
        baseUrl = item.attr('data-base-url'),
        startName = item.attr('data-start-name');
    if (page !== null && !isNaN(page) && page === Math.floor(page) && page > 0) {
        if (baseUrl.indexOf('?') === -1) {
            document.location.href = baseUrl + '?' + startName + '=' + ((page - 1) * perPage);
        } else {
            document.location.href = baseUrl.replace(/&amp;/g, '&') + '&' + startName + '=' + ((page - 1) * perPage);
        }
    }
}

function marklist(id, name, state) {
    'use strict';
    jQuery('#' + id + ' input[type=checkbox][name]').each(function() {
        var $this = jQuery(this);
        if ($this.attr('name').substr(0, name.length) === name && !$this.prop('disabled')) {
            $this.prop('checked', state);
        }
    });
}

function viewableArea(e, itself) {
    'use strict';
    if (!e) {
        return;
    }
    if (!itself) {
        e = e.parentNode;
    }
    if (!e.vaHeight) {
        e.vaHeight = e.offsetHeight;
        e.vaMaxHeight = e.style.maxHeight;
        e.style.height = 'auto';
        e.style.maxHeight = 'none';
        e.style.overflow = 'visible';
    } else {
        e.style.height = e.vaHeight + 'px';
        e.style.overflow = 'auto';
        e.style.maxHeight = e.vaMaxHeight;
        e.vaHeight = false;
    }
}
jQuery(function($) {
    'use strict';
    $('.sub-panels').each(function() {
        var $childNodes = $('a[data-subpanel]', this),
            panels = $childNodes.map(function() {
                return this.getAttribute('data-subpanel');
            }),
            showPanel = this.getAttribute('data-show-panel');
        if (panels.length) {
            activateSubPanel(showPanel, panels);
            $childNodes.click(function() {
                activateSubPanel(this.getAttribute('data-subpanel'), panels);
                return false;
            });
        }
    });
});

function activateSubPanel(p, panels) {
    'use strict';
    var i, showPanel;
    if (typeof p === 'string') {
        showPanel = p;
    }
    $('input[name="show_panel"]').val(showPanel);
    if (typeof panels === 'undefined') {
        panels = jQuery('.sub-panels a[data-subpanel]').map(function() {
            return this.getAttribute('data-subpanel');
        });
    }
    for (i = 0; i < panels.length; i++) {
        jQuery('#' + panels[i]).css('display', panels[i] === showPanel ? 'block' : 'none');
        jQuery('#' + panels[i] + '-tab').toggleClass('activetab', panels[i] === showPanel);
    }
}

function selectCode(a) {
    'use strict';
    var e = a.parentNode.parentNode.getElementsByTagName('CODE')[0];
    var s, r;
    if (window.getSelection) {
        s = window.getSelection();
        if (s.setBaseAndExtent) {
            var l = (e.innerText.length > 1) ? e.innerText.length - 1 : 1;
            try {
                s.setBaseAndExtent(e, 0, e, l);
            } catch (error) {
                r = document.createRange();
                r.selectNodeContents(e);
                s.removeAllRanges();
                s.addRange(r);
            }
        } else {
            if (window.opera && e.innerHTML.substring(e.innerHTML.length - 4) === '<BR>') {
                e.innerHTML = e.innerHTML + '&nbsp;';
            }
            r = document.createRange();
            r.selectNodeContents(e);
            s.removeAllRanges();
            s.addRange(r);
        }
    } else if (document.getSelection) {
        s = document.getSelection();
        r = document.createRange();
        r.selectNodeContents(e);
        s.removeAllRanges();
        s.addRange(r);
    } else if (document.selection) {
        r = document.body.createTextRange();
        r.moveToElementText(e);
        r.select();
    }
}
var inAutocomplete = false;
var lastKeyEntered = '';

function phpbbCheckKey(event) {
    'use strict';
    if (event.keyCode && (event.keyCode === 40 || event.keyCode === 38)) {
        inAutocomplete = true;
    }
    if (inAutocomplete) {
        if (!lastKeyEntered || lastKeyEntered === event.which) {
            inAutocomplete = false;
            return true;
        }
    }
    if (event.which !== 13) {
        lastKeyEntered = event.which;
        return true;
    }
    return false;
}
jQuery(function($) {
    'use strict';
    $('form input[type=text], form input[type=password]').on('keypress', function(e) {
        var defaultButton = $(this).parents('form').find('input[type=submit].default-submit-action');
        if (!defaultButton || defaultButton.length <= 0) {
            return true;
        }
        if (phpbbCheckKey(e)) {
            return true;
        }
        if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
            defaultButton.click();
            return false;
        }
        return true;
    });
});

function insertUser(formId, value) {
    'use strict';
    var $form = jQuery(formId),
        formName = $form.attr('data-form-name'),
        fieldName = $form.attr('data-field-name'),
        item = opener.document.forms[formName][fieldName];
    if (item.value.length && item.type === 'textarea') {
        value = item.value + '\n' + value;
    }
    item.value = value;
}

function insert_marked_users(formId, users) {
    'use strict';
    $(users).filter(':checked').each(function() {
        insertUser(formId, this.value);
    });
    window.close();
}

function insert_single_user(formId, user) {
    'use strict';
    insertUser(formId, user);
    window.close();
}

function parseDocument($container) {
    'use strict';
    var test = document.createElement('div'),
        oldBrowser = (typeof test.style.borderRadius === 'undefined'),
        $body = $('body');
    $container.find('input[data-reset-on-edit]').on('keyup', function() {
        $(this.getAttribute('data-reset-on-edit')).val('');
    });
    $container.find('.pagination .page-jump-form :button').click(function() {
        var $input = $(this).siblings('input.inputbox');
        pageJump($input);
    });
    $container.find('.pagination .page-jump-form input.inputbox').on('keypress', function(event) {
        if (event.which === 13 || event.keyCode === 13) {
            event.preventDefault();
            pageJump($(this));
        }
    });
    $container.find('.pagination .dropdown-trigger').click(function() {
        var $dropdownContainer = $(this).parent();
        setTimeout(function() {
            if ($dropdownContainer.hasClass('dropdown-visible')) {
                $dropdownContainer.find('input.inputbox').focus();
            }
        }, 100);
    });
    $container.find('.navlinks').each(function() {
        var $this = $(this),
            $left = $this.children().not('.rightside'),
            $right = $this.children('.rightside');
        if ($left.length !== 1 || !$right.length) {
            return;
        }

        function resize() {
            var width = 0,
                diff = $left.outerWidth(true) - $left.width(),
                minWidth = Math.max($this.width() / 3, 240),
                maxWidth;
            $right.each(function() {
                var $this = $(this);
                if ($this.is(':visible')) {
                    width += $this.outerWidth(true);
                }
            });
            maxWidth = $this.width() - width - diff;
            $left.css('max-width', Math.floor(Math.max(maxWidth, minWidth)) + 'px');
        }
        resize();
        $(window).resize(resize);
    });
    $container.find('.breadcrumbs:not([data-skip-responsive])').each(function() {
        var $this = $(this),
            $links = $this.find('.crumb'),
            length = $links.length,
            classes = ['wrapped-max', 'wrapped-wide', 'wrapped-medium', 'wrapped-small', 'wrapped-tiny'],
            classesLength = classes.length,
            maxHeight = 0,
            lastWidth = false,
            wrapped = false;
        $this.find('a').each(function() {
            var $link = $(this);
            $link.attr('title', $link.text());
        });

        function check() {
            var height = $this.height(),
                width;
            width = parseInt($this.css('max-width'), 10);
            if (!width) {
                width = $body.width();
            }
            maxHeight = parseInt($this.css('line-height'), 10);
            $links.each(function() {
                if ($(this).height() > 0) {
                    maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
                }
            });
            if (height <= maxHeight) {
                if (!wrapped || lastWidth === false || lastWidth >= width) {
                    return;
                }
            }
            lastWidth = width;
            if (wrapped) {
                $this.removeClass('wrapped').find('.crumb.wrapped').removeClass('wrapped ' + classes.join(' '));
                if ($this.height() <= maxHeight) {
                    return;
                }
            }
            wrapped = true;
            $this.addClass('wrapped');
            if ($this.height() <= maxHeight) {
                return;
            }
            for (var i = 0; i < classesLength; i++) {
                for (var j = length - 1; j >= 0; j--) {
                    $links.eq(j).addClass('wrapped ' + classes[i]);
                    if ($this.height() <= maxHeight) {
                        return;
                    }
                }
            }
        }
        check();
        $(window).resize(check);
    });
    var selector = '.linklist:not(.navlinks, [data-skip-responsive]),' +
        '.postbody .post-buttons:not([data-skip-responsive])';
    $container.find(selector).each(function() {
        var $this = $(this),
            filterSkip = '.breadcrumbs, [data-skip-responsive]',
            filterLast = '.edit-icon, .quote-icon, [data-last-responsive]',
            $linksAll = $this.children(),
            $linksNotSkip = $linksAll.not(filterSkip),
            $linksFirst = $linksNotSkip.not(filterLast),
            $linksLast = $linksNotSkip.filter(filterLast),
            persistent = $this.attr('id') === 'nav-main',
            html = '<li class="responsive-menu hidden"><a href="javascript:void(0);" class="js-responsive-menu-link responsive-menu-link"><i class="icon fa-bars fa-fw" aria-hidden="true"></i></a><div class="dropdown"><div class="pointer"><div class="pointer-inner"></div></div><ul class="dropdown-contents" /></div></li>',
            slack = 3;
        if (!persistent) {
            if ($linksNotSkip.is('.rightside')) {
                $linksNotSkip.filter('.rightside:first').before(html);
                $this.children('.responsive-menu').addClass('rightside');
            } else {
                $this.append(html);
            }
        }
        var $menu = $this.children('.responsive-menu'),
            $menuContents = $menu.find('.dropdown-contents'),
            persistentContent = $menuContents.find('li:not(.separator)').length,
            lastWidth = false,
            compact = false,
            responsive1 = false,
            responsive2 = false,
            copied1 = false,
            copied2 = false,
            maxHeight = 0;
        $linksAll.each(function() {
            if (!$(this).height()) {
                return;
            }
            maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
        });
        if (maxHeight < 1) {
            return;
        } else {
            maxHeight = maxHeight + slack;
        }

        function check() {
            var width = $body.width();
            if (responsive2 && compact && (width <= lastWidth)) {
                return;
            }
            lastWidth = width;
            if (responsive1 || responsive2) {
                $linksNotSkip.removeClass('hidden');
                $menuContents.children('.clone').addClass('hidden');
                responsive1 = responsive2 = false;
            }
            if (compact) {
                $this.removeClass('compact');
                compact = false;
            }
            if (persistent && persistentContent) {
                $menu.removeClass('hidden');
            } else {
                $menu.addClass('hidden');
            }
            if ($this.height() <= maxHeight) {
                return;
            }
            if (!compact) {
                $this.addClass('compact');
                compact = true;
            }
            if ($this.height() <= maxHeight) {
                return;
            }
            if (compact) {
                $this.removeClass('compact');
                compact = false;
            }
            if (!copied1) {
                var $clones1 = $linksFirst.clone(true);
                $menuContents.prepend($clones1.addClass('clone clone-first').removeClass('leftside rightside'));
                if ($this.hasClass('post-buttons')) {
                    $('.button', $menuContents).removeClass('button');
                    $('.sr-only', $menuContents).removeClass('sr-only');
                    $('.js-responsive-menu-link').addClass('button').addClass('button-icon-only');
                    $('.js-responsive-menu-link .icon').removeClass('fa-bars').addClass('fa-ellipsis-h');
                }
                copied1 = true;
            }
            if (!responsive1) {
                $linksFirst.addClass('hidden');
                responsive1 = true;
                $menuContents.children('.clone-first').removeClass('hidden');
                $menu.removeClass('hidden');
            }
            if ($this.height() <= maxHeight) {
                return;
            }
            if (!compact) {
                $this.addClass('compact');
                compact = true;
            }
            if ($this.height() <= maxHeight) {
                return;
            }
            if (!$linksLast.length) {
                return;
            }
            if (compact) {
                $this.removeClass('compact');
                compact = false;
            }
            if (!copied2) {
                var $clones2 = $linksLast.clone();
                $menuContents.prepend($clones2.addClass('clone clone-last').removeClass('leftside rightside'));
                copied2 = true;
            }
            if (!responsive2) {
                $linksLast.addClass('hidden');
                responsive2 = true;
                $menuContents.children('.clone-last').removeClass('hidden');
            }
            if ($this.height() <= maxHeight) {
                return;
            }
            if (!compact) {
                $this.addClass('compact');
                compact = true;
            }
        }
        if (!persistent) {
            phpbb.registerDropdown($menu.find('a.js-responsive-menu-link'), $menu.find('.dropdown'), false);
        }
        $linksAll.find('img').each(function() {
            $(this).on('load', function() {
                check();
            });
        });
        check();
        $(window).resize(check);
    });
    if (oldBrowser) {
        return;
    }
    $container.find('ul.topiclist dd.mark').siblings('dt').children('.list-inner').addClass('with-mark');
    $container.find('.topiclist.responsive-show-all > li > dl').each(function() {
        var $this = $(this),
            $block = $this.find('dt .responsive-show:last-child'),
            first = true;
        if (!$block.length) {
            $this.find('dt > .list-inner').append('<div class="responsive-show" style="display:none;" />');
            $block = $this.find('dt .responsive-show:last-child');
        } else {
            first = ($.trim($block.text()).length === 0);
        }
        $this.find('dd').not('.mark').each(function() {
            var column = $(this),
                $children = column.children(),
                html = column.html();
            if ($children.length === 1 && $children.text() === column.text()) {
                html = $children.html();
            }
            $block.append((first ? '' : '<br />') + html);
            first = false;
        });
    });
    $container.find('.topiclist.responsive-show-columns').each(function() {
        var $list = $(this),
            headers = [],
            headersLength = 0;
        $list.prev('.topiclist').find('li.header dd').not('.mark').each(function() {
            headers.push($(this).text());
            headersLength++;
        });
        if (!headersLength) {
            return;
        }
        $list.find('dl').each(function() {
            var $this = $(this),
                $block = $this.find('dt .responsive-show:last-child'),
                first = true;
            if (!$block.length) {
                $this.find('dt > .list-inner').append('<div class="responsive-show" style="display:none;" />');
                $block = $this.find('dt .responsive-show:last-child');
            } else {
                first = ($.trim($block.text()).length === 0);
            }
            $this.find('dd').not('.mark').each(function(i) {
                var column = $(this),
                    children = column.children(),
                    html = column.html();
                if (children.length === 1 && children.text() === column.text()) {
                    html = children.html();
                }
                if (i < headersLength) {
                    html = headers[i] + ': <strong>' + html + '</strong>';
                }
                $block.append((first ? '' : '<br />') + html);
                first = false;
            });
        });
    });
    $container.find('table.table1').not('.not-responsive').each(function() {
        var $this = $(this),
            $th = $this.find('thead > tr > th'),
            headers = [],
            totalHeaders = 0,
            i, headersLength;
        $th.each(function(column) {
            var cell = $(this),
                colspan = parseInt(cell.attr('colspan'), 10),
                dfn = cell.attr('data-dfn'),
                text = dfn ? dfn : cell.text();
            colspan = isNaN(colspan) || colspan < 1 ? 1 : colspan;
            for (i = 0; i < colspan; i++) {
                headers.push(text);
            }
            totalHeaders++;
            if (dfn && !column) {
                $this.addClass('show-header');
            }
        });
        headersLength = headers.length;
        $this.addClass('responsive');
        if (totalHeaders < 2) {
            $this.addClass('show-header');
            return;
        }
        $this.find('tbody > tr').each(function() {
            var row = $(this),
                cells = row.children('td'),
                column = 0;
            if (cells.length === 1) {
                row.addClass('big-column');
                return;
            }
            cells.each(function() {
                var cell = $(this),
                    colspan = parseInt(cell.attr('colspan'), 10),
                    text = $.trim(cell.text());
                if (headersLength <= column) {
                    return;
                }
                if ((text.length && text !== '-') || cell.children().length) {
                    cell.prepend('<dfn style="display: none;">' + headers[column] + '</dfn>');
                } else {
                    cell.addClass('empty');
                }
                colspan = isNaN(colspan) || colspan < 1 ? 1 : colspan;
                column += colspan;
            });
        });
    });
    $container.find('table.responsive > tbody').not('.responsive-skip-empty').each(function() {
        var $items = $(this).children('tr');
        if (!$items.length) {
            $(this).parent('table:first').addClass('responsive-hide');
        }
    });
    $container.find('#tabs, #minitabs').not('[data-skip-responsive]').each(function() {
        var $this = $(this),
            $ul = $this.children(),
            $tabs = $ul.children().not('[data-skip-responsive]'),
            $links = $tabs.children('a'),
            $item = $ul.append('<li class="tab responsive-tab" style="display:none;"><a href="javascript:void(0);" class="responsive-tab-link">&nbsp;</a><div class="dropdown tab-dropdown" style="display: none;"><div class="pointer"><div class="pointer-inner"></div></div><ul class="dropdown-contents" /></div></li>').find('li.responsive-tab'),
            $menu = $item.find('.dropdown-contents'),
            maxHeight = 0,
            lastWidth = false,
            responsive = false;
        $links.each(function() {
            var $this = $(this);
            maxHeight = Math.max(maxHeight, Math.max($this.outerHeight(true), $this.parent().outerHeight(true)));
        });

        function check() {
            var width = $body.width(),
                height = $this.height();
            if (!arguments.length && (!responsive || width <= lastWidth) && height <= maxHeight) {
                return;
            }
            $tabs.show();
            $item.hide();
            lastWidth = width;
            height = $this.height();
            if (height <= maxHeight) {
                if ($item.hasClass('dropdown-visible')) {
                    phpbb.toggleDropdown.call($item.find('a.responsive-tab-link').get(0));
                }
                return;
            }
            responsive = true;
            $item.show();
            $menu.html('');
            var $availableTabs = $tabs.filter(':not(.activetab, .responsive-tab)'),
                total = $availableTabs.length,
                i, $tab;
            for (i = total - 1; i >= 0; i--) {
                $tab = $availableTabs.eq(i);
                $menu.prepend($tab.clone(true).removeClass('tab'));
                $tab.hide();
                if ($this.height() <= maxHeight) {
                    $menu.find('a').click(function() {
                        check(true);
                    });
                    return;
                }
            }
            $menu.find('a').click(function() {
                check(true);
            });
        }
        var $tabLink = $item.find('a.responsive-tab-link');
        phpbb.registerDropdown($tabLink, $item.find('.dropdown'), {
            visibleClass: 'activetab'
        });
        check(true);
        $(window).resize(check);
    });
    $container.find('#navigation').each(function() {
        var $items = $(this).children('ol, ul').children('li');
        if ($items.length === 1) {
            $(this).addClass('responsive-hide');
        }
    });
    $container.find('[data-responsive-text]').each(function() {
        var $this = $(this),
            fullText = $this.text(),
            responsiveText = $this.attr('data-responsive-text'),
            responsive = false;

        function check() {
            if ($(window).width() > 700) {
                if (!responsive) {
                    return;
                }
                $this.text(fullText);
                responsive = false;
                return;
            }
            if (responsive) {
                return;
            }
            $this.text(responsiveText);
            responsive = true;
        }
        check();
        $(window).resize(check);
    });
}
jQuery(function($) {
    'use strict';
    $('#phpbb.nojs').toggleClass('nojs hasjs');
    $('#phpbb').toggleClass('hastouch', phpbb.isTouch);
    $('#phpbb.hastouch').removeClass('notouch');
    $('form[data-focus]:first').each(function() {
        $('#' + this.getAttribute('data-focus')).focus();
    });
    parseDocument($('body'));
});