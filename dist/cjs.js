'use strict';

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

var _require = require('util'),
    inherits = _require.inherits;

inherits(FunctionalError, Error);
inherits(FunctionalUserError, FunctionalError);
inherits(FPUnexpectedError, FunctionalError);
inherits(FPInputError, FunctionalError);
inherits(FPSoftError, FunctionalError);
inherits(FPTimeout, FunctionalError);
function FunctionalError(msg, options) {
  var _this = this;

  if (!(this instanceof FunctionalError)) return _construct(FunctionalError, Array.prototype.slice.call(arguments));

  if (typeof msg === 'object') {
    options = msg;
    if (msg.message) msg = msg.message;
  }

  Error.call(this, msg);

  if (typeof options === 'object') {
    Object.getOwnPropertyNames(options).forEach(function (key) {
      _this[key] = options[key];
    });
  }

  this.name = this.constructor.name; // Capturing stack trace, excluding constructor call from it.

  Error.captureStackTrace(this);
}
function FunctionalUserError() {
  if (!(this instanceof FunctionalUserError)) return _construct(FunctionalUserError, Array.prototype.slice.call(arguments));
  FunctionalError.call.apply(FunctionalError, [this].concat(Array.prototype.slice.call(arguments)));
}
function FPUnexpectedError() {
  if (!(this instanceof FPUnexpectedError)) return _construct(FPUnexpectedError, Array.prototype.slice.call(arguments));
  FunctionalError.call.apply(FunctionalError, [this].concat(Array.prototype.slice.call(arguments)));
}
function FPInputError() {
  if (!(this instanceof FPInputError)) return _construct(FPInputError, Array.prototype.slice.call(arguments));
  FunctionalError.call.apply(FunctionalError, [this].concat(Array.prototype.slice.call(arguments)));
}
function FPSoftError() {
  if (!(this instanceof FPSoftError)) return _construct(FPSoftError, Array.prototype.slice.call(arguments));
  FunctionalError.call.apply(FunctionalError, [this].concat(Array.prototype.slice.call(arguments)));
}
function FPTimeout() {
  if (!(this instanceof FPTimeout)) return _construct(FPTimeout, Array.prototype.slice.call(arguments));
  FunctionalError.call.apply(FunctionalError, [this].concat(Array.prototype.slice.call(arguments)));
}

var utils = {
  isPromiseLike: function isPromiseLike(p) {
    return !!(p && typeof p.then === 'function');
  },
  isFunction: function isFunction(fn) {
    return typeof fn === 'function';
  },
  isEnumerable: function isEnumerable(list) {
    return list && Array.isArray(list) || typeof list[Symbol.iterator] === 'function';
  },
  isObject: function isObject(o) {
    return !!Object.prototype.toString.call(o) === '[object Object]';
  },
  flatten: function flatten(arr) {
    if (!Array.isArray(arr)) throw new Error('Method `flatten` requires valid array parameter');
    return arr.reduce(function (results, item) {
      return results.concat(Array.isArray(item) ? utils.flatten(item) : [item]);
    }, []);
  }
};

function monads(FP) {
  return {
    chain: chain,
    chainEnd: chainEnd
  };
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
      if (!_this.steps || _this.steps.length <= 0) throw new FPInputError('No steps defined between .chain() & .chainEnd()');
      var stepCount = 0;

      var _FP$unpack = FP.unpack(),
          promise = _FP$unpack.promise,
          resolve = _FP$unpack.resolve,
          reject = _FP$unpack.reject;

      while (stepCount < _this.steps.length) {
        var _promise;

        var _this$steps$stepCount = _this.steps[stepCount],
            fnName = _this$steps$stepCount[0],
            args = _this$steps$stepCount[2];
        promise = (_promise = promise)[fnName].apply(_promise, args);
        stepCount++;
      }

      resolve(input);
      return promise;
    };
  }
}

