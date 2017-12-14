const {assign, functionsIn,
  isFunction}             = require('lodash')
const promiseBase         = require('./src/promise')
const conditionalMixin    = require('./src/conditional')
const {map}    = require('./src/modules/arrays')

function FunctionalRiver(resolveRejectCB, ...unknownArgs) {
  if (!(this instanceof FunctionalRiver)) {return new FunctionalRiver(resolveRejectCB)}
  if (unknownArgs.length > 0) throw new Error('FunctionalRiver only accepts 1 argument')
  this._FR = {}
  this._FR.concurrencyLimit = Infinity
  this._FR.promise = new Promise(resolveRejectCB)
  assign(this, promiseBase, conditionalMixin)
}

FunctionalRiver.prototype.map = map
FunctionalRiver.prototype.all = promiseBase.all
FunctionalRiver.prototype.race = promiseBase.race

FunctionalRiver.prototype.concurrency = function(limit = Infinity) {
  this._FR.concurrencyLimit = limit
  return this
}

FunctionalRiver.prototype.serial = function() {
  return this.concurrency(1)
}

FunctionalRiver.prototype.catch = function(fn) {
  if (this._FR.error) {
    const result = fn(this._FR.error)
    this._FR.error = undefined // no dbl-catch
    return result
  }
  // bypass error handling
  return FunctionalRiver.resolve(this._FR.value)
}

FunctionalRiver.prototype.then = function then(fn) {
  // if (this._FR.value)  { return fn(this._FR.value); }

  // if (!this._FR.error) {
  //   setImmediate(() => this.resolveRejectCB(_resolve, _reject))
  // }
  console.warn('.then:', fn, this)
  this._FR.promise.then(fn)
  // .then
  return this
}

FunctionalRiver.resolve = function(value) {
  return new FunctionalRiver((resolve, reject) => {
    if (value && isFunction(value.then)) {
      return value.then(resolve)
    }
    resolve(value)
  })
}

FunctionalRiver.denodeify = FunctionalRiver.promisify = promisify

function promisify(cb) {
  return (...args) => new FunctionalRiver((yah, nah) => {
    return cb.bind(this, ...args, (err, res) => {
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
      console.error('promisifyAll: ', fn)
      obj[`${fn}Async`] = promisify(obj[`${fn}`])
    }
    return obj
  }, obj)
}

FunctionalRiver.promisifyAll = promisifyAll

module.exports = FunctionalRiver
