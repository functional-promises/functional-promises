import { FPInputError } from './modules/errors'
import type { FPConstructor, FPInternalInstance } from './internal-types'

export default function monads(FP: FPConstructor) {
  return { chain, chainEnd }

  function chain() {
    const promise = FP.resolve()
    ;(promise as FPInternalInstance & { steps: unknown[] }).steps = []
    return promise
  }

  function chainEnd(this: FPInternalInstance) {
    return (input: unknown) => {
      if (!this.steps || this.steps.length <= 0) {
        throw new FPInputError('No steps defined between .chain() & .chainEnd()')
      }

      let stepCount = 0
      const unpacked = FP.unpack()
      let { promise } = unpacked
      const { resolve } = unpacked

      while (stepCount < this.steps.length) {
        const step = this.steps[stepCount]!
        const [fnName, , args] = step
        promise = (promise as unknown as Record<string, (...a: unknown[]) => FPInternalInstance>)[fnName]!(...args)
        stepCount++
      }

      resolve(input)
      return promise
    }
  }
}
