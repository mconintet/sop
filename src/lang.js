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
        return obj && S.type(obj) === '[object Object]';
    };

    S.isUndefined = function (obj) {
        return typeof obj === 'undefined';
    };

    S.isNumber = function (obj) {
        return typeof obj === 'number';
    };

    S.isNumeric = function (obj) {
        var parsed = parseFloat(obj);
        return !isNaN(parsed) && isFinite(parsed);
    };

    S.isObjectLike = function (obj) {
        return typeof obj === 'object';
    };

    S.isElement = function (obj) {
        return obj instanceof HTMLElement;
    };

    S.isArrayLike = function (obj) {
        return Object.isObjectLike(obj) && obj.hasOwnProperty('length');
    };

    S.isBoolean = function (obj) {
        return typeof obj === 'boolean';
    };

    S.isFunction = function (obj) {
        return typeof obj === 'function';
    };

    S.getValueByPath = function (obj, path, sep) {
        sep = sep || '/';

        var reg = new RegExp('^' + sep + '|' + sep + '$');
        var regSplit = new RegExp(sep);

        path = path.replace(reg, '').split(regSplit);
        var i = 0, len = path.length, retVal = obj, key;

        for (; i < len; i++) {
            key = path[i];

            if (retVal) {
                retVal = retVal[key];
            } else {
                retVal = null;
                break;
            }
        }

        return retVal === undefined ? null : retVal;
    };

    S.setValueByPath = function (obj, path, value, sep, autoFill) {
        sep = sep || '/';

        var reg = new RegExp('^' + sep + '|' + sep + '$');
        var regSplit = new RegExp(sep);

        autoFill = typeof autoFill === 'undefined' ? true : !!autoFill;

        path = path.replace(reg, '').split(regSplit);
        var i = 0, len = path.length, key, tmpObj = obj;

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

    S.assertEmpty = function (path) {
        if (S.getValueByPath(window, path, '\\.') !== null) {
            throw new Error(path + ' is not empty');
        }
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

    S.assertEmpty('Array.prototype.remove');
    Array.prototype.remove = function (idxArr) {
        if (!S.isArray(idxArr)) {
            idxArr = [idxArr];
        }

        var ret = [];
        this.forEach(function (e, i) {
            if (idxArr.indexOf(i) === -1) {
                ret.push(e)
            }
        });

        return ret;
    };

    S.assertEmpty('Array.prototype.clone');
    Array.prototype.clone = function () {
        return this.slice(0);
    };

    S.assertEmpty('Object.prototype.forEach');
    Object.prototype.forEach = function (fn, thisObj) {
        for (var p in this) {
            if (this.hasOwnProperty(p))
                fn.apply(thisObj, [this[p], p, this]);
        }
    };

    S.assertEmpty('Object.prototype.indexOf');
    Object.prototype.indexOf = function (target) {
        for (var p in this) {
            if (this.hasOwnProperty(p)) {
                if (this[p] === target) {
                    return p;
                }
            }
        }

        return -1;
    };

    S.assertEmpty('Object.prototype.every');
    Object.prototype.every = function (fn, thisObj) {
        for (var p in this) {
            if (this.hasOwnProperty(p)) {
                if (fn.apply(thisObj, [this[p], p, this]) === false) {
                    break;
                }
            }
        }
    };

    S.assertEmpty('Object.prototype.toQueryString');
    Object.prototype.toQueryString = function () {
        var ret = '';

        if (S.isObject(this)) {
            for (var p in this) {
                if (this.hasOwnProperty(p) && typeof this[p] !== 'function') {
                    ret += p + '=' + this[p] + '&';
                }
            }

            ret = ret.replace(/&$/, '');
        } else if (Object.isString(this)) {
            ret = this;
        }

        return ret;
    };

    S.assertEmpty('Object.prototype.keys');
    Object.prototype.keys = function () {
        var ret = [];

        if (S.isObject(this)) {
            for (var p in this) {
                if (this.hasOwnProperty(p))
                    ret.push(p);
            }
        }

        return ret;
    };

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/, '');
        };
    }

    S.assertEmpty('String.prototype.render');
    String.prototype.render = function () {
        var args = arguments;

        return this.replace(/\{([0-9]+)\}/g, function () {
            return args[parseInt(arguments[1])];
        });
    };

    S.extend = function () {
        var args = arguments, i = 1, len = args.length, target = args[0], arg, p;
        for (; i < len; i++) {
            arg = args[i];

            if (!arg) {
                continue;
            }

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

    if (!window['console']) {
        window['console'] = {
            log: function () {
            }
        };
    }
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

    S.assertEmpty('Date.prototype.format');
    Date.prototype.format = format;
})(sop);

