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
exports.delay = exports._delay = exports._reject = exports.promiseAllObject = exports.all = exports.reject = void 0;
var errors_1 = require("./modules/errors");
var _1 = require("./");
function all(promises) {
    return _1["default"].resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises));
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
        throw new errors_1.FPInputError('FP.delay(millisec) requires a numeric arg.');
    return function (value) { return new _1["default"](function (resolve) { setTimeout(function () { return resolve(value); }, msec); }); };
}
exports._delay = _delay;
function delay(msec) {
    if (this.steps)
        return this.addStep('delay', __spread(arguments));
    return this && this._FP ? _1["default"].resolve(this.then(_delay(msec))) : _delay(msec)();
}
exports.delay = delay;
