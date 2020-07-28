import { __read, __spread } from "tslib";
import { FPInputError } from './modules/errors';
export default function monads(FP) {
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
                throw new FPInputError('No steps defined between .chain() & .chainEnd()');
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
//# sourceMappingURL=monads.js.map