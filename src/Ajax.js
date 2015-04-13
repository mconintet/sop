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
                    Ajax.aliveAjaxStore.remove(me);

                    this._isStopped = true;
                };
            })(this);

            this.xhr = xhr;
        };

        Ajax.prototype._onAbort = function () {
            this.xhr.abort();

            this.fire('abort');
            this.fire('complete');

            Ajax.aliveAjaxStore.remove(this);

            this._isStopped = true;
        };

        Ajax.prototype.send = function () {
            this._initXhr();
            this.fire('before');

            this.xhr.send(this.data);
            Ajax.aliveAjaxStore.add(this);

            if (this.timeout) {
                this.timeoutHandler = this._onAbort.delay(this.timeout, this);
            }
        };

        Ajax.prototype.isStopped = function () {
            return this._isStopped;
        };

        Ajax.prototype.abort = function () {
            this.xhr.abort();
            this._onAbort();
        };

        Ajax.aliveAjaxStore = (function () {
            var store = {};

            return {
                add: function (ajax) {
                    if (store[ajax.id]) {
                        throw new Error('ajax with id: ' + ajax.id + ' already exists');
                    }

                    store[ajax.id] = ajax;
                    return this;
                },
                remove: function (ajax) {
                    delete store[ajax.id];
                    return this;
                },
                clear: function () {
                    store = {};
                    return this;
                },
                all: function () {
                    return store;
                },
                count: function () {
                    return store.keys().length;
                }
            };
        })();

        Ajax.abort = function () {
            var allAliveAjax = this.aliveAjaxStore.all();
            allAliveAjax.each(function (ajax) {
                ajax.abort();
            });
        };

        Ajax.create = function (cfg) {
            return new Ajax(cfg);
        };

        return Ajax;
    }
});