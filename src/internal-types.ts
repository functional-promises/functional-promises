/**
 * Internal types for the FP constructor-function pattern.
 * These are NOT exported to consumers — they exist to give the internal
 * modules (arrays, conditional, monads, promise, events) a concrete type
 * for the `FP` parameter they receive instead of `any`.
 */

export interface FPInternalState {
  errors: { limit: number; count: number }
  promise: Promise<unknown>
  concurrencyLimit: number
  destroy?: () => number
  destroyHandles?: (() => boolean | undefined)[]
}

export interface FPInternalInstance {
  _FP: FPInternalState
  _error?: Error
  steps?: [string, FPInternalInstance, unknown[]][]
  addStep(name: string, args: unknown[]): FPInternalInstance
  then(onFulfilled: (value: unknown) => unknown, onRejected?: (error: unknown) => unknown): FPInternalInstance
  catch(fn: (error: Error) => unknown): FPInternalInstance
  chainEnd(): (input: unknown) => FPInternalInstance
  map(callback: (item: unknown, index: number, array: unknown[]) => unknown): FPInternalInstance
  reduce(reducer: (total: unknown, item: unknown, index: number) => unknown, initVal?: unknown): FPInternalInstance
  delay(msec: number): FPInternalInstance
  silent(limit: number): FPInternalInstance
  tapIf(cond: unknown, ifTrue?: unknown, ifFalse?: unknown): FPInternalInstance
  thenIf(cond: unknown, ifTrue?: unknown, ifFalse?: unknown): FPInternalInstance
  catchIf(condition: unknown, fn: unknown): FPInternalInstance
}

export type FPResolveCallback = (value?: unknown) => void
export type FPRejectCallback = (error?: unknown) => void
export type FPExecutor = (resolve: FPResolveCallback, reject: FPRejectCallback) => void

export interface FPConstructor {
  new (callback: FPExecutor): FPInternalInstance
  (callback: FPExecutor): FPInternalInstance
  resolve(value?: unknown): FPInternalInstance
  reject(err: unknown): FPInternalInstance
  unpack(): { promise: FPInternalInstance; resolve: (value: unknown) => void; reject: (error: unknown) => void }
  promisify(cb: (...args: unknown[]) => unknown): (...args: unknown[]) => FPInternalInstance
  get(...args: unknown[]): unknown
  prototype: Record<string, unknown>
}
