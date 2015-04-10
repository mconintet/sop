(function () {
    // register namespace for 'sop'
    var S = window['sop'] = {};

    S.type = function (obj) {
        return Object.prototype.toString.call(obj);
    };

    S.isArray = (function () {
        if (Array.isArray) {
            return Array.isArray;
        } else {
            return function (obj) {
                return S.type(obj) === '[object Array]';
            };
        }
    })();

    S.isString = function (obj) {
        return typeof obj === 'string';
    };

    S.isUndefined = function (obj) {
        return typeof  obj === 'undefined';
    };

    S.isObject = function (obj) {
        return obj && typeof obj === 'object';
    };

    if (Object.prototype.getValueByPath) {
        throw new Error('Object.prototype.getValueByPath has already been used!');
    }

    if (Object.prototype.setValueByPath) {
        throw new Error('Object.prototype.setValueByPath has already been used!');
    }

    Object.prototype.getValueByPath = function (path, sep) {
        sep = sep || '/';

        var reg = new RegExp('^' + sep + '|' + sep + '$');
        var regSplit = new RegExp(sep);

        path = path.replace(reg, '').split(regSplit);
        var i = 0, len = path.length, retVal = this, key;

        for (; i < len; i++) {
            key = path[i];

            if (retVal) {
                retVal = retVal[key];
            } else {
                retVal = null;
                break;
            }
        }

        return retVal;
    };

    Object.prototype.setValueByPath = function (path, value, sep, autoFill) {
        sep = sep || '/';

        var reg = new RegExp('^' + sep + '|' + sep + '$');
        var regSplit = new RegExp(sep);

        autoFill = typeof autoFill === 'undefined' ? true : !!autoFill;

        path = path.replace(reg, '').split(regSplit);
        var i = 0, len = path.length, key, tmpObj = this;

        for (; i < len; ++i) {
            key = path[i];

            if (i != len - 1) {

                if (typeof tmpObj[key] !== 'object' && autoFill) {
                    tmpObj[key] = {};
                } else if (typeof tmpObj[key] !== 'object' && !autoFill) {
                    return false;
                }

                tmpObj = tmpObj[key];
            } else {
                tmpObj[key] = value;
            }
        }

        return true;
    };

    S.tryExtendStd = function (dst, path, fn) {
        if (dst.getValueByPath(path))
            throw new Error("Failed to extend standard APIs: " + to + " already exists!");

        dst.setValueByPath(path, fn);
    };

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, thisObj) {
            for (var i = 0, len = this.length; i < len; i++) {
                fn.apply(thisObj, [this[i], i, this]);
            }
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (target, startIndex) {
            for (var i = startIndex, len = this.length; i < len; i++) {
                if (this[i] === target) {
                    return i;
                }
            }

            return -1;
        };
    }

    if (!Array.prototype.every) {
        Array.prototype.every = function (fn, thisObj) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (fn.apply(thisObj, [this[i], i, this]) === false) {
                    break;
                }
            }
        };
    }

    S.tryExtendStd(Object, 'prototype/forEach', function (fn, thisObj) {
        for (var p in this) {
            if (this.hasOwnProperty(p))
                fn.apply(thisObj, [this[p], p, this]);
        }
    });

    S.tryExtendStd(Object, 'prototype/indexOf', function (target) {
        for (var p in this) {
            if (this.hasOwnProperty(p)) {
                if (this[p] === target) {
                    return p;
                }
            }
        }

        return -1;
    });

    S.tryExtendStd(Object, 'prototype/every', function (fn, thisObj) {
        for (var p in this) {
            if (this.hasOwnProperty(p)) {
                if (fn.apply(thisObj, [this[p], p, this]) === false) {
                    break;
                }
            }
        }
    });

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/, '');
        };
    }

    S.tryExtendStd(String, 'prototype/render', function () {
        var args = arguments;

        return this.replace(/\{([0-9]+)\}/g, function () {
            return args[parseInt(arguments[1])];
        });
    });

    S.extend = function () {
        var args = arguments, i = 1, len = args.length, target = args[0], arg, p;
        for (; i < len; i++) {
            arg = args[i];
            for (p in arg) {
                if (arg.hasOwnProperty(p)) {
                    target[p] = arg[p]
                }
            }
        }

        return target;
    };

    S.extendProto = function (sub, parent) {
        var Fn = function () {
        };
        Fn.prototype = parent.prototype;

        sub.prototype = new Fn;
        sub.prototype.constructor = sub;
    };
})();

(function (S) {
    var Observable = function () {
        this._events = {};
        this._listeners = {};
    };

    Observable.prototype.registerEvents = function (events) {
        if (S.isArray(events)) {
            for (var i = 0, len = events.length; i < len; i++) {
                this.registerEvents(events[i]);
            }
        } else if (S.isString(events)) {
            this._events[events] = true;
        }

        return this;
    };

    Observable.prototype.hasEvent = function (event) {
        return this._events[event] === true;
    };

    Observable.prototype.getListeners = function (event) {
        if (S.isUndefined(this._listeners[event])) {
            this._listeners[event] = [];
        }

        return this._listeners[event];
    };

    Observable.prototype.on = function (event, fn) {
        if (!this.hasEvent(event))
            throw new Error('Not supported event: ' + event);

        var listeners = this.getListeners(event);

        if (listeners.indexOf(fn) === -1) {
            listeners.push(fn);
        }

        return this;
    };

    Observable.prototype.off = function (event) {
        this._listeners[event] = [];

        return this;
    };

    Observable.prototype.fire = function (event, args) {
        var listeners = this.getListeners(event), me = this;

        listeners.forEach(function (e) {
            return e.apply(me, args);
        });
    };

    S['Observable'] = Observable;
})(sop);

(function (S) {
    var format = (function () {
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

        return function (opt) {
            var me = this;
            return opt ? opt.replace(/\b(\w+)\b/g, function (match) {
                return fnMap[match](me);
            }) : '';
        };
    })();

    S.tryExtendStd(Date, 'prototype/format', format);
})(sop);
