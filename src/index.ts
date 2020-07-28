import { FunctionalError } from "./modules/errors";
import utils from "./modules/utils";
import monads from "./monads";
import arrays from "./arrays";
import { listen } from "./events";
import conditional from "./conditional";
import { all, reject, delay, _delay } from "./promise";
import { isObject } from "util";

const { isFunction, flatten } = utils;
const { map, find, findIndex, filter, flatMap, reduce } = arrays(FP);
const { tapIf, thenIf, _thenIf } = conditional(FP);
const { chain, chainEnd } = monads(FP);

export type KeyedObject<TValue> = { [key: string]: TValue };
// export type CatchFilter<E> = (new (...args: any[]) => E) | ((error: E) => boolean) | (object & E);
export type IterableItem<R> = R extends Iterable<infer U> ? U : never;
// export type IterableOrNever<R> = Extract<R, Iterable<any>>;
export type Resolvable<R> = R | PromiseLike<R>;
export type IterateFunction<T, R> = (
  item: T,
  index: number,
  arrayLength: number
) => Resolvable<R>;

export type EventSource = {
  addEventListener?(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener?(
    type: string,
    listener: EventListener
  ): void;
  once?(
    name: string,
    listener: EventListener
  ): void;
  on?(
    name: string,
    listener: EventListener
  ): void;
  off?(
    name: string,
    listener: EventListener
  ): void;
};
export interface AddEventListenerOptions {
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
}
export interface EventListener {
  (evt: unknown): void;
}
export default FP;

declare class FP<T> {
  constructor(
    callback: (
      resolve: (thenableOrResult?: Resolvable<T>) => void,
      reject: (error?: any) => void
    ) => void
  );
  // new (executor: Executor): FP<T | T[]>;
  flatMap: (iterable: any, callback: any, ...args: any[]) => any;

  steps: RepeatableStep[];
  _FP: {
    errors: { limit: number; count: number };
    promise: Promise<T>;
    concurrencyLimit: number;
    destroyHandles?: Function[];
    destroy?: Function;
  };

  addStep(name: any, args: any): any;
  all<T, TInput>(promises: Array<TInput> | KeyedObject): FP<T[]>;
  catchIf<T>(condition: Error | object, fn: any): FP<T>;
  catch(fn: Function): FP<T>;
  concurrency<T>(limit: number): FP<T>;
  delay<T>(msec: number): FP<T>;
  // map<T>(fn: (item: IterableItem<R>, index?: number, arrayLength?: number) => Resolvable<T>, options: any): FP<T>;
  map<U>(fn: IterateFunction<IterableItem<T>, U>): FP<U>;

  // reduce<T>(iterable: any, reducer: any, initVal: any): FP<T>;
  reduce<U>(
    reducer: (
      memo: U,
      item: IterableItem<T>,
      index?: number,
      arrayLength?: number
    ) => Resolvable<U>,
    initialValue?: U
  ): FP<U>;

  filter<T>(callback: Function): FP<T>;
  find<T>(callback: Function): FP<T>;
  findIndex<T>(callback: Function): FP<T>;
  get<T>(keyNames: string | string[]): FP<T> | FP<string>;
  set<T>(keyName: string, value: any): FP<T>;
  listen<T>(obj: EventSource, eventNames: string | string[]): FP<T>;
  // listen<T>(obj: EventSource, eventNames: string | string[]): FP<T>;
  quiet<T>(limit: number): FP<T>;
  tap<T>(fn: Function): FP<T>;
  tapIf<T>(
    cond: (input: any) => Resolvable<boolean>,
    ifTrue: (input: any) => FP<T>,
    ifFalse: (input: any) => FP<T>
  ): FP<T>;
  then<T>(fn: Function): FP<T>;
  thenIf<T>(
    cond: (input: any) => Resolvable<boolean>,
    ifTrue: (input: any) => FP<T>,
    ifFalse: (input: any) => FP<T>
  ): FP<T>;
  private _thenIf<T>(
    cond: (input: any) => Resolvable<boolean>,
    ifTrue: (input: any) => FP<T>,
    ifFalse: (input: any) => FP<T>
  ): FP<T>;

  static chain<T>(): FP<T>;
  chainEnd<T>(): (input: any) => FP<T>;

  static all<T, TInput>(promises: Array<TInput> | KeyedObject<PromiseLike<T>>): FP<T[]>;
  static delay<T>(msec: number): FP<T>;
  static get(object: Object, ...keyNames: string[]): Object | String;
  static promisify<T>(cb: Function): (...args: any[]) => FP<T>;
  static promisifyAll(obj: object | Array<Function>): object;
  static resolve<T>(value: Resolvable<T>): FP<T>;
  static reject<T>(err: typeof Error): FP<T>;
  static unpack<T>(): {
    promise: PromiseLike<T>;
    resolve: (value: Resolvable<T>) => void;
    reject: Function;
  };
}

FP.prototype.all = all;
FP.prototype.map = map;
FP.prototype.find = find;
FP.prototype.findIndex = findIndex;
FP.prototype.filter = filter;
FP.prototype.flatMap = flatMap;
FP.prototype.reduce = reduce;
FP.prototype.listen = listen;
FP.prototype.tapIf = tapIf;
FP.prototype.thenIf = thenIf;
FP.prototype._thenIf = _thenIf;
FP.prototype.delay = delay;
FP.prototype._delay = _delay;
FP.prototype.reject = reject;

// export const all = allPromises

FP.all = FP.prototype.all;
FP.thenIf = FP.prototype._thenIf;
FP.delay = (msec: number) => FP.resolve().delay(msec);
FP.silent = (limit: number) => FP.resolve().silent(limit);

// Monadic Methods
FP.chain = chain;
FP.prototype.chainEnd = chainEnd;
FP.reject = FP.prototype.reject;
FP.resolve = resolve;

FP.promisify = promisify;
FP.promisifyAll = promisifyAll;
FP.unpack = unpack;

FP.prototype.addStep = function addStep<T = any>(
  this: FP<T>,
  name: string,
  args: Iterable<any>
) {
  if (this.steps) this.steps.push([name, this, args]);
  return this;
};

FP.prototype.concurrency = function concurrency<T = any>(
  this: FP<T>,
  limit = Infinity
) {
  if (this.steps) return this.addStep("concurrency", [...arguments]);
  this._FP.concurrencyLimit = limit;
  return this;
};

FP.prototype.quiet = function quiet<T = any>(
  this: FP<T>,
  errorLimit = Infinity
) {
  if (this.steps) return this.addStep("quiet", [...arguments]);
  this._FP.errors = { count: 0, limit: errorLimit };
  return this;
};
FP.prototype.silent = FP.prototype.quiet;

/**
 * Helper to accumulate string keys *until an object is provided*.
 * Returns a partial function to accept more keys until partial
 */
FP.get = function getter(...getArgs: Array<string | any>) {
  getArgs = flatten(getArgs);
  const keyNames = getArgs.filter((s) => typeof s === "string") as string[];
  const objectFound = getArgs.find(isObject) as KeyedObject;

  // Return partial app / auto-curry deal here
  if (!objectFound) {
    // return function to keep going
    return (...extraArgs: string[]) => FP.get(...extraArgs, ...getArgs);
  }

  if (keyNames.length === 1) return objectFound[keyNames[0]];
  return keyNames.reduce((extracted: KeyedObject, key: string) => {
    extracted[key] = objectFound[key];
    return extracted;
  }, {});
};

FP.prototype.get = function get<T = any>(this: FP<T>, ...keyNames: string[]) {
  if (this.steps) return this.addStep("get", [...arguments]);
  return this.then ? this.then(FP.get(keyNames)) : FP.get(...keyNames);
};

FP.prototype.set = function set<T = any>(
  this: FP<T>,
  keyName: string,
  value: any
) {
  if (this.steps) return this.addStep("set", [...arguments]);
  return this.then((obj: { [name: string]: any }) => {
    if (typeof obj === "object") obj[keyName] = value;
    return obj;
  });
};

FP.prototype.catch = function (fn) {
  if (this.steps) return this.addStep("catch", [...arguments]);
  if (arguments.length === 2) return this.catchIf(...arguments);
  if (!isFunction(fn))
    throw new FunctionalError(
      "Invalid fn argument for `.catch(fn)`. Must be a function. Currently: " +
        typeof fn
    );
  return FP.resolve(this._FP.promise.catch((err) => fn(err)));
};

FP.prototype.catchIf = function catchIf<T = any>(this: FP<T>, condition, fn) {
  if (this.steps) return this.addStep("catchIf", [...arguments]);
  if (!isFunction(fn))
    throw new FunctionalError(
      "Invalid fn argument for `.catchIf(condition, fn)`. Must be a function. Currently: " +
        typeof fn
    );

  return FP.resolve(
    this._FP.promise.catch((err) => {
      if (condition && err instanceof condition) return fn(err); // try re-throw, might be really slow...
      throw err;
    })
  );
};

FP.prototype.then = function then<T = any>(this: FP<T>, fn) {
  if (this.steps) return this.addStep("then", [...arguments]);
  if (!isFunction(fn))
    throw new FunctionalError(
      "Invalid fn argument for `.then(fn)`. Must be a function. Currently: " +
        typeof fn
    );
  return FP.resolve(this._FP.promise.then(fn));
};

FP.prototype.tap = function tap<T = any>(this: FP<T>, fn) {
  if (this.steps) return this.addStep("tap", [...arguments]);
  if (!isFunction(fn))
    throw new FunctionalError(
      "Invalid fn argument for `.tap(fn)`. Must be a function. Currently: " +
        typeof fn
    );
  return FP.resolve(
    this._FP.promise.then((value) => (fn(value) ? value : value))
  );
};

function resolve<T>(value: T | PromiseLike<T>): FP<T> {
  return new FP((resolve, reject) => {
    if (value && value?.then && isFunction(value?.then))
      return value.then(resolve).catch(reject);
    resolve(value);
  });
}

function promisify<T>(
  this: any,
  cb: { call: (arg0: any, arg1: (err: any, res: T) => any) => any }
): FP<T> {
  return (...args) =>
    new FP<T>((yah, nah) =>
      cb.call(this, ...args, (err, res) => (err ? nah(err) : yah(res)))
    );
}

export type KeyedPromises = { [x: string]: any };

function promisifyAll(obj: KeyedPromises) {
  if (!obj || !Object.getPrototypeOf(obj)) {
    throw new Error("Invalid Argument obj in promisifyAll(obj)");
  }
  return Object.getOwnPropertyNames(obj)
    .filter((key) => typeof obj[key] === "function")
    .reduce((obj, fnName) => {
      if (!/Sync/.test(fnName) && !obj[`${fnName}Async`])
        obj[`${fnName}Async`] = FP.promisify(obj[`${fnName}`]);
      return obj;
    }, obj);
}

function unpack<T>() {
  let resolve,
    reject,
    promise = new FP((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  return { promise, resolve, reject };
}

export type Executor<TResolve = any, TReject = unknown> = (
  resolve: (value?: TResolve | PromiseLike<TResolve>) => void,
  reject: (reason?: TReject) => void
) => void;
// type RepeatableStep = [string, unknown]
export type RepeatableStep =
  | [string, unknown]
  | [string, unknown, unknown]
  | [string, unknown, unknown, unknown]
  | [string, unknown, unknown, unknown, unknown];
// type Step = [string, unknown, unknown][]

// export interface FP<T = any> {
//   steps: RepeatableStep[];
//   _FP: { errors: { limit: number; count: number }; promise: Promise<T>; concurrencyLimit: number }
//   new(executor: Executor): FP<T>;
// }

function FP<T = any>(this: FP<T>, executor: Executor<T>) {
  if (!(this instanceof FP)) {
    return new FP(executor);
  }
  if (arguments.length !== 1)
    throw new Error(
      "FunctionalPromises constructor only accepts 1 callback argument"
    );
  this._FP = {
    errors: { limit: 0, count: 0 },
    promise: new Promise(executor),
    concurrencyLimit: 4,
  };
}

export const FunctionalPromise = FP;

// if (process && process.on) {
//   // process.on('uncaughtException', e => console.error('FPromises: FATAL EXCEPTION: uncaughtException', e))
//   process.on('unhandledRejection', e => console.error('FPromises: FATAL ERROR: unhandledRejection', e))
// }
