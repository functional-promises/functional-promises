type Values<T> = T extends unknown[] ? T[number] : T[keyof T];

declare class FP<TReturn> implements PromiseLike<TReturn> {
  constructor(
    callback: (
      resolve: (thenableOrResult?: Resolvable<TReturn>) => void,
      reject: (error?: any) => void,
      onCancel?: (callback: () => void) => void
    ) => void
  );

  concurrency(limit: number): FP<TReturn>;
  delay(this: FP<TReturn>, msec: number): FP<TReturn>;

  map<TItem = TReturn, TOutput = never>(
    this: FP<TReturn>,
    fn: (
      item: Values<TReturn>,
      index?: number,
      array?: TReturn
    ) => TOutput // ThenArgRecursive<TReturn> | PromiseLike<TReturn> | Resolvable<TReturn>
  ): FP<TOutput[] | TReturn[]>; // | FP<ThenArgRecursive<TReturn[]>>;

  //function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
  //  return Array.prototype.concat(...array.map(callbackfn));
  //}
  flatMap<TItem = TReturn>(
    fn: IterateFunction<IterableItem<TItem>, Unpacked<TItem> | TReturn>
  ): FP<Unpacked<TReturn | Array<TReturn>>>;

  // reduce<T>(iterable: any, reducer: any, initVal: any): FP<TReturn>;
  reduce<TargetType, TItem = TReturn>(
    this: FP<TReturn>,
    reducer: (
      memo: TargetType,
      item: Values<TReturn>,
      index?: number,
      array?: TReturn
    ) => Resolvable<TargetType>,
    initialValue?: TargetType
  ): FP<TargetType>;

  filter<T>(callback: PredicateArrayCallback<T>): FP<TReturn>;
  find<T>(callback: PredicateArrayCallback<T>): FP<Unpacked<TReturn>>;
  findIndex<T>(callback: PredicateArrayCallback<T>): FP<TReturn>;
  get<T>(keyNames: keyof T | keyof T[]): FP<TReturn> | FP<string>;
  set<T>(keyName: string, value: any): FP<TReturn>;
  listen<T>(obj: EventSource, eventNames: string | string[]): FP<TReturn>;
  quiet<T>(limit?: number): FP<TReturn>;
  tap(this: FP<TReturn>, fn: CallbackHandler<TReturn, any>): FP<TReturn>;
  tapIf<T = TReturn>(
    cond: PredicateFunction<T>,
    ifTrue?: PredicateFunction<ThenArgRecursive<TReturn>>,
    ifFalse?: PredicateFunction<ThenArgRecursive<TReturn>>
  ): FP<TReturn | T>;
  then<TItem>(
    this: FP<TReturn>,
    onFulfilled: (value?: FPType<TReturn>) => ThenArgRecursive<TItem>,
    onRejected?: (error?: any) => Resolvable<TItem>
  ): FP<ThenArgRecursive<TItem>>; // For simpler signature help.
  then<TResult1 = TReturn, TResult2 = never>(
    this: FP<TReturn>,
    onFulfilled: ((value: FPType<TReturn>) => Resolvable<TResult1>) | null,
    onRejected?: ((reason: any) => Resolvable<TResult2>) | null
  ): FP<ThenArgRecursive<TResult1 | TResult2>>;

  // TODO: remove this and figure out why we dont match PromiseLike<T>
  then<TResult1 = TReturn, TResult2 = never>(onfulfilled?: ((value: TReturn) => TResult1 | FP<TResult1> | void) | undefined | null, onrejected?: ((reason: any) => TResult2 | FP<TResult2>) | undefined | null): FP<TResult1 | TResult2>;
  // then<TItem, TReturn>(
  //   this: FP<TReturn>,
  //   fn?: CallbackHandler<TItem, TReturn>
  // ): FP<TItem | TReturn>;
  thenIf<TItem = TReturn>(
    cond: PredicateFunction<TItem>,
    ifTrue?: PredicateFunction<ThenArgRecursive<TItem>>,
    ifFalse?: PredicateFunction<ThenArgRecursive<TItem>>
  ): FP<TReturn | TItem | void> | any;
  // catch<TItem = TReturn>(fn?: CallbackHandler<TItem, TReturn>): FP<TReturn | TItem>;
  catch<TItem = TReturn>(
    onReject: ((error: any) => Resolvable<TItem>) | undefined | null
  ): FP<TItem | TReturn>;
  catch<TItem = TReturn>(
    cond: PredicateFunction<TReturn> | object,
    ifTrue?: PredicateFunction<TItem>,
    ifFalse?: PredicateFunction<TItem>
  ): FP<TItem | TReturn>;
  catchIf<TItem = TReturn>(
    cond: PredicateFunction<ThenArgRecursive<TReturn>> | object,
    ifTrue?: PredicateFunction<TItem>,
    ifFalse?: PredicateFunction<TItem>
  ): FP<TItem | TReturn>;

  static chain<T>(): FP<T>;
  chainEnd<TItem>(): (
    input: Unpacked<TItem> | TItem
  ) => FP<TItem | TReturn>;

  static all<T1>(this: FP<[Resolvable<T1>]>): FP<[T1]>;
  static all<TArray>(this: FP<Iterable<Resolvable<TArray>>>): FP<TArray[]>;

  static all<T>(promises: Dictionary<T | Resolvable<T> | any>): FP<T>;
  static all<T>(promises: Array<T | any>): FP<T>;
  static delay<T>(msec: number): FP<T>;
  static get(keyNames: string | string[], object: Object): FP<Object | String>;
  static promisify<T>(cb: CallbackHandler<T>): Function;
  // static promisifyAll(obj: object | Array<Function>): object;
  static promisifyAll<T extends object>(target: T): T;

  static resolve<T>(value?: Resolvable<T>): FP<T>;
  static reject<T>(err: T): FP<T>;
  static unpack<T>(): {
    promise: FP<T>;
    resolve: (value: Resolvable<T>) => void;
    reject: NodeJsCallback<T>;
  };

  static FunctionalPromises: Readonly<FP<unknown>>;
  static FunctionalError: Readonly<FunctionalError>;
  static FunctionalUserError: Readonly<FunctionalUserError>;
  static FPCollectionError: Readonly<FPCollectionError>;
  static FPInputError: Readonly<FPInputError>;
  static FPUnexpectedError: Readonly<FPUnexpectedError>;
  static FPTimeout: Readonly<FPTimeout>;
}

interface Dictionary<T> {
  [key: string]: T;
}
// type IterableCollection<T> = T[] | IterableIterator<T> | Dictionary<T>
// type CatchFilter<E> = (new (...args: any[]) => E) | ((error: E) => boolean) | (object & E);
type IterableItem<R> = R extends Iterable<infer U> ? U : never;
type IterableOrNever<R> = Extract<R, Iterable<any>>;
type Resolvable<R> = R | FP<R>;
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
) => boolean | null | undefined | void | Resolvable<boolean>;
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
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
type CatchFilter<E> = ((error: E) => boolean) | (object & E);

type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type FPType<T> = T extends FP<infer U> ? U : T;

declare class FunctionalError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

declare class FunctionalUserError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

declare class FPCollectionError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

declare class FPUnexpectedError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

declare class FPInputError extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

declare class FPTimeout extends Error {
  constructor(message: string);
  constructor(message: string, options?: { [key: string]: any });
  constructor(options: { message: string; [key: string]: any });
  [key: string]: any;
}

export = FP;
