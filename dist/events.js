import { FPInputError } from './modules/errors';
export var listen = function listen(obj) {
    var _this = this;
    var eventNames = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        eventNames[_i - 1] = arguments[_i];
    }
    if (typeof eventNames === 'string')
        eventNames = [eventNames];
    if (!obj[obj.addEventListener ? 'addEventListener' : 'on'])
        throw new FPInputError('Valid EventEmitter required.');
    // Gets callback to attach to the event handlers
    var handler = this.chainEnd();
    this._FP.destroy = function () { return _this._FP.destroyHandles.map(function (fn) { return fn() || true; }).filter(function (v) { return v; }).length; };
    this._FP.destroyHandles = eventNames.map(function (eventName) {
        obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler);
        return function () { return obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler); };
    });
    return this;
};
//# sourceMappingURL=events.js.map