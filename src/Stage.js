define({
    name: 'sop.Stage',
    requires: ['sop.Template', 'sop.Ajax', 'sop.Message'],
    init: function (Tpl, Ajax, Msg) {
        /**
         * @memberof sop
         * @constructor
         */
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

                this.layoutFromUrl = sop.getHomeUrl() + this.layoutFromUrl;
            }
        };

        /**
         * Initializes stage, it will be called automatically once stage has been registered by `sop.App.registerStage`
         */
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

        /**
         * Get rendered html of stage, it will be called automatically when stages are interacting
         *
         * @param context {Object} Context within render
         * @returns {String} Rendered html
         */
        Stage.prototype.render = function (context) {
            var html;
            this.fire('beforeRender');
            html = this._layout.render(context);
            this.fire('afterRender');

            return html;
        };

        /**
         * Get message of this stage
         *
         * @returns {sop.Message}
         */
        Stage.prototype.getMessage = function () {
            return Msg.fromHash();
        };

        /**
         * Add auto-abort task, auto-abort task will be abort automatically if it's still running after
         * it's associative stage has been hidden
         *
         * @param task
         */
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