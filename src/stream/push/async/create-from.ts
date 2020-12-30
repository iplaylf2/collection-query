import { create } from "./create";
import { EmitType } from "../type";

export function createFrom<T>(i: Iterable<T>) {
  return create<T>(async function (emit) {
    const iterator = i[Symbol.iterator]();
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
  });
}
