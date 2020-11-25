import { Action } from "../../../type";
import { Cancel } from "../type";
import { Emitter, ReceiveForm } from "./type";

export interface ReduceHandler<T, K> {
  (resolve: Action<K>, reject: Action<any>): ReceiveForm<T, any>;
}

export function reduce<T, K = T>(handler: ReduceHandler<T, K>) {
  return (emitter: Emitter<T>): Promise<K> =>
    new Promise((resolve, reject) => {
      let cancel!: Cancel;

      const resolve_handle = function (x: K) {
        cancel();
        resolve(x);
      };

      const reject_handle = function (x: any) {
        cancel();
        reject(x);
      };

      const receiver = handler(resolve_handle, reject_handle);

      emitter(receiver, (c) => {
        cancel = c;
      });
    });
}
