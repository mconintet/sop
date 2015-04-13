(function () {
    /**
     * @exports sop
     */
    var S = window['sop'] = {};

    /**
     * Gets the type string of given object. The return will be like one of:
     *
     * * `[object Object]`
     * * `[object Array]`
     * * ...
     *
     * @param {*} obj Any value to be typed
     * @returns {String} Flag
     */
    S.type = function (obj) {
        return Object.prototype.toString.call(obj);
    };

    /**
     * Estimates if the given object is a Array, it's an alias of `Array.isArray`
     * @function
     * @param {*} obj Any value to be operated
     * @returns {Boolean} Flag
     */
    S.isArray = Array.isArray;

    /**
     * Estimates if the given object is a `String`
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isString = function (obj) {
        return typeof obj === 'string';
    };

    /**
     * Estimate if the given object is `undefined`
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isUndefined = function (obj) {
        return typeof  obj === 'undefined';
    };

    /**
     * Estimate if the given object is a Object, it will be false if obj is `null`
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isObject = function (obj) {
        return obj && S.type(obj) === '[object Object]';
    };

    /**
     * Estimates if the given object is a `Number`
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isNumber = function (obj) {
        return typeof obj === 'number';
    };

    /**
     * Estimates if the given object is Numeric
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isNumeric = function (obj) {
        var parsed = parseFloat(obj);
        return !isNaN(parsed) && isFinite(parsed);
    };

    /**
     * Estimates if the given object is ObjectLike, it will be true if obj is `null`.
     *
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isObjectLike = function (obj) {
        return typeof obj === 'object';
    };

    /**
     * Estimates if the given object is `HTMLElement`
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isElement = function (obj) {
        return obj instanceof HTMLElement;
    };

    /**
     * Estimates if the given object is `Boolean`
     * @param {*} obj any value to be operated
     * @returns {boolean} Flag
     */
    S.isBoolean = function (obj) {
        return typeof obj === 'boolean';
    };

    /**
     * Estimates if the given object is `Function`
     * @param {*} obj Any value to be operated
     * @returns {boolean} Flag
     */
    S.isFunction = function (obj) {
        return typeof obj === 'function';
    };

    /**
     * Gets the value of obj by path:
     *
     *     var obj = {
     *          a : {
     *              b : {
     *                  c : 1
     *              }
     *          }
     *     }
     *
     *     var v = sop.getValueByPath(obj, 'a/b/c');
     *     console.log(v); // v is 1
     *
     * @param obj {Object} Object to be operated
     * @param path {String} Path of the value
     * @param {String} [sep=/] - Separator char of path string, if the separator is special in regexp then you need to quote it by yourself
     *
     *     var v = sop.getValueByPath(obj, 'a.b.c', '\\.');
     *
     * @returns {object|null} If the value does not exists or the value itself is `undefined`, then use `null` to instead be return value.
     */
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

    /**
     * Sets the value of obj by path:
     *
     *     var obj = {};
     *     sop.setValueByPath(obj, 'a/b/c', 1);
     *     console.log(obj);
     *
     *     // obj will be
     *     // {
     *     //   a : {
     *     //       b : {
     *                  c : 1
     *     //       }
     *     //   }
     *     // }
     *
     *
     * @param obj {Object} Object to be operated
     * @param path {String} Path string
     * @param value {*} Value to be set
     * @param {string} [sep=/] - Separator char of path string, if the separator is special in regexp then you need to quote it by yourself
     *
     *     sop.setValueByPath(obj, 'a.b.c', 1, '\\.');
     *
     * @param {boolean} [autoFill=true] Flag whether creating parent path automatically, on in default
     * @returns {boolean} Flag the operating is successful or failed
     */
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

    /**
     * Asserts the value of given path on global object must be empty, otherwise throw an error.
     * @param path {String} Path string
     */
    S.assertEmpty = function (path) {
        if (S.getValueByPath(window, path, '\\.') !== null) {
            throw new Error(path + ' is not empty');
        }
    };

    /**
     * Removes items from array by their indexes, just pass index itself if there is only one item needed to be removed.
     * This function will not modify the original array.
     *
     *     var a = [1, 2 , 3];
     *     S.aRemove(a, [0, 1]); // a => [3]
     *
     *     a = [1, 2 , 3];
     *     sop.aRemove(a, 0);      // a => [2, 3]
     *
     *      a = [1, 2 , 3];
     *     sop.aRemove(a, [0]);    // a => [2, 3]
     *
     * @param arr {Array} Array to be operated
     * @param idxArr {Array|Number} Array of indexes or one index
     * @returns {Array} Result
     */
    S.aRemove = function (arr, idxArr) {
        if (!S.isArray(idxArr)) {
            idxArr = [idxArr];
        }

        var ret = [];
        arr.forEach(function (e, i) {
            if (idxArr.indexOf(i) === -1) {
                ret.push(e)
            }
        });

        return ret;
    };

    /**
     * Iterates through the array and executes function `fn` on each of its element.
     * The processing function cannot return a value, so the result must be handled immediately.
     *
     * The `fn` accepts an optional parameter `thisObj`,
     * which you can pass in a different object to be used as the `this` reference within the function.
     *
     * @param obj {Object} Object to be iterated on
     * @param fn {Function} Processing function
     * @param {Object} [thisObj={}] Default is an new empty object
     */
    S.oForEach = function (obj, fn, thisObj) {
        for (var p in obj) {
            if (obj.hasOwnProperty(p))
                fn.apply(thisObj || {}, [obj[p], p, obj]);
        }
    };

    /**
     * Tries to find out the key of target in given object, return `-1` if nothing found.
     *
     * @param obj {Object} Object to be iterated on
     * @param target {*} Any value want to be indexed
     * @returns {String|Number} Found key or -1 when nothing found
     */
    S.oIndexOf = function (obj, target) {
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                if (obj[p] === target) {
                    return p;
                }
            }
        }

        return -1;
    };

    /**
     * Traverses an array and will stop when the return value of `fn` fully equals `false`.
     *
     * The `fn` accepts an optional parameter `thisObj`,
     * which you can pass in a different object to be used as the `this` reference within the function.
     *
     * @param obj {Object} Object to be iterated on
     * @param fn {Function} Processing function
     * @param {Object} [thisObj={}] Default is an new empty object
     */
    S.oEvery = function (obj, fn, thisObj) {
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                if (fn.apply(thisObj || {}, [obj[p], p, obj]) === false) {
                    break;
                }
            }
        }
    };

    /**
     * Converts an object into a query string and return it, doesn't change the original object.
     * Return object directly if it's already a string.
     *
     * @param obj {Object} Object to be iterated on
     * @returns {string} Query string
     */
    S.oToQueryString = function (obj) {
        var ret = '', p;

        if (S.isObject(obj)) {
            for (p in obj) {
                if (obj.hasOwnProperty(p) && typeof obj[p] !== 'function') {
                    ret += p + '=' + obj[p] + '&';
                }
            }

            ret = ret.replace(/&$/, '');
        } else if (Object.isString(obj)) {
            ret = obj;
        }

        return ret;
    };

    /**
     * Extracts all the keys in given object and then return them into an array.
     *
     * @param obj {Object} Object to be iterated on
     * @returns {Array} Keys
     */
    S.oKeys = function (obj) {
        var ret = [];

        if (S.isObject(obj)) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p))
                    ret.push(p);
            }
        }

        return ret;
    };

    /**
     * Formats a string anything like `printf` in C
     *
     *     sop.sFormat('Hello, {0} - {1}', 'world', 2015);
     *     // output => 'Hello, world - 2015'
     *
     * @param str {String} Template string
     * @param {...*} obj - Filler values
     * @returns {string} Processed string
     */
    S.sFormat = function (str, obj) {
        var args = arguments;

        return str.replace(/\{([0-9]+)\}/g, function () {
            return args[parseInt(arguments[1]) + 1];
        });
    };

    /**
     * Converts a string into Object by using `JSON.parse`
     *
     * @param str {String} String to be operated
     * @returns {*} Return value
     * @throws Will throws an error if string is not a valid JSON style.
     */
    S.sToObject = function (str) {
        return JSON.parse(str);
    };

    /**
     * Executes `fn` after `after` milliseconds,
     *
     * The `fn` accepts an optional parameter `thisObj`,
     * which you can pass in a different object to be used as the `this` reference within the function.
     *
     * @param fn {Function} Function need to be executed
     * @param after {Number} After time, unit is millisecond
     * @param {Object} [thisObj={}] - `this` reference within the `fn`
     * @returns {Number} The timer return by internal calling of `setTimeout`
     */
    S.fDelay = function (fn, after, thisObj) {
        return setTimeout(fn.bind(thisObj || {}), after);
    };

    /**
     * Merges data of `src`s into `dst`, will change `dst` **directly**.
     *
     * @param dst {Object} Destination object
     * @param src {...*} Source Objects
     * @returns {Object} Destination object
     */
    S.extend = function (dst, src) {
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

    /**
     * Extends the prototype of given function
     *
     * @param sub {Function} Function whose prototype will be extended
     * @param parent {Function} Function whose prototype will be used to extend the prototype of `sub`
     */
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

    /**
     * Get an auto-increased id
     *
     * @function
     * @return {Number} An auto-increased id
     */
    S.generateId = (function () {
        var seed = 0;
        return function () {
            return ++seed;
        };
    })();
})();

