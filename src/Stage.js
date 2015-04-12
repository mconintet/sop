define({
    name: 'sop.Stage',
    requires: ['sop.Template', 'sop.Ajax'],
    init: function (Tpl, Ajax) {
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
        };

        sop.extendProto(Stage, sop.Observable);

        Stage.prototype._init = function () {
            this._layout = new Tpl(this.layout, this.debug).getCTpl();
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

        return Stage;
    }
});