define({
    name: 'sop.NextEnableButton',
    init: function () {
        var NextEnableButton = function (btn) {
            this.btn = btn;
            this.timer = 0;
            this.timeout = 60;
        };

        NextEnableButton.prototype._countDown = function () {
            var txt = $(this.btn).val(), me = this;
            txt = txt.replace(/([\u4e00-\u9fa5]+)(?:\s*\((\d+)\))*/, function (m, p1, p2) {
                if (!p2) {
                    p2 = me.timeout;
                } else {
                    p2 = parseInt(p2);
                    --p2;
                }

                if (p2 > 0) {
                    return p1 + ' (' + p2 + ')';
                } else {
                    me.reset();
                    return p1;
                }
            });

            $(this.btn).val(txt);
        };

        NextEnableButton.prototype.start = function (sec) {
            if (this.timer)
                return false;

            $(this.btn).attr('disabled', 'disabled');

            this.timeout = sec || 60;
            this._countDown();
            this.timer = setInterval(this._countDown.bind(this), 1000);
        };

        NextEnableButton.prototype.reset = function () {
            clearInterval(this.timer);
            this.timer = 0;

            var btn = $(this.btn), val = btn.val();

            btn.val(val.replace(/\s+\((\d+)\)/, ''));
            btn.removeAttr('disabled');
        };

        NextEnableButton.prototype.isStopped = function () {
            return this.timer === 0;
        };

        NextEnableButton.prototype.abort = function () {
            clearInterval(this.timer);
        };

        return NextEnableButton;
    }
});