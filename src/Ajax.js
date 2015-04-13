define({
    name: 'sop.Ajax',
    init: function () {
        var defaultCfg = {
            url: '',
            type: 'GET',
            async: true,
            data: {},
            dataType: 'json',
            before: null,
            success: null,
            complete: null,
            error: null,
            abort: null,
            timeout: 0
        };

        /**
         * @class
         * @memberof sop
         * @param cfg
         * @param {String} cfg.url Url to load resource from
         * @param {String} [cfg.type=GET] Request type
         * @param {Boolean} [cfg.async=true] Uses async or not, default is async
         * @param {Object|String} [cfg.data={}] Request params, default is an new empty object
         * @param {String} [cfg.dataType=json] Type of response text. Response text will be converted into object if this value
         * is 'json' and default value is 'json'. Another optional value is 'string'.
         * @param {Function} [cfg.before=null] Callback will be executed before sending
         * @param {Function} [cfg.success=null] Callback will be executed once succeed
         * @param {Function} [cfg.complete=null] Callback will be executed once completed
         * @param {Function} [cfg.error=null] Callback will be executed once error occurred
         * @param {Function} [cfg.abort=null] Callback will be executed once aborted
         * @param {Number} [cfg.timeout=0] Timeout of requesting, default is '0' it means no timeout
         */
        var Ajax = function (cfg) {
            sop.Observable.call(this);

            this.registerEvents([
                'before',
                'success',
                'complete',
                'error',
                'abort'
            ]);

            sop.extend(this, defaultCfg, cfg);

            this.xhr = new XMLHttpRequest();

            if (sop.isFunction(cfg['before']))
                this.on('before', cfg.before);

            if (sop.isFunction(cfg['success']))
                this.on('success', cfg.success);

            if (sop.isFunction(cfg['complete']))
                this.on('complete', cfg.complete);

            if (sop.isFunction(cfg['error']))
                this.on('error', cfg.error);

            if (sop.isFunction(cfg['abort']))
                this.on('abort', cfg.abort);

            this.id = sop.generateId();

            this._isStopped = false;
        };

        sop.extendProto(Ajax, sop.Observable);

        Ajax.prototype._initXhr = function () {
            if (!this.url)
                console.error('opts.url can not empty!');

            if (!sop.isString(this.data) && !sop.isObject(this.data))
                console.error('opts.data muse be String or Pure Object!');

            this.data = sop.oToQueryString(this.data);

            if (!sop.isNumeric(this.timeout) || (this.timeout = parseInt(this.timeout)) < 0)
                console.error('opts.timeout must be positive number!');

            var xhr = new XMLHttpRequest();

            if (this.type === 'GET' && this.data) {
                this.url = this.url + '?' + this.data;
            }

            xhr.open(this.type, this.url, !!this.async);

            xhr.onload = (function (me) {
                return function () {
                    clearTimeout(me.timeoutHandler);

                    if (this.status === 200) {
                        var response = null;

                        if (me.dataType === 'string') {
                            response = this.responseText;
                        } else if (me.dataType === 'json') {
                            response = sop.sToObject(this.responseText);
                        }

                        if (sop.isUndefined(response) && me.dataType === 'json') {
                            me.fire('error', new Error('parse json error, response text is ' + this.responseText));
                        } else {
                            me.fire('success', response);
                        }
                    } else {
                        //network error
                        me.fire('error', new Error('Network error, code is ' + this.status));
                    }

                    me.fire('complete');
                    Ajax.remove(me);

                    this._isStopped = true;
                };
            })(this);

            this.xhr = xhr;
        };

        Ajax.prototype._onAbort = function () {
            this.xhr.abort();

            this.fire('abort');
            this.fire('complete');

            Ajax.remove(this);

            this._isStopped = true;
        };

        /**
         * Start to send request to remote server
         */
        Ajax.prototype.send = function () {
            this._initXhr();
            this.fire('before');

            Ajax.add(this);
            this.xhr.send(this.data);

            if (this.timeout) {
                this.timeoutHandler = this._onAbort.delay(this.timeout, this);
            }
        };

        /**
         * Ajax is stopped or not
         * @returns {boolean}
         */
        Ajax.prototype.isStopped = function () {
            return this._isStopped;
        };

        /**
         * Aborts this ajax request
         */
        Ajax.prototype.abort = function () {
            this.xhr.abort();
            this._onAbort();
        };

        var store = {};

        /**
         * Adds alive ajax, this method will be called automatically before sending, so if you want to add your own
         * ajax you should follow steps like below:
         *
         *     var ajax = new Ajax(cfg);
         *     // adding must before sending
         *     sop.Ajax.add(ajax);
         *     ajax.send();
         *
         * @param ajax {sop.Ajax} Ajax to be added
         * @returns {sop.Ajax}
         */
        Ajax.add = function (ajax) {
            if (store[ajax.id]) {
                throw new Error('ajax with id: ' + ajax.id + ' already exists');
            }

            store[ajax.id] = ajax;
            return this;
        };

        /**
         * Removes ajax
         *
         * @param ajax {sop.Ajax} Ajax to be removed
         * @returns {sop.Ajax}
         */
        Ajax.remove = function (ajax) {
            delete store[ajax.id];
            return this;
        };

        /**
         * Clears internal store
         *
         * @returns {sop.Ajax}
         */
        Ajax.clear = function () {
            store = {};
            return this;
        };

        /**
         * Returns internal store
         *
         * @returns {{}} Internal store
         */
        Ajax.all = function () {
            return store;
        };

        /**
         * Gets the count of all alive requests
         *
         * @returns {Number} Count
         */
        Ajax.count = function () {
            return sop.oKeys(store).length;
        };

        /**
         * Aborts all alive ajax requests
         */
        Ajax.abort = function () {
            sop.oForEach(store, function (ajax) {
                ajax.abort();
            })
        };

        /**
         * Creates new ajax
         *
         * @param cfg
         * @param {String} cfg.url Url to load resource from
         * @param {String} [cfg.type=GET] Request type
         * @param {Boolean} [cfg.async=true] Uses async or not, default is async
         * @param {Object|String} [cfg.data={}] Request params, default is an new empty object
         * @param {String} [cfg.dataType=json] Type of response text. Response text will be converted into object if this value
         * is 'json' and default value is 'json'. Another optional value is 'string'.
         * @param {Function} [cfg.before=null] Callback will be executed before sending
         * @param {Function} [cfg.success=null] Callback will be executed once succeed
         * @param {Function} [cfg.complete=null] Callback will be executed once completed
         * @param {Function} [cfg.error=null] Callback will be executed once error occurred
         * @param {Function} [cfg.abort=null] Callback will be executed once aborted
         * @param {Number} [cfg.timeout=0] Timeout of requesting, default is '0' it means no timeout
         * @param cfg
         * @returns {Ajax}
         */
        Ajax.create = function (cfg) {
            return new Ajax(cfg);
        };

        return Ajax;
    }
});