import { create } from "./create";
import { EmitType } from "./type";

export function createFrom<T>(i: Iterable<T>) {
  return create<T>(function (emit) {
    try {
      for (const x of i) {
        emit(EmitType.Next, x);
      }
      emit(EmitType.Complete);
    } catch (e) {
      emit(EmitType.Error, e);
    }
  });
}
