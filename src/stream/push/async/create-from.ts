import { create } from "./create";
import { EmitType } from "../type";

export function createFrom<T>(i: Iterable<T>) {
  return create<T>(async function (emit) {
    try {
      for (const x of i) {
        await emit(EmitType.Next, x);
      }
      emit(EmitType.Complete);
    } catch (e) {
      emit(EmitType.Error, e);
    }
  });
}