var isEnumerable = utils.isEnumerable;
function arrays (FP) {
  return {
    map: map,
    find: find,
    findIndex: findIndex,
    filter: filter,
    flatMap: flatMap,
    reduce: reduce
  };

  function find(callback) {
    return _find.call(this, callback).then(function (_ref) {
      var item = _ref.item;
      return item;
    });
  }

  function findIndex(callback) {
    return _find.call(this, callback).then(function (_ref2) {
      var index = _ref2.index;
      return index;
    });
  }

  function _find(iterable, callback) {
    if (this.steps) return this.addStep('_find', Array.prototype.slice.call(arguments));

    if (typeof iterable === 'function') {
      callback = iterable;
      iterable = this._FP.promise;
    }

    return FP.resolve(iterable).filter(callback).then(function (results) {
      return results[0] != undefined ? {
        item: results[0],
        index: results.indexOf(results[0])
      } : {
        item: undefined,
        index: -1
      };
    });
  }

  function flatMap(iterable, callback) {
    if (this.steps) return this.addStep('flatMap', Array.prototype.slice.call(arguments));

    if (typeof iterable === 'function') {
      callback = iterable;
      iterable = this._FP.promise;
    }

    return FP.resolve(iterable).map(callback).reduce(function (acc, arr) {
      return acc.concat.apply(acc, arr);
    }, []);
  }

  function filter(iterable, callback) {
    if (this.steps) return this.addStep('filter', Array.prototype.slice.call(arguments));

    if (typeof iterable === 'function') {
      callback = iterable;
      iterable = this._FP.promise;
    }

    return reduce.call(this, iterable, function (acc, item) {
      return Promise.resolve(callback(item)).then(function (x) {
        return x ? acc.concat([item]) : acc;
      });
    }, []);
  }

  function reduce(iterable, reducer, initVal) {
    if (this.steps) return this.addStep('reduce', Array.prototype.slice.call(arguments));

    if (typeof iterable === 'function') {
      initVal = reducer;
      reducer = iterable;
      iterable = this._FP ? this._FP.promise : this;
    } else iterable = FP.resolve(iterable, this);

    return new FP(function (resolve, reject) {
      return iterable.then(function (iterable) {
        var iterator = iterable[Symbol.iterator]();
        var i = 0;

        var next = function next(total) {
          var current = iterator.next();
          if (current.done) return resolve(total);
          Promise.all([total, current.value]).then(function (_ref3) {
            var total = _ref3[0],
                item = _ref3[1];
            return next(reducer(total, item, i++));
          })["catch"](reject);
        };

        next(initVal);
      });
    });
  }
  /*eslint max-statements: ["error", 60]*/


  function map(args, fn, options) {
    var _this = this;

    if (this.steps) return this.addStep('map', Array.prototype.slice.call(arguments));

    if (arguments.length === 1 && this && this._FP) {
      fn = args;
      args = this && this._FP && this._FP.promise;
    }

    var resolvedOrRejected = false;
    var threadLimit = Math.max(1, Math.min(this && this._FP && this._FP.concurrencyLimit || 1, 4));
    var innerValues = this && this._FP && this._FP.promise ? this._FP.promise : Promise.resolve(args);
    var initialThread = 0;
    var errors = [];
    var count = 0;
    var results = [];
    var threadPool = new Set();

    var threadPoolFull = function threadPoolFull() {
      return threadPool.size >= threadLimit;
    };

    var isDone = function isDone() {
      return errors.length > _this._FP.errors.limit || count >= args.length || resolvedOrRejected;
    };

    var setResult = function setResult(index) {
      return function (value) {
        threadPool["delete"](index);
        results[index] = value;
        return value;
      };
    };

    return FP.resolve(new Promise(function (resolve, reject) {
      var resolveIt = function resolveIt(x) {
        // console.log('Action.resolve:', resolvedOrRejected, x)
        if (resolvedOrRejected) {
          return null;
        } else {
          resolvedOrRejected = true;
        }

        resolve(x);
      };

      var rejectIt = function rejectIt(x) {
        if (resolvedOrRejected) {
          return null;
        } else {
          resolvedOrRejected = true;
        } // console.log('Action.reject:', resolvedOrRejected, x)


        reject(x);
      };

      innerValues.then(function (items) {
        args = [].concat(items);
        if (!isEnumerable(items)) return reject(new FPInputError('Invalid input data passed into FP.map()'));

        var complete = function complete() {
          var action = null;
          if (errors.length > _this._FP.errors.limit) action = rejectIt;
          if (isDone()) action = resolveIt;
          if (action) return Promise.all(results).then(function (data) {
            return action(results);
          }) ? true : true;
          return false;
        };

        var checkAndRun = function checkAndRun(val) {
          // console.log('checkAndRun', count, resolvedOrRejected, val)
          if (resolvedOrRejected) return;
          if (!complete() && !results[count]) runItem(count);
          return val;
        };

        var runItem = function runItem(c) {
          if (resolvedOrRejected) {
            return null;
          } else {
            count++;
          }

          if (threadPoolFull()) return setTimeout(function () {
            return runItem(c);
          }, 0);
          if (results[c]) return results[c];
          threadPool.add(c); // either get value with `fn(item)` or `item.then(fn)`

          results[c] = Promise.resolve(args[c]).then(function (val) {
            return fn(val, c, args);
          }).then(function (val) {
            return setResult(c)(val);
          }).then(checkAndRun)["catch"](function (err) {
            _this._FP.errors.count++;
            errors.push(err); // console.log('ERR HANDLER!', errors.length, this._FP.errors.limit)

            if (errors.length > _this._FP.errors.limit) {
              var fpErr = errors.length === 1 ? err : new FunctionalError("Error Limit " + _this._FP.errors.limit + " Exceeded.\n                idx=" + c + " errCnt=" + _this._FP.errors.count, {
                errors: errors,
                results: results,
                ctx: _this
              });
              Promise.resolve(setResult(c)(err)).then(function () {
                return rejectIt(fpErr);
              });
            } else {
              // console.warn('Error OK:', JSON.stringify(this._FP.errors))
              return Promise.resolve().then(function () {
                return setResult(c)(err);
              }).then(checkAndRun);
            }
          });
          return results[c];
        }; // Kick off x number of initial threads


        while (initialThread < threadLimit && initialThread < args.length) {
          runItem(initialThread++);
        }
      });
    }));
  }
}

