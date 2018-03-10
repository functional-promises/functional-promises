const {FPInputError} = require('./modules/errors')

module.exports = {chain, chainEnd}


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
    return new FP((resolve, reject) => {
      const iterator = this.steps[Symbol.iterator]()

      const next = promise => {
        const current = iterator.next()
        if (current.done) return resolve(promise)
        const [fnName, , args] = current.value
        return next(promise[fnName](...args))
      }
      next(FP.resolve(input))
    })
  }
}
