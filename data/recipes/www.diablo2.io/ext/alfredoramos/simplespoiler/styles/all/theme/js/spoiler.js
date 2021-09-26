(function() {
    'use strict';
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            let el = this;
            do {
                if (el.matches(s)) {
                    return el;
                }
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
    document.body.addEventListener('click', function(e) {
        if (!e.target.closest('.spoiler-header')) {
            return;
        }
        let elements = {
            container: e.target.closest('.spoiler')
        };
        if (!elements.container) {
            return;
        }
        elements.icon = elements.container.querySelector('.spoiler-status > .icon');
        if (!elements.icon) {
            return;
        }
        let isOpen = elements.container.hasAttribute('open');
    });
})();