var listen = function listen(obj) {
  var _this = this;

  for (var _len = arguments.length, eventNames = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    eventNames[_key - 1] = arguments[_key];
  }

  if (typeof eventNames === 'string') eventNames = [eventNames];
  if (!obj[obj.addEventListener ? 'addEventListener' : 'on']) throw new FPInputError('Valid EventEmitter required.'); // Gets callback to attach to the event handlers

  var handler = this.chainEnd();

  this._FP.destroy = function () {
    return _this._FP.destroyHandles.map(function (fn) {
      return fn() || true;
    }).filter(function (v) {
      return v;
    }).length;
  };

  this._FP.destroyHandles = eventNames.map(function (eventName) {
    obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler);
    return function () {
      return obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler);
    };
  });
  return this;
};

var isPromiseLike = utils.isPromiseLike;
function conditional(FP) {
  return {
    tapIf: tapIf,
    thenIf: thenIf,
    _thenIf: _thenIf
  };

  function thenIf(cond, ifTrue, ifFalse) {
    if (this.steps) return this.addStep('thenIf', Array.prototype.slice.call(arguments));

    if (arguments.length === 1) {
      ifTrue = cond;

      cond = function cond(x) {
        return x;
      };
    }

    if (isPromiseLike(this)) {
      return this.then(function (value) {
        return _thenIf(cond, ifTrue, ifFalse)(value);
      });
    }

    return _thenIf(cond, ifTrue, ifFalse);
  }

  function tapIf(cond, ifTrue, ifFalse) {
    if (this.steps) return this.addStep('tapIf', Array.prototype.slice.call(arguments));

    if (arguments.length === 1) {
      ifTrue = cond;

      cond = function cond(x) {
        return x;
      };
    }

    if (isPromiseLike(this)) {
      return this.then(function (value) {
        return _thenIf(cond, ifTrue, ifFalse, true)(value);
      });
    }

    return _thenIf(cond, ifTrue, ifFalse, true);
  }

  function _thenIf(cond, ifTrue, ifFalse, returnValue) {
    if (cond === void 0) {
      cond = function cond(x) {
        return x;
      };
    }

    if (ifTrue === void 0) {
      ifTrue = function ifTrue(x) {
        return x;
      };
    }

    if (ifFalse === void 0) {
      ifFalse = function ifFalse() {
        return null;
      };
    }

    if (returnValue === void 0) {
      returnValue = false;
    }

    return function (value) {
      return FP.resolve(cond(value)).then(function (ans) {
        return ans ? ifTrue(value) : ifFalse(value);
      }).then(function (v) {
        return returnValue ? value : v;
      });
    };
  }
}

