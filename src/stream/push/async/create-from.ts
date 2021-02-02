import { create } from "./create";
import { EmitType } from "../type";

export function createFrom<T>(i: Iterable<T>) {
  return create<T>(function (emit) {
    const iterator = i[Symbol.iterator]();
    (async () => {
      while (true) {
        let item: IteratorResult<T, any>;
        try {
          item = iterator.next();
        } catch (e) {
          emit(EmitType.Error, e);
          return;
        }

        if (item.done) {
          emit(EmitType.Complete);
          return;
        } else {
          await emit(EmitType.Next, item.value);
        }
      }
    })();

    return () => iterator.return?.();
  });
}