(function (S) {
    var defaultPrefix = window.location.protocol + '//' + window.location.host;

    S.loadJs = (function () {
        var script = document.createElement('script'),
            regAbsPath = /^https?:\/\//,
            head = document.getElementsByTagName('head');

        // modern browsers like Chrome41&FF36 will create a head element for the
        // head missing situation, but I still put a little check here, since I'm
        // not sure if there are some browsers in mobile devices don't support this
        // mechanism.
        if (head.length === 0) {
            console.log('%c missing head element', 'color: red');
        }

        head = head[0];

        if ('onload' in script) {
            script = null;

            return function (url, callback, prefix, debug) {
                prefix = prefix || defaultPrefix;

                if (!regAbsPath.test(url)) {
                    if (!prefix) {
                        throw new Error("relative url: " + url + " but prefix is empty");
                    } else {
                        url = prefix + '/' + url;
                    }
                }

                var s = document.createElement('script');

                if (debug) {
                    // OL is abbreviation for onload
                    console.log('%c \'OL\' loading: ' + url, 'color: #a1882b');

                    s.onload = (function (callback) {
                        return function () {
                            console.log('%c loaded: ' + url, 'color: green');
                            callback.call(this);
                        }
                    })(callback);
                } else {
                    s.onload = callback;
                }

                s.src = url;
                head.appendChild(s);
            };
        } else {
            script = null;

            return function (url, callback, prefix, debug) {
                prefix = prefix || defaultPrefix;

                if (!regAbsPath.test(url)) {
                    if (!prefix) {
                        throw new Error("relative url: " + url + " but prefix is empty");
                    } else {
                        url = prefix + '/' + url;
                    }
                }

                var s = document.createElement('script');

                if (debug) {
                    // OR is abbreviation for onreadystatechange
                    console.log('%c \'OR\' loading: ' + url, 'color: yellow');

                    s.onreadystatechange = (function (callback) {
                        return function () {
                            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                                console.log('%c loaded: ' + url, 'color: green');
                                callback.call(this);
                            }
                        };
                    })(callback);
                } else {
                    s.onreadystatechange = (function (callback) {
                        return function () {
                            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                                callback.call(this);
                            }
                        };
                    })(callback);
                }

                s.src = url;
                head.appendChild(s);
            };
        }
    })();

    S.loadJs.defaultPrefix = defaultPrefix;
})(sop);

(function (S) {
    var modules = {};

    var rootUrls = {
        sop: 'http://example.com/src/'
    };

    var Module = function () {
        this.name = '';
        this.url = '';
        this.isUrlDirect = false;

        this.dependencies = [];
        this.dependedBy = [];

        this.unreadyDependencies = [];

        this.init = function () {
        };

        this.isReady = false;
    };

    Module.prototype._resolveUrl = function () {
        if (!this.url) {
            var url = this.name.split('.'), root = url.shift(), prefix = rootUrls[root];

            if (!prefix) {
                throw new Error('url prefix for root: ' + root + ' does not exist.');
            }

            this.url = prefix + url.join('/') + '.js';
        } else {
            this.isUrlDirect = true;
        }

        if (this.url[0] === '/') {
            this.url = this.url.slice(1);
        }

        return this.url;
    };

    Module.prototype.notifyDependedBy = function () {
        this.dependedBy.forEach(function (mn) {
            modules[mn].tryInit();
        });
    };

    Module.prototype.makeInitArgs = function () {
        var ret = [];

        this.dependencies.forEach(function (mn) {
            ret.push(modules[mn].ref);
        });

        return ret;
    };

    Module.prototype.tryInit = function () {
        if (this.isReady)
            return;

        var r = [], m;
        this.unreadyDependencies.forEach(function (mn, idx) {
            m = modules[mn];
            if (m.isReady) {
                r.push(idx);
            }
        });

        this.unreadyDependencies = this.unreadyDependencies.remove(r);

        if (this.unreadyDependencies.length === 0) {
            this.ref = this.init.apply(this, this.makeInitArgs());
            this.isReady = true;

            this.notifyDependedBy();
        }
    };

    Module.prototype.load = function () {
        this._resolveUrl();
        var me = this;

        modules[this.name] = this;

        S.loadJs(this.url, function () {
            if (me.isUrlDirect) {
                me.isReady = true;
                me.notifyDependedBy();
            }
        }, null, define.debug);
    };

    var defaultCfg = {
        name: null,
        requires: [],
        init: function () {
        }
    };

    var isUrl = function (str) {
        return str.indexOf('/') !== -1;
    };

    var define = function (cfg) {
        cfg = S.extend({}, defaultCfg, cfg);

        if (cfg.name === null) {
            throw new Error('module name cannot be empty');
        }

        var m = modules[cfg.name];
        if (m && m.isReady) {
            throw new Error('module with name: ' + cfg.name + ' already exists');
        }

        if (!m) {
            m = new Module();
            m.name = cfg.name;
            modules[cfg.name] = m;
        }

        m.dependencies = cfg.requires;
        m.init = cfg.init;

        var waitLoad = [];
        m.dependencies.forEach(function (mn) {
            var pm = modules[mn];
            if (!pm) {
                m.unreadyDependencies.push(mn);
                pm = new Module();

                if (isUrl(mn)) {
                    pm.url = mn;
                }

                pm.name = mn;
                modules[mn] = pm;

                waitLoad.push(pm);
            } else if (!pm.isReady) {
                m.unreadyDependencies.push(mn);
            }

            pm.dependedBy.push(m.name);
        });

        waitLoad.forEach(function (wm) {
            wm.load();
        });

        if (m.unreadyDependencies.length === 0) {
            m.tryInit();
        }
    };

    define.setBaseUrl = function (root, url) {
        if (url[url.length - 1] !== '/') {
            url += '/';
        }

        rootUrls[root] = url;

        return this;
    };

    define.debug = false;

    define.getModules = function () {
        return modules;
    };

    window['define'] = define;
})(sop);

