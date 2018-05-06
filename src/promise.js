const { FPInputError } = require('./modules/errors')

module.exports = { all, cast, reject, delay, _delay }

function all(promises) {
  const FP = require('./')
  return FP.resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises))
}

function promiseAllObject(obj) {
  const keys = Object.getOwnPropertyNames(obj)
  const values = keys.map(key => obj[key])
  return Promise.all(values).then(results => results.reduce((obj, val, index) => {
    const key = keys[index]
    return Object.assign({ [key]: val }, obj)
  }, {}))
}

function cast(obj) { return Promise.resolve(obj) }

function reject(err) {
  // ret._captureStackTrace();
  // ret._rejectCallback(reason, true);
  if (err instanceof Error) {
    if (this) this._error = err
    return Promise.reject(err)
  }
  throw new Error(`Reject only accepts a new instance of Error!`)
}

function _delay(msec) {
  const FP = require('./')
  if (!Number.isInteger(msec)) throw new FPInputError('FP.delay(millisec) requires a numeric arg.')
  return value => new FP(resolve => { setTimeout(() => resolve(value), msec) })
}

function delay(msec) {
  const FP = require('./')
  if (this.steps) return this.addStep('delay', [...arguments])
  return this && this._FP ? FP.resolve(this.then(_delay(msec))) : _delay(msec)()
}
