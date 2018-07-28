const { FPInputError } = require('./modules/errors')

module.exports = { chain, chainEnd }


/**
 * Start 'recording' a chain of commands, after steps defined call `.chainEnd()`
 * @returns FunctionalPromise
 */
function chain() {
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
function chainEnd() {
  const FP = require('./index')

  return input => {
    if (this.steps.length <= 0) throw new FPInputError('No steps defined between .chain() & .chainEnd()')
    let stepCount = 0
    let promise = new FP((resolve) => setTimeout(() => resolve(input), 0))
    while (stepCount < this.steps.length) {
      const [fnName, , args] = this.steps[stepCount]
      promise = promise[fnName](...args)
      stepCount++
    }
    return promise
  }
}
