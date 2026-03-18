const utils = {
  isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return Boolean(value && typeof (value as PromiseLike<unknown>).then === 'function')
  },
  isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function'
  },
  isEnumerable(value: unknown): boolean {
    return Boolean(
      (value && Array.isArray(value)) ||
      (value && typeof (value as { [Symbol.iterator]?: () => Iterator<unknown> })[Symbol.iterator] === 'function')
    )
  },
  flatten<T>(arr: unknown[]): T[] {
    if (!Array.isArray(arr)) {
      throw new Error('Method `flatten` requires valid array parameter')
    }

    return arr.reduce<T[]>((results, item) => {
      if (Array.isArray(item)) {
        return results.concat(utils.flatten<T>(item))
      }

      return results.concat(item as T)
    }, [])
  },
}

export default utils
