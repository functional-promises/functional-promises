// export as namespace FP;

interface Dictionary<T> {
  [key: string]: T;
}
// type IterableCollection<T> = T[] | IterableIterator<T> | Dictionary<T>

// type CatchFilter<E> = (new (...args: any[]) => E) | ((error: E) => boolean) | (object & E);
type IterableItem<R> = R extends Iterable<infer U> ? U : never;
type IterableOrNever<R> = Extract<R, Iterable<any>>;
type Resolvable<R> = R | FP<R>;
type IterateFunction<T, R> = (
  item: T,
  index: number,
  arrayLength: number
) => Resolvable<R>;
type PromiseCallback<T, R> = (input: T) => R | PromiseLike<R> | undefined | null | void; 
type PredicateFunction<T> = (input: T) => boolean | Resolvable<boolean>;
type CallbackHandler<T> = (input: T) => Resolvable<any> | null | undefined;
type NodeJsCallback<T> = (error: Error | null | undefined, input: T) => Resolvable<any> | null | undefined;

declare class FP<R> implements PromiseLike<R> {
  constructor(
    callback: (
      resolve: (thenableOrResult?: Resolvable<R>) => void,
      reject: (error?: any) => void,
      onCancel?: (callback: () => void) => void
    ) => void
  );

  // addStep(name: any, args: any): any;
  // all(promises: any): any;
  catchIf<T>(
    condition: PredicateFunction<T> | object,
    fn: NodeJsCallback<T>
  ): FP<R>;
  catch<T>(fn: NodeJsCallback<T>): FP<R>;

  concurrency<T>(limit: number): FP<T>;
  delay<T>(msec: number): FP<T>;
  // map<T>(fn: (item: IterableItem<R>, index?: number, arrayLength?: number) => Resolvable<T>, options: any): FP<T>;
  map<U>(fn: IterateFunction<IterableItem<R>, U>): FP<R[]>;
  flatMap<U>(fn: IterateFunction<IterableItem<R>, U>): FP<R[]>;

  // reduce<T>(iterable: any, reducer: any, initVal: any): FP<T>;
  reduce<U>(
    reducer: (
      memo: U,
      item: IterableItem<R>,
      index?: number,
      arrayLength?: number
    ) => Resolvable<U>,
    initialValue?: U
  ): FP<R>;

  filter<T>(callback: PredicateFunction<T>): FP<T>;
  find<T>(callback: PredicateFunction<T>): FP<T>;
  findIndex<T>(callback: PredicateFunction<T>): FP<T>;
  get<T>(keyNames: string | string[]): FP<T> | FP<string>;
  set<T>(keyName: string, value: any): FP<T>;
  listen<T>(obj: EventSource, eventNames: string | string[]): FP<T>;
  quiet<T>(limit: number): FP<T>;
  tap<T>(fn: PromiseCallback<T, R>): FP<T>;
  tapIf<T>(
    cond: PredicateFunction<T>,
    ifTrue: (input: any) => FP<T>,
    ifFalse: (input: any) => FP<T>
  ): FP<T>;
  then<T>(fn: CallbackHandler<T>): FP<T>;
  thenIf<T>(
    cond: PredicateFunction<T>,
    ifTrue: (input: any) => FP<T>,
    ifFalse: (input: any) => FP<T>
  ): FP<T>;

  static chain<T>(): FP<T>;
  chainEnd<T>(): () => FP<T>;

  static all<T>(promises: Array<any> | object): FP<T>;
  static delay<T>(msec: number): FP<T>;
  static get(keyNames: string | string[], object: Object): Object | String;
  static promisify<T>(cb: CallbackHandler<T>): Function;
  static promisifyAll(obj: object | Array<Function>): object;
  static resolve<T>(value: Resolvable<T>): FP<T>;
  static reject<T>(err: typeof Error): FP<T>;
  static unpack<T>(): {
    promise: FP<T>;
    resolve: (value: Resolvable<T>) => void;
    reject: Function;
  };
}

// declare namespace FP {
//     constructor(resolveRejectCB: Function, unknownArgs: any);

// addStep(name: any, args: any): any;

// all(promises: any): any;

// cast(obj: any): any;

// catch(fn: any): any;

// catchIf(condition: any, fn: any, ...args: any[]): any;

// chainEnd(): any;

// concurrency(limit: any, ...args: any[]): any;

// delay(msec: any, ...args: any[]): any;

// filter(iterable: any, callback: any, ...args: any[]): any;

// find(callback: any): any;

// findIndex(callback: any): any;

// get(keyNames: any, ...args: any[]): any;

// listen(obj: any, eventNames: any): any;

// map(args: any, fn: any, options: any, ...args: any[]): any;

// quiet(limit: any, ...args: any[]): any;

// reduce(iterable: any, reducer: any, initVal: any, ...args: any[]): any;

// reject(err: any): any;

// resolve(value: any): any;

// set(keyName: any, value: any, ...args: any[]): any;

// tap(fn: any, ...args: any[]): any;

// tapIf(cond: any, ifTrue: any, ifFalse: any, ...args: any[]): any;

// then(fn: any, ...args: any[]): any;

// thenIf(cond: any, ifTrue: any, ifFalse: any, ...args: any[]): any;

// }

// declare namespace FP {
//     namespace all {
//         const prototype: {
//         };

//     }

//     namespace chain {
//         const prototype: {
//         };

//     }

//     namespace promisify {
//         const prototype: {
//         };

//     }

//     namespace promisifyAll {
//         const prototype: {
//         };

//     }

//     namespace prototype {
//         namespace addStep {
//             const prototype: {
//             };

//         }

//         namespace all {
//             const prototype: {
//             };

//         }

//         namespace cast {
//             const prototype: {
//             };

//         }

//         namespace catchIf {
//             const prototype: {
//             };

//         }

//         namespace chainEnd {
//             const prototype: {
//             };

//         }

//         namespace concurrency {
//             const prototype: {
//             };

//         }

//         namespace delay {
//             const prototype: {
//             };

//         }

//         namespace filter {
//             const prototype: {
//             };

//         }

//         namespace find {
//             const prototype: {
//             };

//         }

//         namespace findIndex {
//             const prototype: {
//             };

//         }

//         namespace get {
//             const prototype: {
//             };

//         }

//         namespace listen {
//             const prototype: {
//             };

//         }

//         namespace map {
//             const prototype: {
//             };

//         }

//         namespace quiet {
//             const prototype: {
//             };

//         }

//         namespace reduce {
//             const prototype: {
//             };

//         }

//         namespace reject {
//             const prototype: {
//             };

//         }

//         namespace resolve {
//             const prototype: {
//             };

//         }

//         namespace set {
//             const prototype: {
//             };

//         }

//         namespace tap {
//             const prototype: {
//             };

//         }

//         namespace tapIf {
//             const prototype: {
//             };

//         }

//         namespace then {
//             const prototype: {
//             };

//         }

//         namespace thenIf {
//             const prototype: {
//             };

//         }

//     }

//     namespace resolve {
//         const prototype: {
//         };

//     }

//     namespace thenIf {
//         const prototype: {
//         };

//     }

//     namespace unpack {
//         const prototype: {
//         };
//     }
// }

export = FP;
