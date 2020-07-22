import { Emitter, EmitType, EmitForm } from "./type";
import { relay } from "./relay";
import { Action } from "../../type";

interface RelayNextHandler<T, Te, K> {
  (emit: EmitForm<K, Te>): Action<T>;
}

export function relayNext<T, Te, K>(
  source: Emitter<T, Te>,
  handler: RelayNextHandler<T, Te, K>
): Emitter<K, Te> {
  return relay((emit) => {
    const handleNext = handler(emit);
    return source((t, x?) => {
      switch (t) {
        case EmitType.Next:
          handleNext(x as T);
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
