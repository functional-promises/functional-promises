import { FPInputError } from './modules/errors'

export default function promise(FP: any) {
  return { all, delay, _delay }

  function all(promises: unknown) {
    return FP.resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises as Record<string, unknown>))
  }

  function promiseAllObject(obj: Record<string, unknown>) {
    const keys = Object.getOwnPropertyNames(obj)
    const values = keys.map((key) => obj[key])
    return Promise.all(values).then((results) =>
      results.reduce<Record<string, unknown>>((acc, value, index) => {
        const key = keys[index]
        return Object.assign({ [key]: value }, acc)
      }, {})
    )
  }

  function _delay(msec: number) {
    if (!Number.isInteger(msec)) throw new FPInputError('FP.delay(millisec) requires a numeric arg.')
    return (value?: unknown) => new FP((resolve: (input: unknown) => void) => {
      setTimeout(() => resolve(value), msec)
    })
  }

  function delay(this: any, msec: number) {
    if (this.steps) return this.addStep('delay', Array.from(arguments))
    return this && this._FP ? FP.resolve(this.then(_delay(msec))) : _delay(msec)()
  }
}
