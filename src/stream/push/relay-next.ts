import { Emitter, EmitType, EmitForm } from "./type";
import { relay } from "./relay";
import { Action } from "../../type";

export interface RelayNextHandler<T, Te, K> {
  (emit: EmitForm<K, Te>): Action<T>;
}

export function relayNext<T, Te, K = T>(handler: RelayNextHandler<T, Te, K>) {
  return (emitter: Emitter<T, Te>): Emitter<K, Te> =>
    relay((emit) => {
      const handle_next = handler(emit);
      return emitter((t, x?) => {
        switch (t) {
          case EmitType.Next:
            handle_next(x as T);
            break;
          case EmitType.Complete:
            emit(t);
            break;
          case EmitType.Error:
            emit(t, x as Te);
            break;
        }
      });
    });
}
