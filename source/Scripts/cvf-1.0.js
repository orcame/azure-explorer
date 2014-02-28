(function ($, global) {
    var cvf = window.cvf = {};
    var animateDuration = 200;

    function setWindowSize(win, width, callback) {
        win.animate({ width: width }, animateDuration, callback);
    }

    var content = cvf.content = $('.cvf-content'),
        panorama = cvf.panorama = $('.cvf-content-panorama');

    function maximizeWindow(win) {
        win.data('width', win.width());
        setWindowSize(win, content.width(), function () {
            panorama.scrollLeft(panorama.scrollLeft() + win.offset().left - panorama.offset().left)
            //panorama.animate({ scrollLeft: win.position().left }, animateDuration);
        });
    }

    function restoreWindow(win) {
        var width = win.data('width');
        win.data('width', null);
        setWindowSize(win, width);
    }

    var windowStatus = ['cvf-minimum', 'cvf-maximize'];
    var controlsMap = {
        'cvf-controls-maximize': {
            convertTo: 'cvf-controls-restore',
            windowStatus: 'cvf-maximize',
            handler: maximizeWindow
        },
        'cvf-controls-restore': {
            convertTo: 'cvf-controls-maximize',
            windowStatus: '',
            handler: restoreWindow
        },
        'cvf-controls-close': {
            handler: function (window) {
                window.remove();
            }
        },
        'cvf-controls-minimize': {
            windowStatus: 'cvf-minimum',
            handler: null
        }
    };

    panorama.click(function (ev) {
        var t = $(ev.target);
        if (t.parent().hasClass('cvf-controls')) {
            var win = t.closest('[data-trigger="controls"]');
            if (win.length == 0) {
                return;
            }
            for (n in controlsMap) {
                var map = controlsMap[n];
                if (t.hasClass(n)) {
                    if (map.handler) {
                        map.handler(win);
                    }
                    t.removeClass(n).addClass(map.convertTo);
                    var len = windowStatus.length;
                    for (var idx = 0; idx < len; idx++) {
                        win.removeClass(windowStatus[idx]);
                    }
                    win.addClass(map.windowStatus);
                    return;
                }
            }
        }
    })

})(jQuery, window);