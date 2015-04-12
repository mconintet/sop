define({
    name: 'sop.Application',
    requires: ['sop.url'],
    init: function (url) {
        var Application = function () {
            sop.Observable.call(this);
            this.stages = {};

            this.registerEvents([
                'ready'
            ]);

            this.notReadyStage = 0;
        };

        sop.extendProto(Application, sop.Observable);

        Application.prototype.run = function () {
            var me = this;

            me.dispatch(me.getCurrentRoute());

            window.addEventListener('hashchange', (function () {
                return function () {
                    me.dispatch(me.getCurrentRoute());
                };
            })());

            return this;
        };

        Application.prototype.getCurrentRoute = function () {
            var hash = window.location.hash, p = url.parseHash(hash);
            return p['path'];
        };

        Application.prototype.dispatch = function (route) {
            var stage = this.stages[route];
            if (!stage) {
                throw new Error('the stage assorted with route: ' + route + ' does not exist');
            }

            stage.fire('beforeShow');
            document.body.innerHTML = stage.render();
            stage.fire('afterShow');
        };

        Application.prototype.registerStage = function (stage) {
            this.stages[stage.route] = stage;
            this.notReadyStage++;

            var me = this;
            stage.on('ready', function () {
                me.notReadyStage--;

                if (me.notReadyStage === 0) {
                    me.fire('ready')
                }
            });

            stage.init();
        };

        sop.App = new Application();
        sop.App.on('ready', function () {
            sop.App.run();
        });

        return sop.App;
    }
});