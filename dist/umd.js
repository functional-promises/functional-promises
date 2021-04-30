(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FP = factory());
}(this, (function () { 'use strict';

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
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
    if (_isNativeReflectConstruct()) {
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
  inherits(FPCollectionError, FunctionalError);
  inherits(FPUnexpectedError, FunctionalError);
  inherits(FPInputError, FunctionalError);
  inherits(FPTimeout, FunctionalError);
  function FunctionalError(msg, options) {
    var _this = this;

    if (!(this instanceof FunctionalError)) return _construct(FunctionalError, Array.prototype.slice.call(arguments));

    if (typeof msg === 'object') {
      options = msg;
      if (options.message) msg = options.message;
    }

    Error.call(this, msg);
    if (typeof msg === 'string') this.message = msg;

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
  function FPCollectionError() {
    if (!(this instanceof FPCollectionError)) return _construct(FPCollectionError, Array.prototype.slice.call(arguments));
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
      return list && Array.isArray(list) || list && typeof list[Symbol.iterator] === 'function';
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

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    define(Gp, toStringTagSymbol, "Generator");

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
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

      return FP.resolve(iterable).reduce( /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(result, item, index) {
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (result.item) {
                    _context.next = 6;
                    break;
                  }

                  _context.next = 3;
                  return callback(item);

                case 3:
                  if (!_context.sent) {
                    _context.next = 6;
                    break;
                  }

                  result.item = item;
                  result.index = index;

                case 6:
                  return _context.abrupt("return", result);

                case 7:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x, _x2, _x3) {
          return _ref3.apply(this, arguments);
        };
      }(), {
        item: undefined,
        index: -1
      }); // .then(({item, index}) => )
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
            Promise.all([total, current.value]).then(function (_ref4) {
              var total = _ref4[0],
                  item = _ref4[1];
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
      var threadLimit = Math.max(1, this && this._FP && this._FP.concurrencyLimit || 1);
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
          if (!isEnumerable(items)) return reject(new FPInputError("Value must be iterable! A '" + typeof items + "' was passed into FP.map()", {
            input: items
          }));
          args = [].concat(items);

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
              err._index = c;
              errors.push(err);

              if (_this._FP.errors.limit <= 0) {
                rejectIt(err);
                return err;
              }

              if (errors.length > _this._FP.errors.limit) {
                var fpErr = new FPCollectionError("Error limit " + _this._FP.errors.limit + " met/exceeded with " + _this._FP.errors.count + " errors.", {
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

  /**
   * 
   * @param {FP} FunctionalPromises 
   */

  function promise(FP) {
    return {
      all: all,
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
    /**
     * 
     * @param {Number} msec 
     * @returns {any => FP}
     */


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

  /// <reference path="../index.d.ts" />
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

  FP.prototype.then = function then(onFulfilled, onRejected) {
    if (this.steps) return this.addStep('then', Array.prototype.slice.call(arguments));
    if (!isFunction(onFulfilled)) throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof onResolved);
    return FP.resolve(this._FP.promise.then(onFulfilled, onRejected));
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
        promise = new FP(function (yah, nah) {
      resolve = yah;
      reject = nah;
    });
    return {
      promise: promise,
      resolve: resolve,
      reject: reject
    };
  }
  /**
   * @param {Error} err 
   * @returns {Promise<Error>}
   */


  function reject(err) {
    if (err instanceof Error) {
      if (this) this._error = err;
      return Promise.reject(err);
    }

    throw new Error("Reject only accepts a new instance of Error!");
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

  return FP;

})));
//# sourceMappingURL=umd.js.map
