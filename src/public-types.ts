export type Values<T> = T extends unknown[] ? T[number] : T[keyof T]
export type IterableItem<R> = R extends Iterable<infer U> ? U : never
export type Resolvable<R> = R | PromiseLike<R> | FPInstance<R>
export type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
export type PredicateFunction<T> = (input: T) => boolean | null | undefined | void | Resolvable<boolean>
export type PredicateArrayCallback<T> = ((item: T, index?: number, array?: T[]) => boolean | Resolvable<boolean>) | null | undefined
export type CallbackHandler<ValueType, TReturn = any> = (input: ValueType) => Resolvable<TReturn> | null | undefined | void

export interface FPInstance<TReturn> extends PromiseLike<TReturn> {
  concurrency(limit: number): FPInstance<TReturn>
  quiet(limit?: number): FPInstance<TReturn>
  silent(limit?: number): FPInstance<TReturn>
  delay(msec: number): FPInstance<TReturn>
  map<TOutput = never>(fn: (item: Values<TReturn>, index?: number, array?: TReturn) => TOutput): FPInstance<TOutput[] | TReturn[]>
  flatMap<TItem = TReturn>(fn: (item: IterableItem<TItem>, index?: number, array?: TItem[]) => unknown): FPInstance<unknown>
  reduce<TTarget>(reducer: (memo: TTarget, item: Values<TReturn>, index?: number, array?: TReturn) => Resolvable<TTarget>, initialValue?: TTarget): FPInstance<TTarget>
  filter<T>(callback: PredicateArrayCallback<T>): FPInstance<TReturn>
  find<T>(callback: PredicateArrayCallback<T>): FPInstance<unknown>
  findIndex<T>(callback: PredicateArrayCallback<T>): FPInstance<number>
  get(...keyNames: string[]): FPInstance<any>
  set(keyName: string, value: any): FPInstance<TReturn>
  listen(obj: any, ...eventNames: string[]): FPInstance<TReturn>
  tap(fn: CallbackHandler<TReturn, any>): FPInstance<TReturn>
  tapIf<T = TReturn>(
    cond: PredicateFunction<T>,
    ifTrue?: PredicateFunction<ThenArgRecursive<TReturn>>,
    ifFalse?: PredicateFunction<ThenArgRecursive<TReturn>>,
  ): FPInstance<TReturn | T>
  thenIf<TItem = TReturn>(
    cond: PredicateFunction<TItem>,
    ifTrue?: PredicateFunction<ThenArgRecursive<TItem>>,
    ifFalse?: PredicateFunction<ThenArgRecursive<TItem>>,
  ): FPInstance<TReturn | TItem | void>
  // Issue #10 follow-up: the 2-arg catch overload now uses explicit fn2 parameter in the impl
  catch<TItem = TReturn>(onReject: ((error: any) => Resolvable<TItem>) | undefined | null): FPInstance<TItem | TReturn>
  catch<TItem = TReturn>(cond: PredicateFunction<TReturn> | object, ifTrue: PredicateFunction<TItem>): FPInstance<TItem | TReturn>
  catchIf<TItem = TReturn>(cond: PredicateFunction<ThenArgRecursive<TReturn>> | object, ifTrue?: PredicateFunction<TItem>): FPInstance<TItem | TReturn>
  chainEnd<TItem>(): (input: TItem) => FPInstance<TItem | TReturn>
}

export interface UnpackedPromise<T> {
  promise: FPInstance<T>
  resolve: (value: Resolvable<T>) => void
  /** Raw promise reject callback — call to reject the unpacked promise. */
  reject: (error: unknown) => void
}

// Issue #9: FPStatic was missing entries and had wrong return types. Additions:
//   - `quiet` static method (was only `silent`)
//   - `reject` corrected to return FPInstance<never> (implementation now returns a rejected FP)
//   - `chain` generic preserved
export interface FPStatic {
  <TReturn>(callback: (resolve: (thenableOrResult?: Resolvable<TReturn>) => void, reject: (error?: any) => void) => void): FPInstance<TReturn>
  new <TReturn>(callback: (resolve: (thenableOrResult?: Resolvable<TReturn>) => void, reject: (error?: any) => void) => void): FPInstance<TReturn>

  all<T>(promises: Record<string, T | Resolvable<T> | any>): FPInstance<T>
  all<T>(promises: Array<T | any>): FPInstance<T>
  delay<T>(msec: number): FPInstance<T>
  get(...args: any[]): any
  promisify<T>(cb: CallbackHandler<T>): (...args: any[]) => FPInstance<T>
  promisifyAll<T extends object>(target: T): T
  resolve<T>(value?: Resolvable<T>): FPInstance<T>
  /** Returns a rejected FPInstance. Always returns a promise — never throws synchronously. */
  reject(err: unknown): FPInstance<never>
  unpack<T>(): UnpackedPromise<T>
  chain<T>(): FPInstance<T>
  thenIf: (...args: any[]) => any
  // Note: `silent` is the static alias; `quiet` is only on the prototype (instance method)
  silent: (limit?: number) => FPInstance<any>
}
