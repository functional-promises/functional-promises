import utils from './modules/utils'

const { isPromiseLike } = utils

export default function conditional(FP) {
  return { tapIf, thenIf, _thenIf }

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
