import { FPInputError } from './modules/errors'

type EmitterLike = {
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void
  off?: (eventName: string, handler: (...args: unknown[]) => void) => void
  addEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
  removeEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
}

export const listen = function listen(this: any, obj: EmitterLike, ...eventNames: string[]) {
  // Issue #2: removed dead `typeof eventNames === 'string'` check — eventNames is a rest
  // parameter so it is always an array; the branch could never be true.
  if (!obj[(obj.addEventListener ? 'addEventListener' : 'on') as 'addEventListener' | 'on']) {
    throw new FPInputError('Valid EventEmitter required.')
  }

  // Issue #20: chainEnd() throws a confusing "No steps defined" error when called on a
  // non-chained FP instance. Guard with a clear message so callers understand the constraint.
  if (!this.steps || this.steps.length === 0) {
    throw new FPInputError(
      '.listen() must be called at the end of a .chain() pipeline. ' +
      'Use FP.chain().then(...).listen(emitter, eventName) instead.'
    )
  }

  const handler = this.chainEnd()
  this._FP.destroy = () => this._FP.destroyHandles.map((fn: () => unknown) => fn() || true).filter((v: unknown) => v).length
  this._FP.destroyHandles = eventNames.map((eventName: string) => {
    obj[(obj.addEventListener ? 'addEventListener' : 'on') as 'addEventListener' | 'on']?.(eventName, handler)
    return () => obj[(obj.removeEventListener ? 'removeEventListener' : 'off') as 'removeEventListener' | 'off']?.(eventName, handler)
  })
  return this
}
