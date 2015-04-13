define({
    name: 'sop.Message',
    requires: ['sop.url'],
    init: function (url) {
        var Message = function () {
            this.route = '';
        };

        Message.prototype.send = function () {
            var route = this.route;
            if (!route)
                return;

            delete this['route'];

            var q = sop.oToQueryString(this);
            window.location.hash = route + (q ? '?' + q : '');
        };

        Message.fromHash = function () {
            var hash = window.location.hash,
                p = url.parseHash(hash),
                s = url.parseSearch(p['search']),
                msg = new Message();

            return sop.extend(msg, s);
        };

        return Message;
    }
});