// module.exports = function FR() {
//   FR.resolve = FR.fulfilled = FR.cast = cast
//   FR.reject = FR.rejected = reject
//   FR.prototype.tap = tap

//   // FR.resolve       = x => FR.resolve(x);
//   // FR.reject        = x => FR.reject(x);
// }

module.exports = function _init(FR) {
  FR.prototype.all = FR.all = all;
  FR.prototype.cast = cast;
  FR.prototype.tap = tap;
  FR.prototype.reject = reject;
}

function all(promises) {
  return Promise.all(promises);
}

function cast(obj) {
  return Promise.resolve(obj);
}

function reject(err) {
  // ret._captureStackTrace();
  // ret._rejectCallback(reason, true);
  if (err instanceof Error) {
    this._error = err
  }
  throw new Error(`Reject only accepts a new instance of Error!`)
};


function tap(handler) {
  const pHandler = p => Promise
    .resolve(p)
    .then(value => {
      handler(value)
      return value
    })
  if (this instanceof Promise) {
    return pHandler(this)
  }
  return pHandler
}
