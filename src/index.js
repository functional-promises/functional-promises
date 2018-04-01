const {FunctionalError}          = require('./modules/errors')
const {isFunction, flatten}      = require('./modules/utils')
const {chain, chainEnd}          = require('./monads')
const FP = FunctionalPromise

Object.assign(FP.prototype,
  require('./arrays'),
  require('./events'),
  require('./conditional'),
  require('./promise'))

function FunctionalPromise(resolveRejectCB, unknownArgs) {
  if (!(this instanceof FunctionalPromise)) {return new FunctionalPromise(resolveRejectCB)}
  if (unknownArgs != undefined) throw new Error('FunctionalPromise only accepts 1 argument')
  this._FP = {
    errors: {limit: 1, count: 0},
    concurrencyLimit: 4,
    promise: new Promise(resolveRejectCB),
  }
}

FP.all = FP.prototype.all
FP.thenIf = FP.prototype._thenIf
FP.delay = msec => FP.resolve().delay(msec)

// Monadic Methods
FP.chain = chain
FP.prototype.chainEnd = chainEnd

FP.prototype.addStep = function addStep(name, args) {
  if (this.steps) this.steps.push([name, this, args])
  return this
}

FP.prototype.concurrency = function concurrency(limit = Infinity) {
  if (this.steps) return this.addStep('concurrency', [...arguments])
  this._FP.concurrencyLimit = limit
  return this
}

FP.prototype.quiet = function quiet(limit = Infinity) {
  if (this.steps) return this.addStep('quiet', [...arguments])
  this._FP.errors = { count: 0, limit: limit }
  return this
}

FP.prototype.get = function get(...keyNames) {
  if (this.steps) return this.addStep('get', [...arguments])
  keyNames = flatten(keyNames)
  return this.then((obj) => {
    if (typeof obj === 'object') {
      if (keyNames.length === 1) return obj[keyNames[0]]
      return keyNames.reduce((extracted, key) => {
        extracted[key] = obj[key]
        return extracted
      }, {})
    }
    return obj
  })
}

FP.prototype.set = function set(keyName, value) {
  if (this.steps) return this.addStep('set', [...arguments])
  return this.then(obj => {
    if (typeof obj === 'object') obj[keyName] = value
    return obj
  })
}

FP.prototype.catch = function(fn) {
  if (this.steps) return this.addStep('catch', [...arguments])
  if (arguments.length === 2) return this.catchIf(...arguments)
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.catch(fn)`. Must be a function. Currently: ' + typeof fn)
  return FP.resolve(this._FP.promise.catch(err => {
    return fn(err) // try re-throw, might be really slow...
  }))
}

FP.prototype.catchIf = function catchIf(condition, fn) {
  if (this.steps) return this.addStep('catchIf', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: ' + typeof fn)

  return FP.resolve(this._FP.promise.catch(err => {
    if (condition && err instanceof condition) return fn(err) // try re-throw, might be really slow...
    throw err
  }))
}

FP.prototype.then = function then(fn) {
  if (this.steps) return this.addStep('then', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof fn)
  return FP.resolve(this._FP.promise.then(fn))
}

FP.prototype.tap = function tap(fn) {
  if (this.steps) return this.addStep('tap', [...arguments])
  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.tap(fn)`. Must be a function. Currently: ' + typeof fn)
  return FP.resolve(this._FP.promise.then(value => fn(value) ? value : value))
}

FP.resolve = FP.prototype.resolve = function resolve(value) {
  return new FP((resolve, reject) => {
    if (value && isFunction(value.then)) return value.then(resolve).catch(reject)
    resolve(value)
  })
}

FP.promisify = function promisify(cb) {
  return (...args) => new FP((yah, nah) =>
    cb.call(this, ...args, (err, res) => err ? nah(err) : yah(res)))
}

FP.promisifyAll = function promisifyAll(obj) {
  if (!obj || !Object.getPrototypeOf(obj)) { throw new Error('Invalid Argument obj in promisifyAll(obj)') }
  return Object.getOwnPropertyNames(obj)
  .filter(key => typeof obj[key] === 'function')
  .reduce((obj, fnName) => {
    if (!/Sync/.test(fnName) && !obj[`${fnName}Async`]) obj[`${fnName}Async`] = FP.promisify(obj[`${fnName}`])
    return obj
  }, obj)
}

FP.unpack = function unpack() {
  let resolve, reject, promise;
  promise = new Promise((yah, nah) => { resolve = yah; reject = nah })
  return { promise, resolve, reject }
}

module.exports = FunctionalPromise

if (process && process.on) {
  process.on('uncaughtException', e => console.error('Process: FATAL EXCEPTION: uncaughtException', e, '\n\n'))
  process.on('unhandledRejection', e => console.error('Process: FATAL PROMISE ERROR: unhandledRejection', e, '\n\n'))
}
