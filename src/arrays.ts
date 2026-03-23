import utils from './modules/utils'
import { FPCollectionError, FPInputError } from './modules/errors'
import type { FPConstructor, FPInternalInstance } from './internal-types'

const { isEnumerable } = utils

export default function arrays(FP: FPConstructor) {
  return { map, find, findIndex, filter, flatMap, reduce }

  function find(this: FPInternalInstance, callback: (value: unknown) => unknown) {
    return _find.call(this, callback).then(({ item }: { item: unknown }) => item)
  }

  function findIndex(this: FPInternalInstance, callback: (value: unknown) => unknown) {
    return _find.call(this, callback).then(({ index }: { index: number }) => index)
  }

  function _find(this: FPInternalInstance, iterable: unknown, callback?: (value: unknown) => unknown) {
    if (this.steps) return this.addStep('_find', Array.from(arguments))
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FP.promise
    }

    return new FP((resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
      Promise.resolve(iterable)
        .then(async (items: Iterable<unknown>) => {
          let index = 0
          for (const item of items) {
            try {
              const value = await Promise.resolve(item)
              if (callback && (await callback(value))) {
                return resolve({ item: value, index })
              }
              index++
            } catch (err) {
              return reject(err)
            }
          }
          resolve({ item: undefined, index: -1 })
        })
        .catch(reject)
    })
  }

  function flatMap(this: FPInternalInstance, iterable: unknown, callback?: (value: unknown) => unknown) {
    if (this.steps) return this.addStep('flatMap', Array.from(arguments))
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FP.promise
    }

    return FP.resolve(iterable)
      .map(callback as (item: unknown, index: number, array: unknown[]) => unknown)
      .reduce((acc: unknown[], arr: unknown[]) => acc.concat(...arr), [])
  }

  function filter(this: FPInternalInstance, iterable: unknown, callback?: (value: unknown) => unknown) {
    if (this.steps) return this.addStep('filter', Array.from(arguments))
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FP.promise
    }

    return reduce.call(
      this,
      iterable,
      (acc: unknown, item: unknown) =>
        Promise.resolve(callback?.(item)).then((result) => (result ? (acc as unknown[]).concat([item]) : acc)),
      []
    )
  }

  function reduce(this: FPInternalInstance, iterable: unknown, reducer?: (total: unknown, item: unknown, index: number) => unknown, initVal?: unknown) {
    if (this.steps) return this.addStep('reduce', Array.from(arguments))
    if (typeof iterable === 'function') {
      initVal = reducer as unknown
      reducer = iterable as (total: unknown, item: unknown, index: number) => unknown
      iterable = this._FP ? this._FP.promise : this
    } else {
      iterable = FP.resolve(iterable)
    }

    return new FP((resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
      return (iterable as FPInternalInstance).then((items: Iterable<unknown>) => {
        const iterator = items[Symbol.iterator]()
        let i = 0

        const next = (total: unknown) => {
          const current = iterator.next()
          if (current.done) return resolve(total)

          Promise.all([total, current.value])
            .then(([resolvedTotal, item]) => next(reducer?.(resolvedTotal, item, i++)))
            .catch(reject)
        }

        next(initVal)
      })
    })
  }

  function map(this: FPInternalInstance, args: unknown, fn?: (item: unknown, index: number, array: unknown[]) => unknown) {
    if (this.steps) return this.addStep('map', Array.from(arguments))
    if (arguments.length === 1 && this && this._FP) {
      fn = args as (item: unknown, index: number, array: unknown[]) => unknown
      args = this._FP.promise
    }

    let resolvedOrRejected = false
    const threadLimit = Math.max(1, (this?._FP?.concurrencyLimit || 1) as number)
    const innerValues = this?._FP?.promise ? this._FP.promise : Promise.resolve(args)
    let initialThread = 0
    const errors: Error[] = []
    let count = 0
    let argsList: unknown[] = []
    const results: unknown[] = []
    const threadPool = new Set<number>()
    const threadPoolFull = () => threadPool.size >= threadLimit

    const setResult = (index: number) => (value: unknown) => {
      threadPool.delete(index)
      results[index] = value
      return value
    }

    return FP.resolve(
      new Promise((resolve, reject) => {
        const resolveIt = (value: unknown) => {
          if (resolvedOrRejected) return null
          resolvedOrRejected = true
          resolve(value)
        }

        const rejectIt = (value: unknown) => {
          if (resolvedOrRejected) return null
          resolvedOrRejected = true
          reject(value)
        }

        innerValues.then((items: unknown) => {
          if (!isEnumerable(items)) {
            return reject(
              new FPInputError(`Value must be iterable! A '${typeof items}' was passed into FP.map()`, {
                input: items,
              })
            )
          }

          argsList = Array.from(items as Iterable<unknown>)

          let completing = false
          const complete = () => {
            if (resolvedOrRejected) return true
            if (!completing && count >= argsList.length) {
              completing = true
              Promise.all(results).then(() => resolveIt(results))
              return true
            }
            return completing
          }

          const checkAndRun = (value: unknown) => {
            if (resolvedOrRejected) return
            if (!complete() && !results[count]) runItem(count)
            return value
          }

          const runItem = (c: number): unknown => {
            if (resolvedOrRejected) return null

            if (threadPoolFull()) {
              setTimeout(() => runItem(c), 0)
              return null
            }

            if (results[c]) return results[c]
            count++
            threadPool.add(c)

            results[c] = Promise.resolve(argsList[c])
              .then((value) => fn?.(value, c, argsList))
              .then((value) => setResult(c)(value))
              .then(checkAndRun)
              .catch((err: Error) => {
                this._FP.errors.count++
                ;(err as Error & { _index: number })._index = c
                errors.push(err)

                if (this._FP.errors.limit <= 0) {
                  rejectIt(err)
                  return err
                }

                if (errors.length > this._FP.errors.limit) {
                  const fpError = new FPCollectionError(
                    `Error limit ${this._FP.errors.limit} met/exceeded with ${this._FP.errors.count} errors.`,
                    { errors, results, ctx: this }
                  )
                  Promise.resolve(setResult(c)(err)).then(() => rejectIt(fpError)).catch(rejectIt)
                } else {
                  return Promise.resolve().then(() => setResult(c)(err)).then(checkAndRun)
                }
              })

            return results[c]
          }

          while (initialThread < threadLimit && initialThread < argsList.length) {
            runItem(initialThread++)
          }
        })
      })
    )
  }
}
