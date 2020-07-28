import { __spreadArrays } from "tslib";
import { FPInputError } from './modules/errors';
export default function (FP) {
    return { all: all, reject: reject, delay: delay, _delay: _delay };
    function all(promises) {
        return FP.resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises));
    }
    function promiseAllObject(obj) {
        var keys = Object.getOwnPropertyNames(obj);
        var values = keys.map(function (key) { return obj[key]; });
        return Promise.all(values).then(function (results) { return results.reduce(function (obj, val, index) {
            var _a;
            var key = keys[index];
            return Object.assign((_a = {}, _a[key] = val, _a), obj);
        }, {}); });
    }
    function reject(err) {
        if (err instanceof Error) {
            if (this)
                this._error = err;
            return Promise.reject(err);
        }
        throw new Error("Reject only accepts a new instance of Error!");
    }
    function _delay(msec) {
        if (!Number.isInteger(msec))
            throw new FPInputError('FP.delay(millisec) requires a numeric arg.');
        return function (value) { return new FP(function (resolve) { setTimeout(function () { return resolve(value); }, msec); }); };
    }
    function delay(msec) {
        if (this.steps)
            return this.addStep('delay', __spreadArrays(arguments));
        return this && this._FP ? FP.resolve(this.then(_delay(msec))) : _delay(msec)();
    }
}
//# sourceMappingURL=promise.js.map