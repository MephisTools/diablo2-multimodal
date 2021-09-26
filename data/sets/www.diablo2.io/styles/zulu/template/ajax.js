(function($) {
    'use strict';
    phpbb.addAjaxCallback('mark_forums_read', function(res) {
        var readTitle = res.NO_UNREAD_POSTS;
        var unreadTitle = res.UNREAD_POSTS;
        var iconsArray = {
            forum_unread: 'forum_read',
            forum_unread_subforum: 'forum_read_subforum',
            forum_unread_locked: 'forum_read_locked'
        };
        $('li.row').find('dl[class*="forum_unread"]').each(function() {
            var $this = $(this);
            $.each(iconsArray, function(unreadClass, readClass) {
                if ($this.hasClass(unreadClass)) {
                    $this.removeClass(unreadClass).addClass(readClass);
                }
            });
            $this.children('dt[title="' + unreadTitle + '"]').attr('title', readTitle);
        });
        $('a.subforum[class*="unread"]').removeClass('unread').addClass('read').children('.icon.icon-red').removeClass('icon-red').addClass('icon-blue');
        if ($('#active_topics').length) {
            phpbb.ajaxCallbacks.mark_topics_read.call(this, res, false);
        }
        $('[data-ajax="mark_forums_read"]').attr('href', res.U_MARK_FORUMS);
        phpbb.closeDarkenWrapper(3000);
    });
    phpbb.addAjaxCallback('mark_topics_read', function(res, updateTopicLinks) {
        var readTitle = res.NO_UNREAD_POSTS;
        var unreadTitle = res.UNREAD_POSTS;
        var iconsArray = {
            global_unread: 'global_read',
            announce_unread: 'announce_read',
            sticky_unread: 'sticky_read',
            topic_unread: 'topic_read'
        };
        var iconsState = ['', '_hot', '_hot_mine', '_locked', '_locked_mine', '_mine'];
        var unreadClassSelectors;
        var classMap = {};
        var classNames = [];
        if (typeof updateTopicLinks === 'undefined') {
            updateTopicLinks = true;
        }
        $.each(iconsArray, function(unreadClass, readClass) {
            $.each(iconsState, function(key, value) {
                if ((value === '_hot' || value === '_hot_mine') && unreadClass !== 'topic_unread') {
                    return true;
                }
                classMap[unreadClass + value] = readClass + value;
                classNames.push(unreadClass + value);
            });
        });
        unreadClassSelectors = '.' + classNames.join(',.');
        $('li.row').find(unreadClassSelectors).each(function() {
            var $this = $(this);
            $.each(classMap, function(unreadClass, readClass) {
                if ($this.hasClass(unreadClass)) {
                    $this.removeClass(unreadClass).addClass(readClass);
                }
            });
            $this.children('dt[title="' + unreadTitle + '"]').attr('title', readTitle);
        });
        $('a.unread').has('.icon-red').remove();
        if (updateTopicLinks) {
            $('[data-ajax="mark_topics_read"]').attr('href', res.U_MARK_TOPICS);
        }
        phpbb.closeDarkenWrapper(3000);
    });
    phpbb.addAjaxCallback('notification.mark_all_read', function(res) {
        if (typeof res.success !== 'undefined') {
            phpbb.markNotifications($('#notification_list li.bg2'), 0);
            phpbb.closeDarkenWrapper(3000);
        }
    });
    phpbb.addAjaxCallback('notification.mark_read', function(res) {
        if (typeof res.success !== 'undefined') {
            var unreadCount = Number($('#notification_list_button strong').html()) - 1;
            phpbb.markNotifications($(this).parent('li.bg2'), unreadCount);
        }
    });
    phpbb.markNotifications = function($popup, unreadCount) {
        $popup.removeClass('bg2');
        $popup.find('a.mark_read').remove();
        $popup.each(function() {
            var link = $(this).find('a');
            link.attr('href', link.attr('data-real-url'));
        });
        $('strong', '#notification_list_button').html(unreadCount);
        if (!unreadCount) {
            $('#mark_all_notifications').remove();
            $('#notification_list_button > strong').addClass('hidden');
        }
        var $title = $('title');
        var originalTitle = $title.text().replace(/(\((\d+)\))/, '');
        $title.text((unreadCount ? '(' + unreadCount + ')' : '') + originalTitle);
    };
    phpbb.addAjaxCallback('post_delete', function() {
        var $this = $(this),
            postId;
        if ($this.attr('data-refresh') === undefined) {
            postId = $this[0].href.split('&p=')[1];
            var post = $this.parents('#p' + postId).css('pointer-events', 'none');
            if (post.hasClass('bg1') || post.hasClass('bg2')) {
                var posts1 = post.nextAll('.bg1');
                post.nextAll('.bg2').removeClass('bg2').addClass('bg1');
                posts1.removeClass('bg1').addClass('bg2');
            }
            post.fadeOut(function() {
                $(this).remove();
            });
        }
    });
    phpbb.addAjaxCallback('post_visibility', function(res) {
        var remove = (res.visible) ? $(this) : $(this).parents('.post');
        $(remove).css('pointer-events', 'none').fadeOut(function() {
            $(this).remove();
        });
        if (res.visible) {
            remove.parents('.post').find('.post_deleted_msg').css('pointer-events', 'none').fadeOut(function() {
                $(this).remove();
            });
        }
    });
    phpbb.addAjaxCallback('row_delete', function() {
        $(this).parents('tr').remove();
    });
    phpbb.addAjaxCallback('zebra', function(res) {
        var zebra;
        if (res.success) {
            zebra = $('.zebra');
            zebra.first().html(res.MESSAGE_TEXT);
            zebra.not(':first').html('&nbsp;').prev().html('&nbsp;');
        }
    });
    phpbb.addAjaxCallback('vote_poll', function(res) {
        if (typeof res.success !== 'undefined') {
            var poll = $(this).closest('.topic_poll');
            var panel = poll.find('.panel');
            var resultsVisible = poll.find('dl:first-child .resultbar').is(':visible');
            var mostVotes = 0;
            var updatePanelHeight = function(height) {
                height = (typeof height === 'undefined') ? panel.find('.inner').outerHeight() : height;
                panel.css('min-height', height);
            };
            updatePanelHeight();
            if (!resultsVisible) {
                poll.find('.poll_view_results').hide(500);
            }
            if (!res.can_vote) {
                poll.find('.polls, .poll_max_votes, .poll_vote, .poll_option_select, .z-vote-radio').fadeOut(500, function() {
                    poll.find('.resultbar, .poll_option_percent, .poll_total_votes, .poll_option_select').show();
                    $('.poll_option_select').addClass('z-fix-poll-select');
                    poll.find($('.z-poll-submit')).addClass('z-hidden');
                    poll.find($('.z-vote-submitted')).removeClass('z-hidden');
                });
            } else {
                poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show(500);
            }
            poll.find('[data-poll-option-id]').each(function() {
                var option = $(this);
                var optionId = option.attr('data-poll-option-id');
                mostVotes = (res.vote_counts[optionId] >= mostVotes) ? res.vote_counts[optionId] : mostVotes;
            });
            poll.find('.poll_total_vote_cnt').html(res.total_votes);
            poll.find('[data-poll-option-id]').each(function() {
                var $this = $(this);
                var optionId = $this.attr('data-poll-option-id');
                var voted = (typeof res.user_votes[optionId] !== 'undefined');
                var mostVoted = (res.vote_counts[optionId] === mostVotes);
                var percent = (!res.total_votes) ? 0 : Math.round((res.vote_counts[optionId] / res.total_votes) * 100);
                var percentRel = (mostVotes === 0) ? 0 : Math.round((res.vote_counts[optionId] / mostVotes) * 100);
                var altText;
                altText = $this.attr('data-alt-text');
                if (voted) {
                    $this.attr('title', $.trim(altText));
                } else {
                    $this.attr('title', '');
                };
                $this.toggleClass('voted', voted);
                $this.toggleClass('most-votes', mostVoted);
                var bar = $this.find('.resultbar div');
                var barTimeLapse = (res.can_vote) ? 500 : 1500;
                var newBarClass = (percent === 100) ? 'pollbar5' : 'pollbar' + (Math.floor(percent / 20) + 1);
                setTimeout(function() {
                    bar.animate({
                        width: percentRel + '%'
                    }, 500).removeClass('pollbar1 pollbar2 pollbar3 pollbar4 pollbar5').addClass(newBarClass).html(res.vote_counts[optionId]);
                    var iszero = $this.find('.resultbar div').text();
                    if (iszero === '0') {
                        bar.addClass('z-no-resultsbar');
                        bar.html('<span class="z-grey">No votes</span>');
                    } else {
                        bar.removeClass('z-no-resultsbar');
                    }
                    var percentText = percent ? percent + '%' : 0 + '%';
                    $this.find('.z-inline-count').html('(' + percentText + ')');
                }, barTimeLapse);
            });
            if (!res.can_vote) {
                poll.find('.polls').delay(400).fadeIn(500);
            }
            var confirmationDelay = (res.can_vote) ? 300 : 900;
            poll.find('.vote-submitted').delay(confirmationDelay).slideDown(200, function() {
                if (resultsVisible) {
                    updatePanelHeight();
                }
                $(this).delay(5000).fadeOut(500, function() {
                    resizePanel(300);
                });
            });
            setTimeout(function() {
                resizePanel(500);
            }, 1500);
            var resizePanel = function(time) {
                var panelHeight = panel.height();
                var innerHeight = panel.find('.inner').outerHeight();
                if (panelHeight !== innerHeight) {
                    panel.css({
                        minHeight: '',
                        height: panelHeight
                    }).animate({
                        height: innerHeight
                    }, time, function() {
                        panel.css({
                            minHeight: innerHeight,
                            height: ''
                        });
                    });
                }
            };
        }
    });
    $('.poll_view_results a').click(function(e) {
        e.preventDefault();
        var $poll = $(this).parents('.topic_poll');
        $poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show(500);
        $poll.find('.poll_view_results').hide(500);
    });
    $('[data-ajax]').each(function() {
        var $this = $(this);
        var ajax = $this.attr('data-ajax');
        var filter = $this.attr('data-filter');
        if (ajax !== 'false') {
            var fn = (ajax !== 'true') ? ajax : null;
            filter = (filter !== undefined) ? phpbb.getFunctionByName(filter) : null;
            phpbb.ajaxify({
                selector: this,
                refresh: $this.attr('data-refresh') !== undefined,
                filter: filter,
                callback: fn
            });
        }
    });
    $('#qr_full_editor').click(function() {
        $('#qr_postform').attr('action', function(i, val) {
            return val + '#preview';
        });
    });
    $('.display_post').click(function(e) {
        e.preventDefault();
        var postId = $(this).attr('data-post-id');
        $('#post_content' + postId).show();
        $('#profile' + postId).show();
        $('#post_hidden' + postId).hide();
    });
    $('#member_search').click(function() {
        var $memberlistSearch = $('#memberlist_search');
        $memberlistSearch.slideToggle('fast');
        phpbb.ajaxCallbacks.alt_text.call(this);
        if ($memberlistSearch.is(':visible')) {
            $('#username').focus();
        }
        return false;
    });
    $(function() {
        var $textarea = $('textarea:not(#message-box textarea, .no-auto-resize)');
        phpbb.resizeTextArea($textarea, {
            minHeight: 75,
            maxHeight: 250
        });
        phpbb.resizeTextArea($('textarea', '#message-box'));
    });
})(jQuery);