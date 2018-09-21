import { FPInputError } from './modules/errors'

/**
 * Start 'recording' a chain of commands, after steps defined call `.chainEnd()`
 * @returns FunctionalPromise
 */
export function chain() {
  const FP = require('./index')
  // create a placeholder/initial promise to hold the steps/chain data
  const promise = FP.resolve()
  promise.steps = []
  return promise
}

/**
 * Call after starting a `.chain()`.
 *
 * One of the few non-chainable methods in the API.
 * @returns a Function. It runs your functional chain!
 */
export function chainEnd() {
  const FP = require('./index')

  return input => {
    if (!this.steps || this.steps.length <= 0) throw new FPInputError('No steps defined between .chain() & .chainEnd()')
    let stepCount = 0
    let {promise, resolve, reject} = FP.unpack()
    while (stepCount < this.steps.length) {
      const [fnName, , args] = this.steps[stepCount]
      promise = promise[fnName](...args)
      stepCount++
    }
    resolve(input)
    return promise
  }
}
