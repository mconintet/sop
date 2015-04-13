define({
    name: 'sop.Message',
    requires: ['sop.Url'],
    init: function (Url) {
        /**
         * @memberof sop
         * @constructor
         */
        var Message = function () {
            /**
             * @prop {String} route The route which message will be routed to
             */
            this.route = '';
        };

        /**
         * Send message itself
         */
        Message.prototype.send = function () {
            var route = this.route;
            if (!route)
                return;

            delete this['route'];

            var q = sop.oToQueryString(this);
            window.location.hash = route + (q ? '?' + q : '');
        };

        /**
         * Create new sop.Message from hash string in current url string
         *
         * @returns {sop.Message}
         */
        Message.fromHash = function () {
            var hash = window.location.hash,
                p = Url.parseHash(hash),
                s = Url.parseSearch(p['search']),
                msg = new Message();

            return sop.extend(msg, s);
        };

        return Message;
    }
});