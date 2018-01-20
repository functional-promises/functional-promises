const functionsIn       = require('lodash/functionsIn')
const isFunction        = require('lodash/isFunction')
const {FunctionalError} = require('./modules/errors')
const {listen}          = require('./events')
const {chain, chainEnd} = require('./monads')
const {map, filter}     = require('./arrays')
const {reduce}          = require('./arrays')
const {find, findIndex} = require('./arrays')
const {all, cast}       = require('./promise')
const {reject}          = require('./promise')
const {thenIf, _thenIf} = require('./conditional')
const {tapIf}           = require('./conditional')
const FP = FunctionalPromise

function FunctionalPromise(resolveRejectCB, ...unknownArgs) {
  if (!(this instanceof FunctionalPromise)) {return new FunctionalPromise(resolveRejectCB)}
  if (unknownArgs.length > 0) throw new Error('FunctionalPromise only accepts 1 argument')
  this._FP = {
    concurrencyLimit: 4,
    hardErrorLimit: -1,
    promise: new Promise(resolveRejectCB),
  }
}

// FPromise Core Stuff
FP.denodeify = FP.promisify = promisify
FP.promisifyAll = promisifyAll
FP.resolve = resolve
FP.prototype.all = FP.all = all
FP.prototype.cast = cast
FP.prototype.reject = reject
FP.prototype.tap = tap
FP.prototype.then = then

// Monadic Methods
FP.chain = chain
FP.prototype.chainEnd = chainEnd

// Array Helpers
FP.prototype.map = map
FP.prototype.find = find
FP.prototype.filter = filter
FP.prototype.reduce = reduce
FP.prototype.findIndex = findIndex

// Conditional Methods
FP.prototype.tapIf = tapIf
FP.prototype.thenIf = thenIf
FP.prototype._thenIf = _thenIf
FP.thenIf = _thenIf

// Events Methods
FP.prototype.listen = listen

FP.unpack = unpack


FP.prototype.addStep = function(name, args) {
  if (this.steps) {
    this.steps.push([name, this, args])
  }
  return this
}

FP.prototype.concurrency = function(limit = Infinity) {
  if (this.steps) return this.addStep('concurrency', [...arguments])
  this._FP.concurrencyLimit = limit
  return this
}

FP.prototype.serial = function() {
  if (this.steps) return this.addStep('serial', [...arguments])
  return this.concurrency(1)
}

FP.prototype.get = function(keyName) {
  if (this.steps) return this.addStep('get', [...arguments])
  return this.then((obj) => typeof obj === 'object' ? obj[keyName] : obj)
}

FP.prototype.set = function(keyName, value) {
  if (this.steps) return this.addStep('set', [...arguments])
  return this.then(obj => {
    if (typeof obj === 'object') {
      obj[keyName] = value
    }
    return obj
  })
}

FP.prototype.catch = function(fn) {
  if (this.steps) return this.addStep('catch', [...arguments])
  if (this._FP.error) {
    const result = fn(this._FP.error)
    this._FP.error = undefined // no dbl-catch
    return result
  }
  // bypass error handling
  return FP.resolve(this._FP.value)
}

function then(fn) {
  if (this.steps) return this.addStep('then', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof fn)
  return this._FP.promise.then(fn)
}

function tap(fn) {
  if (this.steps) return this.addStep('tap', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn)
  return this._FP
  .promise.then(value => {
    fn(value) // fires in the node callback queue (aka background task)
    return value
  })
}

function resolve(value) {
  return new FP((resolve, reject) => {
    if (value && isFunction(value.then)) {
      return value.then(resolve).catch(reject)
    }
    resolve(value)
  })
}

function promisify(cb) {
  return (...args) => new FP((yah, nah) => {
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

function unpack() {
  let resolve, reject, promise;
  promise = new Promise((yah, nah) => { resolve = yah; reject = nah })
  return { promise, resolve, reject }
}

module.exports = FunctionalPromise


if (process && process.on) {
  process.on('uncaughtException', function (e) {
    console.error('Process: FATAL EXCEPTION: uncaughtException', e, '\n\n')
  })
  process.on('unhandledRejection', function (e) {
    console.error('Process: FATAL PROMISE ERROR: unhandledRejection', e, '\n\n')
  })
}