import utils from './modules/utils'
import { FPCollectionError, FPInputError } from './modules/errors'

const { isEnumerable } = utils

export default function arrays(FP: any) {
  return { map, find, findIndex, filter, flatMap, reduce }

  function find(this: any, callback: (value: unknown) => unknown) {
    return _find.call(this, callback).then(({ item }: { item: unknown }) => item)
  }

  function findIndex(this: any, callback: (value: unknown) => unknown) {
    return _find.call(this, callback).then(({ index }: { index: number }) => index)
  }

  // Issue #22: rewritten to short-circuit on first match instead of scanning the
  // entire collection via reduce(). The previous reduce-based implementation always
  // iterated every item even after a match was found.
  function _find(this: any, iterable: any, callback?: (value: unknown) => unknown) {
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

  function flatMap(this: any, iterable: any, callback?: (value: unknown) => unknown) {
    if (this.steps) return this.addStep('flatMap', Array.from(arguments))
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FP.promise
    }

    return FP.resolve(iterable)
      .map(callback)
      .reduce((acc: unknown[], arr: unknown[]) => acc.concat(...arr), [])
  }

  function filter(this: any, iterable: any, callback?: (value: unknown) => unknown) {
    if (this.steps) return this.addStep('filter', Array.from(arguments))
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FP.promise
    }

    return reduce.call(
      this,
      iterable,
      (acc: unknown[], item: unknown) =>
        Promise.resolve(callback?.(item)).then((result) => (result ? acc.concat([item]) : acc)),
      []
    )
  }

  function reduce(this: any, iterable: any, reducer?: (total: unknown, item: unknown, index: number) => unknown, initVal?: unknown) {
    if (this.steps) return this.addStep('reduce', Array.from(arguments))
    if (typeof iterable === 'function') {
      initVal = reducer
      reducer = iterable
      iterable = this._FP ? this._FP.promise : this
    } else {
      // Issue #4: FP.resolve() only accepts one argument; removed erroneous second arg `this`
      iterable = FP.resolve(iterable)
    }

    return new FP((resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
      return iterable.then((items: Iterable<unknown>) => {
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

  function map(this: any, args: any, fn?: (item: unknown, index: number, array: unknown[]) => unknown) {
    if (this.steps) return this.addStep('map', Array.from(arguments))
    if (arguments.length === 1 && this && this._FP) {
      fn = args
      args = this._FP.promise
    }

    let resolvedOrRejected = false
    const threadLimit = Math.max(1, (this?._FP?.concurrencyLimit || 1) as number)
    const innerValues = this?._FP?.promise ? this._FP.promise : Promise.resolve(args)
    let initialThread = 0
    const errors: any[] = []
    let count = 0
    let argsList: unknown[] = []
    const results: any[] = []
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

          // Issue #1: the original `complete()` had two bugs:
          //   1. `? true : true` ternary always evaluated to true (discarded the promise result)
          //   2. `isDone()` overrode `action = rejectIt` with `action = resolveIt` for error cases
          // Now: error rejection is handled entirely in the catch block; complete() only resolves
          // once all items have been started. A `completing` guard prevents duplicate Promise.all chains.
          // Issue #19: removed the ambiguous error-limit check from complete()/isDone(); the catch
          // block is the sole owner of rejection-on-error logic.
          let completing = false
          const complete = () => {
            if (resolvedOrRejected) return true
            if (!completing && count >= argsList.length) {
              completing = true
              // Wait for all in-flight promises to settle (setResult mutates results[] to actual values),
              // then resolve with the fully-populated results array.
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

          const runItem = (c: number): any => {
            if (resolvedOrRejected) return null

            // Issue #5: moved count++ to AFTER the thread-pool check. Previously, count was
            // incremented before the check, so a deferred retry (setTimeout) caused count to
            // advance past the item index, making checkAndRun skip it entirely.
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
              .catch((err: any) => {
                this._FP.errors.count++
                err._index = c
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
                  // Issue #6: added .catch(rejectIt) — the previous floating promise had no error
                  // handler, so any throw inside setResult or rejectIt became an unhandled rejection.
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
