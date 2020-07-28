import { __spreadArrays } from "tslib";
var inherits = require('util').inherits;
inherits(FunctionalError, Error);
inherits(FunctionalUserError, FunctionalError);
inherits(FPUnexpectedError, FunctionalError);
inherits(FPInputError, FunctionalError);
inherits(FPSoftError, FunctionalError);
inherits(FPTimeout, FunctionalError);
export function FunctionalError(msg, options) {
    var _this = this;
    if (!(this instanceof FunctionalError))
        return new (FunctionalError.bind.apply(FunctionalError, __spreadArrays([void 0], arguments)))();
    if (typeof msg === 'object') {
        options = msg;
        if (msg.message)
            msg = msg.message;
    }
    Error.call(this, msg);
    if (typeof options === 'object') {
        Object.getOwnPropertyNames(options)
            .forEach(function (key) {
            _this[key] = options[key];
        });
    }
    this.name = this.constructor.name;
    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this);
}
export function FunctionalUserError() {
    if (!(this instanceof FunctionalUserError))
        return new (FunctionalUserError.bind.apply(FunctionalUserError, __spreadArrays([void 0], arguments)))();
    FunctionalError.call.apply(FunctionalError, __spreadArrays([this], arguments));
}
export function FPUnexpectedError() {
    if (!(this instanceof FPUnexpectedError))
        return new (FPUnexpectedError.bind.apply(FPUnexpectedError, __spreadArrays([void 0], arguments)))();
    FunctionalError.call.apply(FunctionalError, __spreadArrays([this], arguments));
}
export function FPInputError() {
    if (!(this instanceof FPInputError))
        return new (FPInputError.bind.apply(FPInputError, __spreadArrays([void 0], arguments)))();
    FunctionalError.call.apply(FunctionalError, __spreadArrays([this], arguments));
}
export function FPSoftError() {
    if (!(this instanceof FPSoftError))
        return new (FPSoftError.bind.apply(FPSoftError, __spreadArrays([void 0], arguments)))();
    FunctionalError.call.apply(FunctionalError, __spreadArrays([this], arguments));
}
export function FPTimeout() {
    if (!(this instanceof FPTimeout))
        return new (FPTimeout.bind.apply(FPTimeout, __spreadArrays([void 0], arguments)))();
    FunctionalError.call.apply(FunctionalError, __spreadArrays([this], arguments));
}
//# sourceMappingURL=errors.js.map