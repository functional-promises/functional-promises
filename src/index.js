"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
exports.FunctionalPromise = void 0;
var errors_1 = require("./modules/errors");
var utils_1 = require("./modules/utils");
var monads_1 = require("./monads");
var arrays_1 = require("./arrays");
var events_1 = require("./events");
var conditional_1 = require("./conditional");
var promise_1 = require("./promise");
var util_1 = require("util");
var isFunction = utils_1["default"].isFunction, flatten = utils_1["default"].flatten;
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
        return this.addStep("concurrency", __spread(arguments));
    this._FP.concurrencyLimit = limit;
    return this;
};
FP.prototype.quiet = function quiet(errorLimit) {
    if (errorLimit === void 0) { errorLimit = Infinity; }
    if (this.steps)
        return this.addStep("quiet", __spread(arguments));
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
            return FP.get.apply(FP, __spread(extraArgs, getArgs));
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
        return this.addStep("get", __spread(arguments));
    return this.then ? this.then(FP.get(keyNames)) : FP.get.apply(FP, __spread(keyNames));
};
FP.prototype.set = function set(keyName, value) {
    if (this.steps)
        return this.addStep("set", __spread(arguments));
    return this.then(function (obj) {
        if (typeof obj === "object")
            obj[keyName] = value;
        return obj;
    });
};
FP.prototype["catch"] = function (fn) {
    if (this.steps)
        return this.addStep("catch", __spread(arguments));
    if (arguments.length === 2)
        return this.catchIf.apply(this, __spread(arguments));
    if (!isFunction(fn))
        throw new errors_1.FunctionalError("Invalid fn argument for `.catch(fn)`. Must be a function. Currently: " +
            typeof fn);
    return FP.resolve(this._FP.promise["catch"](function (err) { return fn(err); }));
};
FP.prototype.catchIf = function catchIf(condition, fn) {
    if (this.steps)
        return this.addStep("catchIf", __spread(arguments));
    if (!isFunction(fn))
        throw new errors_1.FunctionalError("Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: " +
            typeof fn);
    return FP.resolve(this._FP.promise["catch"](function (err) {
        if (condition && err instanceof condition)
            return fn(err); // try re-throw, might be really slow...
        throw err;
    }));
};
FP.prototype.then = function then(fn) {
    if (this.steps)
        return this.addStep("then", __spread(arguments));
    if (!isFunction(fn))
        throw new errors_1.FunctionalError("Invalid fn argument for `.then(fn)`. Must be a function. Currently: " +
            typeof fn);
    return FP.resolve(this._FP.promise.then(fn));
};
FP.prototype.tap = function tap(fn) {
    if (this.steps)
        return this.addStep("tap", __spread(arguments));
    if (!isFunction(fn))
        throw new errors_1.FunctionalError("Invalid fn argument for `.tap(fn)`. Must be a function. Currently: " +
            typeof fn);
    return FP.resolve(this._FP.promise.then(function (value) { return (fn(value) ? value : value); }));
};
function resolve(value) {
    return new FP(function (resolve, reject) {
        if (value && (value === null || value === void 0 ? void 0 : value.then) && isFunction(value === null || value === void 0 ? void 0 : value.then))
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
            return cb.call.apply(cb, __spread([_this], args, [function (err, res) { return (err ? nah(err) : yah(res)); }]));
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
// if (process && process.on) {
//   // process.on('uncaughtException', e => console.error('FPromises: FATAL EXCEPTION: uncaughtException', e))
//   process.on('unhandledRejection', e => console.error('FPromises: FATAL ERROR: unhandledRejection', e))
// }
