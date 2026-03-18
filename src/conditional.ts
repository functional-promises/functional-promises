import utils from './modules/utils'

const { isPromiseLike } = utils

export default function conditional(FP: any) {
  return { tapIf, thenIf, _thenIf }

  function thenIf(this: any, cond: any, ifTrue?: any, ifFalse?: any) {
    if (this.steps) return this.addStep('thenIf', Array.from(arguments))
    if (arguments.length === 1) {
      ifTrue = cond
      cond = (x: unknown) => x
    }
    if (isPromiseLike(this)) {
      return this.then((value: unknown) => _thenIf(cond, ifTrue, ifFalse)(value))
    }
    return _thenIf(cond, ifTrue, ifFalse)
  }

  function tapIf(this: any, cond: any, ifTrue?: any, ifFalse?: any) {
    if (this.steps) return this.addStep('tapIf', Array.from(arguments))
    if (arguments.length === 1) {
      ifTrue = cond
      cond = (x: unknown) => x
    }
    if (isPromiseLike(this)) {
      return this.then((value: unknown) => _thenIf(cond, ifTrue, ifFalse, true)(value))
    }
    return _thenIf(cond, ifTrue, ifFalse, true)
  }

  function _thenIf(cond = (x: unknown) => x, ifTrue = (x: unknown) => x, ifFalse = (_x?: unknown) => null, returnValue = false) {
    return (value: unknown) =>
      FP.resolve(cond(value))
        .then((answer: unknown) => (answer ? ifTrue(value) : ifFalse(value)))
        .then((v: unknown) => (returnValue ? value : v))
  }
}
