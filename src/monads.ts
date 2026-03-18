import { FPInputError } from './modules/errors'

export default function monads(FP: any) {
  return { chain, chainEnd }

  function chain() {
    const promise = FP.resolve()
    promise.steps = []
    return promise
  }

  function chainEnd(this: any) {
    return (input: unknown) => {
      if (!this.steps || this.steps.length <= 0) {
        throw new FPInputError('No steps defined between .chain() & .chainEnd()')
      }

      let stepCount = 0
      let { promise, resolve } = FP.unpack()

      while (stepCount < this.steps.length) {
        const [fnName, , args] = this.steps[stepCount]
        promise = promise[fnName](...args)
        stepCount++
      }

      resolve(input)
      return promise
    }
  }
}
