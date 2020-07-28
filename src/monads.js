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
var errors_1 = require("./modules/errors");
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
                throw new errors_1.FPInputError('No steps defined between .chain() & .chainEnd()');
            var stepCount = 0;
            var _a = FP.unpack(), promise = _a.promise, resolve = _a.resolve, reject = _a.reject;
            while (stepCount < _this.steps.length) {
                var _b = __read(_this.steps[stepCount], 3), fnName = _b[0], args = _b[2];
                promise = promise[fnName].apply(promise, __spread(args));
                stepCount++;
            }
            resolve(input);
            return promise;
        };
    }
}
exports["default"] = monads;
