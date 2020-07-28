"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.FPTimeout = exports.FPSoftError = exports.FPInputError = exports.FPUnexpectedError = exports.FunctionalUserError = exports.FunctionalError = void 0;
var FunctionalError = /** @class */ (function (_super) {
    __extends(FunctionalError, _super);
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
    __extends(FunctionalUserError, _super);
    function FunctionalUserError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FunctionalUserError;
}(FunctionalError));
exports.FunctionalUserError = FunctionalUserError;
var FPUnexpectedError = /** @class */ (function (_super) {
    __extends(FPUnexpectedError, _super);
    function FPUnexpectedError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FPUnexpectedError;
}(FunctionalError));
exports.FPUnexpectedError = FPUnexpectedError;
var FPInputError = /** @class */ (function (_super) {
    __extends(FPInputError, _super);
    function FPInputError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FPInputError;
}(FunctionalError));
exports.FPInputError = FPInputError;
var FPSoftError = /** @class */ (function (_super) {
    __extends(FPSoftError, _super);
    function FPSoftError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FPSoftError;
}(FunctionalError));
exports.FPSoftError = FPSoftError;
var FPTimeout = /** @class */ (function (_super) {
    __extends(FPTimeout, _super);
    function FPTimeout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FPTimeout;
}(FunctionalError));
exports.FPTimeout = FPTimeout;
