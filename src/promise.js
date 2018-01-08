// module.exports = function FP() {
//   FP.resolve = FP.fulfilled = FP.cast = cast
//   FP.reject = FP.rejected = reject
//   FP.prototype.tap = tap

//   // FP.resolve       = x => FP.resolve(x);
//   // FP.reject        = x => FP.reject(x);
// }

module.exports = function _init(FP) {
  FP.prototype.all = FP.all = all
  FP.prototype.cast = cast
  FP.prototype.tap = tap
  FP.prototype.reject = reject
}

function all(promises) {
  return Promise.all(promises)
}

function cast(obj) {
  return Promise.resolve(obj)
}

function reject(err) {
  // ret._captureStackTrace();
  // ret._rejectCallback(reason, true);
  if (err instanceof Error) {
    this._error = err
    throw err
  }
  throw new Error(`Reject only accepts a new instance of Error!`)
}

function tap(handler) {
  if (this.steps) return this.addStep('tap', [...arguments])
  const pHandler = p =>
    Promise.resolve(p).then(value => {
      handler(value)
      return value
    })
  if (this instanceof Promise) {
    return pHandler(this)
  }
  return pHandler
}