(function (S) {
    /**
     * @alias sop.Observable
     * @constructor
     */
    var Observable = function () {
        this._events = {};
        this._listeners = {};
    };

    /**
     * Registers the event types which will be fired in future
     *
     * @param events {String[]|String} Uses array to add multiple events at a time or just event string to add only one.
     * @returns {Observable} Instance itself
     */
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

    /**
     * Checks whether the given event had been registered or not
     *
     * @param event {String} Event string
     * @returns {boolean} Flag
     */
    Observable.prototype.hasEvent = function (event) {
        return this._events[event] === true;
    };

    /**
     * Retrieves listeners by event string.
     *
     * @param event {String} Event string
     * @returns {Array} Array of the listeners which associative with given event string
     */
    Observable.prototype.getListeners = function (event) {
        if (S.isUndefined(this._listeners[event])) {
            this._listeners[event] = [];
        }

        return this._listeners[event];
    };

    /**
     * Add listener `fn` to observe `event`
     *
     * @param event {String} Event string, it must be registered before calling this method
     * @param fn {Function} Listener function
     * @returns {Observable} Instance itself
     */
    Observable.prototype.on = function (event, fn) {
        if (!this.hasEvent(event))
            throw new Error('Not supported event: ' + event);

        var listeners = this.getListeners(event);

        if (listeners.indexOf(fn) === -1) {
            listeners.push(fn);
        }

        return this;
    };

    /**
     * Remove listeners by given event string, will delete all the listeners associative with given event
     *
     * @param event {String} Event string
     * @returns {Observable} Instance itself
     */
    Observable.prototype.off = function (event) {
        this._listeners[event] = [];

        return this;
    };

    /**
     * Triggers event. It will call the listeners associative with given event one by one.
     * If one of that listeners return `false`, then it will stop calling the remaining listeners.
     *
     * @param event {String} Event string
     * @param args {Array} Array of arguments to be passed into every listener if possibly
     */
    Observable.prototype.fire = function (event, args) {
        var listeners = this.getListeners(event),
            me = this,
            i = 0,
            len = listeners.length;

        args = S.isArray(args) ? args : [args];

        for (; i < len; i++) {
            if (listeners[i].apply(me, args) === false) {
                break;
            }
        }
    };

    S['Observable'] = Observable;
})(sop);