function promise (FP) {
  return {
    all: all,
    reject: reject,
    delay: delay,
    _delay: _delay
  };

  function all(promises) {
    return FP.resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises));
  }

  function promiseAllObject(obj) {
    var keys = Object.getOwnPropertyNames(obj);
    var values = keys.map(function (key) {
      return obj[key];
    });
    return Promise.all(values).then(function (results) {
      return results.reduce(function (obj, val, index) {
        var _Object$assign;

        var key = keys[index];
        return Object.assign((_Object$assign = {}, _Object$assign[key] = val, _Object$assign), obj);
      }, {});
    });
  }

  function reject(err) {
    if (err instanceof Error) {
      if (this) this._error = err;
      return Promise.reject(err);
    }

    throw new Error("Reject only accepts a new instance of Error!");
  }

  function _delay(msec) {
    if (!Number.isInteger(msec)) throw new FPInputError('FP.delay(millisec) requires a numeric arg.');
    return function (value) {
      return new FP(function (resolve) {
        setTimeout(function () {
          return resolve(value);
        }, msec);
      });
    };
  }

  function delay(msec) {
    if (this.steps) return this.addStep('delay', Array.prototype.slice.call(arguments));
    return this && this._FP ? FP.resolve(this.then(_delay(msec))) : _delay(msec)();
  }
}

var isFunction = utils.isFunction,
    flatten = utils.flatten;

var _arrays = arrays(FP),
    map = _arrays.map,
    find = _arrays.find,
    findIndex = _arrays.findIndex,
    filter = _arrays.filter,
    flatMap = _arrays.flatMap,
    reduce = _arrays.reduce;

var _promise = promise(FP),
    all = _promise.all,
    reject = _promise.reject,
    delay = _promise.delay,
    _delay = _promise._delay;

var _conditional = conditional(FP),
    tapIf = _conditional.tapIf,
    thenIf = _conditional.thenIf,
    _thenIf = _conditional._thenIf;

var _monads = monads(FP),
    chain = _monads.chain,
    chainEnd = _monads.chainEnd;

FP.prototype.all = all;
FP.prototype.map = map;
FP.prototype.find = find;
FP.prototype.findIndex = findIndex;
FP.prototype.filter = filter;
FP.prototype.flatMap = flatMap;
FP.prototype.reduce = reduce;
FP.prototype.listen = listen;
FP.prototype.tapIf = tapIf;
FP.prototype.thenIf = thenIf;
FP.prototype._thenIf = _thenIf;
FP.prototype.delay = delay;
FP.prototype._delay = _delay;
FP.prototype.reject = reject; // FP.default = FP
// export const all = allPromises

FP.all = FP.prototype.all;
FP.thenIf = FP.prototype._thenIf;

FP.delay = function (msec) {
  return FP.resolve().delay(msec);
};

FP.silent = function (limit) {
  return FP.resolve().silent(limit);
}; // Monadic Methods


FP.chain = chain;
FP.prototype.chainEnd = chainEnd;
FP.reject = FP.prototype.reject;
FP.resolve = resolve;
FP.promisify = promisify;
FP.promisifyAll = promisifyAll;
FP.unpack = unpack;

FP.prototype.addStep = function addStep(name, args) {
  if (this.steps) this.steps.push([name, this, args]);
  return this;
};

FP.prototype.concurrency = function concurrency(limit) {
  if (limit === void 0) {
    limit = Infinity;
  }

  if (this.steps) return this.addStep('concurrency', Array.prototype.slice.call(arguments));
  this._FP.concurrencyLimit = limit;
  return this;
};

FP.prototype.quiet = function quiet(errorLimit) {
  if (errorLimit === void 0) {
    errorLimit = Infinity;
  }

  if (this.steps) return this.addStep('quiet', Array.prototype.slice.call(arguments));
  this._FP.errors = {
    count: 0,
    limit: errorLimit
  };
  return this;
};

FP.prototype.silent = FP.prototype.quiet;
/**
 * Helper to accumulate string keys *until an object is provided*. 
 * Returns a partial function to accept more keys until partial 
 */

