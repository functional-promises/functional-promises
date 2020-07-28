import { __spreadArrays } from "tslib";
import { FunctionalError } from './modules/errors';
import utils from './modules/utils';
import monads from './monads';
import arrays from './arrays';
import { listen } from './events';
import conditional from './conditional';
import promise from './promise';
var isFunction = utils.isFunction, flatten = utils.flatten;
var _a = arrays(FP), map = _a.map, find = _a.find, findIndex = _a.findIndex, filter = _a.filter, flatMap = _a.flatMap, reduce = _a.reduce;
var _b = promise(FP), all = _b.all, reject = _b.reject, delay = _b.delay, _delay = _b._delay;
var _c = conditional(FP), tapIf = _c.tapIf, thenIf = _c.thenIf, _thenIf = _c._thenIf;
var _d = monads(FP), chain = _d.chain, chainEnd = _d.chainEnd;
FP.prototype.all = all;
FP.prototype.map = map;
FP.prototype.find = find;
FP.prototype.findIndex = findIndex;
FP.prototype.filter = filter;
FP.prototype.flatMap = flatMap;
FP.prototype.reduce = reduce;
FP.prototype.listen = listen;
FP.prototype.tapIf = tapIf;
FP.prototype.thenIf = thenIf;
FP.prototype._thenIf = _thenIf;
FP.prototype.delay = delay;
FP.prototype._delay = _delay;
FP.prototype.reject = reject;
// FP.default = FP
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
        return this.addStep('concurrency', __spreadArrays(arguments));
    this._FP.concurrencyLimit = limit;
    return this;
};
FP.prototype.quiet = function quiet(errorLimit) {
    if (errorLimit === void 0) { errorLimit = Infinity; }
    if (this.steps)
        return this.addStep('quiet', __spreadArrays(arguments));
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
    var keyNames = getArgs.filter(function (s) { return typeof s === 'string'; });
    var objectFound = getArgs.find(function (s) { return typeof s !== 'string'; });
    // Return partial app / auto-curry deal here
    if (!objectFound) { // return function to keep going
        return function () {
            var extraArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                extraArgs[_i] = arguments[_i];
            }
            return FP.get.apply(FP, __spreadArrays(extraArgs, getArgs));
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
        return this.addStep('get', __spreadArrays(arguments));
    return this.then
        ? this.then(FP.get(keyNames))
        : FP.get.apply(FP, keyNames);
};
FP.prototype.set = function set(keyName, value) {
    if (this.steps)
        return this.addStep('set', __spreadArrays(arguments));
    return this.then(function (obj) {
        if (typeof obj === 'object')
            obj[keyName] = value;
        return obj;
    });
};
FP.prototype["catch"] = function (fn) {
    if (this.steps)
        return this.addStep('catch', __spreadArrays(arguments));
    if (arguments.length === 2)
        return this.catchIf.apply(this, arguments);
    if (!isFunction(fn))
        throw new FunctionalError('Invalid fn argument for `.catch(fn)`. Must be a function. Currently: ' + typeof fn);
    return FP.resolve(this._FP.promise["catch"](function (err) { return fn(err); }));
};
FP.prototype.catchIf = function catchIf(condition, fn) {
    if (this.steps)
        return this.addStep('catchIf', __spreadArrays(arguments));
    if (!isFunction(fn))
        throw new FunctionalError('Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: ' + typeof fn);
    return FP.resolve(this._FP.promise["catch"](function (err) {
        if (condition && err instanceof condition)
            return fn(err); // try re-throw, might be really slow...
        throw err;
    }));
};
FP.prototype.then = function then(fn) {
    if (this.steps)
        return this.addStep('then', __spreadArrays(arguments));
    if (!isFunction(fn))
        throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof fn);
    return FP.resolve(this._FP.promise.then(fn));
};
FP.prototype.tap = function tap(fn) {
    if (this.steps)
        return this.addStep('tap', __spreadArrays(arguments));
    if (!isFunction(fn))
        throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn);
    return FP.resolve(this._FP.promise.then(function (value) { return fn(value) ? value : value; }));
};
function resolve(value) {
    return new FP(function (resolve, reject) {
        if (value && isFunction(value.then))
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
            return cb.call.apply(cb, __spreadArrays([_this], args, [function (err, res) { return err ? nah(err) : yah(res); }]));
        });
    };
}
function promisifyAll(obj) {
    if (!obj || !Object.getPrototypeOf(obj)) {
        throw new Error('Invalid Argument obj in promisifyAll(obj)');
    }
    return Object.getOwnPropertyNames(obj)
        .filter(function (key) { return typeof obj[key] === 'function'; })
        .reduce(function (obj, fnName) {
        if (!/Sync/.test(fnName) && !obj[fnName + "Async"])
            obj[fnName + "Async"] = FP.promisify(obj["" + fnName]);
        return obj;
    }, obj);
}
function unpack() {
    var resolve, reject, promise = new FP(function (yah, nah) { resolve = yah; reject = nah; });
    return { promise: promise, resolve: resolve, reject: reject };
}
export default function FP(resolveRejectCB) {
    if (!(this instanceof FP)) {
        return new FP(resolveRejectCB);
    }
    if (arguments.length !== 1)
        throw new Error('FunctionalPromises constructor only accepts 1 callback argument');
    this._FP = {
        errors: { limit: 0, count: 0 },
        promise: new Promise(resolveRejectCB),
        concurrencyLimit: 4
    };
}
// if (process && process.on) {
//   // process.on('uncaughtException', e => console.error('FPromises: FATAL EXCEPTION: uncaughtException', e))
//   process.on('unhandledRejection', e => console.error('FPromises: FATAL ERROR: unhandledRejection', e))
// }
//# sourceMappingURL=index.js.map