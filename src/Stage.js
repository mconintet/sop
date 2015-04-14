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

            this._tmpDiv = document.createElement('div');
            this._childrenTpl = {};
        };

        sop.extendProto(Stage, sop.Observable);

        Stage.prototype._init = function () {
            this._processChildrenTpl();
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
         * Gets rendered string of child template
         *
         * @param name The name of child template
         * @param {Object} [context=sop.Message] The context to be used in render, default is the instance of `sop.Message`
         * being used in parent stage.
         * @returns {String} Rendered string
         */
        Stage.prototype.childTpl = function (name, context) {
            context = context || this.getMessage();
            var tpl = this._childrenTpl[name];
            if (!tpl) {
                throw new Error('try to retrieve child tpl with a unknown name: ' + name + ' of stage:' + this.route);
            }

            return tpl.render(context, this);
        };

        Stage.prototype._processChildrenTpl = function () {
            this._tmpDiv.innerHTML = this.layout;

            var me = this;
            sop.$all('script[type="text/jsTpl"]', this._tmpDiv).forEach(function (e) {
                var n = e.dataset.name;
                if (!n) {
                    throw new Error('there muse be a name of child tpl, stage: ' + me.route);
                }

                me._childrenTpl[n] = new Tpl(e.innerHTML, me.debug).getCTpl();
                me._tmpDiv.removeChild(e);
            });

            this.layout = this._tmpDiv.innerHTML;
            this._tmpDiv.innerHTML = null;
        };

        /**
         * Initializes stage, it will be called automatically by `sop.App`
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
         * Gets rendered html of stage, it will be called automatically when stages are interacting
         *
         * @param [context=sop.Message] {Object} The context to be used in render, default is the instance of `sop.Message`
         * being used in current stage
         * @returns {String} Rendered html
         */
        Stage.prototype.render = function (context) {
            var html;
            this.fire('beforeRender');
            html = this._layout.render(context || this.getMessage(), this);
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
         * Adds auto-abort task, auto-abort task will be abort automatically if it's still running after
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