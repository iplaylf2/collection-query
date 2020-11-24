import { Action } from "../../type";
import { PreCancel } from "./pre-cancel";
import { Cancel, EmitForm, Emitter } from "./type";

export interface ReduceHandler<T, K> {
  (resolve: Action<K>, reject: Action<any>): EmitForm<T, any>;
}

export function reduce<T, K = T>(handler: ReduceHandler<T, K>) {
  return (emitter: Emitter<T>): Promise<K> =>
    new Promise((resolve, reject) => {
      let cancel!: Cancel;
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

      emitter(receiver, (c) => {
        cancel = c;
        pre_cancel.fulfil();
      });
    });
}
