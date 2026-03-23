import utils from './modules/utils'
import type { FPConstructor, FPInternalInstance } from './internal-types'

const { isPromiseLike } = utils

type ConditionFn = (x: unknown) => unknown
type BranchFn = (x: unknown) => unknown

export default function conditional(FP: FPConstructor) {
  return { tapIf, thenIf, _thenIf }

  function thenIf(this: FPInternalInstance, cond: ConditionFn, ifTrue?: BranchFn, ifFalse?: BranchFn) {
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

  function tapIf(this: FPInternalInstance, cond: ConditionFn, ifTrue?: BranchFn, ifFalse?: BranchFn) {
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

  function _thenIf(cond: ConditionFn = (x: unknown) => x, ifTrue: BranchFn = (x: unknown) => x, ifFalse: BranchFn = (_x?: unknown) => null, returnValue = false) {
    return (value: unknown) =>
      FP.resolve(cond(value))
        .then((answer: unknown) => (answer ? ifTrue(value) : ifFalse(value)))
        .then((v: unknown) => (returnValue ? value : v))
  }
}
