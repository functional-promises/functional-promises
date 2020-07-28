import { __spreadArrays } from "tslib";
import utils from './modules/utils';
var isPromiseLike = utils.isPromiseLike;
export default function conditional(FP) {
    return { tapIf: tapIf, thenIf: thenIf, _thenIf: _thenIf };
    function thenIf(cond, ifTrue, ifFalse) {
        if (this.steps)
            return this.addStep('thenIf', __spreadArrays(arguments));
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
            return this.addStep('tapIf', __spreadArrays(arguments));
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
//# sourceMappingURL=conditional.js.map