define({
    name: 'sop.Scroll',
    init: function () {
        var Scroll = function (target) {
            sop.Observable.call(this);

            this.registerEvents([
                'bottom'
            ]);

            this.target = target;

            this.winListener = null;
            this.elemListener = null;

            this._init();
        };

        sop.extendProto(Scroll, sop.Observable);

        var winListener = function (me) {

            return function () {
                var scrollY = window.scrollY ? window.scrollY : window.pageYOffset;
                if (document.documentElement.scrollHeight === window.innerHeight + scrollY) {
                    me.fire('bottom');
                }
            };
        };

        var elemListener = function (me) {

            return function () {
                if ((this.scrollHeight - this.scrollTop) === this.clientHeight) {
                    me.fire('bottom');
                }
            };
        };

        Scroll.prototype._init = function () {
            if (sop.type(this.target) === '[object global]') {
                this.winListener = winListener(this);
                this.target.addEventListener('scroll', this.winListener);
            } else {
                this.elemListener = elemListener(this);
                this.target.addEventListener('scroll', this.elemListener);
            }
        };

        Scroll.prototype.cancel = function () {
            this.winListener && this.target.removeEventListener('scroll', this.winListener);
            this.elemListener && this.target.removeEventListener('scroll', this.elemListener);

            this.winListener = null;
            this.elemListener = null;
        };

        Scroll.prototype.isStopped = function () {
            return this.elemListener === null && this.winListener === null;
        };

        Scroll.prototype.abort = function () {
            this.cancel();
        };

        return Scroll;
    }
});