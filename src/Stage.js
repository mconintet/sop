define({
    name: 'sop.Stage',
    requires: ['sop.Template', 'sop.Ajax', 'sop.Message'],
    init: function (Tpl, Ajax, Msg) {
        var Stage = function () {
            sop.Observable.call(this);

            this.debug = false;

            this.route = '';
            this.layout = '';
            this.layoutFromUrl = '';

            this._layout = null;

            this.isReady = false;

            this.registerEvents([
                'ready',
                'beforeRender',
                'afterRender',
                'beforeShow',
                'afterShow',
                'beforeHide',
                'afterHide'
            ]);

            this._autoAbortTasks = [];
        };

        sop.extendProto(Stage, sop.Observable);

        Stage.prototype._init = function () {
            this._layout = new Tpl(this.layout, this.debug).getCTpl();
            this.on('afterHide', this._destroy.bind(this));
        };

        Stage.prototype._resolveUrl = function () {
            if (!/^https?/.test(this.layoutFromUrl)) {
                if (this.layoutFromUrl[0] !== '/') {
                    this.layoutFromUrl = '/' + this.layoutFromUrl;
                }

                this.layoutFromUrl = sop.loadJs.defaultPrefix + this.layoutFromUrl;
            }
        };

        Stage.prototype.init = function () {
            if (this.isReady)
                return;

            this._resolveUrl();
            if (this.layoutFromUrl) {
                var me = this, ajax = Ajax.create({
                    url: me.layoutFromUrl,
                    dataType: 'string',
                    success: function (html) {
                        me.layout = html;
                        me._init();
                        me.ready = true;

                        me.fire('ready');
                    },
                    error: function () {
                        throw new Error('failed to load remote stage: ' + me.layoutFromUrl);
                    }
                });

                ajax.send();
            } else {
                this._init();
                this.ready = true;
                this.fire('ready');
            }
        };

        Stage.prototype.render = function (context) {
            var html;
            this.fire('beforeRender');
            html = this._layout.render(context);
            this.fire('afterRender');

            return html;
        };

        Stage.prototype.getMessage = function () {
            return Msg.fromHash();
        };

        Stage.prototype.addAutoAbortTask = function (task) {
            this._autoAbortTasks.push(task);
        };

        Stage.prototype._destroy = function () {
            this._autoAbortTasks.forEach(function (t) {
                if (!t.isStopped()) {
                    t.abort();
                }
            });

            this._autoAbortTasks = [];
        };

        return Stage;
    }
});