(function (S) {
    /**
     * Converts date into string according some specific characters.
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
    S.dFormat = (function () {
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
            if (S.isUndefined(opt)) {
                opt = date;
                date = new Date();
            }

            return opt ? opt.replace(/\b(\w+)\b/g, function (match) {
                return fnMap[match](date);
            }) : '';
        };
    })();
})(sop);

(function (S) {
    var homeUrl = window.location.protocol + '//' + window.location.host;

    /**
     * Loads remote script file by it's url. If `url` is not start with 'http' or 'https' then treat it to be a relative
     * one and will be concatenated with `prefix`, default `prefix` is current home url.
     *
     * @function
     * @param {String} url Url of script file
     * @param {String} [prefix=sop.getHomeUrl()] Being used when `url` is relative and it's default value is current home url
     * @param {Boolean} debug Flags whether output debug information or not.
     */
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
                prefix = prefix || homeUrl;

                if (!regAbsPath.test(url)) {
                    url = prefix + '/' + url;
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
                prefix = prefix || homeUrl;

                if (!regAbsPath.test(url)) {
                    url = prefix + '/' + url;
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

    /**
     * Retrieves current home url.
     *
     * @returns {string} Home url
     */
    S.getHomeUrl = function () {
        return homeUrl;
    };
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

        this.unreadyDependencies = S.aRemove(this.unreadyDependencies, r);

        if (this.unreadyDependencies.length === 0) {
            this.ref = this.init.apply(this, this.makeInitArgs());
            S.setValueByPath(window, this.name, this.ref, '\\.');
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

    /**
     * Define a new module or class.
     *
     * Here are some conventions:
     *
     * * If defining a new module, the first letter of module name must be lowercase,
     * if defining a new class, the first letter of class name must be uppercase.
     *
     * * One file can contain only one module or class.
     *
     * * The file name must be the same as the module or class defined in it.
     *
     * * If defining a nested module or class, must create the nested directories with the same name.
     *
     * Usage:
     *
     * By default `sop` will load modules or classes files respectively and asynchronously
     * it requires us to set a base url for the root namespace we're using:
     *
     *     // create new file named 'world.js' under directory 'hello' and put below code into it
     *     define({
     *          name : 'hello.world',
     *          init : function () {
     *              console.log('hello init');
     *
     *              return {
     *                  print : function () {
     *                      console.log('hello world');
     *                  }
     *              };
     *          }
     *     })
     *
     *     // put below into 'hello/index.html'
     *     define.setBaseUrl('hello', 'http://127.0.0.1/hello')
     *
     *     define({
     *          name : 'myApp',
     *          requires : ['hello.world'],
     *          init : function () {
     *              hello.world.print();
     *          }
     *     });
     *
     *     // turn on console of browser then open 'hello/index.html'
     *     // you'll see:
     *     // hello init
     *     // hello world
     *
     * @global
     * @param cfg {Object}
     * @param {string} cfg.name - The name of new module or class
     * @param {string} cfg.requires - The dependencies of current new module or class
     * @param {Function} cfg.init - The function to init module or class, it will be run once all the dependencies has been resolved
     */
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

