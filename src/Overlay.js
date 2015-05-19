define({
    name: 'sop.Overlay',
    init: function () {
        var Overlay = function (opt) {
            sop.Observable.call(this);

            this._el = document.createElement('div');
            this.css = {
                position: 'absolute',
                top: 0,
                left: 0,
                background: '#000',
                opacity: 0.6,
                'z-index': 1000
            };

            this.idPrefix = 'sop_overlay_';

            sop.extend(this, opt);

            this._el.id = this.idPrefix + sop.generateId();
            $(this._el).css(this.css);

            document.body.appendChild(this._el);

            this._el.addEventListener('click', function () {
                this.hide();
            }.bind(this));

            this.registerEvents([
                'hide'
            ]);
        };

        sop.extendProto(Overlay, sop.Observable);

        Overlay.prototype.fitSize = function () {
            $(this._el).css({
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight
            });
        };

        Overlay.prototype.show = function () {
            this.fitSize();
            $(this._el).show();
        };

        Overlay.prototype.hide = function () {
            $(this._el).hide();
            this.fire('hide');
        };

        return Overlay;
    }
});