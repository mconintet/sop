define({
    name: 'sop.Cookie',
    init: function () {
        var Cookie = function () {
            this.name = '';
            this.val = '';
            this.expire = 0;
        };

        Cookie.get = function (key) {
            var cookies = document.cookie.split('; '), i = 0, len = cookies.length, cookie;

            for (; i < len; i++) {
                cookie = cookies[i].split('=');
                if (cookie.length === 2 && decodeURIComponent(cookie[0]) === key)
                    return decodeURIComponent(cookie[1]);
            }

            return null;
        };

        Cookie.set = function (key, val, expire, path, domain, secure) {
            if (expire) {
                switch (expire.constructor) {
                    case Number:
                        expire = expire === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + expire;
                        break;
                    case String:
                        expire = "; expires=" + expire;
                        break;
                    case Date:
                        expire = "; expires=" + expire.toUTCString();
                        break;
                }
            } else {
                expire = '';
            }

            domain = domain ? '; domain=' + domain : '';
            path = path ? '; path=' + path : '';
            secure = secure ? ' secure' : '';

            document.cookie = sop.sFormat(
                '{0}={1}{2}{3}{4}{5}',
                encodeURIComponent(key),
                encodeURIComponent(val),
                expire,
                domain,
                path,
                secure
            );

            return this;
        };

        Cookie.remove = function (key) {
            this.set(key, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
        };

        return Cookie;
    }
});