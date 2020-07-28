import { FPInputError } from './modules/errors'
import FP from './'
export { _reject as reject }

export function all(promises: readonly any[]) {
  return FP.resolve(Array.isArray(promises) ? Promise.all(promises) : promiseAllObject(promises))
}

export function promiseAllObject(obj) {
  const keys = Object.getOwnPropertyNames(obj)
  const values = keys.map(key => obj[key])
  return Promise.all(values).then(results => results.reduce((obj, val, index) => {
    const key = keys[index]
    return Object.assign({ [key]: val }, obj)
  }, {}))
}

export function _reject(this: any, err: any) {
  if (err instanceof Error) {
    if (this) this._error = err
    return Promise.reject(err)
  }
  throw new Error(`Reject only accepts a new instance of Error!`)
}

export function _delay(msec: number) {
  if (!Number.isInteger(msec)) throw new FPInputError('FP.delay(millisec) requires a numeric arg.')
  return (value?: any) => new FP(resolve => { setTimeout(() => resolve(value), msec) })
}

export function delay<T>(this: FP<T>, msec: number) {
  if (this.steps) return this.addStep('delay', [...arguments])
  return this && this._FP ? FP.resolve(this.then(_delay(msec))) : _delay(msec)()
}

