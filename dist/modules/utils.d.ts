declare const utils: {
    isPromiseLike(p: PromiseLike<any>): boolean;
    isFunction(fn: Function): boolean;
    isEnumerable(list: any): boolean;
    isObject(o: any): boolean;
    flatten<Iterable_1>(arr: Iterable_1): Iterable_1;
};
export default utils;
