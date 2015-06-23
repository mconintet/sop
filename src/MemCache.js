define({
    name: 'sop.MemCache',
    init: function () {
        var Data = function () {
            this.content = null;
            this.timeout = 0;
        };

        /**
         * @memberof sop
         * @constructor
         */
        var MemCache = function () {
            this._storage = {};
        };

        MemCache.prototype.has = function (key) {
            return this._storage.hasOwnProperty(key);
        };

        MemCache.prototype.get = function (key, defaultValue) {
            defaultValue = arguments.length === 1 ? null : defaultValue;

            if (this._storage.hasOwnProperty(key)) {
                var data = this._storage[key];
                if (data.timeout === 0) return data.content;
                if (data.timeout > new Date().getTime()) return data.content;
            }

            return defaultValue;
        };

        MemCache.prototype.set = function (key, val, timeout) {
            timeout = parseInt(timeout);
            timeout = isNaN(timeout) || timeout < 0 ? 0 : timeout;

            timeout = timeout === 0 ? 0 : new Date().getTime() + timeout * 1000;

            var data = new Data();
            data.timeout = timeout;
            data.content = val;

            this._storage[key] = data;
            return this;
        };

        return MemCache;
    }
});