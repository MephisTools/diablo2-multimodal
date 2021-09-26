(function($) {
    if (LIVE_SEARCH_USE_EYE_BUTTON) {
        var obj = {};
        $(obj).eye({
            name: 'ls_eye',
            title_open: LIVE_SEARCH_EYE_BUTTON_OPEN_T,
            title_close: LIVE_SEARCH_EYE_BUTTON_CLOSE_T,
            id: ['livesearch_btn', 'livesearch'],
        });
    }
    $().ready(function() {
        $(".livesearch-btn").hoverIntent(function() {
            $('.livesearch-btn').fadeOut("slow");
            $('.livesearch').fadeIn("slow");
        });
        $('.livesearch-btn-close').on('click', function(e) {
            $('.forum-live-search').val("");
            $('.topic-live-search').val("");
            $('.user-live-search').val("");
            $('.livesearch-btn').fadeIn("slow");
            $('.livesearch').fadeOut("slow");
            $('.acResults').fadeOut("slow");
        });
        $(document).click(function(event) {
            if ($(event.target).closest(".user-handle").length || $(event.target).closest(".acResults").length || $(event.target).closest(".user-live-search").length || $(event.target).closest("#livesearch").length) return;
            $(".user-handle").hide("slow");
            $(".acResults").hide("slow");
            event.stopPropagation();
        });
        $(".user-live-search").on('keyup', function(e) {
            $('.user-handle').hide();
        });
        $(".forum-live-search").autocomplete_ls({
            url: U_FORUM_LS_PATH,
            sortResults: false,
            width: 600,
            maxItemsToShow: maxItemsToShow_forum,
            selectFirst: true,
            minChars: minChars_forum,
            hideAfterSelect: LIVE_SEARCH_HIDE_AFTER_SELECT,
            showResult: function(value, data) {
                return '<span style="">' + hilight(value, $(".forum-live-search").val()) + '</span>';
            },
            onItemSelect: function(item) {
                goto_topic(item);
            },
        });
        $(".topic-live-search").autocomplete_ls({
            url: U_TOPIC_LS_PATH,
            sortResults: false,
            maxItemsToShow: maxItemsToShow_topic,
            selectFirst: true,
            onNoMatch: true,
            onFinish: true,
            minChars: minChars_topic,
            hideAfterSelect: LIVE_SEARCH_HIDE_AFTER_SELECT,
            showResult: function(value, data) {
                return '<span style="">' + hilight(value, $(".topic-live-search").val()) + data[2] + '</span>';
            },
            onItemSelect: function(item) {
                goto_topic(item);
            }
        });
        $(".user-live-search").autocomplete_ls({
            url: U_USER_LS_PATH,
            selectFirst: true,
            minChars: minChars_user,
            showResult: function(value, data) {
                return hilight(value, $(".user-live-search").val());
            },
            onFinish: function(item) {
                goto_user(item);
            }
        });
        $(".user-live-search_pm").autocomplete_ls({
            url: U_USER_PM_LS_PATH,
            selectFirst: true,
            minChars: minChars_user,
            fixedPos: false,
            showResult: function(value, data) {
                return hilight(value, $(".user-live-search").val());
            },
            onItemSelect: function(item) {
                goto_user_pm(item);
            }
        });
        if (S_SIMILARTOPIC_SHOW) {
            var new_topic = $('.ls-similartopics').next().find('input[name=subject]');
            $(new_topic).attr('autocomplete', 'off').css('padding-left', '2px');
            $('.ls-similartopics').next().find('input[name=subject]').autocomplete_ls({
                url: U_SIMILARTOPIC_LS_PATH,
                sortResults: false,
                maxItemsToShow: maxItemsToShow_topic,
                selectFirst: true,
                minChars: minChars_topic,
                fixedPos: false,
                hideAfterSelect: LIVE_SEARCH_HIDE_AFTER_SELECT,
                showResult: function(value, data) {
                    return '<span style="">' + hilight(value, $(".topic-live-search").val()) + '</span>';
                },
                onItemSelect: function(item) {
                    goto_topic(item);
                }
            });
        }
        if (S_LIVESEARCH_MCP) {
            initMcpLiveSearch();
        }
    });

    function hilight(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
    }

    function goto_forum(item) {
        var f = item.data[0];
        if (f) {
            $(".forum-live-search").val('');
            var wnd = LIVE_SEARCH_SHOW_IN_NEW_WINDOW ? '_blank' : '_parent';
            var forum_link = U_FORUM_REDIRECT.indexOf("?sid=") > -1 ? '&f=' + f : '?f=' + f;
            window.open(U_FORUM_REDIRECT + forum_link, wnd);
        }
        return false;
    }

    function goto_topic(item) {
        var t = item.data[0];
        var f = item.data[1];
        if (t) {
            $("#live_search").val('');
            var wnd = LIVE_SEARCH_SHOW_IN_NEW_WINDOW ? '_blank' : '_parent';
            var topicLink = S_CANONICAL_TOPIC_TYPE ? 'f=' + f + '&t=' + t : 't=' + t;
            if (U_TOPIC_REDIRECT.indexOf("?sid=") > -1) topicLink = "&" + topicLink
            else topicLink = "?" + topicLink
            window.open(U_TOPIC_REDIRECT + topicLink, wnd);
        }
        return false;
    }

    function goto_user(item) {
        if (item) {
            var newVal = '<div class="user_drag">' + $(".user-live-search").val() + '</div>';
            $(".user-live-search").html(newVal);
            var username = item.value;
            var user_id = item.data[0];
            window.open('/member/' + user_id + '/');
            $('.topics-live-search-board').on('click', function(e) {
                e.preventDefault();
                var usertopic_path = U_USERTOPIC_LS_PATH + '0/0/' + user_id;
                window.location = usertopic_path;
            });
            $('.topics-live-search-forum').on('click', function(e) {
                e.preventDefault();
                var usertopic_path = U_USERTOPIC_LS_PATH + S_FORUM_ID + '/0/' + user_id;
                window.location = usertopic_path;
            });
            $('.posts-live-search-board').on('click', function(e) {
                e.preventDefault();
                var userpost_path = U_USERPOST_LS_PATH + '0/0/' + user_id;
                window.location = userpost_path;
            });
            $('.posts-live-search-forum').on('click', function(e) {
                e.preventDefault();
                var userpost_path = U_USERPOST_LS_PATH + +S_FORUM_ID + '/0/' + user_id;
                window.location = userpost_path;
            });
            $('.posts-live-search-topic').on('click', function(e) {
                e.preventDefault();
                var userpost_path = U_USERPOST_LS_PATH + +S_FORUM_ID + '/' + S_TOPIC_ID + '/' + user_id;
                window.location = userpost_path;
            });
        }
        return false;
    }

    function goto_user_pm(item) {
        if (item == null || item.value == null || item.value == undefined) return;
        var old_value = $("#username_list").val();
        var new_value = (old_value) ? old_value + '\n' + item.value : item.value;
        $("#username_list").val(new_value);
    }
    if (!Array.prototype.clone) {
        Array.prototype.clone = function() {
            var arr1 = new Array();
            for (var property in this) {
                arr1[property] = typeof(this[property]) == 'object' ? this[property].clone() : this[property]
            }
            return arr1;
        }
    }

    function initMcpLiveSearch() {
        if (MCP_POST_DETAILS) {
            $("input[name='username']").addClass("inputbox search").attr({
                type: "search",
                placeholder: L_LIVESEARCH_USER_TXT,
                title: L_LIVESEARCH_USER_T,
                autocomplete: "off"
            });
            var elem = $("input[name='username']");
            var txtArea = null;
            mcp_user_search(elem, txtArea)
        }
        if (MCP_USER_NOTES) {
            $("#username").addClass("inputbox search").attr({
                type: "search",
                placeholder: L_LIVESEARCH_USER_TXT,
                title: L_LIVESEARCH_USER_T,
                autocomplete: "off"
            });
            var elem = $("input[name='username']");
            var txtArea = null;
            mcp_user_search(elem, txtArea)
        }
        if (MCP_BAN) {
            var elem = $("#usersearch_ls");
            var txtArea = $("#ban");
            mcp_user_search(elem, txtArea)
        }
        if (MCP_TOPIC_VIEW) {
            var elem = $("#topicsearch_ls");
            var totopicElem = $("#to_topic_id");
            console.log(elem);
            mcp_topic_search(elem, totopicElem);
            var elem = $("#forumsearch_ls");
            var cbo = $("select[name='to_forum_id']");
            forum_search(elem, cbo);
        }
        if (MCP_TOPIC_MOVE) {
            var elem = $("#forumsearch_ls");
            var cbo = $("select[name='to_forum_id']");
            forum_search(elem, cbo);
        }
    }

    function mcp_user_search(elem, txtarea) {
        $(elem).autocomplete_ls({
            url: U_USER_LS_PATH,
            sortResults: false,
            width: 600,
            maxItemsToShow: LIVE_SEARCH_MAX_ITEMS_TO_SHOW_MCP,
            selectFirst: true,
            fixedPos: false,
            minChars: LIVE_SEARCH_MIN_NUM_SYMBLOLS_USER_MCP,
            showResult: function(value, data) {
                return '<span style="">' + hilight(value, $(elem).val()) + '</span>';
            },
            onItemSelect: function(item) {
                if (txtarea != null)
                    add_user_to_textarea(item, txtarea);
            },
        });
    }

    function mcp_topic_search(elem, totopicElem) {
        $(elem).autocomplete_ls({
            url: U_TOPIC_LS_PATH,
            sortResults: false,
            width: 600,
            maxItemsToShow: maxItemsToShow_topic,
            selectFirst: true,
            fixedPos: false,
            minChars: minChars_topic,
            showResult: function(value, data) {
                return '<span style="">' + hilight(value, $(".topic-live-search").val()) + data[2] + '</span>';
            },
            onItemSelect: function(item) {
                if (totopicElem != null) {
                    $(totopicElem).val(item.data[0]);
                    var dl = $(totopicElem).parent().parent();
                    var dds = $(dl).find("dd");
                    if ($(dds).length > 1) {
                        $(dds).last().remove();
                    }
                    var topicLink = S_CANONICAL_TOPIC_TYPE ? '?f=' + item.data[1] + '&t=' + item.data[0] : '?t=' + item.data[0];
                    var dd = '<dd>' + L_LIVE_SEARCH_YOU_SELECTED_TOPIC + item.data[0] + ': <a href="./viewtopic.php' + topicLink + '">' + item.value + '.' + '</a>';
                    $(dl).append(dd);
                }
            }
        });
    }

    function forum_search(elem, cbo) {
        $(elem).autocomplete_ls({
            url: U_FORUM_LS_PATH,
            sortResults: false,
            width: 600,
            maxItemsToShow: maxItemsToShow_forum,
            selectFirst: true,
            minChars: minChars_forum,
            fixedPos: false,
            showResult: function(value, data) {
                return '<span style="">' + hilight(value, $(elem).val()) + '</span>';
            },
            onItemSelect: function(item) {
                select_combo(item, cbo);
            },
        });
    }

    function select_combo(item, cbo) {
        console.log(cbo);
        console.log($(cbo).find("option[value='" + item.data[0] + "']"));
        $(cbo).find("option[value='" + item.data[0] + "']").attr("selected", "selected");
    }

    function add_user_to_textarea(item, txtarea) {
        var user = item.value;
        var new_val = $.trim($(txtarea).val());
        if (new_val.indexOf(user) < 0) {
            if (new_val != '')
                new_val = new_val + '\n';
            new_val = new_val + item.value;
        }
        $(txtarea).val(new_val);
    }
})(jQuery);