interface Dictionary<T> {
    [key: string]: T;
  }
  // type IterableCollection<T> = T[] | IterableIterator<T> | Dictionary<T>
  
  // type CatchFilter<E> = (new (...args: any[]) => E) | ((error: E) => boolean) | (object & E);
  type IterableItem<R> = R extends Iterable<infer U> ? U : never;
  type IterableOrNever<R> = Extract<R, Iterable<any>>;
  type Resolvable<R> = R | FP;
  type IterateFunction<T, ReturnType = T> = (
    item: T,
    index: number,
    arrayLength: number
  ) => Resolvable<ReturnType>;
  type PromiseCallback<T, R> = (input: T) => R | PromiseLike<R> | undefined | null | void; 
  type PredicateFunction<T> = (input: T) => boolean | Resolvable<boolean>;
  type CallbackHandler<T> = (input: T) => Resolvable<any> | null | undefined | void;
  type NodeJsCallback<T> = (error: Error | null | undefined, input?: T) => Resolvable<any> | null | undefined;
  
  declare class FP<ReturnType = unknown> {
    constructor(
      callback: (
        resolve: (thenableOrResult?: Resolvable<ReturnType>) => void,
        reject: (error?: any) => void,
        onCancel?: (callback: () => void) => void
      ) => void
    );
  
    // addStep(name: any, args: any): any;
    // all(promises: any): any;
    catchIf<T>(
      condition: PredicateFunction<T> | object,
      fn: NodeJsCallback<T>
    ): FP<ReturnType>;
    catch<T>(fn: NodeJsCallback<T>): FP<ReturnType>;
  
    concurrency<T>(limit: number): FP<ReturnType>;
    delay<T>(msec: number): FP<ReturnType>;
    // map<T>(fn: (item: IterableItem<R>, index?: number, arrayLength?: number) => Resolvable<T>, options: any): FP<ReturnType>;
    map<ItemType>(fn: IterateFunction<ItemType>): FP<ReturnType>;
    flatMap<ItemType>(fn: IterateFunction<IterableItem<ItemType>, ReturnType>): FP<ReturnType>;
  
    // reduce<T>(iterable: any, reducer: any, initVal: any): FP<ReturnType>;
    reduce<ItemType, TargetType>(
      reducer: (
        memo: TargetType,
        item: IterableItem<ItemType>,
        index?: number,
        arrayLength?: number
      ) => Resolvable<TargetType>,
      initialValue?: TargetType
    ): FP<TargetType>;
  
    filter<T>(callback: PredicateFunction<T>): FP<ReturnType>;
    find<T>(callback: PredicateFunction<T>): FP<ReturnType>;
    findIndex<T>(callback: PredicateFunction<T>): FP<ReturnType>;
    get<T>(keyNames: string | string[]): FP<ReturnType> | FP<string>;
    set<T>(keyName: string, value: any): FP<ReturnType>;
    listen<T>(obj: EventSource, eventNames: string | string[]): FP<ReturnType>;
    quiet<T>(limit: number): FP<ReturnType>;
    tap<T>(fn: CallbackHandler<T>): FP<ReturnType>;
    tapIf<T>(
      cond: PredicateFunction<T>,
      ifTrue: (input: any) => FP,
      ifFalse: (input: any) => FP
    ): FP<ReturnType>;
    then<T>(fn: CallbackHandler<T>): FP<ReturnType>;
    thenIf<T>(
      cond: PredicateFunction<T>,
      ifTrue: (input: any) => FP,
      ifFalse: (input: any) => FP
    ): FP<ReturnType>;
  
    static chain<T>(): FP<T>;
    chainEnd(): () => FP<ReturnType>;
  
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
      reject: Function;
    };
  }
  