FP.get = function getter() {
  for (var _len = arguments.length, getArgs = new Array(_len), _key = 0; _key < _len; _key++) {
    getArgs[_key] = arguments[_key];
  }

  getArgs = flatten(getArgs);
  var keyNames = getArgs.filter(function (s) {
    return typeof s === 'string';
  });
  var objectFound = getArgs.find(function (s) {
    return typeof s !== 'string';
  }); // Return partial app / auto-curry deal here

  if (!objectFound) {
    // return function to keep going
    return function () {
      for (var _len2 = arguments.length, extraArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        extraArgs[_key2] = arguments[_key2];
      }

      return FP.get.apply(FP, extraArgs.concat(getArgs));
    };
  }

  if (keyNames.length === 1) return objectFound[keyNames[0]];
  return keyNames.reduce(function (extracted, key) {
    extracted[key] = objectFound[key];
    return extracted;
  }, {});
};

FP.prototype.get = function get() {
  for (var _len3 = arguments.length, keyNames = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    keyNames[_key3] = arguments[_key3];
  }

  if (this.steps) return this.addStep('get', Array.prototype.slice.call(arguments));
  return this.then ? this.then(FP.get(keyNames)) : FP.get.apply(FP, keyNames);
};

FP.prototype.set = function set(keyName, value) {
  if (this.steps) return this.addStep('set', Array.prototype.slice.call(arguments));
  return this.then(function (obj) {
    if (typeof obj === 'object') obj[keyName] = value;
    return obj;
  });
};

FP.prototype["catch"] = function (fn) {
  if (this.steps) return this.addStep('catch', Array.prototype.slice.call(arguments));
  if (arguments.length === 2) return this.catchIf.apply(this, arguments);
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.catch(fn)`. Must be a function. Currently: ' + typeof fn);
  return FP.resolve(this._FP.promise["catch"](function (err) {
    return fn(err);
  }));
};

FP.prototype.catchIf = function catchIf(condition, fn) {
  if (this.steps) return this.addStep('catchIf', Array.prototype.slice.call(arguments));
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: ' + typeof fn);
  return FP.resolve(this._FP.promise["catch"](function (err) {
    if (condition && err instanceof condition) return fn(err); // try re-throw, might be really slow...

    throw err;
  }));
};

FP.prototype.then = function then(fn) {
  if (this.steps) return this.addStep('then', Array.prototype.slice.call(arguments));
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof fn);
  return FP.resolve(this._FP.promise.then(fn));
};

FP.prototype.tap = function tap(fn) {
  if (this.steps) return this.addStep('tap', Array.prototype.slice.call(arguments));
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn);
  return FP.resolve(this._FP.promise.then(function (value) {
    return fn(value) ? value : value;
  }));
};

function resolve(value) {
  return new FP(function (resolve, reject) {
    if (value && isFunction(value.then)) return value.then(resolve)["catch"](reject);
    resolve(value);
  });
}

function promisify(cb) {
  var _this = this;

  return function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return new FP(function (yah, nah) {
      return cb.call.apply(cb, [_this].concat(args, [function (err, res) {
        return err ? nah(err) : yah(res);
      }]));
    });
  };
}

function promisifyAll(obj) {
  if (!obj || !Object.getPrototypeOf(obj)) {
    throw new Error('Invalid Argument obj in promisifyAll(obj)');
  }

  return Object.getOwnPropertyNames(obj).filter(function (key) {
    return typeof obj[key] === 'function';
  }).reduce(function (obj, fnName) {
    if (!/Sync/.test(fnName) && !obj[fnName + "Async"]) obj[fnName + "Async"] = FP.promisify(obj["" + fnName]);
    return obj;
  }, obj);
}

function unpack() {
  var resolve,
      reject,
      promise$$1 = new FP(function (yah, nah) {
    resolve = yah;
    reject = nah;
  });
  return {
    promise: promise$$1,
    resolve: resolve,
    reject: reject
  };
}

function FP(resolveRejectCB) {
  if (!(this instanceof FP)) {
    return new FP(resolveRejectCB);
  }

  if (arguments.length !== 1) throw new Error('FunctionalPromises constructor only accepts 1 callback argument');
  this._FP = {
    errors: {
      limit: 0,
      count: 0
    },
    promise: new Promise(resolveRejectCB),
    concurrencyLimit: 4
  };
} // if (process && process.on) {
//   // process.on('uncaughtException', e => console.error('FPromises: FATAL EXCEPTION: uncaughtException', e))
//   process.on('unhandledRejection', e => console.error('FPromises: FATAL ERROR: unhandledRejection', e))
// }

module.exports = FP;
