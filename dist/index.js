define("modules/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var utils = {
        isPromiseLike: function (p) { return !!(p && typeof p.then === 'function'); },
        isFunction: function (fn) { return typeof fn === 'function'; },
        isEnumerable: function (list) { return list && Array.isArray(list) || list && typeof list[Symbol.iterator] === 'function'; },
        isObject: function (o) { return Object.prototype.toString.call(o) === '[object Object]'; },
        flatten: function (arr) {
            if (!Array.isArray(arr))
                throw new Error('Method `flatten` requires valid array parameter');
            return arr.reduce(function (results, item) { return results.concat(Array.isArray(item) ? utils.flatten(item) : [item]); }, []);
        }
    };
    exports["default"] = utils;
});
define("modules/errors", ["require", "exports", "tslib"], function (require, exports, tslib_1) {
    "use strict";
    exports.__esModule = true;
    exports.FPTimeout = exports.FPSoftError = exports.FPInputError = exports.FPUnexpectedError = exports.FunctionalUserError = exports.FunctionalError = void 0;
    var FunctionalError = /** @class */ (function (_super) {
        tslib_1.__extends(FunctionalError, _super);
        function FunctionalError(message, options) {
            var _this = _super.call(this, typeof message === "string" ? message : undefined) || this;
            if (options && options.message)
                message = options.message;
            if (typeof options === 'object') {
                Object.getOwnPropertyNames(options)
                    .forEach(function (key) {
                    _this[key] = options[key];
                });
            }
            _this.name = _this.constructor.name;
            _this.message = message !== null && message !== void 0 ? message : '';
            // Capturing stack trace, excluding constructor call from it.
            Error.captureStackTrace(_this);
            return _this;
        }
        return FunctionalError;
    }(Error));
    exports.FunctionalError = FunctionalError;
    var FunctionalUserError = /** @class */ (function (_super) {
        tslib_1.__extends(FunctionalUserError, _super);
        function FunctionalUserError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FunctionalUserError;
    }(FunctionalError));
    exports.FunctionalUserError = FunctionalUserError;
    var FPUnexpectedError = /** @class */ (function (_super) {
        tslib_1.__extends(FPUnexpectedError, _super);
        function FPUnexpectedError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FPUnexpectedError;
    }(FunctionalError));
    exports.FPUnexpectedError = FPUnexpectedError;
    var FPInputError = /** @class */ (function (_super) {
        tslib_1.__extends(FPInputError, _super);
        function FPInputError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FPInputError;
    }(FunctionalError));
    exports.FPInputError = FPInputError;
    var FPSoftError = /** @class */ (function (_super) {
        tslib_1.__extends(FPSoftError, _super);
        function FPSoftError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FPSoftError;
    }(FunctionalError));
    exports.FPSoftError = FPSoftError;
    var FPTimeout = /** @class */ (function (_super) {
        tslib_1.__extends(FPTimeout, _super);
        function FPTimeout() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FPTimeout;
    }(FunctionalError));
    exports.FPTimeout = FPTimeout;
});
define("arrays", ["require", "exports", "tslib", "modules/utils", "modules/errors"], function (require, exports, tslib_2, utils_1, errors_1) {
    "use strict";
    exports.__esModule = true;
    utils_1 = tslib_2.__importDefault(utils_1);
    var isEnumerable = utils_1["default"].isEnumerable;
    function default_1(FP) {
        return { map: map, find: find, findIndex: findIndex, filter: filter, flatMap: flatMap, reduce: reduce };
        function find(callback) { return _find.call(this, callback).then(function (_a) {
            var item = _a.item;
            return item;
        }); }
        function findIndex(callback) { return _find.call(this, callback).then(function (_a) {
            var index = _a.index;
            return index;
        }); }
        function _find(iterable, callback) {
            if (this.steps)
                return this.addStep('_find', tslib_2.__spread(arguments));
            if (typeof iterable === 'function') {
                callback = iterable;
                iterable = this._FP.promise;
            }
            return FP.resolve(iterable)
                .filter(callback)
                .then(function (results) { return results[0] != undefined ? { item: results[0], index: results.indexOf(results[0]) } : { item: undefined, index: -1 }; });
        }
        function flatMap(iterable, callback) {
            if (this.steps)
                return this.addStep('flatMap', tslib_2.__spread(arguments));
            if (typeof iterable === 'function') {
                callback = iterable;
                iterable = this._FP.promise;
            }
            return FP.resolve(iterable)
                .map(callback)
                .reduce(function (acc, arr) { return acc.concat.apply(acc, tslib_2.__spread(arr)); }, []);
        }
        function filter(iterable, callback) {
            if (this.steps)
                return this.addStep('filter', tslib_2.__spread(arguments));
            if (typeof iterable === 'function') {
                callback = iterable;
                iterable = this._FP.promise;
            }
            return reduce.call(this, iterable, function (acc, item) { return Promise.resolve(callback(item)).then(function (x) { return (x ? acc.concat([item]) : acc); }); }, []);
        }
        function reduce(iterable, reducer, initVal) {
            if (this.steps)
                return this.addStep('reduce', tslib_2.__spread(arguments));
            if (typeof iterable === 'function') {
                initVal = reducer;
                reducer = iterable;
                iterable = this._FP ? this._FP.promise : this;
            }
            else
                iterable = FP.resolve(iterable, this);
            return new FP(function (resolve, reject) {
                return iterable.then(function (iterable) {
                    var iterator = iterable[Symbol.iterator]();
                    var i = 0;
                    var next = function (total) {
                        var current = iterator.next();
                        if (current.done)
                            return resolve(total);
                        Promise.all([total, current.value])
                            .then(function (_a) {
                            var _b = tslib_2.__read(_a, 2), total = _b[0], item = _b[1];
                            return next(reducer(total, item, i++));
                        })["catch"](reject);
                    };
                    next(initVal);
                });
            });
        }
        /*eslint max-statements: ["error", 60]*/
        function map(args, fn, options) {
            var _this = this;
            if (this.steps)
                return this.addStep('map', tslib_2.__spread(arguments));
            if (arguments.length === 1 && this && this._FP) {
                fn = args;
                args = this && this._FP && this._FP.promise;
            }
            var resolvedOrRejected = false;
            var threadLimit = Math.max(1, (this && this._FP && this._FP.concurrencyLimit || 1));
            var innerValues = this && this._FP && this._FP.promise ? this._FP.promise : Promise.resolve(args);
            var initialThread = 0;
            var errors = [];
            var count = 0;
            var results = [];
            var threadPool = new Set();
            var threadPoolFull = function () { return threadPool.size >= threadLimit; };
            var isDone = function () { return errors.length > _this._FP.errors.limit || count >= args.length || resolvedOrRejected; };
            var setResult = function (index) { return function (value) {
                threadPool["delete"](index);
                results[index] = value;
                return value;
            }; };
            return FP.resolve(new Promise(function (resolve, reject) {
                var resolveIt = function (x) {
                    // console.log('Action.resolve:', resolvedOrRejected, x)
                    if (resolvedOrRejected) {
                        return null;
                    }
                    else {
                        resolvedOrRejected = true;
                    }
                    resolve(x);
                };
                var rejectIt = function (x) {
                    if (resolvedOrRejected) {
                        return null;
                    }
                    else {
                        resolvedOrRejected = true;
                    }
                    // console.log('Action.reject:', resolvedOrRejected, x)
                    reject(x);
                };
                innerValues.then(function (items) {
                    args = tslib_2.__spread(items);
                    if (!isEnumerable(items))
                        return reject(new errors_1.FPInputError('Invalid input data passed into FP.map()'));
                    var complete = function () {
                        var action = null;
                        if (errors.length > _this._FP.errors.limit)
                            action = rejectIt;
                        if (isDone())
                            action = resolveIt;
                        if (action)
                            return Promise.all(results).then(function (data) { return action(results); }) ? true : true;
                        return false;
                    };
                    var checkAndRun = function (val) {
                        // console.log('checkAndRun', count, resolvedOrRejected, val)
                        if (resolvedOrRejected)
                            return;
                        if (!complete() && !results[count])
                            runItem(count);
                        return val;
                    };
                    var runItem = function (c) {
                        if (resolvedOrRejected) {
                            return null;
                        }
                        else {
                            count++;
                        }
                        if (threadPoolFull())
                            return setTimeout(function () { return runItem(c); }, 0);
                        if (results[c])
                            return results[c];
                        threadPool.add(c);
                        // either get value with `fn(item)` or `item.then(fn)`
                        results[c] = Promise.resolve(args[c])
                            .then(function (val) { return fn(val, c, args); })
                            .then(function (val) { return setResult(c)(val); })
                            .then(checkAndRun)["catch"](function (err) {
                            _this._FP.errors.count++;
                            errors.push(err);
                            // console.log('ERR HANDLER!', errors.length, this._FP.errors.limit)
                            if (errors.length > _this._FP.errors.limit) {
                                var fpErr_1 = errors.length === 1 ? err : new errors_1.FunctionalError("Error Limit " + _this._FP.errors.limit + " Exceeded.\n                idx=" + c + " errCnt=" + _this._FP.errors.count, { errors: errors, results: results, ctx: _this });
                                Promise.resolve(setResult(c)(err)).then(function () { return rejectIt(fpErr_1); });
                            }
                            else { // console.warn('Error OK:', JSON.stringify(this._FP.errors))
                                return Promise.resolve().then(function () { return setResult(c)(err); }).then(checkAndRun);
                            }
                        });
                        return results[c];
                    };
                    // Kick off x number of initial threads
                    while (initialThread < threadLimit && initialThread < args.length)
                        runItem(initialThread++);
                });
            }));
        }
    }
    exports["default"] = default_1;
});
define("conditional", ["require", "exports", "tslib", "modules/utils"], function (require, exports, tslib_3, utils_2) {
    "use strict";
    exports.__esModule = true;
    utils_2 = tslib_3.__importDefault(utils_2);
    var isPromiseLike = utils_2["default"].isPromiseLike;
    function conditional(FP) {
        return { tapIf: tapIf, thenIf: thenIf, _thenIf: _thenIf };
        function thenIf(cond, ifTrue, ifFalse) {
            if (this.steps)
                return this.addStep('thenIf', tslib_3.__spread(arguments));
            if (arguments.length === 1) {
                ifTrue = cond;
                cond = function (x) { return x; };
            }
            if (isPromiseLike(this)) {
                return this.then(function (value) { return _thenIf(cond, ifTrue, ifFalse)(value); });
            }
            return _thenIf(cond, ifTrue, ifFalse);
        }
        function tapIf(cond, ifTrue, ifFalse) {
            if (this.steps)
                return this.addStep('tapIf', tslib_3.__spread(arguments));
            if (arguments.length === 1) {
                ifTrue = cond;
                cond = function (x) { return x; };
            }
            if (isPromiseLike(this)) {
                return this.then(function (value) { return _thenIf(cond, ifTrue, ifFalse, true)(value); });
            }
            return _thenIf(cond, ifTrue, ifFalse, true);
        }
        function _thenIf(cond, ifTrue, ifFalse, returnValue) {
            if (cond === void 0) { cond = function (x) { return x; }; }
            if (ifTrue === void 0) { ifTrue = function (x) { return x; }; }
            if (ifFalse === void 0) { ifFalse = function () { return null; }; }
            if (returnValue === void 0) { returnValue = false; }
            return function (value) {
                return FP.resolve(cond(value))
                    .then(function (ans) { return (ans ? ifTrue(value) : ifFalse(value)); })
                    .then(function (v) { return (returnValue ? value : v); });
            };
        }
    }
    exports["default"] = conditional;
});
define("events", ["require", "exports", "modules/errors"], function (require, exports, errors_2) {
    "use strict";
    exports.__esModule = true;
    exports.listen = void 0;
    exports.listen = function listen(obj) {
        var _this = this;
        var eventNames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            eventNames[_i - 1] = arguments[_i];
        }
        var addKey = typeof obj.addEventListener !== 'undefined' ? 'addEventListener' : 'on';
        if (!obj[addKey])
            throw new errors_2.FPInputError('Valid EventEmitter required.');
        // Gets callback to attach to the event handlers
        var handler = this.chainEnd();
        this._FP.destroy = function () { return _this._FP.destroyHandles.map(function (fn) { return fn() || true; }).filter(function (v) { return v; }).length; };
        this._FP.destroyHandles = eventNames.map(function (eventName) {
            obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler);
            return function () { return obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler); };
        });
        return this;
    };
});
define("monads", ["require", "exports", "tslib", "modules/errors"], function (require, exports, tslib_4, errors_3) {
    "use strict";
    exports.__esModule = true;
    function monads(FP) {
        return { chain: chain, chainEnd: chainEnd };
        /**
         * Start 'recording' a chain of commands, after steps defined call `.chainEnd()`
         * @returns FunctionalPromise
         */
        function chain() {
            // create a placeholder/initial promise to hold the steps/chain data
            var promise = FP.resolve();
            promise.steps = [];
            return promise;
        }
        /**
         * Call after starting a `.chain()`.
         *
         * One of the few non-chainable methods in the API.
         * @returns a Function. It runs your functional chain!
         */
        function chainEnd() {
            var _this = this;
            return function (input) {
                if (!_this.steps || _this.steps.length <= 0)
                    throw new errors_3.FPInputError('No steps defined between .chain() & .chainEnd()');
                var stepCount = 0;
                var _a = FP.unpack(), promise = _a.promise, resolve = _a.resolve, reject = _a.reject;
                while (stepCount < _this.steps.length) {
                    var _b = tslib_4.__read(_this.steps[stepCount], 3), fnName = _b[0], args = _b[2];
                    promise = promise[fnName].apply(promise, tslib_4.__spread(args));
                    stepCount++;
                }
                resolve(input);
                return promise;
            };
        }
    }
    exports["default"] = monads;
});
define("promise", ["require", "exports", "tslib", "modules/errors"], function (require, exports, tslib_5, errors_4) {
    "use strict";
    exports.__esModule = true;
    exports.delay = exports._delay = exports._reject = exports.promiseAllObject = exports.all = exports.reject = void 0;
    function all(promises) {
        return FP.resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises));
    }
    exports.all = all;
    function promiseAllObject(obj) {
        var keys = Object.getOwnPropertyNames(obj);
        var values = keys.map(function (key) { return obj[key]; });
        return Promise.all(values).then(function (results) { return results.reduce(function (obj, val, index) {
            var _a;
            var key = keys[index];
            return Object.assign((_a = {}, _a[key] = val, _a), obj);
        }, {}); });
    }
    exports.promiseAllObject = promiseAllObject;
    function _reject(err) {
        if (err instanceof Error) {
            if (this)
                this._error = err;
            return Promise.reject(err);
        }
        throw new Error("Reject only accepts a new instance of Error!");
    }
    exports._reject = _reject;
    exports.reject = _reject;
    function _delay(msec) {
        if (!Number.isInteger(msec))
            throw new errors_4.FPInputError('FP.delay(millisec) requires a numeric arg.');
        return function (value) { return new FP(function (resolve) { setTimeout(function () { return resolve(value); }, msec); }); };
    }
    exports._delay = _delay;
    function delay(msec) {
        if (this.steps)
            return this.addStep('delay', tslib_5.__spread(arguments));
        return this && this._FP ? FP.resolve(this.then(_delay(msec))) : _delay(msec)();
    }
    exports.delay = delay;
});
define("index", ["require", "exports", "tslib", "modules/errors", "modules/utils", "monads", "arrays", "events", "conditional", "promise", "util"], function (require, exports, tslib_6, errors_5, utils_3, monads_1, arrays_1, events_1, conditional_1, promise_1, util_1) {
    "use strict";
    exports.__esModule = true;
    exports.FunctionalPromise = void 0;
    utils_3 = tslib_6.__importDefault(utils_3);
    monads_1 = tslib_6.__importDefault(monads_1);
    arrays_1 = tslib_6.__importDefault(arrays_1);
    conditional_1 = tslib_6.__importDefault(conditional_1);
    var isFunction = utils_3["default"].isFunction, flatten = utils_3["default"].flatten;
    var _a = arrays_1["default"](FP), map = _a.map, find = _a.find, findIndex = _a.findIndex, filter = _a.filter, flatMap = _a.flatMap, reduce = _a.reduce;
    var _b = conditional_1["default"](FP), tapIf = _b.tapIf, thenIf = _b.thenIf, _thenIf = _b._thenIf;
    var _c = monads_1["default"](FP), chain = _c.chain, chainEnd = _c.chainEnd;
    exports["default"] = FP;
    FP.prototype.all = promise_1.all;
    FP.prototype.map = map;
    FP.prototype.find = find;
    FP.prototype.findIndex = findIndex;
    FP.prototype.filter = filter;
    FP.prototype.flatMap = flatMap;
    FP.prototype.reduce = reduce;
    FP.prototype.listen = events_1.listen;
    FP.prototype.tapIf = tapIf;
    FP.prototype.thenIf = thenIf;
    FP.prototype._thenIf = _thenIf;
    FP.prototype.delay = promise_1.delay;
    FP.prototype._delay = promise_1._delay;
    FP.prototype.reject = promise_1.reject;
    // export const all = allPromises
    FP.all = FP.prototype.all;
    FP.thenIf = FP.prototype._thenIf;
    FP.delay = function (msec) { return FP.resolve().delay(msec); };
    FP.silent = function (limit) { return FP.resolve().silent(limit); };
    // Monadic Methods
    FP.chain = chain;
    FP.prototype.chainEnd = chainEnd;
    FP.reject = FP.prototype.reject;
    FP.resolve = resolve;
    FP.promisify = promisify;
    FP.promisifyAll = promisifyAll;
    FP.unpack = unpack;
    FP.prototype.addStep = function addStep(name, args) {
        if (this.steps)
            this.steps.push([name, this, args]);
        return this;
    };
    FP.prototype.concurrency = function concurrency(limit) {
        if (limit === void 0) { limit = Infinity; }
        if (this.steps)
            return this.addStep("concurrency", tslib_6.__spread(arguments));
        this._FP.concurrencyLimit = limit;
        return this;
    };
    FP.prototype.quiet = function quiet(errorLimit) {
        if (errorLimit === void 0) { errorLimit = Infinity; }
        if (this.steps)
            return this.addStep("quiet", tslib_6.__spread(arguments));
        this._FP.errors = { count: 0, limit: errorLimit };
        return this;
    };
    FP.prototype.silent = FP.prototype.quiet;
    /**
     * Helper to accumulate string keys *until an object is provided*.
     * Returns a partial function to accept more keys until partial
     */
    FP.get = function getter() {
        var getArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            getArgs[_i] = arguments[_i];
        }
        getArgs = flatten(getArgs);
        var keyNames = getArgs.filter(function (s) { return typeof s === "string"; });
        var objectFound = getArgs.find(util_1.isObject);
        // Return partial app / auto-curry deal here
        if (!objectFound) {
            // return function to keep going
            return function () {
                var extraArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    extraArgs[_i] = arguments[_i];
                }
                return FP.get.apply(FP, tslib_6.__spread(extraArgs, getArgs));
            };
        }
        if (keyNames.length === 1)
            return objectFound[keyNames[0]];
        return keyNames.reduce(function (extracted, key) {
            extracted[key] = objectFound[key];
            return extracted;
        }, {});
    };
    FP.prototype.get = function get() {
        var keyNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keyNames[_i] = arguments[_i];
        }
        if (this.steps)
            return this.addStep("get", tslib_6.__spread(arguments));
        return this.then ? this.then(FP.get(keyNames)) : FP.get.apply(FP, tslib_6.__spread(keyNames));
    };
    FP.prototype.set = function set(keyName, value) {
        if (this.steps)
            return this.addStep("set", tslib_6.__spread(arguments));
        return this.then(function (obj) {
            if (typeof obj === "object")
                obj[keyName] = value;
            return obj;
        });
    };
    FP.prototype["catch"] = function (fn) {
        if (this.steps)
            return this.addStep("catch", tslib_6.__spread(arguments));
        if (arguments.length === 2)
            return this.catchIf.apply(this, tslib_6.__spread(arguments));
        if (!isFunction(fn))
            throw new errors_5.FunctionalError("Invalid fn argument for `.catch(fn)`. Must be a function. Currently: " +
                typeof fn);
        return FP.resolve(this._FP.promise["catch"](function (err) { return fn(err); }));
    };
    FP.prototype.catchIf = function catchIf(condition, fn) {
        if (this.steps)
            return this.addStep("catchIf", tslib_6.__spread(arguments));
        if (!isFunction(fn))
            throw new errors_5.FunctionalError("Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: " +
                typeof fn);
        return FP.resolve(this._FP.promise["catch"](function (err) {
            if (condition && err instanceof condition)
                return fn(err); // try re-throw, might be really slow...
            throw err;
        }));
    };
    FP.prototype.then = function then(fn) {
        if (this.steps)
            return this.addStep("then", tslib_6.__spread(arguments));
        if (!isFunction(fn))
            throw new errors_5.FunctionalError("Invalid fn argument for `.then(fn)`. Must be a function. Currently: " +
                typeof fn);
        return FP.resolve(this._FP.promise.then(fn));
    };
    FP.prototype.tap = function tap(fn) {
        if (this.steps)
            return this.addStep("tap", tslib_6.__spread(arguments));
        if (!isFunction(fn))
            throw new errors_5.FunctionalError("Invalid fn argument for `.tap(fn)`. Must be a function. Currently: " +
                typeof fn);
        return FP.resolve(this._FP.promise.then(function (value) { return (fn(value) ? value : value); }));
    };
    function resolve(value) {
        return new FP(function (resolve, reject) {
            if (value && isFunction(value === null || value === void 0 ? void 0 : value.then))
                return value.then(resolve)["catch"](reject);
            resolve(value);
        });
    }
    function promisify(cb) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new FP(function (yah, nah) {
                return cb.call.apply(cb, tslib_6.__spread([_this], args, [function (err, res) { return (err ? nah(err) : yah(res)); }]));
            });
        };
    }
    function promisifyAll(obj) {
        if (!obj || !Object.getPrototypeOf(obj)) {
            throw new Error("Invalid Argument obj in promisifyAll(obj)");
        }
        return Object.getOwnPropertyNames(obj)
            .filter(function (key) { return typeof obj[key] === "function"; })
            .reduce(function (obj, fnName) {
            if (!/Sync/.test(fnName) && !obj[fnName + "Async"])
                obj[fnName + "Async"] = FP.promisify(obj["" + fnName]);
            return obj;
        }, obj);
    }
    function unpack() {
        var resolve, reject, promise = new FP(function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;
        });
        return { promise: promise, resolve: resolve, reject: reject };
    }
    // type Step = [string, unknown, unknown][]
    // export interface FP<T = any> {
    //   steps: RepeatableStep[];
    //   _FP: { errors: { limit: number; count: number }; promise: Promise<T>; concurrencyLimit: number }
    //   new(executor: Executor): FP<T>;
    // }
    function FP(executor) {
        if (!(this instanceof FP)) {
            return new FP(executor);
        }
        if (arguments.length !== 1)
            throw new Error("FunctionalPromises constructor only accepts 1 callback argument");
        this._FP = {
            errors: { limit: 0, count: 0 },
            promise: new Promise(executor),
            concurrencyLimit: 4
        };
    }
    exports.FunctionalPromise = FP;
});
// if (process && process.on) {
//   // process.on('uncaughtException', e => console.error('FPromises: FATAL EXCEPTION: uncaughtException', e))
//   process.on('unhandledRejection', e => console.error('FPromises: FATAL ERROR: unhandledRejection', e))
// }
//# sourceMappingURL=index.js.map