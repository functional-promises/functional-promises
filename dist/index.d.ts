type Values<T> = T extends unknown[] ? T[number] : T[keyof T];
type IterableItem<R> = R extends Iterable<infer U> ? U : never;
type Resolvable<R> = R | PromiseLike<R> | FPInstance<R>;
type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T;
type PredicateFunction<T> = (input: T) => boolean | null | undefined | void | Resolvable<boolean>;
type PredicateArrayCallback<T> = ((item: T, index?: number, array?: T[]) => boolean | Resolvable<boolean>) | null | undefined;
type CallbackHandler<ValueType, TReturn = any> = (input: ValueType) => Resolvable<TReturn> | null | undefined | void;
interface FPInstance<TReturn> extends PromiseLike<TReturn> {
    concurrency(limit: number): FPInstance<TReturn>;
    quiet(limit?: number): FPInstance<TReturn>;
    silent(limit?: number): FPInstance<TReturn>;
    delay(msec: number): FPInstance<TReturn>;
    map<TOutput = never>(fn: (item: Values<TReturn>, index?: number, array?: TReturn) => TOutput): FPInstance<TOutput[] | TReturn[]>;
    flatMap<TItem = TReturn>(fn: (item: IterableItem<TItem>, index?: number, array?: TItem[]) => unknown): FPInstance<unknown>;
    reduce<TTarget>(reducer: (memo: TTarget, item: Values<TReturn>, index?: number, array?: TReturn) => Resolvable<TTarget>, initialValue?: TTarget): FPInstance<TTarget>;
    filter<T>(callback: PredicateArrayCallback<T>): FPInstance<TReturn>;
    find<T>(callback: PredicateArrayCallback<T>): FPInstance<unknown>;
    findIndex<T>(callback: PredicateArrayCallback<T>): FPInstance<number>;
    get(...keyNames: string[]): FPInstance<any>;
    set(keyName: string, value: any): FPInstance<TReturn>;
    listen(obj: any, ...eventNames: string[]): FPInstance<TReturn>;
    tap(fn: CallbackHandler<TReturn, any>): FPInstance<TReturn>;
    tapIf<T = TReturn>(cond: PredicateFunction<T>, ifTrue?: PredicateFunction<ThenArgRecursive<TReturn>>, ifFalse?: PredicateFunction<ThenArgRecursive<TReturn>>): FPInstance<TReturn | T>;
    thenIf<TItem = TReturn>(cond: PredicateFunction<TItem>, ifTrue?: PredicateFunction<ThenArgRecursive<TItem>>, ifFalse?: PredicateFunction<ThenArgRecursive<TItem>>): FPInstance<TReturn | TItem | void>;
    catch<TItem = TReturn>(onReject: ((error: any) => Resolvable<TItem>) | undefined | null): FPInstance<TItem | TReturn>;
    catch<TItem = TReturn>(cond: PredicateFunction<TReturn> | object, ifTrue?: PredicateFunction<TItem>, ifFalse?: PredicateFunction<TItem>): FPInstance<TItem | TReturn>;
    catchIf<TItem = TReturn>(cond: PredicateFunction<ThenArgRecursive<TReturn>> | object, ifTrue?: PredicateFunction<TItem>): FPInstance<TItem | TReturn>;
    chainEnd<TItem>(): (input: TItem) => FPInstance<TItem | TReturn>;
}
interface UnpackedPromise<T> {
    promise: FPInstance<T>;
    resolve: (value: Resolvable<T>) => void;
    reject: (error: Error | null | undefined | T, input?: T) => Resolvable<any> | null | undefined;
}
interface FPStatic {
    <TReturn>(callback: (resolve: (thenableOrResult?: Resolvable<TReturn>) => void, reject: (error?: any) => void) => void): FPInstance<TReturn>;
    new <TReturn>(callback: (resolve: (thenableOrResult?: Resolvable<TReturn>) => void, reject: (error?: any) => void) => void): FPInstance<TReturn>;
    all<T>(promises: Record<string, T | Resolvable<T> | any>): FPInstance<T>;
    all<T>(promises: Array<T | any>): FPInstance<T>;
    delay<T>(msec: number): FPInstance<T>;
    get(...args: any[]): any;
    promisify<T>(cb: CallbackHandler<T>): (...args: any[]) => FPInstance<T>;
    promisifyAll<T extends object>(target: T): T;
    resolve<T>(value?: Resolvable<T>): FPInstance<T>;
    reject<T>(err: T): FPInstance<T>;
    unpack<T>(): UnpackedPromise<T>;
    chain<T>(): FPInstance<T>;
    thenIf: (...args: any[]) => any;
    silent: (limit: number) => FPInstance<any>;
}

declare const _default: FPStatic;

export { _default as default };
