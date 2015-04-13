define({
    name: 'sop.Url',
    init: function () {
        /**
         * @class
         * @memberof sop
         */
        var Url = function () {
            /** @prop {String} protocol Example: 'http:' */
            this.protocol = '';
            /** @prop {String} host Example: 'example.com' */
            this.host = '';
            /** @prop {String} port Example: '8080' */
            this.port = '';
            /** @prop {String} path Example: '/index.html' */
            this.path = '';
            /** @prop {String} search Example: '?k=v' */
            this.search = '';
            /** @prop {String} hash Example: '#anchor' */
            this.hash = '';
        };

        /**
         * Converts url to string
         *
         * @returns {String}
         */
        Url.prototype.toString = function () {
            return this.protocol + '//' + this.host +
                (this.port ? ':' + this.port : '') +
                (this.path ? '/' + this.path : '') +
                (this.search ? '?' + this.search : '') +
                (this.hash ? '#' + this.hash : '');
        };

        /**
         * Parses url string
         *
         * @param {String} str Url string to be parsed
         * @returns {sop.Url}
         */
        Url.parse = function (str) {
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
         * For this `#c/a/?get=test`
         * return below:
         *
         *     {
         *          path: 'c/a/',
         *          search: '?get=test'
         *     }
         *
         * @param str {String} Hash string to be operated
         * @returns {{path: string, search: string}}
         */
        Url.parseHash = function (str) {
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

        /**
         * For example:
         *
         *     var p = sop.url.parseSearch('?k1=v1&k2=v2');
         *     console.log(p);
         *     // p will be:
         *     // {
         *     //     k1 : 'v1',
         *     //     k2 : 'v2'
         *     //  }
         *
         * @param str {String} Search string to be operated
         * @returns {{}}
         */
        Url.parseSearch = function (str) {
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

        return Url;
    }
});
