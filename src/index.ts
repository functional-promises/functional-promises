import { FunctionalError } from './modules/errors'
import type { FPStatic } from './public-types'
import utils from './modules/utils'
import monads from './monads'
import arrays from './arrays'
import { listen } from './events'
import conditional from './conditional'
import promise from './promise'

const { isFunction, flatten } = utils

function FP(this: any, resolveRejectCB: (resolve: (value?: unknown) => void, reject: (error?: unknown) => void) => void) {
  if (!(this instanceof FP)) {
    return new (FP as any)(resolveRejectCB)
  }

  if (arguments.length !== 1) {
    throw new Error('FunctionalPromises constructor only accepts 1 callback argument')
  }

  ;(this as any)._FP = {
    errors: { limit: 0, count: 0 },
    promise: new Promise(resolveRejectCB),
    concurrencyLimit: 4,
  }
}

const { map, find, findIndex, filter, flatMap, reduce } = arrays(FP)
const { all, delay, _delay } = promise(FP)
const { tapIf, thenIf, _thenIf } = conditional(FP)
const { chain, chainEnd } = monads(FP)

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

FP.all = FP.prototype.all
FP.thenIf = FP.prototype._thenIf
FP.delay = (msec: number) => FP.resolve().delay(msec)
FP.silent = (limit: number) => FP.resolve().silent(limit)

FP.chain = chain
FP.prototype.chainEnd = chainEnd
FP.reject = FP.prototype.reject
FP.resolve = resolve

FP.promisify = promisify
FP.promisifyAll = promisifyAll
FP.unpack = unpack

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

FP.get = function getter(...getArgs: unknown[]) {
  getArgs = flatten(getArgs)
  const keyNames = getArgs.filter((item) => typeof item === 'string') as string[]
  const objectFound = getArgs.find((item) => typeof item !== 'string') as Record<string, unknown> | undefined

  if (!objectFound) {
    return (...extraArgs: unknown[]) => FP.get(...extraArgs, ...getArgs)
  }

  if (keyNames.length === 1) {
    return objectFound[keyNames[0]]
  }

  return keyNames.reduce<Record<string, unknown>>((extracted, key) => {
    extracted[key] = objectFound[key]
    return extracted
  }, {})
}

FP.prototype.get = function get(...keyNames: unknown[]) {
  if (this.steps) return this.addStep('get', Array.from(arguments))
  return this.then ? this.then(FP.get(keyNames)) : FP.get(...keyNames)
}

FP.prototype.set = function set(keyName: string, value: unknown) {
  if (this.steps) return this.addStep('set', Array.from(arguments))
  return this.then((obj: Record<string, unknown>) => {
    if (typeof obj === 'object' && obj !== null) obj[keyName] = value
    return obj
  })
}

// Issue #10: the original used `arguments.length === 2` to detect the 2-arg overload, but
// the function only declared one parameter so TypeScript couldn't see or type-check the
// second argument. Now uses an explicit second parameter for type visibility.
FP.prototype.catch = function catchProxy(fn: unknown, fn2?: unknown) {
  if (this.steps) return this.addStep('catch', Array.from(arguments))
  if (fn2 !== undefined) return this.catchIf(fn, fn2)
  if (!isFunction(fn)) {
    throw new FunctionalError('Invalid fn argument for `.catch(fn)`. Must be a function. Currently: ' + typeof fn)
  }
  return FP.resolve(this._FP.promise.catch((err: Error) => (fn as (error: Error) => unknown)(err)))
}

FP.prototype.catchIf = function catchIf(condition: any, fn: unknown) {
  if (this.steps) return this.addStep('catchIf', Array.from(arguments))
  if (!isFunction(fn)) {
    throw new FunctionalError('Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: ' + typeof fn)
  }

  return FP.resolve(
    this._FP.promise.catch((err: Error) => {
      if (condition && err instanceof condition) {
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
  return FP.resolve(this._FP.promise.then(onFulfilled as (value: unknown) => unknown, onRejected as (error: Error) => unknown))
}

FP.prototype.tap = function tap(fn: unknown) {
  if (this.steps) return this.addStep('tap', Array.from(arguments))
  if (!isFunction(fn)) {
    throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn)
  }
  return FP.resolve(this._FP.promise.then((value: unknown) => ((fn as (input: unknown) => unknown)(value), value)))
}

function resolve(value?: unknown) {
  return new (FP as any)((resolveFn: (input?: unknown) => void, rejectFn: (error?: unknown) => void) => {
    if (value && isFunction((value as PromiseLike<unknown>).then)) {
      return Promise.resolve(value).then(resolveFn, rejectFn)
    }
    resolveFn(value)
  })
}

// Issue #3: `cb.call(this, ...)` used the module-level `this` (undefined in ESM strict
// mode), not a meaningful callback context. Callers that need a bound `this` should
// pre-bind their function before passing it to promisify(), matching Node.js util.promisify.
function promisify(cb: (...args: unknown[]) => unknown) {
  return (...args: unknown[]) =>
    new (FP as any)((yah: (value: unknown) => void, nah: (error: unknown) => void) =>
      cb(...args, (err: unknown, res: unknown) => (err ? nah(err) : yah(res))))
}

function promisifyAll(obj: Record<string, any>) {
  if (!obj || !Object.getPrototypeOf(obj)) {
    throw new Error('Invalid Argument obj in promisifyAll(obj)')
  }

  return Object.getOwnPropertyNames(obj)
    .filter((key) => typeof obj[key] === 'function')
    .reduce((target, fnName) => {
      if (!/Sync/.test(fnName) && !target[`${fnName}Async`]) {
        target[`${fnName}Async`] = FP.promisify(target[fnName])
      }
      return target
    }, obj)
}

function unpack() {
  let resolveFn: (value: unknown) => void = () => undefined
  let rejectFn: (error: unknown) => void = () => undefined
  const promise = new (FP as any)((yah: (value: unknown) => void, nah: (error: unknown) => void) => {
    resolveFn = yah
    rejectFn = nah
  })
  return { promise, resolve: resolveFn, reject: rejectFn }
}

// Issue #21: the original threw synchronously when passed a non-Error value, which is
// surprising for a method named `reject` — callers expect a rejected promise, not an
// exception. Now always returns a rejected FPInstance. Non-Error values are wrapped so
// the rejection is always an Error (consistent with the rest of the library).
function reject(this: any, err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err))
  if (this && typeof this === 'object') this._error = error
  return FP.resolve(Promise.reject(error))
}

export default FP as unknown as FPStatic
