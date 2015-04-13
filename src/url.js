/**
 * @module sop.url
 */

define({
    name: 'sop.url',
    init: function () {
        var Url = function () {
            this.protocol = '';
            this.host = '';
            this.port = '';
            this.path = '';
            this.search = '';
            this.hash = '';
        };

        Url.prototype.toString = function () {
            return this.protocol + '//' + this.host +
                (this.port ? ':' + this.port : '') +
                (this.path ? '/' + this.path : '') +
                (this.search ? '?' + this.search : '') +
                (this.hash ? '#' + this.hash : '');
        };

        var parse = function (str) {
            var regOnLine = /^((ftp|http|https):)\/\/([a-zA-Z0-9.-]+)(:(\d+))?(\/[^?#]+)?(\?([^#]*))?(#(.*))?$/,
                regOffLine = /^file:\/\/([^?#]+)?(\?([^#]*))?(#(.*))?/,
                url = new Url();

            if (regOnLine.test(str)) {
                str.replace(regOnLine, function () {
                    url.protocol = arguments[1];
                    url.host = arguments[3];
                    url.port = arguments[5] || '';
                    url.path = arguments[6] || '';
                    url.search = arguments[7] || '';
                    url.hash = arguments[9] || '';

                    url.search = url.search.length > 1 ? url.search : '';
                });
            } else if (regOffLine.test(str)) {
                str.replace(regOffLine, function () {
                    url.protocol = 'file:';
                    url.path = arguments[1] || '';
                    url.hash = arguments[4] || '';
                    url.search = arguments[2] || '';

                    url.search = url.search.length > 1 ? url.search : '';
                });
            }

            return url;
        };

        /**
         * for this '#c/a/?get=test'
         * return below:
         * {
         *      path: 'c/a/',
         *      search: '?get=test'
         * }
         * @param str
         * @returns {{}}
         */
        var parseHash = function (str) {
            var regHash = /^#([^?]+)(\?.*)?$/,
                ret = {
                    path: '',
                    search: ''
                };

            str.replace(regHash, function () {
                ret['path'] = arguments[1];
                ret['search'] = arguments[2] ? arguments[2] : '';
            });

            return ret;
        };

        var parseSearch = function (str) {
            if (str[0] === '?') {
                str = str.slice(1);
            }

            var ret = {}, kv = str.split('&'), i = 0, len = kv.length, p;
            for (; i < len; i++) {
                p = kv[i].split('=');
                if (p.length > 0) {
                    ret[p[0]] = decodeURIComponent(p.length > 1 ? p[1] : '');
                }
            }

            return ret;
        };

        return /** @alias module:sop.url */ {
            /** @class */
            Url: Url,
            parse: parse,
            parseHash: parseHash,
            parseSearch: parseSearch
        };
    }
});