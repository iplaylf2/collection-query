import { Action } from "../../../type";
import { EmitForm, Emitter } from "./type";

export interface ReduceHandler<T, K> {
  (resolve: Action<K>, reject: Action<any>): EmitForm<T, any>;
}

export function reduce<T, K = T>(handler: ReduceHandler<T, K>) {
  return (emitter: Emitter<T>): Promise<K> =>
    new Promise((resolve, reject) => {
      const resolveHandle = function (x: K) {
        cancel();
        resolve(x);
      };

      const rejectHandle = function (x: any) {
        cancel();
        reject(x);
      };

      const receiver = handler(resolveHandle, rejectHandle);

      const cancel = emitter(receiver);
    });
}
