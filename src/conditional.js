const {isPromiseLike} = require('./modules/utils')

module.exports = function _init(FP) {
  FP.prototype.tapIf = tapIf
  FP.prototype.thenIf = thenIf
  FP.prototype._thenIf = _thenIf
  FP.thenIf = _thenIf

  function thenIf(cond, ifTrue, ifFalse) {
    if (this.steps) return this.addStep('thenIf', [...arguments])
    if (arguments.length === 1) {
      ifTrue = cond
      cond = x => x
    }
    if (isPromiseLike(this)) {
      return this.then(value => _thenIf(cond, ifTrue, ifFalse)(value))
    }
    return _thenIf(cond, ifTrue, ifFalse)
  }

  function tapIf(cond, ifTrue, ifFalse) {
    if (this.steps) return this.addStep('tapIf', [...arguments])
    if (arguments.length === 1) {
      ifTrue = cond
      cond = x => x
    }
    if (isPromiseLike(this)) {
      return this.then(value => _thenIf(cond, ifTrue, ifFalse, true)(value))
    }
    return _thenIf(cond, ifTrue, ifFalse, true)
  }

  function _thenIf(cond = x => x, ifTrue = x => x, ifFalse = () => null, returnValue = false) {
    return value =>
      FP.resolve(cond(value))
        .then(ans => (ans ? ifTrue(value) : ifFalse(value)))
        .then(v => (returnValue ? value : v))
  }
}
