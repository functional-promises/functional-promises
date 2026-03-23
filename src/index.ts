import { FunctionalError } from './modules/errors'
import type { FPStatic } from './public-types'
import type { FPConstructor, FPInternalInstance, FPExecutor } from './internal-types'
import utils from './modules/utils'
import monads from './monads'
import arrays from './arrays'
import { listen } from './events'
import conditional from './conditional'
import promise from './promise'

const { isFunction, flatten } = utils

// FP is a constructor function (not a class). The `this` type is `FPInternalInstance`
// when called with `new`, or `void` when called without.
function FP(this: FPInternalInstance | void, resolveRejectCB: FPExecutor) {
  if (!(this instanceof (FP as unknown as new (...args: unknown[]) => unknown))) {
    return new (FP as unknown as new (cb: FPExecutor) => FPInternalInstance)(resolveRejectCB)
  }

  if (arguments.length !== 1) {
    throw new Error('FunctionalPromises constructor only accepts 1 callback argument')
  }

  ;(this as FPInternalInstance)._FP = {
    errors: { limit: 0, count: 0 },
    promise: new Promise(resolveRejectCB),
    concurrencyLimit: 4,
  }
}

// Internal alias with the full constructor interface, used by all sub-modules.
const FPTyped = FP as unknown as FPConstructor

const { map, find, findIndex, filter, flatMap, reduce } = arrays(FPTyped)
const { all, delay, _delay } = promise(FPTyped)
const { tapIf, thenIf, _thenIf } = conditional(FPTyped)
const { chain, chainEnd } = monads(FPTyped)

FP.prototype.all = all
FP.prototype.map = map
FP.prototype.find = find
FP.prototype.findIndex = findIndex
FP.prototype.filter = filter
FP.prototype.flatMap = flatMap
FP.prototype.reduce = reduce
FP.prototype.listen = listen
FP.prototype.tapIf = tapIf
FP.prototype.thenIf = thenIf
FP.prototype._thenIf = _thenIf
FP.prototype.delay = delay
FP.prototype._delay = _delay
FP.prototype.reject = reject

// Static methods — assigned via `as unknown as` to avoid the double-assertion
// error on the bare function type which has no index signature.
const FPStatics = FP as unknown as Record<string, unknown>

FPStatics['all'] = FP.prototype.all
FPStatics['thenIf'] = FP.prototype._thenIf
FPStatics['delay'] = (msec: number) => FPTyped.resolve().delay(msec)
FPStatics['silent'] = (limit: number) => FPTyped.resolve().silent(limit)
FPStatics['chain'] = chain
FPStatics['reject'] = FP.prototype.reject
FPStatics['resolve'] = resolve
FPStatics['promisify'] = promisify
FPStatics['promisifyAll'] = promisifyAll
FPStatics['unpack'] = unpack

FP.prototype.chainEnd = chainEnd

FP.prototype.addStep = function addStep(name: string, args: unknown[]) {
  if (this.steps) this.steps.push([name, this, args])
  return this
}

FP.prototype.concurrency = function concurrency(limit = Infinity) {
  if (this.steps) return this.addStep('concurrency', Array.from(arguments))
  this._FP.concurrencyLimit = limit
  return this
}

FP.prototype.quiet = function quiet(errorLimit = Infinity) {
  if (this.steps) return this.addStep('quiet', Array.from(arguments))
  this._FP.errors = { count: 0, limit: errorLimit }
  return this
}
FP.prototype.silent = FP.prototype.quiet

// FP.get — curried property getter.
// Accepts key name strings + optional object. If the object is omitted the
// returned function captures the keys and awaits the object on the next call.
function getter(...getArgs: unknown[]): unknown {
  getArgs = flatten(getArgs)
  const keyNames = getArgs.filter((item) => typeof item === 'string') as string[]
  const objectFound = getArgs.find((item) => typeof item !== 'string') as Record<string, unknown> | undefined

  if (!objectFound) {
    return (...extraArgs: unknown[]) => getter(...extraArgs, ...getArgs)
  }

  if (keyNames.length === 1) {
    return objectFound[keyNames[0]!]
  }

  return keyNames.reduce<Record<string, unknown>>((extracted, key) => {
    extracted[key] = objectFound[key]
    return extracted
  }, {})
}

