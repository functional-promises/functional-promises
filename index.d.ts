interface Dictionary<T> {
  [key: string]: T;
}
// type IterableCollection<T> = T[] | IterableIterator<T> | Dictionary<T>

// type CatchFilter<E> = (new (...args: any[]) => E) | ((error: E) => boolean) | (object & E);
type IterableItem<R> = R extends Iterable<infer U> ? U : never;
type IterableOrNever<R> = Extract<R, Iterable<any>>;
type Resolvable<R> = R | FP;
type IterateFunction<T, TReturn = T> = (
  item: T,
  index?: number,
  array?: T[]
) => TReturn;
type PromiseCallback<T, R> = (
  input: T
) => R | PromiseLike<R> | undefined | null | void;
type PredicateFunction<T> = (
  input: T
) => boolean | Resolvable<boolean> | null | undefined | void;
type PredicateArrayCallback<T> =
  | IterateFunction<T, boolean | Resolvable<boolean>>
  | null
  | undefined
  | void;

type CallbackHandler<ValueType, TReturn = any> = (
  input: ValueType
) => Resolvable<TReturn> | null | undefined | void;
type NodeJsCallback<T> = (
  error: Error | null | undefined | T,
  input?: T
) => Resolvable<any> | null | undefined;
// type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
type ThenArgRecursive<T> = T extends PromiseLike<infer U>
  ? { 0: ThenArgRecursive<U>; 1: U }[T extends PromiseLike<any> ? 0 : 1]
  : T;

export declare class FunctionalError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export declare class FunctionalUserError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export declare class FPCollectionError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export declare class FPUnexpectedError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export declare class FPInputError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export declare class FPTimeout extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export declare class FP<TReturn = unknown> {
  constructor(
    callback: (
      resolve: (thenableOrResult?: Resolvable<TReturn>) => void,
      reject: (error?: any) => void,
      onCancel?: (callback: () => void) => void
    ) => void
  );

  // addStep(name: any, args: any): any;
  catchIf<T>(
    condition: PredicateFunction<T> | object,
    fn: NodeJsCallback<T>
  ): FP<TReturn>;
  catch<T>(fn: NodeJsCallback<T>): FP<TReturn>;

  concurrency<T>(limit: number): FP<TReturn>;
  delay<T>(msec: number): FP<T>;
  map<TItem, TReturn>(
    fn: (
      item: TItem,
      index?: number,
      array?: TItem[]
    ) => ThenArgRecursive<TReturn> | PromiseLike<TReturn>
  ): FP<ThenArgRecursive<TReturn>[]>;
  flatMap<TItem>(
    fn: IterateFunction<IterableItem<TItem>, TReturn>
  ): FP<TReturn>;

  // reduce<T>(iterable: any, reducer: any, initVal: any): FP<TReturn>;
  reduce<TItem, TargetType>(
    reducer: (
      memo: TargetType,
      item: TItem,
      index?: number,
      array?: TItem[]
    ) => Resolvable<TargetType>,
    initialValue?: TargetType
  ): FP<TargetType>;

  filter<T>(callback: PredicateArrayCallback<T>): FP<TReturn>;
  find<T>(callback: PredicateArrayCallback<T>): FP<TReturn>;
  findIndex<T>(callback: PredicateArrayCallback<T>): FP<TReturn>;
  get<T>(keyNames: keyof T | keyof T[]): FP<TReturn> | FP<string>;
  set<T>(keyName: string, value: any): FP<TReturn>;
  listen<T>(obj: EventSource, eventNames: string | string[]): FP<TReturn>;
  quiet<T>(limit?: number): FP<TReturn>;
  tap<TItem>(fn: CallbackHandler<TReturn, TReturn>): FP<TItem>;
  tapIf<T>(
    cond: PredicateFunction<T>,
    ifTrue?: PredicateFunction<ThenArgRecursive<TReturn>>,
    ifFalse?: PredicateFunction<ThenArgRecursive<TReturn>>
  ): FP<TReturn>;
  then<TItem, TReturn>(fn: CallbackHandler<TItem, TReturn>): FP<TReturn>;
  thenIf<T>(
    cond: PredicateFunction<ThenArgRecursive<TReturn>>,
    ifTrue?: PredicateFunction<ThenArgRecursive<TReturn>>,
    ifFalse?: PredicateFunction<ThenArgRecursive<TReturn>>
  ): FP<TReturn>;

  static chain<T>(): FP<T>;
  chainEnd(): () => FP<TReturn>;

  static all<T>(promises: Dictionary<T | Resolvable<T> | any>): FP<T>;
  static all<T>(promises: Array<T | any>): FP<T>;
  static delay<T>(msec: number): FP<T>;
  static get(keyNames: string | string[], object: Object): FP<Object | String>;
  static promisify<T>(cb: CallbackHandler<T>): Function;
  static promisifyAll(obj: object | Array<Function>): object;
  static resolve<T>(value: Resolvable<T>): FP<T>;
  static reject<T>(err: typeof Error): FP<T>;
  static unpack<T>(): {
    promise: FP<T>;
    resolve: (value: Resolvable<T>) => void;
    reject: NodeJsCallback<T>;
  };
}

export type FunctionalPromises<T> = FP<T>;
