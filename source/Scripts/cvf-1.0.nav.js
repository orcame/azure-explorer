(function ($, cvf, global) {
    if (cvf.nav) {
        return;
    }
    var nav = {};
    cvf.nav = nav;

    var items = [],
        bar = $('.cvf-nav-bar'),
        panel = $('.cvf-nav-panel');

    var regions = {
        top: $('.cvf-nav-top-region'),
        middle: $('.cvf-nav-middle-region'),
        bottom: $('.cvf-nav-bottom-region')
    }

    function openNavPanel(btn, options) {
        var url = btn.attr('data-url'),
            title = btn.attr('data-title');
        panel.removeClass('cvf-nav-panel-zoomout')
            .addClass('cvf-nav-panel-zoomin')
            .find('.cvf-nav-panel-heading h1').text(title);
        panel.find('.cvf-nav-panel-body').empty();
        if (url) {
            var element = panel.addClass('cvf-loading').find('.cvf-nav-panel-body');
            cvf.load(element, url, options, function () {
                if (options.success) {
                    options.success.apply(this, arguments);
                }
                panel.removeClass('cvf-loading');
            });
        }
    }

    function closeNavPanel() {
        panel.removeClass('cvf-nav-panel-zoomin')
            .removeClass('cvf-loading')
            .addClass('cvf-nav-panel-zoomout')
            .find('.cvf-nav-panel-body').empty();
    }

    function buttonClick(options) {
        var t = $(this);
        if (t.hasClass('active')) {
            t.removeClass('active');
            closeNavPanel();
        } else {
            bar.find('.active').removeClass('active');
            t.addClass('active');
            openNavPanel(t, options);
        }
    }

    nav.close = closeNavPanel;
    nav.open = openNavPanel;

    nav.register = function (item, region) {
        if ($.isArray(item)) {
            var len = item.length;
            for (var idx = 0; idx < len; idx++) {
                nav.register(item[idx], region);
            }
        } else {
            var region = regions[region] || regions.middle;
            items.push(item);
            var button = $('<div class="cvf-nav-button"/>'),
                icon = $('<span class="cvf-nav-button-icon"><i class="fa"></i></span>');
            if (item.color) {
                icon.addClass('color-' + item.color);
            }
            if (item.icon) {
                icon.find('i').addClass(item.icon);
            }
            button.attr('data-url', item.url)
                .attr('data-title', item.title)
                .append(icon);
            if (item.showText !== false) {
                button.append('<div class="cvf-nav-button-title">' + item.title + '</div>');
            }
            region.find('ul').append($('<li/>').append(button));
            button.click(function () {
                buttonClick.call(this, item);
            });
        }
    }

    cvf.panorama.click(function () {
        bar.find('.active').removeClass('active');
        closeNavPanel();
    })

    bar.find('.cvf-nav-button').click(buttonClick);

})(jQuery, cvf, window);