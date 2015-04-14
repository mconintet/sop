define({
    name: 'sop.Date',
    init: function () {
        var D = window.Date;

        /**
         * @memberof sop
         * @constructor
         */
        var Date = function () {};

        /**
         * Converts date into string according to some specific characters.
         *
         *     var date = new Date('2015/04/13 20:58:54');
         *     S.dFormat(date, 'Y-m-d H:i:s');
         *     // out put => '2015-04-13 20:58:54'
         *
         * @function
         * @param {Date} [date=new Date()] Date to be converted into string
         * @param {String} opt More options characters see:
         * <a href="http://php.net/manual/en/function.date.php" target="_blank">function.date.php</a>
         * @return {String} Converted string
         */
        Date.format =  (function () {
            var fnMap = {
                month: ["January", "February", "March",
                    "April", "May", "June", "July", "August",
                    "September", "October", "November", "December"],
                week: ["Sunday", "Monday", "Tuesday",
                    "Wednesday", "Thursday", "Friday", "Saturday"],
                monthDay: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                addLeadingZero: function (a, b) {
                    return a < b ? '0' + a : a;
                },
                y: function (date) {
                    return date.getFullYear().toString().substr(-2, 2);
                },
                Y: function (date) {
                    return date.getFullYear();
                },
                n: function (date) {
                    return date.getMonth() + 1;
                },
                j: function (date) {
                    return date.getDate();
                },
                d: function (date) {
                    return this.addLeadingZero(this.j(date), 10);
                },
                m: function (date) {
                    return this.addLeadingZero(this.n(date), 10);
                },
                w: function (date) {
                    return date.getDay();
                },
                l: function (date) {
                    return this.week[this.w(date)];
                },
                F: function (date) {
                    return this.month[this.n(date)];
                },
                M: function (date) {
                    return this.F(date).substr(0, 3);
                },
                L: function (date) {
                    var intYear = parseInt(this.Y(date));
                    return (intYear % 4 == 0 && intYear % 100 != 0 || intYear % 400 == 0) ? 1 : 0;
                },
                t: function (date) {
                    var month = date.getMonth();
                    if (month == 1 && this.L()) {
                        return 29;
                    } else {
                        return this.monthDay[month];
                    }
                },
                r: function (date) {
                    return date.toString();
                },
                G: function (date) {
                    return date.getHours();
                },
                H: function (date) {
                    return this.addLeadingZero(this.G(date), 10);
                },
                g: function (date) {
                    var t = this.G(date) + 1;
                    return t > 12 ? t - 12 : t;
                },
                h: function (date) {
                    return this.addLeadingZero(this.g(date), 10);
                },
                a: function (date) {
                    return this.G(date) > 12 ? 'pm' : 'am';
                },
                A: function (date) {
                    return this.a(date).toUpperCase();
                },
                i: function (date) {
                    return this.addLeadingZero(date.getMinutes(), 10);
                },
                s: function (date) {
                    return this.addLeadingZero(date.getSeconds(), 10);
                },
                D: function (date) {
                    return this.l(date).slice(0, 3);
                },
                N: function (date) {
                    return this.w(date) + 1;
                },
                z: function (date) {
                    var d = new Date(this.Y(date), 0, 1);
                    return Math.ceil((date - d) / 86400000);
                },
                U: function (date) {
                    return date.getTime();
                }
            };

            return function (date, opt) {
                if (sop.isUndefined(opt)) {
                    opt = date;
                    date = new D();
                }

                return opt ? opt.replace(/\b(\w+)\b/g, function (match) {
                    return fnMap[match](date);
                }) : '';
            };
        })();

        return Date;
    }
});