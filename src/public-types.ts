export type Values<T> = T extends unknown[] ? T[number] : T[keyof T]
export type IterableItem<R> = R extends Iterable<infer U> ? U : never
export type Resolvable<R> = R | PromiseLike<R> | FPInstance<R>
export type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
export type PredicateFunction<T> = (input: T) => boolean | null | undefined | void | Resolvable<boolean>
export type PredicateArrayCallback<T> = ((item: T, index?: number, array?: T[]) => boolean | Resolvable<boolean>) | null | undefined
export type CallbackHandler<ValueType, TReturn = unknown> = (input: ValueType) => Resolvable<TReturn> | null | undefined | void

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
  get<K extends string>(...keyNames: K[]): FPInstance<TReturn extends Record<K, infer V> ? V : unknown>
  set<V>(keyName: string, value: V): FPInstance<TReturn>
  listen(obj: EventTargetLike, ...eventNames: string[]): FPInstance<TReturn>
  tap(fn: CallbackHandler<TReturn>): FPInstance<TReturn>
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
  catch<TItem = TReturn>(onReject: ((error: Error) => Resolvable<TItem>) | undefined | null): FPInstance<TItem | TReturn>
  catch<TItem = TReturn>(cond: PredicateFunction<TReturn> | object, ifTrue: PredicateFunction<TItem>): FPInstance<TItem | TReturn>
  catchIf<TItem = TReturn>(cond: PredicateFunction<ThenArgRecursive<TReturn>> | object, ifTrue?: PredicateFunction<TItem>): FPInstance<TItem | TReturn>
  chainEnd<TItem>(): (input: TItem) => FPInstance<TItem | TReturn>
}

export interface EventTargetLike {
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void
  off?: (eventName: string, handler: (...args: unknown[]) => void) => void
  addEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
  removeEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
}

export interface UnpackedPromise<T> {
  promise: FPInstance<T>
  resolve: (value: Resolvable<T>) => void
  reject: (error: unknown) => void
}

export interface FPStatic {
  <TReturn>(callback: (resolve: (thenableOrResult?: Resolvable<TReturn>) => void, reject: (error?: unknown) => void) => void): FPInstance<TReturn>
  new <TReturn>(callback: (resolve: (thenableOrResult?: Resolvable<TReturn>) => void, reject: (error?: unknown) => void) => void): FPInstance<TReturn>

  all<T>(promises: Record<string, T | Resolvable<T>>): FPInstance<Record<string, T>>
  all<T>(promises: Array<T | Resolvable<T>>): FPInstance<T[]>
  delay<T>(msec: number): FPInstance<T>
  get<K extends string>(...args: K[]): <T extends Record<K, unknown>>(obj: T) => T[K]
  get<K extends string, T extends Record<K, unknown>>(...args: [...K[], T]): T[K]
  promisify<T>(cb: (...args: [...unknown[], (err: unknown, res: T) => void]) => void): (...args: unknown[]) => FPInstance<T>
  promisifyAll<T extends Record<string, unknown>>(target: T): T
  resolve<T>(value?: Resolvable<T>): FPInstance<T>
  reject(err: unknown): FPInstance<never>
  unpack<T>(): UnpackedPromise<T>
  chain<T>(): FPInstance<T>
  thenIf(
    cond?: (x: unknown) => unknown,
    ifTrue?: (x: unknown) => unknown,
    ifFalse?: (x: unknown) => unknown,
  ): (value: unknown) => FPInstance<unknown>
  silent: (limit?: number) => FPInstance<unknown>
}
