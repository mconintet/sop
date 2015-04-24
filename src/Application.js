define({
    name: 'sop.Application',
    requires: ['sop.Url'],
    init: function (Url) {
        /**
         * @memberof sop
         * @class
         */
        var Application = function () {
            sop.Observable.call(this);
            this.stages = {};

            this.registerEvents([
                'stagesReady',
                'ready'
            ]);

            this._baseUrl = '';

            this.notReadyStage = 0;

            this.previousStage = null;
            this.currentStage = null;
        };

        sop.extendProto(Application, sop.Observable);

        /**
         * Gets current route, the route is a part of hash string in current url
         *
         * @returns {String} Path string
         */
        Application.prototype.getCurrentRoute = function () {
            var hash = window.location.hash, p = Url.parseHash(hash);
            return p['path'];
        };

        /**
         * Dispatches route, shows the stage associative with given route
         *
         * @param route {String} Route string
         */
        Application.prototype.dispatch = function (route) {
            var stage = this.stages[route];
            if (!stage) {
                throw new Error('the stage assorted with route: ' + route + ' does not exist');
            }

            this.previousStage = this.currentStage;
            this.currentStage = stage;

            if (this.previousStage) {
                this.previousStage.fire('beforeHide');
                this.previousStage.fire('afterHide');
            }

            this.currentStage.fire('beforeShow');
            document.body.innerHTML = stage.render();
            this.currentStage.fire('afterShow');
        };

        Application.prototype.setBaseUrl = function (url) {
            return this._baseUrl = sop.sTrimR(url, '\\/');
        };

        Application.prototype.getBaseUrl = function () {
            return this._baseUrl;
        };

        /**
         * Registers stage with melife, melife will init the registered stage automatically
         *
         * @param stage
         */
        Application.prototype.registerStage = function (stage) {
            stage.baseUrl = this._baseUrl + '/views';

            this.stages[stage.route] = stage;
            this.notReadyStage++;

            var me = this;
            stage.on('ready', function () {
                me.notReadyStage--;

                if (me.notReadyStage === 0) {
                    me.fire('stagesReady')
                }
            });
        };

        Application.prototype._initStages = function () {
            sop.oForEach(this.stages, function (stage) {
                stage.init();
            });
        };

        Application.prototype._run = function () {
            var me = this;

            me.dispatch(me.getCurrentRoute());

            window.addEventListener('hashchange', (function () {
                this.dispatch(this.getCurrentRoute());
            }).bind(this));

            this.fire('ready');

            return this;
        };


        /**
         * Runs application itself, it will observe 'hashchange' event once all resources are ready
         *
         * @returns {sop.Application}
         */
        Application.prototype.run = function () {
            this.on('stagesReady', (function () {
                this._run();
            }).bind(this));

            this._initStages();

            return this;
        };

        /**
         * @memberof sop
         * @type {sop.Application}
         */
        sop.App = new Application();

        return sop.App;
    }
});