﻿(function (e, t) { var n = function () { return new n.fn.init }; n.prototype = { init: function () { return this } }; $.extend(n, { maxThread: 7, protocol: "https", ajax: function (e) { $.ajax({ url: e.url, type: e.type, data: e.data, dataType: e.dataType, ifModified: true, headers: e.headers, cache: true, processData: false, xhr: function () { var t = $.ajaxSettings.xhr(); if (t.upload && e.progress) { t.upload.addEventListener("progress", function (t) { e.progress(t) }, false) } return t }, beforeSend: function (t) { console.log("lastModified", $.lastModified); if (e.before) { e.before(t) } }, success: function (t, n, r) { if ($.isXMLDoc(t)) { t = $.xml2json(t) } if (e.convertor) { t = e.convertor(t) } if (e.success) { if (e.object) { e.success.call(e.object, t, n, r) } else { e.success(t, n, r) } } }, error: function (t, n, r) { if (e.error) { if (e.object) { e.error.call(e.object, n, r) } else { e.error(n, r) } } } }) }, getResponseHeaders: function (e, t, n) { var r = e.getAllResponseHeaders(), i = {}, t = t || ""; if (n === undefined) { n = true } if (r) { $.each(r.split("\r\n"), function () { var e = this.valueOf(); if (!e || t && e.indexOf(t) != 0) { return } var r = e.split(":"); if (n) { i[r[0].substring(t.length)] = r[1].trim() } else { i[r[0]] = r[1].trim() } }) } return i }, setMaxThread: function (e) { if (!isNaN(e) && e >= 0) { this.maxThread = parseInt(e) } }, setBlockSize: function (e) { if (!isNaN(e)) { var t = parseInt(e); this.blockSize = Math.max(1, Math.min(t, maxBlockSize)) } }, defineReadonlyProperties: function (e, t) { for (var n in t) { Object.defineProperty(e, n, { value: t[n], writable: false, configurable: false, enumerable: true }) } } }); n.prototype.init.prototype = n.prototype; n.fn = n.prototype; t.jAzure = n; if (!t.ja) { t.ja = n } })(jQuery, window); (function (e, t, n) { var r = e, i = r.storage, s = r.storage.web; var o = function (e, t, n) { return r.protocol + "://" + t + "." + e + "." + (n || i.serviceEndpoint) + "/" }; var u = function (e, t, n) { return new u.prototype.init(e, t, n) }; u.prototype.init = function (e, t, n) { r.defineReadonlyProperties(this, { Name: e, BlobUrl: o("blob", e, n), TableUrl: o("table", e, n), QueueUrl: o("queue", e, n), web: s(e, t) }); return this }; u.prototype.init.prototype = u.prototype; t.extend(u.prototype, { getBlobServiceProperties: function (e, t) { this.web.request(this.BlobUrl, "GET", { restype: "service", comp: "properties" }).send(e, t) }, setBlobServiceProperties: function (e, n, r) { var i = t.json2xml({ StorageServiceProperties: e }); this.web.request(this.BlobUrl, "PUT", { restype: "service", comp: "properties" }, { headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: i, success: n, error: r }).send() }, getBlobServiceStats: function (e, t) { this.web.request(this.BlobUrl, "GET", { restype: "service", comp: "stats" }).send(e, t) } }); r.storage.account = u })(jAzure, jQuery, window); (function (e, t, n) { function o(e) { var t = new RegExp("http[s]?://[^/]*/([^?]*)"); var n = t.exec(e); return n && n[1].length > 0 ? n[1] : "/" } function u(e) { var t = new RegExp("([^&?=]+)=([^=&]*)", "g"), n = []; var r = t.exec(e); while (r) { n.push({ name: r[1], value: r[2] }); r = t.exec(e) } return n } function a(e) { var t = []; for (var n in e) { if (n.indexOf("x-ms-") == 0) { t.push({ name: n.toLowerCase(), value: e[n].trim(), toString: function () { return this.name + ":" + this.value.trim().replace(/\r\n/g, "") } }) } } t.sort(function (e, t) { return e.name > t.name ? 1 : -1 }); return t.join(s.newLineChar) } function f(e, t, n) { var r = ["/", t]; var i = o(e); i = i.replace(t + "-secondary", t); if (i) { if (i != "/") { r.push("/") } r.push(encodeURI(i)) } var a = u(e); if (!n) { a.sort(function (e, t) { return e.name.toLowerCase() > t.name.toLowerCase() ? 1 : -1 }); var f = a.length; for (var l = 0; l < f; l++) { var c = a[l]; r.push(s.newLineChar); r.push(c.name.toLowerCase()); r.push(":"); r.push(encodeURI(c.value)) } } else { var f = a.length; if (f > 0) { r.push(s.newLineChar) } for (var l = 0; l < f; l++) { if (a[l].name == "comp") { r.push("?comp="); r.push(a[l].value) } } } return r.join("") } function l(e, t, n) { var r = e.isSharedKeyLiteOrTableService ? ["Content-MD5", "Content-Type", "Date"] : ["Content-Encoding", "Content-Language", "Content-Length", "Content-MD5", "Content-Type", "Date", "If-Modified-Since", "If-Match", "If-None-Match", "If-Unmodified-Since", "Range"]; var i = [e.type], o = r.length; for (var u = 0; u < o; u++) { var l = e.headers[r[u]]; i.push(l != undefined ? l : "") } if (!e.isSharedKeyLiteOrTableService && e.type == "PUT" || e.type == "DELETE" || e.type == "HEAD") { i[3] = e.data ? e.data.length : 0 } i.push(a(e.headers)); i.push(f(e.url, t, e.isSharedKeyLiteOrTableService)); var c = CryptoJS.enc.Utf8.parse(i.join(s.newLineChar)); var h = CryptoJS.enc.Base64.parse(n); var p = CryptoJS.HmacSHA256(c, h); var d = p.toString(CryptoJS.enc.Base64); var v = t + ":" + d; if (e.isSharedKeyLiteOrTableService) { return "SharedKeyLite " + v } else { return "SharedKey " + v } } function p(e) { var t = !c.test(e.type), n = e.url; if (!t && e.data) { n += (h.test(n) ? "&" : "?") + e.data } return n } function d(e) { e.headers = e.headers || {}; var n = p(e); if (e.ifModified) { if (t.lastModified[n]) { e.headers["If-Modified-Since"] = t.lastModified[n] } if (t.etag[n]) { e.headers["If-None-Match"] = t.etag[n] } } e.headers["x-ms-version"] = s.x_ms_version; e.headers["x-ms-date"] = (new Date).toGMTString(); if (e.headers["Content-Type"]) { e.contentType = e.headers["Content-Type"] } } function v(e, t) { d(e); if (t) { e.headers["Authorization"] = l(e, t.accountName, t.sharedKey) } } function m(e) { var t = e.url; if (e.params) { var n = []; for (var r in e.params) { n.push(r + "=" + e.params[r]) } if (t.indexOf("?") > 0) { t += "&" + n.join("&") } else { t += "?" + n.join("&") } e.url = t } } function y(e, n, r, i, s) { if (s) { t.extend(this, s) } this.web = e; this.type = r; this.url = n; this.params = i } var r = e, i = 4096 * 1024; var s = { newLineChar: "\n", x_ms_version: "2013-08-15", blockSize: i, serviceEndpoint: "core.windows.net" }; e.storage = s; var c = /^(?:GET|HEAD)$/, h = /\?/; var g = function (e, t) { return new g.prototype.init(e, t) }; g.prototype = { init: function (e, t) { var n = e && t ? { accountName: e, sharedKey: t } : null; this.sendRequest = function (e) { e.url = e.url; m(e); e.ifModified = true; v(e, n); r.ajax(e) } }, request: function (e, t, n, r) { return new y(this, e, t, n, r) } }; g.prototype.init.prototype = g.prototype; y.prototype = { send: function (e, t) { if (e) { this.success = e } if (t) { this.error = t } this.web.sendRequest(this) } }; e.storage.web = g })(jAzure, jQuery, window); (function (e, t, r) { var i = e, s = i.storage, o = i.storage.web; t.extend(i.storage.account.prototype, { getContainer: function (e) { var t = u(null); i.defineReadonlyProperties(t, { Name: e, Url: this.BlobUrl + e }); t.web = this.web; return t }, listContainers: function (e, n, r) { var i = t.extend({}, e, { comp: "list" }), s = this; var o = function (e) { var n = [], r = e.Containers.Container; if (t.isArray(r)) { var i = r.length; for (var o = 0; o < i; o++) { var u = s.getContainer(r[o].Name); u.Properties = r[o].Properties; n.push(u) } } else { var u = s.getContainer(r.Name); u.Properties = r.Properties; n.push(u) } return n }; this.web.request(this.BlobUrl, "GET", i, { convertor: o, success: n, error: r }).send() } }); var u = function (e) { return new u.prototype.init(e) }; var a = "x-ms-meta-"; var f = { Etag: "ETag", Last_Modified: "Last-Modified", LeaseState: "x-ms-lease-state", LeaseStatus: "x-ms-lease-status", LeaseDuration: "x-ms-lease-duration" }; u.prototype = { init: function (e) { i.defineReadonlyProperties(this, { SAS: e }); if (e && e.indexOf("http") == 0) { i.defineReadonlyProperties(this, { Url: e }) } this.web = o(e); return this }, create: function (e, t) { this.web.request(this.Url, "PUT", { restType: "container" }).send(e, t) }, "delete": function (e, t) { }, getProperties: function (e, t) { var n = this; n.web.request(this.Url, "GET", { restype: "container" }).send(function (t, r, i) { var s = {}; for (var o in f) { s[o] = i.getResponseHeader(f[o]) } n.Properties = s; if (e) { e.call(n, n.Properties) } }, t) }, getMetadata: function (e, t) { var n = this; n.web.request(this.Url, "GET", { restype: "container", comp: "metadata" }, { success: function (t, r, i) { n.Metadata = i.getResponseHeaders(a); if (e) { e.call(n, n.Metadata) } }, error: t }).send() }, setMetadata: function (e, t, r) { if (e) { var i = this; i.web.reqeust(this.Url, "PUT", { restype: "container", comp: "metadata" }, { before: function (t) { for (n in e) { t.setRequestHeader(a + n, e[n]) } }, success: t, error: r }).send() } }, getACL: function (e, t) { var n = this; n.web.request(this.Url, "GET", { restype: "container", comp: "acl" }, { success: function (t, r, i) { var s = {}; s.PublicAccess = i.getResponseHeader("x-ms-blob-public-access"); s.SignedIdentifiers = t; n.ACL = s; if (e) { e.call(n, n.ACL) } }, error: t }).send() }, setACL: function (e, n, r) { if (e) { var i = { "Content-Type": ", text/plain;charset=UTF-8" }; if (e.PublicAccess) { i["x-ms-blob-public-access"] = e.PublicAccess } this.web.request(this.Url, "PUT", { restype: "container", comp: "acl" }, { headers: i, data: t.json2xml({ SignedIdentifiers: e.SignedIdentifiers }), success: n, error: r }).send() } }, lease: function (e, t) { alert("lease is comming...") } }; u.prototype.init.prototype = u.prototype; e.storage.container = u })(jAzure, jQuery, window); (function (e, t, r) { function v(e) { regex = new RegExp("http(s?)://[^/]*/[^/]*/([^?]*)", "g"); var t = regex.exec(e); if (!t) { throw "invalid blob url." } var n = t[2]; return n } function E(e, t) { var n = "" + e; while (n.length < t) { n = "0" + n } return n } var i = "PageBlob", s = "BlockBlob", o = e, u = o.storage, a = o.storage.container, f = o.storage.web; var l = function (e, n) { if (n) { var r = []; if (!t.isArray(n)) { n = [n] } var i = e instanceof a ? "" : e.FullName; var s = n.length; for (var o = 0; o < s; o++) { var u = n[o]; var f = u.Name.substring(i.length); var l = e.getBlob(f, u.Properties.BlobType); l.Properties = u.Properties; l.web = e.web; r.push(l) } return r } return [] }, c = function (e, n) { if (n) { var r = []; if (!t.isArray(n)) { n = [n] } var i = n.length; var s = h(e.Url); for (var o = 0; o < i; o++) { var u = p(s.endpoint, s.containerName, n[o].Name, s.sas); var a = g(u); a.web = e.web; r.push(a) } return r } return [] }, h = function (e) { var t = new RegExp("(http[s]?://[^/]*)/([^/]*)/?([^?]*)(.*)", "g"); var n = t.exec(e); if (!n) { throw "invalid blob url." } return { endpoint: n[1], containerName: n[2], blobName: n[3], sas: n[4] } }, p = function () { var e = new RegExp("([^:])/{2,}", "g"); return Array.prototype.slice.call(arguments).join("/").replace(e, "$1/") }, d = function (e) { if (!e) { return e } var t = ["B", "KB", "MB", "GB", "TB", "PB"]; if (typeof e == "string") { e = parseInt(e) } for (var n = 0; n < t.length; n++) { if (e < 1024) { return e.toFixed(2) + t[n] } e = e / 1024 } return e }; window.splitUrl = h; t.extend(a.prototype, { listBlobs: function (e, t, n) { if (typeof e == "function") { n = t; t = e; e = null } e = e || {}; e.restype = "container"; e.comp = "list"; var r = this; var i = function (e) { var t = {}; t.blobs = l(r, e.Blobs.Blob); t.directories = c(r, e.Blobs.BlobPrefix); t.nextMarker = e.NextMarker; t.prefix = e.Prefix; return t }; this.web.request(this.Url, "GET", e, { convertor: i, success: t, error: n }).send() }, children: function (e, n, r) { if (typeof e == "function") { r = n; n = e; e = {} } t.extend(e, { delimiter: "/" }); return this.listBlobs.call(this, e, n, r) }, getDirectory: function (e) { var t = h(this.Url); url = p(t.endpoint, t.containerName, e + t.sas); var n = g(url); n.web = this.web; return n }, getBlob: function (e, t) { if (!t) { t = s } if (t != i && t != s) { throw "the blob type can only be " + s + " or " + i + ", by default is " + s + "." } var n = h(this.Url); url = p(n.endpoint, n.containerName, e + n.sas); var r = y(url, t); r.web = this.web; return r }, getBlockBlob: function (e) { return this.getBlob(e, s) }, getPageBlob: function (e) { return this.getPageBlob(e, i) } }); var g = function (e) { return new g.prototype.init(e) }; g.prototype = { init: function (e) { var t = h(e); var n = t.blobName; var e = p(t.endpoint, t.containerName, t.sas); var r = n.replace(/^\/|\/?$/g, ""); var i = r.substring(r.lastIndexOf("/") + 1); o.defineReadonlyProperties(this, { Url: e, Name: i, FullName: n }); this.web = f(); return this }, getBlob: function (e, t) { e = p(this.FullName, e); return a.prototype.getBlob.call(this, e, t) }, getBlockBlob: function (e) { return this.getBlob(e, s) }, getPageBlob: function (e) { return this.getBlob(e, i) }, listBlobs: function (e, n, r) { var i = {}; if (typeof e == "object") { t.extend(i, e) } else if (typeof e == "function") { r = n; n = e } i.prefix = p(this.FullName, i.prefix || ""); return a.prototype.listBlobs.call(this, i, n, r) }, getDirectory: function (e) { e = p(this.FullName, e, "/"); return a.prototype.getDirectory.call(this, e) }, children: function (e, n, r) { var i = {}; if (typeof e == "object") { t.extend(i, e) } else if (typeof e == "function") { r = n; n = e } i.delimiter = "/"; return this.listBlobs(i, n, r) }, parent: function () { if (this._parent === undefined) { if (this.FullName.indexOf("/") == this.FullName.length - 1) { this._parent = null } else { var e = this.Url, t = ""; if (e.indexOf("?") > 0) { t = e.substring(e.indexOf("?")); e = e.substring(0, e.length - t.length) } e = e.substring(0, e.length - this.Name.length); this._parent = g(e); this._parent.web = this.web() } } return this._parent } }; g.prototype.init.prototype = g.prototype; var y = function (e, t) { return new y.prototype.init(e, t) }; var b = "x-ms-meta-"; var w = { BlobType: "x-ms-blob-type", Cache_Control: "Cache-Control", Content_Disposition: "Content-Disposition", Content_Encoding: "Content-Encoding", Content_Language: "Content-Language", Content_Length: "Content-Length", Content_MD5: "Content-MD5", Content_Type: "Content-Type", Etag: "Etag", Last_Modified: "Last-Modified", LeaseState: "x-ms-lease-state", LeaseStatus: "x-ms-lease-status" }; y.prototype = { init: function (e, t) { var n = h(e), r = n.blobName, i = r.substring(r.lastIndexOf("/") + 1); o.defineReadonlyProperties(this, { Url: e, BlobType: t, Name: i, FullName: r }); this.web = f(); return this }, size: function (e) { var t = parseInt(this.Properties.Content_Length, 10); return e === false ? t : d(t) }, put: function (e, t, n) { this.upload(e, null, null, t, n) }, get: function (e, t) { this.download() }, snapshot: function (e, t, r) { if (typeof e == "function") { r = t; t = e; e = null } var i = {}; if (e) { for (n in e) { i["x-ms-meta-" + n] = e[n] } } this.web.request(this.Url, "PUT", { comp: "snapshot" }, { headers: i, success: t, error: r }).send() }, copy: function (e, t, r, i) { if (typeof t == r) { i = r; r = t, t = null } var s = { "x-ms-copy-source": e }; if (t) { for (n in t) { if (n == "metadata") { var o = t[n]; for (m in o) { s["x-ms-meta-" + m] = o[m] } } else { s[n] = t[n] } } } var u = this; u.web.request(this.Url, "PUT", null, { headers: s, success: function (e, t, n) { return { copyId: n.getResponseHeader("x-ms-copy-id"), copyStatus: n.getResponseHeader("x-ms-copy-status") } }, error: i }).send() }, abortCopy: function (e, t, n) { var r = { "x-ms-copy-action": "abort" }; this.web.request(this.Url, "PUT", { comp: "copy", copyid: e }, { headers: r, success: t, error: n }).send() }, getBlockList: function (e, t, n, r) { if (typeof e == "function") { n = e; r = t; e = "committed"; t = null } else if (typeof t == "function") { r = n; n = t; t = 0 } if (this.BlobType != s) { throw "The function only available for block blob" } if (["committed", "uncommitted", "all"].indexOf(e) == -1) { throw 'The block list type can only be "committed","uncommitted" or "all".' } var i = { comp: "blocklist", blocklisttype: e }; if (t) { i["snapshot"] = t } this.web.request(this.Url, "GET", i).send(n, r) }, getPageRanges: function () { }, upload: function (e, n, r, i, s) { var o = arguments.length; if (o == 2 || o == 3) { i = n; s = r } else if (o == 4) { i = n; s = i; r = n } if (!(e instanceof File)) { if (t.isArray(e)) { e = new Blob(e) } else { if (typeof e == "object") { e = new Blob([JSON.stringify(e)]) } else { e = new Blob([e]) } } } x.enqueueBlob(this, e, n, r, i, s); x.enqueueErrorBlocks(y); x.upload() }, download: function () { var e = "ja-blob-download-frame-"; var t = document.getElementById(e); if (t == null) { t = document.createElement("iframe"); t.id = e; t.style.display = "none"; document.body.appendChild(t) } t.src = this.Url }, "delete": function (e, t) { this.web.request(this.Url, "DELETE").send(e, t) }, setMetadata: function (e, t, r) { if (e) { var i = {}; for (n in e) { i[b + n] = e[n] } this.web.request(this.Url, "PUT", { comp: "metadata" }, { headers: i, success: t, error: r }).send() } }, setProperties: function (e, t, r) { if (e) { var i = {}; for (n in e) { i[w[n]] = e[n] } this.web.request(this.Url, "PUT", { comp: "properties" }, { headers: i, success: t, error: r }).send() } }, getMetadata: function (e, t) { var n = this; n.web.request(this.Url, "GET", { comp: "metadata" }, { before: function (e) { }, success: function (t, r, i) { n.Metadata = o.getResponseHeaders(i, b); if (e) { e.call(n, n.Metadata) } }, error: t }).send() }, getProperties: function (e, t) { var n = this; n.web.request(this.Url, "HEAD", null, { success: function (t, r, i) { var s = {}; for (var o in w) { s[o] = i.getResponseHeader(w[o]) } n.Properties = s; if (e) { e.call(n, n.Properties) } }, error: t }).send() } }; y.prototype.init.prototype = y.prototype; var S = function (e) { this.cp = e; this.pointer = e.pointer; this.content = e.file.slice(this.pointer, this.pointer + o.storage.blockSize); this.id = btoa("block-" + E(e.blocks.length, 6)).replace(/=/g, "a"); this.size = this.content.size; this.loaded = 0 }; S.prototype = { upload: function () { var e = this, t = new FileReader, n = this.cp, r = n.blob.web; t.onloadend = function (t) { if (t.target.readyState == FileReader.DONE) { var i = new Uint8Array(t.target.result); r.request(n.blob.Url, "PUT", { comp: "block", blockid: e.id }, { data: i, processData: false, headers: { "x-ms-blob-type": n.blob.BlobType, "Content-Type": n.type }, before: function (e) { if (!n.send) { if (n.before) { n.before.apply(n.blob, arguments) } } n.send = true }, progress: function (t) { n.loaded += t.loaded - e.loaded; e.loaded = t.loaded; if (n.progress) { n.progress.call(n.blob, { loaded: n.loaded, total: n.size }) } }, success: function () { if (n.loaded == n.size) { x.commit(n) } x.threads--; x.upload() }, error: function () { n.loaded -= e.loaded; n.errorBlocks.push(e); if (n.error) { n.error.apply(n.blob, arguments) } x.threads--; x.upload() } }).send() } }; t.readAsArrayBuffer(e.content) } }; var x = { blobQueue: {}, blockQueue: [], threads: 0, enqueueBlob: function (e, t, n, r, i, s) { if (!this.blobQueue[e.Url]) { var o = {}; o.blob = e; o.send = false; o.pointer = 0; o.file = t; o.size = t.size; o.loaded = 0; o.type = t.type; o.before = n; o.progress = r; o.success = i; o.error = s; o.blocks = []; o.errorBlocks = []; this.blobQueue[e.Url] = o } }, hasBlob: function (e) { return !!this.blobQueue[e.Url] }, dequeueBlob: function (e) { delete this.blobQueue[e.Url] }, enqueueErrorBlocks: function (e) { var t = this.blobQueue[e.Url]; if (t) { var n = t.errorBlocks.shift(); if (n) { this.blockQueue.push(n) } } }, enqueueAllErrorBlocks: function () { for (var e in this.blobQueue) { var t = this.blobQueue[e]; this.enQueueErrorBlocks(t.blob) } }, nextBlock: function () { for (key in this.blobQueue) { var e = this.blobQueue[key]; if (e.pointer < e.size) { var t = new S(e); e.blocks.push(t); e.pointer += t.size; return t } } return this.blockQueue.shift() }, upload: function () { this.commitAll(); while (o.maxThread == 0 || this.threads < o.maxThread) { var e = this.nextBlock(); if (e != null) { e.upload(); this.threads++ } else { break } } }, commit: function (e) { var t = e.blob.Url, n = [], r = e.blocks.length, i = e.blob.web; e.commiting = true; n.push('<?xml version="1.0" encoding="utf-8"?><BlockList>'); for (var s = 0; s < r; s++) { n.push("<Latest>" + e.blocks[s].id + "</Latest>") } n.push("</BlockList>"); i.request(t, "PUT", { comp: "blocklist" }, { data: n.join(""), headers: { "Content-Type": ", text/plain;charset=UTF-8" }, success: function () { if (e.success) { x.dequeueBlob(e.blob); e.success.apply(e.blob, arguments) } }, error: function () { e.commiting = false; if (e.error) { e.error.apply(e.blob, arguments) } } }).send() }, commitAll: function () { for (n in this.pool) { var e = this.pool[n]; if (e.loaded == e.size && !e.commiting) { this.commit(e) } } } } })(jAzure, jQuery, window)