FPStatics['get'] = getter

FP.prototype.get = function get(...keyNames: unknown[]) {
  if (this.steps) return this.addStep('get', Array.from(arguments))
  return this.then ? this.then(getter(keyNames) as (v: unknown) => unknown) : getter(...keyNames)
}

FP.prototype.set = function set(keyName: string, value: unknown) {
  if (this.steps) return this.addStep('set', Array.from(arguments))
  return this.then((obj: unknown) => {
    if (typeof obj === 'object' && obj !== null) (obj as Record<string, unknown>)[keyName] = value
    return obj
  })
}

FP.prototype.catch = function catchProxy(fn: unknown, fn2?: unknown) {
  if (this.steps) return this.addStep('catch', Array.from(arguments))
  if (fn2 !== undefined) return this.catchIf(fn, fn2)
  if (!isFunction(fn)) {
    throw new FunctionalError('Invalid fn argument for `.catch(fn)`. Must be a function. Currently: ' + typeof fn)
  }
  return FPTyped.resolve(this._FP.promise.catch((err: Error) => (fn as (error: Error) => unknown)(err)))
}

FP.prototype.catchIf = function catchIf(condition: unknown, fn: unknown) {
  if (this.steps) return this.addStep('catchIf', Array.from(arguments))
  if (!isFunction(fn)) {
    throw new FunctionalError('Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: ' + typeof fn)
  }

  return FPTyped.resolve(
    this._FP.promise.catch((err: Error) => {
      if (condition && err instanceof (condition as new (...args: unknown[]) => Error)) {
        return (fn as (error: Error) => unknown)(err)
      }
      throw err
    })
  )
}

FP.prototype.then = function then(onFulfilled: unknown, onRejected?: unknown) {
  if (this.steps) return this.addStep('then', Array.from(arguments))
  if (!isFunction(onFulfilled)) {
    throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof onFulfilled)
  }
  return FPTyped.resolve(this._FP.promise.then(onFulfilled as (value: unknown) => unknown, onRejected as (error: Error) => unknown))
}

FP.prototype.tap = function tap(fn: unknown) {
  if (this.steps) return this.addStep('tap', Array.from(arguments))
  if (!isFunction(fn)) {
    throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn)
  }
  return FPTyped.resolve(this._FP.promise.then((value: unknown) => ((fn as (input: unknown) => unknown)(value), value)))
}

function resolve(value?: unknown) {
  return new FPTyped((resolveFn: (input?: unknown) => void, rejectFn: (error?: unknown) => void) => {
    if (value && isFunction((value as PromiseLike<unknown>).then)) {
      return Promise.resolve(value).then(resolveFn, rejectFn)
    }
    resolveFn(value)
  })
}

function promisify(cb: (...args: unknown[]) => unknown) {
  return (...args: unknown[]) =>
    new FPTyped((yah: (value: unknown) => void, nah: (error: unknown) => void) =>
      cb(...args, (err: unknown, res: unknown) => (err ? nah(err) : yah(res))))
}

function promisifyAll(obj: Record<string, unknown>) {
  if (!obj || !Object.getPrototypeOf(obj)) {
    throw new Error('Invalid Argument obj in promisifyAll(obj)')
  }

  return Object.getOwnPropertyNames(obj)
    .filter((key) => typeof obj[key] === 'function')
    .reduce((target, fnName) => {
      if (!/Sync/.test(fnName) && !target[`${fnName}Async`]) {
        target[`${fnName}Async`] = FPTyped.promisify(target[fnName] as (...args: unknown[]) => unknown)
      }
      return target
    }, obj)
}

function unpack() {
  let resolveFn: (value: unknown) => void = () => undefined
  let rejectFn: (error: unknown) => void = () => undefined
  const fpPromise = new FPTyped((yah: (value: unknown) => void, nah: (error: unknown) => void) => {
    resolveFn = yah
    rejectFn = nah
  })
  return { promise: fpPromise, resolve: resolveFn, reject: rejectFn }
}

function reject(this: FPInternalInstance | undefined, err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err))
  if (this && typeof this === 'object' && '_error' in this) this._error = error
  return FPTyped.resolve(Promise.reject(error))
}

export default FP as unknown as FPStatic
