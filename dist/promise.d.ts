export { _reject as reject };
export declare function all(promises: readonly any[]): any;
export declare function promiseAllObject(obj: any): Promise<any>;
export declare function _reject(this: any, err: any): Promise<never>;
export declare function _delay(msec: number): (value: any) => any;
export declare function delay(msec: number): any;
