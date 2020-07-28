import { FPInputError } from "./modules/errors";
import FP from "./index";

export interface IEventBus {
  on?: (name: string, callback: Function) => void;
  off?: (name: string, callback: Function) => void;
  once?: (name: string, callback: Function) => void;
}
export interface IListenable {
  addEventListener?: (name: string, callback: Function) => void;
  removeEventListener?: (name: string, callback: Function) => void;
}
export const listen = function listen<T>(
  this: FP<T>,
  obj: IListenable & IEventBus,
  ...eventNames: string[]
) {
  const addKey =
    typeof obj.addEventListener !== "undefined" ? "addEventListener" : "on";
  const removeKey = addKey === "on" ? "off" : "removeEventListener";
  if (!obj[addKey]) throw new FPInputError("Valid EventEmitter required.");
  // Gets callback to attach to the event handlers
  const handler = this.chainEnd();
  this._FP.destroy = () =>
    this._FP.destroyHandles &&
    this._FP.destroyHandles
      .map((fn: Function) => fn() || true)
      .filter((v: unknown) => Boolean(v)).length;
  this._FP.destroyHandles = eventNames.map((eventName) => {
    (obj[addKey] && obj[addKey])!(eventName, handler);
    return () => (obj[removeKey] && obj[removeKey])!(eventName, handler);
  });
  return this;
};
