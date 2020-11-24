import { Action } from "../../type";
import { PreCancel } from "./pre-cancel";
import { EmitForm, Emitter } from "./type";

export interface ReduceHandler<T, K> {
  (resolve: Action<K>, reject: Action<any>): EmitForm<T, any>;
}

export function reduce<T, K = T>(handler: ReduceHandler<T, K>) {
  return (emitter: Emitter<T>): Promise<K> =>
    new Promise((resolve, reject) => {
      const pre_cancel = new PreCancel(() => cancel);

      const resolve_handle = function (x: K) {
        pre_cancel.tryCancel();
        resolve(x);
      };

      const reject_handle = function (x: any) {
        pre_cancel.tryCancel();
        reject(x);
      };

      const receiver = handler(resolve_handle, reject_handle);
      const cancel = emitter(receiver);

      pre_cancel.fulfil();
    });
}
