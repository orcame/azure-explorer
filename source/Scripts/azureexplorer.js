(function ($, ja, global) {
    var category = {
        document: {
            extensions: ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
            icon: 'fa-book'
        }, video: {
            extensions: ['rm', 'rmvb', 'wmv', 'avi', 'mp4'],
            icon: 'fa-video-camera'
        }, picture: {
            extensions: ['png', 'jpg', 'jpeg', 'bmp'],
            icon: 'fa-picture-o'
        }
    }, getCategory = function (extension) {
        if (extension) {
            extension = extension.toLowerCase();
            for (var n in category) {
                var t = category[n];
                if (t.extensions.indexOf(extension) >= 0) {
                    return { type: n, icon: t.icon };
                }
            }
        }
        return { type: 'other', icon: 'fa-file' };
    }, setBlobListEvent = function (win) {
        win.body.find('a[data-type="directory"]').click(function () {
            var name = $(this).attr('data-fullname');
            ae.openDirector(name);
        });
        win.body.find('a[data-blob="true"]').click(function () {
            var blob = ae.container.getBlob($(this).attr('data-fullname'));
            ae.openBlob(blob);
        });
        win.body.find('.dir-path span').click(function () {
            var pre = $(this).prevAll();
            var name = [];
            pre.each(function () {
                name.push($(this).text());
            })
            name.push($(this).text());
            ae.openDirector(name.join('/'));
        });
        win.body.find('.blobtoolbar-property').click(function () {
            var blobName = $(this).closest('tr').attr('data-blobname');
            ae.openProperties(ae.container.getBlob(blobName));
        })
        win.body.find('.blobtoolbar-metadata').click(function () {
            var blobName = $(this).closest('tr').attr('data-blobname');
            ae.openMetadata(ae.container.getBlob(blobName));
        })
        win.body.find('.blobtoolbar-download').click(function () {
            var blobName = $(this).closest('tr').attr('data-blobname');
            ae.container.getBlob(blobName).download();
        })
    };
    var cWin = cvf.createWindow({
        title: 'Containers',
        url: 'views/containerList.html',
        background: 'bg-home',
        beforeRender: function (data) {
            this.renderData = { list: data };
        }, afterRender: function () {
            this.body.find('.cvf-box').click(function () {
                var cname = $(this).attr('data-name');
                ae.openContainer(cname);
            });
        }
    }), bWin = cvf.createWindow({
        title: 'Blobs',
        url: 'views/blobList.html',
        beforeRender: function (data) {
            this.renderData = data;
            data.getCategory = getCategory;
            data.dir = ae.container.FullName || '';
        }, afterRender: function () {
            setBlobListEvent(this);
        }
    }), bdWin = cvf.createWindow({
        title: 'Content',
        url: 'Views/blob.html'
    }), pWin = cvf.createWindow({
        title: 'Properties',
        width: 'small',
        url: 'views/property.html'
    }), mWin = cvf.createWindow({
        title: 'Metadata',
        url: 'views/property.html'
    });
    var ae = window.ae = {
        settings: {
            accountName: 'neeostorage',
            sharedKey: 'AI1bp+5dWJ85eq4UD1usNDqiCJv0flnpNZrdhLuR+f/9Dx+QTtpi9qfQAbAqrqE98r6vZczcBYc4qsakaFKCuA==',
            endpoint: 'core.chinacloudapi.cn',
            containerSas: ''
        },
        init: function () {
            this.account = ja.storage.account(this.settings.accountName, this.settings.sharedKey, this.settings.endpoint);
            this.container = ja.storage.container(this.settings.containerSas);
        },
        enroll: function () {
            cvf.nav.register([{
                title: 'Settings',
                icon: 'fa-gear',
                url: 'views/settings.html',
                settings: ae.settings,
                success: function (element, content) {
                    element.find('#btnSettings').click(function () {
                        element.find('input[id],sel[id]').each(function () {
                            ae.settings[$(this).attr('id')] = $(this).val();
                        });
                        ae.init();
                        ae.listContainers();
                        cvf.nav.close();
                    })
                }
            }, {
                title: 'Link',
                icon: 'fa-link'
            }])
        }, listContainers: function () {
            cWin.open().asyncRender(function (s, e) { ae.account.listContainers(s, e) });
        }, openContainer: function (name) {
            bWin.title('Blobs -- ' + name);
            cWin.openChild(bWin);
            ae.container = ae.account.getContainer(name);
            bWin.asyncRender(function (s, e) {
                ae.container.children(s, e);
            });
        }, openDirector: function (name) {
            var dir = ae.container.getDirectory(name);
            ae.directory = dir;
            bWin.asyncRender(function (s, e) {
                dir.children(s, e);
            }, null, function (data) {
                this.renderData = data;
                data.getCategory = getCategory;
                data.dir = dir.FullName;
            });
        }, openBlob: function (blob) {
            var type = getCategory(blob.Extension);
            if (type.type == 'other' || type.type == 'document') {
                blob.download();
            } else {
                bdWin.title(blob.Name);
                bWin.openChild(bdWin);
                if (!ae.container.SAS) {
                    var d = new Date();
                    var sas = blob.getSasUri({ permission: 'r', startTime: d.setDate(d.getDate() - 1), endTime: d.setDate(d.getDate() + 2) });
                    bdWin.render({ blob: blob, sas: sas, type: type });
                }
            }
        }, openProperties: function (blob) {
            bWin.openChild(pWin);
            pWin.asyncRender(function (s, e) {
                blob.getProperties(s, e);
            })
        }, openMetadata: function (blob) {
            bWin.openChild(mWin);
            mWin.asyncRender(function (s, e) {
                blob.getMetadata(s, e);
            });
        }
    }
    ae.init();
    ae.enroll();
    ae.listContainers();
    global.ae = ae;
})(jQuery, jAzure, window);