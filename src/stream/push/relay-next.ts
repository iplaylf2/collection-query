import { Emitter, EmitType, EmitForm } from "./type";
import { relay } from "./relay";
import { Action } from "../../type";

export interface RelayNextHandler<T, K> {
  (emit: EmitForm<K>): Action<T>;
}

export function relayNext<T, K = T>(handler: RelayNextHandler<T, K>) {
  return (emitter: Emitter<T>): Emitter<K> =>
    relay((emit, expose) => {
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
            emit(t, x);
            break;
        }
      }, expose);
    });
}
