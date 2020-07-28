"use strict";
exports.__esModule = true;
var utils = {
    isPromiseLike: function (p) { return !!(p && typeof p.then === 'function'); },
    isFunction: function (fn) { return typeof fn === 'function'; },
    isEnumerable: function (list) { return list && Array.isArray(list) || list && typeof list[Symbol.iterator] === 'function'; },
    isObject: function (o) { return Object.prototype.toString.call(o) === '[object Object]'; },
    flatten: function (arr) {
        if (!Array.isArray(arr))
            throw new Error('Method `flatten` requires valid array parameter');
        return arr.reduce(function (results, item) { return results.concat(Array.isArray(item) ? utils.flatten(item) : [item]); }, []);
    }
};
exports["default"] = utils;
