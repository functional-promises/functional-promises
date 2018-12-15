import { FunctionalError } from './modules/errors.js';
import utils from './modules/utils.js';
import monads from './monads.js';
import arrays from './arrays.js';
import { listen } from './events.js';
import conditional from './conditional.js';
import promise from './promise.js';

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

FP.prototype.get = function get() {
  for (var _len = arguments.length, keyNames = new Array(_len), _key = 0; _key < _len; _key++) {
    keyNames[_key] = arguments[_key];
  }

  if (this.steps) return this.addStep('get', Array.prototype.slice.call(arguments));
  keyNames = flatten(keyNames);
  return this.then(function (obj) {
    if (typeof obj === 'object') {
      if (keyNames.length === 1) return obj[keyNames[0]];
      return keyNames.reduce(function (extracted, key) {
        extracted[key] = obj[key];
        return extracted;
      }, {});
    }

    return obj;
  });
};

FP.prototype.set = function set(keyName, value) {
  if (this.steps) return this.addStep('set', Array.prototype.slice.call(arguments));
  return this.then(function (obj) {
    if (typeof obj === 'object') obj[keyName] = value;
    return obj;
  });
};

FP.prototype.catch = function (fn) {
  if (this.steps) return this.addStep('catch', Array.prototype.slice.call(arguments));
  if (arguments.length === 2) return this.catchIf.apply(this, arguments);
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.catch(fn)`. Must be a function. Currently: ' + typeof fn);
  return FP.resolve(this._FP.promise.catch(function (err) {
    return fn(err);
  }));
};

FP.prototype.catchIf = function catchIf(condition, fn) {
  if (this.steps) return this.addStep('catchIf', Array.prototype.slice.call(arguments));
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: ' + typeof fn);
  return FP.resolve(this._FP.promise.catch(function (err) {
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
    if (value && isFunction(value.then)) return value.then(resolve).catch(reject);
    resolve(value);
  });
}

function promisify(cb) {
  var _this = this;

  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
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

export default FP;
