export interface IEventBus {
    on: (name: string, callback: Function) => void;
    off: (name: string, callback: Function) => void;
    once: (name: string, callback: Function) => void;
}
export interface IListenable {
    addEventListener: (name: string, callback: Function) => void;
    removeEventListener: (name: string, callback: Function) => void;
}
export declare const listen: <T>(this: any, obj: IListenable & IEventBus, ...eventNames: string[]) => any;
