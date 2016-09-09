/*
*  原模块有BUG，Github上提了issue，但不知道作者何时能够修改，于是fork了一份本地修改。。
*
* */

var cheerio = require('cheerio');

(function () {
        function isRedirect(status) {
                if (status != 301 && status != 302) {
                        return false;
                }
                return true;
        }

        function isPjax(request) {
                if (request.headers['X-PJAX'.toLowerCase()] == 'true') {
                        return true;
                }
                if (request.querystring && request.querystring.indexOf('_pjax=') != -1) {
                        return true;
                }
                return false;
        }

        function getPjaxContainer(request) {
                if (!!request.headers['X-PJAX-Container'.toLowerCase()]) {
                        return request.headers['X-PJAX-Container'.toLowerCase()];
                }
                if (request.url.indexOf('_pjax=') != -1) {
                        var container = request.url.match(new RegExp("[\?\&]" + '_pjax' + "=([^\&]+)", "i"));
                        if (container != null && container.length < 1) {
                                return container[1];
                        }
                }
                return false;
        }

        module.exports = function (opts) {
                return function *(next) {
                        yield next;
                        if (!isRedirect(this.status) && isPjax(this.req)) {
                                yield next;
                                var $ = cheerio.load(this.body);
                                var title = $.html('title');
                                var pjaxContainer = getPjaxContainer(this.req);
                                if (pjaxContainer) {
                                        //var container = $(pjaxContainer).html();
                                        var container = $(pjaxContainer).children();                    //兼容：jquery.pjax.js
                                        this.set('X-PJAX-URL', this.href);
                                        this.body = title + container;
                                }
                        }
                }
        }
})();