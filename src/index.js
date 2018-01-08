const functionsIn       = require('lodash/functionsIn')
const isFunction        = require('lodash/isFunction')
const arraysMixin       = require('./arrays')
const eventsMixin       = require('./events')
const monadsMixin       = require('./monads')
const promiseMixin      = require('./promise')
const conditionalMixin  = require('./conditional')
const {FunctionalError} = require('./modules/errors')

arraysMixin(FunctionalRiver)
eventsMixin(FunctionalRiver)
monadsMixin(FunctionalRiver)
promiseMixin(FunctionalRiver)
conditionalMixin(FunctionalRiver)

function FunctionalRiver(resolveRejectCB, ...unknownArgs) {
  if (!(this instanceof FunctionalRiver)) {return new FunctionalRiver(resolveRejectCB)}
  if (unknownArgs.length > 0) throw new Error('FunctionalRiver only accepts 1 argument')
  this._FR = {}
  this._FR.concurrencyLimit = 4
  this._FR.promise = new Promise(resolveRejectCB)
  // Object.assign(this, promiseBase, conditionalMixin)
}

FunctionalRiver.prototype.addStep = function addStep(name, args) {
  if (this.steps) {
    this.steps.push([name, this, args])
  }
  return this
}

FunctionalRiver.prototype.concurrency = function(limit = Infinity) {
  if (this.steps) return this.addStep('concurrency', [...arguments])
  this._FR.concurrencyLimit = limit
  return this
}

FunctionalRiver.prototype.serial = function() {
  if (this.steps) return this.addStep('serial', [...arguments])
  return this.concurrency(1)
}

FunctionalRiver.prototype.get = function(keyName) {
  if (this.steps) return this.addStep('get', [...arguments])
  return this.then((obj) => typeof obj === 'object' ? obj[keyName] : obj)
}

FunctionalRiver.prototype.set = function(keyName, value) {
  if (this.steps) return this.addStep('set', [...arguments])
  return this.then(obj => {
    if (typeof obj === 'object') {
      obj[keyName] = value
    }
    return obj
  })
}

FunctionalRiver.prototype.catch = function(fn) {
  if (this.steps) return this.addStep('catch', [...arguments])
  if (this._FR.error) {
    const result = fn(this._FR.error)
    this._FR.error = undefined // no dbl-catch
    return result
  }
  // bypass error handling
  return FunctionalRiver.resolve(this._FR.value)
}

FunctionalRiver.prototype.then = function then(fn) {
  if (this.steps) return this.addStep('then', [...arguments])

  if (!isFunction(fn)) throw new FunctionalError('Invalid fn argument for `.then(fn)`. Must be a function. Currently: ' + typeof fn)
  return this._FR.promise.then(fn)
}

FunctionalRiver.resolve = function(value) {
  return new FunctionalRiver((resolve, reject) => {
    if (value && isFunction(value.then)) {
      return value.then(resolve).catch(reject)
    }
    resolve(value)
  })
}

FunctionalRiver.denodeify = FunctionalRiver.promisify = promisify

function promisify(cb) {
  return (...args) => new FunctionalRiver((yah, nah) => {
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

FunctionalRiver.promisifyAll = promisifyAll

module.exports = FunctionalRiver
