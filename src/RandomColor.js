define({
    name: 'sop.RandomColor',
    init: function () {
        var RandomColor = function () {
        };

        var random = function (from, to) {
            if (from > to) {
                from = from ^ to;
                to = to ^ from;
                from = from ^ to;
            }

            return Math.random() * (to - from) + from;
        };

        RandomColor.process = function (from, to) {
            from = from || '000000';
            to = to || 'ffffff';

            from = from.match(/\d{2}/g);
            to = to.match(/\w{2}/g);

            var r = parseInt(random(parseInt(from[0], 16), parseInt(to[0], 16))).toString(16);
            var g = parseInt(random(parseInt(from[1], 16), parseInt(to[1], 16))).toString(16);
            var b = parseInt(random(parseInt(from[2], 16), parseInt(to[2], 16))).toString(16);

            (r + '').length == 1 && (r = '0' + r);
            (g + '').length == 1 && (g = '0' + g);
            (b + '').length == 1 && (b = '0' + b);

            return '#' + r + g + b;
        };

        return RandomColor;
    }
});