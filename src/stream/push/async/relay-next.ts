import { Emitter, EmitForm } from "./type";
import { relay } from "./relay";
import { EmitType } from "../type";

export interface RelayNextHandler<T, K> {
  (emit: EmitForm<K, any>): (x: T) => Promise<void>;
}

export function relayNext<T, K = T>(handler: RelayNextHandler<T, K>) {
  return (emitter: Emitter<T, any>): Emitter<K, any> =>
    relay((emit) => {
      const handle_next = handler(emit);
      return emitter(async (t, x?) => {
        switch (t) {
          case EmitType.Next:
            await handle_next(x as T);
            break;
          case EmitType.Complete:
            emit(t);
            break;
          case EmitType.Error:
            emit(t, x);
            break;
        }
      });
    });
}
