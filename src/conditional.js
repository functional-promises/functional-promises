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
var utils_1 = require("./modules/utils");
var isPromiseLike = utils_1["default"].isPromiseLike;
function conditional(FP) {
    return { tapIf: tapIf, thenIf: thenIf, _thenIf: _thenIf };
    function thenIf(cond, ifTrue, ifFalse) {
        if (this.steps)
            return this.addStep('thenIf', __spread(arguments));
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
            return this.addStep('tapIf', __spread(arguments));
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
