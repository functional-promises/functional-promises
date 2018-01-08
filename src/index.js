const functionsIn       = require('lodash/functionsIn')
const isFunction        = require('lodash/isFunction')
const arraysMixin       = require('./arrays')
const eventsMixin       = require('./events')
const monadsMixin       = require('./monads')
const promiseMixin      = require('./promise')
const conditionalMixin  = require('./conditional')
const {FunctionalError} = require('./modules/errors')

arraysMixin(FunctionalPromise)
eventsMixin(FunctionalPromise)
monadsMixin(FunctionalPromise)
promiseMixin(FunctionalPromise)
conditionalMixin(FunctionalPromise)

function FunctionalPromise(resolveRejectCB, ...unknownArgs) {
  if (!(this instanceof FunctionalPromise)) {return new FunctionalPromise(resolveRejectCB)}
  if (unknownArgs.length > 0) throw new Error('FunctionalPromise only accepts 1 argument')
  this._FP = {
    concurrencyLimit: 4,
    hardErrorLimit: -1,
    promise: new Promise(resolveRejectCB),
  }
}

FunctionalPromise.prototype.addStep = function(name, args) {
  if (this.steps) {
    this.steps.push([name, this, args])
  }
  return this
}

FunctionalPromise.prototype.concurrency = function(limit = Infinity) {
  if (this.steps) return this.addStep('concurrency', [...arguments])
  this._FP.concurrencyLimit = limit
  return this
}

FunctionalPromise.prototype.serial = function() {
  if (this.steps) return this.addStep('serial', [...arguments])
  return this.concurrency(1)
}

FunctionalPromise.prototype.get = function(keyName) {
  if (this.steps) return this.addStep('get', [...arguments])
  return this.then((obj) => typeof obj === 'object' ? obj[keyName] : obj)
}

FunctionalPromise.prototype.set = function(keyName, value) {
  if (this.steps) return this.addStep('set', [...arguments])
  return this.then(obj => {
    if (typeof obj === 'object') {
      obj[keyName] = value
    }
    return obj
  })
}

FunctionalPromise.prototype.catch = function(fn) {
  if (this.steps) return this.addStep('catch', [...arguments])
  if (this._FP.error) {
    const result = fn(this._FP.error)
    this._FP.error = undefined // no dbl-catch
    return result
  }
  // bypass error handling
  return FunctionalPromise.resolve(this._FP.value)
}

FunctionalPromise.prototype.then = function then(fn) {
  if (this.steps) return this.addStep('then', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof fn)
  return this._FP.promise.then(fn)
}


/**
 * `.tap(fn)` works almost exactly like `.then()`
 *
 * Except the return value is not changed by the `fn`'s return value.
 *
 * @example
 * Extremely common use case:
 * `FP.resolve(42).tap(console.log).then(x => x === 42)`
 *
 * @param {function} fn
 * @returns FunctionalPromise
 */
FunctionalPromise.prototype.tap = function tap(fn) {
  if (this.steps) return this.addStep('tap', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn)
  return this._FP
  .promise.then(value => {
    fn(value) // fires in the node callback queue (aka background task)
    return value
  })
}

FunctionalPromise.resolve = function(value) {
  return new FunctionalPromise((resolve, reject) => {
    if (value && isFunction(value.then)) {
      return value.then(resolve).catch(reject)
    }
    resolve(value)
  })
}

FunctionalPromise.denodeify = FunctionalPromise.promisify = promisify

function promisify(cb) {
  return (...args) => new FunctionalPromise((yah, nah) => {
    return cb.call(this, ...args, (err, res) => {
      if (err) return nah(err)
      return yah(res)
    })
  })
}

function promisifyAll(obj) {
  if (!obj || !Object.getPrototypeOf(obj)) { throw new Error('Invalid Argument obj in promisifyAll(obj)') }
  return functionsIn(obj)
  .reduce((obj, fn) => {
    if (!/Sync/.test(fn) && !obj[`${fn}Async`]) {
      obj[`${fn}Async`] = promisify(obj[`${fn}`])
    }
    return obj
  }, obj)
}

FunctionalPromise.promisifyAll = promisifyAll

module.exports = FunctionalPromise
