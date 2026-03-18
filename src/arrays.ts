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

  function _find(this: any, iterable: any, callback?: (value: unknown) => unknown) {
    if (this.steps) return this.addStep('_find', Array.from(arguments))
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FP.promise
    }

    return FP.resolve(iterable).reduce(
      async (result: { item: unknown; index: number }, item: unknown, index: number) => {
        if (!result.item && callback && (await callback(item))) {
          result.item = item
          result.index = index
        }
        return result
      },
      { item: undefined, index: -1 }
    )
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
      iterable = FP.resolve(iterable, this)
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
    const isDone = () => errors.length > this._FP.errors.limit || count >= argsList.length || resolvedOrRejected

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

          const complete = () => {
            let action: ((value: unknown) => unknown) | null = null
            if (errors.length > this._FP.errors.limit) action = rejectIt
            if (isDone()) action = resolveIt
            if (action) {
              return Promise.all(results).then(() => action(results)) ? true : true
            }
            return false
          }

          const checkAndRun = (value: unknown) => {
            if (resolvedOrRejected) return
            if (!complete() && !results[count]) runItem(count)
            return value
          }

          const runItem = (c: number): any => {
            if (resolvedOrRejected) {
              return null
            }
            count++

            if (threadPoolFull()) {
              setTimeout(() => runItem(c), 0)
              return null
            }

            if (results[c]) return results[c]
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
                  Promise.resolve(setResult(c)(err)).then(() => rejectIt(fpError))
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
