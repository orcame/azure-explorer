(function ($, global) {
    var cvf = window.cvf = {},
        animateDuration = 200,
        content = cvf.content = $('.cvf-content'),
        panorama = cvf.panorama = $('.cvf-content-panorama');

    cvf.body = $('.cvf-content-body'), cvf.home = $('.cvf-content-home');

    function setWindowEvent(win) {
        win.element.find('.cvf-controls').unbind('click').click(function (ev) {
            var tar = $(ev.target);
            if (tar.hasClass('cvf-controls-maximize')) {
                win.maximize();
            } else if (tar.hasClass('cvf-controls-restore')) {
                win.restore();
            } else if (tar.hasClass('cvf-controls-close')) {
                win.close();
            }
        });
    }

    var cvfWindow = function (options) {
        var html = '<div class="cvf-window" data-trigger="controls">'
                 + '     <div class="cvf-window-title"></div>'
                 + '     <div class="cvf-window-content">'
                 + '         <div class="cvf-panel">'
                 + '             <div class="cvf-panel-heading">'
                 + '                 <h1>' + options.title + '</h1>'
                 + '                 <div class="cvf-controls">'
                 + '                     <div class="cvf-controls-maximize">'
                 + '                     </div>'
                 + '                     <div class="cvf-controls-close">'
                 + '                     </div>'
                 + '                 </div>'
                 + '             </div>'
                 + '             <div class="cvf-panel-body">'
                 + '             </div>'
                 + '         </div>'
                 + '     </div>'
                 + '</div>';
        var t = this;
        t.element = $(html);
        if (['big', 'small'].indexOf(options.width) >= 0) {
            t.element.addClass('cvf-window-' + options.width);
        } else {
            t.element.width(options.width);
        }
        t.body = t.element.find('.cvf-panel-body');
        t.options = options;
        t.template = null;
        if (options.background) {
            t.body.addClass(options.background);
        }
    }

    cvfWindow.prototype = {
        appendTo: function (target) {
            this.element.appendTo(target);
            setWindowEvent(this);
            return this;
        }, progress: function () {
            this.element.find('.cvf-panel').addClass('cvf-loading')
            return this;
        }, unprogress: function () {
            this.element.find('.cvf-panel').removeClass('cvf-loading')
            return this;
        }, clear: function () {
            this.body.empty();
            return this;
        }, title: function (v) {
            if (v === undefined) {
                return this.element.find('.cvf-panel-heading h1').text();
            } else {
                this.element.find('.cvf-panel-heading h1').html(v);
            }
            return this;
        }, open: function () {
            this.appendTo(cvf.body).active();
            return this;
        }, close: function () {
            if (this.children) {
                $.each(this.children, function () {
                    this.close();
                });
            }
            this.element.remove();
            return this;
        }, openChild: function (options) {
            var win = (options instanceof cvfWindow) ? options : cvf.ccreateWindow(options);
            win.parent = this;
            if (!this.children) {
                this.children = [];
            }
            this.children.push(win);
            win.element.insertAfter(this.element);
            setWindowEvent(win);
            win.active();
            return this;
        }, asyncRender: function (asyncFun, afterRender, beforeRender) {
            var t = this, additionalData;
            t.progress();
            if (typeof (beforeRender) != 'function') {
                additionalData = beforeRender;
                beforeRender = null;
            }
            beforeRender = beforeRender || t.options.beforeRender;
            afterRender = afterRender || t.options.afterRender;
            asyncFun(function (data) {
                t.renderData = { data: data };
                if (beforeRender) {
                    beforeRender.call(t, data);
                }
                if (additionalData) {
                    $.extend(t.renderData, additionalData);
                }
                t.render(t.renderData, afterRender);
                t.unprogress();
            }, function () {
                t.unprogress();
                //todo:give out a error message.
            });
        }, render: function (data, afterRender) {
            if (typeof (data) == 'function') {
                afterRender = data;
                data = this.renderData;
            }
            afterRender = afterRender || this.options.afterRender;
            if (!this.template) {
                var t = this;
                $('<div/>').load(t.options.url, function (html) {
                    t.template = html;
                    t.body.html(cvf.render(t.template, data));
                    if (afterRender) {
                        afterRender.call(t, data);
                    }
                });
            } else {
                this.body.html(cvf.render(this.template, data));
                if (afterRender) {
                    afterRender.call(this, data);
                }
            }
            return this;
        }, maximize: function () {
            var width = content.width(), t = this;
            if (!t._orgw) {
                t._orgw = t.element.outerWidth();
            }
            t.element.find('.cvf-controls-maximize').attr('class', 'cvf-controls-restore');
            t.element.children().width(width);
            t.element.animate({ width: width }, animateDuration, function () {
                t.active();
                t.element.children().width('');
            }).removeClass('cvf-minimum').addClass('cvf-maximize');
            return this;
        }, minimize: function () {
            this.element.removeClass('cvf-maximize').addClass('cvf-minimum');
            return this;
        }, restore: function () {
            var t = this, width = t._orgw
            t.element.removeClass('cvf-maximize')
                .addClass('cvf-minimum')
                .animate({ width: width }, animateDuration, function () {
                    t.active();
                })
                .find('.cvf-controls-restore').attr('class', 'cvf-controls-maximize');
            return this;
        }, active: function () {
            panorama.scrollLeft(panorama.scrollLeft() + this.element.offset().left - panorama.offset().left);
            return this;
        }
    }

    $.extend(cvf, {
        render: function (html, content) {
            var re = /<%(.+?)%>/g, reExp = /(^( )?(if|for|else|switch|case|break|var|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0;
            if (content) {
                for (var n in content) {
                    code += 'var ' + n + '= this["' + n + '"];\n';
                }
            }
            var add = function (line, js) {
                js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
                return add;
            }
            while (match = re.exec(html)) {
                add(html.slice(cursor, match.index))(match[1], true);
                cursor = match.index + match[0].length;
            }
            add(html.substr(cursor, html.length - cursor));
            code += 'return r.join("");';
            return new Function('', code.replace(/[\r\t\n]/g, '')).apply(content);
        },
        load: function (element, url, options, success) {
            if (!success && options) {
                success = options.success;
            }
            if (!(element instanceof $)) {
                element = $(element);
            }
            $('<div/>').load(url, function (html) {
                element.empty().html(cvf.render(html, options));
                if (success) {
                    success(element, options);
                }
            })
        }, createWindow: function (options) {
            return new cvfWindow(options);
        }, append: function (win) {
            win.appendTo(cvf.body);
        }, remove: function (win) {
            win.element.remove();
        }, clear: function () {
            cvf.body.empty();
        }, open: function (win) {
            this.clear();
            this.append(win);
        }, progress: function (window) {
            window.find('.cvf-panel').addClass('cvf-loading');
        }, unprogress: function (window) {
            window.find('.cvf-panel').removeClass('cvf-loading');
        }
    });
})(jQuery, window);