"use strict";
exports.__esModule = true;
exports.listen = void 0;
var errors_1 = require("./modules/errors");
exports.listen = function listen(obj) {
    var _this = this;
    var eventNames = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        eventNames[_i - 1] = arguments[_i];
    }
    var addKey = typeof obj.addEventListener !== "undefined" ? "addEventListener" : "on";
    var removeKey = addKey === "on" ? "off" : "removeEventListener";
    if (!obj[addKey])
        throw new errors_1.FPInputError("Valid EventEmitter required.");
    // Gets callback to attach to the event handlers
    var handler = this.chainEnd();
    this._FP.destroy = function () {
        return _this._FP.destroyHandles &&
            _this._FP.destroyHandles
                .map(function (fn) { return fn() || true; })
                .filter(function (v) { return Boolean(v); }).length;
    };
    this._FP.destroyHandles = eventNames.map(function (eventName) {
        (obj[addKey] && obj[addKey])(eventName, handler);
        return function () { return (obj[removeKey] && obj[removeKey])(eventName, handler); };
    });
    return this;
};
